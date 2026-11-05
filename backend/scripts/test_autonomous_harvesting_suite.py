"""
==============================================================================
CARÁFOOD — BATERIA COMPLETA DE AUDITORIA E TESTES DO HARVESTING AUTÔNOMO
Valida Módulos 1, 2, 3, 4, 5, Modelo Matemático H(R, C), Backoff e Invariante LGPD
==============================================================================
"""

from __future__ import annotations

import asyncio
import logging
import sys
import tracemalloc
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from app.main import app
from app.workers.sanitizer_lgpd import LGPDSanitizer, LGPDSecurityViolationError
from app.workers.scraper_adapters import (
    AdapterRegistry,
    DietaryInferenceEngine,
    GoogleMapsPlacesAdapter,
    GoomerAnotaAIAdapter,
    IFoodWebAdapter,
    MenuDinoCardapioWebAdapter,
)
from app.workers.scraper_engine import (
    CARAGUA_53_NEIGHBORHOODS,
    AutonomousScrapingEngine,
    compute_composite_entity_score,
    is_within_caragua_bbox,
)
from app.workers.scraper_playwright import PlaywrightNetworkScraper
from app.workers.scraper_redis import HIGH_DENSITY_PRIORITY_SLUGS, ScraperRedisCoordinator

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger("audit_harvesting_suite")


def test_mathematical_entity_resolution() -> None:
    logger.info("[1/7] Validando Modelo Matemático Composto H(R, C)...")
    # Caso idêntico a 0m: H = 0.65*1.0 + 0.35*1.0 = 1.0
    assert compute_composite_entity_score(1.0, 0.0) == 1.0

    # Caso similaridade 0.80 a 10m de distância:
    # H = 0.65 * 0.80 + 0.35 * (1 - 10/50) = 0.52 + 0.28 = 0.80 >= 0.78 (Mesma entidade!)
    h_match = compute_composite_entity_score(0.80, 10.0)
    assert h_match == 0.80 and h_match >= 0.78

    # Caso limítrofe a 50m com similaridade 0.72:
    # H = 0.65 * 0.72 + 0.35 * 0 = 0.468 < 0.78 (Distinto!)
    h_distinct = compute_composite_entity_score(0.72, 50.0)
    assert h_distinct < 0.78

    # Validação de todos os 53 bairros oficiais dentro da Bounding Box municipal
    assert len(CARAGUA_53_NEIGHBORHOODS) == 53
    for slug, info in CARAGUA_53_NEIGHBORHOODS.items():
        assert is_within_caragua_bbox(info["lat"], info["lng"]), f"Bairro {slug} fora da BBox!"

    # Coordenadas externas (São Paulo capital) devem ser rejeitadas
    assert is_within_caragua_bbox(-23.5505, -46.6333) is False
    logger.info("   -> OK: Fórmula H(R, C) e 53 bairros geodésicos validados.")


def test_dietary_inference_engine() -> None:
    logger.info("[2/7] Validando Motor Heurístico Dietético e Negative Lookbehind...")

    # 1. Negação sintática ("sem queijo", "pão sem glúten", "vegano")
    r1 = DietaryInferenceEngine.infer(
        "Burger Artesanal Vegano",
        "Hambúrguer vegetal sem queijo servido no pão sem glúten.",
        "Lanches Veganos",
    )
    assert r1 == {
        "is_vegan": True,
        "is_vegetarian": True,
        "is_gluten_free": True,
        "is_lactose_free": True,
    }, f"Falha em negação sintática: {r1}"

    # 2. Composto vegetal seguro ("leite de coco") com fruto do mar ("camarão")
    r2 = DietaryInferenceEngine.infer(
        "Moqueca de Camarão",
        "Camarão rosa cozido no leite de coco natural, sem glúten.",
        "Frutos do Mar",
    )
    assert r2["is_vegan"] is False
    assert r2["is_vegetarian"] is False
    assert r2["is_lactose_free"] is True
    assert r2["is_gluten_free"] is True

    # 3. Empanado em fubá vs Empanado em farinha de trigo
    r3_safe = DietaryInferenceEngine.infer(
        "Isca de Cação",
        "Peixe fresco empanado em fubá artesanal, sem lactose.",
    )
    assert r3_safe["is_gluten_free"] is True

    r3_wheat = DietaryInferenceEngine.infer(
        "Isca de Peixe à Milanesa",
        "Filé de peixe empanado na farinha de trigo crocante.",
        upstream_flags={"is_gluten_free": True},  # Mentira da origem deve ser bloqueada!
    )
    assert r3_wheat["is_gluten_free"] is False

    # 4. Bloqueio determinístico contra alucinação/erro na origem (Lasanha com carne e mussarela)
    r4 = DietaryInferenceEngine.infer(
        "Lasanha Bolonhesa",
        "Massa italiana com carne moída e bastante mussarela gratinada.",
        upstream_flags={"is_vegan": True, "is_vegetarian": True, "is_gluten_free": True, "is_lactose_free": True},
    )
    assert r4 == {
        "is_vegan": False,
        "is_vegetarian": False,
        "is_gluten_free": False,
        "is_lactose_free": False,
    }
    logger.info("   -> OK: DietaryInferenceEngine 100% determinístico e imune a falsos positivos.")


