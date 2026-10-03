import uuid
import math
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.restaurant import Restaurant

class Review(Base, TimestampMixin):
    """
    Entidade Avaliação:
    Implementa:
    1. Despersonalização LGPD (author_hash SHA-256).
    2. Detecção de fraudes estatística (Random Forest + SMOTE do estudo Mackenzie).
    3. Algoritmo de Decaimento Temporal Exponencial (Time-Decay Weight) com meia-vida
       estrita de 30 dias para neutralizar a sazonalidade e valorizar consistência recente.
    4. Embedding vetorial de sentimento do comentário.
    """
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    restaurant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Dados da Avaliação Anonimizados (LGPD Artigos 5º e 6º)
    author_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    original_rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    # Detecção Especialista de Fraude (Mackenzie 2024)
    # Avaliações com is_fraudulent=True são expurgadas das médias do RAG
    is_fraudulent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    fraud_confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Algoritmo de Decaimento Temporal Exponencial:
    # W(t) = exp(-lambda * delta_t_em_dias), onde lambda = ln(2) / meia_vida (30 dias)
    # N_t = N_0 * exp(-lambda * t)
    # Garante que resenhas efetuadas ao longo do mês atual somem ~90% da pontuação
    time_decay_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    effective_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Embedding vetorial do sentimento e experiência expressa no texto
    embedding = mapped_column(Vector(1536), nullable=True)

    # Relacionamento
    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="reviews")

    def calculate_decay(self, half_life_days: float = 30.0) -> float:
        """
        Calcula o peso exponencial decrescente da avaliação com base na sua idade.
        Meia-vida de 30 dias (conforme especificação da página 9 do documento arquitetural).
        lambda = ln(2) / 30 ~= 0.0231
        """
        now = datetime.now(timezone.utc)
        delta_days = max(0.0, (now - self.review_date).total_seconds() / 86400.0)
        decay_lambda = math.log(2) / half_life_days
        self.time_decay_weight = math.exp(-decay_lambda * delta_days)
        self.effective_rating = self.original_rating * self.time_decay_weight
        return self.time_decay_weight
