import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    Configurações centralizadas da aplicação utilizando Pydantic Settings V2.
    Carrega automaticamente do arquivo .env ou do ambiente do sistema.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    PROJECT_NAME: str = "Caraguá FoodTech API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # PostgreSQL / pgvector / PostGIS
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "caragua_foodtech"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Modelos de IA e Embeddings (Ecossistema Anthropic Claude e OpenAI)
    ANTHROPIC_API_KEY: str = Field(default="", description="Chave da Anthropic Claude (preferencial conforme página 10 do TCC)")
    OPENAI_API_KEY: str = Field(default="", description="Chave da OpenAI para embeddings e RAG")
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    EMBEDDING_MODEL_NAME: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Parâmetros de Scraping
    SCRAPER_HEADLESS: bool = True
    SCRAPER_DELAY_SECONDS: float = 2.0

    @property
    def DATABASE_ASYNC_URL(self) -> str:
        """Retorna a URL assíncrona do PostgreSQL usando asyncpg driver."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def REDIS_URL(self) -> str:
        """Retorna a URL de conexão do Redis."""
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

settings = Settings()
