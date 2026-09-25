import uuid
from typing import List, Optional
from pydantic import BaseModel, Field

class DishOutSchema(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    price: float
    category: str
    is_vegan: bool
    is_vegetarian: bool
    is_gluten_free: bool
    is_lactose_free: bool

    class Config:
        from_attributes = True

class RestaurantOutSchema(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    neighborhood: str
    city: str
    latitude: float
    longitude: float
    price_level: int
    rating_average: float
    decayed_rating_average: float
    total_reviews: int
    cuisine_types: List[str]
    distance_meters: Optional[float] = None
    dishes: List[DishOutSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True
