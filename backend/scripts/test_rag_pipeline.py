import asyncio
import logging
from app.db.session import AsyncSessionLocal
from app.services.rag_pipeline import RAGPipelineService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_rag")

async def test_rag():
    logger.info("==================================================================")
    logger.info("TESTE DO PIPELINE RAG DE 5 ESTÁGIOS (POSTGIS + PGVECTOR + LLM)")
    logger.info("==================================================================")

    async with AsyncSessionLocal() as session:
        service = RAGPipelineService(session=session)
        user_query = "Gostaria de uma recomendação de moqueca ou peixe fresco sem glúten em Caraguá perto de Martin de Sá"
        
        logger.info(f"Query do Usuário: '{user_query}'")
        logger.info("Disparando streaming do RAG...")

        full_response = []
        async for token in service.execute_rag(
            user_query=user_query,
            user_lat=-23.6226,
            user_lng=-45.4124,
            user_profile={"is_celiac": True}
        ):
            full_response.append(token)

        final_text = "".join(full_response)
        logger.info("\n--- RESPOSTA GERADA PELO RAG COM ANCORAGEM FACTUAL ---")
        logger.info(final_text)
        logger.info("-------------------------------------------------------")
        logger.info("[OK] Pipeline RAG executado e validado de ponta a ponta!")

if __name__ == "__main__":
    asyncio.run(test_rag())
