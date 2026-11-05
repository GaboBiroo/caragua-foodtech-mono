"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A3.1: API REST DE MODERAÇÃO E TELEMETRIA
==============================================================================
Endpoints Operacionais, Quarentena e Auditoria Inflacionária (/api/v1/moderation):
- GET  /pending-promotions          -> Lista pratos em quarentena com tags dietéticas
- POST /dishes/{dish_id}/approve    -> Aprova prato, aciona triggers SQL e indexa 1536d
- POST /dishes/{dish_id}/reject     -> Rejeita/arquiva prato com `moderation_notes`
- POST /dishes/batch-approve        -> Aprova múltiplos pratos em transação ACID + lote 1536d
- GET  /dishes/{dish_id}/price-history -> Série temporal `detected_at ASC` para Sparkline
- GET  /price-drops                 -> Radar de mutações de preço com série histórica
- POST /scraper/trigger             -> Dispara varredura por bairro ou lote (`batch_count`)
- GET  /scraper/status              -> Estado Redis (53 bairros, checkpoints) + contadores DB
- POST /scraper/stop                -> Parada cooperativa imediata no Redis
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Body, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session
from app.db.models.dish import Dish, DishPriceHistory
from app.db.models.restaurant import Restaurant
from app.db.models.review import Review
from app.services.vector_indexer import vector_indexing_service
from app.workers.nightly_batch import nightly_batch_orchestrator
from app.workers.scraper_engine import (
    CARAGUA_53_NEIGHBORHOODS,
    resolve_caragua_neighborhood,
    scraper_engine,
)
from app.workers.scraper_redis import scraper_redis_coordinator

audit_logger = logging.getLogger("moderation_audit")
audit_logger.setLevel(logging.INFO)

router = APIRouter(prefix="/moderation", tags=["Moderação e Operação do Scraper"])


class ScraperTriggerRequest(BaseModel):
    neighborhood: Optional[str] = Field(
        default=None,
        description="Nome ou slug de um dos 53 bairros de Caraguatatuba (opcional).",
    )
    force: bool = Field(
        default=False,
        description="Ignora o checkpoint de 24h caso o bairro já tenha sido processado.",
    )
    batch_count: int = Field(
        default=5,
        ge=1,
        le=53,
        description="Quantidade de bairros processados no lote.",
    )
    max_zones: Optional[int] = Field(
        default=None,
        ge=1,
        le=53,
        description="Alias retrocompatível para batch_count.",
    )
    allow_live_network: bool = Field(
        default=False,
        description="Aciona navegação Playwright ao vivo caso desejado.",
    )
    auto_approve_trusted: bool = Field(
        default=False,
        description="Se True, aplica auto-promoção segura após coleta em lote.",
    )


class ScraperTriggerResponse(BaseModel):
    job_id: str
    status: str
    target_neighborhood: Optional[str]
    batch_count: int
    force: bool
    queued_at: str


class DishRejectRequest(BaseModel):
    reason: str = Field(
        default="Inconsistência cadastral ou violação de curadoria técnica.",
        min_length=3,
        max_length=500,
    )
    archive_permanently: bool = Field(
        default=False,
        description="Se True, remove definitivamente o item da tabela dishes.",
    )


class BatchApproveRequest(BaseModel):
    dish_ids: Optional[List[uuid.UUID]] = Field(
        default=None,
        description="Lista explícita de UUIDs de pratos para aprovação atômica.",
    )
    neighborhood: Optional[str] = Field(
        default=None,
        description="Se informado sem dish_ids, aprova todos os pendentes deste bairro.",
    )
    approve_all_pending: bool = Field(
        default=False,
        description="Se True e sem dish_ids, aprova todos os itens atualmente na fila de quarentena.",
    )


