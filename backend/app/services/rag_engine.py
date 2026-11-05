"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A2.2: MOTOR RAG HÍBRIDO SVL-RRF + OLLAMA LOCAL
==============================================================================
Implementa `HybridRAGEngine`:
1. Extração determinística de intenções implícitas em Português Brasileiro:
   - Restrições de Segurança Alimentar (`is_vegan`, `is_vegetarian`, `is_gluten_free`, `is_lactose_free`),
     suportando lógica conjuntiva (AND) e disjuntiva (OR, ex: "sem lactose ou veganas").
   - Orçamento máximo ("até R$ 60", "barato") e radar de deflação ("queda de preço").
   - Resolução topológica de um ou múltiplos bairros entre os 53 oficiais de Caraguatatuba.
   - Detecção inteligente de escopo de restaurante único ("O que pedir hoje no Quiosque Baleia Branca?")
     vs. descoberta diversificada pela cidade.
2. Busca Híbrida Unificada via CTE SQL no PostgreSQL 16 (**SVL-RRF**):
   Score_SVL(d_i) = 0.50/(60 + k_vec) + 0.30/(60 + k_geo) + 0.20/(60 + k_lex) + 0.005*(W_R/5.0)
3. Inferência Generativa Local Real via **Ollama (`qwen2.5:3b` / `llama3.2`)** em `127.0.0.1:11434`:
   - Auto-bootstrapping do daemon `ollama serve` se instalado no host Windows/Linux.
   - Streaming SSE real token-a-token (`stream=True`) direto do modelo local para o navegador.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import subprocess
import time
import unicodedata
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.vector_indexer import VectorIndexingService, vector_indexing_service
from app.workers.seed_discovery import OFFICIAL_53_NEIGHBORHOODS

logger = logging.getLogger("rag_engine")
logger.setLevel(logging.INFO)
if not logger.handlers:
    _console_handler = logging.StreamHandler()
    _console_handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )
    logger.addHandler(_console_handler)


def _strip_accents_lower(value: str) -> str:
    nfkd = unicodedata.normalize("NFKD", value or "")
    return nfkd.encode("ascii", "ignore").decode("ascii").lower()


def _normalize_sides_list(raw_sides: Any) -> List[str]:
    if not raw_sides or not isinstance(raw_sides, list):
        return []
    out: List[str] = []
    for item in raw_sides:
        if isinstance(item, str) and item.strip():
            out.append(item.strip())
        elif isinstance(item, dict):
            label = item.get("name") or item.get("label") or item.get("item")
            if isinstance(label, str) and label.strip():
                out.append(label.strip())
    return out


def _normalize_ollama_url(raw_url: str) -> str:
    # Em Windows, 127.0.0.1 evita atraso de 2s na resolução IPv6 (::1) de localhost
    cleaned = (raw_url or "http://127.0.0.1:11434").rstrip("/")
    return cleaned.replace("://localhost:", "://127.0.0.1:")


def _find_ollama_executable() -> Optional[str]:
    found = shutil.which("ollama")
    if found:
        return found
    if os.name == "nt":
        local_app = os.environ.get("LOCALAPPDATA", "")
        cand = Path(local_app) / "Programs" / "Ollama" / "ollama.exe"
        if cand.exists():
            return str(cand)
        user_cand = Path.home() / "AppData" / "Local" / "Programs" / "Ollama" / "ollama.exe"
        if user_cand.exists():
            return str(user_cand)
    return None


PREFERRED_LOCAL_MODELS: Tuple[str, ...] = (
    "qwen2.5:3b",
    "qwen2.5:7b",
    "qwen2.5:1.5b",
    "llama3.2:3b",
    "gemma2:2b",
    "llama3.2:1b",
    "llama3.2:latest",
)


