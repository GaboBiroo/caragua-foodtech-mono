"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A2.3: ROTAS DE CHAT CONVERSACIONAL & SVL-RRF
==============================================================================
Expõe:
- POST /api/v1/chat/query   -> Resposta JSON síncrona completa + cards SVL-RRF
- POST /api/v1/chat/stream  -> StreamingResponse SSE (`text/event-stream`)
- POST /api/v1/chat/reindex -> Dispara `VectorIndexingService.sync_pending_embeddings`
"""

from __future__ import annotations

import time
from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_async_session
from app.db.models.dish import Dish
from app.services.rag_engine import hybrid_rag_engine
from app.services.vector_indexer import vector_indexing_service

router = APIRouter(prefix="/chat", tags=["Assistente IA Hiperlocal & RAG SVL-RRF"])


class ChatQueryRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=2,
        example="Quais opções veganas ou sem glúten estão disponíveis hoje até R$ 60?",
    )
    user_lat: float = Field(default=-23.6204, description="Latitude do usuário em Caraguatatuba")
    user_lon: float = Field(default=-45.4132, description="Longitude do usuário em Caraguatatuba")
    neighborhood: Optional[str] = Field(default=None, description="Bairro opcional entre os 53 oficiais")
    max_price: Optional[float] = Field(default=None, gt=0)
    dietary_filters: Optional[Dict[str, bool]] = Field(default=None)
    limit: int = Field(default=8, ge=1, le=20)
    use_llm: bool = Field(
        default=False,
        description="Se True, sintetiza resposta via Ollama local também no endpoint síncrono.",
    )


class ReindexRequest(BaseModel):
    batch_size: int = Field(default=200, ge=1, le=1000)


@router.get(
    "/llm-status",
    summary="Verificar Status do Motor LLM Local (Ollama) na Máquina do Usuário",
)
async def get_local_llm_status() -> Dict[str, Any]:
    model_name = await hybrid_rag_engine.ensure_ollama_ready(warmup=False)
    info = hybrid_rag_engine.active_llm_info
    return {
        "status": "online" if model_name else "fallback",
        **info,
    }


@router.post(
    "/query",
    summary="Consulta Híbrida SVL-RRF Síncrona com Resposta Fundamentada",
)
async def chat_query_sync(
    payload: ChatQueryRequest,
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    t0 = time.perf_counter()
    intent = hybrid_rag_engine.extract_implicit_intent(
        query_text=payload.query,
        user_lat=payload.user_lat,
        user_lon=payload.user_lon,
        neighborhood=payload.neighborhood,
        max_price=payload.max_price,
        dietary_filters=payload.dietary_filters,
    )
    recommendations = await hybrid_rag_engine.retrieve_svl_rrf(
        session=session,
        query_text=payload.query,
        user_lat=payload.user_lat,
        user_lon=payload.user_lon,
        neighborhood=payload.neighborhood,
        max_price=payload.max_price,
        dietary_filters=payload.dietary_filters,
        limit=payload.limit,
    )
    llm_answer = (
        await hybrid_rag_engine.generate_ollama_sync(payload.query, intent, recommendations)
        if payload.use_llm
        else None
    )
    answer = llm_answer or hybrid_rag_engine.synthesize_grounded_narrative(
        query_text=payload.query,
        intent=intent,
        recommendations=recommendations,
    )
    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    return {
        "status": "ok",
        "query": payload.query,
        "intent": intent,
        "candidates_count": len(recommendations),
        "latency_ms": latency_ms,
        "embedding_provider": vector_indexing_service.active_provider,
        "answer": answer,
        "recommendations": recommendations,
    }


@router.post(
    "/stream",
    summary="Streaming SSE em Tempo Real do Assistente Gastronômico SVL-RRF",
)
async def chat_query_stream(
    payload: ChatQueryRequest,
    session: AsyncSession = Depends(get_async_session),
) -> StreamingResponse:
    generator = hybrid_rag_engine.stream_conversational_response(
        session=session,
        query_text=payload.query,
        user_lat=payload.user_lat,
        user_lon=payload.user_lon,
        neighborhood=payload.neighborhood,
        max_price=payload.max_price,
        dietary_filters=payload.dietary_filters,
        limit=payload.limit,
    )
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/reindex",
    summary="Sincronizar Incrementalmente os Vetores 1536d dos Pratos no pgvector",
)
async def reindex_pending_embeddings(
    payload: Optional[ReindexRequest] = Body(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> Dict[str, Any]:
    req = payload or ReindexRequest()
    t0 = time.perf_counter()
    indexed_count = await vector_indexing_service.sync_pending_embeddings(
        session=session,
        batch_size=req.batch_size,
    )
    ready_stmt = select(func.count(Dish.id)).where(
        and_(
            Dish.is_available.is_(True),
            Dish.requires_moderation.is_(False),
            Dish.embedding.is_not(None),
        )
    )
    total_ready = int((await session.execute(ready_stmt)).scalar() or 0)
    elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    return {
        "status": "ok",
        "indexed_now": indexed_count,
        "marketplace_rag_ready_dishes": total_ready,
        "provider": vector_indexing_service.active_provider,
        "elapsed_ms": elapsed_ms,
    }