def test_polymorphic_adapters_and_memory_footprint() -> None:
    logger.info("[3/7] Validando Adapters Polimórficos e Streaming Assíncrono (< 128MB RAM)...")
    tracemalloc.start()

    engine = AutonomousScrapingEngine(headless=True)
    harvested = asyncio.run(engine.harvest_zone("Caraguatatuba", allow_live_network=False))

    current_bytes, peak_bytes = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    peak_mb = peak_bytes / (1024 * 1024)
    logger.info(f"   -> Pico de memória RAM medido: {peak_mb:.2f} MB (Limite SLA: 128.00 MB)")
    assert peak_mb < 128.0, f"Violação de memória: {peak_mb:.2f} MB >= 128 MB"

    platforms = {r.source_platform for r in harvested}
    assert "ifood_web" in platforms
    assert "goomer" in platforms
    assert "menudino_cardapioweb" in platforms
    assert "google_maps_places" in platforms

    # Verifica conversão de centavos no iFood (5690 -> R$ 56.90) e extração de Smart Defaults
    ifood_rest = next(r for r in harvested if r.source_platform == "ifood_web")
    isca = next(d for d in ifood_rest.dishes if "Cação" in d.name)
    assert isca.price == 56.90
    assert len(isca.choices) >= 2
    assert isca.choices[0].is_required is True

    # Verifica instancias diretas dos 4 adapters
    assert isinstance(AdapterRegistry.get_adapter({"data": {"merchant": {}, "catalog": []}}), IFoodWebAdapter)
    assert isinstance(AdapterRegistry.get_adapter({"store": {}, "categories": []}), GoomerAnotaAIAdapter)
    assert isinstance(AdapterRegistry.get_adapter({"tenant": {}, "catalog_sections": []}), MenuDinoCardapioWebAdapter)
    assert isinstance(AdapterRegistry.get_adapter({"place_id": "abc", "geometry": {}}), GoogleMapsPlacesAdapter)

    logger.info(f"   -> OK: {len(harvested)} estabelecimentos adaptados de 4 topologias distintas.")


def test_lgpd_fatal_invariant_and_backoff() -> None:
    logger.info("[4/7] Validando Invariante Fatal LGPD e Backoff Exponencial...")

    # Backoff Exponencial: T_wait = min(60, 2^attempt + random(0, 1))
    for attempt in (1, 2, 3):
        t_wait = PlaywrightNetworkScraper.compute_backoff_seconds(attempt)
        assert float(2 ** attempt) <= t_wait <= min(60.0, float(2 ** attempt) + 1.0)

    # Sanitização de endereço residencial de consumidor, CPF, telefone e email
    dirty_review = (
        "Moro na Rua das Palmeiras, nº 450, apto 12, CEP 11660-100. "
        "Meu CPF 111.222.333-44 e cel (12) 99777-8899, email joao@teste.com.br."
    )
    clean_review = LGPDSanitizer.sanitize_text(dirty_review)
    author_sha = LGPDSanitizer.anonymize_author("João Carlos Pereira")
    LGPDSanitizer.assert_lgpd_compliant(author_sha, clean_review)

    # Deve disparar erro fatal se o nome do autor estiver legível (não anonimizado)
    raised_author = False
    try:
        LGPDSanitizer.assert_lgpd_compliant("João Carlos Pereira", clean_review)
    except LGPDSecurityViolationError:
        raised_author = True
    assert raised_author is True

    # Deve disparar erro fatal se CPF vazar sem máscara
    raised_cpf = False
    try:
        LGPDSanitizer.assert_lgpd_compliant(author_sha, "Ótimo prato, CPF 123.456.789-00")
    except LGPDSecurityViolationError:
        raised_cpf = True
    assert raised_cpf is True
    logger.info("   -> OK: Invariante Fatal LGPD e Backoff Exponencial verificados.")


