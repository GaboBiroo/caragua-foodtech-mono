-- ==============================================================================
-- CARAGUATATUBA FOODTECH - SCRIPT DE INICIALIZAÇÃO DE EXTENSÕES E HNSW
-- Contexto Arquitetural: Banco Híbrido (Relacional + Vetorial + Espacial + Trigramas)
-- ==============================================================================

-- 1. Extensões Obrigatórias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Configurações de Memória para pgvector HNSW (sub-10ms em APIs conversacionais)
SET maintenance_work_mem = '128MB';
