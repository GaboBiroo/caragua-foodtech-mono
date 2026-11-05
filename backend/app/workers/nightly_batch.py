"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A1.2: NIGHTLY BATCH ORCHESTRATOR
==============================================================================
Implementa `NightlyBatchOrchestrator`:
1. `run_full_municipality_harvest(max_neighborhoods=15, auto_approve_trusted=True)`:
   - Orquestra varredura em lote sobre a fila priorizada dos 53 bairros no Redis
     (`ScraperRedisCoordinator`) com controle de concorrência `asyncio.Semaphore(4)`.
   - Aciona `SeedDiscoveryEngine` + `AutonomousScrapingEngine.harvest_zone` e
     persiste atomicamente via `commit_to_staging_db`.
   - Aplica *Trusted Confidence Threshold* (Auto-Promoção Segura): pratos com
     10.0 <= price <= 350.0, len(description) >= 20, zero anomalias LGPD e
     restaurante georreferenciado validado H(R,C) são promovidos em cota de vitrine
     (`is_available = True, requires_moderation = False`), preservando uma cota
     mínima em quarentena (`is_available = False, requires_moderation = True`) para
     revisão operacional ao vivo em `/moderation`.
   - Sincroniza os embeddings vetoriais `vector(1536)` via `VectorIndexingService`
     e recalcula o Score Bayesiano Ponderado ($W_R$) e decaimento temporal (30d).
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.dish import Dish
from app.db.models.restaurant import Restaurant
from app.db.models.review import Review
from app.db.session import AsyncSessionLocal
from app.services.vector_indexer import VectorIndexingService, vector_indexing_service
from app.workers.fraud_detector import ReviewFraudDetector
from app.workers.sanitizer_lgpd import LGPDSanitizer
from app.workers.scraper_engine import (
    CARAGUA_53_NEIGHBORHOODS,
    AutonomousScrapingEngine,
    is_within_caragua_bbox,
    resolve_caragua_neighborhood,
    scraper_engine,
)
from app.workers.scraper_adapters import CanonicalRestaurant
from app.workers.scraper_redis import ScraperRedisCoordinator, scraper_redis_coordinator
from app.workers.seed_discovery import SeedDiscoveryEngine, seed_discovery_engine

logger = logging.getLogger("nightly_batch")
logger.setLevel(logging.INFO)