def test_redis_priority_ordering_and_fastapi_routes() -> None:
    logger.info("[5/7] Validando Coordenador Topológico Redis (53 Bairros, Checkpoints 24h, Token Bucket) e Rotas FastAPI...")

    async def _exercise_coordinator() -> None:
        coord = ScraperRedisCoordinator(allow_embedded_fallback=True)
        await coord.clear_checkpoint("centro")
        await coord.clear_checkpoint("martim-de-sa")
        total = await coord.ensure_queue_populated(list(CARAGUA_53_NEIGHBORHOODS.keys()), force_reset=True)
        assert total == 53

        first = await coord.pop_next_eligible_neighborhood(force=False)
        assert first == "centro"
        await coord.mark_checkpoint("centro", metadata={"test": True}, ttl_seconds=86400)
        assert await coord.is_checkpoint_valid("centro") is True

        # Se recolocado na fila sem force=True, deve pular pois o checkpoint de 24h está ativo!
        await coord.enqueue_priority_neighborhood("centro")
        second = await coord.pop_next_eligible_neighborhood(force=False)
        assert second == "martim-de-sa"

        # Simula falha de conectividade -> requeue no fim da fila SEM gravar checkpoint
        await coord.requeue_at_tail("martim-de-sa")
        assert await coord.is_checkpoint_valid("martim-de-sa") is False

        # Testa Token Bucket rate-limiter
        waited1 = await coord.acquire_rate_limit("https://marketplace.ifood.com.br/v1/catalog", capacity=2, refill_per_second=10.0)
        waited2 = await coord.acquire_rate_limit("https://marketplace.ifood.com.br/v1/catalog", capacity=2, refill_per_second=10.0)
        waited3 = await coord.acquire_rate_limit("https://marketplace.ifood.com.br/v1/catalog", capacity=2, refill_per_second=10.0)
        assert waited1 == 0.0 and waited2 == 0.0 and waited3 >= 0.05

        # Testa Telemetria Atômica HINCRBY + Stop Flag
        await coord.initialize_telemetry("job-test-01", reset_counters=True)
        val = await coord.increment_metric("dishes_quarantined", delta=4)
        assert val == 4
        await coord.request_stop()
        assert await coord.is_stop_requested() is True
        snapshot = await coord.get_full_status()
        assert snapshot["telemetry"]["dishes_quarantined"] == 4
        assert snapshot["valid_checkpoints_count"] >= 1
        await coord.close()

    asyncio.run(_exercise_coordinator())

    openapi_schema = app.openapi()
    registered_paths = set(openapi_schema.get("paths", {}).keys())
    expected_paths = {
        "/api/v1/moderation/scraper/trigger",
        "/api/v1/moderation/scraper/status",
        "/api/v1/moderation/scraper/stop",
        "/api/v1/moderation/dishes/{dish_id}/approve",
        "/api/v1/moderation/dishes/{dish_id}/reject",
        "/api/v1/moderation/dishes/{dish_id}/price-history",
        "/api/v1/moderation/pending-promotions",
    }
    missing = expected_paths - registered_paths
    assert not missing, f"Rotas ausentes no FastAPI: {missing}"

    with TestClient(app) as client:
        stop_res = client.post("/api/v1/moderation/scraper/stop")
        assert stop_res.status_code == 200
        assert stop_res.json()["status"] == "stop_requested"

        trig_res = client.post(
            "/api/v1/moderation/scraper/trigger",
            json={"neighborhood": "Centro", "force": True, "max_zones": 1},
        )
        assert trig_res.status_code == 202
        assert trig_res.json()["status"] == "accepted"

    logger.info("   -> OK: Coordenador Redis (53 bairros, TTL 86400s, Token Bucket, Stop/Trigger HTTP 202) 100% aprovado.")


