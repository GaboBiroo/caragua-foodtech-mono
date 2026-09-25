from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)
from app.core.config import settings

# Engine assíncrono otimizado com pool para alta concorrência
async_engine = create_async_engine(
    settings.DATABASE_ASYNC_URL,
    echo=settings.DEBUG,
    pool_size=15,
    max_overflow=25,
    pool_recycle=1800,
    pool_pre_ping=True
)

# Fábrica de sessões assíncronas SQLAlchemy 2.0
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependência FastAPI para injeção de sessão assíncrona com fechamento
    garantido e rollback automático em caso de exceção.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
