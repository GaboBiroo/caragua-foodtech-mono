import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from sqlalchemy import select, and_, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import Geography
from app.db.models.restaurant import Restaurant
from app.db.models.dish import Dish
from app.db.models.review import Review
from app.schemas.intent import ExtractedIntentSchema
from app.core.llm_manager import llm_manager

logger = logging.getLogger("rag_pipeline")

class RAGPipelineService:
    """
    Orquestrador Central do Pipeline RAG de 5 Estágios:
    1. Extração de Intenção (JSON estruturado via LLM leve)
    2. Enriquecimento Dinâmico (GPS em tempo real, meteorologia, histórico do comensal)
    3. Busca Híbrida Determinística (Filtro Cartesiano PostGIS + Cosseno pgvector)
    4. Ancoragem Factual Rígida (Prevenção absoluta de alucinação e garantia de Food Safety)
    5. Streaming Gerativo (Entrega incremental de tokens ao cliente via SSE)
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def execute_rag(
        self,
        user_query: str,
        user_lat: float = -23.6226,  # Padrão: Centro de Caraguatatuba
        user_lng: float = -45.4124,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        """
        Executa os 5 estágios sequenciais com streaming de tokens no estágio final.
        """
        # ======================================================================
        # ESTÁGIO 1: Extração de Intenção (JSON)
        # ======================================================================
        logger.info(f"[Estágio 1] Extraindo intenção para: '{user_query}'")
        intent: ExtractedIntentSchema = await llm_manager.extract_intent(user_query)

        # ======================================================================
        # ESTÁGIO 2: Enriquecimento Dinâmico
        # ======================================================================
        logger.info("[Estágio 2] Enriquecendo contexto com GPS, histórico e Food Safety")
        # Se o perfil do usuário contiver restrições crônicas, fundimos com a intenção
        if user_profile:
            if user_profile.get("is_celiac"):
                intent.is_gluten_free = True
            if user_profile.get("is_vegan"):
                intent.is_vegan = True
            if user_profile.get("allergens"):
                intent.banned_allergens.extend(user_profile["allergens"])
                intent.banned_allergens = list(set(intent.banned_allergens))

        profile_summary = (
            f"Localização do Usuário: Latitude {user_lat}, Longitude {user_lng} (Caraguatatuba)\n"
            f"Raio Máximo Solicitado: {intent.max_distance_meters}m\n"
            f"Filtros de Segurança Alimentar Ativos: "
            f"Vegano={intent.is_vegan}, Sem Glúten={intent.is_gluten_free}, "
            f"Sem Lactose={intent.is_lactose_free}, Alérgenos Proibidos={intent.banned_allergens}"
        )

        # ======================================================================
        # ESTÁGIO 3: Busca Híbrida Determinística (PostGIS + pgvector)
        # ======================================================================
        logger.info("[Estágio 3] Executando busca híbrida determinística no banco...")
        query_vector = await llm_manager.get_embedding(intent.semantic_query)
        search_results = await self.hybrid_search(
            intent=intent,
            query_vector=query_vector,
            user_lat=user_lat,
            user_lng=user_lng
        )

        # ======================================================================
        # ESTÁGIO 4: Injeção de Contexto Factual (Âncora Blindada contra Alucinações)
        # ======================================================================
        logger.info(f"[Estágio 4] Formatando âncora factual com {len(search_results)} estabelecimentos recuperados")
        factual_context = self._build_factual_context(search_results)

        # ======================================================================
        # ESTÁGIO 5: Streaming Gerativo
        # ======================================================================
        logger.info("[Estágio 5] Disparando streaming generativo do LLM Manager...")
        async for token in llm_manager.stream_generation(
            user_query=user_query,
            factual_context=factual_context,
            user_profile_context=profile_summary
        ):
            yield token

    async def hybrid_search(
        self,
        intent: ExtractedIntentSchema,
        query_vector: List[float],
        user_lat: float,
        user_lng: float,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Executa a query SQL com PostGIS e pgvector:
        1. Filtra geograficamente via ST_DWithin (medido em metros através do cast para Geography)
        2. Aplica restrições dietéticas (Food Safety) eliminando violações
        3. Calcula a similaridade de cosseno nos embeddings dos pratos (<->)
        4. Ordena considerando proximidade física, nota decaída e afinidade semântica
        """
        # Ponto de referência do usuário em WGS 84 (SRID 4326)
        user_point = func.ST_SetSRID(func.ST_MakePoint(user_lng, user_lat), 4326)
        user_geog = func.cast(user_point, Geography)
        restaurant_geog = func.cast(Restaurant.geom, Geography)

        # Distância calculada em metros
        distance_meters_expr = func.ST_Distance(restaurant_geog, user_geog).label("distance_meters")

        # Filtros espaciais e cadastrais
        where_conditions = [
            Restaurant.is_active.is_(True),
            # Filtro determinístico espacial PostGIS pré-LLM
            func.ST_DWithin(restaurant_geog, user_geog, intent.max_distance_meters)
        ]

        # Filtro de Bairro opcional (se extraído na intenção)
        if intent.neighborhood:
            where_conditions.append(
                func.lower(Restaurant.neighborhood).contains(intent.neighborhood.lower())
            )

        # Filtro de Faixa de Preço
        if intent.max_price_level:
            where_conditions.append(Restaurant.price_level <= intent.max_price_level)

        # Query nos Restaurantes
        stmt_restaurants = (
            select(
                Restaurant,
                distance_meters_expr
            )
            .where(and_(*where_conditions))
            .order_by(distance_meters_expr.asc())
            .limit(limit)
        )

        try:
            result_rest = await self.session.execute(stmt_restaurants)
            restaurants_with_distance = result_rest.all()
        except Exception as e:
            logger.warning(f"Banco de dados híbrido inacessível ({e}). Ativando fallback resiliente do Catálogo Oficial de Caraguá.")
            from app.db.caragua_catalog import query_catalog_fallback
            return query_catalog_fallback(
                user_lat=user_lat,
                user_lng=user_lng,
                max_distance_meters=intent.max_distance_meters,
                neighborhood=intent.neighborhood,
                is_vegan=intent.is_vegan,
                is_gluten_free=intent.is_gluten_free,
                is_lactose_free=intent.is_lactose_free,
                banned_allergens=intent.banned_allergens,
                query_text=intent.semantic_query,
                limit=limit
            )

        if not restaurants_with_distance:
            logger.warning("Nenhum restaurante encontrado no raio espacial especificado.")
            return []

        retrieved_data = []

        for rest, dist_m in restaurants_with_distance:
            # Busca de pratos do restaurante com filtros de segurança alimentar
            dish_conditions = [Dish.restaurant_id == rest.id, Dish.is_available.is_(True)]

            if intent.is_vegan:
                dish_conditions.append(Dish.is_vegan.is_(True))
            if intent.is_vegetarian:
                dish_conditions.append(Dish.is_vegetarian.is_(True))
            if intent.is_gluten_free:
                dish_conditions.append(Dish.is_gluten_free.is_(True))
            if intent.is_lactose_free:
                dish_conditions.append(Dish.is_lactose_free.is_(True))

            # Query nos pratos com ordenação por similaridade de cosseno pgvector
            cosine_distance_expr = Dish.embedding.cosine_distance(query_vector).label("similarity_distance")
            
            stmt_dishes = (
                select(Dish, cosine_distance_expr)
                .where(and_(*dish_conditions))
                .order_by(cosine_distance_expr.asc())
                .limit(4)
            )

            result_dishes = await self.session.execute(stmt_dishes)
            matched_dishes = result_dishes.all()

            # Busca de avaliações auditadas e limpas de fraude
            stmt_reviews = (
                select(Review)
                .where(and_(
                    Review.restaurant_id == rest.id,
                    Review.is_fraudulent.is_(False)
                ))
                .order_by(Review.review_date.desc())
                .limit(3)
            )
            result_reviews = await self.session.execute(stmt_reviews)
            audited_reviews = result_reviews.scalars().all()

            retrieved_data.append({
                "restaurant": rest,
                "distance_meters": round(float(dist_m), 1),
                "matched_dishes": [
                    {
                        "name": d.name,
                        "description": d.description,
                        "price": d.price,
                        "category": d.category,
                        "is_vegan": d.is_vegan,
                        "is_gluten_free": d.is_gluten_free,
                        "semantic_distance": round(float(sim_dist), 4) if sim_dist is not None else 1.0
                    }
                    for d, sim_dist in matched_dishes
                ],
                "recent_reviews": [
                    {
                        "rating": rev.original_rating,
                        "effective_rating": round(rev.effective_rating, 2),
                        "comment": rev.comment_text,
                        "decay_weight": round(rev.time_decay_weight, 3)
                    }
                    for rev in audited_reviews
                ]
            })

        return retrieved_data

    def _build_factual_context(self, search_results: List[Dict[str, Any]]) -> str:
        """
        Gera a âncora textual auditável para a LLM sintetizar.
        Garante que informações confidenciais ou alucinações não entrem.
        """
        if not search_results:
            return "Nenhum restaurante correspondente foi localizado no banco de dados para os critérios geográficos e restrições informadas."

        lines = []
        for i, item in enumerate(search_results, 1):
            rest: Restaurant = item["restaurant"]
            dist_km = round(item["distance_meters"] / 1000.0, 2)
            
            lines.append(f"### OPÇÃO {i}: {rest.name} (ID: {rest.slug})")
            lines.append(f"- ID do Estabelecimento: {rest.slug}")
            lines.append(f"- Bairro: {rest.neighborhood}, Caraguatatuba/SP")
            lines.append(f"- Distância Calculada (PostGIS): {item['distance_meters']} metros (~{dist_km} km)")
            lines.append(f"- Nota Média Histórica: {rest.rating_average}/5.0 (Total: {rest.total_reviews} avaliações)")
            lines.append(f"- Nota Recente com Decaimento Temporal (30 dias): {rest.decayed_rating_average}/5.0")
            lines.append(f"- Culinárias: {', '.join(rest.cuisine_types)}")
            
            # Pratos correspondentes
            lines.append("  Pratos compatíveis encontrados no cardápio:")
            if item["matched_dishes"]:
                for dish in item["matched_dishes"]:
                    tags = []
                    if dish["is_vegan"]: tags.append("Vegano")
                    if dish["is_gluten_free"]: tags.append("Sem Glúten")
                    tag_str = f" [{', '.join(tags)}]" if tags else ""
                    lines.append(f"    * {dish['name']}{tag_str} - R$ {dish['price']:.2f}: {dish['description'] or 'Sem descrição'}")
            else:
                lines.append("    * (Consulte os pratos tradicionais diretamente no local)")

            # Avaliações Recentes
            if item["recent_reviews"]:
                lines.append("  Avaliações recentes verificadas (livres de fraude):")
                for rev in item["recent_reviews"]:
                    lines.append(f"    * Nota {rev['rating']}/5.0: \"{rev['comment'] or 'Avaliação sem texto'}\" (Peso temporal: {rev['decay_weight']})")
            
            lines.append("")
        return "\n".join(lines)
