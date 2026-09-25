import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from playwright.async_api import async_playwright, Response, Page
from app.core.config import settings

logger = logging.getLogger("scraper_playwright")
logger.setLevel(logging.INFO)

RAW_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class PlaywrightNetworkScraper:
    """
    Scraper assíncrono baseado em Playwright com interceptação de rede.
    Decisão arquitetural fundamentada:
    Em vez de realizar parsing pesado e frágil de HTML DOM com BeautifulSoup
    em SPAs (React/Angular), interceptamos as respostas HTTP/XHR/JSON brutas
    que trafegam na camada de rede.
    """
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.captured_payloads: List[Dict[str, Any]] = []

    async def _handle_response(self, response: Response) -> None:
        """Listener que avalia todas as respostas de rede do browser."""
        try:
            content_type = response.headers.get("content-type", "")
            url = response.url

            # Filtra estritamente pacotes JSON que contenham dados de estabelecimentos/cardápios
            if "application/json" in content_type:
                # Alvos comuns de SPAs gastronômicas
                if any(keyword in url for keyword in ["graphql", "restaurant", "menu", "place", "reviews", "search"]):
                    data = await response.json()
                    self.captured_payloads.append({
                        "url": url,
                        "status": response.status,
                        "data": data
                    })
                    logger.info(f"[XHR Intercepted] URL: {url[:80]}... | Itens: {len(data) if isinstance(data, list) else 'Dict'}")
        except Exception as e:
            # Respostas que não são JSON válido ou com stream quebrado são ignoradas silenciosamente
            pass

    async def scrape_target(self, target_url: str, wait_seconds: float = 3.0) -> List[Dict[str, Any]]:
        """
        Navega até o alvo geográfico/restaurante em Caraguatatuba e captura o tráfego XHR.
        """
        self.captured_payloads = []
        logger.info(f"Iniciando raspagem de rede para: {target_url}")

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.headless,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled"
                ]
            )
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="pt-BR"
            )
            page: Page = await context.new_page()

            # Acopla a escuta de rede antes de iniciar qualquer navegação
            page.on("response", self._handle_response)

            try:
                await page.goto(target_url, wait_until="networkidle", timeout=45000)
                # Simula rolagem humanizada para disparar paginações assíncronas (Infinite Scroll)
                for _ in range(3):
                    await page.mouse.wheel(0, 1500)
                    await asyncio.sleep(wait_seconds)

            except Exception as e:
                logger.error(f"Erro durante a navegação Playwright: {e}")
            finally:
                await context.close()
                await browser.close()

        # Salva o dump bruto no disco para conformidade e reprocessamento
        dump_file = RAW_DATA_DIR / f"payload_{int(asyncio.get_event_loop().time())}.json"
        with open(dump_file, "w", encoding="utf-8") as f:
            json.dump(self.captured_payloads, f, ensure_ascii=False, indent=2)

        logger.info(f"Raspagem concluída. {len(self.captured_payloads)} payloads capturados e salvos em {dump_file.name}")
        return self.captured_payloads
