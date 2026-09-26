from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, search, restaurants, moderation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup de recursos na inicialização
    yield
    # Fechamento gracioso na parada

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API do Agregador Gastronômico de Caraguatatuba com RAG Híbrido de 5 Estágios (PostGIS + pgvector).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Habilita CORS para o Web Admin (Next.js 14)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Rotas com versionamento /api/v1
app.include_router(health.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(restaurants.router, prefix="/api/v1")
app.include_router(moderation.router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "projeto": "Caraguá FoodTech",
        "tcc": "Centro Universitário Módulo",
        "versao": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "rag_pipeline": "5-Stage Hybrid (PostGIS ST_DWithin + pgvector Cosine)"
    }
