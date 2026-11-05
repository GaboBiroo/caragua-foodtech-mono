"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO 1: ADAPTERS POLIMÓRFICOS & HEURÍSTICA DIETÉTICA
==============================================================================
Implementa:
1. Contratos Pydantic Canônicos (CanonicalItemChoice, CanonicalDish, CanonicalReview, CanonicalRestaurant).
2. Motor de Inferência Heurística Alimentar (DietaryInferenceEngine) com Expressões Regulares
   de Negative Lookbehind e neutralização de compostos vegetais/celíacos.
3. Adapters Polimórficos para iFood Web (GraphQL/JSON), Goomer/AnotaAI,
   Cardápio Web/MenuDino e Google Maps Places API/Scrape.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field


# ==============================================================================
# UTILITÁRIOS LÉXICOS E MONETÁRIOS DETERMINÍSTICOS
# ==============================================================================

def slugify_text(value: str) -> str:
    """Converte qualquer nome em slug ASCII hifenizado limpo."""
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_str = normalized.encode("ascii", "ignore").decode("ascii").lower()
    cleaned = re.sub(r"[^a-z0-9\s-]", "", ascii_str)
    slug = re.sub(r"[\s_-]+", "-", cleaned).strip("-")
    return slug or "estabelecimento-caragua"


