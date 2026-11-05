"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — INTERCEPTADOR ASSÍNCRONO DE REDE (PLAYWRIGHT XHR)
==============================================================================
Implementa:
1. Rotação dinâmica de User-Agent e Viewport realista.
2. Rolagem humanizada com Jitter Gaussiano (`human_scroll`) para paginação XHR.
3. Backoff Exponencial com Jitter (T_wait = min(60, 2^attempt + random(0, 1)), máx 3 tentativas,
   timeout estrito de 15s por tentativa) contra quedas de rede, HTTP 403/429 e desafios Cloudflare.
4. Sanitização LGPD em trânsito antes de persistir qualquer arquivo temporário em `backend/data/raw/`.
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from playwright.async_api import Browser, BrowserContext, Page, Response, Route, async_playwright

from app.workers.sanitizer_lgpd import LGPDSanitizer

logger = logging.getLogger("scraper_playwright")
logger.setLevel(logging.INFO)

RAW_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

SNAPSHOTS_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "snapshots"
SNAPSHOTS_DATA_DIR.mkdir(parents=True, exist_ok=True)

ROTATING_USER_AGENTS: List[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
]

CLOUDFLARE_SIGNATURES = (
    "attention required! | cloudflare",
    "cf-browser-verification",
    "just a moment...",
    "challenge-platform",
    "cf-chl-bypass",
)

XHR_TARGET_KEYWORDS = (
    "graphql",
    "catalog",
    "merchant",
    "restaurant",
    "menu",
    "products",
    "categories",
    "place",
    "reviews",
    "search",
    "store",
    "sections",
)

BLOCKED_RESOURCE_TYPES = {"image", "media", "font"}


class ScraperConnectivityBlockedError(RuntimeError):
    """Disparada após esgotamento das 3 tentativas de Backoff Exponencial (403/429/Timeout/WAF)."""


