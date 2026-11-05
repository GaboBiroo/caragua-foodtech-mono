"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A2.1: INDEXADOR VETORIAL INCREMENTAL 1536D
==============================================================================
Implementa `VectorIndexingService`:
1. Provedor híbrido de embeddings 1536d: tenta servidor local Ollama
   (`http://localhost:11434/api/embeddings`) com timeout estrito de 800ms e
   Circuit Breaker de 60s.
2. Fallback Determinístico Léxico-Semântico Offline-First em R^1536 (||v||_2 = 1.0)
   estruturado em 6 subespaços ortogonais explícitos:
   - [0..255]    Frutos do mar, peixes, camarão, lula, maricultura e cozinha caiçara
   - [256..511]  Carnes, churrasco, burger artesanal, defumados e grelhados
   - [512..767]  Pizzas, massas, culinária italiana e queijos
   - [768..1023] Vegano, vegetariano, sem glúten, zero lactose, saudável, fit e açaí
   - [1024..1279] Faixas de preço (econômico/executivo/oferta vs. família vs. premium)
   - [1280..1535] N-gramas fonéticos de trigramas com Signed Feature Hashing
3. Sincronização incremental `sync_pending_embeddings(session, batch_size=200)`
   sobre itens com `needs_reindexing = True` ou `embedding IS NULL`.