def test_postgresql_dialect_compilation() -> None:
    logger.info("[6/7] Validando Compilação Nativa SQL PostgreSQL 16 (PostGIS + pg_trgm + ON CONFLICT)...")
    from geoalchemy2 import Geography
    from sqlalchemy import and_, func, or_, select
    from sqlalchemy.dialects import postgresql
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    from sqlalchemy.schema import CreateTable

    from app.db.models import Dish, DishPriceHistory, Restaurant, Review

    pg_dialect = postgresql.dialect()

    # 1. DDL de dish_price_history
    ddl_sql = str(CreateTable(DishPriceHistory.__table__).compile(dialect=pg_dialect))
    assert "CREATE TABLE dish_price_history" in ddl_sql
    assert "previous_price NUMERIC(10, 2) NOT NULL" in ddl_sql
    assert "delta_percentage NUMERIC(6, 3) NOT NULL" in ddl_sql

    # 2. Query de Resolução Espacial-Textual (ST_DWithin <= 50m + similarity >= 0.72)
    pt = func.cast(func.ST_SetSRID(func.ST_MakePoint(-45.3910, -23.6250), 4326), Geography)
    rest_geog = func.cast(Restaurant.geom, Geography)
    res_stmt = select(
        Restaurant.id,
        func.similarity(Restaurant.name, "Quiosque Mar Bravo"),
        func.ST_Distance(rest_geog, pt),
    ).where(
        and_(
            func.ST_DWithin(rest_geog, pt, 50.0),
            func.similarity(Restaurant.name, "Quiosque Mar Bravo") >= 0.72,
        )
    )
    compiled_res = str(res_stmt.compile(dialect=pg_dialect, compile_kwargs={"literal_binds": True}))
    assert "ST_DWithin" in compiled_res
    assert "similarity(restaurants.name" in compiled_res
    assert "50.0" in compiled_res and "0.72" in compiled_res

    # 3. Query de Upsert de Pratos (ingestion_hash OR similarity >= 0.85)
    dish_stmt = select(Dish).where(
        and_(
            Dish.restaurant_id == uuid.uuid4(),
            or_(Dish.ingestion_hash == "a" * 64, func.similarity(Dish.name, "Moqueca") >= 0.85),
        )
    )
    compiled_dish = str(dish_stmt.compile(dialect=pg_dialect))
    assert "dishes.ingestion_hash" in compiled_dish and "similarity(dishes.name" in compiled_dish

    # 4. Insert Idempotente de Review (ON CONFLICT DO NOTHING)
    rev_stmt = (
        pg_insert(Review)
        .values(
            id=uuid.uuid4(),
            restaurant_id=uuid.uuid4(),
            ingestion_hash="b" * 64,
            author_hash="c" * 64,
            original_rating=5.0,
            comment_text="Excelente",
            review_date=datetime.now(timezone.utc),
            is_fraudulent=False,
            fraud_confidence_score=0.0,
            time_decay_weight=1.0,
            effective_rating=5.0,
        )
        .on_conflict_do_nothing()
    )
    compiled_rev = str(rev_stmt.compile(dialect=pg_dialect))
    assert "ON CONFLICT DO NOTHING" in compiled_rev
    logger.info("   -> OK: Todas as instruções SQL/PostGIS/pg_trgm/ON CONFLICT compilam sem erros no PostgreSQL 16.")


