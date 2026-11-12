"""
CaráFood — End-to-End Real Catalog Pipeline for Caraguatatuba/SP.

Produces `src/data/caraguaRealDump.json` and `web-admin/src/data/caraguaRealDump.json`
exclusively from verified live extractions:
  - CardápioWeb (live JSON API + real GCS photos + promotional prices)
  - Anota AI (live JSON API + real S3 product photos + GeoJSON coords)
  - Aiqfome (44+ Caraguatatuba establishments + CDN image normalization)
  - Google Maps Playwright enrichment (real ratings, review counts, real customer reviews, food/place photos, coords)

Zero synthetic dishes, zero stock/Unsplash URLs, zero fake reviews.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import unicodedata
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import httpx

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.workers.real_menu_photo_harvester import (
    AiqfomeAdapter,
    AnotaAIAdapter,
    CardapioWebAdapter,
    GoogleMapsEnricher,
    is_valid_caragua_coords,
    normalize_image_url,
    verify_image_urls_batch,
)
from app.workers.scraper_adapters import DietaryInferenceEngine, slugify_text
from app.workers.scraper_engine import (
    CARAGUA_53_NEIGHBORHOODS,
    calculate_haversine,
    resolve_caragua_neighborhood,
)

RAW_DIR = BACKEND_DIR / "data" / "raw"
AIQFOME_RAW_FILE = RAW_DIR / "aiqfome_caragua_raw.json"
GMAPS_CACHE_FILE = RAW_DIR / "gmaps_enrichment_cache.json"
DEST_FRONTEND = ROOT_DIR / "src" / "data" / "caraguaRealDump.json"
DEST_ADMIN = ROOT_DIR / "web-admin" / "src" / "data" / "caraguaRealDump.json"

PRACA_EVENTOS_LAT = -23.6226
PRACA_EVENTOS_LON = -45.4124

INITIAL_CW_SLUGS: List[Tuple[str, str]] = [
    ("pointdopirao", "app.cardapioweb.com"),
    ("napolisorvetes", "app.cardapioweb.com"),
    ("chickenbruttos", "app.cardapioweb.com"),
    ("primefitcaraguatatuba", "app.cardapioweb.com"),
    ("solepizza", "app.cardapioweb.com"),
    ("bs_bgr", "app.cardapioweb.com"),
    ("inbrasa_caragua", "app.cardapioweb.com"),
    ("sabor_de_casa_marmitaria", "app.cardapioweb.com"),
    ("batatuba_batataria", "app.cardapioweb.com"),
    ("billy_bruto_hamburgueria", "app.cardapioweb.com"),
    ("xp_hamburgueria_caragua", "app.cardapioweb.com"),
]

INITIAL_ANOTA_SLUGS: List[str] = [
    "pdua-burguer",
    "caragua-shake",
    "martim-food",
    "sorveteriaeacaibeiramar",
    "point-do-japa-1",
    "kaipiras-lanches",
    "le-cheff-marmitaria-2",
]


def infer_cuisines(store: Dict[str, Any]) -> List[str]:
    """Derive clean Portuguese cuisine tags purely from scraped metadata & menu sections."""
    tags: List[str] = []
    corpus = " ".join(
        [
            store.get("name", ""),
            " ".join(store.get("servesCuisine") or []) if isinstance(store.get("servesCuisine"), list) else str(store.get("servesCuisine") or ""),
            " ".join(sec.get("category", "") for sec in store.get("sections", [])[:6]),
        ]
    ).lower()
    mapping = [
        (("sushi", "japa", "temaki", "yakisoba", "combinado", "poke"), "Culinária Japonesa"),
        (("pizza", "calzone", "brotinho", "esfiha"), "Pizzaria"),
        (("burguer", "burger", "smash", "artesanal", "xis", "lanche"), "Hambúrguer & Lanches"),
        (("marmita", "marmitex", "executivo", "feijoada", "parmegiana", "pirão", "pirao", "brasileira"), "Comida Brasileira"),
        (("quiosque", "peixe", "camarão", "camarao", "isca", "lula", "frutos do mar"), "Frutos do Mar & Orla"),
        (("açaí", "acai", "sorvete", "gelato", "milkshake", "milk shake"), "Açaí & Sorveteria"),
        (("bolo", "torta", "doce", "confeitaria", "churros", "pudim", "sobremesa"), "Doces & Confeitaria"),
        (("pastel", "coxinha", "salgado", "empada"), "Pastéis & Salgados"),
        (("churras", "espeto", "espetto", "picanha", "costela"), "Churrasco & Grelhados"),
    ]
    for keys, label in mapping:
        if any(k in corpus for k in keys) and label not in tags:
            tags.append(label)
    if not tags:
        tags.append("Culinária Regional")
    return tags[:3]


def infer_price_level(prices: List[float]) -> int:
    if not prices:
        return 2
    sorted_p = sorted(prices)
    med = sorted_p[len(sorted_p) // 2]
    if med <= 25.0:
        return 1
    if med <= 55.0:
        return 2
    if med <= 95.0:
        return 3
    return 4


def normalize_opening_hours(raw: Any) -> Optional[str]:
    if not raw:
        return None
    if isinstance(raw, str):
        return raw.strip()
    if isinstance(raw, list):
        clean = [str(x).strip() for x in raw if str(x).strip()]
        return " • ".join(clean[:3]) if clean else None
    if isinstance(raw, dict):
        return json.dumps(raw, ensure_ascii=False)
    return None


def deterministic_uuid(key: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"carafood-real:{key}"))


BAYESIAN_CONFIDENCE_M = 25.0

BEVERAGE_STOP_RE = re.compile(
    r"\b(bebida|bebidas|refrigerante|refrigerantes|cerveja|cervejas|chopp|chope|vinho|vinhos|"
    r"agua|suco|sucos|energ[eé]tico|soda|h2oh|schweppes|coca-?cola|guaran[aá]|fanta|sprite|pepsi|"
    r"heineken|brahma|skol|amstel|budweiser|corona|spaten|stella)\b"
)

FOOD_TYPE_REGEXES: List[Tuple[str, re.Pattern[str]]] = [
    ("combo_familia", re.compile(
        r"\b(combo\s*fam[ií]lia|fam[ií]lia|para\s*dividir|serve\s*[2-9]|casal|galera|kit\s*festa|"
        r"em\s*dobro|trio\b|quarteto|combo\s*[2-9]|2\s*(?:pizzas|lanches|burgers|x-)|barca\s*(?:grande|mega|giga))\b"
    )),
    ("sushi", re.compile(
        r"\b(sushi|sashimi|temaki|uramaki|hossomaki|niguiri|hot\s*roll|yakisoba|yakissoba|"
        r"combinado|barca|harumaki|rolinho\s+primavera|guioza|sunomono|shimeji|poke\b|culin[aá]ria\s+japonesa)\b"
    )),
    ("pizza", re.compile(
        r"\b(pizza|pizzas|calzone|broto|brotinho|esfiha|esfirra|esfihas|borda\s+recheada)\b"
    )),
    ("lanches", re.compile(
        r"\b(burger|burguer|hamb[uú]rguer|smash|x-?bacon|x-?salada|x-?tudo|x-?burguer|"
        r"x-?frango|x-?egg|x-?calabresa|lanche|lanches|hot\s*dog|dog[aã]o|sandu[ií]che|beirute|podr[aã]o|prensado)\b"
    )),
    ("marmitas", re.compile(
        r"\b(marmita|marmitex|executivo|prato\s*feito|\bpf\b|panqueca|strogonoff|estrogonofe|"
        r"parmegiana|feijoada|tropeiro|pir[aã]o|fil[eé]\s+de\s+frango|bife\s+acebolado|virado)\b"
    )),
    ("frutos_do_mar", re.compile(
        r"\b(camar[aã]o|peixe|ca[cç][aã]o|til[aá]pia|merluza|salm[aã]o|lula|polvo|"
        r"marisco|mexilh[aã]o|moqueca|bacalhau|casquinha|iscas?\s+de\s+peixe)\b"
    )),
    ("porcoes", re.compile(
        r"\b(por[cç][aã]o|por[cç][oõ]es|batata\s*recheada|batata\s*frita|fritas|onion|isca|iscas|"
        r"torresmo|pastel|past[eé]is|coxinha|salgado|salgados|espeto|espetinho|bolinho|nuggets)\b"
    )),
    ("doces_acai", re.compile(
        r"\b(a[cç]a[ií]|sorvete|sorvetes|milk\s*shake|milkshake|churro|churros|bolo|torta|"
        r"brownie|pudim|brigadeiro|trufa|petit\s*gateau|pizza\s*doce|sobremesa|pav[eê]|fondue|banoffee)\b"
    )),
]


def _ascii_lower(txt: str) -> str:
    return unicodedata.normalize("NFD", txt or "").encode("ascii", "ignore").decode("ascii").lower()


def classify_dish_food_types(name: str, description: str, category: str) -> List[str]:
    """Deterministically classify each real dish into canonical consumer food types."""
    cat_name = _ascii_lower(f"{category} {name}")
    full_txt = _ascii_lower(f"{category} {name} {description}")
    is_beverage = bool(BEVERAGE_STOP_RE.search(_ascii_lower(category))) and not any(
        w in _ascii_lower(name) for w in ("combo", "pizza", "burger", "lanche", "acai", "marmita")
    )
    if is_beverage:
        return ["bebidas"]

    matched: List[str] = []
    for ftype, rx in FOOD_TYPE_REGEXES:
        hay = full_txt if ftype == "combo_familia" else cat_name
        if rx.search(hay):
            matched.append(ftype)

    # Evitar que itens puramente de sushi (ex: Temaki Salmão) apareçam em Frutos do Mar se o usuário buscar Peixaria/Orla, a menos que seja prato de peixe
    if "sushi" in matched and "frutos_do_mar" in matched and not re.search(r"\b(moqueca|til[aá]pia|camar[aã]o|isca|lula|polvo|ca[cç][aã]o|merluza)\b", cat_name):
        matched.remove("frutos_do_mar")

    return matched or ["outros"]


def diversify_store_preview_dishes(menu_by_category: List[Dict[str, Any]], max_items: int = 16) -> List[Dict[str, Any]]:
    """Select up to `max_items` dishes spread round-robin across store categories, favoring real photos & promos."""
    buckets: List[List[Dict[str, Any]]] = []
    for blk in menu_by_category:
        items = list(blk.get("items") or [])
        if not items:
            continue

        def _item_key(d: Dict[str, Any]) -> Tuple[int, int, int, float]:
            has_img = 1 if d.get("image_url") else 0
            has_drop = 1 if (d.get("last_price_delta_pct") or 0) < 0 else 0
            is_drink = 1 if "bebidas" in (d.get("food_types") or []) else 0
            return (has_img, -is_drink, has_drop, float(d.get("price") or 0))

        buckets.append(sorted(items, key=_item_key, reverse=True))

    # Order category buckets so photo-rich food categories come first
    buckets.sort(
        key=lambda b: (
            1 if b[0].get("image_url") else 0,
            0 if "bebidas" in (b[0].get("food_types") or []) else 1,
            len(b),
        ),
        reverse=True,
    )

    chosen: List[Dict[str, Any]] = []
    seen_ids: Set[str] = set()
    round_idx = 0
    while len(chosen) < max_items:
        added_this_round = False
        for b in buckets:
            if round_idx < len(b):
                cand = b[round_idx]
                if cand["id"] not in seen_ids:
                    chosen.append(cand)
                    seen_ids.add(cand["id"])
                    added_this_round = True
                    if len(chosen) >= max_items:
                        break
        if not added_this_round:
            break
        round_idx += 1
    return chosen


def deduplicate_stores(stores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Keep unique Caraguatatuba establishments; prefer CardápioWeb/Anota AI if richer photos."""
    priority = {"CardápioWeb": 3, "Anota AI": 2, "Aiqfome": 1}
    by_norm_name: Dict[str, Dict[str, Any]] = {}
    for st in stores:
        norm = slugify_text(st["name"].split(" - ")[0])
        if norm in by_norm_name:
            prev = by_norm_name[norm]
            prev_score = (prev.get("dish_photos_count", 0) * 10) + priority.get(prev["source_platform"], 0)
            curr_score = (st.get("dish_photos_count", 0) * 10) + priority.get(st["source_platform"], 0)
            if curr_score > prev_score:
                by_norm_name[norm] = st
        else:
            by_norm_name[norm] = st
    return list(by_norm_name.values())


