"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — AUTONOMOUS LOCAL AGENTIC SCRAPING & INGESTION ENGINE
Módulos 2 & 3: Conector Resiliente Playwright, Resolução Espacial-Textual H(R, C),
Upsert Incremental com Histórico de Preços, Quarentena e Invariante LGPD/ACID
==============================================================================
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import math
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple, Union

import geohash2
import h3
from geoalchemy2 import Geography
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from sqlalchemy import and_, func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import Dish, DishPriceHistory, Restaurant, Review
from app.db.session import AsyncSessionLocal
from app.workers.fraud_detector import ReviewFraudDetector
from app.workers.sanitizer_lgpd import LGPDSanitizer, LGPDSecurityViolationError
from app.workers.scraper_adapters import (
    AdapterRegistry,
    CanonicalDish,
    CanonicalRestaurant,
    CanonicalReview,
    DietaryInferenceEngine,
    parse_brl_price,
    slugify_text,
    strip_html,
)
from app.workers.scraper_playwright import (
    RAW_DATA_DIR,
    SNAPSHOTS_DATA_DIR,
    PlaywrightNetworkScraper,
    ScraperConnectivityBlockedError,
)
from app.workers.scraper_redis import ScraperRedisCoordinator, scraper_redis_coordinator
from app.workers.seed_discovery import (
    NEIGHBORHOOD_SLUG_ALIASES,
    OFFICIAL_53_NEIGHBORHOODS,
    seed_discovery_engine,
)
from app.services.vector_indexer import vector_indexing_service

logger = logging.getLogger("scraper_engine")
logger.setLevel(logging.INFO)

# ==============================================================================
# TOPOLOGIA OFICIAL DOS 53 BAIRROS DE CARAGUATATUBA (UNIFICADA COM SEED DISCOVERY)
# ==============================================================================
CARAGUA_53_NEIGHBORHOODS: Dict[str, Dict[str, Any]] = OFFICIAL_53_NEIGHBORHOODS

# Envelope geodésico municipal de Caraguatatuba (cobrindo núcleo [-23.68, -45.48]..[-23.55, -45.32]
# até a divisa sul oficial em Canto do Mar [-23.72] e divisa norte no Rio Tabatinga [-23.55])
CARAGUA_BOUNDS: Dict[str, float] = {
    "lat_min": -23.725,
    "lat_max": -23.545,
    "lng_min": -45.490,
    "lng_max": -45.315,
}

# Pesos do Modelo Matemático de Resolução Espacial-Textual H(R, C) (Ontology Section 1)
ENTITY_WEIGHT_TRIGRAM: float = 0.65
ENTITY_WEIGHT_GEODETIC: float = 0.35
ENTITY_MAX_DISTANCE_METERS: float = 50.0
ENTITY_TRIGRAM_MIN_SQL: float = 0.72
ENTITY_COMPOSITE_THRESHOLD: float = 0.78
DISH_SIMILARITY_THRESHOLD: float = 0.85


# ==============================================================================
# FUNÇÕES UTILITÁRIAS E GEODÉSICAS
# ==============================================================================

def normalize_currency(raw_price: Any) -> float:
    """Compatibilidade e normalização monetária BRL."""
    return parse_brl_price(raw_price, assume_cents_if_int=False)


def strip_html_artifacts(text: Optional[str]) -> str:
    """Compatibilidade de limpeza HTML."""
    return strip_html(text)


def normalize_string(value: str) -> str:
    """Normaliza string removendo acentos, pontuação e espaços extras para hashing determinístico."""
    nfkd = unicodedata.normalize("NFKD", value or "")
    ascii_text = nfkd.encode("ascii", "ignore").decode("ascii").lower()
    cleaned = re.sub(r"[^a-z0-9\s]", " ", ascii_text)
    return re.sub(r"\s+", " ", cleaned).strip()


