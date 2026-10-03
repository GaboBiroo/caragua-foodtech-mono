import uuid
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, ForeignKey, Text, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.restaurant import Restaurant

class Dish(Base, TimestampMixin):
    """
    Entidade Prato/Item de Cardápio:
    Incorpora restrições alimentares severas (Food Safety) e vetor semântico
    (pgvector) indexado com HNSW (Hierarchical Navigable Small World) para
    consultas sub-10ms em APIs conversacionais com busca por cosseno (<=>).
    """
    __tablename__ = "dishes"

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
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    # Filtros Determinísticos de Segurança Alimentar (Food Safety)
    # Impede alucinações de LLM ao forçar regras lógicas via SQL
    is_vegan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_gluten_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_lactose_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    allergens: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False) # Ex: ["crustaceos", "amendoim"]
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Embedding Vetorial do Prato (pgvector 1536 dimensões)
    embedding = mapped_column(Vector(1536), nullable=True)

    # Relacionamento
    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="dishes")

    # Índice HNSW para busca por similaridade de cosseno ultrarrápida (<=>)
    __table_args__ = (
        Index(
            "idx_dishes_embedding_hnsw",
            embedding,
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

    def __repr__(self) -> str:
        return f"<Dish(name='{self.name}', price={self.price}, restaurant_id={self.restaurant_id})>"
