import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.session import async_engine
from app.db.models import Base
from app.api.routes import health, search, restaurants, moderation, chat, dishes
from app.workers.scraper_redis import scraper_redis_coordinator
from scripts.migrate_scraper_schema import MIGRATION_STATEMENTS

logger = logging.getLogger("main_lifespan")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            for stmt in MIGRATION_STATEMENTS:
                await conn.execute(text(stmt))
        logger.info("Schema V2 PostGIS + pg_trgm + pgvector 1536d HNSW + Triggers sincronizado.")
    except Exception as exc:
        logger.warning(f"Banco PostgreSQL inacessível no startup (modo resiliente ativo): {exc}")
    yield
    await scraper_redis_coordinator.close()
    await async_engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API Hiperlocal do CaráFood (53 Bairros de Caraguatatuba) com SVL-RRF Hybrid RAG (PostGIS + pgvector + pg_trgm).",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(restaurants.router, prefix="/api/v1")
app.include_router(dishes.router, prefix="/api/v1")
app.include_router(moderation.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "projeto": "CaráFood — Caraguá FoodTech",
        "tcc": "Centro Universitário Módulo / Padrão USP-ABNT",
        "versao": "2.0.0",
        "status": "online",
        "docs": "/docs",
        "rag_pipeline": "SVL-RRF Hybrid (PostGIS ST_Distance + pgvector 1536d HNSW + pg_trgm + Bayesian W_R)",
    }
