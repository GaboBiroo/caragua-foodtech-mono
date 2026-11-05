"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A2.2: MOTOR RAG HÍBRIDO SVL-RRF
==============================================================================
Implementa `HybridRAGEngine`:
1. Extração determinística de intenções implícitas em Português Brasileiro:
   - Restrições de Segurança Alimentar (`is_vegan`, `is_vegetarian`, `is_gluten_free`, `is_lactose_free`),
     suportando lógica conjuntiva (AND) e disjuntiva (OR, ex: "sem lactose ou veganas").
   - Orçamento máximo ("até R$ 60", "barato") e radar de deflação ("queda de preço").
   - Resolução topológica de um ou múltiplos bairros entre os 53 oficiais de Caraguatatuba.
2. Busca Híbrida Unificada via CTE SQL no PostgreSQL 16 (**SVL-RRF**):
   Score_SVL(d_i) = 0.50/(60 + k_vec) + 0.30/(60 + k_geo) + 0.20/(60 + k_lex) + 0.005*(W_R/5.0)
3. Streaming SSE (`stream_conversational_response`) emitindo JSON estruturado:
   `metadata` -> `token` (xN) -> `done`, com grounding estrito nos pratos auditados.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import unicodedata
import urllib.request
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.vector_indexer import VectorIndexingService, vector_indexing_service
from app.workers.seed_discovery import OFFICIAL_53_NEIGHBORHOODS

logger = logging.getLogger("rag_engine")
logger.setLevel(logging.INFO)


def _strip_accents_lower(value: str) -> str:
    nfkd = unicodedata.normalize("NFKD", value or "")
    return nfkd.encode("ascii", "ignore").decode("ascii").lower()


