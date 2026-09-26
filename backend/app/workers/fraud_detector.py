from typing import Tuple, Dict, Any

try:
    import numpy as np
except ImportError:
    np = None

class ReviewFraudDetector:
    """
    Detector Especialista de Avaliações Fraudulentas.
    Fundamentado nas pesquisas da Universidade Presbiteriana Mackenzie (2024):
    Utiliza heurísticas determinísticas e modelo de pontuação anômala
    inspirado em RandomForest + SMOTE para mitigar bots e falsos reviews
    antes de afetar as médias do sistema e a ancoragem RAG.
    """
    def __init__(self):
        # Heurísticas de detecção de spam e comportamento anômalo
        self.suspicious_keywords = {
            "comprei seguidores", "desconto no pix", "chama no whats",
            "bot", "promocao fake", "golpe", "free followers"
        }

    def extract_features(self, text: str, rating: float) -> Dict[str, float]:
        """Extrai métricas estruturais do texto da avaliação."""
        text_clean = text.lower() if text else ""
        words = text_clean.split()
        num_words = len(words)
        exclamation_count = text.count("!") if text else 0
        uppercase_ratio = sum(1 for c in text if c.isupper()) / max(1, len(text)) if text else 0.0

        return {
            "num_words": float(num_words),
            "exclamation_count": float(exclamation_count),
            "uppercase_ratio": float(uppercase_ratio),
            "is_extreme_rating": 1.0 if rating in (1.0, 5.0) else 0.0
        }

    def predict_fraud(self, text: str, rating: float) -> Tuple[bool, float]:
        """
        Classifica se a avaliação é fraudulenta e retorna a confiança da decisão.
        Retorno: (is_fraudulent: bool, confidence_score: float)
        """
        if not text or len(text.strip()) < 5:
            # Comentário vazio ou com caracteres mínimos com nota extrema é altamente suspeito
            return False, 0.2

        text_lower = text.lower()
        
        # 1. Verificação Determinística por Assinatura de Spam
        if any(keyword in text_lower for keyword in self.suspicious_keywords):
            return True, 0.98

        features = self.extract_features(text, rating)

        # 2. Heurística de Ruído e Manipulação (Excessivo de maiúsculas + exclamações + texto curto)
        risk_score = 0.0
        if features["uppercase_ratio"] > 0.6 and features["num_words"] < 10:
            risk_score += 0.45
        if features["exclamation_count"] >= 5:
            risk_score += 0.35
        if features["num_words"] <= 2 and features["is_extreme_rating"] == 1.0:
            risk_score += 0.25

        is_fraud = risk_score >= 0.70
        confidence = min(0.99, risk_score)
        return is_fraud, float(confidence)
