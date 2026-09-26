from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_async_session
from app.services.rag_pipeline import RAGPipelineService

router = APIRouter(prefix="/search", tags=["Busca & Pipeline RAG"])

class RAGSearchRequest(BaseModel):
    query: str = Field(..., example="Quero um restaurante com frutos do mar ou peixe fresco perto da praia Martin de Sá")
    latitude: float = Field(default=-23.6226, description="Latitude do usuário em Caraguatatuba")
    longitude: float = Field(default=-45.4124, description="Longitude do usuário em Caraguatatuba")
    is_celiac: bool = Field(default=False, description="Restrição severa a glúten")
    is_vegan: bool = Field(default=False, description="Restrição a produtos de origem animal")
    banned_allergens: List[str] = Field(default_factory=list, description="Lista de ingredientes proibidos")

@router.post("/rag", summary="Execução do Pipeline RAG de 5 Estágios com Streaming SSE")
async def rag_search_streaming(
    request: RAGSearchRequest,
    session: AsyncSession = Depends(get_async_session)
):
    """
    Endpoint principal de recomendação inteligente:
    Executa os 5 estágios do RAG e transmite os tokens de resposta em tempo real
    usando Server-Sent Events (SSE).
    """
    service = RAGPipelineService(session=session)
    user_profile = {
        "is_celiac": request.is_celiac,
        "is_vegan": request.is_vegan,
        "allergens": request.banned_allergens
    }

    async def event_generator():
        async for token in service.execute_rag(
            user_query=request.query,
            user_lat=request.latitude,
            user_lng=request.longitude,
            user_profile=user_profile
        ):
            # Formato de evento SSE (Server-Sent Events)
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/hybrid", summary="Busca Híbrida Determinística Direta (PostGIS + pgvector)")
async def hybrid_search_direct(
    request: RAGSearchRequest,
    limit: int = Query(default=5, ge=1, le=20),
    session: AsyncSession = Depends(get_async_session)
):
    """
    Retorna os dados brutos recuperados no Estágio 3 (PostGIS + pgvector)
    sem síntese retórica pela LLM, ideal para visualização rápida no catálogo ou mapa.
    """
    service = RAGPipelineService(session=session)
    from app.core.llm_manager import llm_manager
    from app.schemas.intent import ExtractedIntentSchema

    # Extração de intenção simplificada
    intent = await llm_manager.extract_intent(request.query)
    if request.is_celiac: intent.is_gluten_free = True
    if request.is_vegan: intent.is_vegan = True
    intent.banned_allergens.extend(request.banned_allergens)

    query_vector = await llm_manager.get_embedding(intent.semantic_query)
    results = await service.hybrid_search(
        intent=intent,
        query_vector=query_vector,
        user_lat=request.latitude,
        user_lng=request.longitude,
        limit=limit
    )

    # Serialização limpa dos resultados
    output = []
    for item in results:
        rest = item["restaurant"]
        output.append({
            "id": str(rest.id),
            "name": rest.name,
            "neighborhood": rest.neighborhood,
            "distance_meters": item["distance_meters"],
            "rating_average": rest.rating_average,
            "decayed_rating_average": rest.decayed_rating_average,
            "total_reviews": rest.total_reviews,
            "cuisine_types": rest.cuisine_types,
            "matched_dishes": item["matched_dishes"],
            "recent_reviews": item["recent_reviews"]
        })

    return {
        "status": "success",
        "intent_extracted": intent.model_dump(),
        "total_results": len(output),
        "results": output
    }