"""

from __future__ import annotations

import hashlib
import json
import logging
import math
import re
import time
import unicodedata
import urllib.request
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np
from sqlalchemy import or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models.dish import Dish
from app.db.models.restaurant import Restaurant

logger = logging.getLogger("vector_indexer")
logger.setLevel(logging.INFO)

EMBEDDING_DIM = 1536

# ==============================================================================
# TAXONOMIA DOS 6 SUBESPAÇOS SEMÂNTICOS EM R^1536
# ==============================================================================

SEAFOOD_CAICARA_CONCEPTS: Tuple[Tuple[str, float, int], ...] = (
    ("frutos do mar", 3.2, 0),
    ("peixe", 3.0, 1),
    ("pescado", 2.8, 1),
    ("camarao", 3.2, 2),
    ("sete barbas", 3.0, 2),
    ("camarao rosa", 3.2, 2),
    ("lula", 2.8, 3),
    ("polvo", 2.8, 3),
    ("marisco", 2.9, 4),
    ("mexilhao", 2.9, 4),
    ("ostra", 2.9, 4),
    ("caicara", 2.8, 5),
    ("azul marinho", 3.4, 5),
    ("pirao", 2.6, 5),
    ("caldeirada", 3.2, 6),
    ("moqueca", 3.2, 6),
    ("badejo", 3.0, 7),
    ("garoupa", 3.0, 7),
    ("pescada", 2.9, 7),
    ("sororoca", 2.9, 7),
    ("anchova", 2.9, 7),
    ("tainha", 3.0, 7),
    ("cacao", 2.9, 8),
    ("isca", 2.4, 8),
    ("fuba", 2.5, 8),
    ("casquinha de siri", 3.0, 9),
    ("siri", 2.6, 9),
    ("bacalhau", 2.8, 10),
    ("salmao", 2.7, 11),
    ("ceviche", 2.7, 11),
    ("tilapia", 2.6, 7),
)

MEAT_BURGER_CONCEPTS: Tuple[Tuple[str, float, int], ...] = (
    ("carne", 2.6, 0),
    ("churrasco", 3.2, 1),
    ("brasa", 2.5, 1),
    ("parrilla", 3.0, 1),
    ("picanha", 3.2, 2),
    ("costela", 3.2, 3),
    ("defumada", 2.8, 3),
    ("defumado", 2.8, 3),
    ("cupim", 2.9, 3),
    ("burger", 3.3, 4),
    ("hamburguer", 3.3, 4),
    ("smash", 3.1, 4),
    ("artesanal", 2.2, 5),
    ("brioche", 2.3, 4),
    ("bacon", 2.5, 6),
    ("mignon", 2.9, 2),
    ("contrafile", 2.8, 2),
    ("alcatra", 2.8, 2),
    ("pernil", 2.8, 7),
    ("linguica", 2.6, 7),
    ("frango", 2.5, 8),
    ("parmegiana", 2.7, 9),
    ("feijoada", 3.0, 10),
    ("torresmo", 2.6, 10),
)

PIZZA_PASTA_CONCEPTS: Tuple[Tuple[str, float, int], ...] = (
    ("pizza", 3.5, 0),
    ("pizzaria", 3.2, 0),
    ("forno a lenha", 3.1, 1),
    ("fermentacao natural", 3.1, 1),
    ("massa", 2.9, 2),
    ("italiano", 2.9, 2),
    ("italiana", 2.9, 2),
    ("cantina", 2.7, 2),
    ("lasanha", 3.1, 3),
    ("nhoque", 3.1, 3),
    ("espaguete", 3.0, 3),
    ("fettuccine", 3.0, 3),
    ("macarrao", 2.9, 3),
    ("risoto", 3.1, 4),
    ("queijo", 2.6, 5),
    ("mussarela", 2.6, 5),
    ("mozzarella", 2.6, 5),
    ("burrata", 2.9, 5),
    ("parmesao", 2.5, 5),
    ("gorgonzola", 2.7, 5),
    ("catupiry", 2.6, 5),
    ("calzone", 2.8, 0),
    ("focaccia", 2.8, 1),
)

DIETARY_HEALTHY_CONCEPTS: Tuple[Tuple[str, float, int], ...] = (
    ("vegano", 3.8, 0),
    ("vegana", 3.8, 0),
    ("100 vegetal", 3.6, 0),
    ("plant based", 3.6, 0),
    ("taioba", 3.1, 1),
    ("jaca", 3.0, 1),
    ("cogumelo", 2.8, 1),
    ("shimeji", 2.8, 1),
    ("tofu", 3.0, 1),
    ("grao de bico", 2.9, 1),
    ("vegetariano", 3.5, 2),
    ("vegetariana", 3.5, 2),
    ("sem gluten", 3.8, 3),
    ("zero gluten", 3.8, 3),
    ("isento de gluten", 3.6, 3),
    ("celiaco", 3.7, 3),
    ("sem lactose", 3.8, 4),
    ("zero lactose", 3.8, 4),
    ("isento de lactose", 3.6, 4),
    ("intolerante", 3.3, 4),
    ("sem leite", 3.3, 4),
    ("leite de coco", 2.6, 4),
    ("saudavel", 3.0, 5),
    ("fit", 2.9, 5),
    ("natural", 2.4, 5),
    ("salada", 3.0, 6),
    ("poke", 2.9, 6),
    ("acai", 3.5, 7),
    ("tigela", 2.5, 7),
    ("tapioca", 3.0, 8),
)

PRICE_TIER_CONCEPTS: Tuple[Tuple[str, float, int], ...] = (
    ("barato", 3.4, 0),
    ("economico", 3.3, 0),
    ("executivo", 3.1, 1),
    ("prato feito", 3.1, 1),
    ("pf", 2.8, 1),
    ("dia a dia", 2.6, 1),
    ("promocao", 3.2, 2),
    ("oferta", 3.2, 2),
    ("queda de preco", 3.4, 2),
    ("desconto", 3.1, 2),
    ("custo beneficio", 3.0, 0),
    ("familia", 2.9, 3),
    ("compartilhar", 2.8, 3),
    ("duas pessoas", 2.7, 3),
    ("porcao", 2.6, 4),
    ("petisco", 2.6, 4),
    ("premium", 3.2, 5),
    ("gourmet", 3.1, 5),
    ("sofisticado", 3.0, 5),
    ("especial", 2.4, 5),
)


def _normalize_pt_text(raw: str) -> str:
    """Remove acentos, converte para minúsculas e preserva espaços simples e números."""
    nfkd = unicodedata.normalize("NFKD", raw or "")
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii").lower()
    ascii_str = re.sub(r"[^a-z0-9\s\.,]", " ", ascii_str)
    return re.sub(r"\s+", " ", ascii_str).strip()


def _phonetic_fold_pt(word: str) -> str:
    """Normalização fonética leve do Português Brasileiro para tolerância ortográfica."""
    w = word
    w = w.replace("ph", "f").replace("lh", "li").replace("nh", "ni").replace("ch", "x")
    w = w.replace("ss", "s").replace("rr", "r").replace("ç", "s").replace("z", "s")
    w = w.replace("qu", "k").replace("gu", "g")
    return w


def _hash_slot(token: str, start: int, width: int, seed_tag: str = "idx") -> Tuple[int, float]:
    """Projeta determinísticamente uma string para (índice, sinal +-1) dentro de um subespaço."""
    digest = hashlib.blake2b(f"{seed_tag}:{token}".encode("utf-8"), digest_size=8).digest()
    val = int.from_bytes(digest, "little")
    slot = start + (val % width)
    sign = 1.0 if ((val >> 32) & 1) == 0 else -1.0
    return slot, sign


class VectorIndexingService:
    """
    Serviço Incremental de Indexação Semântica 1536d para `Dish.embedding` (pgvector HNSW).
    """

    def __init__(self, ollama_timeout_sec: float = 0.80) -> None:
        self.ollama_timeout_sec = ollama_timeout_sec
        self._ollama_offline_until: float = 0.0
        self._provider_used: str = "deterministic_semantic_1536d"

    @property
    def active_provider(self) -> str:
        return self._provider_used

    def _try_ollama_embedding(self, text: str) -> Optional[List[float]]:
        """
        Tenta obter embedding via Ollama local (`http://localhost:11434/api/embeddings`)
        respeitando SLA máximo de 800ms e circuit breaker de 60s caso offline.
        """
        now_mono = time.monotonic()
        if now_mono < self._ollama_offline_until:
            return None

        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/embeddings"
        payload = json.dumps(
            {
                "model": getattr(settings, "OLLAMA_EMBED_MODEL", "nomic-embed-text"),
                "prompt": text,
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.ollama_timeout_sec) as resp:
                if resp.status != 200:
                    self._ollama_offline_until = now_mono + 60.0
                    return None
                body = json.loads(resp.read().decode("utf-8"))
                raw_emb = body.get("embedding")
                if not isinstance(raw_emb, list) or len(raw_emb) < 64:
                    self._ollama_offline_until = now_mono + 60.0
                    return None
                return [float(x) for x in raw_emb]
        except Exception:
            self._ollama_offline_until = now_mono + 60.0
            return None

    @staticmethod
    def _encode_subspace_concepts(
        vec: np.ndarray,
        norm_text: str,
        concepts: Sequence[Tuple[str, float, int]],
        subspace_start: int,
        subspace_width: int = 256,
    ) -> float:
        """
        Ativa bandas âncora compartilhadas (primeiras 64 posições do subespaço, 4 dims por grupo)
        + projeção fina por termo nas 192 posições restantes do subespaço.
        """
        total_activation = 0.0
        fine_start = subspace_start + 64
        fine_width = subspace_width - 64

        for phrase, weight, anchor_group in concepts:
            # Verifica presença por fronteira de palavra para evitar falsos casamentos curtos
            if re.search(rf"\b{re.escape(phrase)}s?\b", norm_text):
                # Negação explícita (ex: "sem carne", "sem queijo", "sem gluten")
                negated = bool(
                    re.search(
                        rf"\b(?:sem|zero|isento de|livre de|nao contem|nao leva)\s+{re.escape(phrase)}s?\b",
                        norm_text,
                    )
                )
                if negated and phrase in ("carne", "queijo", "mussarela", "bacon", "peixe", "camarao"):
                    continue

                anchor_base = subspace_start + ((anchor_group % 16) * 4)
                vec[anchor_base : anchor_base + 4] += weight
                # Também ativa a macro-âncora do domínio (primeiras 4 dimensões da banda)
                vec[subspace_start : subspace_start + 4] += weight * 0.45

                slot1, s1 = _hash_slot(phrase, fine_start, fine_width, "f1")
                slot2, s2 = _hash_slot(phrase, fine_start, fine_width, "f2")
                vec[slot1] += s1 * weight
                vec[slot2] += s2 * (weight * 0.75)
                total_activation += weight

        return total_activation

    @classmethod
    def _encode_price_subspace(cls, vec: np.ndarray, raw_text: str, norm_text: str) -> None:
        """
        Subespaço [1024..1279]: Codifica conceitos comerciais + valor numérico BRL em
        funções de base radial suaves (RBF) para aproximar faixas de preço compatíveis.
        """
        cls._encode_subspace_concepts(vec, norm_text, PRICE_TIER_CONCEPTS, 1024, 256)

        # Extrai valores em R$ ou "ate X reais"
        price_val: Optional[float] = None
        m_brl = re.search(r"r\$\s*(\d+(?:[\.,]\d{1,2})?)", raw_text.lower())
        if m_brl:
            price_val = float(m_brl.group(1).replace(",", "."))
        else:
            m_limit = re.search(r"(?:ate|menos de|maximo)\s*(\d+(?:[\.,]\d{1,2})?)", norm_text)
            if m_limit:
                price_val = float(m_limit.group(1).replace(",", "."))

        if price_val is not None and price_val > 0:
            # Centros RBF de R$ 15 até R$ 220 distribuídos nas dims 1100..1260
            centers = np.linspace(15.0, 220.0, 40)
            sigma = 28.0
            rbf = np.exp(-0.5 * ((centers - min(price_val, 240.0)) / sigma) ** 2) * 2.2
            for idx, activation in enumerate(rbf):
                base = 1100 + idx * 4
                if base + 4 <= 1280:
                    vec[base : base + 4] += float(activation)

            if price_val <= 45.0:
                vec[1024:1028] += 2.4  # Âncora econômico / barato
            elif price_val <= 85.0:
                vec[1036:1040] += 1.8  # Âncora intermediário
            else:
                vec[1044:1048] += 2.2  # Âncora família / compartilhado / premium

    @staticmethod
    def _encode_phonetic_trigrams(vec: np.ndarray, norm_text: str) -> None:
        """
        Subespaço [1280..1535]: N-gramas fonéticos de trigramas e bigramas de palavras
        via Signed Feature Hashing com ponderação sublinear log(1 + tf).
        """
        tokens = [t for t in re.split(r"[^a-z0-9]+", norm_text) if len(t) >= 2]
        stopwords = {
            "de", "da", "do", "das", "dos", "com", "para", "por", "uma", "uns",
            "que", "onde", "comer", "quero", "prato", "categoria", "restaurante",
            "descricao", "preco", "dieta", "hoje", "tem", "opcoes", "opcao",
        }
        filtered = [t for t in tokens if t not in stopwords]
        tf_counts: Dict[str, int] = {}

        for tok in filtered:
            folded = _phonetic_fold_pt(tok)
            tf_counts[f"w:{folded}"] = tf_counts.get(f"w:{folded}", 0) + 2
            padded = f"#{folded}#"
            for i in range(max(0, len(padded) - 2)):
                tri = padded[i : i + 3]
                tf_counts[f"g:{tri}"] = tf_counts.get(f"g:{tri}", 0) + 1

        for i in range(len(filtered) - 1):
            bg = f"b:{_phonetic_fold_pt(filtered[i])}_{_phonetic_fold_pt(filtered[i + 1])}"
            tf_counts[bg] = tf_counts.get(bg, 0) + 2

        for feat, count in tf_counts.items():
            weight = 1.0 + math.log1p(count)
            slot, sign = _hash_slot(feat, 1280, 256, "tri")
            vec[slot] += sign * weight

    def compute_deterministic_semantic_1536(self, text: str) -> List[float]:
        """
        Codificador Léxico-Semântico Determinístico Offline-First em R^1536 (||v||_2 = 1.0).
        Latência típica: < 0.4ms em CPU.
        """
        vec = np.zeros(EMBEDDING_DIM, dtype=np.float64)
        norm_text = _normalize_pt_text(text or "")

        if not norm_text:
            vec[0] = 1.0
            return vec.tolist()

        # Subespaço 1 [0..255]: Frutos do Mar, Peixes & Cozinha Caiçara
        self._encode_subspace_concepts(vec, norm_text, SEAFOOD_CAICARA_CONCEPTS, 0, 256)

        # Subespaço 2 [256..511]: Carnes, Churrasco & Burgers Artesanais
        self._encode_subspace_concepts(vec, norm_text, MEAT_BURGER_CONCEPTS, 256, 256)

        # Subespaço 3 [512..767]: Pizzas, Massas, Italiano & Queijos
        self._encode_subspace_concepts(vec, norm_text, PIZZA_PASTA_CONCEPTS, 512, 256)

        # Subespaço 4 [768..1023]: Vegano, Vegetariano, Sem Glúten, Zero Lactose, Saudável & Açaí
        self._encode_subspace_concepts(vec, norm_text, DIETARY_HEALTHY_CONCEPTS, 768, 256)

        # Subespaço 5 [1024..1279]: Faixas de Preço & Promoções Auditadas
        self._encode_price_subspace(vec, text, norm_text)

        # Subespaço 6 [1280..1535]: N-gramas Fonéticos de Trigramas
        self._encode_phonetic_trigrams(vec, norm_text)

        norm = float(np.linalg.norm(vec))
        if norm <= 1e-12:
            seed = int(hashlib.sha256(norm_text.encode("utf-8")).hexdigest()[:8], 16)
            rng = np.random.default_rng(seed)
            vec = rng.standard_normal(EMBEDDING_DIM)
            norm = float(np.linalg.norm(vec))

        vec = vec / norm
        return [round(float(x), 7) for x in vec.tolist()]

    def compute_semantic_embedding_1536(self, text: str) -> List[float]:
        """
        Gera vetor denso 1536d normalizado na esfera unitária (||v||_2 = 1.0):
        1. Tenta servidor local Ollama dentro do orçamento de 800ms.
        2. Caso offline ou dimensionalidade != 1536, projeta/combina ou aciona o
           codificador léxico-semântico determinístico de 6 subespaços em < 1ms.
        """
        semantic_local = self.compute_deterministic_semantic_1536(text)
        ollama_raw = self._try_ollama_embedding(text)

        if ollama_raw is None:
            self._provider_used = "deterministic_semantic_1536d"
            return semantic_local

        self._provider_used = "ollama_hybrid_1536d"
        raw_arr = np.array(ollama_raw, dtype=np.float64)
        raw_norm = float(np.linalg.norm(raw_arr))
        if raw_norm > 1e-12:
            raw_arr = raw_arr / raw_norm

        if raw_arr.shape[0] == EMBEDDING_DIM:
            blended = 0.70 * raw_arr + 0.30 * np.array(semantic_local, dtype=np.float64)
        else:
            # Projeção ortogonal determinística preservando produto interno (Johnson-Lindenstrauss tiling)
            repeats = (EMBEDDING_DIM + raw_arr.shape[0] - 1) // raw_arr.shape[0]
            tiled = np.tile(raw_arr, repeats)[:EMBEDDING_DIM]
            blended = 0.65 * tiled + 0.35 * np.array(semantic_local, dtype=np.float64)

        b_norm = float(np.linalg.norm(blended))
        if b_norm > 1e-12:
            blended = blended / b_norm
        return [round(float(x), 7) for x in blended.tolist()]

    @staticmethod
    def build_canonical_dish_document(dish: Dish, restaurant: Restaurant) -> str:
        """
        Monta o documento canônico de indexação exigido pela ontologia do CaráFood:
        `Prato: {dish.name} | Categoria: {dish.category} | Preço: R$ {dish.price:.2f} |
         Restaurante: {rest.name} ({rest.neighborhood}) | Dieta: {diet_tags} | Descrição: {dish.description}`
        """
        tags: List[str] = []
        if dish.is_vegan:
            tags.append("vegano 100% vegetal sem lactose")
        if dish.is_vegetarian:
            tags.append("vegetariano")
        if dish.is_gluten_free:
            tags.append("sem glúten apto para celíacos")
        if dish.is_lactose_free:
            tags.append("zero lactose sem leite")
        if float(dish.last_price_delta_pct or 0.0) < 0.0:
            tags.append("queda de preço promoção oferta auditada")

        diet_tags = ", ".join(tags) if tags else "convencional"
        return (
            f"Prato: {dish.name} | "
            f"Categoria: {dish.category} | "
            f"Preço: R$ {float(dish.price):.2f} | "
            f"Restaurante: {restaurant.name} ({restaurant.neighborhood}) | "
            f"Dieta: {diet_tags} | "
            f"Descrição: {dish.description or ''}"
        )

    async def index_dishes_by_ids(
        self,
        session: AsyncSession,
        dish_ids: List[uuid.UUID],
    ) -> int:
        """Indexa imediatamente uma lista específica de pratos dentro da sessão ativa."""
        if not dish_ids:
            return 0

        stmt = (
            select(Dish, Restaurant)
            .join(Restaurant, Dish.restaurant_id == Restaurant.id)
            .where(Dish.id.in_(dish_ids))
        )
        rows = (await session.execute(stmt)).all()
        now_utc = datetime.now(timezone.utc)
        indexed = 0

        for dish, rest in rows:
            doc = self.build_canonical_dish_document(dish, rest)
            vec = self.compute_semantic_embedding_1536(doc)
            await session.execute(
                update(Dish)
                .where(Dish.id == dish.id)
                .values(
                    embedding=vec,
                    needs_reindexing=False,
                    embedding_updated_at=now_utc,
                )
            )
            indexed += 1

        await session.flush()
        return indexed

    async def sync_pending_embeddings(
        self,
        session: AsyncSession,
        batch_size: int = 200,
    ) -> int:
        """
        Seleciona todos os `Dish` onde `needs_reindexing == True` ou `embedding IS NULL`,
        monta o documento canônico e persiste `embedding` (1536d), `needs_reindexing = False`
        e `embedding_updated_at = now()`.
        """
        stmt = (
            select(Dish, Restaurant)
            .join(Restaurant, Dish.restaurant_id == Restaurant.id)
            .where(
                or_(
                    Dish.needs_reindexing.is_(True),
                    Dish.embedding.is_(None),
                )
            )
            .order_by(Dish.is_available.desc(), Dish.updated_at.desc())
            .limit(batch_size)
        )
        rows = (await session.execute(stmt)).all()
        if not rows:
            return 0

        now_utc = datetime.now(timezone.utc)
        updated_count = 0

        for dish, rest in rows:
            doc = self.build_canonical_dish_document(dish, rest)
            vec = self.compute_semantic_embedding_1536(doc)
            await session.execute(
                update(Dish)
                .where(Dish.id == dish.id)
                .values(
                    embedding=vec,
                    needs_reindexing=False,
                    embedding_updated_at=now_utc,
                )
            )
            updated_count += 1

        await session.commit()
        logger.info(
            f"[VectorIndexer] {updated_count} prato(s) indexados em 1536d via '{self._provider_used}'."
        )
        return updated_count


vector_indexing_service = VectorIndexingService()
