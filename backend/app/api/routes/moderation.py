import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.api.dependencies import get_async_session
from app.db.models.restaurant import Restaurant
from app.db.models.dish import Dish
from app.db.models.review import Review

router = APIRouter(prefix="/moderation", tags=["Moderação e Administração"])

@router.get("/pending-promotions", summary="Promoções e Pratos Capturados no Scraping Noturno")
async def list_pending_promotions(session: AsyncSession = Depends(get_async_session)):
    """
    Retorna os pratos recentemente extraídos da rede que necessitam de validação humana
    dos moderadores antes de serem liberados no catálogo público.
    """
    stmt = (
        select(Dish, Restaurant.name.label("restaurant_name"), Restaurant.neighborhood)
        .join(Restaurant, Dish.restaurant_id == Restaurant.id)
        .order_by(Dish.created_at.desc())
        .limit(50)
    )
    result = await session.execute(stmt)
    rows = result.all()

    items = []
    for dish, rest_name, neighborhood in rows:
        items.append({
            "id": str(dish.id),
            "restaurant_name": rest_name,
            "neighborhood": neighborhood,
            "dish_name": dish.name,
            "description": dish.description,
            "price": dish.price,
            "category": dish.category,
            "is_vegan": dish.is_vegan,
            "is_gluten_free": dish.is_gluten_free,
            "is_available": dish.is_available,
            "created_at": dish.created_at.isoformat() if dish.created_at else None
        })
    return items

@router.patch("/promotions/{dish_id}/approve", summary="Aprovar Prato/Promoção Capturada")
async def approve_promotion(dish_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    stmt = select(Dish).where(Dish.id == dish_id)
    result = await session.execute(stmt)
    dish = result.scalar_one_or_none()
    if not dish:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prato não encontrado.")
    dish.is_available = True
    await session.commit()
    return {"status": "approved", "dish_id": str(dish_id)}

@router.get("/rankings", summary="Rankings de Restaurantes com Comparativo de Decaimento Temporal")
async def get_rankings(session: AsyncSession = Depends(get_async_session)):
    """
    Retorna a tabela de restaurantes com notas brutas vs. notas decaídas pelo tempo,
    além de volume de avaliações suspeitas de fraude expurgadas pelo detector.
    """
    stmt = (
        select(Restaurant)
        .where(Restaurant.is_active.is_(True))
        .order_by(Restaurant.decayed_rating_average.desc())
        .limit(20)
    )
    result = await session.execute(stmt)
    restaurants = result.scalars().all()

    rankings = []
    for rest in restaurants:
        rankings.append({
            "id": str(rest.id),
            "name": rest.name,
            "neighborhood": rest.neighborhood,
            "historical_rating": rest.rating_average,
            "decayed_rating": rest.decayed_rating_average,
            "total_reviews": rest.total_reviews,
            "price_level": rest.price_level,
            "cuisine_types": rest.cuisine_types
        })
    return rankings
