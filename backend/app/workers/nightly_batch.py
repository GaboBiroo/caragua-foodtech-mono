import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models.restaurant import Restaurant
from app.db.models.review import Review
from app.workers.sanitizer_lgpd import LGPDSanitizer
from app.workers.fraud_detector import ReviewFraudDetector

logger = logging.getLogger("nightly_batch")
logging.basicConfig(level=logging.INFO)

async def run_nightly_etl() -> None:
    """
    Rotina de Execução em Lote da Madrugada (Nightly Batch Ingestion).
    1. Executa o reprocessamento de decaimento temporal em todas as avaliações (meia-vida de 30 dias).
    2. Recalcula as médias ponderadas dos restaurantes valorizando a consistência recente.
    3. Purga fraudes detectadas pelo modelo benchmark Mackenzie.
    """
    logger.info("Iniciando rotina de processamento noturno...")
    fraud_detector = ReviewFraudDetector()

    async with AsyncSessionLocal() as session:
        # 1. Recupera todos os restaurantes ativos
        stmt = select(Restaurant).where(Restaurant.is_active.is_(True))
        result = await session.execute(stmt)
        restaurants = result.scalars().all()

        for rest in restaurants:
            # 2. Busca as avaliações do restaurante
            rev_stmt = select(Review).where(Review.restaurant_id == rest.id)
            rev_result = await session.execute(rev_stmt)
            reviews = rev_result.scalars().all()

            if not reviews:
                continue

            valid_ratings = []
            weighted_ratings = []

            for rev in reviews:
                # Checa fraude se ainda não auditado
                if rev.fraud_confidence_score == 0.0:
                    is_fraud, conf = fraud_detector.predict_fraud(rev.comment_text or "", rev.original_rating)
                    rev.is_fraudulent = is_fraud
                    rev.fraud_confidence_score = conf

                # Se for fraudulento, não entra nas médias
                if rev.is_fraudulent:
                    continue

                # Aplica decaimento temporal com meia vida de 30 dias (conforme página 9 do documento)
                decay_weight = rev.calculate_decay(half_life_days=30.0)
                valid_ratings.append(rev.original_rating)
                weighted_ratings.append(rev.effective_rating)

            if valid_ratings:
                rest.total_reviews = len(valid_ratings)
                rest.rating_average = round(sum(valid_ratings) / len(valid_ratings), 2)
                total_weight = sum(rev.time_decay_weight for rev in reviews if not rev.is_fraudulent)
                if total_weight > 0:
                    rest.decayed_rating_average = round(sum(weighted_ratings) / total_weight, 2)

        await session.commit()
        logger.info(f"Processamento noturno concluído com sucesso para {len(restaurants)} restaurantes.")

if __name__ == "__main__":
    asyncio.run(run_nightly_etl())