async def _execute_trigger_workflow(
    job_id: str,
    neighborhood: Optional[str],
    force: bool,
    zones_limit: int,
    allow_live_network: bool,
    auto_approve_trusted: bool,
) -> None:
    if neighborhood:
        await scraper_engine.run_distributed_harvest_job(
            job_id=job_id,
            target_neighborhood=neighborhood,
            force=force,
            max_zones_per_run=1,
            allow_live_network=allow_live_network,
        )
    else:
        await nightly_batch_orchestrator.run_full_municipality_harvest(
            max_neighborhoods=zones_limit,
            auto_approve_trusted=auto_approve_trusted,
            force_reharvest=force,
        )


@router.post(
    "/scraper/trigger",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ScraperTriggerResponse,
    summary="Disparar Varredura Autônoma por Bairro ou em Lote",
)
@router.post(
    "/scraper/run",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ScraperTriggerResponse,
    summary="Executar Busca de Cardápios Atualizados por Bairro ou em Lote",
)
async def trigger_scraper_job(
    background_tasks: BackgroundTasks,
    payload: Optional[ScraperTriggerRequest] = Body(default=None),
) -> ScraperTriggerResponse:
    req = payload or ScraperTriggerRequest()
    zones_limit = req.max_zones if req.max_zones is not None else req.batch_count
    job_id = f"harvest-{uuid.uuid4().hex[:12]}"
    queued_at = datetime.now(timezone.utc).isoformat()

    audit_logger.info(
        json.dumps(
            {
                "audit_event": "SCRAPER_TRIGGERED",
                "job_id": job_id,
                "neighborhood": req.neighborhood,
                "batch_count": zones_limit,
                "force": req.force,
                "timestamp": queued_at,
            },
            ensure_ascii=False,
        )
    )

    background_tasks.add_task(
        _execute_trigger_workflow,
        job_id=job_id,
        neighborhood=req.neighborhood,
        force=req.force,
        zones_limit=zones_limit,
        allow_live_network=req.allow_live_network,
        auto_approve_trusted=req.auto_approve_trusted,
    )

    return ScraperTriggerResponse(
        job_id=job_id,
        status="accepted",
        target_neighborhood=req.neighborhood,
        batch_count=zones_limit,
        force=req.force,
        queued_at=queued_at,
    )


