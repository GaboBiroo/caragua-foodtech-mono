import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import (
    String,
    Float,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    Index,
    Numeric,
    DateTime,
    func,
    desc,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.db.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.restaurant import Restaurant


class Dish(Base, TimestampMixin):
    """
    Entidade Prato/Item de Cardápio:
    Incorpora restrições alimentares severas (Food Safety), metadados de quarentena
    de scraping (raw_source, ingestion_hash, requires_moderation), complementos
    canônicos (smart_defaults) e vetor semântico (pgvector 1536d) indexado com HNSW.
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
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Filtros Determinísticos de Segurança Alimentar (Food Safety)
    is_vegan: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_vegetarian: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_gluten_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_lactose_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    allergens: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    smart_defaults: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    # Quarentena de Moderação e Rastreabilidade de Scraping
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    raw_source: Mapped[str] = mapped_column(String(64), default="manual", server_default="manual", nullable=False)
    ingestion_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    requires_moderation: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    moderation_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    moderated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_price_delta_pct: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        default=Decimal("0.000"),
        server_default="0.000",
        nullable=False,
    )

    # Embedding Vetorial do Prato (pgvector 1536 dimensões) e Controle Incremental
    embedding = mapped_column(Vector(1536), nullable=True)
    embedding_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    needs_reindexing: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)

    # Relacionamentos
    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="dishes")
    price_history: Mapped[List["DishPriceHistory"]] = relationship(
        "DishPriceHistory",
        back_populates="dish",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    __table_args__ = (
        Index(
            "idx_dishes_embedding_hnsw",
            embedding,
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        Index("idx_dishes_ingestion_hash", "ingestion_hash"),
        Index("idx_dishes_quarantine", "requires_moderation", "is_available"),
    )

    def __repr__(self) -> str:
        return (
            f"<Dish(name='{self.name}', price={self.price}, "
            f"available={self.is_available}, moderation={self.requires_moderation})>"
        )


class DishPriceHistory(Base):
    """
    Histórico Temporal de Flutuação de Preços de Pratos:
    Rastreia variações de preço detectadas nas varreduras autônomas para auditoria
    de inflação gastronômica local e validação de promoções reais.
    """
    __tablename__ = "dish_price_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    dish_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dishes.id", ondelete="CASCADE"),
        nullable=False
    )
    previous_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    new_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    delta_percentage: Mapped[Decimal] = mapped_column(Numeric(6, 3), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    dish: Mapped["Dish"] = relationship("Dish", back_populates="price_history")

    __table_args__ = (
        Index("idx_dish_price_history_dish", "dish_id", desc("detected_at")),
    )

    def __repr__(self) -> str:
        return (
            f"<DishPriceHistory(dish_id={self.dish_id}, "
            f"prev={self.previous_price}, new={self.new_price}, delta={self.delta_percentage}%)>"
        )
