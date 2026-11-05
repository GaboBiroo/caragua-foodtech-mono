"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — BUSCA DIRETA DE PRATOS NO MARKETPLACE
==============================================================================
Expõe `GET /api/v1/dishes/search` integrando SVL-RRF + filtros de Segurança Alimentar.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session
from app.services.rag_engine import hybrid_rag_engine

router = APIRouter(prefix="/dishes", tags=["Catálogo de Pratos & Busca Híbrida"])


@router.get(
    "/search",
    summary="Busca Híbrida SVL-RRF de Pratos Aprovados no Marketplace",
)
async def search_marketplace_dishes(
    q: str = Query(default="pratos em destaque", description="Termo de busca semântica/léxica"),
    neighborhood: Optional[str] = Query(default=None),
    is_vegan: bool = Query(default=False),
    is_vegetarian: bool = Query(default=False),
    is_gluten_free: bool = Query(default=False),
    is_lactose_free: bool = Query(default=False),
    max_price: Optional[float] = Query(default=None, gt=0),
    lat: float = Query(default=-23.6204),
    lon: float = Query(default=-45.4132),
    limit: int = Query(default=12, ge=1, le=50),
    session: AsyncSession = Depends(get_async_session),
) -> List[Dict[str, Any]]:
    dietary = {
        "is_vegan": is_vegan,
        "is_vegetarian": is_vegetarian,
        "is_gluten_free": is_gluten_free,
        "is_lactose_free": is_lactose_free,
    }
    return await hybrid_rag_engine.retrieve_svl_rrf(
        session=session,
        query_text=q,
        user_lat=lat,
        user_lon=lon,
        neighborhood=neighborhood,
        max_price=max_price,
        dietary_filters=dietary if any(dietary.values()) else None,
        limit=limit,
    )