class HybridRAGEngine:
    """
    Motor de Recuperação e Geração Aumentada Hiperlocal (PostGIS + pgvector + pg_trgm + Ollama Local).
    """

    ALPHA_VEC: float = 0.50
    ALPHA_GEO: float = 0.30
    ALPHA_LEX: float = 0.20
    KAPPA_RRF: float = 60.0
    GAMMA_BAYESIAN: float = 0.005

    def __init__(self, indexer: Optional[VectorIndexingService] = None) -> None:
        self.indexer = indexer or vector_indexing_service
        self._ollama_base_url: str = _normalize_ollama_url(settings.OLLAMA_BASE_URL)
        self._active_ollama_model: Optional[str] = None
        self._ollama_online: bool = False
        self._ollama_offline_until: float = 0.0
        self._boot_lock = asyncio.Lock()

    @property
    def active_llm_info(self) -> Dict[str, Any]:
        return {
            "ollama_online": self._ollama_online,
            "active_model": self._active_ollama_model,
            "endpoint": self._ollama_base_url,
            "mode": "local_pc" if self._ollama_online and self._active_ollama_model else "instant_local_fallback",
        }

    async def ensure_ollama_ready(self, warmup: bool = False) -> Optional[str]:
        """
        Verifica se o servidor local Ollama está respondendo em 127.0.0.1:11434.
        Se estiver parado e o binário `ollama` existir na máquina do usuário,
        inicia `ollama serve` automaticamente em background e seleciona o melhor modelo local.
        """
        now_mono = time.monotonic()
        if self._ollama_online and self._active_ollama_model and not warmup:
            return self._active_ollama_model
        if now_mono < self._ollama_offline_until and not warmup:
            return None

        async with self._boot_lock:
            models = await self._probe_ollama_models()
            if models is None:
                ollama_bin = _find_ollama_executable()
                if ollama_bin:
                    logger.info(
                        f"[LOCAL LLM • OLLAMA] Servidor 127.0.0.1:11434 parado. Iniciando '{ollama_bin} serve' no PC..."
                    )
                    try:
                        env = os.environ.copy()
                        env["OLLAMA_HOST"] = "127.0.0.1:11434"
                        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
                        subprocess.Popen(
                            [ollama_bin, "serve"],
                            env=env,
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                            creationflags=creationflags,
                        )
                        for _ in range(10):
                            await asyncio.sleep(0.45)
                            models = await self._probe_ollama_models()
                            if models is not None:
                                break
                    except Exception as exc:
                        logger.warning(f"[LOCAL LLM • OLLAMA] Falha ao iniciar daemon local: {exc}")

            if not models:
                self._ollama_online = False
                self._active_ollama_model = None
                self._ollama_offline_until = time.monotonic() + 15.0
                return None

            chosen = self._select_best_model(models)
            self._active_ollama_model = chosen
            self._ollama_online = True
            self._ollama_offline_until = 0.0
            logger.info(
                f"[LOCAL LLM • OLLAMA] Online em {self._ollama_base_url} | Modelo ativo no PC: '{chosen}' (disponíveis: {models})"
            )

            if warmup and chosen:
                try:
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        await client.post(
                            f"{self._ollama_base_url}/api/chat",
                            json={
                                "model": chosen,
                                "keep_alive": "60m",
                                "stream": False,
                                "options": {"num_predict": 4, "num_ctx": 1024},
                                "messages": [{"role": "user", "content": "Oi"}],
                            },
                        )
                    logger.info(f"[LOCAL LLM • OLLAMA] Modelo '{chosen}' aquecido em memória RAM/VRAM (keep_alive=60m).")
                except Exception as exc:
                    logger.warning(f"[LOCAL LLM • OLLAMA] Aquecimento inicial ignorado: {exc}")

            return chosen

    async def _probe_ollama_models(self) -> Optional[List[str]]:
        try:
            async with httpx.AsyncClient(timeout=1.4) as client:
                resp = await client.get(f"{self._ollama_base_url}/api/tags")
                if resp.status_code != 200:
                    return None
                data = resp.json()
                return [
                    str(m.get("name"))
                    for m in data.get("models", [])
                    if m.get("name")
                ]
        except Exception:
            return None

    @staticmethod
    def _select_best_model(installed_models: List[str]) -> str:
        configured = (getattr(settings, "OLLAMA_CHAT_MODEL", "") or "").strip()
        if configured and configured in installed_models:
            return configured
        for pref in PREFERRED_LOCAL_MODELS:
            if pref in installed_models:
                return pref
        for pref in ("qwen2.5", "gemma2", "llama3.2", "llama3"):
            for inst in installed_models:
                if inst.startswith(pref):
                    return inst
        return installed_models[0]

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

        active_inferred_keys = [k for k, v in inferred_flags.items() if v]
        has_disjunctive_or = (
            not any(explicit_diet.values())
            and len(active_inferred_keys) >= 2
            and bool(re.search(r"\b(?:ou)\b", q_norm))
        )

        merged_diet: Dict[str, bool] = {}
        for key in ("is_vegan", "is_vegetarian", "is_gluten_free", "is_lactose_free"):
            merged_diet[key] = bool(explicit_diet.get(key, False) or inferred_flags.get(key, False))

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

        price_drop_only = bool(
            re.search(
                r"\b(?:queda\s+de\s+preco|quedas\s+de\s+preco|baixou\s+de\s+preco|baixaram\s+de\s+preco|reducao\s+de\s+preco|deflacao)\b",
                q_norm,
            )
        )

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
                    if any(not (e_idx <= os_i or s_idx >= oe_i) for os_i, oe_i in occupied_spans):
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

        lex_tokens = [
            w
            for w in re.split(r"[^a-z0-9]+", q_norm)
            if len(w) >= 3
            and w
            not in {
                "onde", "comer", "quais", "opcoes", "opcao", "estao", "disponiveis",
                "hoje", "ate", "reais", "mostre", "pratos", "que", "tiveram",
                "recentemente", "quero", "uma", "para", "com", "dos", "das",
                "voce", "recomenda", "pedir", "vale", "pena", "mais",
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

    async def _detect_target_restaurant(
        self,
        session: AsyncSession,
        query_text: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Verifica se o cliente perguntou especificamente pelo cardápio de um estabelecimento
        (ex: 'O que você me recomenda pedir hoje no Quiosque Baleia Branca em Martim de Sá?').
        Porém, se a consulta também citar o nome de um prato específico (ex: 'Casquinha de Siri Quiosque da Filó'),
        mantém a busca aberta para não bloquear o ranking por prato exato.
        """
        q_norm = _strip_accents_lower(query_text)
        if len(q_norm) < 6:
            return None

        # Só restringe a 1 restaurante quando houver intenção explícita de recomendação naquele local
        explicit_place_ask = bool(
            re.search(
                r"\b(?:no|na|do|da|cardapio\s+d[oa]|pedir\s+n[oa]|recomenda\s+n[oa]|tem\s+n[oa])\b",
                q_norm,
            )
        )
        if not explicit_place_ask:
            return None

        rows = (
            await session.execute(
                text(
                    "SELECT id, name, slug, neighborhood FROM restaurants WHERE is_active = TRUE"
                )
            )
        ).mappings().all()

        candidates: List[Tuple[int, Dict[str, Any]]] = []
        for r in rows:
            r_norm = _strip_accents_lower(r["name"])
            if not r_norm or len(r_norm) < 4:
                continue
            if len(r_norm) >= 8:
                if re.search(rf"\b{re.escape(r_norm)}\b", q_norm):
                    candidates.append((len(r_norm), dict(r)))
            else:
                if re.search(rf"\b(?:no|na|do|da)\s+{re.escape(r_norm)}\b", q_norm):
                    candidates.append((len(r_norm), dict(r)))

        if not candidates:
            return None

        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1]

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
        Executa a busca híbrida espacial-vetorial-léxica **SVL-RRF** no PostgreSQL 16.
        Se o cliente perguntou especificamente por um restaurante, foca 100% no cardápio dele;
        caso contrário, diversifica entre diferentes estabelecimentos da cidade/bairro.
        """
        intent = self.extract_implicit_intent(
            query_text=query_text,
            user_lat=user_lat,
            user_lon=user_lon,
            neighborhood=neighborhood,
            max_price=max_price,
            dietary_filters=dietary_filters,
        )

        target_rest = await self._detect_target_restaurant(session, query_text)

        q_vec = self.indexer.compute_semantic_embedding_1536(
            query_text or "prato especial caraguatatuba"
        )
        q_vec_literal = "[" + ",".join(f"{v:.7f}" for v in q_vec) + "]"

        where_clauses: List[str] = [
            "r.is_active = TRUE",
            "d.is_available = TRUE",
            "d.requires_moderation = FALSE",
            "d.embedding IS NOT NULL",
        ]
        sql_limit = max(12, min(40, int(limit) * 3))
        params: Dict[str, Any] = {
            "q_vec": q_vec_literal,
            "u_lat": intent["effective_lat"],
            "u_lon": intent["effective_lon"],
            "q_lex": intent["lexical_query"],
            "limit": sql_limit,
        }

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

        if target_rest is not None:
            where_clauses.append("r.id = :target_rest_id")
            params["target_rest_id"] = target_rest["id"]
        elif intent["matched_neighborhoods"]:
            neigh_lower = [n.lower() for n in intent["matched_neighborhoods"]]
            params["neigh_list"] = neigh_lower
            if neighborhood:
                where_clauses.append("LOWER(r.neighborhood) = ANY(:neigh_list)")
            else:
                neigh_like = [f"%{_strip_accents_lower(n)}%" for n in intent["matched_neighborhoods"]]
                params["neigh_like_list"] = neigh_like
                where_clauses.append(
                    "(LOWER(r.neighborhood) = ANY(:neigh_list) "
                    "OR unaccent(LOWER(r.name)) LIKE ANY(:neigh_like_list) "
                    "OR unaccent(LOWER(d.name)) LIKE ANY(:neigh_like_list))"
                )

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
                    COALESCE(r.source_platform, '') AS source_platform,
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
                            unaccent(lower(d.name || ' ' || r.name || ' ' || COALESCE(d.description, '') || ' ' || COALESCE(d.category, ''))),
                            unaccent(lower(:q_lex))
                        ),
                        similarity(unaccent(lower(d.name)), unaccent(lower(:q_lex))),
                        similarity(unaccent(lower(d.name || ' ' || r.name)), unaccent(lower(:q_lex)))
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
                    + (CASE WHEN rc.source_platform ILIKE 'osm%' THEN 0.003 ELSE 0.0 END)
                    + (CASE WHEN rc.lexical_similarity >= 0.72 THEN 0.025 * rc.lexical_similarity ELSE 0.0 END)
                )::float AS svl_rrf_score
            FROM ranked_candidates rc
            ORDER BY svl_rrf_score DESC
            LIMIT :limit;
            """
        )

        rows = list((await session.execute(svl_rrf_sql, params)).mappings().all())

        if not rows and intent["matched_neighborhoods"] and not neighborhood and target_rest is None:
            fallback_clauses = [c for c in where_clauses if "LOWER(r.neighborhood)" not in c]
            fallback_params = {
                k: v for k, v in params.items() if k not in ("neigh_list", "neigh_like_list")
            }
            fallback_sql = text(
                svl_rrf_sql.text.replace(
                    f"WHERE {where_sql}", f"WHERE {' AND '.join(fallback_clauses)}"
                )
            )
            rows = list((await session.execute(fallback_sql, fallback_params)).mappings().all())

        # Diversificação inteligente quando a pergunta é aberta (evita repetir 6 pratos do mesmo local)
        final_limit = max(1, min(20, int(limit)))
        if target_rest is None and len(rows) > final_limit:
            has_exact_dish_hit = any(float(r["lexical_similarity"]) >= 0.72 for r in rows[:2])
            if not has_exact_dish_hit:
                per_rest_counts: Dict[str, int] = {}
                diversified: List[Any] = []
                overflow: List[Any] = []
                for r in rows:
                    rid = str(r["restaurant_id"])
                    cnt = per_rest_counts.get(rid, 0)
                    if cnt < 2:
                        diversified.append(r)
                        per_rest_counts[rid] = cnt + 1
                    else:
                        overflow.append(r)
                rows = (diversified + overflow)[:final_limit]
            else:
                rows = rows[:final_limit]
        else:
            rows = rows[:final_limit]

        recommendations: List[Dict[str, Any]] = []
        for row in rows:
            dist_m = round(float(row["distance_meters"]), 1)
            dist_km = round(dist_m / 1000.0, 2)
            delta_pct = round(float(row["last_price_delta_pct"]), 2)
            rating_val = round(float(row["bayesian_rating"]), 2)
            neigh_name = row["neighborhood"] or "Centro"

            diet_badges: List[str] = []
            if row["is_vegan"]:
                diet_badges.append("Vegano")
            if row["is_vegetarian"] and not row["is_vegan"]:
                diet_badges.append("Vegetariano")
            if row["is_gluten_free"]:
                diet_badges.append("Sem Glúten")
            if row["is_lactose_free"]:
                diet_badges.append("Sem Lactose")

            if delta_pct < 0:
                friendly_match_label = "Baixou de preço"
            elif row["is_vegan"]:
                friendly_match_label = "100% Vegano"
            elif dist_m <= 950:
                friendly_match_label = "Pertinho de você"
            elif rating_val >= 4.70:
                friendly_match_label = "Super recomendado"
            else:
                friendly_match_label = "Combina com você"

            if dist_m < 1000.0:
                rounded_m = max(50, int(round(dist_m / 10.0) * 10))
                distance_label = f"A {rounded_m}m de você • {neigh_name}"
            else:
                km_fmt = f"{dist_km:.1f}".replace(".", ",")
                distance_label = f"A {km_fmt} km • {neigh_name}"

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
                    "smart_defaults": _normalize_sides_list(row["smart_defaults"]),
                    "suggested_sides": _normalize_sides_list(row["smart_defaults"]),
                    "last_price_delta_pct": delta_pct,
                    "friendly_match_label": friendly_match_label,
                    "distance_label": distance_label,
                    "restaurant_id": str(row["restaurant_id"]),
                    "restaurant_name": row["restaurant_name"],
                    "restaurant_slug": row["restaurant_slug"],
                    "neighborhood": neigh_name,
                    "restaurant_address": row["restaurant_address"],
                    "rating_score": rating_val,
                    "bayesian_rating": rating_val,
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
    def _build_ollama_messages(
        query_text: str,
        intent: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
    ) -> List[Dict[str, str]]:
        unique_rests = list(dict.fromkeys(r["restaurant_name"] for r in recommendations))
        is_single_place = len(unique_rests) == 1

        context_lines: List[str] = []
        for r in recommendations[:5]:
            price_fmt = f"R$ {r['price']:.2f}".replace(".", ",")
            extras: List[str] = []
            if r["last_price_delta_pct"] < 0:
                extras.append("baixou de preço hoje")
            if r["dietary_tags"]:
                extras.append(", ".join(r["dietary_tags"]))
            if r.get("suggested_sides"):
                extras.append("acompanha: " + ", ".join(r["suggested_sides"][:2]))
            extra_str = f" | {' • '.join(extras)}" if extras else ""
            context_lines.append(
                f"- Prato: {r['dish_name']} | Valor: {price_fmt} | Local: {r['restaurant_name']} ({r['neighborhood']}){extra_str}"
            )

        scope_hint = (
            f"O cliente pediu recomendação especificamente dentro do estabelecimento '{unique_rests[0]}' ({recommendations[0]['neighborhood']}). "
            f"Fale apenas sobre este estabelecimento (NÃO diga 'separei vários lugares')."
            if is_single_place
            else f"Foram selecionadas opções em {len(unique_rests)} estabelecimentos diferentes de Caraguatatuba ({', '.join(unique_rests[:4])})."
        )

        system_prompt = (
            "Você é o Chef CaráFood, um chef e amigo morador de Caraguatatuba/SP que dá dicas sinceras e apetitosas de onde comer. "
            "Responda em português brasileiro caloroso, natural e direto, em 2 parágrafos curtos (máximo de 80 palavras no total). "
            "Cite de 2 a 3 pratos pelo nome e valor exato (R$ XX,XX) que estão nos dados abaixo, comentando por que valem a pena. "
            "Não escreva listas numeradas (1., 2., 3.) nem repita endereços/estrelas em tópicos, porque os cartões clicáveis dos pratos já aparecem logo abaixo da sua mensagem. "
            "Use estritamente os pratos e valores fornecidos no cardápio abaixo."
        )

        user_prompt = (
            f"Contexto da busca: {scope_hint}\n"
            f"Cardápios reais conferidos agora:\n"
            + "\n".join(context_lines)
            + f"\n\nPergunta do cliente: {query_text}\n"
            "Sua recomendação conversacional como Chef CaráFood:"
        )
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

    @staticmethod
    def synthesize_grounded_narrative(
        query_text: str,
        intent: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
    ) -> str:
        """
        Síntese conversacional fluida, coerente com o número real de restaurantes retornados
        e sem listas numeradas redundantes nem asteriscos crus.
        """
        diet_names_map = {
            "is_vegan": "vegano",
            "is_vegetarian": "vegetariano",
            "is_gluten_free": "sem glúten",
            "is_lactose_free": "sem lactose",
        }
        active_diets = [
            label for key, label in diet_names_map.items() if intent["dietary_filters"].get(key)
        ]

        if not recommendations:
            diet_note = f" ({', '.join(active_diets)})" if active_diets else ""
            price_note = (
                f" até R$ {intent['max_price']:.2f}".replace(".", ",")
                if intent["max_price"]
                else ""
            )
            return (
                f"Dei uma boa olhada nos cardápios abertos hoje em Caraguá{diet_note}{price_note}, "
                f"mas não achei nenhum prato que junte todos esses filtros ao mesmo tempo agora. "
                f"Experimente ampliar um pouquinho a faixa de valor ou olhar também nos bairros vizinhos!"
            )

        unique_rests = list(dict.fromkeys(r["restaurant_name"] for r in recommendations))
        top = recommendations[0]
        top_price = f"R$ {top['price']:.2f}".replace(".", ",")
        second = recommendations[1] if len(recommendations) > 1 else None

        # Caso 1: Todos os pratos vêm de UM único restaurante (ex.: cliente clicou em "Pedir dica daqui")
        if len(unique_rests) == 1:
            place_name = top["restaurant_name"]
            neigh = top["neighborhood"]
            sides = (
                f", que acompanha {', '.join(top['suggested_sides'][:2]).lower()}"
                if top.get("suggested_sides")
                else ""
            )
            drop_note = (
                " — e o preço dele acabou de baixar hoje"
                if top["last_price_delta_pct"] < 0
                else ""
            )
            p1 = (
                f"Mandou muito bem na escolha! Lá no **{place_name}**, em {neigh}, "
                f"meu pedido favorito hoje é **{top['dish_name']}** ({top_price}{drop_note}){sides}."
            )
            if second:
                sec_price = f"R$ {second['price']:.2f}".replace(".", ",")
                p2 = (
                    f"Se quiser variar, **{second['dish_name']}** ({sec_price}) também sai super caprichado da cozinha deles. "
                    f"Deixei as melhores opções do cardápio logo abaixo para você abrir!"
                )
                return f"{p1}\n\n{p2}"
            return f"{p1} Toque no prato logo abaixo para abrir o cardápio completo!"

        # Caso 2: Descoberta entre vários restaurantes diferentes de Caraguá
        diet_sentence = ""
        if active_diets:
            op_txt = " ou " if intent["dietary_operator"] == "OR" else " e "
            diet_sentence = f" conferindo só opções **{op_txt.join(active_diets)}** para você pedir tranquilo,"

        budget_sentence = ""
        if intent["max_price"] is not None:
            max_fmt = f"R$ {intent['max_price']:.2f}".replace(".", ",")
            budget_sentence = f" dentro da faixa de até **{max_fmt}**,"

        drop_txt = (
            " (que está com preço reduzido essa semana!)"
            if top["last_price_delta_pct"] < 0
            else ""
        )
        p1 = (
            f"Dei um giro pelos cardápios abertos em Caraguá,{diet_sentence}{budget_sentence} e encontrei "
            f"**{len(unique_rests)} lugares ótimos**! Minha primeira dica é **{top['dish_name']}** ({top_price}){drop_txt}, "
            f"servido no **{top['restaurant_name']}** ({top['neighborhood']})."
        )

        diff_second = next(
            (r for r in recommendations[1:] if r["restaurant_name"] != top["restaurant_name"]),
            second,
        )
        if diff_second:
            s_price = f"R$ {diff_second['price']:.2f}".replace(".", ",")
            p2 = (
                f"Outra pedida certeira é **{diff_second['dish_name']}** ({s_price}) no "
                f"**{diff_second['restaurant_name']}** ({diff_second['neighborhood']}). "
                f"Confira os pratos logo abaixo e clique no seu preferido para ver o cardápio completo!"
            )
            return f"{p1}\n\n{p2}"

        return f"{p1} Clique em qualquer sugestão abaixo para ver o cardápio completo!"

    async def generate_ollama_sync(
        self,
        query_text: str,
        intent: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
    ) -> Optional[str]:
        if not recommendations:
            return None
        model_name = await self.ensure_ollama_ready(warmup=False)
        if not model_name:
            return None

        messages = self._build_ollama_messages(query_text, intent, recommendations)
        t0 = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=18.0) as client:
                resp = await client.post(
                    f"{self._ollama_base_url}/api/chat",
                    json={
                        "model": model_name,
                        "keep_alive": "60m",
                        "stream": False,
                        "options": {
                            "temperature": 0.32,
                            "num_predict": 160,
                            "num_ctx": 1536,
                        },
                        "messages": messages,
                    },
                )
                if resp.status_code != 200:
                    return None
                text_out = (resp.json().get("message", {}).get("content") or "").strip()
                elapsed_ms = (time.perf_counter() - t0) * 1000.0
                logger.info(
                    f"[LOCAL LLM • OLLAMA] Síntese síncrona via '{model_name}' em {elapsed_ms:.0f}ms"
                )
                return text_out if len(text_out) >= 25 else None
        except Exception as exc:
            logger.warning(f"[LOCAL LLM • OLLAMA] Erro na geração síncrona: {exc}")
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
        Gera stream Server-Sent Events (SSE) em tempo real:
        1. Recupera pratos reais verificados no PostgreSQL em ~18ms (`metadata`).
        2. Faz streaming ao vivo token-a-token direto do LLM local **Ollama (`qwen2.5:3b`)**
           rodando na máquina do usuário (`127.0.0.1:11434`).
        3. Finaliza com `done` registrando telemetria completa no terminal.
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

        model_name = await self.ensure_ollama_ready(warmup=False) if recommendations else None

        metadata_event = {
            "type": "metadata",
            "intent": intent,
            "candidates_count": len(recommendations),
            "latency_ms": retrieval_ms,
            "llm_mode": "local_pc" if model_name else "instant",
            "recommendations": recommendations,
        }
        yield f"data: {json.dumps(metadata_event, ensure_ascii=False)}\n\n"

        streamed_via_ollama = False
        if model_name and recommendations:
            messages = self._build_ollama_messages(query_text, intent, recommendations)
            logger.info(
                f"[LOCAL LLM • OLLAMA] Iniciando streaming ao vivo no PC via '{model_name}' | Pergunta: {query_text!r}"
            )
            t_llm = time.perf_counter()
            ttft_ms: Optional[float] = None
            collected_chars = 0

            try:
                timeout_cfg = httpx.Timeout(connect=1.5, read=25.0, write=5.0, pool=5.0)
                async with httpx.AsyncClient(timeout=timeout_cfg) as client:
                    async with client.stream(
                        "POST",
                        f"{self._ollama_base_url}/api/chat",
                        json={
                            "model": model_name,
                            "keep_alive": "60m",
                            "stream": True,
                            "options": {
                                "temperature": 0.32,
                                "num_predict": 135,
                                "num_ctx": 1024,
                            },
                            "messages": messages,
                        },
                    ) as resp:
                        if resp.status_code == 200:
                            async for raw_line in resp.aiter_lines():
                                if not raw_line:
                                    continue
                                pkt = json.loads(raw_line)
                                piece = pkt.get("message", {}).get("content", "")
                                if piece:
                                    if ttft_ms is None:
                                        ttft_ms = (time.perf_counter() - t_llm) * 1000.0
                                    collected_chars += len(piece)
                                    streamed_via_ollama = True
                                    token_event = {"type": "token", "content": piece}
                                    yield f"data: {json.dumps(token_event, ensure_ascii=False)}\n\n"
                                if pkt.get("done"):
                                    break

                if streamed_via_ollama and collected_chars >= 15:
                    llm_total_ms = (time.perf_counter() - t_llm) * 1000.0
                    logger.info(
                        f"[LOCAL LLM • OLLAMA] Streaming concluído via '{model_name}' "
                        f"(TTFT={ttft_ms or 0:.0f}ms, Total LLM={llm_total_ms:.0f}ms, {collected_chars} chars)"
                    )
                elif not streamed_via_ollama:
                    logger.warning("[LOCAL LLM • OLLAMA] Resposta vazia do Ollama; acionando narrativa local.")
            except Exception as exc:
                logger.warning(f"[LOCAL LLM • OLLAMA] Falha durante stream Ollama ({exc}); acionando fallback.")
                self._ollama_online = False
                self._ollama_offline_until = time.monotonic() + 10.0

        if not streamed_via_ollama:
            fallback_text = self.synthesize_grounded_narrative(
                query_text=query_text,
                intent=intent,
                recommendations=recommendations,
            )
            chunks = re.findall(r"\S+\s*|\n", fallback_text)
            for idx in range(0, len(chunks), 3):
                piece = "".join(chunks[idx : idx + 3])
                token_event = {"type": "token", "content": piece}
                yield f"data: {json.dumps(token_event, ensure_ascii=False)}\n\n"

        total_ms = round((time.perf_counter() - t0) * 1000.0, 2)
        done_event = {
            "type": "done",
            "total_latency_ms": total_ms,
            "llm_mode": "local_pc" if streamed_via_ollama else "instant",
        }
        yield f"data: {json.dumps(done_event, ensure_ascii=False)}\n\n"


hybrid_rag_engine = HybridRAGEngine()
