-- ==============================================================================
-- CARAGUATATUBA FOODTECH - SCRIPT DE INICIALIZAÇÃO DE EXTENSÕES
-- Contexto Acadêmico: Banco Híbrido (Relacional + Vetorial + Espacial)
-- ==============================================================================

-- 1. pgvector: Habilita armazenamento e indexação de embeddings vetoriais (HNSW / IVFFlat)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. PostGIS: Habilita tipos geométricos/geográficos e filtros espaciais determinísticos (ST_DWithin)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 3. pg_trgm: Otimização em C para busca difusa (trigramas) e matching de nomes de pratos/estabelecimentos
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 4. uuid-ossp: Geração segura de identificadores únicos universais (UUIDv4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
