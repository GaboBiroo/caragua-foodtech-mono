import sys
from pathlib import Path

# Adiciona o diretório backend ao sys.path para importações absolutas
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import logging
from app.workers.sanitizer_lgpd import LGPDSanitizer
from app.workers.fraud_detector import ReviewFraudDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_scraping_fraud")

def run_tests():
    logger.info("==================================================================")
    logger.info("TESTE 1: SANITIZACAO LGPD (Artigos 5o e 6o - Minimizacao de Dados)")
    logger.info("==================================================================")

    raw_text = "Adorei o peixe! Meu CPF e 123.456.789-00 e meu telefone e (12) 99888-7766. Contato: cliente@email.com"
    sanitized = LGPDSanitizer.sanitize_text(raw_text)
    logger.info(f"Texto Bruto:    {raw_text}")
    logger.info(f"Texto LGPD:     {sanitized}")
    assert "[CPF_REMOVIDO]" in sanitized
    assert "[TELEFONE_REMOVIDO]" in sanitized
    assert "[EMAIL_REMOVIDO]" in sanitized

    author_hash = LGPDSanitizer.anonymize_author("Gabriel Rodrigues Silva")
    logger.info(f"Author Hash SHA-256: {author_hash}")
    assert len(author_hash) == 64

    logger.info("\n==================================================================")
    logger.info("TESTE 2: DETECCAO DE FRAUDES EM REVIEWS (Mackenzie / SMOTE / RF)")
    logger.info("==================================================================")
    detector = ReviewFraudDetector()

    # Caso 1: Avaliacao legitima
    is_fraud, conf = detector.predict_fraud("Comida maravilhosa, peixe fresquinho e bom atendimento.", 5.0)
    logger.info(f"Review Legitimo -> Fraude: {is_fraud} | Confianca: {conf:.2f}")
    assert is_fraud is False

    # Caso 2: Avaliacao com assinatura de bot / spam
    is_fraud, conf = detector.predict_fraud("COMPREI SEGUIDORES COM DESCONTO NO PIX CHAMA NO WHATS!!!!!", 5.0)
    logger.info(f"Review Spam -> Fraude: {is_fraud} | Confianca: {conf:.2f}")
    assert is_fraud is True

    logger.info("\n[OK] Todos os testes de sanitizacao e deteccao de fraudes passaram com 100% de sucesso!")

if __name__ == "__main__":
    run_tests()
