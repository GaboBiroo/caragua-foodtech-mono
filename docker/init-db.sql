-- ==============================================================================
-- CARAGUATATUBA FOODTECH - SCRIPT DE INICIALIZAÇÃO DE EXTENSÕES E HNSW
-- Contexto Acadêmico: Banco Híbrido (Relacional + Vetorial + Espacial)
-- ==============================================================================

-- 1. Extensões Principais
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Configurações de Memória para pgvector HNSW (sub-10ms em APIs conversacionais)
-- Conforme documentação de arquitetura (Páginas 8 e 9 do TCC):
-- HNSW cria grafos em múltiplas camadas suportando inserção constante sem degradação
SET maintenance_work_mem = '128MB';