class HybridRAGEngine:
    """
    Motor de Recuperação e Geração Aumentada Hiperlocal (PostGIS + pgvector + pg_trgm).
    """

    ALPHA_VEC: float = 0.50
    ALPHA_GEO: float = 0.30
    ALPHA_LEX: float = 0.20
    KAPPA_RRF: float = 60.0
    GAMMA_BAYESIAN: float = 0.005

    def __init__(self, indexer: Optional[VectorIndexingService] = None) -> None:
        self.indexer = indexer or vector_indexing_service
        self._ollama_chat_offline_until: float = 0.0

    @staticmethod
    def extract_implicit_intent(
        query_text: str,
        user_lat: float = -23.6204,
        user_lon: float = -45.4132,
        neighborhood: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary_filters: Optional[Dict[str, bool]] = None,
    ) -> Dict[str, Any]:
        """
        Extrai filtros determinísticos implícitos de consultas em linguagem natural.
        """
        raw_q = (query_text or "").strip()
        q_norm = _strip_accents_lower(raw_q)
        explicit_diet = dict(dietary_filters or {})

        inferred_flags: Dict[str, bool] = {
            "is_vegan": bool(
                re.search(r"\b(?:vegano|vegana|veganos|veganas|plant[- ]based|100%\s*vegetal)\b", q_norm)
            ),
            "is_vegetarian": bool(
                re.search(r"\b(?:vegetariano|vegetariana|vegetarianos|vegetarianas|veggie)\b", q_norm)
            ),
            "is_gluten_free": bool(
                re.search(
                    r"\b(?:sem\s+gluten|zero\s+gluten|celiaco|celiaca|celiacos|isento\s+de\s+gluten)\b",
                    q_norm,
                )
            ),
            "is_lactose_free": bool(
                re.search(
                    r"\b(?:sem\s+lactose|zero\s+lactose|intolerante\s+a\s+(?:leite|lactose)|sem\s+leite|sem\s+laticinios)\b",
                    q_norm,
                )
            ),
        }

        # Detecta se o usuário conectou múltiplas restrições com " ou " sem filtro explícito forçado
        active_inferred_keys = [k for k, v in inferred_flags.items() if v]
        has_disjunctive_or = (
            not any(explicit_diet.values())
            and len(active_inferred_keys) >= 2
            and bool(re.search(r"\b(?:ou)\b", q_norm))
        )

        merged_diet: Dict[str, bool] = {}
        for key in ("is_vegan", "is_vegetarian", "is_gluten_free", "is_lactose_free"):
            merged_diet[key] = bool(explicit_diet.get(key, False) or inferred_flags.get(key, False))

        # Extração de teto de preço ("até R$ 60", "até 60 reais", "menos de 50")
        resolved_max_price = max_price
        if resolved_max_price is None:
            m_price = re.search(
                r"(?:ate|menos\s+de|maximo(?:\s+de)?|abaixo\s+de)\s*(?:r\$\s*)?(\d+(?:[\.,]\d{1,2})?)",
                q_norm,
            )
            if m_price:
                resolved_max_price = float(m_price.group(1).replace(",", "."))
            elif re.search(r"\b(?:barato|baratos|economico|economica)\b", q_norm):
                resolved_max_price = 52.0

        # Radar de queda de preço / promoção auditada
        price_drop_only = bool(
            re.search(
                r"\b(?:queda\s+de\s+preco|quedas\s+de\s+preco|baixou\s+de\s+preco|reducao\s+de\s+preco|deflacao)\b",
                q_norm,
            )
        )

        # Detecção dos 53 bairros oficiais na pergunta (suporta 1 ou mais bairros, ex: "Martim de Sá ou Centro")
        matched_neighborhoods: List[str] = []
        eff_lat, eff_lon = float(user_lat), float(user_lon)

        if neighborhood and _strip_accents_lower(neighborhood) not in ("todos", "all", "caraguatatuba", ""):
            n_norm = _strip_accents_lower(neighborhood)
            for slug, meta in OFFICIAL_53_NEIGHBORHOODS.items():
                if slug == n_norm or _strip_accents_lower(meta["name"]) == n_norm:
                    matched_neighborhoods.append(meta["name"])
                    eff_lat, eff_lon = float(meta["lat"]), float(meta["lng"])
                    break
            if not matched_neighborhoods:
                matched_neighborhoods.append(neighborhood)
        else:
            # Ordena nomes maiores primeiro para evitar que "Britânia" sombreie "Jardim Britânia"
            sorted_entries = sorted(
                OFFICIAL_53_NEIGHBORHOODS.items(),
                key=lambda kv: len(kv[1]["name"]),
                reverse=True,
            )
            occupied_spans: List[Tuple[int, int]] = []
            for slug, meta in sorted_entries:
                cand_norm = _strip_accents_lower(meta["name"])
                for match in re.finditer(rf"\b{re.escape(cand_norm)}\b", q_norm):
                    s_idx, e_idx = match.span()
                    if any(not (e_idx <= os or s_idx >= oe) for os, oe in occupied_spans):
                        continue
                    occupied_spans.append((s_idx, e_idx))
                    if meta["name"] not in matched_neighborhoods:
                        matched_neighborhoods.append(meta["name"])

            if matched_neighborhoods:
                primary_name = matched_neighborhoods[0]
                for _, meta in OFFICIAL_53_NEIGHBORHOODS.items():
                    if meta["name"] == primary_name:
                        eff_lat, eff_lon = float(meta["lat"]), float(meta["lng"])
                        break

        # Termo léxico limpo para pg_trgm similarity
        lex_tokens = [
            w
            for w in re.split(r"[^a-z0-9]+", q_norm)
            if len(w) >= 3
            and w
            not in {
                "onde", "comer", "quais", "opcoes", "opcao", "estao", "disponiveis",
                "hoje", "ate", "reais", "mostre", "pratos", "que", "tiveram",
                "recentemente", "quero", "uma", "para", "com", "dos", "das",
            }
        ]
        lexical_query = " ".join(lex_tokens) if lex_tokens else q_norm

        return {
            "raw_query": raw_q,
            "lexical_query": lexical_query or "gastronomia caraguatatuba",
            "effective_lat": eff_lat,
            "effective_lon": eff_lon,
            "matched_neighborhoods": matched_neighborhoods,
            "max_price": resolved_max_price,
            "price_drop_only": price_drop_only,
            "dietary_filters": merged_diet,
            "dietary_operator": "OR" if has_disjunctive_or else "AND",
        }

    async def retrieve_svl_rrf(
        self,
        session: AsyncSession,
        query_text: str,
        user_lat: float = -23.6204,
        user_lon: float = -45.4132,
        neighborhood: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary_filters: Optional[Dict[str, bool]] = None,
        limit: int = 8,
    ) -> List[Dict[str, Any]]:
        """
        Executa a busca híbrida espacial-vetorial-léxica **SVL-RRF** diretamente
        no PostgreSQL 16 (PostGIS + pgvector + pg_trgm + unaccent) com travas
        determinísticas de Segurança Alimentar (Food Safety First).
        """
        intent = self.extract_implicit_intent(
            query_text=query_text,
            user_lat=user_lat,
            user_lon=user_lon,
            neighborhood=neighborhood,
            max_price=max_price,
            dietary_filters=dietary_filters,
        )

        q_vec = self.indexer.compute_semantic_embedding_1536(query_text or "prato especial caraguatatuba")
        q_vec_literal = "[" + ",".join(f"{v:.7f}" for v in q_vec) + "]"

        where_clauses: List[str] = [
            "r.is_active = TRUE",
            "d.is_available = TRUE",
            "d.requires_moderation = FALSE",
            "d.embedding IS NOT NULL",
        ]
        params: Dict[str, Any] = {
            "q_vec": q_vec_literal,
            "u_lat": intent["effective_lat"],
            "u_lon": intent["effective_lon"],
            "q_lex": intent["lexical_query"],
            "limit": max(1, min(30, int(limit))),
        }

        # Filtros determinísticos de Segurança Alimentar (pré-ranking vetorial)
        diet = intent["dietary_filters"]
        diet_clauses: List[str] = []
        if diet.get("is_vegan"):
            diet_clauses.append("d.is_vegan = TRUE")
        if diet.get("is_vegetarian"):
            diet_clauses.append("d.is_vegetarian = TRUE")
        if diet.get("is_gluten_free"):
            diet_clauses.append("d.is_gluten_free = TRUE")
        if diet.get("is_lactose_free"):
            diet_clauses.append("d.is_lactose_free = TRUE")

        if diet_clauses:
            joiner = " OR " if intent["dietary_operator"] == "OR" else " AND "
            where_clauses.append("(" + joiner.join(diet_clauses) + ")")

        if intent["max_price"] is not None:
            where_clauses.append("d.price <= :max_price")
            params["max_price"] = float(intent["max_price"])

        if intent["price_drop_only"]:
            where_clauses.append(
                "(COALESCE(d.last_price_delta_pct, 0) < 0 OR EXISTS ("
                "SELECT 1 FROM dish_price_history h WHERE h.dish_id = d.id AND h.delta_percentage < 0))"
            )

        if intent["matched_neighborhoods"]:
            neigh_lower = [n.lower() for n in intent["matched_neighborhoods"]]
            where_clauses.append("LOWER(r.neighborhood) = ANY(:neigh_list)")
            params["neigh_list"] = neigh_lower

        where_sql = " AND ".join(where_clauses)

        svl_rrf_sql = text(
            f"""
            WITH eligible_dishes AS (
                SELECT
                    d.id AS dish_id,
                    d.name AS dish_name,
                    d.description AS dish_description,
                    d.price AS dish_price,
                    d.category AS dish_category,
                    d.image_url AS dish_image_url,
                    d.is_vegan,
                    d.is_vegetarian,
                    d.is_gluten_free,
                    d.is_lactose_free,
                    d.smart_defaults,
                    COALESCE(d.last_price_delta_pct, 0.0)::float AS last_price_delta_pct,
                    r.id AS restaurant_id,
                    r.name AS restaurant_name,
                    r.slug AS restaurant_slug,
                    r.neighborhood AS neighborhood,
                    r.address AS restaurant_address,
                    r.latitude AS restaurant_lat,
                    r.longitude AS restaurant_lon,
                    COALESCE(r.bayesian_rating, 4.20)::float AS bayesian_rating,
                    COALESCE(r.rating_average, 4.20)::float AS rating_average,
                    GREATEST(COALESCE(r.review_count, 0), COALESCE(r.total_reviews, 0)) AS review_count,
                    (d.embedding <=> CAST(:q_vec AS vector))::float AS cosine_distance,
                    ST_Distance(
                        r.geom::geography,
                        ST_SetSRID(ST_MakePoint(:u_lon, :u_lat), 4326)::geography
                    )::float AS distance_meters,
                    GREATEST(
                        similarity(
                            unaccent(lower(d.name || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.category, ''))),
                            unaccent(lower(:q_lex))
                        ),
                        similarity(unaccent(lower(d.name)), unaccent(lower(:q_lex)))
                    )::float AS lexical_similarity
                FROM dishes d
                JOIN restaurants r ON r.id = d.restaurant_id
                WHERE {where_sql}
            ),
            ranked_candidates AS (
                SELECT
                    ed.*,
                    (ed.distance_meters + CASE
                        WHEN ed.distance_meters > 4000.0
                        THEN 1500.0 / (1.0 + EXP(-(ed.distance_meters - 4000.0) / 1500.0))
                        ELSE 0.0
                    END) AS penalized_geo_cost,
                    ROW_NUMBER() OVER (ORDER BY ed.cosine_distance ASC, ed.bayesian_rating DESC) AS k_vec,
                    ROW_NUMBER() OVER (
                        ORDER BY (
                            ed.distance_meters + CASE
                                WHEN ed.distance_meters > 4000.0
                                THEN 1500.0 / (1.0 + EXP(-(ed.distance_meters - 4000.0) / 1500.0))
                                ELSE 0.0
                            END
                        ) ASC,
                        ed.bayesian_rating DESC
                    ) AS k_geo,
                    ROW_NUMBER() OVER (ORDER BY ed.lexical_similarity DESC, ed.cosine_distance ASC) AS k_lex
                FROM eligible_dishes ed
            )
            SELECT
                rc.*,
                (
                    (0.50 / (60.0 + rc.k_vec))
                    + (0.30 / (60.0 + rc.k_geo))
                    + (0.20 / (60.0 + rc.k_lex))
                    + (0.005 * (rc.bayesian_rating / 5.0))
                )::float AS svl_rrf_score
            FROM ranked_candidates rc
            ORDER BY svl_rrf_score DESC
            LIMIT :limit;
            """
        )

        rows = (await session.execute(svl_rrf_sql, params)).mappings().all()

        # Se o filtro estrito de bairro mencionado não tinha itens, relaxa apenas o bairro mantendo 100% da dieta e preço!
        if not rows and intent["matched_neighborhoods"] and not neighborhood:
            fallback_clauses = [c for c in where_clauses if "LOWER(r.neighborhood)" not in c]
            fallback_params = {k: v for k, v in params.items() if k != "neigh_list"}
            fallback_sql = text(
                svl_rrf_sql.text.replace(f"WHERE {where_sql}", f"WHERE {' AND '.join(fallback_clauses)}")
            )
            rows = (await session.execute(fallback_sql, fallback_params)).mappings().all()

        recommendations: List[Dict[str, Any]] = []
        for row in rows:
            dist_m = round(float(row["distance_meters"]), 1)
            dist_km = round(dist_m / 1000.0, 2)
            diet_badges: List[str] = []
            if row["is_vegan"]:
                diet_badges.append("Vegano")
            if row["is_vegetarian"] and not row["is_vegan"]:
                diet_badges.append("Vegetariano")
            if row["is_gluten_free"]:
                diet_badges.append("Sem Glúten")
            if row["is_lactose_free"]:
                diet_badges.append("Zero Lactose")

            recommendations.append(
                {
                    "dish_id": str(row["dish_id"]),
                    "dish_name": row["dish_name"],
                    "description": row["dish_description"] or "",
                    "price": round(float(row["dish_price"]), 2),
                    "category": row["dish_category"],
                    "image_url": row["dish_image_url"],
                    "is_vegan": bool(row["is_vegan"]),
                    "is_vegetarian": bool(row["is_vegetarian"]),
                    "is_gluten_free": bool(row["is_gluten_free"]),
                    "is_lactose_free": bool(row["is_lactose_free"]),
                    "dietary_tags": diet_badges,
                    "smart_defaults": row["smart_defaults"] or [],
                    "last_price_delta_pct": round(float(row["last_price_delta_pct"]), 2),
                    "restaurant_id": str(row["restaurant_id"]),
                    "restaurant_name": row["restaurant_name"],
                    "restaurant_slug": row["restaurant_slug"],
                    "neighborhood": row["neighborhood"],
                    "restaurant_address": row["restaurant_address"],
                    "bayesian_rating": round(float(row["bayesian_rating"]), 2),
                    "rating_average": round(float(row["rating_average"]), 2),
                    "review_count": int(row["review_count"]),
                    "distance_meters": dist_m,
                    "distance_km": dist_km,
                    "rrf_breakdown": {
                        "svl_rrf_score": round(float(row["svl_rrf_score"]), 6),
                        "k_vec": int(row["k_vec"]),
                        "k_geo": int(row["k_geo"]),
                        "k_lex": int(row["k_lex"]),
                        "semantic_similarity": round(max(0.0, 1.0 - float(row["cosine_distance"])), 4),
                        "lexical_similarity": round(float(row["lexical_similarity"]), 4),
                    },
                }
            )

        return recommendations

    @staticmethod
    def synthesize_grounded_narrative(
        query_text: str,
        intent: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
    ) -> str:
        """
        Sintetizador determinístico consultivo em Português Brasileiro:
        100% ancorado nos registros reais recuperados pelo SVL-RRF (zero alucinação
        de preços, endereços ou segurança alimentar).
        """
        if not recommendations:
            active_diets = [k.replace("is_", "") for k, v in intent["dietary_filters"].items() if v]
            diet_note = f" com filtro ({', '.join(active_diets)})" if active_diets else ""
            price_note = f" até R$ {intent['max_price']:.2f}" if intent["max_price"] else ""
            return (
                f"Consultei o catálogo auditado de Caraguatatuba{diet_note}{price_note}, "
                f"mas não encontrei pratos aprovados que atendam simultaneamente a todos esses critérios "
                f"no momento. Tente ampliar a faixa de preço ou explorar todos os 53 bairros."
            )

        top = recommendations[0]
        header_parts: List[str] = [
            f"Encontrei **{len(recommendations)} opções auditadas** em Caraguatatuba via fusão espacial-vetorial **SVL-RRF**!"
        ]

        diet_active: List[str] = []
        if intent["dietary_filters"].get("is_vegan"):
            diet_active.append("Vegano")
        if intent["dietary_filters"].get("is_vegetarian"):
            diet_active.append("Vegetariano")
        if intent["dietary_filters"].get("is_gluten_free"):
            diet_active.append("Sem Glúten")
        if intent["dietary_filters"].get("is_lactose_free"):
            diet_active.append("Zero Lactose")
        if diet_active:
            op_txt = " ou " if intent["dietary_operator"] == "OR" else " + "
            header_parts.append(
                f"Trava SQL de Segurança Alimentar ativa: **{op_txt.join(diet_active)}**."
            )
        if intent["max_price"] is not None:
            header_parts.append(f"Orçamento máximo respeitado: **até R$ {intent['max_price']:.2f}**.")

        lines = [" ".join(header_parts), ""]
        for idx, item in enumerate(recommendations[:4], start=1):
            delta = item["last_price_delta_pct"]
            delta_badge = (
                f" *(queda auditada de {delta:.1f}%)*"
                if delta < 0
                else (f" *(ajuste de +{delta:.1f}%)*" if delta > 0 else "")
            )
            tags_txt = f" [{', '.join(item['dietary_tags'])}]" if item["dietary_tags"] else ""
            lines.append(
                f"{idx}. **{item['dish_name']}** — **R$ {item['price']:.2f}**{delta_badge}{tags_txt}\n"
                f"   📍 *{item['restaurant_name']}* ({item['neighborhood']}, {item['distance_km']:.2f} km) • "
                f"Nota Bayesiana $W_R$: **{item['bayesian_rating']:.2f}★** • "
                f"Score SVL-RRF: `{item['rrf_breakdown']['svl_rrf_score']:.4f}`."
            )

        lines.append(
            f"\nDestaque imediato: **{top['dish_name']}** no *{top['restaurant_name']}* "
            f"({top['restaurant_address']}, {top['neighborhood']}), combinando proximidade geodésica "
            f"({top['distance_meters']:.0f}m) e alta afinidade semântica."
        )
        return "\n".join(lines)

    def _try_ollama_grounded_generation(
        self,
        query_text: str,
        recommendations: List[Dict[str, Any]],
    ) -> Optional[str]:
        """Tenta síntese local via Ollama com orçamento de 650ms e circuit breaker de 60s."""
        now_mono = time.monotonic()
        if now_mono < self._ollama_chat_offline_until or not recommendations:
            return None

        context_lines = [
            f"- {r['dish_name']} | R$ {r['price']:.2f} | {r['restaurant_name']} ({r['neighborhood']}, {r['distance_km']} km) | Tags: {', '.join(r['dietary_tags']) or 'Tradicional'}"
            for r in recommendations[:4]
        ]
        prompt = (
            "Você é o assistente gastronômico hiperlocal do CaráFood em Caraguatatuba/SP. "
            "Responda em português de forma concisa citando EXCLUSIVAMENTE os pratos e preços abaixo:\n"
            + "\n".join(context_lines)
            + f"\nPergunta: {query_text}\nResposta:"
        )
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        body = json.dumps(
            {
                "model": getattr(settings, "OLLAMA_CHAT_MODEL", "llama3.2"),
                "prompt": prompt,
                "stream": False,
            }
        ).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=0.65) as resp:
                if resp.status != 200:
                    self._ollama_chat_offline_until = now_mono + 60.0
                    return None
                parsed = json.loads(resp.read().decode("utf-8"))
                answer = (parsed.get("response") or "").strip()
                return answer if len(answer) >= 20 else None
        except Exception:
            self._ollama_chat_offline_until = now_mono + 60.0
            return None

    async def stream_conversational_response(
        self,
        session: AsyncSession,
        query_text: str,
        user_lat: float = -23.6204,
        user_lon: float = -45.4132,
        neighborhood: Optional[str] = None,
        max_price: Optional[float] = None,
        dietary_filters: Optional[Dict[str, bool]] = None,
        limit: int = 8,
    ) -> AsyncGenerator[str, None]:
        """
        Gera stream Server-Sent Events (SSE) JSON estrito:
        - `{"type": "metadata", "intent": ..., "candidates_count": ..., "latency_ms": ..., "recommendations": [...]}`
        - `{"type": "token", "content": "..."}`
        - `{"type": "done"}`
        """
        t0 = time.perf_counter()
        intent = self.extract_implicit_intent(
            query_text=query_text,
            user_lat=user_lat,
            user_lon=user_lon,
            neighborhood=neighborhood,
            max_price=max_price,
            dietary_filters=dietary_filters,
        )
        recommendations = await self.retrieve_svl_rrf(
            session=session,
            query_text=query_text,
            user_lat=user_lat,
            user_lon=user_lon,
            neighborhood=neighborhood,
            max_price=max_price,
            dietary_filters=dietary_filters,
            limit=limit,
        )
        retrieval_ms = round((time.perf_counter() - t0) * 1000.0, 2)

        metadata_event = {
            "type": "metadata",
            "intent": intent,
            "candidates_count": len(recommendations),
            "latency_ms": retrieval_ms,
            "recommendations": recommendations,
        }
        yield f"data: {json.dumps(metadata_event, ensure_ascii=False)}\n\n"

        ollama_answer = await asyncio.to_thread(
            self._try_ollama_grounded_generation, query_text, recommendations
        )
        full_answer = ollama_answer or self.synthesize_grounded_narrative(
            query_text=query_text,
            intent=intent,
            recommendations=recommendations,
        )

        # Emite tokens em blocos fluidos para renderização progressiva no Drawer Next.js
        chunks = re.findall(r"\S+\s*|\n", full_answer)
        step = 3
        for idx in range(0, len(chunks), step):
            piece = "".join(chunks[idx : idx + step])
            token_event = {"type": "token", "content": piece}
            yield f"data: {json.dumps(token_event, ensure_ascii=False)}\n\n"

        total_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        done_event = {"type": "done", "total_latency_ms": total_ms}
        yield f"data: {json.dumps(done_event, ensure_ascii=False)}\n\n"


hybrid_rag_engine = HybridRAGEngine()
