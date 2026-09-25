from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização (Setup de Conexões)
    yield
    # Finalização (Graceful Shutdown)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API do Agregador Gastronômico de Caraguatatuba com RAG Híbrido de 5 Estágios.",
    version="1.0.0",
    lifespan=lifespan
)

# Habilita CORS para o Web Admin (Next.js 14)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Rotas
app.include_router(health.router)

@app.get("/", tags=["Root"])
async def root():
    return {
        "projeto": "Caraguá FoodTech",
        "tcc": "Centro Universitário Módulo",
        "status": "running",
        "docs_url": "/docs"
    }
