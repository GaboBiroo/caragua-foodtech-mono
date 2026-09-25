from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedIntentSchema(BaseModel):
    """
    Schema Rígido do Estágio 1 do Pipeline RAG: Extração de Intenção.
    Converte a linguagem natural livre do usuário em uma matriz estruturada
    para consultas determinísticas no PostgreSQL/PostGIS.
    """
    cuisine_type: Optional[str] = Field(None, description="Tipo de culinária (ex: frutos do mar, japonesa, hamburguer)")
    max_price_level: Optional[int] = Field(None, ge=1, le=4, description="Orçamento máximo (1: $, 4: $$$$)")
    neighborhood: Optional[str] = Field(None, description="Bairro alvo em Caraguatatuba (ex: Martin de Sá, Centro, Indaiá)")
    max_distance_meters: float = Field(default=5000.0, description="Raio de busca geoespacial máximo em metros")
    
    # Restrições Alimentares Críticas (Food Safety)
    is_vegan: bool = Field(default=False, description="Exige pratos estritamente veganos")
    is_vegetarian: bool = Field(default=False, description="Exige pratos vegetarianos")
    is_gluten_free: bool = Field(default=False, description="Exclusão total de glúten (Celíacos)")
    is_lactose_free: bool = Field(default=False, description="Exclusão total de lactose")
    banned_allergens: List[str] = Field(default_factory=list, description="Lista de alergênicos que não podem constar")

    semantic_query: str = Field(..., description="Termo condensado para busca vetorial de pratos ou avaliações")
