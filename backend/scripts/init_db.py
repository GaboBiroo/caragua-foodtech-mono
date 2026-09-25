import asyncio
import logging
from app.db.session import async_engine
from app.db.models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_db")

async def create_all_tables():
    logger.info("Criando todas as tabelas no PostgreSQL (com PostGIS e pgvector)...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Tabelas criadas com sucesso!")
    await async_engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_all_tables())
