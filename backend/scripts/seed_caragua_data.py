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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_caragua")

SAMPLE_RESTAURANTS = [
    {
        "name": "Quiosque Canto Bravo",
        "slug": "quiosque-canto-bravo",
        "address": "Av. Dr. Arthur Costa Filho, 2100",
        "neighborhood": "Martin de Sá",
        "lat": -23.6268,
        "lng": -45.3934,
        "price_level": 2,
        "cuisine_types": ["Frutos do Mar", "Caiçara", "Porções"],
        "dishes": [
            {
                "name": "Isca de Badejo com Molho Tártaro",
                "description": "Badejo fresco do litoral norte empanado e frito na hora.",
                "price": 68.0,
                "category": "Porções",
                "is_gluten_free": True
            },
            {
                "name": "Casquinha de Siri Especial",
                "description": "Carne de siri pura gratinada com azeite de dendê e queijo.",
                "price": 28.0,
                "category": "Entradas",
                "is_gluten_free": False
            }
        ],
        "reviews": [
            {"rating": 5.0, "comment": "Melhor quiosque do Martin de Sá! Peixe fresco e atendimento impecável.", "days_ago": 10},
            {"rating": 5.0, "comment": "Comida maravilhosa pé na areia.", "days_ago": 30},
            {"rating": 4.0, "comment": "Muito bom, um pouco cheio no domingo.", "days_ago": 90}
        ]
    },
    {
        "name": "Cantina Caiçara Tradição",
        "slug": "cantina-caicara-tradicao",
        "address": "Rua Altino Arantes, 450",
        "neighborhood": "Centro",
        "lat": -23.6226,
        "lng": -45.4124,
        "price_level": 2,
        "cuisine_types": ["Caiçara", "Frutos do Mar", "Vegetariano"],
        "dishes": [
            {
                "name": "Azul-Marinho Tradicional",
                "description": "Peixe cozido com banana da terra verde, pirão e farinha artesanal de mandioca.",
                "price": 75.0,
                "category": "Pratos Principais",
                "is_gluten_free": True
            },
            {
                "name": "Moqueca Vegana de Palmito Pupunha",
                "description": "Palmito da mata atlântica, banana da terra, pimentões, leite de coco e dendê.",
                "price": 58.0,
                "category": "Vegano",
                "is_vegan": True,
                "is_vegetarian": True,
                "is_gluten_free": True,
                "is_lactose_free": True
            }
        ],
        "reviews": [
            {"rating": 5.0, "comment": "O Azul Marinho é patrimônio caiçara de verdade! Sabor autêntico.", "days_ago": 5},
            {"rating": 5.0, "comment": "A moqueca vegana surpreendeu até quem come carne.", "days_ago": 45}
        ]
    },
    {
        "name": "Mar & Terra Gourmet",
        "slug": "mar-e-terra-gourmet",
        "address": "Av. Geraldo Nogueira da Silva, 1800",
        "neighborhood": "Indaiá",
        "lat": -23.6350,
        "lng": -45.4210,
        "price_level": 3,
        "cuisine_types": ["Contemporânea", "Carnes", "Frutos do Mar"],
        "dishes": [
            {
                "name": "Risoto de Camarão Rosa com Limão Siciliano",
                "description": "Camarões flambados na cachaça artesanal e arroz arbóreo.",
                "price": 89.0,
                "category": "Pratos Principais",
                "is_gluten_free": True
            }
        ],
        "reviews": [
            {"rating": 4.5, "comment": "Excelente carta de vinhos e ambiente refinado de frente para o mar.", "days_ago": 20}
        ]
    }
]

async def seed_database():
    logger.info("Iniciando carga de dados realistas de Caraguatatuba...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for r_data in SAMPLE_RESTAURANTS:
            # Verifica se já existe
            stmt = select(Restaurant).where(Restaurant.slug == r_data["slug"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if existing:
                logger.info(f"Restaurante {r_data['name']} já cadastrado. Pulando.")
                continue

            point = Point(r_data["lng"], r_data["lat"])
            geom = from_shape(point, srid=4326)
            h3_8 = h3.geo_to_h3(r_data["lat"], r_data["lng"], resolution=8)
            h3_9 = h3.geo_to_h3(r_data["lat"], r_data["lng"], resolution=9)
            gh = geohash2.encode(r_data["lat"], r_data["lng"], precision=9)

            restaurant = Restaurant(
                name=r_data["name"],
                slug=r_data["slug"],
                address=r_data["address"],
                neighborhood=r_data["neighborhood"],
                city="Caraguatatuba",
                state="SP",
                latitude=r_data["lat"],
                longitude=r_data["lng"],
                geom=geom,
                h3_res8=h3_8,
                h3_res9=h3_9,
                geohash=gh,
                price_level=r_data["price_level"],
                cuisine_types=r_data["cuisine_types"],
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
                review.calculate_decay(half_life_days=180.0)
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
