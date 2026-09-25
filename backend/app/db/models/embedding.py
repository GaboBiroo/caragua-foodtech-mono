import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.restaurant import Restaurant

class ContextEmbedding(Base, TimestampMixin):
    """
    Entidade de Contexto Vetorial RAG:
    Armazena fragmentos textuais enriquecidos (ex: culinária caiçara típica,
    histórico do restaurante, ambiente e especialidades) com indexação
    vetorial direta para injeção na âncora factual (Estágio IV).
    """
    __tablename__ = "context_embeddings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    restaurant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    context_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # "regional", "menu", "story"
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_payload: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    # Embedding vetorial de 1536 dimensões (compatível com OpenAI text-embedding-3-small)
    embedding = mapped_column(Vector(1536), nullable=False)

    restaurant: Mapped[Optional["Restaurant"]] = relationship("Restaurant", back_populates="embeddings")
