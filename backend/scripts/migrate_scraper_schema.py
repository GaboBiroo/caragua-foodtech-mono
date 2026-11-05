import asyncio
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from app.db.session import async_engine
from app.db.models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migrate_scraper_schema")

MIGRATION_STATEMENTS = [
    # 1. Extensões Vitais Obrigatórias (PostGIS + pgvector + pg_trgm + unaccent)
    "CREATE EXTENSION IF NOT EXISTS postgis;",
    "CREATE EXTENSION IF NOT EXISTS vector;",
    "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
    "CREATE EXTENSION IF NOT EXISTS unaccent;",

    # 2. Colunas de rastreabilidade e Ranking Bayesiano na tabela restaurants
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS website VARCHAR(500);",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS source_platform VARCHAR(64);",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS source_external_id VARCHAR(128);",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS bayesian_rating NUMERIC(4, 2) DEFAULT 4.20;",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS active_dishes_count INTEGER DEFAULT 0;",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;",
    "CREATE INDEX IF NOT EXISTS idx_restaurants_source_ext_id ON restaurants(source_external_id);",
    "CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm ON restaurants USING gin (name gin_trgm_ops);",
    "CREATE INDEX IF NOT EXISTS idx_restaurants_bayesian_rating ON restaurants(bayesian_rating DESC);",

    # 3. Colunas de Quarentena, Vetores 1536d e Metadados Analíticos na tabela dishes
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS smart_defaults JSON DEFAULT '[]'::json NOT NULL;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS raw_source VARCHAR(64) DEFAULT 'manual' NOT NULL;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS ingestion_hash VARCHAR(64);",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS requires_moderation BOOLEAN DEFAULT TRUE NOT NULL;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255);",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS embedding vector(1536);",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS needs_reindexing BOOLEAN DEFAULT TRUE;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS last_price_delta_pct NUMERIC(6, 3) DEFAULT 0.000;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS moderation_notes TEXT;",
    "ALTER TABLE dishes ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;",
    "CREATE INDEX IF NOT EXISTS idx_dishes_ingestion_hash ON dishes(ingestion_hash);",
    "CREATE INDEX IF NOT EXISTS idx_dishes_quarantine ON dishes(requires_moderation, is_available);",
    "CREATE INDEX IF NOT EXISTS idx_dishes_name_trgm ON dishes USING gin (name gin_trgm_ops);",

    # 4. Índice HNSW para busca vetorial sub-milissegundo em pgvector
    """
    CREATE INDEX IF NOT EXISTS idx_dishes_embedding_hnsw
    ON dishes USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
    """,

    # 5. Índice composto parcial para vitrine do Marketplace e RAG (somente itens aprovados e disponíveis)
    """
    CREATE INDEX IF NOT EXISTS idx_dishes_marketplace_ready
    ON dishes (restaurant_id, is_available, requires_moderation)
    WHERE is_available = TRUE AND requires_moderation = FALSE;
    """,

    # Preserva disponibilidade de itens manuais já publicados anteriormente
    "UPDATE dishes SET requires_moderation = FALSE WHERE is_available = TRUE AND raw_source = 'manual';",

    # 6. Histórico Temporal de Preços (inflação/deflação auditada)
    """
    CREATE TABLE IF NOT EXISTS dish_price_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
        previous_price NUMERIC(10, 2) NOT NULL,
        new_price NUMERIC(10, 2) NOT NULL,
        delta_percentage NUMERIC(6, 3) NOT NULL,
        detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_dish_price_history_dish ON dish_price_history(dish_id, detected_at DESC);",

    # 7. Chave determinística idempotente em Reviews
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS ingestion_hash VARCHAR(64);",
    "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS source_platform VARCHAR(64);",
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_ingestion_hash_unique ON reviews(ingestion_hash) WHERE ingestion_hash IS NOT NULL;",

    # 8. Trigger SQL Automático BEFORE INSERT OR UPDATE em dishes:
    # Quando um prato é inserido, aprovado na moderação ou muda de nome/descrição/preço, marca needs_reindexing = TRUE.
    """
    CREATE OR REPLACE FUNCTION fn_sync_dish_moderation_and_restaurant_stats()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'INSERT')
           OR (OLD.name IS DISTINCT FROM NEW.name)
           OR (OLD.description IS DISTINCT FROM NEW.description)
           OR (OLD.price IS DISTINCT FROM NEW.price)
           OR (OLD.is_available IS DISTINCT FROM NEW.is_available) THEN
            NEW.needs_reindexing := TRUE;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,
    "DROP TRIGGER IF EXISTS trg_dish_before_upsert ON dishes;",
    """
    CREATE TRIGGER trg_dish_before_upsert
    BEFORE INSERT OR UPDATE ON dishes
    FOR EACH ROW EXECUTE FUNCTION fn_sync_dish_moderation_and_restaurant_stats();
    """,

    # 9. Trigger SQL Automático AFTER INSERT OR UPDATE OR DELETE em dishes:
    # Sincroniza active_dishes_count, review_count e bayesian_rating (Suavização de Laplace m=10).
    """
    CREATE OR REPLACE FUNCTION fn_update_restaurant_Counters()
    RETURNS TRIGGER AS $$
    DECLARE
        target_rest_id UUID;
        global_c NUMERIC := 4.20;
        active_sample_cnt INTEGER := 0;
    BEGIN
        target_rest_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);
        SELECT COUNT(*), COALESCE(AVG(rating_average), 4.20)
          INTO active_sample_cnt, global_c
          FROM restaurants
         WHERE is_active = TRUE AND rating_average > 0;
        IF active_sample_cnt < 5 THEN
            global_c := 4.20;
        END IF;

        UPDATE restaurants
           SET active_dishes_count = (
                   SELECT COUNT(*)
                     FROM dishes
                    WHERE restaurant_id = target_rest_id
                      AND is_available = TRUE
                      AND requires_moderation = FALSE
               ),
               review_count = GREATEST(COALESCE(review_count, 0), COALESCE(total_reviews, 0)),
               bayesian_rating = ROUND(
                   (
                       (GREATEST(COALESCE(review_count, 0), COALESCE(total_reviews, 0))::numeric
                        / (GREATEST(COALESCE(review_count, 0), COALESCE(total_reviews, 0))::numeric + 10.0))
                       * COALESCE(NULLIF(rating_average, 0), global_c)::numeric
                   ) + (
                       (10.0 / (GREATEST(COALESCE(review_count, 0), COALESCE(total_reviews, 0))::numeric + 10.0))
                       * global_c
                   ),
                   2
               )
         WHERE id = target_rest_id;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    """,
    "DROP TRIGGER IF EXISTS trg_dish_after_change_stats ON dishes;",
    """
    CREATE TRIGGER trg_dish_after_change_stats
    AFTER INSERT OR UPDATE OR DELETE ON dishes
    FOR EACH ROW EXECUTE FUNCTION fn_update_restaurant_Counters();
    """,

    # Sincronização retroativa inicial dos contadores e rating bayesiano existentes
    """
    UPDATE restaurants r
       SET review_count = GREATEST(COALESCE(r.review_count, 0), COALESCE(r.total_reviews, 0)),
           active_dishes_count = (
               SELECT COUNT(*) FROM dishes d
                WHERE d.restaurant_id = r.id
                  AND d.is_available = TRUE
                  AND d.requires_moderation = FALSE
           ),
           bayesian_rating = ROUND(
               (
                   (GREATEST(COALESCE(r.review_count, 0), COALESCE(r.total_reviews, 0))::numeric
                    / (GREATEST(COALESCE(r.review_count, 0), COALESCE(r.total_reviews, 0))::numeric + 10.0))
                   * COALESCE(NULLIF(r.rating_average, 0), 4.20)::numeric
               ) + (
                   (10.0 / (GREATEST(COALESCE(r.review_count, 0), COALESCE(r.total_reviews, 0))::numeric + 10.0))
                   * 4.20
               ),
               2
           );
    """,
]


async def run_migration() -> None:
    logger.info("Aplicando migração DDL V2 (PostGIS + pgvector 1536d HNSW + pg_trgm + Triggers Bayesianos)...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for sql in MIGRATION_STATEMENTS:
            await conn.execute(text(sql))
    await async_engine.dispose()
    logger.info("Migração DDL V2 concluída com 100% de sucesso!")


if __name__ == "__main__":
    asyncio.run(run_migration())
