import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import h3
import geohash2
from sqlalchemy import select
from app.db.session import async_engine, AsyncSessionLocal
from app.db.models import Base, Restaurant, Dish, Review
from app.core.llm_manager import llm_manager
from app.db.caragua_catalog import CARAGUA_OFFICIAL_CATALOG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_caragua")

async def seed_database():
    logger.info("Iniciando carga de dados realistas dos 5 Polos Gastronômicos de Caraguatatuba...")
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.warning(f"PostgreSQL não acessível ({e}). Os 5 polos estão operando via Catálogo Oficial Resiliente em memória.")
        logger.info(f"Total de polos carregados no catálogo resiliente: {len(CARAGUA_OFFICIAL_CATALOG)}")
        for r in CARAGUA_OFFICIAL_CATALOG:
            logger.info(f"  - [{r['neighborhood'].upper()}] {r['name']} ({len(r.get('dishes', []))} pratos)")
        return

    async with AsyncSessionLocal() as session:
        for r_data in CARAGUA_OFFICIAL_CATALOG:
            # Verifica se já existe
            stmt = select(Restaurant).where(Restaurant.slug == r_data["slug"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if existing:
                logger.info(f"Restaurante {r_data['name']} já cadastrado. Pulando.")
                continue

            lat = float(r_data.get("latitude", r_data.get("lat", -23.62)))
            lng = float(r_data.get("longitude", r_data.get("lng", -45.41)))
            point = Point(lng, lat)
            geom = from_shape(point, srid=4326)
            h3_8 = h3.geo_to_h3(lat, lng, resolution=8)
            h3_9 = h3.geo_to_h3(lat, lng, resolution=9)
            gh = geohash2.encode(lat, lng, precision=9)

            restaurant = Restaurant(
                name=r_data["name"],
                slug=r_data["slug"],
                address=r_data["address"],
                neighborhood=r_data["neighborhood"],
                city=r_data.get("city", "Caraguatatuba"),
                state=r_data.get("state", "SP"),
                latitude=lat,
                longitude=lng,
                geom=geom,
                h3_res8=h3_8,
                h3_res9=h3_9,
                geohash=gh,
                price_level=r_data.get("price_level", 2),
                cuisine_types=r_data.get("cuisine_types", []),
                is_active=True
            )
            session.add(restaurant)
            await session.flush()

            # Adiciona Pratos com Embeddings Vetoriais
            for d_data in r_data.get("dishes", []):
                vector = await llm_manager.get_embedding(f"{d_data['name']} {d_data.get('description', '')}")
                dish = Dish(
                    restaurant_id=restaurant.id,
                    name=d_data["name"],
                    description=d_data.get("description"),
                    price=d_data["price"],
                    category=d_data.get("category", "Geral"),
                    is_vegan=d_data.get("is_vegan", False),
                    is_vegetarian=d_data.get("is_vegetarian", False),
                    is_gluten_free=d_data.get("is_gluten_free", False),
                    is_lactose_free=d_data.get("is_lactose_free", False),
                    embedding=vector
                )
                session.add(dish)

            # Adiciona Avaliações com Algoritmo de Decaimento Temporal
            ratings = []
            decayed_ratings = []
            for rev_data in r_data.get("reviews", []):
                rev_date = datetime.now(timezone.utc) - timedelta(days=rev_data["days_ago"])
                review = Review(
                    restaurant_id=restaurant.id,
                    author_hash="hash_teste_" + rev_data["comment"][:6],
                    original_rating=rev_data["rating"],
                    comment_text=rev_data["comment"],
                    review_date=rev_date,
                    is_fraudulent=False
                )
                review.calculate_decay(half_life_days=30.0)
                session.add(review)
                ratings.append(review.original_rating)
                decayed_ratings.append(review.effective_rating)

            if ratings:
                restaurant.total_reviews = len(ratings)
                restaurant.rating_average = round(sum(ratings) / len(ratings), 2)
                restaurant.decayed_rating_average = round(sum(decayed_ratings) / len(decayed_ratings), 2)

        await session.commit()
        logger.info("Carga inicial de Caraguatatuba concluída com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_database())
