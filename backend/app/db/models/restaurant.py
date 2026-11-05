import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, JSON, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.db.models.dish import Dish
    from app.db.models.review import Review
    from app.db.models.embedding import ContextEmbedding


class Restaurant(Base, TimestampMixin):
    """
    Entidade Restaurante: Modelagem híbrida relacional e espacial.
    Armazena dados cadastrais, índices espaciais (PostGIS, H3, Geohash),
    origem do harvesting autônomo e consolidação de notas estatísticas auditadas.
    """
    __tablename__ = "restaurants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    cnpj: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Endereço e Engenharia Locacional Hiperlocal (Caraguatatuba - 53 Bairros)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), default="Caraguatatuba", nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(2), default="SP", nullable=False)
    postal_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # Coordenadas decimais e Geometria PostGIS (SRID 4326 - WGS 84)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Coluna espacial nativa para consultas ST_DWithin determinísticas pré-LLM
    geom = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False
    )

    # Índices espaciais discretos para agrupamento e lookup em memória
    h3_res8: Mapped[Optional[str]] = mapped_column(String(15), nullable=True, index=True)
    h3_res9: Mapped[Optional[str]] = mapped_column(String(15), nullable=True, index=True)
    geohash: Mapped[Optional[str]] = mapped_column(String(12), nullable=True, index=True)

    # Metadados operacionais e comerciais
    price_level: Mapped[int] = mapped_column(default=2, nullable=False)
    cuisine_types: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    opening_hours: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    # Consolidação Estatística de Avaliações, Score Bayesiano e Rastreabilidade de Origem
    rating_average: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    decayed_rating_average: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    bayesian_rating: Mapped[float] = mapped_column(Float, default=4.20, server_default="4.20", nullable=False, index=True)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    active_dishes_count: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    last_scraped_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=True,
    )
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    source_platform: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    source_external_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)

    # Relacionamentos
    dishes: Mapped[List["Dish"]] = relationship(
        "Dish",
        back_populates="restaurant",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="restaurant",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    embeddings: Mapped[List["ContextEmbedding"]] = relationship(
        "ContextEmbedding",
        back_populates="restaurant",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Restaurant(name='{self.name}', neighborhood='{self.neighborhood}', rating={self.rating_average})>"