def strip_html(text: Optional[str]) -> str:
    """Remove tags HTML, entidades codificadas e espaços redundantes."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", str(text))
    clean = (
        clean.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
    )
    return re.sub(r"\s+", " ", clean).strip()


def parse_brl_price(raw_value: Any, assume_cents_if_int: bool = False) -> float:
    """
    Normaliza valores monetários de múltiplas topologias:
    - Inteiros em centavos (ex: iFood GraphQL 5490 -> 54.90 quando assume_cents_if_int=True)
    - Floats diretos (ex: 54.9 -> 54.90)
    - Strings formatadas BRL (ex: 'R$ 1.240,50' -> 1240.50, 'R$ 58,00' -> 58.00)
    """
    if raw_value is None:
        return 0.0

    if isinstance(raw_value, bool):
        return 0.0

    if isinstance(raw_value, int):
        if assume_cents_if_int:
            return round(float(raw_value) / 100.0, 2)
        return round(float(raw_value), 2)

    if isinstance(raw_value, float):
        return round(raw_value, 2)

    if isinstance(raw_value, str):
        text = raw_value.replace("R$", "").replace("r$", "").strip()
        if not text:
            return 0.0
        # Se for apenas dígitos puros e assume_cents_if_int=True
        if assume_cents_if_int and text.isdigit():
            return round(float(int(text)) / 100.0, 2)

        if "," in text and "." in text:
            text = text.replace(".", "").replace(",", ".")
        elif "," in text:
            text = text.replace(",", ".")

        match = re.search(r"[-+]?\d*\.\d+|\d+", text)
        if match:
            try:
                return round(float(match.group(0)), 2)
            except ValueError:
                return 0.0
    return 0.0


def parse_timestamp_utc(raw_ts: Any) -> datetime:
    """Converte epoch (segundos/milissegundos) ou ISO-8601 em datetime UTC timezone-aware."""
    if isinstance(raw_ts, datetime):
        return raw_ts if raw_ts.tzinfo else raw_ts.replace(tzinfo=timezone.utc)

    if isinstance(raw_ts, (int, float)):
        val = float(raw_ts)
        if val > 1e12:
            val = val / 1000.0
        return datetime.fromtimestamp(val, tz=timezone.utc)

    if isinstance(raw_ts, str) and raw_ts.strip():
        txt = raw_ts.strip().replace("Z", "+00:00")
        if txt.isdigit():
            val = float(txt)
            if val > 1e12:
                val = val / 1000.0
            return datetime.fromtimestamp(val, tz=timezone.utc)
        try:
            dt = datetime.fromisoformat(txt)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    return datetime.now(timezone.utc)


# ==============================================================================
# CONTRATOS PYDANTIC DE INGESTÃO CANÔNICA (ONTOLOGY SECTION 3)
# ==============================================================================

class CanonicalItemChoice(BaseModel):
    name: str
    price: float = 0.0
    is_required: bool = False
    max_options: int = 1


class CanonicalDish(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float = Field(gt=0.0)
    category: str = "Geral"
    image_url: Optional[str] = None
    is_vegan: bool = False
    is_vegetarian: bool = False
    is_gluten_free: bool = False
    is_lactose_free: bool = False
    choices: List[CanonicalItemChoice] = Field(default_factory=list)
    raw_payload_ref: Optional[str] = None


class CanonicalReview(BaseModel):
    raw_author: str
    rating: float = Field(ge=1.0, le=5.0)
    comment: Optional[str] = ""
    timestamp: datetime
    source_platform: str


class CanonicalRestaurant(BaseModel):
    name: str
    slug: str
    street: str
    neighborhood: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    source_platform: str
    source_external_id: str
    cuisine_types: List[str] = Field(default_factory=list)
    price_level: int = Field(default=2, ge=1, le=4)
    opening_hours: Optional[Dict[str, Any]] = None
    dishes: List[CanonicalDish] = Field(default_factory=list)
    reviews: List[CanonicalReview] = Field(default_factory=list)


# ==============================================================================
# MOTOR DE INFERÊNCIA HEURÍSTICA DIETÉTICA (FOOD SAFETY DETERMINÍSTICO)
# ==============================================================================

class DietaryInferenceEngine:
    """
    Motor determinístico de inferência de restrições alimentares em Português Brasileiro.
    Utiliza neutralização de compostos seguros + Expressões Regulares com Negative Lookbehind
    para impedir falsos positivos (ex: 'sem queijo', 'não contém glúten', 'leite de coco').
    """

    MEAT_TERMS: Tuple[str, ...] = (
        "carne", "picanha", "frango", "bacon", "calabresa", "peixe", "camarão", "camarao",
        "linguiça", "linguica", "costela", "mignon", "suíno", "suino", "anchova", "lula",
        "salmão", "salmao", "presunto", "badejo", "cação", "cacao", "tainha", "garoupa",
        "ostra", "ostras", "marisco", "mexilhão", "mexilhao", "polvo", "siri", "caranguejo",
        "atum", "bacalhau", "cupim", "alcatra", "contrafilé", "contrafile", "pernil",
        "mortadela", "salame", "sardinha", "cordeiro", "pato", "tilápia", "tilapia", "pescada",
    )

    NON_VEGAN_ANIMAL_TERMS: Tuple[str, ...] = (
        "ovo", "ovos", "mel", "clara em neve", "gema",
    )

    DAIRY_TERMS: Tuple[str, ...] = (
        "queijo", "mussarela", "mozzarella", "muçarela", "parmesão", "parmesao", "leite",
        "requeijão", "requeijao", "catupiry", "creme de leite", "manteiga", "iogurte",
        "cheddar", "gorgonzola", "provolone", "brie", "ricota", "chantilly", "doce de leite",
        "coalho", "burrata", "mascarpone",
    )

    GLUTEN_TERMS: Tuple[str, ...] = (
        "pão", "pao", "trigo", "farinha de trigo", "cerveja", "croissant", "massa italiana",
        "espaguete", "lasanha", "empanado", "empanada", "milanesa", "macarrão", "macarrao",
        "brioche", "ciabatta", "cevada", "malte", "torrada", "pastel", "pizza", "fettuccine",
        "penne", "nhoque de trigo", "farinha panko", "panko",
    )

    # Compostos vegetais ou explicitamente seguros que não devem ativar exclusão por substring
    SAFE_COMPOUND_REPLACEMENTS: Tuple[Tuple[re.Pattern[str], str], ...] = (
        (re.compile(r"\bleite\s+de\s+(?:coco|am[eê]ndoas?|aveia|soja|castanha|arroz|inhame)\b"), "[safe_plant_milk]"),
        (re.compile(r"\bleite\s+vegetal\b"), "[safe_plant_milk]"),
        (re.compile(r"\bmanteiga\s+de\s+(?:cacau|coco|amendoim|castanha)\b"), "[safe_plant_butter]"),
        (re.compile(r"\b(?:queijo|requeij[aã]o|cheddar|mussarela|maionese)\s+vegan[oa]s?\b"), "[safe_vegan_dairy]"),
        (re.compile(r"\b(?:carne|frango|bacon|lingui[cç]a|hamb[uú]rguer)\s+(?:de\s+jaca|de\s+soja|vegetal|vegan[oa]|plant[- ]based)\b"), "[safe_plant_protein]"),
        (re.compile(r"\b(?:p[aã]o|massa|macarr[aã]o|pizza|cerveja|torrada|bolo)\s+(?:sem\s+gl[uú]ten|zero\s+gl[uú]ten|isento\s+de\s+gl[uú]ten)\b"), "[safe_gluten_free_base]"),
        (re.compile(r"\bempanad[oa]s?\s+(?:em|no|na|com)\s+(?:fub[aá]|farinha\s+de\s+arroz|farinha\s+de\s+mandioca|amido\s+de\s+milho|polvilho)\b"), "[safe_gf_crust]"),
    )

    # Prefixo de Negative Lookbehind de largura fixa sequencial em Python `re`
    NEGATIVE_LOOKBEHIND_PREFIX = (
        r"(?<!sem\s)"
        r"(?<!zero\s)"
        r"(?<!livre\sde\s)"
        r"(?<!isento\sde\s)"
        r"(?<!não\scontém\s)"
        r"(?<!nao\scontem\s)"
        r"(?<!não\sleva\s)"
        r"(?<!nao\sleva\s)"
    )

    REGEX_MEAT = re.compile(
        NEGATIVE_LOOKBEHIND_PREFIX
        + r"\b(?:" + "|".join(re.escape(t) for t in sorted(MEAT_TERMS, key=len, reverse=True)) + r")s?\b"
    )
    REGEX_NON_VEGAN_ANIMAL = re.compile(
        NEGATIVE_LOOKBEHIND_PREFIX
        + r"\b(?:" + "|".join(re.escape(t) for t in sorted(NON_VEGAN_ANIMAL_TERMS, key=len, reverse=True)) + r")\b"
    )
    REGEX_DAIRY = re.compile(
        NEGATIVE_LOOKBEHIND_PREFIX
        + r"\b(?:" + "|".join(re.escape(t) for t in sorted(DAIRY_TERMS, key=len, reverse=True)) + r")s?\b"
    )
    REGEX_GLUTEN = re.compile(
        NEGATIVE_LOOKBEHIND_PREFIX
        + r"\b(?:" + "|".join(re.escape(t) for t in sorted(GLUTEN_TERMS, key=len, reverse=True)) + r")s?\b"
    )

    REGEX_EXPLICIT_VEGAN = re.compile(
        r"\b(?:vegan[oa]s?|100%\s*vegetal|plant[- ]based|sem\s+ingredientes?\s+de\s+origem\s+animal)\b"
    )
    REGEX_EXPLICIT_VEGETARIAN = re.compile(
        r"\b(?:vegetarian[oa]s?|veggie|ovolactovegetarian[oa])\b"
    )
    REGEX_EXPLICIT_GLUTEN_FREE = re.compile(
        r"\b(?:sem\s+gl[uú]ten|zero\s+gl[uú]ten|gluten[- ]free|isento\s+de\s+gl[uú]ten|não\s+cont[eé]m\s+gl[uú]ten|nao\s+contem\s+gluten)\b"
    )
    REGEX_EXPLICIT_LACTOSE_FREE = re.compile(
        r"\b(?:sem\s+lactose|zero\s+lactose|lac[- ]?free|isento\s+de\s+lactose|sem\s+leite|sem\s+latic[ií]nios)\b"
    )

    @classmethod
    def infer(
        cls,
        name: str,
        description: Optional[str] = "",
        category: Optional[str] = "",
        upstream_flags: Optional[Dict[str, bool]] = None,
    ) -> Dict[str, bool]:
        """
        Infere de forma determinística e conservadora (Food Safety First):
        - Se qualquer termo de carne/frutos do mar não negado estiver presente -> is_vegan=False, is_vegetarian=False.
        - Se qualquer termo lácteo não negado estiver presente -> is_lactose_free=False, is_vegan=False.
        - Se qualquer termo de glúten não negado estiver presente -> is_gluten_free=False.
        """
        upstream = upstream_flags or {}
        raw_corpus = f"{name or ''} {description or ''} {category or ''}".lower()
        raw_corpus = re.sub(r"\s+", " ", raw_corpus).strip()

        normalized_corpus = raw_corpus
        for pattern, placeholder in cls.SAFE_COMPOUND_REPLACEMENTS:
            normalized_corpus = pattern.sub(placeholder, normalized_corpus)

        has_meat = bool(cls.REGEX_MEAT.search(normalized_corpus))
        has_animal_other = bool(cls.REGEX_NON_VEGAN_ANIMAL.search(normalized_corpus))
        has_dairy = bool(cls.REGEX_DAIRY.search(normalized_corpus))
        has_gluten = bool(cls.REGEX_GLUTEN.search(normalized_corpus))

        explicit_vegan = bool(cls.REGEX_EXPLICIT_VEGAN.search(raw_corpus)) or bool(upstream.get("is_vegan", False))
        explicit_vegetarian = bool(cls.REGEX_EXPLICIT_VEGETARIAN.search(raw_corpus)) or bool(upstream.get("is_vegetarian", False))
        explicit_gf = (
            bool(cls.REGEX_EXPLICIT_GLUTEN_FREE.search(raw_corpus))
            or "[safe_gluten_free_base]" in normalized_corpus
            or "[safe_gf_crust]" in normalized_corpus
            or bool(upstream.get("is_gluten_free", False))
        )
        explicit_lf = (
            bool(cls.REGEX_EXPLICIT_LACTOSE_FREE.search(raw_corpus))
            or "[safe_plant_milk]" in normalized_corpus
            or "[safe_vegan_dairy]" in normalized_corpus
            or bool(upstream.get("is_lactose_free", False))
        )

        # Determinismo Estrito: Exclusões anulam qualquer flag positiva mal classificada na origem
        is_vegan = explicit_vegan and not (has_meat or has_animal_other or has_dairy)
        is_vegetarian = (is_vegan or explicit_vegetarian) and not has_meat
        is_gluten_free = explicit_gf and not has_gluten
        is_lactose_free = (is_vegan or explicit_lf) and not has_dairy

        return {
            "is_vegan": is_vegan,
            "is_vegetarian": is_vegetarian,
            "is_gluten_free": is_gluten_free,
            "is_lactose_free": is_lactose_free,
        }


# ==============================================================================
# INTERFACE BASE POLIMÓRFICA DE ADAPTERS
# ==============================================================================

class BaseSourceAdapter(ABC):
    """Contrato abstrato obrigatório para tradução de XHR/JSON de plataformas externas."""

    platform_name: str = "generic"

    @abstractmethod
    def can_handle(self, raw_data: Dict[str, Any]) -> bool:
        """Determina se a estrutura JSON bruta pertence à topologia deste adapter."""
        raise NotImplementedError

    @abstractmethod
    def adapt_restaurant(self, raw_data: Dict[str, Any]) -> CanonicalRestaurant:
        """Converte o registro bruto validado em CanonicalRestaurant."""
        raise NotImplementedError

    def adapt_many(self, raw_data: Dict[str, Any]) -> List[CanonicalRestaurant]:
        """
        Suporta envelopes com múltiplos estabelecimentos (ex: listas de busca ou catálogos em lote),
        delegando cada nó individual para adapt_restaurant().
        """
        return [self.adapt_restaurant(raw_data)]


# ==============================================================================
# 1. IFOOD WEB ADAPTER (GraphQL / Catalog JSON)
# ==============================================================================

class IFoodWebAdapter(BaseSourceAdapter):
    """
    Trata payloads GraphQL/REST do ecossistema iFood Web:
    - Envelopes `data.merchant` + `data.catalog` ou `merchant` + `menu`
    - Preços em centavos inteiros ou floats (`unitMinPrice`, `unitPrice`)
    - Grupos de acompanhamentos/complementos (`garnishGroups` -> `garnishItems`)
    """

    platform_name = "ifood_web"

    def can_handle(self, raw_data: Dict[str, Any]) -> bool:
        if not isinstance(raw_data, dict):
            return False
        if raw_data.get("source_platform") == "ifood_web":
            return True
        data_node = raw_data.get("data")
        if isinstance(data_node, dict) and ("merchant" in data_node or "catalog" in data_node):
            return True
        if "merchant" in raw_data and ("catalog" in raw_data or "categoryMenu" in raw_data):
            return True
        return False

    def adapt_restaurant(self, raw_data: Dict[str, Any]) -> CanonicalRestaurant:
        root = raw_data.get("data") if isinstance(raw_data.get("data"), dict) else raw_data
        merchant = root.get("merchant") or {}
        catalog = root.get("catalog") or root.get("categoryMenu") or root.get("menu") or []

        name = strip_html(merchant.get("name") or raw_data.get("name") or "Restaurante iFood")
        ext_id = str(merchant.get("id") or raw_data.get("id") or hashlib.md5(name.encode("utf-8")).hexdigest()[:12])
        slug = slugify_text(merchant.get("slug") or name)

        address_node = merchant.get("address") or {}
        street_name = strip_html(address_node.get("streetName") or address_node.get("street") or "Endereço não informado")
        street_num = str(address_node.get("streetNumber") or "").strip()
        street = f"{street_name}, {street_num}".strip(", ") if street_num else street_name
        neighborhood = strip_html(
            address_node.get("neighborhood")
            or address_node.get("district")
            or merchant.get("neighborhood")
            or "Centro"
        )

        lat = float(address_node.get("latitude") or merchant.get("latitude") or -23.6226)
        lon = float(address_node.get("longitude") or merchant.get("longitude") or -45.4124)

        main_cat = merchant.get("mainCategory", {})
        cuisines: List[str] = []
        if isinstance(main_cat, dict) and main_cat.get("name"):
            cuisines.append(strip_html(main_cat["name"]))
        for tag in merchant.get("tags", []) or []:
            if isinstance(tag, str) and len(tag) < 32:
                cuisines.append(tag)

        # Extração de categorias e itens do catálogo GraphQL
        categories_list = catalog.get("categories", []) if isinstance(catalog, dict) else catalog
        dishes: List[CanonicalDish] = []

        for cat_node in categories_list or []:
            if not isinstance(cat_node, dict):
                continue
            cat_name = strip_html(cat_node.get("name") or "Cardápio")
            items = cat_node.get("items") or cat_node.get("itens") or []
            for item in items:
                if not isinstance(item, dict):
                    continue
                dish_name = strip_html(item.get("description") if not item.get("name") else item.get("name"))
                dish_desc = strip_html(item.get("details") or item.get("description") if item.get("name") else "")

                # No iFood GraphQL, inteiros >= 100 frequentemente representam centavos (ex: 5490 -> R$ 54,90)
                raw_price = item.get("unitMinPrice")
                if raw_price is None:
                    raw_price = item.get("unitPrice", item.get("price", 0))
                assume_cents = isinstance(raw_price, int) and (
                    bool(item.get("priceInCents")) or raw_price >= 300
                )
                price = parse_brl_price(raw_price, assume_cents_if_int=assume_cents)
                if price <= 0.0:
                    continue

                # Extração de Smart Defaults / Garnish Groups
                choices: List[CanonicalItemChoice] = []
                for group in item.get("garnishGroups", []) or item.get("choices", []) or []:
                    if not isinstance(group, dict):
                        continue
                    min_qty = int(group.get("min", 0) or 0)
                    max_qty = max(1, int(group.get("max", 1) or 1))
                    is_req = min_qty > 0 or bool(group.get("isRequired", False))
                    garnish_items = group.get("garnishItems") or group.get("options") or []
                    for g_item in garnish_items:
                        if not isinstance(g_item, dict):
                            continue
                        g_name = strip_html(g_item.get("description") or g_item.get("name") or "Complemento")
                        g_raw_price = g_item.get("unitPrice", g_item.get("price", 0))
                        g_cents = isinstance(g_raw_price, int) and g_raw_price >= 100
                        g_price = parse_brl_price(g_raw_price, assume_cents_if_int=g_cents)
                        choices.append(
                            CanonicalItemChoice(
                                name=g_name,
                                price=g_price,
                                is_required=is_req,
                                max_options=max_qty,
                            )
                        )

                upstream_diet = {
                    "is_vegan": "VEGAN" in (item.get("dietaryRestrictions") or []) or bool(item.get("is_vegan")),
                    "is_vegetarian": "VEGETARIAN" in (item.get("dietaryRestrictions") or []) or bool(item.get("is_vegetarian")),
                    "is_gluten_free": "GLUTEN_FREE" in (item.get("dietaryRestrictions") or []) or bool(item.get("is_gluten_free")),
                    "is_lactose_free": "LAC_FREE" in (item.get("dietaryRestrictions") or []) or bool(item.get("is_lactose_free")),
                }
                dietary = DietaryInferenceEngine.infer(
                    name=dish_name,
                    description=dish_desc,
                    category=cat_name,
                    upstream_flags=upstream_diet,
                )

                dishes.append(
                    CanonicalDish(
                        name=dish_name,
                        description=dish_desc,
                        price=price,
                        category=cat_name,
                        image_url=item.get("logoUrl") or item.get("imageUrl"),
                        choices=choices,
                        raw_payload_ref=str(item.get("id") or ""),
                        **dietary,
                    )
                )

        reviews: List[CanonicalReview] = []
        raw_reviews = root.get("reviews") or merchant.get("reviews") or []
        for rev in raw_reviews:
            if not isinstance(rev, dict):
                continue
            rating_val = float(rev.get("score") or rev.get("rating") or 5.0)
            rating_val = min(5.0, max(1.0, rating_val))
            reviews.append(
                CanonicalReview(
                    raw_author=str(rev.get("userName") or rev.get("author_name") or "consumidor_ifood"),
                    rating=rating_val,
                    comment=strip_html(rev.get("comment") or rev.get("evaluation") or rev.get("text") or ""),
                    timestamp=parse_timestamp_utc(rev.get("createdAt") or rev.get("date")),
                    source_platform=self.platform_name,
                )
            )

        return CanonicalRestaurant(
            name=name,
            slug=slug,
            street=street,
            neighborhood=neighborhood,
            latitude=lat,
            longitude=lon,
            phone=merchant.get("phone"),
            website=merchant.get("url") or raw_data.get("url"),
            rating=round(float(merchant.get("userRating") or merchant.get("rating") or 0.0), 2),
            review_count=int(merchant.get("userRatingCount") or len(reviews)),
            source_platform=self.platform_name,
            source_external_id=ext_id,
            cuisine_types=cuisines or ["Gastronomia Local"],
            price_level=min(4, max(1, int(merchant.get("priceRange") or 2))),
            opening_hours=merchant.get("shifts") if isinstance(merchant.get("shifts"), dict) else None,
            dishes=dishes,
            reviews=reviews,
        )


# ==============================================================================
# 2. GOOMER & ANOTAAI ADAPTER (WebMenus categories[] -> products[])
# ==============================================================================

class GoomerAnotaAIAdapter(BaseSourceAdapter):
    """
    Trata formatos legados e modernos de WebMenus Goomer e AnotaAI:
    - Estruturas `store` / `establishment` / `company` com `categories[] -> products[]`
    """

    platform_name = "goomer_anotaai"

    def can_handle(self, raw_data: Dict[str, Any]) -> bool:
        if not isinstance(raw_data, dict):
            return False
        if raw_data.get("source_platform") in ("goomer", "anotaai", "goomer_anotaai"):
            return True
        has_store = any(k in raw_data for k in ("store", "establishment", "company"))
        categories = (
            raw_data["categories"]
            if "categories" in raw_data
            else (raw_data.get("menu") or {}).get("categories")
        )
        if has_store and isinstance(categories, list):
            return True
        if isinstance(categories, list) and categories and isinstance(categories[0], dict) and "products" in categories[0]:
            return True
        return False

    def adapt_restaurant(self, raw_data: Dict[str, Any]) -> CanonicalRestaurant:
        store = raw_data.get("store") or raw_data.get("establishment") or raw_data.get("company") or raw_data
        platform_tag = str(raw_data.get("source_platform") or store.get("platform") or self.platform_name)

        name = strip_html(store.get("name") or store.get("fantasy_name") or "Cardápio Digital")
        ext_id = str(store.get("id") or store.get("store_id") or hashlib.md5(name.encode("utf-8")).hexdigest()[:12])
        slug = slugify_text(store.get("slug") or name)

        addr = store.get("address") if isinstance(store.get("address"), dict) else {}
        street = strip_html(
            addr.get("street")
            or store.get("street")
            or store.get("address_line")
            or (store.get("address") if isinstance(store.get("address"), str) else "Rua Comercial")
        )
        neighborhood = strip_html(addr.get("neighborhood") or store.get("neighborhood") or store.get("district") or "Centro")
        lat = float(addr.get("lat") or addr.get("latitude") or store.get("latitude") or -23.6226)
        lon = float(addr.get("lng") or addr.get("longitude") or store.get("longitude") or -45.4124)

        categories = raw_data.get("categories") or (raw_data.get("menu") or {}).get("categories") or []
        dishes: List[CanonicalDish] = []
        cuisines_detected: List[str] = list(store.get("cuisine_types") or [])

        for cat in categories:
            if not isinstance(cat, dict):
                continue
            cat_title = strip_html(cat.get("name") or cat.get("title") or "Pratos")
            if cat_title and len(cuisines_detected) < 4 and cat_title not in cuisines_detected:
                cuisines_detected.append(cat_title)

            products = cat.get("products") or cat.get("items") or []
            for prod in products:
                if not isinstance(prod, dict):
                    continue
                p_name = strip_html(prod.get("name") or prod.get("title") or "")
                if not p_name:
                    continue
                p_desc = strip_html(prod.get("description") or prod.get("details") or "")
                price = parse_brl_price(prod.get("price") or prod.get("promo_price") or prod.get("value"))
                if price <= 0.0:
                    continue

                choices: List[CanonicalItemChoice] = []
                option_groups = prod.get("complement_groups") or prod.get("optionals") or prod.get("choices") or []
                for grp in option_groups:
                    if not isinstance(grp, dict):
                        continue
                    is_req = bool(grp.get("required") or (int(grp.get("min_qty", 0) or 0) > 0))
                    max_opt = max(1, int(grp.get("max_qty") or grp.get("max") or 1))
                    for opt in grp.get("options") or grp.get("items") or []:
                        if not isinstance(opt, dict):
                            continue
                        choices.append(
                            CanonicalItemChoice(
                                name=strip_html(opt.get("name") or "Adicional"),
                                price=parse_brl_price(opt.get("price") or 0.0),
                                is_required=is_req,
                                max_options=max_opt,
                            )
                        )

                upstream_flags = {
                    "is_vegan": bool(prod.get("is_vegan")),
                    "is_vegetarian": bool(prod.get("is_vegetarian")),
                    "is_gluten_free": bool(prod.get("is_gluten_free")),
                    "is_lactose_free": bool(prod.get("is_lactose_free")),
                }
                dietary = DietaryInferenceEngine.infer(
                    name=p_name,
                    description=p_desc,
                    category=cat_title,
                    upstream_flags=upstream_flags,
                )

                dishes.append(
                    CanonicalDish(
                        name=p_name,
                        description=p_desc,
                        price=price,
                        category=cat_title,
                        image_url=prod.get("image") or prod.get("photo_url"),
                        choices=choices,
                        raw_payload_ref=str(prod.get("id") or ""),
                        **dietary,
                    )
                )

        reviews: List[CanonicalReview] = []
        for rev in raw_data.get("reviews") or store.get("reviews") or []:
            if not isinstance(rev, dict):
                continue
            rating_val = min(5.0, max(1.0, float(rev.get("rating") or 5.0)))
            reviews.append(
                CanonicalReview(
                    raw_author=str(rev.get("author") or rev.get("author_name") or "cliente_webmenu"),
                    rating=rating_val,
                    comment=strip_html(rev.get("comment") or rev.get("text") or ""),
                    timestamp=parse_timestamp_utc(rev.get("timestamp") or rev.get("created_at")),
                    source_platform=platform_tag,
                )
            )

        return CanonicalRestaurant(
            name=name,
            slug=slug,
            street=street,
            neighborhood=neighborhood,
            latitude=lat,
            longitude=lon,
            phone=store.get("phone") or store.get("whatsapp"),
            website=store.get("website") or store.get("menu_url"),
            rating=round(float(store.get("rating") or 0.0), 2),
            review_count=int(store.get("review_count") or len(reviews)),
            source_platform=platform_tag,
            source_external_id=ext_id,
            cuisine_types=cuisines_detected or ["Culinária Caiçara"],
            price_level=min(4, max(1, int(store.get("price_level") or 2))),
            opening_hours=store.get("opening_hours") if isinstance(store.get("opening_hours"), dict) else None,
            dishes=dishes,
            reviews=reviews,
        )


# ==============================================================================
# 3. CARDÁPIO WEB / MENUDINO ADAPTER
# ==============================================================================

class MenuDinoCardapioWebAdapter(BaseSourceAdapter):
    """
    Trata cardápios digitais estruturados em `tenant` / `merchant_info`
    com `catalog_sections[]` ou `sections[] -> items[]` (Cardápio Web / MenuDino).
    """

    platform_name = "menudino_cardapioweb"

    def can_handle(self, raw_data: Dict[str, Any]) -> bool:
        if not isinstance(raw_data, dict):
            return False
        if raw_data.get("source_platform") in ("menudino", "cardapioweb", "menudino_cardapioweb"):
            return True
        if ("tenant" in raw_data or "merchant_info" in raw_data) and (
            "sections" in raw_data or "catalog_sections" in raw_data
        ):
            return True
        return False

    def adapt_restaurant(self, raw_data: Dict[str, Any]) -> CanonicalRestaurant:
        tenant = raw_data.get("tenant") or raw_data.get("merchant_info") or {}
        name = strip_html(tenant.get("name") or raw_data.get("name") or "Estabelecimento MenuDino")
        ext_id = str(tenant.get("tenant_id") or tenant.get("id") or hashlib.md5(name.encode("utf-8")).hexdigest()[:12])
        slug = slugify_text(tenant.get("slug") or name)

        street = strip_html(tenant.get("street") or tenant.get("address") or "Via Costeira")
        neighborhood = strip_html(tenant.get("neighborhood") or "Centro")
        lat = float(tenant.get("latitude") or -23.6226)
        lon = float(tenant.get("longitude") or -45.4124)

        sections = raw_data.get("catalog_sections") or raw_data.get("sections") or []
        dishes: List[CanonicalDish] = []
        for sec in sections:
            if not isinstance(sec, dict):
                continue
            sec_name = strip_html(sec.get("section_name") or sec.get("name") or "Especialidades")
            for item in sec.get("items") or []:
                if not isinstance(item, dict):
                    continue
                d_name = strip_html(item.get("title") or item.get("name") or "")
                if not d_name:
                    continue
                d_desc = strip_html(item.get("subtitle") or item.get("description") or "")
                price = parse_brl_price(item.get("price"))
                if price <= 0.0:
                    continue

                choices: List[CanonicalItemChoice] = []
                for mod in item.get("modifiers") or []:
                    if not isinstance(mod, dict):
                        continue
                    choices.append(
                        CanonicalItemChoice(
                            name=strip_html(mod.get("name") or "Acompanhamento"),
                            price=parse_brl_price(mod.get("price") or 0.0),
                            is_required=bool(mod.get("is_required", False)),
                            max_options=max(1, int(mod.get("max_options", 1) or 1)),
                        )
                    )

                dietary = DietaryInferenceEngine.infer(d_name, d_desc, sec_name)
                dishes.append(
                    CanonicalDish(
                        name=d_name,
                        description=d_desc,
                        price=price,
                        category=sec_name,
                        image_url=item.get("image_url"),
                        choices=choices,
                        raw_payload_ref=str(item.get("sku") or item.get("id") or ""),
                        **dietary,
                    )
                )

        reviews: List[CanonicalReview] = []
        for rev in raw_data.get("reviews") or []:
            if not isinstance(rev, dict):
                continue
            reviews.append(
                CanonicalReview(
                    raw_author=str(rev.get("author_name") or rev.get("raw_author") or "cliente_cardapioweb"),
                    rating=min(5.0, max(1.0, float(rev.get("rating") or 5.0))),
                    comment=strip_html(rev.get("comment") or rev.get("text") or ""),
                    timestamp=parse_timestamp_utc(rev.get("timestamp")),
                    source_platform=self.platform_name,
                )
            )

        return CanonicalRestaurant(
            name=name,
            slug=slug,
            street=street,
            neighborhood=neighborhood,
            latitude=lat,
            longitude=lon,
            phone=tenant.get("phone"),
            website=tenant.get("domain"),
            rating=round(float(tenant.get("rating") or 0.0), 2),
            review_count=int(tenant.get("review_count") or len(reviews)),
            source_platform=self.platform_name,
            source_external_id=ext_id,
            cuisine_types=list(tenant.get("cuisines") or ["Gastronomia Caiçara"]),
            price_level=min(4, max(1, int(tenant.get("price_level") or 2))),
            dishes=dishes,
            reviews=reviews,
        )


# ==============================================================================
# 4. GOOGLE MAPS PLACES ADAPTER (Places API / Scrape JSON)
# ==============================================================================

class GoogleMapsPlacesAdapter(BaseSourceAdapter):
    """
    Extrai dados cadastrais geodésicos, rating consolidado, endereço estruturado,
    reviews normalizados e destaques de cardápio a partir de resultados Google Maps Places.
    """

    platform_name = "google_maps_places"

    def can_handle(self, raw_data: Dict[str, Any]) -> bool:
        if not isinstance(raw_data, dict):
            return False
        if raw_data.get("source_platform") == "google_maps_places":
            return True
        if "place_id" in raw_data and ("geometry" in raw_data or "formatted_address" in raw_data):
            return True
        if isinstance(raw_data.get("result"), dict) and "place_id" in raw_data["result"]:
            return True
        return False

    def adapt_restaurant(self, raw_data: Dict[str, Any]) -> CanonicalRestaurant:
        node = raw_data.get("result") if isinstance(raw_data.get("result"), dict) else raw_data
        name = strip_html(node.get("name") or node.get("title") or "Estabelecimento Google Maps")
        place_id = str(node.get("place_id") or hashlib.md5(name.encode("utf-8")).hexdigest()[:16])
        slug = slugify_text(node.get("slug") or name)

        formatted_address = strip_html(node.get("formatted_address") or node.get("vicinity") or "")
        neighborhood = strip_html(node.get("neighborhood") or "")
        street = formatted_address or "Caraguatatuba - SP"

        # Extrai bairro a partir de address_components ou string formatada brasileira
        for comp in node.get("address_components") or []:
            if isinstance(comp, dict):
                types = comp.get("types") or []
                if any(t in types for t in ("sublocality_level_1", "sublocality", "neighborhood")):
                    neighborhood = strip_html(comp.get("long_name") or neighborhood)
                elif "route" in types and not node.get("street"):
                    street = strip_html(comp.get("long_name") or street)

        if not neighborhood and " - " in formatted_address:
            # Padrão Google Maps Brasil: "Av. Arthur Costa Filho, 1850 - Martim de Sá, Caraguatatuba - SP"
            parts = formatted_address.split(" - ")
            if len(parts) >= 2:
                street = parts[0].strip()
                neighborhood = parts[1].split(",")[0].strip()

        geom_loc = ((node.get("geometry") or {}).get("location")) or {}
        lat = float(geom_loc.get("lat") or node.get("latitude") or -23.6226)
        lon = float(geom_loc.get("lng") or node.get("longitude") or -45.4124)

        dishes: List[CanonicalDish] = []
        for m_item in node.get("menu_items") or node.get("dishes") or []:
            if not isinstance(m_item, dict):
                continue
            d_name = strip_html(m_item.get("name") or "")
            price = parse_brl_price(m_item.get("price"))
            if not d_name or price <= 0.0:
                continue
            d_desc = strip_html(m_item.get("description") or "")
            cat = strip_html(m_item.get("category") or "Destaques do Local")
            dietary = DietaryInferenceEngine.infer(d_name, d_desc, cat)
            dishes.append(
                CanonicalDish(
                    name=d_name,
                    description=d_desc,
                    price=price,
                    category=cat,
                    raw_payload_ref=f"{place_id}:{slugify_text(d_name)}",
                    **dietary,
                )
            )

        reviews: List[CanonicalReview] = []
        for rev in node.get("reviews") or []:
            if not isinstance(rev, dict):
                continue
            rating_val = min(5.0, max(1.0, float(rev.get("rating") or 5.0)))
            reviews.append(
                CanonicalReview(
                    raw_author=str(rev.get("author_name") or rev.get("raw_author") or "google_local_guide"),
                    rating=rating_val,
                    comment=strip_html(rev.get("text") or rev.get("comment") or ""),
                    timestamp=parse_timestamp_utc(rev.get("time") or rev.get("timestamp")),
                    source_platform=self.platform_name,
                )
            )

        return CanonicalRestaurant(
            name=name,
            slug=slug,
            street=street,
            neighborhood=neighborhood or "Centro",
            latitude=lat,
            longitude=lon,
            phone=node.get("formatted_phone_number") or node.get("phone"),
            website=node.get("website") or node.get("url"),
            rating=round(float(node.get("rating") or 0.0), 2),
            review_count=int(node.get("user_ratings_total") or len(reviews)),
            source_platform=self.platform_name,
            source_external_id=place_id,
            cuisine_types=list(node.get("cuisine_types") or ["Restaurante"]),
            price_level=min(4, max(1, int(node.get("price_level") or 2))),
            opening_hours=node.get("opening_hours") if isinstance(node.get("opening_hours"), dict) else None,
            dishes=dishes,
            reviews=reviews,
        )


# ==============================================================================
# REGISTRY POLIMÓRFICO CENTRAL DE ADAPTERS
# ==============================================================================

class AdapterRegistry:
    """Registro polimórfico central para roteamento automático de payloads XHR."""

    _ADAPTERS: Tuple[BaseSourceAdapter, ...] = (
        IFoodWebAdapter(),
        GoomerAnotaAIAdapter(),
        MenuDinoCardapioWebAdapter(),
        GoogleMapsPlacesAdapter(),
    )

    @classmethod
    def unwrap_network_envelope(cls, raw_payload: Any) -> List[Dict[str, Any]]:
        """
        Desempacota envelopes gravados pelo PlaywrightNetworkScraper
        (`{"url": ..., "status": 200, "data": ...}` ou listas de respostas).
        """
        extracted: List[Dict[str, Any]] = []
        if isinstance(raw_payload, list):
            for entry in raw_payload:
                extracted.extend(cls.unwrap_network_envelope(entry))
            return extracted

        if isinstance(raw_payload, dict):
            if "url" in raw_payload and "status" in raw_payload and "data" in raw_payload:
                return cls.unwrap_network_envelope(raw_payload["data"])
            if "merchants" in raw_payload and isinstance(raw_payload["merchants"], list):
                for m in raw_payload["merchants"]:
                    if isinstance(m, dict):
                        extracted.append(m)
                return extracted
            if "results" in raw_payload and isinstance(raw_payload["results"], list):
                for r in raw_payload["results"]:
                    if isinstance(r, dict):
                        extracted.append(r)
                return extracted
            extracted.append(raw_payload)
        return extracted

    @classmethod
    def get_adapter(cls, payload: Dict[str, Any]) -> Optional[BaseSourceAdapter]:
        """Retorna o primeiro Adapter compatível com a assinatura estrutural do JSON."""
        for adapter in cls._ADAPTERS:
            if adapter.can_handle(payload):
                return adapter
        return None

    @classmethod
    def adapt_payload(cls, raw_payload: Any) -> List[CanonicalRestaurant]:
        """Desempacota e converte todos os nós válidos de um arquivo JSON em CanonicalRestaurant."""
        canonical_list: List[CanonicalRestaurant] = []
        for candidate in cls.unwrap_network_envelope(raw_payload):
            adapter = cls.get_adapter(candidate)
            if adapter is not None:
                canonical_list.extend(adapter.adapt_many(candidate))
        return canonical_list