def run_pipeline(discover_gmaps: bool = False, refresh_aiqfome: bool = False, skip_gmaps_enrich: bool = False) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    enricher = GoogleMapsEnricher()
    cw_adapter = CardapioWebAdapter()
    anota_adapter = AnotaAIAdapter()
    aiq_adapter = AiqfomeAdapter()

    cw_slugs = list(INITIAL_CW_SLUGS)
    anota_slugs = list(INITIAL_ANOTA_SLUGS)

    if discover_gmaps:
        print("[1/5] Discovering digital menu links on Google Maps Caraguatatuba...")
        found = enricher.discover_digital_menu_links()
        known_cw = {s for s, _ in cw_slugs}
        for s in sorted(found["cardapioweb"]):
            if s not in known_cw:
                cw_slugs.append((s, "app.cardapioweb.com"))
                known_cw.add(s)
        for s in sorted(found["anotaai"]):
            if s not in anota_slugs:
                anota_slugs.append(s)
        print(f"  Total candidate slugs -> CW={len(cw_slugs)}, AnotaAI={len(anota_slugs)}")

    print("[2/5] Fetching live CardápioWeb & Anota AI menus...")
    live_stores: List[Dict[str, Any]] = []
    with httpx.Client(timeout=25.0, follow_redirects=True) as client:
        for slug, host in cw_slugs:
            try:
                st = cw_adapter.fetch_store(client, slug, host)
                if st:
                    live_stores.append(st)
                    print(f"  + CW: {st['name']} ({st['dishes_count']} pratos, {st['dish_photos_count']} fotos)")
            except Exception as exc:
                print(f"  ! CW {slug} failed: {exc}")

        for slug in anota_slugs:
            try:
                st = anota_adapter.fetch_store(client, slug)
                if st:
                    live_stores.append(st)
                    print(f"  + AnotaAI: {st['name']} ({st['dishes_count']} pratos, {st['dish_photos_count']} fotos)")
            except Exception as exc:
                print(f"  ! AnotaAI {slug} failed: {exc}")

    if refresh_aiqfome or not AIQFOME_RAW_FILE.exists():
        print("[2b/5] Harvesting live Aiqfome Caraguatatuba stores...")
        aiq_stores = aiq_adapter.discover_and_harvest_all(delay_sec=2.6)
        AIQFOME_RAW_FILE.write_text(
            json.dumps({"harvested_at": datetime.now(timezone.utc).isoformat(), "stores": aiq_stores}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    else:
        print(f"[2b/5] Loading cached Aiqfome harvest from {AIQFOME_RAW_FILE.name}...")
        aiq_raw = json.loads(AIQFOME_RAW_FILE.read_text(encoding="utf-8"))
        aiq_stores = aiq_raw.get("stores", [])
        for st in aiq_stores:
            st["source_platform"] = "Aiqfome"
            st["cover"] = normalize_image_url(st.get("cover"))
            st["logo"] = normalize_image_url(st.get("logo"))
            for sec in st.get("sections", []):
                for it in sec.get("items", []):
                    it["image_url"] = normalize_image_url(it.get("image_url"))

    all_stores = deduplicate_stores(live_stores + aiq_stores)
    print(f"Merged unique Caraguatatuba stores: {len(all_stores)}")

    gmaps_cache: Dict[str, Dict[str, Any]] = {}
    if not skip_gmaps_enrich:
        print("[3/5] Enriching stores on Google Maps (ratings, reviews, food photos, coords)...")
        gmaps_cache = enricher.enrich_stores(all_stores, GMAPS_CACHE_FILE)
    elif GMAPS_CACHE_FILE.exists():
        gmaps_cache = json.loads(GMAPS_CACHE_FILE.read_text(encoding="utf-8"))

    # Collect every external image URL & verify HTTP 200 reachability
    print("[4/5] Verifying reachability of all harvested dish & restaurant photos...")
    all_img_urls: Set[str] = set()
    for st in all_stores:
        if st.get("cover"):
            all_img_urls.add(st["cover"])
        if st.get("logo"):
            all_img_urls.add(st["logo"])
        for gp in (gmaps_cache.get(st["slug"], {}).get("gallery_photos") or []):
            all_img_urls.add(gp)
        for sec in st.get("sections", []):
            for it in sec.get("items", []):
                if it.get("image_url"):
                    all_img_urls.add(it["image_url"])

    img_status = verify_image_urls_batch(all_img_urls, max_workers=20)
    ok_count = sum(1 for v in img_status.values() if v)
    print(f"  Verified {ok_count}/{len(all_img_urls)} live images (broken links pruned cleanly)")

    def _valid_img(u: Optional[str]) -> str:
        nu = normalize_image_url(u)
        return nu if (nu and img_status.get(nu, False)) else ""

    print("[5/5] Compiling canonical CaráFood frontend dump...")
    restaurants_list: List[Dict[str, Any]] = []
    restaurant_details: Dict[str, Dict[str, Any]] = {}
    dish_details: Dict[str, Dict[str, Any]] = {}
    neighborhood_counts: Dict[str, Dict[str, int]] = {
        k: {"restaurants_count": 0, "active_dishes_count": 0} for k in CARAGUA_53_NEIGHBORHOODS
    }
    now_iso = datetime.now(timezone.utc).isoformat()

    for st in all_stores:
        gm = gmaps_cache.get(st["slug"], {})
        raw_lat = gm.get("latitude") if is_valid_caragua_coords(gm.get("latitude"), gm.get("longitude")) else st.get("latitude")
        raw_lng = gm.get("longitude") if is_valid_caragua_coords(gm.get("latitude"), gm.get("longitude")) else st.get("longitude")
        raw_neigh_hint = st.get("neighborhood") or st.get("address") or ""
        neigh_slug, neigh_name, exact_lat, exact_lng = resolve_caragua_neighborhood(
            raw_neigh_hint, lat=raw_lat, lng=raw_lng
        )

        clean_slug = slugify_text(f"{st['name']}-{neigh_slug}")
        rest_id = deterministic_uuid(f"rest:{clean_slug}:{st['slug']}")
        cuisines = infer_cuisines(st)
        rating_avg = float(gm.get("rating") or 0.0) if gm.get("matched") and gm.get("rating") else 0.0
        total_revs = int(gm.get("total_reviews") or 0) if gm.get("matched") else 0
        raw_reviews = gm.get("reviews") or []

        formatted_reviews = [
            {
                "id": deterministic_uuid(f"rev:{clean_slug}:{idx}:{rev.get('author','')}"),
                "author": rev.get("author") or "Cliente Google Maps",
                "rating": float(rev.get("rating") or 5.0),
                "comment": (rev.get("comment") or "").strip(),
                "date": rev.get("date") or "No Google Maps",
                "verified": True,
                "source": "Google Maps",
            }
            for idx, rev in enumerate(raw_reviews)
            if (rev.get("comment") or "").strip()
        ]

        gallery_photos: List[str] = []
        cover_url = _valid_img(st.get("cover"))
        logo_url = _valid_img(st.get("logo"))
        for candidate in [cover_url] + list(gm.get("gallery_photos") or []):
            vc = _valid_img(candidate)
            if vc and vc not in gallery_photos:
                gallery_photos.append(vc)

        menu_by_category: List[Dict[str, Any]] = []
        all_store_dishes: List[Dict[str, Any]] = []
        all_prices: List[float] = []
        has_price_drop = False
        dish_with_photo_urls: List[str] = []

        for sec in st.get("sections", []):
            cat_name = sec.get("category") or "Cardápio"
            cat_items: List[Dict[str, Any]] = []
            for it in sec.get("items", []):
                name = (it.get("name") or "").strip()
                price = float(it.get("price") or 0)
                if not name or price <= 0:
                    continue
                desc = (it.get("description") or "").strip()
                img_u = _valid_img(it.get("image_url"))
                prev_price = it.get("previous_price")
                savings_brl = round(prev_price - price, 2) if (prev_price and prev_price > price) else 0.0
                delta_pct = round(((price - prev_price) / prev_price) * 100.0, 1) if (prev_price and prev_price > price) else 0.0
                if delta_pct < 0:
                    has_price_drop = True

                diet = DietaryInferenceEngine.infer(name, desc, cat_name)
                food_types = classify_dish_food_types(name, desc, cat_name)
                dish_id = deterministic_uuid(f"dish:{clean_slug}:{cat_name}:{name}")
                all_prices.append(price)
                if img_u and img_u not in dish_with_photo_urls:
                    dish_with_photo_urls.append(img_u)

                price_hist = []
                if prev_price and delta_pct < 0:
                    price_hist.append({
                        "recorded_at": now_iso,
                        "previous_price": round(float(prev_price), 2),
                        "new_price": round(price, 2),
                        "price": round(price, 2),
                        "delta_percentage": delta_pct,
                    })

                dish_obj = {
                    "id": dish_id,
                    "restaurant_id": rest_id,
                    "name": name,
                    "description": desc,
                    "price": round(price, 2),
                    "previous_price": round(float(prev_price), 2) if prev_price else None,
                    "savings_brl": savings_brl,
                    "category": cat_name,
                    "food_types": food_types,
                    "image_url": img_u,
                    "is_vegan": bool(diet.get("is_vegan", False)),
                    "is_vegetarian": bool(diet.get("is_vegetarian", False)),
                    "is_gluten_free": bool(diet.get("is_gluten_free", False)),
                    "is_lactose_free": bool(diet.get("is_lactose_free", False)),
                    "last_price_delta_pct": delta_pct,
                    "price_history": price_hist,
                }
                cat_items.append(dish_obj)
                all_store_dishes.append(dish_obj)

            if cat_items:
                menu_by_category.append({"category": cat_name, "items": cat_items})

        if not all_store_dishes:
            continue

        # Fallback banner strictly to verified restaurant/dish photo (never stock!)
        banner_url = gallery_photos[0] if gallery_photos else (dish_with_photo_urls[0] if dish_with_photo_urls else logo_url)
        avatar_url = logo_url or banner_url
        for du in dish_with_photo_urls[:4]:
            if du not in gallery_photos:
                gallery_photos.append(du)

        preview_dishes = diversify_store_preview_dishes(menu_by_category, max_items=16)
        store_food_types = sorted({
            ft
            for d in all_store_dishes
            for ft in (d.get("food_types") or [])
            if ft not in ("bebidas", "outros")
        })
        dist_km = round(calculate_haversine(PRACA_EVENTOS_LAT, PRACA_EVENTOS_LON, exact_lat, exact_lng), 2)
        dist_m = int(round(dist_km * 1000))
        source_label = f"{st['source_platform']} + Google Maps" if gm.get("matched") else st["source_platform"]

        neighborhood_counts[neigh_slug]["restaurants_count"] += 1
        neighborhood_counts[neigh_slug]["active_dishes_count"] += len(all_store_dishes)

        super_nota = {
            "super_score": rating_avg,
            "bayesian_rating": rating_avg,
            "google_score": rating_avg,
            "google_weight_pct": 100 if rating_avg > 0 else 0,
            "tripadvisor_score": 0.0,
            "tripadvisor_weight_pct": 0,
            "curatorship_score": 0.0,
            "curatorship_weight_pct": 0,
        }

        rest_card = {
            "id": rest_id,
            "name": st["name"],
            "slug": clean_slug,
            "address": st.get("address") or f"{neigh_name}, Caraguatatuba - SP",
            "neighborhood": neigh_name,
            "city": "Caraguatatuba",
            "state": "SP",
            "phone": (st.get("phone") or st.get("telephone") or "").strip() or None,
            "website": st.get("url") or gm.get("website") or None,
            "menu_url": st.get("url"),
            "instagram": st.get("instagram") or None,
            "latitude": exact_lat,
            "longitude": exact_lng,
            "price_level": infer_price_level(all_prices),
            "rating_score": rating_avg,
            "bayesian_rating": rating_avg,
            "rating_average": rating_avg,
            "total_reviews": total_revs,
            "review_count": total_revs,
            "active_dishes_count": len(all_store_dishes),
            "dish_photos_count": len(dish_with_photo_urls),
            "has_price_drop": has_price_drop,
            "is_real_osm": True,
            "source_platform": source_label,
            "cuisine_types": cuisines,
            "food_types": store_food_types,
            "banner_url": banner_url,
            "image_url": avatar_url,
            "cover_image": banner_url,
            "gallery_photos": gallery_photos[:10],
            "opening_hours": normalize_opening_hours(st.get("openingHours")),
            "distance_meters": dist_m,
            "distance_km": dist_km,
            "dishes_preview": preview_dishes,
            "dishes": preview_dishes,
        }
        restaurants_list.append(rest_card)

        restaurant_details[clean_slug] = {
            **rest_card,
            "menu_by_category": menu_by_category,
            "recent_reviews": formatted_reviews,
            "reviews": formatted_reviews,
            "super_nota": super_nota,
        }

        for d in all_store_dishes:
            related = [x for x in preview_dishes if x["id"] != d["id"]][:4]
            dish_details[d["id"]] = {
                "dish": d,
                "restaurant": {
                    "id": rest_id,
                    "name": st["name"],
                    "slug": clean_slug,
                    "address": rest_card["address"],
                    "neighborhood": neigh_name,
                    "phone": rest_card["phone"],
                    "website": rest_card["website"],
                    "menu_url": rest_card["menu_url"],
                    "latitude": exact_lat,
                    "longitude": exact_lng,
                    "rating_average": rating_avg,
                    "total_reviews": total_revs,
                    "cuisine_types": cuisines,
                    "is_real_osm": True,
                    "image_url": avatar_url,
                    "banner_url": banner_url,
                    "opening_hours": rest_card["opening_hours"],
                    "source_platform": source_label,
                    "distance_km": dist_km,
                },
                "super_nota": super_nota,
                "reviews": formatted_reviews,
                "related_dishes": related,
            }

    # Compute city-wide Bayesian prior C and update W_R across all restaurants/details/dishes
    rated_vals = [
        float(r["rating_average"])
        for r in restaurants_list
        if (r.get("rating_average") or 0) > 0 and (r.get("total_reviews") or 0) > 0
    ]
    city_prior_c = round(sum(rated_vals) / len(rated_vals), 2) if rated_vals else 4.20

    slug_to_wr: Dict[str, float] = {}
    for r in restaurants_list:
        raw_r = float(r.get("rating_average") or 0.0)
        vol_v = int(r.get("total_reviews") or 0)
        if raw_r > 0 and vol_v > 0:
            wr = round(
                ((vol_v / (vol_v + BAYESIAN_CONFIDENCE_M)) * raw_r)
                + ((BAYESIAN_CONFIDENCE_M / (vol_v + BAYESIAN_CONFIDENCE_M)) * city_prior_c),
                2,
            )
        else:
            wr = 0.0

        has_photos_bonus = 100.0 if (r.get("dish_photos_count") or 0) > 0 else 0.0
        photo_richness = min(float(r.get("dish_photos_count") or 0), 20.0) * 0.5
        promo_bonus = 4.0 if r.get("has_price_drop") else 0.0
        volume_bonus = math.log10(1.0 + max(0, vol_v)) * 6.0
        ranking_score = round(has_photos_bonus + (wr * 25.0) + volume_bonus + photo_richness + promo_bonus, 3)

        r["bayesian_rating"] = wr
        r["rating_score"] = wr
        r["ranking_score"] = ranking_score
        slug_to_wr[r["slug"]] = wr

        det = restaurant_details.get(r["slug"])
        if det:
            det["bayesian_rating"] = wr
            det["rating_score"] = wr
            det["ranking_score"] = ranking_score
            det["super_nota"] = {
                "super_score": wr,
                "bayesian_rating": wr,
                "google_score": raw_r,
                "prior_c": city_prior_c,
                "confidence_m": BAYESIAN_CONFIDENCE_M,
                "google_weight_pct": 100 if raw_r > 0 else 0,
                "tripadvisor_score": 0.0,
                "tripadvisor_weight_pct": 0,
                "curatorship_score": 0.0,
                "curatorship_weight_pct": 0,
            }

    for dd in dish_details.values():
        rslug = dd["restaurant"]["slug"]
        wr = slug_to_wr.get(rslug, dd["restaurant"]["rating_average"])
        raw_r = float(dd["restaurant"].get("rating_average") or 0.0)
        dd["restaurant"]["bayesian_rating"] = wr
        dd["restaurant"]["rating_score"] = wr
        dd["super_nota"] = {
            "super_score": wr,
            "bayesian_rating": wr,
            "google_score": raw_r,
            "prior_c": city_prior_c,
            "confidence_m": BAYESIAN_CONFIDENCE_M,
            "google_weight_pct": 100 if raw_r > 0 else 0,
            "tripadvisor_score": 0.0,
            "tripadvisor_weight_pct": 0,
            "curatorship_score": 0.0,
            "curatorship_weight_pct": 0,
        }

    # Sort canonically by Bayesian Super Score W_R + verified dish photo completeness + review volume
    restaurants_list.sort(
        key=lambda r: (
            1 if r["dish_photos_count"] > 0 else 0,
            r["bayesian_rating"],
            r["total_reviews"],
            min(r["dish_photos_count"], 20),
            r["active_dishes_count"],
        ),
        reverse=True,
    )

    neighborhoods_list = []
    populated_count = 0
    for k, meta in CARAGUA_53_NEIGHBORHOODS.items():
        cnts = neighborhood_counts[k]
        if cnts["restaurants_count"] > 0:
            populated_count += 1
        neighborhoods_list.append({
            "slug": k,
            "name": meta["name"],
            "region": meta["region"],
            "macro": meta["region"],
            "latitude": meta["lat"],
            "longitude": meta["lng"],
            "restaurants_count": cnts["restaurants_count"],
            "active_dishes_count": cnts["active_dishes_count"],
        })

    dump_payload = {
        "generated_at": now_iso,
        "pipeline": "CaráFood Real Extractor (CardápioWeb + Anota AI + Aiqfome + Google Maps)",
        "restaurants": restaurants_list,
        "neighborhoods_summary": {
            "populated_neighborhoods_count": populated_count,
            "neighborhoods": neighborhoods_list,
        },
        "restaurant_details": restaurant_details,
        "dish_details": dish_details,
    }

    serialized = json.dumps(dump_payload, ensure_ascii=False, indent=2)
    DEST_FRONTEND.write_text(serialized, encoding="utf-8")
    if DEST_ADMIN.parent.exists():
        DEST_ADMIN.write_text(serialized, encoding="utf-8")

    total_dishes = sum(r["active_dishes_count"] for r in restaurants_list)
    total_dish_photos = sum(
        1 for dd in dish_details.values() if dd["dish"].get("image_url")
    )
    total_revs = sum(len(rd["recent_reviews"]) for rd in restaurant_details.values())
    print(
        f"\nSUCCESS -> {len(restaurants_list)} real Caraguá restaurants | "
        f"{total_dishes} real dishes | {total_dish_photos} real dish photos | "
        f"{total_revs} real Google customer reviews | {populated_count} neighborhoods"
    )
    print(f"Saved: {DEST_FRONTEND}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CaráFood Real Caraguatatuba Catalog Pipeline")
    parser.add_argument("--discover-gmaps", action="store_true", help="Discover extra digital menus on Google Maps")
    parser.add_argument("--refresh-aiqfome", action="store_true", help="Re-scrape all aiqfome Caraguatatuba stores live")
    parser.add_argument("--skip-gmaps-enrich", action="store_true", help="Skip Playwright Google Maps enrichment pass")
    args = parser.parse_args()
    run_pipeline(
        discover_gmaps=args.discover_gmaps,
        refresh_aiqfome=args.refresh_aiqfome,
        skip_gmaps_enrich=args.skip_gmaps_enrich,
    )