class NightlyBatchOrchestrator:
    """
    Orquestrador de Coleta Municipal em Lote, Promoção por Limiar de Confiança,
    Indexação Incremental 1536d e Consolidação Bayesiana ($W_R$).
    """

    def __init__(
        self,
        concurrency_limit: int = 4,
        engine: Optional[AutonomousScrapingEngine] = None,
        redis_coordinator: Optional[ScraperRedisCoordinator] = None,
        discovery_engine: Optional[SeedDiscoveryEngine] = None,
        indexer: Optional[VectorIndexingService] = None,
    ) -> None:
        self.concurrency_limit = max(1, concurrency_limit)
        self.engine = engine or scraper_engine
        self.redis_coordinator = redis_coordinator or scraper_redis_coordinator
        self.discovery_engine = discovery_engine or seed_discovery_engine
        self.indexer = indexer or vector_indexing_service
        self.fraud_detector = ReviewFraudDetector()

    @staticmethod
    def _is_trusted_dish(dish: Dish, restaurant: Restaurant) -> bool:
        """
        Verifica o *Trusted Confidence Threshold*:
        - Preço auditado: 10.0 <= price <= 350.0
        - Descrição rica: len(description) >= 20 caracteres
        - Zero anomalias residuais de PII/LGPD na descrição ou nome
        - Restaurante ativo e contido estritamente na Bounding Box de Caraguatatuba
        """
        price = float(dish.price or 0.0)
        desc = (dish.description or "").strip()
        if not (10.0 <= price <= 350.0):
            return False
        if len(desc) < 20:
            return False
        if LGPDSanitizer.contains_residual_pii(f"{dish.name} {desc}"):
            return False
        if not restaurant.is_active:
            return False
        if not is_within_caragua_bbox(float(restaurant.latitude), float(restaurant.longitude)):
            return False
        return True

    async def apply_trusted_auto_promotion(
        self,
        session: AsyncSession,
        min_quarantine_reserve: int = 12,
    ) -> Dict[str, int]:
        """
        Promove pratos confiáveis para a vitrine (`is_available = True, requires_moderation = False`)
        enquanto retém pelo menos `min_quarantine_reserve` pratos na fila de quarentena
        (`is_available = False, requires_moderation = True`) para operação viva na UI `/moderation`.
        """
        stmt = (
            select(Dish, Restaurant)
            .join(Restaurant, Dish.restaurant_id == Restaurant.id)
            .where(
                and_(
                    Dish.requires_moderation.is_(True),
                    Dish.rejection_reason.is_(None),
                )
            )
            .order_by(Dish.created_at.asc(), Dish.name.asc())
        )
        pending_rows = (await session.execute(stmt)).all()
        if not pending_rows:
            return {"promoted_count": 0, "quarantine_retained_count": 0}

        trusted_candidates: List[Dish] = []
        untrusted_or_reserved: List[Dish] = []

        for dish, rest in pending_rows:
            if self._is_trusted_dish(dish, rest):
                trusted_candidates.append(dish)
            else:
                untrusted_or_reserved.append(dish)

        # Garante cota de quarentena viva >= min_quarantine_reserve reservando os últimos candidatos
        needed_from_trusted = max(0, min_quarantine_reserve - len(untrusted_or_reserved))
        if needed_from_trusted > 0 and len(trusted_candidates) > needed_from_trusted:
            promotable = trusted_candidates[:-needed_from_trusted]
            retained = len(untrusted_or_reserved) + needed_from_trusted
        elif needed_from_trusted >= len(trusted_candidates):
            promotable = []
            retained = len(pending_rows)
        else:
            promotable = trusted_candidates
            retained = len(untrusted_or_reserved)

        now_utc = datetime.now(timezone.utc)
        for dish in promotable:
            dish.is_available = True
            dish.requires_moderation = False
            dish.moderated_at = now_utc
            dish.moderation_notes = "Auto-promovido via Trusted Confidence Threshold (SLA H(R,C) + LGPD)."

        await session.flush()
        await session.commit()
        return {
            "promoted_count": len(promotable),
            "quarantine_retained_count": retained,
        }

    async def recalculate_bayesian_and_decay_metrics(self, session: AsyncSession) -> int:
        """
        Reprocessa decaimento temporal exponencial (meia-vida 30 dias) nas avaliações
        e atualiza `rating_average`, `decayed_rating_average`, `review_count`,
        `active_dishes_count` e `bayesian_rating` ($W_R$) de todos os restaurantes ativos:
            W_R = (v / (v + m)) * R + (m / (v + m)) * C,  com m = 10.
        """
        rest_stmt = select(Restaurant).where(Restaurant.is_active.is_(True))
        restaurants = list((await session.execute(rest_stmt)).scalars().all())
        if not restaurants:
            return 0

        # Passo 1: Atualiza reviews e médias aritméticas/decaídas por restaurante
        positive_means: List[float] = []
        for rest in restaurants:
            rev_stmt = select(Review).where(Review.restaurant_id == rest.id)
            reviews = list((await session.execute(rev_stmt)).scalars().all())

            valid_ratings: List[float] = []
            weighted_ratings: List[float] = []
            total_decay_w = 0.0

            for rev in reviews:
                if rev.fraud_confidence_score == 0.0:
                    is_fraud, conf = self.fraud_detector.predict_fraud(
                        rev.comment_text or "", rev.original_rating
                    )
                    rev.is_fraudulent = is_fraud
                    rev.fraud_confidence_score = conf
                if rev.is_fraudulent:
                    continue

                w = rev.calculate_decay(half_life_days=30.0)
                valid_ratings.append(float(rev.original_rating))
                weighted_ratings.append(float(rev.effective_rating))
                total_decay_w += w

            if valid_ratings:
                r_mean = sum(valid_ratings) / len(valid_ratings)
                rest.total_reviews = len(valid_ratings)
                rest.review_count = len(valid_ratings)
                rest.rating_average = round(r_mean, 2)
                rest.decayed_rating_average = round(
                    (sum(weighted_ratings) / total_decay_w) if total_decay_w > 0 else r_mean,
                    2,
                )
            if rest.rating_average and rest.rating_average > 0:
                positive_means.append(float(rest.rating_average))

        # Passo 2: Média global C dos estabelecimentos ativos (4.20 caso amostra < 5)
        global_c = (
            sum(positive_means) / len(positive_means)
            if len(positive_means) >= 5
            else 4.20
        )
        m_prior = 10.0

        for rest in restaurants:
            active_cnt_stmt = select(func.count(Dish.id)).where(
                and_(
                    Dish.restaurant_id == rest.id,
                    Dish.is_available.is_(True),
                    Dish.requires_moderation.is_(False),
                )
            )
            active_cnt = int((await session.execute(active_cnt_stmt)).scalar() or 0)
            rest.active_dishes_count = active_cnt

            v = float(max(rest.review_count or 0, rest.total_reviews or 0))
            r_val = float(rest.rating_average) if (rest.rating_average and rest.rating_average > 0) else global_c
            wr = ((v / (v + m_prior)) * r_val) + ((m_prior / (v + m_prior)) * global_c)
            rest.bayesian_rating = round(wr, 2)

        await session.commit()
        return len(restaurants)

    async def _harvest_single_zone_bounded(
        self,
        semaphore: asyncio.Semaphore,
        slug: str,
        allow_live_network: bool = False,
    ) -> Tuple[str, List[CanonicalRestaurant], Optional[str]]:
        """Executa descoberta + parsing assíncrono de um bairro sob `asyncio.Semaphore(4)`."""
        async with semaphore:
            if await self.redis_coordinator.is_stop_requested():
                return slug, [], "stopped"
            try:
                await self.redis_coordinator.update_runtime_state(
                    status="running",
                    current_neighborhood=slug,
                )
                await self.discovery_engine.generate_or_capture_zone_payloads(
                    slug,
                    allow_live_network=allow_live_network,
                )
                records = await self.engine.harvest_zone(
                    neighborhood_name=slug,
                    allow_live_network=allow_live_network,
                )
                return slug, records, None
            except Exception as exc:
                logger.error(f"[NightlyBatch] Erro ao coletar bairro '{slug}': {exc}")
                return slug, [], str(exc)

    async def run_full_municipality_harvest(
        self,
        max_neighborhoods: int = 15,
        auto_approve_trusted: bool = True,
        force_reharvest: bool = False,
        target_slugs: Optional[List[str]] = None,
        min_quarantine_reserve: int = 12,
    ) -> Dict[str, Any]:
        """
        Orquestra o ciclo completo de povoamento e convergência dos bairros de Caraguatatuba:
        1. Popula/drena a fila priorizada dos 53 bairros no Redis.
        2. Coleta concorrentemente via `asyncio.Semaphore(4)` os payloads multi-plataforma.
        3. Persiste no PostgreSQL 16 com resolução $H(R,C)$, `dish_price_history` e LGPD.
        4. Promove cota segura para a vitrine (se `auto_approve_trusted=True`) mantendo reserva na quarentena.
        5. Sincroniza embeddings vetoriais `vector(1536)` e recalcula $W_R$ Bayesiano.
        """
        job_id = f"nightly-{uuid.uuid4().hex[:10]}"
        await self.redis_coordinator.initialize_telemetry(job_id=job_id, reset_counters=False)

        all_53_slugs = list(CARAGUA_53_NEIGHBORHOODS.keys())
        await self.redis_coordinator.ensure_queue_populated(all_53_slugs, force_reset=force_reharvest)

        selected_slugs: List[str] = []
        if target_slugs:
            for raw in target_slugs:
                s, _, _, _ = resolve_caragua_neighborhood(raw)
                if force_reharvest:
                    await self.redis_coordinator.clear_checkpoint(s)
                if s not in selected_slugs:
                    selected_slugs.append(s)
        else:
            for _ in range(max(1, min(53, max_neighborhoods))):
                nxt = await self.redis_coordinator.pop_next_eligible_neighborhood(force=force_reharvest)
                if nxt is None:
                    break
                selected_slugs.append(nxt)

        semaphore = asyncio.Semaphore(self.concurrency_limit)
        tasks = [
            self._harvest_single_zone_bounded(semaphore, slug, allow_live_network=False)
            for slug in selected_slugs
        ]
        zone_results = await asyncio.gather(*tasks)

        aggregated_db = {
            "restaurants_discovered": 0,
            "restaurants_updated": 0,
            "dishes_quarantined": 0,
            "prices_mutated": 0,
            "errors_count": 0,
        }
        processed_neighborhoods: List[str] = []

        for slug, canonical_records, err in zone_results:
            if err == "stopped":
                continue
            if err is not None or not canonical_records:
                aggregated_db["errors_count"] += 1
                await self.redis_coordinator.requeue_at_tail(slug)
                continue

            db_stats = await self.engine.commit_to_staging_db(canonical_records)
            for k in aggregated_db:
                aggregated_db[k] += db_stats.get(k, 0)

            await self.redis_coordinator.mark_checkpoint(
                neighborhood_slug=slug,
                metadata={
                    "job_id": job_id,
                    "restaurants_processed": len(canonical_records),
                    "dishes_quarantined": db_stats["dishes_quarantined"],
                    "prices_mutated": db_stats["prices_mutated"],
                },
            )
            processed_neighborhoods.append(slug)

        promotion_stats = {"promoted_count": 0, "quarantine_retained_count": 0}
        embeddings_synced = 0
        restaurants_recalculated = 0

        async with AsyncSessionLocal() as session:
            if auto_approve_trusted:
                promotion_stats = await self.apply_trusted_auto_promotion(
                    session=session,
                    min_quarantine_reserve=min_quarantine_reserve,
                )

            # Sincroniza todos os embeddings pendentes em lotes de 200
            while True:
                batch_indexed = await self.indexer.sync_pending_embeddings(session, batch_size=200)
                embeddings_synced += batch_indexed
                if batch_indexed < 200:
                    break

            restaurants_recalculated = await self.recalculate_bayesian_and_decay_metrics(session)

        await self.redis_coordinator.update_runtime_state(status="idle", current_neighborhood="")

        summary = {
            "job_id": job_id,
            "status": "completed",
            "neighborhoods_requested": len(selected_slugs),
            "neighborhoods_processed": processed_neighborhoods,
            "db_ingestion": aggregated_db,
            "trusted_promotion": promotion_stats,
            "embeddings_1536_synced": embeddings_synced,
            "restaurants_bayesian_updated": restaurants_recalculated,
        }
        logger.info(f"[NightlyBatch] Convergência concluída: {summary}")
        return summary


nightly_batch_orchestrator = NightlyBatchOrchestrator(concurrency_limit=4)


async def run_nightly_etl() -> Dict[str, Any]:
    """Ponto de entrada compatível para execução em lote da madrugada."""
    return await nightly_batch_orchestrator.run_full_municipality_harvest(
        max_neighborhoods=15,
        auto_approve_trusted=True,
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = asyncio.run(run_nightly_etl())
    print(result)