class PlaywrightNetworkScraper:
    """
    Scraper assíncrono baseado em Playwright com interceptação passiva de tráfego XHR/Fetch.
    """

    def __init__(
        self,
        headless: bool = True,
        navigation_timeout_ms: int = 15000,
        max_attempts: int = 3,
    ) -> None:
        self.headless = headless
        self.navigation_timeout_ms = navigation_timeout_ms
        self.max_attempts = max_attempts
        self.captured_payloads: List[Dict[str, Any]] = []

    @staticmethod
    def compute_backoff_seconds(attempt: int) -> float:
        """
        Lifecycle Rule 1:
        T_wait = min(60, 2^attempt + random(0, 1))
        """
        return min(60.0, float(2 ** attempt) + random.uniform(0.0, 1.0))

    async def _abort_heavy_assets(self, route: Route) -> None:
        """Bloqueia download de fontes/vídeos pesados para preservar banda e RAM (< 128MB)."""
        if route.request.resource_type in BLOCKED_RESOURCE_TYPES:
            await route.abort()
        else:
            await route.continue_()

    async def _handle_response(self, response: Response) -> None:
        """Intercepta respostas HTTP JSON relevantes contendo catálogos, cardápios ou reviews."""
        try:
            content_type = (response.headers.get("content-type") or "").lower()
            url_lower = response.url.lower()

            if "json" in content_type and any(kw in url_lower for kw in XHR_TARGET_KEYWORDS):
                raw_json = await response.json()
                sanitized_json = LGPDSanitizer.sanitize_raw_payload(raw_json)
                self.captured_payloads.append(
                    {
                        "url": response.url,
                        "status": response.status,
                        "captured_at": int(time.time()),
                        "data": sanitized_json,
                    }
                )
                logger.info(
                    f"[XHR Intercepted] Status={response.status} | URL={response.url[:90]}"
                )
        except Exception:
            # Streams abortados ou respostas vazias não interrompem o listener
            return

    @staticmethod
    async def human_scroll(page: Page, base_wait: float = 2.0, steps: int = 3) -> None:
        """
        Executa rolagem progressiva com jitter gaussiano espacial e temporal
        para acionar lazy-loading de categorias e avaliações.
        """
        for _ in range(steps):
            delta_y = max(450, int(random.gauss(1150, 260)))
            jitter_sleep = max(0.45, random.gauss(base_wait, 0.40))
            await page.mouse.wheel(0, delta_y)
            await asyncio.sleep(jitter_sleep)

    async def scrape_target_url(
        self,
        target_url: str,
        zone_tag: str = "caragua",
        wait_seconds: float = 2.0,
    ) -> List[Dict[str, Any]]:
        """
        Navega até `target_url` com rotação de User-Agent, timeout de 15s e até 3 tentativas
        com Backoff Exponencial + Jitter. Persiste os payloads sanitizados em `backend/data/raw/`.
        """
        safe_zone = re.sub(r"[^a-z0-9_-]", "-", zone_tag.lower()).strip("-") or "caragua"
        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_attempts + 1):
            self.captured_payloads = []
            selected_ua = random.choice(ROTATING_USER_AGENTS)
            browser: Optional[Browser] = None
            context: Optional[BrowserContext] = None

            try:
                logger.info(
                    f"[Playwright] Tentativa {attempt}/{self.max_attempts} | Zona='{safe_zone}' | Alvo={target_url}"
                )
                async with async_playwright() as p:
                    browser = await p.chromium.launch(
                        headless=self.headless,
                        args=[
                            "--no-sandbox",
                            "--disable-setuid-sandbox",
                            "--disable-dev-shm-usage",
                            "--disable-blink-features=AutomationControlled",
                        ],
                    )
                    context = await browser.new_context(
                        user_agent=selected_ua,
                        viewport={"width": 1440, "height": 900},
                        locale="pt-BR",
                        timezone_id="America/Sao_Paulo",
                    )
                    page: Page = await context.new_page()
                    await page.route("**/*", self._abort_heavy_assets)
                    page.on("response", self._handle_response)

                    nav_response = await page.goto(
                        target_url,
                        wait_until="domcontentloaded",
                        timeout=self.navigation_timeout_ms,
                    )

                    status_code = nav_response.status if nav_response else 0
                    if status_code in (403, 429, 503):
                        raise ScraperConnectivityBlockedError(
                            f"Bloqueio HTTP {status_code} detectado em {target_url}"
                        )

                    title_and_snippet = ((await page.title()) + " " + (await page.content())[:2048]).lower()
                    if any(sig in title_and_snippet for sig in CLOUDFLARE_SIGNATURES):
                        raise ScraperConnectivityBlockedError(
                            f"Desafio WAF/Cloudflare detectado em {target_url}"
                        )

                    await self.human_scroll(page, base_wait=wait_seconds, steps=3)

                if self.captured_payloads:
                    dump_file = RAW_DATA_DIR / f"payload_{safe_zone}_{int(time.time() * 1000)}.json"
                    with open(dump_file, "w", encoding="utf-8") as fh:
                        json.dump(self.captured_payloads, fh, ensure_ascii=False, indent=2)
                    logger.info(
                        f"[Playwright] Sucesso na zona '{safe_zone}': {len(self.captured_payloads)} "
                        f"payloads XHR gravados em {dump_file.name}"
                    )
                return self.captured_payloads

            except Exception as exc:
                last_error = exc
                logger.warning(
                    f"[Playwright] Falha na tentativa {attempt}/{self.max_attempts} "
                    f"(Zona='{safe_zone}'): {exc}"
                )
                if attempt < self.max_attempts:
                    wait_backoff = self.compute_backoff_seconds(attempt)
                    logger.info(f"[Playwright] Aplicando Backoff Exponencial: aguardando {wait_backoff:.2f}s...")
                    await asyncio.sleep(wait_backoff)
            finally:
                if context is not None:
                    try:
                        await context.close()
                    except Exception:
                        pass
                if browser is not None:
                    try:
                        await browser.close()
                    except Exception:
                        pass

        raise ScraperConnectivityBlockedError(
            f"Esgotadas {self.max_attempts} tentativas para '{target_url}' (zona='{safe_zone}'): {last_error}"
        )

    async def scrape_target(self, target_url: str, wait_seconds: float = 2.0) -> List[Dict[str, Any]]:
        """Alias compatível com chamadas legadas."""
        return await self.scrape_target_url(
            target_url=target_url,
            zone_tag="caragua",
            wait_seconds=wait_seconds,
        )