@router.get(
    "/scraper/status",
    summary="Consultar Estado Completo da Fila dos 53 Bairros, Checkpoints, PostgreSQL e Telemetria",
)
async def get_scraper_status(
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    await scraper_redis_coordinator.ensure_queue_populated(
        list(CARAGUA_53_NEIGHBORHOODS.keys()),
        force_reset=False,
    )
    redis_status = await scraper_redis_coordinator.get_full_status()

    quarantine_stmt = select(func.count(Dish.id)).where(
        and_(
            Dish.requires_moderation.is_(True),
            Dish.rejection_reason.is_(None),
        )
    )
    approved_stmt = select(func.count(Dish.id)).where(
        and_(
            Dish.is_available.is_(True),
            Dish.requires_moderation.is_(False),
        )
    )
    indexed_stmt = select(func.count(Dish.id)).where(
        and_(
            Dish.is_available.is_(True),
            Dish.requires_moderation.is_(False),
            Dish.embedding.is_not(None),
            Dish.needs_reindexing.is_(False),
        )
    )
    rest_stmt = select(func.count(Restaurant.id)).where(Restaurant.is_active.is_(True))
    price_hist_stmt = select(func.count(DishPriceHistory.id))
    price_drop_stmt = select(func.count(DishPriceHistory.id)).where(
        DishPriceHistory.delta_percentage < 0
    )
    reviews_stmt = select(func.count(Review.id)).where(Review.is_fraudulent.is_(False))

    quarantined_pending = int((await session.execute(quarantine_stmt)).scalar() or 0)
    approved_dishes = int((await session.execute(approved_stmt)).scalar() or 0)
    indexed_vectors = int((await session.execute(indexed_stmt)).scalar() or 0)
    active_restaurants = int((await session.execute(rest_stmt)).scalar() or 0)
    price_mutations_db = int((await session.execute(price_hist_stmt)).scalar() or 0)
    price_drops_db = int((await session.execute(price_drop_stmt)).scalar() or 0)
    sanitized_reviews_db = int((await session.execute(reviews_stmt)).scalar() or 0)

    return {
        **redis_status,
        "cluster_health": {
            "postgres_postgis_pgvector": "online",
            "redis_7_broker": "online"
            if redis_status.get("backend_mode") == "redis_7_distributed"
            else "embedded_fallback",
            "embedding_engine": vector_indexing_service.active_provider,
        },
        "total_official_neighborhoods": len(CARAGUA_53_NEIGHBORHOODS),
        "updated_neighborhoods_count": int(redis_status.get("valid_checkpoints_count", 0)),
        "pending_approval_dishes_db": quarantined_pending,
        "quarantined_dishes_pending_db": quarantined_pending,
        "active_restaurants_db": active_restaurants,
        "approved_dishes_db": approved_dishes,
        "searchable_dishes_db": indexed_vectors,
        "indexed_vectors_1536_db": indexed_vectors,
        "price_mutations_db": price_mutations_db,
        "price_drops_db": price_drops_db,
        "verified_reviews_db": sanitized_reviews_db,
        "sanitized_reviews_db": sanitized_reviews_db,
        "system_online": True,
        "queried_at": datetime.now(timezone.utc).isoformat(),
    }


@router.post(
    "/scraper/stop",
    summary="Solicitar Interrupção Cooperativa Imediata no Redis",
)
async def stop_scraper_job() -> Dict[str, Any]:
    await scraper_redis_coordinator.request_stop()
    stopped_at = datetime.now(timezone.utc).isoformat()
    audit_logger.warning(
        json.dumps(
            {
                "audit_event": "SCRAPER_STOP_REQUESTED",
                "timestamp": stopped_at,
            },
            ensure_ascii=False,
        )
    )
    return {
        "status": "stop_requested",
        "requested_at": stopped_at,
    }


@router.get(
    "/pending-promotions",
    summary="Listar Pratos em Quarentena Capturados pelo Scraper",
)
async def list_pending_promotions(
    neighborhood: Optional[str] = Query(default=None),
    include_reviewed: bool = Query(default=False),
    limit: int = Query(default=150, ge=1, le=500),
    session: AsyncSession = Depends(get_async_session),
) -> List[Dict[str, Any]]:
    stmt = select(
        Dish,
        Restaurant.name.label("restaurant_name"),
        Restaurant.slug.label("restaurant_slug"),
        Restaurant.neighborhood,
    ).join(Restaurant, Dish.restaurant_id == Restaurant.id)

    if not include_reviewed:
        stmt = stmt.where(
            and_(
                or_(
                    Dish.requires_moderation.is_(True),
                    Dish.is_available.is_(False),
                ),
                Dish.rejection_reason.is_(None),
            )
        )

    if neighborhood and neighborhood.lower() not in ("todos", "all", ""):
        _, canonical_neigh, _, _ = resolve_caragua_neighborhood(neighborhood)
        stmt = stmt.where(func.lower(Restaurant.neighborhood) == canonical_neigh.lower())

    stmt = stmt.order_by(Dish.requires_moderation.desc(), Dish.created_at.desc()).limit(limit)
    rows = (await session.execute(stmt)).all()

    items: List[Dict[str, Any]] = []
    for dish, rest_name, rest_slug, neigh in rows:
        items.append(
            {
                "id": str(dish.id),
                "restaurant_id": str(dish.restaurant_id),
                "restaurant_name": rest_name,
                "restaurant_slug": rest_slug,
                "neighborhood": neigh,
                "dish_name": dish.name,
                "description": dish.description or "",
                "price": round(float(dish.price), 2),
                "last_price_delta_pct": round(float(dish.last_price_delta_pct or 0.0), 2),
                "category": dish.category,
                "is_vegan": bool(dish.is_vegan),
                "is_vegetarian": bool(dish.is_vegetarian),
                "is_gluten_free": bool(dish.is_gluten_free),
                "is_lactose_free": bool(dish.is_lactose_free),
                "is_available": bool(dish.is_available),
                "requires_moderation": bool(dish.requires_moderation),
                "raw_source": dish.raw_source,
                "ingestion_hash": dish.ingestion_hash,
                "smart_defaults": dish.smart_defaults or [],
                "rejection_reason": dish.rejection_reason,
                "moderation_notes": dish.moderation_notes,
                "created_at": dish.created_at.isoformat() if dish.created_at else None,
            }
        )
    return items


async def _approve_dish_transition(dish_id: uuid.UUID, session: AsyncSession) -> Dict[str, Any]:
    stmt = select(Dish).where(Dish.id == dish_id)
    dish = (await session.execute(stmt)).scalar_one_or_none()
    if dish is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prato não encontrado no catálogo de quarentena.",
        )

    now_utc = datetime.now(timezone.utc)
    dish.is_available = True
    dish.requires_moderation = False
    dish.rejection_reason = None
    dish.moderated_at = now_utc
    dish.moderation_notes = "Aprovado manualmente e indexado em 1536d no catálogo RAG."

    # 1. Flush dispara os triggers SQL (needs_reindexing = True + active_dishes_count + bayesian_rating)
    await session.flush()

    # 2. Indexação vetorial imediata de 1536 dimensões (needs_reindexing -> False)
    indexed_cnt = await vector_indexing_service.index_dishes_by_ids(session, [dish.id])
    await session.commit()

    approved_iso = now_utc.isoformat()
    audit_logger.info(
        json.dumps(
            {
                "audit_event": "DISH_APPROVED_AND_INDEXED",
                "dish_id": str(dish.id),
                "dish_name": dish.name,
                "restaurant_id": str(dish.restaurant_id),
                "indexed_1536": indexed_cnt == 1,
                "timestamp": approved_iso,
            },
            ensure_ascii=False,
        )
    )
    return {
        "status": "approved",
        "dish_id": str(dish.id),
        "dish_name": dish.name,
        "price": round(float(dish.price), 2),
        "is_available": True,
        "requires_moderation": False,
        "vector_1536_indexed": indexed_cnt == 1,
        "approved_at": approved_iso,
    }