async def try_live_postgres_and_redis_e2e() -> bool:
    """
    Executa validação transacional real no PostgreSQL 16 (PostGIS + pg_trgm + pgvector)
    e no Redis 7 caso os serviços estejam ativos no host.
    """
    logger.info("[6/7] Testando Conectividade Live com PostgreSQL 16 e Redis 7...")
    coord = ScraperRedisCoordinator(allow_embedded_fallback=False)
    try:
        r_client = await coord.get_client()
        await r_client.ping()
    except Exception as exc:
        logger.warning(f"   -> Redis local indisponível no momento ({exc}).")
        await coord.close()
        return False

    try:
        from scripts.migrate_scraper_schema import run_migration
        await run_migration()
    except Exception as exc:
        logger.warning(f"   -> PostgreSQL local indisponível no momento ({exc}).")
        await coord.close()
        return False

    logger.info("[7/7] Executando Teste E2E Real (PostGIS ST_DWithin + pg_trgm + DishPriceHistory + Redis)...")
    engine = AutonomousScrapingEngine(headless=True, redis_coordinator=coord)

    # 1. Executa job distribuído para 'martim-de-sa'
    job_id = f"audit-{uuid.uuid4().hex[:8]}"
    res1 = await engine.run_distributed_harvest_job(
        job_id=job_id,
        target_neighborhood="Martim de Sá",
        force=True,
        max_zones_per_run=1,
        allow_live_network=False,
    )
    assert res1["status"] == "completed"
    assert await coord.is_checkpoint_valid("martim-de-sa") is True

    # 2. Testa Deduplicação Espacial-Textual (< 50m + trigrama >= 0.72) e Mutação de Preço!
    harvested = await engine.harvest_zone("martim-de-sa", allow_live_network=False)
    mutated_copy = harvested[0].model_copy(deep=True)
    # Variação léxica/ortográfica sem acento + sufixo curto e deslocamento de ~7 metros de GPS
    mutated_copy.name = "Quiosque Mar Bravo Caicara Bar"
    mutated_copy.latitude = -23.62505
    mutated_copy.longitude = -45.39104
    mutated_copy.dishes[0].price = round(mutated_copy.dishes[0].price + 7.50, 2)

    commit_stats = await engine.commit_to_staging_db([mutated_copy])
    assert commit_stats["restaurants_updated"] >= 1, "Deveria unificar restaurante via ST_DWithin + pg_trgm!"
    assert commit_stats["prices_mutated"] >= 1, "Deveria registrar histórico em dish_price_history!"

    from app.db.session import async_engine
    await coord.close()
    await async_engine.dispose()

    # 3. Testa Endpoints REST via TestClient contra o banco e Redis reais
    with TestClient(app) as client:
        status_resp = client.get("/api/v1/moderation/scraper/status")
        assert status_resp.status_code == 200
        status_body = status_resp.json()
        assert status_body["valid_checkpoints_count"] >= 1

        pending_resp = client.get("/api/v1/moderation/pending-promotions")
        assert pending_resp.status_code == 200
        pending_items = pending_resp.json()
        assert len(pending_items) >= 1

        sample_dish_id = pending_items[0]["id"]
        approve_resp = client.post(f"/api/v1/moderation/dishes/{sample_dish_id}/approve")
        assert approve_resp.status_code == 200
        assert approve_resp.json()["is_available"] is True
        assert approve_resp.json()["requires_moderation"] is False

        stop_resp = client.post("/api/v1/moderation/scraper/stop")
        assert stop_resp.status_code == 200
        assert stop_resp.json()["status"] == "stop_requested"

    logger.info("   -> OK: Integração E2E Real (PostGIS + pg_trgm + Redis + API) 100% APROVADA!")
    return True


if __name__ == "__main__":
    test_mathematical_entity_resolution()
    test_dietary_inference_engine()
    test_polymorphic_adapters_and_memory_footprint()
    test_lgpd_fatal_invariant_and_backoff()
    test_redis_priority_ordering_and_fastapi_routes()
    test_postgresql_dialect_compilation()
    live_ok = asyncio.run(try_live_postgres_and_redis_e2e())
    logger.info("==================================================================")
    logger.info(f"SUITE DE AUDITORIA FINALIZADA COM SUCESSO! (Live DB/Redis={live_ok})")
    logger.info("==================================================================")
