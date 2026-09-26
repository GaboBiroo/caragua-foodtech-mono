import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import h3
import geohash2

from app.api.dependencies import get_async_session
from app.db.models.restaurant import Restaurant
from app.db.models.dish import Dish
from app.db.models.review import Review
from app.schemas.restaurant import RestaurantOutSchema, DishOutSchema

router = APIRouter(prefix="/restaurants", tags=["Restaurantes"])

class CreateRestaurantSchema(BaseModel):
    name: str = Field(..., example="Restaurante O Pescador")
    slug: str = Field(..., example="restaurante-o-pescador")
    cnpj: Optional[str] = Field(None, example="12.345.678/0001-90")
    phone: Optional[str] = Field(None, example="(12) 3882-0000")
    address: str = Field(..., example="Av. Dr. Arthur Costa Filho, 1234")
    neighborhood: str = Field(..., example="Centro")
    city: str = Field(default="Caraguatatuba")
    state: str = Field(default="SP")
    latitude: float = Field(..., example=-23.6226)
    longitude: float = Field(..., example=-45.4124)
    price_level: int = Field(default=2, ge=1, le=4)
    cuisine_types: List[str] = Field(default_factory=lambda: ["Frutos do Mar", "Caiçara"])

@router.get("", response_model=List[RestaurantOutSchema], summary="Listagem de Restaurantes em Caraguatatuba")
async def list_restaurants(
    neighborhood: Optional[str] = Query(None, description="Filtro por bairro (ex: Martin de Sá, Centro)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session)
):
    stmt = select(Restaurant).where(Restaurant.is_active.is_(True))
    if neighborhood:
        stmt = stmt.where(func.lower(Restaurant.neighborhood) == neighborhood.lower())
    stmt = stmt.order_by(Restaurant.decayed_rating_average.desc()).offset(skip).limit(limit)

    result = await session.execute(stmt)
    return result.scalars().all()

@router.get("/{restaurant_id}", response_model=RestaurantOutSchema, summary="Detalhes de um Restaurante")
async def get_restaurant(restaurant_id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    stmt = select(Restaurant).where(Restaurant.id == restaurant_id)
    result = await session.execute(stmt)
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurante não encontrado.")
    return restaurant

@router.post("", status_code=status.HTTP_201_CREATED, summary="Cadastro de Novo Restaurante com Índices Espaciais")
async def create_restaurant(
    payload: CreateRestaurantSchema,
    session: AsyncSession = Depends(get_async_session)
):
    # Gera a Geometria nativa PostGIS POINT(lng, lat) no SRID 4326
    point = Point(payload.longitude, payload.latitude)
    geom_wkb = from_shape(point, srid=4326)

    # Gera os índices discretos H3 e Geohash para indexação rápida
    h3_8 = h3.geo_to_h3(payload.latitude, payload.longitude, resolution=8)
    h3_9 = h3.geo_to_h3(payload.latitude, payload.longitude, resolution=9)
    gh = geohash2.encode(payload.latitude, payload.longitude, precision=9)

    new_restaurant = Restaurant(
        name=payload.name,
        slug=payload.slug,
        cnpj=payload.cnpj,
        phone=payload.phone,
        address=payload.address,
        neighborhood=payload.neighborhood,
        city=payload.city,
        state=payload.state,
        latitude=payload.latitude,
        longitude=payload.longitude,
        geom=geom_wkb,
        h3_res8=h3_8,
        h3_res9=h3_9,
        geohash=gh,
        price_level=payload.price_level,
        cuisine_types=payload.cuisine_types,
        is_active=True
    )

    session.add(new_restaurant)
    await session.commit()
    await session.refresh(new_restaurant)
    return {"status": "created", "id": str(new_restaurant.id), "h3_index": h3_8, "geohash": gh}
