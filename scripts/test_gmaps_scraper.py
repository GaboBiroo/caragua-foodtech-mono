import urllib.parse
import sys
from playwright.sync_api import sync_playwright

def test_scrape_gmaps(place_name: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="pt-BR"
        )
        page = context.new_page()
        query = f"{place_name} Caraguatatuba"
        url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}"
        sys.stdout.write(f"Navigating to: {url}\n")
        sys.stdout.flush()
        page.goto(url, timeout=30000)
        page.wait_for_timeout(4000)

        # Print page title
        sys.stdout.write(f"Title: {page.title()}\n")

        # Check rating
        rating_el = page.query_selector('div.F7nice span[aria-hidden="true"]')
        rating = rating_el.inner_text() if rating_el else None
        
        # Check review count
        review_count_el = page.query_selector('div.F7nice span[aria-label*="avalia"]')
        review_count = review_count_el.inner_text() if review_count_el else None

        # Check address
        addr_el = page.query_selector('button[data-item-id="address"]')
        addr = addr_el.inner_text().replace("\n", " ") if addr_el else None
        # Clean non-ascii icons
        if addr:
            addr = "".join(c for c in addr if ord(c) < 10000)

        # Check website / menu link
        site_el = page.query_selector('a[data-item-id="authority"]')
        site = site_el.get_attribute("href") if site_el else None

        # Check menu link specifically (often data-item-id="menu" or contains "cardapio" or "menu")
        menu_el = page.query_selector('a[data-item-id="menu"], a[aria-label*="cardápio" i], a[aria-label*="menu" i]')
        menu_link = menu_el.get_attribute("href") if menu_el else None

        sys.stdout.write(f"Rating: {rating}\n")
        sys.stdout.write(f"Reviews: {review_count}\n")
        sys.stdout.write(f"Address: {addr}\n")
        sys.stdout.write(f"Website: {site}\n")
        sys.stdout.write(f"Menu Link: {menu_link}\n")
        sys.stdout.flush()

        # Check reviews tab button or click on reviews
        reviews_tab = page.query_selector('button[role="tab"][aria-label*="Avalia"]')
        if reviews_tab:
            sys.stdout.write("Found reviews tab! Clicking...\n")
            reviews_tab.click()
            page.wait_for_timeout(3000)

            # Scrape review cards
            review_cards = page.query_selector_all('div.jftiEf')
            sys.stdout.write(f"Found {len(review_cards)} review cards!\n")
            for idx, rc in enumerate(review_cards[:4]):
                author_el = rc.query_selector('div.d4r55')
                author = author_el.inner_text() if author_el else "Anônimo"
                stars_el = rc.query_selector('span.kvMYJc')
                stars = stars_el.get_attribute("aria-label") if stars_el else "5"
                text_el = rc.query_selector('span.wiI7pd')
                text = text_el.inner_text() if text_el else ""
                clean_text = "".join(c for c in text if ord(c) < 10000).replace("\n", " ")
                clean_author = "".join(c for c in author if ord(c) < 10000)
                sys.stdout.write(f"  [Real Google Review {idx+1}] {clean_author} ({stars}): {clean_text}\n")
            sys.stdout.flush()

        browser.close()

if __name__ == "__main__":
    test_scrape_gmaps("Rock Bar Caraguá")
    sys.stdout.write("-" * 50 + "\n")
    test_scrape_gmaps("Quiosque Canto Bravo")
