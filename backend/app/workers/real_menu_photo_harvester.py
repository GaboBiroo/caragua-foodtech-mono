"""
CaráFood — Real Web Extractor for Caraguatatuba/SP Menus, Prices, Photos & Google Reviews.

Harvests genuine establishments, dishes, BRL prices, real merchant dish photography,
and Google Maps ratings/reviews/place photos across:
  1. CardápioWeb public catalog API
  2. Anota AI public digital menu API
  3. Aiqfome Caraguatatuba directory & store menus
  4. Google Maps Playwright discovery & enrichment (ratings, reviews, food/place photos, coords)

Zero synthetic restaurants, zero invented dishes, zero stock/Unsplash fallback photos.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import httpx

DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

# Broader mainland Caraguatatuba bounds (Canto do Mar south to Tabatinga north)
CARAGUA_BBOX = {
    "lat_min": -23.745,
    "lat_max": -23.515,
    "lng_min": -45.545,
    "lng_max": -45.280,
}

REJECT_NAME_TOKENS = ("teste", "loja teste", "demo", "sandbox")


def is_valid_caragua_coords(lat: Optional[float], lng: Optional[float]) -> bool:
    """Return True if coordinates lie within Caraguatatuba municipality bounds."""
    if lat is None or lng is None:
        return False
    return (
        CARAGUA_BBOX["lat_min"] <= float(lat) <= CARAGUA_BBOX["lat_max"]
        and CARAGUA_BBOX["lng_min"] <= float(lng) <= CARAGUA_BBOX["lng_max"]
    )


def is_caraguatatuba_place(city: Optional[str], lat: Optional[float] = None, lng: Optional[float] = None) -> bool:
    """Validate that an establishment is genuinely located in Caraguatatuba/SP."""
    c = (city or "").lower()
    if c and ("caraguatatuba" in c or "caragua" in c or "caraguá" in c):
        return True
    if is_valid_caragua_coords(lat, lng):
        return True
    return False


def is_real_store_name(name: str) -> bool:
    """Filter out obvious test stubs or CNPJ-only minimal test entries without real names."""
    low = (name or "").strip().lower()
    if not low or any(tok in low for tok in REJECT_NAME_TOKENS):
        return False
    return True


def normalize_image_url(url: Optional[str]) -> str:
    """Normalize known CDN hosts (aiqfome, high-res Google Maps crops) and strip placeholders."""
    if not url:
        return ""
    u = str(url).strip()
    if not u.startswith("http"):
        return ""
    low = u.lower()
    if any(bad in low for bad in ("unsplash.com", "default", "no-image", "placeholder")) or u.endswith("/itens/"):
        return ""
    u = u.replace("https://devimagens.aiqfome.com/", "https://imagens.aiqfome.com/")
    if "googleusercontent.com" in u and "=w900-h600-k-no" in u:
        u = u.split("=")[0] + "=w1200-no"
    return u


def parse_gmap_coords_from_url(url: str) -> Tuple[Optional[float], Optional[float]]:
    """Extract precise lat/lng coordinates from Google Maps place URLs."""
    m = re.search(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)", url or "")
    if m:
        return float(m.group(1)), float(m.group(2))
    m2 = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url or "")
    if m2:
        return float(m2.group(1)), float(m2.group(2))
    return None, None


def clean_gmap_photo_url(src: str) -> str:
    """Convert Google Maps photo URLs to high-res food/place crops, excluding StreetView panos and tiny avatars."""
    if not src or "googleusercontent.com" not in src:
        return ""
    if any(x in src for x in ("-pi-", "-ya", "p-k-no", "=w32-h32", "=w36-h36", "=w40-h40", "default_user", "streetviewpixels", "gps-static")):
        return ""
    base = src.split("=")[0]
    if any(seg in base for seg in ("/p/", "/gps-cs-s/", "/grass-cs/", "/geougc/")):
        return f"{base}=w1200-no"
    return ""


def clean_store_query_name(name: str) -> str:
    """Strip promotional taglines/CNPJ numbers so Google Maps queries match cleanly."""
    cleaned = re.sub(r"^\d{2}\.\d{3}\.\d{3}\s+", "", name or "")
    cleaned = cleaned.split(" - ")[0].split(" l ")[0].split(" | ")[0]
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned or (name or "").strip()


class CardapioWebAdapter:
    """Fetches real Caraguatatuba menus, promotional price drops & GCS photos from CardápioWeb."""

    def fetch_store(self, client: httpx.Client, slug: str, hostname: str = "app.cardapioweb.com") -> Optional[Dict[str, Any]]:
        headers = {
            "User-Agent": DEFAULT_UA,
            "Origin": f"https://{hostname}",
            "Referer": f"https://{hostname}/",
        }
        pr = client.get(
            f"https://integracao.cardapioweb.com/api/menu/company/profile?company={slug}&hostname={hostname}",
            headers=headers,
        )
        if pr.status_code != 200:
            return None
        pj = pr.json()
        lat = float(pj["latitude"]) if pj.get("latitude") else None
        lng = float(pj["longitude"]) if pj.get("longitude") else None
        if not is_caraguatatuba_place(pj.get("city"), lat, lng):
            return None
        name = (pj.get("name") or slug).strip()
        if not is_real_store_name(name):
            return None

        cr = client.get(
            "https://integracao.cardapioweb.com/api/menu/company/categories?only_available_for=delivery&origin=catalogo",
            headers={**headers, "Company": slug},
        )
        if cr.status_code != 200:
            return None
        cats = cr.json()
        sections: List[Dict[str, Any]] = []
        dish_cnt = 0
        photo_cnt = 0
        promo_cnt = 0
        for cat in (cats if isinstance(cats, list) else []):
            items_out = []
            for it in (cat.get("items") or []):
                price = float(it.get("price") or it.get("minimum_price") or 0)
                if price <= 0:
                    continue
                prev_price: Optional[float] = None
                promo_val = it.get("promotional_price")
                if it.get("promotional_price_active") and promo_val:
                    pv = float(promo_val)
                    if 0 < pv < price:
                        prev_price = round(price, 2)
                        price = pv
                        promo_cnt += 1
                img = normalize_image_url(it.get("image_url") or it.get("thumbnail_url"))
                dish_cnt += 1
                if img:
                    photo_cnt += 1
                items_out.append({
                    "name": (it.get("name") or "").strip(),
                    "description": (it.get("description") or "").strip(),
                    "price": round(price, 2),
                    "previous_price": prev_price,
                    "image_url": img,
                })
            if items_out:
                sections.append({"category": (cat.get("name") or "Cardápio").strip(), "items": items_out})

        if dish_cnt == 0:
            return None

        addr_parts = [pj.get("street") or "", pj.get("address_number") or "", pj.get("neighborhood") or ""]
        return {
            "source_platform": "CardápioWeb",
            "slug": slug,
            "name": name,
            "url": f"https://{hostname}/{slug}",
            "address": ", ".join(p for p in addr_parts if p),
            "neighborhood": (pj.get("neighborhood") or "").strip(),
            "city": pj.get("city") or "Caraguatatuba",
            "latitude": lat,
            "longitude": lng,
            "phone": (pj.get("phone_number") or pj.get("order_whatsapp") or "").strip(),
            "instagram": (pj.get("instagram") or "").strip(),
            "cover": normalize_image_url(pj.get("image") or pj.get("thumbnail")),
            "logo": normalize_image_url(pj.get("logo")),
            "openingHours": pj.get("business_hours"),
            "sections": sections,
            "dishes_count": dish_cnt,
            "dish_photos_count": photo_cnt,
            "promo_count": promo_cnt,
        }


class AnotaAIAdapter:
    """Fetches real Caraguatatuba digital menus & S3 product images from Anota AI."""

    def fetch_store(self, client: httpx.Client, slug: str) -> Optional[Dict[str, Any]]:
        ar = client.get(f"https://api.anota.ai/noauth/access/get-token/{slug}", headers={"User-Agent": DEFAULT_UA})
        if ar.status_code != 200 or not ar.json().get("token"):
            return None
        tok = ar.json()["token"]
        mr = client.get(
            "https://api.anota.ai/clientauth/nm-category/menu-merchant?displaySources=DIGITAL_MENU",
            headers={"Authorization": tok, "User-Agent": DEFAULT_UA},
        )
        if mr.status_code != 200:
            return None
        data = mr.json().get("data") or {}
        est = data.get("establishment") or {}
        page_info = est.get("page") or {}
        pname = (page_info.get("name") or slug).strip()
        if not is_real_store_name(pname):
            return None

        unit = (est.get("units") or [{}])[0]
        addr = unit.get("address") or {}
        coords = (addr.get("location") or {}).get("coordinates") or []
        lng, lat = (float(coords[0]), float(coords[1])) if len(coords) == 2 else (None, None)
        if not is_caraguatatuba_place(addr.get("city"), lat, lng):
            return None

        cats = (data.get("menu") or {}).get("menu") or []
        sections: List[Dict[str, Any]] = []
        dish_cnt = 0
        photo_cnt = 0
        for cat in (cats if isinstance(cats, list) else []):
            items_out = []
            for it in (cat.get("itens") or cat.get("items") or []):
                if it.get("out"):
                    continue
                price = float(it.get("price") or 0)
                if price <= 0 and isinstance(it.get("next_steps"), list):
                    opts = [
                        float(opt.get("price") or 0)
                        for ns in it["next_steps"]
                        for opt in (ns.get("itens") or [])
                        if float(opt.get("price") or 0) > 0
                    ]
                    if opts:
                        price = min(opts)
                if price <= 0:
                    continue
                img = normalize_image_url(it.get("image"))
                dish_cnt += 1
                if img:
                    photo_cnt += 1
                items_out.append({
                    "name": (it.get("title") or it.get("name") or "").strip(),
                    "description": (it.get("description") or "").strip(),
                    "price": round(price, 2),
                    "previous_price": None,
                    "image_url": img,
                })
            if items_out:
                sections.append({"category": (cat.get("title") or cat.get("name") or "Cardápio").strip(), "items": items_out})

        if dish_cnt < 5:
            return None

        logo_or_cover = normalize_image_url(page_info.get("image"))
        return {
            "source_platform": "Anota AI",
            "slug": slug,
            "name": pname,
            "url": f"https://pedido.anota.ai/loja/{slug}",
            "address": (addr.get("addressFormated") or "").strip(),
            "neighborhood": (addr.get("neighborhood") or "").strip(),
            "city": addr.get("city") or "Caraguatatuba",
            "latitude": lat,
            "longitude": lng,
            "phone": (est.get("whatsapp") or "").strip(),
            "instagram": "",
            "cover": logo_or_cover,
            "logo": logo_or_cover,
            "sections": sections,
            "dishes_count": dish_cnt,
            "dish_photos_count": photo_cnt,
            "promo_count": 0,
        }


class AiqfomeAdapter:
    """Polite Caraguatatuba scraper for Aiqfome city listings & tolerant JSON-LD menus."""

    @staticmethod
    def _parse_ld(html: str) -> Optional[Dict[str, Any]]:
        blocks = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.S | re.I)
        for b in blocks:
            if "@type" in b and "Restaurant" in b:
                txt = b.strip()
                txt = re.sub(r'("(?:logo|image)"\s*:\s*)(https?://[^"\s]+?)(?="(?:image|telephone)"|\s*[,}])', r'\1"\2", ', txt)
                txt = re.sub(r'("(?:logo|image)"\s*:\s*)(?="(?:image|telephone)")', r'\1"", ', txt)
                txt = re.sub(r'("image"\s*:\s*"[^"]*")\s*("telephone")', r'\1, \2', txt)
                txt = re.sub(r'("logo"\s*:\s*"[^"]*")\s*("image")', r'\1, \2', txt)
                txt = re.sub(r",\s*([}\]])", r"\1", txt)
                txt = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", txt)
                try:
                    return json.loads(txt, strict=False)
                except Exception:
                    return None
        return None

    @staticmethod
    def _parse_offer_price(raw_price: Any) -> float:
        if isinstance(raw_price, (int, float)):
            return float(raw_price)
        if not raw_price:
            return 0.0
        nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", str(raw_price).replace(",", ".")) if float(x) > 0]
        return min(nums) if nums else 0.0

    def discover_and_harvest_all(self, delay_sec: float = 2.6) -> List[Dict[str, Any]]:
        stores_out: List[Dict[str, Any]] = []
        with httpx.Client(headers={"User-Agent": DEFAULT_UA}, timeout=25.0, follow_redirects=True) as client:
            idx = client.get("https://aiqfome.com/SP/caraguatatuba")
            slugs = sorted(set(re.findall(r"/SP/caraguatatuba/([a-z0-9-]+)", idx.text)))
            for slug in slugs:
                time.sleep(delay_sec)
                resp = None
                for _ in range(3):
                    resp = client.get(f"https://aiqfome.com/SP/caraguatatuba/{slug}")
                    if resp.status_code == 429:
                        time.sleep(int(resp.headers.get("Retry-After", "15")) + 2)
                        continue
                    break
                if not resp or resp.status_code != 200:
                    continue
                ld = self._parse_ld(resp.text)
                if not ld:
                    continue
                menu = ld.get("menu") or ld.get("hasMenu") or {}
                secs = menu.get("hasMenuSection") or []
                if isinstance(secs, dict):
                    secs = [secs]
                parsed_secs = []
                dish_cnt = 0
                photo_cnt = 0
                for s in secs:
                    if not isinstance(s, dict):
                        continue
                    its = s.get("hasMenuItem") or []
                    if isinstance(its, dict):
                        its = [its]
                    items_out = []
                    for it in its:
                        if not isinstance(it, dict):
                            continue
                        price = self._parse_offer_price((it.get("offers") or {}).get("price"))
                        if price <= 0:
                            continue
                        img = normalize_image_url(it.get("image"))
                        dish_cnt += 1
                        if img:
                            photo_cnt += 1
                        items_out.append({
                            "name": (it.get("name") or "").strip(),
                            "description": (it.get("description") or "").strip(),
                            "price": round(price, 2),
                            "previous_price": None,
                            "image_url": img,
                        })
                    if items_out:
                        parsed_secs.append({"category": (s.get("name") or "Cardápio").strip().title(), "items": items_out})
                if dish_cnt == 0:
                    continue
                stores_out.append({
                    "source_platform": "Aiqfome",
                    "slug": slug,
                    "name": (ld.get("name") or slug).strip(),
                    "url": f"https://aiqfome.com/SP/caraguatatuba/{slug}",
                    "telephone": (ld.get("telephone") or "").strip(),
                    "logo": normalize_image_url(ld.get("logo")),
                    "cover": normalize_image_url(ld.get("image")),
                    "address": ((ld.get("address") or {}).get("streetAddress") or "").strip(),
                    "servesCuisine": ld.get("servesCuisine"),
                    "openingHours": ld.get("openingHours"),
                    "sections": parsed_secs,
                    "dishes_count": dish_cnt,
                    "dish_photos_count": photo_cnt,
                    "promo_count": 0,
                })
        return stores_out


def verify_image_urls_batch(urls: Set[str], max_workers: int = 16) -> Dict[str, bool]:
    """Verify image reachability in parallel with Vercel-compatible Referer headers."""
    clean_urls = [u for u in urls if u and u.startswith("http")]
    results: Dict[str, bool] = {}
    if not clean_urls:
        return results

    headers = {"User-Agent": DEFAULT_UA, "Referer": "https://foddtech.vercel.app/"}

    def _check(url: str) -> Tuple[str, bool]:
        try:
            with httpx.Client(headers=headers, timeout=10.0, follow_redirects=True) as c:
                r = c.head(url)
                if r.status_code in (403, 405):
                    r = c.get(url, headers={**headers, "Range": "bytes=0-1024"})
                ok = r.status_code in (200, 206) and "image" in (r.headers.get("content-type", "") or "").lower()
                return url, ok
        except Exception:
            return url, False

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futs = [pool.submit(_check, u) for u in clean_urls]
        for f in as_completed(futs):
            u, ok = f.result()
            results[u] = ok
    return results


def probe_image_dimensions_batch(
    urls: Set[str],
    cache_path: Optional[Path] = None,
    max_workers: int = 20,
) -> Dict[str, Tuple[int, int]]:
    """Measure pixel dimensions (width, height) for live images with a persistent JSON cache."""
    import io
    from PIL import Image

    cached: Dict[str, List[int]] = {}
    if cache_path and cache_path.exists():
        try:
            raw = json.loads(cache_path.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                cached = raw
        except Exception:
            cached = {}

    results: Dict[str, Tuple[int, int]] = {}
    pending: List[str] = []
    for u in sorted(urls):
        if not u or not u.startswith("http"):
            continue
        pair = cached.get(u)
        if isinstance(pair, list) and len(pair) == 2 and pair[0] > 0 and pair[1] > 0:
            results[u] = (int(pair[0]), int(pair[1]))
        else:
            pending.append(u)

    if pending:
        headers = {"User-Agent": DEFAULT_UA, "Referer": "https://foddtech.vercel.app/"}

        def _measure(url: str) -> Tuple[str, int, int]:
            try:
                with httpx.Client(headers=headers, timeout=12.0, follow_redirects=True) as c:
                    r = c.get(url)
                    if r.status_code == 200 and r.content:
                        im = Image.open(io.BytesIO(r.content))
                        return url, int(im.size[0]), int(im.size[1])
            except Exception:
                pass
            return url, 0, 0

        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            for u, w, h in pool.map(_measure, pending):
                if w > 0 and h > 0:
                    results[u] = (w, h)
                    cached[u] = [w, h]

        if cache_path:
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(json.dumps(cached, ensure_ascii=False), encoding="utf-8")

    return results


class GoogleMapsEnricher:
    """
    Playwright Google Maps enricher & menu-link discoverer for Caraguatatuba/SP.

    Pulls authentic:
      - Coordinates (!3d...!4d... validated strictly inside Caraguatatuba)
      - Google Maps Rating & Total Reviews
      - Up to 6 real Google Customer Reviews (expanded)
      - Real food/place gallery images (lh3.googleusercontent.com, excluding StreetView panos)
      - Website & Digital Menu links (cardapioweb / anota.ai / aiqfome)
    """

    def discover_digital_menu_links(self, queries: Optional[List[str]] = None) -> Dict[str, Set[str]]:
        """Browse Caraguatatuba food categories on Google Maps to discover extra CardápioWeb / Anota AI / Aiqfome slugs."""
        from playwright.sync_api import sync_playwright

        search_queries = queries or [
            "restaurante Caraguatatuba SP",
            "hamburgueria Caraguatatuba SP",
            "pizzaria Caraguatatuba SP",
            "sushi Caraguatatuba SP",
            "quiosque Caraguatatuba SP",
            "marmitaria Caraguatatuba SP",
        ]
        found: Dict[str, Set[str]] = {"cardapioweb": set(), "anotaai": set(), "aiqfome": set()}

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(
                locale="pt-BR",
                user_agent=DEFAULT_UA,
                viewport={"width": 1280, "height": 900},
            )
            page = ctx.new_page()
            for q in search_queries:
                try:
                    url = f"https://www.google.com/maps/search/{urllib.parse.quote(q)}?hl=pt-BR"
                    page.goto(url, wait_until="domcontentloaded", timeout=25000)
                    page.wait_for_timeout(2800)
                    anchors = page.locator("a.hfpxzc")
                    count = min(14, anchors.count())
                    for i in range(count):
                        try:
                            anchors.nth(i).click(timeout=4000)
                            page.wait_for_timeout(1400)
                            for sel in ('a[data-item-id="authority"]', 'a[data-item-id="menu"]'):
                                el = page.locator(sel).first
                                if el.count() > 0:
                                    href = (el.get_attribute("href") or "").strip()
                                    self._classify_discovered_url(href, found)
                        except Exception:
                            continue
                except Exception:
                    continue
            browser.close()
        return found

    @staticmethod
    def _classify_discovered_url(href: str, bucket: Dict[str, Set[str]]) -> None:
        if not href:
            return
        m_cw = re.search(r"https?://(?:app|estabelecimentos)\.cardapioweb\.com/([a-zA-Z0-9_-]+)", href)
        if m_cw:
            bucket["cardapioweb"].add(m_cw.group(1))
        m_an = re.search(r"https?://pedido\.anota\.ai/loja/([a-zA-Z0-9_-]+)", href)
        if m_an:
            bucket["anotaai"].add(m_an.group(1))
        m_aiq = re.search(r"https?://aiqfome\.com/SP/caraguatatuba/([a-z0-9-]+)", href)
        if m_aiq:
            bucket["aiqfome"].add(m_aiq.group(1))

    @staticmethod
    def _extract_photos(page: Any) -> List[str]:
        raw_imgs = page.eval_on_selector_all("img", "els => els.map(e => e.src)")
        bgs = page.eval_on_selector_all("div.U39Pmb", "els => els.map(e => e.style.backgroundImage || getComputedStyle(e).backgroundImage)")
        photos: List[str] = []
        for raw in raw_imgs + bgs:
            m = re.search(r"https://[^\s\"')]+googleusercontent\.com[^\s\"')]+", str(raw))
            if not m:
                continue
            cu = clean_gmap_photo_url(m.group(0))
            if cu and cu not in photos:
                photos.append(cu)
        return photos[:8]

    @staticmethod
    def _titles_compatible(store_name: str, gmap_title: str, store_address: str = "", gmap_address: str = "") -> bool:
        import unicodedata

        def _ascii(s: str) -> str:
            return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode("ascii").lower()

        def _tokens(txt: str) -> Set[str]:
            norm = re.sub(r"[^a-z0-9 ]", " ", _ascii(txt))
            stops = {
                "de", "da", "do", "dos", "das", "e", "em", "na", "no", "para", "com",
                "caraguatatuba", "caragua", "sp", "restaurante", "bar", "lanchonete",
                "lanches", "lanche", "pizzaria", "pizza", "pizzas", "hamburgueria",
                "burger", "burguer", "delivery", "ifood", "acai", "sorveteria", "sorvetes",
                "pastel", "pasteis", "salgados", "salgado", "confeitaria", "doces",
                "marmita", "marmitaria", "quiosque", "adega", "espeto", "espetinho",
                "food", "casa", "point", "cantinho", "unidade", "sabor", "comidinhas",
                "bebidas", "raiz", "premium", "oficial", "artesanal", "salao",
            }
            return {t for t in norm.split() if len(t) >= 2 and t not in stops}

        s_ascii = _ascii(store_name)
        g_ascii = _ascii(gmap_title)
        t1 = _tokens(store_name)
        t2 = _tokens(gmap_title)

        if not t1:
            # Generic names (e.g. "Sabor de Casa") must match as an exact sub-phrase
            core = re.sub(r"\b(marmitaria|restaurante|lanchonete|pizzaria)\b", "", s_ascii).strip()
            return bool(core and core in g_ascii)

        overlap = t1 & t2
        if not overlap:
            return False

        # Very short 2-char brand overlap (e.g. "xp") requires either extra overlap or compatible street/neighborhood
        if max((len(tok) for tok in overlap), default=0) <= 2 and len(overlap) == 1:
            if store_address and gmap_address:
                addr1 = _tokens(store_address)
                addr2 = _tokens(gmap_address)
                if addr1 and addr2 and not (addr1 & addr2):
                    return False

        return True

    def enrich_stores(self, stores: List[Dict[str, Any]], cache_path: Path) -> Dict[str, Dict[str, Any]]:
        """Match and enrich every store on Google Maps (incremental JSON cache on disk)."""
        from playwright.sync_api import sync_playwright

        cache: Dict[str, Dict[str, Any]] = {}
        if cache_path.exists():
            try:
                cache = json.loads(cache_path.read_text(encoding="utf-8"))
            except Exception:
                cache = {}

        pending = [s for s in stores if s["slug"] not in cache]
        if not pending:
            return cache

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(
                locale="pt-BR",
                user_agent=DEFAULT_UA,
                viewport={"width": 1280, "height": 900},
            )
            page = ctx.new_page()

            for idx, store in enumerate(pending, 1):
                slug = store["slug"]
                q_name = clean_store_query_name(store["name"])
                query = f"{q_name} Caraguatatuba SP"
                record: Dict[str, Any] = {
                    "matched": False,
                    "gmap_title": "",
                    "latitude": store.get("latitude"),
                    "longitude": store.get("longitude"),
                    "rating": None,
                    "total_reviews": 0,
                    "reviews": [],
                    "gallery_photos": [],
                    "website": None,
                }
                try:
                    url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}?hl=pt-BR"
                    page.goto(url, wait_until="domcontentloaded", timeout=22000)
                    page.wait_for_timeout(2400)

                    place_href = ""
                    if "/maps/place/" not in page.url:
                        anchors = page.locator("a.hfpxzc")
                        cnt = min(6, anchors.count())
                        chosen_idx = None
                        for ai in range(cnt):
                            cand = anchors.nth(ai)
                            lbl = (cand.get_attribute("aria-label") or "").strip()
                            if self._titles_compatible(q_name, lbl, store.get("address", ""), ""):
                                chosen_idx = ai
                                break
                        if chosen_idx is not None:
                            target_a = anchors.nth(chosen_idx)
                            place_href = target_a.get_attribute("href") or ""
                            target_a.click(timeout=5000)
                            page.wait_for_timeout(2200)

                    lat, lng = parse_gmap_coords_from_url(page.url)
                    if (lat is None or lng is None) and place_href:
                        lat, lng = parse_gmap_coords_from_url(place_href)

                    title = page.locator("h1.DUwDvf").first.inner_text().strip() if page.locator("h1.DUwDvf").count() > 0 else ""
                    gmap_addr = ""
                    addr_btn = page.locator('button[data-item-id="address"]').first
                    if addr_btn.count() > 0:
                        gmap_addr = (addr_btn.get_attribute("aria-label") or addr_btn.inner_text() or "").strip()

                    # Verify it matches this Caraguatatuba store
                    coords_ok = is_valid_caragua_coords(lat, lng) if (lat is not None and lng is not None) else True
                    if title and coords_ok and self._titles_compatible(q_name, title, store.get("address", ""), gmap_addr):
                        record["matched"] = True
                        record["gmap_title"] = title
                        if is_valid_caragua_coords(lat, lng):
                            record["latitude"] = lat
                            record["longitude"] = lng

                        # Rating & count
                        r_el = page.locator('div.F7nice span[aria-hidden="true"]').first
                        if r_el.count() > 0:
                            try:
                                record["rating"] = float(r_el.inner_text().replace(",", ".").strip())
                            except Exception:
                                pass
                        c_el = page.locator('div.F7nice span[aria-label*="avalia"]').first
                        if c_el.count() > 0:
                            lbl = (c_el.get_attribute("aria-label") or "").replace(".", "").replace(",", "")
                            nums = re.findall(r"\d+", lbl)
                            if nums:
                                record["total_reviews"] = int(nums[0])

                        # Website / Menu URL
                        for sel in ('a[data-item-id="authority"]', 'a[data-item-id="menu"]'):
                            el = page.locator(sel).first
                            if el.count() > 0:
                                record["website"] = (el.get_attribute("href") or "").strip() or None
                                break

                        # Photos (Overview + Fotos click if needed)
                        photos = self._extract_photos(page)
                        if len(photos) < 3:
                            try:
                                foto_btn = page.locator('button[aria-label*="Foto"]').first
                                if foto_btn.count() > 0:
                                    foto_btn.click(timeout=3000)
                                    page.wait_for_timeout(1500)
                                    for gp in self._extract_photos(page):
                                        if gp not in photos:
                                            photos.append(gp)
                                    back_btn = page.locator('button[aria-label*="Voltar"], button.hYBOP').first
                                    if back_btn.count() > 0:
                                        back_btn.click(timeout=2000)
                                        page.wait_for_timeout(800)
                            except Exception:
                                pass
                        record["gallery_photos"] = photos[:8]

                        # Reviews tab -> real Google customer reviews
                        try:
                            tabs = page.locator('button[role="tab"]')
                            for t_i in range(tabs.count()):
                                if "Avalia" in (tabs.nth(t_i).inner_text() or ""):
                                    tabs.nth(t_i).click(timeout=3000)
                                    page.wait_for_timeout(1600)
                                    break
                            cards = page.locator("div.jftiEf")
                            revs = []
                            for r_i in range(min(6, cards.count())):
                                card = cards.nth(r_i)
                                try:
                                    more = card.locator("button.w8nwRe").first
                                    if more.count() > 0:
                                        more.click(timeout=800)
                                except Exception:
                                    pass
                                author = card.locator(".d4r55").first.inner_text().strip() if card.locator(".d4r55").count() > 0 else "Cliente Google Maps"
                                text = card.locator(".wiI7pd").first.inner_text().strip() if card.locator(".wiI7pd").count() > 0 else ""
                                date_s = card.locator(".rsqaWe").first.inner_text().strip() if card.locator(".rsqaWe").count() > 0 else ""
                                star_lbl = card.locator(".kvMYJc").first.get_attribute("aria-label") if card.locator(".kvMYJc").count() > 0 else "5 estrelas"
                                st = re.findall(r"\d+", str(star_lbl))
                                stars = float(st[0]) if st else 5.0
                                if text:
                                    revs.append({"author": author, "rating": stars, "comment": text, "date": date_s})
                            record["reviews"] = revs
                        except Exception:
                            pass
                except Exception:
                    pass

                cache[slug] = record
                print(
                    f"  [GMAPS {idx}/{len(pending)}] {store['name'][:32]} -> "
                    f"match={record['matched']} | rating={record['rating']} ({record['total_reviews']}) | "
                    f"revs={len(record['reviews'])} | photos={len(record['gallery_photos'])}"
                )
                if idx % 5 == 0 or idx == len(pending):
                    cache_path.parent.mkdir(parents=True, exist_ok=True)
                    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

            browser.close()
        return cache
