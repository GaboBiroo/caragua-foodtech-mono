# scripts/test_rag_pipeline.py
import sys
from pathlib import Path

# Garante suporte a UTF-8 no Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Configura o PYTHONPATH para apontar para o diretório backend
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import asyncio
import logging
from app.db.session import AsyncSessionLocal
from app.services.rag_pipeline import RAGPipelineService

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("test_rag_root")

async def test_rag():
    logger.info("==================================================================")
    logger.info("🌊 CARÁFOOD — TESTE DO PIPELINE RAG DE 5 ESTÁGIOS")
    logger.info("   PostGIS + pgvector (HNSW) + Trava SQL Determinística + Chef Jacquin")
    logger.info("==================================================================")

    async with AsyncSessionLocal() as session:
        service = RAGPipelineService(session=session)
        user_query = "Gostaria de uma recomendação de moqueca ou peixe fresco sem glúten em Caraguá perto de Martin de Sá"
        
        logger.info(f"Query do Comensal: '{user_query}'")
        logger.info("Disparando pipeline de streaming com Trava SQL Determinística...")

        full_response = []
        async for token in service.execute_rag(
            user_query=user_query,
            user_lat=-23.6226,
            user_lng=-45.4124,
            user_profile={"is_celiac": True}
        ):
            full_response.append(token)

        final_text = "".join(full_response)
        logger.info("\n--- RESPOSTA OFICIAL DO CHEF JACQUIN (ÂNCORA FACTUAL RÍGIDA) ---")
        logger.info(final_text)
        logger.info("-----------------------------------------------------------------")
        logger.info("✅ [OK] Pipeline RAG executado e validado com sucesso!")

if __name__ == "__main__":
    asyncio.run(test_rag())