def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância geodésica em metros no elipsoide aproximado WGS-84."""
    radius_earth = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    return radius_earth * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))


def is_within_caragua_bbox(lat: float, lon: float) -> bool:
    """Valida contenção estrita na Bounding Box oficial de Caraguatatuba."""
    return (
        CARAGUA_BOUNDS["lat_min"] <= lat <= CARAGUA_BOUNDS["lat_max"]
        and CARAGUA_BOUNDS["lng_min"] <= lon <= CARAGUA_BOUNDS["lng_max"]
    )


def compute_composite_entity_score(s_trigram: float, distance_meters: float) -> float:
    """
    Calcula a função composta de pertinência H(R, C) in [0, 1]:
    H(R, C) = w_s * S_trigram(R.name, C.name) + w_d * max(0, 1 - Distance / delta_max)
    """
    spatial_term = max(0.0, 1.0 - (float(distance_meters) / ENTITY_MAX_DISTANCE_METERS))
    score = (ENTITY_WEIGHT_TRIGRAM * float(s_trigram)) + (ENTITY_WEIGHT_GEODETIC * spatial_term)
    return round(min(1.0, max(0.0, score)), 4)


def resolve_caragua_neighborhood(
    raw_name: str = "",
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> Tuple[str, str, float, float]:
    """
    Resolve e normaliza o bairro entre os 53 oficiais de Caraguatatuba.
    Retorna: (neighborhood_slug, neighborhood_canonical_name, latitude, longitude)
    """
    slug_candidate = slugify_text(raw_name) if raw_name else ""
    if slug_candidate in NEIGHBORHOOD_SLUG_ALIASES:
        slug_candidate = NEIGHBORHOOD_SLUG_ALIASES[slug_candidate]

    if slug_candidate in CARAGUA_53_NEIGHBORHOODS:
        b = CARAGUA_53_NEIGHBORHOODS[slug_candidate]
        resolved_lat = lat if (lat is not None and is_within_caragua_bbox(lat, lng or b["lng"])) else b["lat"]
        resolved_lng = lng if (lng is not None and is_within_caragua_bbox(lat or b["lat"], lng)) else b["lng"]
        return slug_candidate, b["name"], resolved_lat, resolved_lng

    raw_lower = normalize_string(raw_name)
    if raw_lower:
        for k, v in CARAGUA_53_NEIGHBORHOODS.items():
            if k.replace("-", " ") in raw_lower or normalize_string(v["name"]) in raw_lower:
                resolved_lat = lat if (lat is not None and lng is not None and is_within_caragua_bbox(lat, lng)) else v["lat"]
                resolved_lng = lng if (lat is not None and lng is not None and is_within_caragua_bbox(lat, lng)) else v["lng"]
                return k, v["name"], resolved_lat, resolved_lng

    if lat is not None and lng is not None and is_within_caragua_bbox(lat, lng):
        closest_slug = min(
            CARAGUA_53_NEIGHBORHOODS.keys(),
            key=lambda k: calculate_haversine(
                lat,
                lng,
                CARAGUA_53_NEIGHBORHOODS[k]["lat"],
                CARAGUA_53_NEIGHBORHOODS[k]["lng"],
            ),
        )
        b = CARAGUA_53_NEIGHBORHOODS[closest_slug]
        return closest_slug, b["name"], lat, lng

    b = CARAGUA_53_NEIGHBORHOODS["centro"]
    return "centro", b["name"], b["lat"], b["lng"]


def generate_local_embedding(text: str, dimension: int = 1536) -> List[float]:
    """
    Gera localmente um vetor semântico determinístico normalizado L2 de 1536 dimensões
    com Zero Custo de Nuvem via `VectorIndexingService`.
    """
    if dimension == 1536:
        return vector_indexing_service.compute_semantic_embedding_1536(text)
    import numpy as np

    seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    vec = rng.standard_normal(dimension)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def build_discovery_url_for_zone(neighborhood_slug: str) -> str:
    """Constrói URL de descoberta hiperlocal para interceptação XHR via Playwright."""
    info = CARAGUA_53_NEIGHBORHOODS.get(neighborhood_slug, CARAGUA_53_NEIGHBORHOODS["centro"])
    query = f"restaurantes+{info['name'].replace(' ', '+')}+Caraguatatuba+SP"
    return f"https://www.google.com/maps/search/{query}/@{info['lat']},{info['lng']},15z"


# ==============================================================================
# MOTOR AUTÔNOMO DE HARVESTING, RESOLUÇÃO DE ENTIDADES E INGESTÃO ACID
# ==============================================================================

class AutonomousScrapingEngine:
    """
    Motor de Ingestão Autônoma Industrial:
    - Conector em 3 níveis: Raw Payload Cache -> Playwright Live XHR -> Validated Local Snapshots.
    - Streaming assíncrono de JSON (< 128MB RAM) + AdapterRegistry polimórfico.
    - Deduplicação Espacial-Textual PostGIS ST_DWithin(50m) + pg_trgm similarity >= 0.72 + H(R, C).
    - Upsert incremental de pratos com rastreabilidade `dish_price_history` e Quarentena (`is_available=False`).
    - Deduplicação idempotente de avaliações (`ON CONFLICT DO NOTHING`) com Invariante Fatal LGPD.
    """

    def __init__(
        self,
        headless: bool = True,
        redis_coordinator: Optional[ScraperRedisCoordinator] = None,
    ) -> None:
        self.headless = headless
        self.sanitizer = LGPDSanitizer()
        self.fraud_detector = ReviewFraudDetector()
        self.network_scraper = PlaywrightNetworkScraper(headless=headless)
        self.redis_coordinator = redis_coordinator or scraper_redis_coordinator

    @staticmethod
    async def _stream_payload_files(file_paths: List[Path]) -> AsyncGenerator[Tuple[Path, Any], None]:
        """
        Gerador assíncrono que carrega um arquivo JSON por vez e libera referências
        imediatamente, mantendo pegada de memória RAM estritamente abaixo de 128MB.
        """
        for path in file_paths:
            if not path.exists() or not path.is_file():
                continue
            try:
                content = await asyncio.to_thread(path.read_text, encoding="utf-8")
                parsed = json.loads(content)
                yield path, parsed
            except Exception as exc:
                logger.error(f"[AutonomousScraper] Arquivo JSON inválido ignorado ({path.name}): {exc}")

    def _discover_raw_files_for_zone(self, zone_slug: str) -> List[Path]:
        """Localiza payloads XHR e OSM reais pendentes em `backend/data/raw/payload_*.json` em ordem causal (OSM real -> w1 -> w2)."""
        all_raw = sorted(
            RAW_DATA_DIR.glob("payload_*.json"),
            key=lambda p: (
                0 if p.name.startswith("payload_osm_real_") else 1,
                0 if "martim-de-sa" in p.name else 1,
                p.name,
            ),
        )
        if zone_slug in ("all", "caraguatatuba", "geral"):
            return all_raw
        zone_matched = [
            p
            for p in all_raw
            if f"payload_osm_real_{zone_slug}_" in p.name or f"payload_{zone_slug}_" in p.name
        ]
        return zone_matched

    def _discover_snapshot_files_for_zone(self, zone_slug: str) -> List[Path]:
        """Localiza snapshots auditados em `backend/data/snapshots/snapshot_*.json`."""
        all_snaps = sorted(SNAPSHOTS_DATA_DIR.glob("snapshot_*.json"))
        if zone_slug in ("all", "caraguatatuba", "geral"):
            return all_snaps
        matched = [p for p in all_snaps if zone_slug in p.name]
        return matched if matched else all_snaps

    async def _safe_redis_increment(self, metric_name: str, delta: int = 1) -> None:
        """Incrementa telemetria no Redis sem derrubar o pipeline caso o Redis esteja offline."""
        try:
            await self.redis_coordinator.increment_metric(metric_name, delta=delta)
        except Exception as exc:
            logger.debug(f"[Telemetry] Redis indisponível para incremento ({metric_name}): {exc}")

    async def harvest_zone(
        self,
        neighborhood_name: str = "Caraguatatuba",
        session: Optional[AsyncSession] = None,
        allow_live_network: bool = True,
    ) -> List[CanonicalRestaurant]:
        """
        Circuito de Chaveamento Inteligente para Coleta de Zona:
        1. Verifica existência de arquivos brutos pendentes em `backend/data/raw/payload_*.json`.
        2. Caso ausentes e `allow_live_network=True`, aciona `PlaywrightNetworkScraper.scrape_target_url`
           respeitando Token Bucket distribuído no Redis.
        3. Em caso de bloqueio (HTTP 403/429, Cloudflare ou Timeout) ou ausência de XHR na URL,
           captura a exceção de forma estruturada e aciona fallback para os snapshots locais validados.
        4. Converte cada payload via `AdapterRegistry` em instâncias `CanonicalRestaurant`.
        """
        is_citywide = normalize_string(neighborhood_name) in ("caraguatatuba", "all", "todos", "geral")
        if is_citywide:
            zone_slug = "caraguatatuba"
            canonical_zone_name = "Caraguatatuba"
        else:
            zone_slug, canonical_zone_name, _, _ = resolve_caragua_neighborhood(neighborhood_name)

        logger.info(
            f"[AutonomousScraper] Iniciando harvesting da zona '{canonical_zone_name}' (slug='{zone_slug}')..."
        )

        candidate_files = self._discover_raw_files_for_zone(zone_slug)

        # Estágio 2: Interceptação XHR Real via Playwright caso não existam payloads brutos em disco
        if not candidate_files and allow_live_network and not is_citywide:
            target_url = build_discovery_url_for_zone(zone_slug)
            try:
                try:
                    await self.redis_coordinator.acquire_rate_limit(
                        target_url, capacity=4, refill_per_second=0.5
                    )
                except Exception as redis_exc:
                    logger.debug(f"[RateLimit] Prosseguindo sem Redis Token Bucket ({redis_exc}).")

                await self.network_scraper.scrape_target_url(
                    target_url=target_url,
                    zone_tag=zone_slug,
                    wait_seconds=settings.SCRAPER_DELAY_SECONDS,
                )
                candidate_files = self._discover_raw_files_for_zone(zone_slug)
            except ScraperConnectivityBlockedError as blocked_err:
                logger.warning(
                    json.dumps(
                        {
                            "event": "playwright_live_interception_blocked",
                            "zone": zone_slug,
                            "target_url": target_url,
                            "reason": str(blocked_err),
                            "action": "activating_validated_snapshot_fallback",
                        },
                        ensure_ascii=False,
                    )
                )
                await self._safe_redis_increment("errors_count", 1)
            except Exception as unexpected_err:
                logger.warning(
                    json.dumps(
                        {
                            "event": "playwright_live_interception_error",
                            "zone": zone_slug,
                            "reason": str(unexpected_err),
                            "action": "activating_validated_snapshot_fallback",
                        },
                        ensure_ascii=False,
                    )
                )
                await self._safe_redis_increment("errors_count", 1)

        # Estágio 3: Descoberta Regional Autônoma (SeedDiscoveryEngine) + Fallback para Snapshots
        if not candidate_files and not is_citywide:
            candidate_files = await seed_discovery_engine.generate_or_capture_zone_payloads(
                zone_slug,
                allow_live_network=False,
            )
        if not candidate_files:
            candidate_files = self._discover_snapshot_files_for_zone(zone_slug)
            logger.info(
                f"[AutonomousScraper] Lendo {len(candidate_files)} snapshot(s) validados em disco para '{zone_slug}'."
            )

        harvested_restaurants: List[CanonicalRestaurant] = []
        async for file_path, raw_json in self._stream_payload_files(candidate_files):
            for node in AdapterRegistry.unwrap_network_envelope(raw_json):
                adapter = AdapterRegistry.get_adapter(node)
                if adapter is None:
                    logger.debug(f"[AdapterRegistry] Nenhum adapter compatível para nó em {file_path.name}.")
                    continue
                try:
                    adapted_items = adapter.adapt_many(node)
                    harvested_restaurants.extend(adapted_items)
                except Exception as adapt_err:
                    logger.error(
                        f"[Adapter:{adapter.platform_name}] Erro ao adaptar payload ({file_path.name}): {adapt_err}"
                    )
                    await self._safe_redis_increment("errors_count", 1)

        logger.info(
            f"[AutonomousScraper] Zona '{canonical_zone_name}': "
            f"{len(harvested_restaurants)} estabelecimento(s) canônico(s) extraído(s)."
        )

        if session is not None and harvested_restaurants:
            await self.commit_to_staging_db(harvested_restaurants, session=session)

        return harvested_restaurants

    @staticmethod
    def _coerce_canonical_restaurant(item: Union[CanonicalRestaurant, Dict[str, Any]]) -> CanonicalRestaurant:
        """Garante conversão tipada para CanonicalRestaurant mesmo quando chamado por pipelines legados."""
        if isinstance(item, CanonicalRestaurant):
            return item

        adapter = AdapterRegistry.get_adapter(item)
        if adapter is not None:
            return adapter.adapt_restaurant(item)

        dishes = [
            CanonicalDish(
                name=strip_html(d.get("name", "")),
                description=strip_html(d.get("description", "")),
                price=max(0.01, parse_brl_price(d.get("price") or d.get("raw_price") or 1.0)),
                category=strip_html(d.get("category", "Geral")),
                **DietaryInferenceEngine.infer(
                    d.get("name", ""),
                    d.get("description", ""),
                    d.get("category", ""),
                    upstream_flags=d,
                ),
            )
            for d in item.get("dishes", [])
            if d.get("name")
        ]
        reviews = [
            CanonicalReview(
                raw_author=str(r.get("author_hash") or r.get("author_name") or r.get("raw_author") or "anon"),
                rating=min(5.0, max(1.0, float(r.get("original_rating") or r.get("rating") or 5.0))),
                comment=strip_html(r.get("comment_text") or r.get("text") or r.get("comment") or ""),
                timestamp=datetime.fromisoformat(r["review_date"])
                if isinstance(r.get("review_date"), str)
                else datetime.now(timezone.utc),
                source_platform=str(item.get("source_platform") or "legacy"),
            )
            for r in item.get("reviews", [])
        ]

        name = strip_html(item.get("name", "Estabelecimento Caraguá"))
        return CanonicalRestaurant(
            name=name,
            slug=slugify_text(item.get("slug") or name),
            street=strip_html(item.get("street") or item.get("address") or "Caraguatatuba - SP"),
            neighborhood=strip_html(item.get("neighborhood") or item.get("raw_neighborhood") or "Centro"),
            latitude=float(item.get("latitude", -23.6226)),
            longitude=float(item.get("longitude", -45.4124)),
            phone=item.get("phone"),
            website=item.get("website"),
            rating=float(item.get("rating_average") or item.get("rating") or 0.0),
            review_count=int(item.get("total_reviews") or item.get("review_count") or len(reviews)),
            source_platform=str(item.get("source_platform") or "direct_ingest"),
            source_external_id=str(
                item.get("source_external_id")
                or hashlib.sha256(name.encode("utf-8")).hexdigest()[:16]
            ),
            cuisine_types=list(item.get("cuisine_types") or ["Gastronomia Local"]),
            price_level=min(4, max(1, int(item.get("price_level") or 2))),
            opening_hours=item.get("opening_hours"),
            dishes=dishes,
            reviews=reviews,
        )

    async def _ingest_single_restaurant_tx(
        self,
        session: AsyncSession,
        canonical: CanonicalRestaurant,
    ) -> Dict[str, int]:
        """
        Executa a resolução espacial-textual H(R, C), upsert de pratos com `dish_price_history`
        e deduplicação `ON CONFLICT DO NOTHING` de reviews dentro de uma transação atômica.
        """
        counters = {
            "restaurants_discovered": 0,
            "restaurants_updated": 0,
            "dishes_quarantined": 0,
            "prices_mutated": 0,
        }

        # 1. Validação Invariante LGPD PRÉ-BANCO em todas as avaliações do lote
        prepared_reviews: List[Dict[str, Any]] = []
        decay_lambda = math.log(2.0) / 30.0
        now_utc = datetime.now(timezone.utc)

        for rev in canonical.reviews:
            author_hash = self.sanitizer.anonymize_author(rev.raw_author)
            sanitized_comment = self.sanitizer.sanitize_text(rev.comment or "")
            # Dispara LGPDSecurityViolationError fatal antes de tocar no banco se houver vazamento
            self.sanitizer.assert_lgpd_compliant(author_hash, sanitized_comment)

            rev_ts = rev.timestamp if rev.timestamp.tzinfo else rev.timestamp.replace(tzinfo=timezone.utc)
            delta_days = max(0.0, (now_utc - rev_ts).total_seconds() / 86400.0)
            decay_weight = math.exp(-decay_lambda * delta_days)
            is_fraud, fraud_conf = self.fraud_detector.predict_fraud(sanitized_comment or "", rev.rating)

            prepared_reviews.append(
                {
                    "author_hash": author_hash,
                    "original_rating": float(rev.rating),
                    "comment_text": sanitized_comment,
                    "review_date": rev_ts,
                    "is_fraudulent": is_fraud,
                    "fraud_confidence_score": float(fraud_conf),
                    "time_decay_weight": round(decay_weight, 6),
                    "effective_rating": round(float(rev.rating) * decay_weight, 4),
                    "source_platform": rev.source_platform,
                }
            )

        # 2. Validação Geodésica da Bounding Box Municipal de Caraguatatuba
        lat = float(canonical.latitude)
        lon = float(canonical.longitude)
        if not is_within_caragua_bbox(lat, lon):
            raise ValueError(
                f"Coordenadas fora da Bounding Box oficial de Caraguatatuba: "
                f"({lat}, {lon}) para '{canonical.name}'."
            )

        neigh_slug, canonical_neighborhood, resolved_lat, resolved_lon = resolve_caragua_neighborhood(
            canonical.neighborhood, lat, lon
        )

        # 3. Resolução Espacial-Textual de Entidades (PostGIS ST_DWithin <= 50m + pg_trgm >= 0.72)
        candidate_point_geog = func.cast(
            func.ST_SetSRID(func.ST_MakePoint(resolved_lon, resolved_lat), 4326),
            Geography,
        )
        rest_geog = func.cast(Restaurant.geom, Geography)
        trigram_expr = func.greatest(
            func.similarity(Restaurant.name, canonical.name),
            func.similarity(func.unaccent(Restaurant.name), func.unaccent(canonical.name)),
        ).label("s_trigram")
        dist_expr = func.ST_Distance(rest_geog, candidate_point_geog).label("dist_meters")

        resolution_stmt = (
            select(Restaurant, trigram_expr, dist_expr)
            .where(
                and_(
                    func.ST_DWithin(rest_geog, candidate_point_geog, ENTITY_MAX_DISTANCE_METERS),
                    trigram_expr >= ENTITY_TRIGRAM_MIN_SQL,
                )
            )
            .order_by(trigram_expr.desc(), dist_expr.asc())
        )

        resolution_rows = (await session.execute(resolution_stmt)).all()
        matched_restaurant: Optional[Restaurant] = None
        best_h_score = 0.0

        for cand_rest, s_tri, dist_m in resolution_rows:
            h_score = compute_composite_entity_score(float(s_tri), float(dist_m))
            if h_score >= ENTITY_COMPOSITE_THRESHOLD and float(dist_m) <= ENTITY_MAX_DISTANCE_METERS:
                if h_score > best_h_score:
                    best_h_score = h_score
                    matched_restaurant = cand_rest

        if matched_restaurant is not None:
            logger.info(
                f"[EntityResolution] Match híbrido H(R,C)={best_h_score:.3f} -> "
                f"'{canonical.name}' unificado à entidade '{matched_restaurant.name}' (id={matched_restaurant.id})."
            )
            if canonical.phone:
                matched_restaurant.phone = canonical.phone
            if canonical.website:
                matched_restaurant.website = canonical.website
                matched_restaurant.source_url = canonical.website
            if canonical.opening_hours:
                matched_restaurant.opening_hours = canonical.opening_hours
            if canonical.rating > 0 and matched_restaurant.total_reviews == 0:
                matched_restaurant.rating_average = canonical.rating
            matched_restaurant.updated_at = now_utc
            target_restaurant = matched_restaurant
            counters["restaurants_updated"] += 1
        else:
            # Garante unicidade do slug caso exista homônimo em outro bairro (> 50m)
            base_slug = slugify_text(canonical.slug or canonical.name)
            existing_slug_row = (
                await session.execute(select(Restaurant.id).where(Restaurant.slug == base_slug))
            ).scalar_one_or_none()
            final_slug = (
                f"{base_slug}-{neigh_slug}-{canonical.source_external_id[:6]}"
                if existing_slug_row is not None
                else base_slug
            )

            geom = from_shape(Point(resolved_lon, resolved_lat), srid=4326)
            h3_8 = (
                h3.latlng_to_cell(resolved_lat, resolved_lon, 8)
                if hasattr(h3, "latlng_to_cell")
                else h3.geo_to_h3(resolved_lat, resolved_lon, resolution=8)
            )
            h3_9 = (
                h3.latlng_to_cell(resolved_lat, resolved_lon, 9)
                if hasattr(h3, "latlng_to_cell")
                else h3.geo_to_h3(resolved_lat, resolved_lon, resolution=9)
            )
            gh = geohash2.encode(resolved_lat, resolved_lon, precision=9)

            target_restaurant = Restaurant(
                name=canonical.name,
                slug=final_slug,
                phone=canonical.phone,
                website=canonical.website,
                address=canonical.street,
                neighborhood=canonical_neighborhood,
                city="Caraguatatuba",
                state="SP",
                latitude=resolved_lat,
                longitude=resolved_lon,
                geom=geom,
                h3_res8=h3_8,
                h3_res9=h3_9,
                geohash=gh,
                price_level=canonical.price_level,
                cuisine_types=canonical.cuisine_types or ["Gastronomia Local"],
                opening_hours=canonical.opening_hours,
                is_active=True,
                rating_average=canonical.rating,
                decayed_rating_average=canonical.rating,
                total_reviews=0,
                source_url=canonical.website,
                source_platform=canonical.source_platform,
                source_external_id=canonical.source_external_id,
            )
            session.add(target_restaurant)
            await session.flush()
            counters["restaurants_discovered"] += 1

        restaurant_id = target_restaurant.id

        # 4. Upsert Idempotente de Pratos (Dish) + Histórico Temporal de Preços + Quarentena
        for c_dish in canonical.dishes:
            dish_hash = hashlib.sha256(
                f"{restaurant_id}:{normalize_string(c_dish.name)}".encode("utf-8")
            ).hexdigest()

            dish_sim_expr = func.similarity(Dish.name, c_dish.name)
            dish_stmt = (
                select(Dish)
                .where(
                    and_(
                        Dish.restaurant_id == restaurant_id,
                        or_(
                            Dish.ingestion_hash == dish_hash,
                            dish_sim_expr >= DISH_SIMILARITY_THRESHOLD,
                        ),
                    )
                )
                .order_by(dish_sim_expr.desc())
                .limit(1)
            )
            existing_dish = (await session.execute(dish_stmt)).scalar_one_or_none()

            inferred_diet = DietaryInferenceEngine.infer(
                name=c_dish.name,
                description=c_dish.description,
                category=c_dish.category,
                upstream_flags={
                    "is_vegan": c_dish.is_vegan,
                    "is_vegetarian": c_dish.is_vegetarian,
                    "is_gluten_free": c_dish.is_gluten_free,
                    "is_lactose_free": c_dish.is_lactose_free,
                },
            )
            serialized_choices = [choice.model_dump() for choice in c_dish.choices]
            incoming_price = round(float(c_dish.price), 2)

            if existing_dish is not None:
                prev_price = round(float(existing_dish.price), 2)
                if abs(incoming_price - prev_price) >= 0.01:
                    delta_pct = (
                        ((incoming_price - prev_price) / prev_price) * 100.0
                        if prev_price > 0.0
                        else 0.0
                    )
                    price_record = DishPriceHistory(
                        dish_id=existing_dish.id,
                        previous_price=Decimal(f"{prev_price:.2f}"),
                        new_price=Decimal(f"{incoming_price:.2f}"),
                        delta_percentage=Decimal(f"{delta_pct:.3f}"),
                    )
                    session.add(price_record)
                    existing_dish.price = incoming_price
                    existing_dish.last_price_delta_pct = Decimal(f"{delta_pct:.3f}")
                    counters["prices_mutated"] += 1
                    logger.info(
                        f"[PriceHistory] Prato '{existing_dish.name}' mutou preço: "
                        f"R$ {prev_price:.2f} -> R$ {incoming_price:.2f} ({delta_pct:+.2f}%)."
                    )

                if c_dish.description:
                    existing_dish.description = c_dish.description
                if c_dish.image_url:
                    existing_dish.image_url = c_dish.image_url
                if serialized_choices:
                    existing_dish.smart_defaults = serialized_choices
                existing_dish.ingestion_hash = dish_hash
                existing_dish.raw_source = canonical.source_platform
                existing_dish.is_vegan = inferred_diet["is_vegan"]
                existing_dish.is_vegetarian = inferred_diet["is_vegetarian"]
                existing_dish.is_gluten_free = inferred_diet["is_gluten_free"]
                existing_dish.is_lactose_free = inferred_diet["is_lactose_free"]
            else:
                embed_text = (
                    f"{c_dish.name} {c_dish.description or ''} "
                    f"{c_dish.category} {target_restaurant.neighborhood}"
                )
                embedding_vec = generate_local_embedding(embed_text, dimension=settings.EMBEDDING_DIMENSION)

                new_dish = Dish(
                    restaurant_id=restaurant_id,
                    name=c_dish.name,
                    description=c_dish.description or "",
                    price=incoming_price,
                    category=c_dish.category or "Geral",
                    image_url=c_dish.image_url,
                    is_vegan=inferred_diet["is_vegan"],
                    is_vegetarian=inferred_diet["is_vegetarian"],
                    is_gluten_free=inferred_diet["is_gluten_free"],
                    is_lactose_free=inferred_diet["is_lactose_free"],
                    allergens=[],
                    smart_defaults=serialized_choices,
                    is_available=False,
                    requires_moderation=True,
                    raw_source=canonical.source_platform,
                    ingestion_hash=dish_hash,
                    embedding=embedding_vec,
                )
                session.add(new_dish)
                counters["dishes_quarantined"] += 1

        await session.flush()

        # 5. Deduplicação Estrita de Avaliações (SHA-256 + PostgreSQL ON CONFLICT DO NOTHING)
        for p_rev in prepared_reviews:
            rev_hash = hashlib.sha256(
                f"{restaurant_id}:{p_rev['author_hash']}:{p_rev['review_date'].isoformat()}".encode("utf-8")
            ).hexdigest()
            deterministic_uuid = uuid.UUID(bytes=bytes.fromhex(rev_hash[:32]))

            insert_rev_stmt = (
                pg_insert(Review)
                .values(
                    id=deterministic_uuid,
                    restaurant_id=restaurant_id,
                    ingestion_hash=rev_hash,
                    source_platform=p_rev["source_platform"],
                    author_hash=p_rev["author_hash"],
                    original_rating=p_rev["original_rating"],
                    comment_text=p_rev["comment_text"],
                    review_date=p_rev["review_date"],
                    is_fraudulent=p_rev["is_fraudulent"],
                    fraud_confidence_score=p_rev["fraud_confidence_score"],
                    time_decay_weight=p_rev["time_decay_weight"],
                    effective_rating=p_rev["effective_rating"],
                )
                .on_conflict_do_nothing()
            )
            await session.execute(insert_rev_stmt)

        # 6. Recálculo Auditado das Médias do Restaurante (Expurgando Fraudes)
        valid_reviews_stmt = select(Review).where(
            and_(
                Review.restaurant_id == restaurant_id,
                Review.is_fraudulent.is_(False),
            )
        )
        audited_reviews = (await session.execute(valid_reviews_stmt)).scalars().all()
        if audited_reviews:
            raw_avg = sum(r.original_rating for r in audited_reviews) / len(audited_reviews)
            total_w = sum(r.time_decay_weight for r in audited_reviews)
            decayed_avg = (
                sum(r.effective_rating for r in audited_reviews) / total_w
                if total_w > 0.0
                else raw_avg
            )
            target_restaurant.rating_average = round(raw_avg, 2)
            target_restaurant.decayed_rating_average = round(decayed_avg, 2)
            target_restaurant.total_reviews = len(audited_reviews)
            target_restaurant.review_count = len(audited_reviews)
            v_cnt = float(len(audited_reviews))
            target_restaurant.bayesian_rating = round(
                ((v_cnt / (v_cnt + 10.0)) * raw_avg) + ((10.0 / (v_cnt + 10.0)) * 4.20),
                2,
            )
        target_restaurant.last_scraped_at = now_utc

        await session.flush()
        return counters

    async def commit_to_staging_db(
        self,
        records: List[Union[CanonicalRestaurant, Dict[str, Any]]],
        session: Optional[AsyncSession] = None,
    ) -> Dict[str, int]:
        """
        Persiste lotes de `CanonicalRestaurant` com isolamento ACID por estabelecimento:
        Se a inserção de um restaurante ou qualquer prato/review dependente falhar,
        o rollback atômico (`session.begin()` / savepoint) impede órfãos ou corrupção.
        """
        totals = {
            "restaurants_discovered": 0,
            "restaurants_updated": 0,
            "dishes_quarantined": 0,
            "prices_mutated": 0,
            "errors_count": 0,
        }

        owns_session = session is None
        active_session = AsyncSessionLocal() if owns_session else session
        assert active_session is not None

        try:
            for raw_item in records:
                try:
                    canonical = self._coerce_canonical_restaurant(raw_item)
                    if active_session.in_transaction():
                        async with active_session.begin_nested():
                            delta = await self._ingest_single_restaurant_tx(active_session, canonical)
                    else:
                        async with active_session.begin():
                            delta = await self._ingest_single_restaurant_tx(active_session, canonical)

                    for k, v in delta.items():
                        totals[k] += v
                        if v > 0:
                            await self._safe_redis_increment(k, v)

                except LGPDSecurityViolationError as lgpd_err:
                    totals["errors_count"] += 1
                    await self._safe_redis_increment("errors_count", 1)
                    logger.critical(f"[LGPD FATAL GUARD] Transação abortada preventivamente: {lgpd_err}")
                    raise
                except Exception as item_err:
                    totals["errors_count"] += 1
                    await self._safe_redis_increment("errors_count", 1)
                    logger.error(f"[ACID Rollback] Falha isolada ao ingerir estabelecimento: {item_err}")

            if not owns_session and active_session.in_transaction():
                await active_session.commit()
        finally:
            if owns_session:
                await active_session.close()

        logger.info(
            f"[DB Staging] Resumo ACID -> Novos Restaurantes: {totals['restaurants_discovered']} | "
            f"Atualizados: {totals['restaurants_updated']} | "
            f"Pratos em Quarentena: {totals['dishes_quarantined']} | "
            f"Preços Mutados: {totals['prices_mutated']} | Erros: {totals['errors_count']}"
        )
        return totals

    async def run_distributed_harvest_job(
        self,
        job_id: str,
        target_neighborhood: Optional[str] = None,
        force: bool = False,
        max_zones_per_run: int = 53,
        allow_live_network: bool = False,
    ) -> Dict[str, Any]:
        """
        Orquestra o ciclo completo distribuído via `ScraperRedisCoordinator`:
        - Inicializa fila dos 53 bairros caso vazia;
        - Respeita checkpoints TTL 24h (86400s) e flag de parada cooperativa (`/stop`);
        - Em falha total de conectividade da zona, realoca no fim da fila sem gravar checkpoint.
        """
        await self.redis_coordinator.initialize_telemetry(job_id=job_id, reset_counters=False)
        all_slugs = list(CARAGUA_53_NEIGHBORHOODS.keys())
        await self.redis_coordinator.ensure_queue_populated(all_slugs, force_reset=False)

        if target_neighborhood:
            target_slug, _, _, _ = resolve_caragua_neighborhood(target_neighborhood)
            if force:
                await self.redis_coordinator.clear_checkpoint(target_slug)
            await self.redis_coordinator.enqueue_priority_neighborhood(target_slug)
            max_zones_per_run = 1

        processed_zones: List[str] = []
        aggregated = {
            "restaurants_discovered": 0,
            "restaurants_updated": 0,
            "dishes_quarantined": 0,
            "prices_mutated": 0,
            "errors_count": 0,
        }

        for _ in range(max_zones_per_run):
            if await self.redis_coordinator.is_stop_requested():
                logger.warning(f"[Job {job_id}] Sinal de parada detectado no Redis. Encerrando graciosamente.")
                await self.redis_coordinator.update_runtime_state(
                    status="stopped", current_neighborhood=""
                )
                return {
                    "job_id": job_id,
                    "status": "stopped",
                    "processed_zones": processed_zones,
                    "metrics": aggregated,
                }

            next_slug = await self.redis_coordinator.pop_next_eligible_neighborhood(force=force)
            if next_slug is None:
                break

            await self.redis_coordinator.update_runtime_state(
                status="running",
                current_neighborhood=next_slug,
            )

            try:
                canonical_batch = await self.harvest_zone(
                    neighborhood_name=next_slug,
                    allow_live_network=allow_live_network,
                )
                if not canonical_batch:
                    await self.redis_coordinator.requeue_at_tail(next_slug)
                    continue

                zone_metrics = await self.commit_to_staging_db(canonical_batch)
                for key in aggregated:
                    aggregated[key] += zone_metrics.get(key, 0)

                await self.redis_coordinator.mark_checkpoint(
                    neighborhood_slug=next_slug,
                    metadata={
                        "job_id": job_id,
                        "restaurants_processed": len(canonical_batch),
                        "dishes_quarantined": zone_metrics["dishes_quarantined"],
                    },
                )
                processed_zones.append(next_slug)

            except Exception as zone_err:
                logger.error(f"[Job {job_id}] Falha crítica na zona '{next_slug}': {zone_err}")
                aggregated["errors_count"] += 1
                await self._safe_redis_increment("errors_count", 1)
                await self.redis_coordinator.requeue_at_tail(next_slug)

        await self.redis_coordinator.update_runtime_state(
            status="idle",
            current_neighborhood="",
        )
        return {
            "job_id": job_id,
            "status": "completed",
            "processed_zones": processed_zones,
            "metrics": aggregated,
        }

    async def scrape_litoral_norte(self, target_city: str = "Caraguatatuba") -> List[Dict[str, Any]]:
        """
        Interface compatível para inspeção estruturada e baterias de validação offline:
        Executa `harvest_zone` sobre os payloads/snapshots reais em disco, aplica
        sanitização LGPD, detecção de fraudes e decaimento exponencial de 30 dias.
        """
        canonical_list = await self.harvest_zone(
            neighborhood_name=target_city,
            allow_live_network=False,
        )
        serialized: List[Dict[str, Any]] = []
        decay_lambda = math.log(2.0) / 30.0
        now_utc = datetime.now(timezone.utc)

        for item in canonical_list:
            _, canonical_neigh, lat, lon = resolve_caragua_neighborhood(
                item.neighborhood, item.latitude, item.longitude
            )
            processed_reviews: List[Dict[str, Any]] = []
            for rev in item.reviews:
                author_hash = self.sanitizer.anonymize_author(rev.raw_author)
                clean_comment = self.sanitizer.sanitize_text(rev.comment or "")
                self.sanitizer.assert_lgpd_compliant(author_hash, clean_comment)
                is_fraud, fraud_conf = self.fraud_detector.predict_fraud(clean_comment or "", rev.rating)
                rev_ts = rev.timestamp if rev.timestamp.tzinfo else rev.timestamp.replace(tzinfo=timezone.utc)
                days_old = max(0.0, (now_utc - rev_ts).total_seconds() / 86400.0)
                decay_w = round(math.exp(-decay_lambda * days_old), 4)
                processed_reviews.append(
                    {
                        "author_hash": author_hash,
                        "original_rating": float(rev.rating),
                        "effective_rating": round(float(rev.rating) * decay_w, 2),
                        "decay_weight": decay_w,
                        "comment_text": clean_comment,
                        "is_fraudulent": is_fraud,
                        "fraud_confidence_score": fraud_conf,
                        "review_date": rev_ts.isoformat(),
                    }
                )

            valid_revs = [r for r in processed_reviews if not r["is_fraudulent"]]
            raw_avg = (
                sum(r["original_rating"] for r in valid_revs) / len(valid_revs)
                if valid_revs
                else item.rating
            )
            weight_sum = sum(r["decay_weight"] for r in valid_revs)
            decayed_avg = (
                sum(r["effective_rating"] for r in valid_revs) / weight_sum
                if weight_sum > 0.0
                else raw_avg
            )

            serialized.append(
                {
                    "name": item.name,
                    "slug": item.slug,
                    "neighborhood": canonical_neigh,
                    "address": item.street,
                    "city": "Caraguatatuba",
                    "state": "SP",
                    "latitude": lat,
                    "longitude": lon,
                    "cuisine_types": item.cuisine_types,
                    "price_level": item.price_level,
                    "rating_average": round(raw_avg, 2),
                    "decayed_rating_average": round(decayed_avg, 2),
                    "total_reviews": len(valid_revs),
                    "source_platform": item.source_platform,
                    "dishes": [d.model_dump() for d in item.dishes],
                    "reviews": processed_reviews,
                }
            )
        return serialized


FoodScraperEngine = AutonomousScrapingEngine
scraper_engine = AutonomousScrapingEngine(headless=settings.SCRAPER_HEADLESS)


if __name__ == "__main__":
    async def _cli_main() -> None:
        job_uuid = f"cli-{uuid.uuid4().hex[:8]}"
        result = await scraper_engine.run_distributed_harvest_job(
            job_id=job_uuid,
            force=False,
            max_zones_per_run=5,
            allow_live_network=False,
        )
        print(json.dumps(result, ensure_ascii=False, indent=2))

    asyncio.run(_cli_main())