@router.post(
    "/dishes/{dish_id}/approve",
    summary="Aprovar Prato em Quarentena e Indexar Imediatamente no Catálogo RAG 1536d",
)
async def approve_quarantined_dish(
    dish_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    return await _approve_dish_transition(dish_id=dish_id, session=session)


@router.patch(
    "/promotions/{dish_id}/approve",
    summary="Alias Retrocompatível de Aprovação de Prato",
)
async def approve_promotion_legacy(
    dish_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    return await _approve_dish_transition(dish_id=dish_id, session=session)


@router.post(
    "/dishes/batch-approve",
    summary="Aprovar Múltiplos Pratos em Lote (Transação ACID Única + Indexação 1536d)",
)
async def batch_approve_dishes(
    payload: Optional[BatchApproveRequest] = Body(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    req = payload or BatchApproveRequest(approve_all_pending=True)

    stmt = select(Dish).join(Restaurant, Dish.restaurant_id == Restaurant.id)
    if req.dish_ids:
        stmt = stmt.where(Dish.id.in_(req.dish_ids))
    elif req.neighborhood:
        _, canonical_neigh, _, _ = resolve_caragua_neighborhood(req.neighborhood)
        stmt = stmt.where(
            and_(
                func.lower(Restaurant.neighborhood) == canonical_neigh.lower(),
                or_(Dish.requires_moderation.is_(True), Dish.is_available.is_(False)),
                Dish.rejection_reason.is_(None),
            )
        )
    else:
        stmt = stmt.where(
            and_(
                or_(Dish.requires_moderation.is_(True), Dish.is_available.is_(False)),
                Dish.rejection_reason.is_(None),
            )
        )

    dishes = list((await session.execute(stmt)).scalars().all())
    if not dishes:
        return {
            "status": "batch_approved",
            "approved_count": 0,
            "searchable_dishes_updated": 0,
            "indexed_vectors_1536": 0,
            "dish_ids": [],
        }

    now_utc = datetime.now(timezone.utc)
    target_ids: List[uuid.UUID] = []
    for d in dishes:
        d.is_available = True
        d.requires_moderation = False
        d.rejection_reason = None
        d.moderated_at = now_utc
        d.moderation_notes = "Aprovado em lote via Command Center ACID."
        target_ids.append(d.id)

    await session.flush()
    indexed_count = await vector_indexing_service.index_dishes_by_ids(session, target_ids)
    await session.commit()

    return {
        "status": "batch_approved",
        "approved_count": len(target_ids),
        "searchable_dishes_updated": indexed_count,
        "indexed_vectors_1536": indexed_count,
        "dish_ids": [str(x) for x in target_ids],
        "approved_at": now_utc.isoformat(),
    }


@router.post(
    "/dishes/{dish_id}/reject",
    summary="Rejeitar ou Arquivar Prato Capturado com Motivo Auditado (`moderation_notes`)",
)
async def reject_quarantined_dish(
    dish_id: uuid.UUID,
    payload: Optional[DishRejectRequest] = Body(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    req = payload or DishRejectRequest()
    stmt = select(Dish).where(Dish.id == dish_id)
    dish = (await session.execute(stmt)).scalar_one_or_none()
    if dish is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prato não encontrado.",
        )

    dish_name = dish.name
    rest_id = str(dish.restaurant_id)
    now_utc = datetime.now(timezone.utc)
    rejected_at = now_utc.isoformat()

    if req.archive_permanently:
        await session.delete(dish)
        final_state = "deleted"
    else:
        dish.is_available = False
        dish.requires_moderation = False
        dish.rejection_reason = req.reason[:255]
        dish.moderation_notes = req.reason
        dish.moderated_at = now_utc
        final_state = "rejected_archived"

    await session.commit()

    audit_logger.info(
        json.dumps(
            {
                "audit_event": "DISH_REJECTED",
                "dish_id": str(dish_id),
                "dish_name": dish_name,
                "restaurant_id": rest_id,
                "reason": req.reason,
                "resolution": final_state,
                "timestamp": rejected_at,
            },
            ensure_ascii=False,
        )
    )
    return {
        "status": final_state,
        "dish_id": str(dish_id),
        "reason": req.reason,
        "moderation_notes": req.reason,
        "is_available": False,
        "requires_moderation": False,
        "rejected_at": rejected_at,
    }


@router.get(
    "/dishes/{dish_id}/price-history",
    summary="Consultar Série Temporal de Preços Ordenada (`detected_at ASC`) para Sparkline",
)
async def get_dish_price_history(
    dish_id: uuid.UUID,
    session: AsyncSession = Depends(get_async_session),
) -> List[Dict[str, Any]]:
    stmt = (
        select(DishPriceHistory)
        .where(DishPriceHistory.dish_id == dish_id)
        .order_by(DishPriceHistory.detected_at.asc())
        .limit(100)
    )
    rows = (await session.execute(stmt)).scalars().all()
    return [
        {
            "id": str(h.id),
            "dish_id": str(h.dish_id),
            "previous_price": float(h.previous_price),
            "new_price": float(h.new_price),
            "delta_percentage": float(h.delta_percentage),
            "detected_at": h.detected_at.isoformat() if h.detected_at else None,
        }
        for h in rows
    ]


@router.get(
    "/price-drops",
    summary="Listar Pratos com Mutações Auditadas de Preço (Promoções Reais e Radar de Inflação)",
)
async def list_audited_price_mutations(
    drops_only: bool = Query(default=False, description="Se True, filtra apenas quedas (delta < 0)."),
    limit: int = Query(default=100, ge=1, le=300),
    session: AsyncSession = Depends(get_async_session),
) -> List[Dict[str, Any]]:
    stmt = (
        select(
            DishPriceHistory,
            Dish.name.label("dish_name"),
            Dish.category.label("dish_category"),
            Dish.price.label("current_price"),
            Dish.is_available,
            Restaurant.name.label("restaurant_name"),
            Restaurant.slug.label("restaurant_slug"),
            Restaurant.neighborhood,
        )
        .join(Dish, DishPriceHistory.dish_id == Dish.id)
        .join(Restaurant, Dish.restaurant_id == Restaurant.id)
    )
    if drops_only:
        stmt = stmt.where(DishPriceHistory.delta_percentage < 0)

    stmt = stmt.order_by(DishPriceHistory.detected_at.asc()).limit(limit * 3)
    rows = (await session.execute(stmt)).all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for hist, d_name, d_cat, curr_price, is_avail, r_name, r_slug, neigh in rows:
        d_id_str = str(hist.dish_id)
        prev_p = float(hist.previous_price)
        new_p = float(hist.new_price)
        delta_p = float(hist.delta_percentage)
        det_iso = hist.detected_at.isoformat() if hist.detected_at else None

        if d_id_str not in grouped:
            grouped[d_id_str] = {
                "dish_id": d_id_str,
                "dish_name": d_name,
                "category": d_cat,
                "is_available": bool(is_avail),
                "restaurant_name": r_name,
                "restaurant_slug": r_slug,
                "neighborhood": neigh,
                "previous_price": prev_p,
                "new_price": new_p,
                "current_price": round(float(curr_price), 2),
                "delta_percentage": round(delta_p, 2),
                "is_price_drop": delta_p < 0,
                "detected_at": det_iso,
                "sparkline_points": [prev_p, new_p],
                "history": [
                    {
                        "previous_price": prev_p,
                        "new_price": new_p,
                        "delta_percentage": round(delta_p, 2),
                        "detected_at": det_iso,
                    }
                ],
            }
        else:
            entry = grouped[d_id_str]
            entry["previous_price"] = prev_p
            entry["new_price"] = new_p
            entry["delta_percentage"] = round(delta_p, 2)
            entry["is_price_drop"] = delta_p < 0
            entry["detected_at"] = det_iso
            entry["sparkline_points"].append(new_p)
            entry["history"].append(
                {
                    "previous_price": prev_p,
                    "new_price": new_p,
                    "delta_percentage": round(delta_p, 2),
                    "detected_at": det_iso,
                }
            )

    results = sorted(
        grouped.values(),
        key=lambda item: (item["delta_percentage"], item["dish_name"]),
    )
    return results[:limit]


@router.get(
    "/rankings",
    summary="Rankings Auditados de Restaurantes com Nota Bayesiana ($W_R$) e Decaimento (30d)",
)
async def get_rankings(
    session: AsyncSession = Depends(get_async_session),
) -> List[Dict[str, Any]]:
    stmt = (
        select(Restaurant)
        .where(Restaurant.is_active.is_(True))
        .order_by(Restaurant.bayesian_rating.desc(), Restaurant.decayed_rating_average.desc())
        .limit(50)
    )
    restaurants = (await session.execute(stmt)).scalars().all()

    return [
        {
            "id": str(rest.id),
            "name": rest.name,
            "slug": rest.slug,
            "neighborhood": rest.neighborhood,
            "bayesian_rating": round(float(rest.bayesian_rating or 4.20), 2),
            "historical_rating": round(float(rest.rating_average or 0.0), 2),
            "decayed_rating": round(float(rest.decayed_rating_average or 0.0), 2),
            "total_reviews": int(max(rest.review_count or 0, rest.total_reviews or 0)),
            "active_dishes_count": int(rest.active_dishes_count or 0),
            "price_level": rest.price_level,
            "cuisine_types": rest.cuisine_types,
            "source_platform": rest.source_platform,
        }
        for rest in restaurants
    ]
