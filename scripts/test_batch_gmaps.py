import urllib.parse
import json
import time
from playwright.sync_api import sync_playwright

SAMPLE_PLACES = [
    "Rock Bar Caraguá",
    "Quiosque Canto Bravo",
    "Dom Quixote",
    "Bar do Japonês",
    "Mar & Brasa"
]

def scrape_gmaps_batch():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="pt-BR"
        )
        page = context.new_page()

        for name in SAMPLE_PLACES:
            query = f"{name} Caraguatatuba"
            url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}"
            print(f"Scraping: {name}...")
            try:
                page.goto(url, timeout=25000)
                page.wait_for_timeout(3500)

                # Rating
                rating_el = page.query_selector('div.F7nice span[aria-hidden="true"]')
                rating_str = rating_el.inner_text().strip().replace(",", ".") if rating_el else None
                rating = float(rating_str) if rating_str else None

                # Reviews count
                rev_count_el = page.query_selector('div.F7nice span[aria-label*="avalia"]')
                rev_count_str = rev_count_el.inner_text().strip().replace("(", "").replace(")", "").replace(".", "").replace(",", "") if rev_count_el else None
                rev_count = int(rev_count_str) if rev_count_str and rev_count_str.isdigit() else None

                # Address
                addr_el = page.query_selector('button[data-item-id="address"]')
                addr = addr_el.inner_text().replace("\n", " ").strip() if addr_el else None
                if addr:
                    addr = "".join(c for c in addr if ord(c) < 10000).strip()

                # Phone
                phone_el = page.query_selector('button[data-item-id*="phone"]')
                phone = phone_el.inner_text().replace("\n", " ").strip() if phone_el else None
                if phone:
                    phone = "".join(c for c in phone if ord(c) < 10000).strip()

                # Website
                site_el = page.query_selector('a[data-item-id="authority"]')
                site = site_el.get_attribute("href") if site_el else None

                # Real Google Reviews
                reviews = []
                reviews_tab = page.query_selector('button[role="tab"][aria-label*="Avalia"]')
                if reviews_tab:
                    reviews_tab.click()
                    page.wait_for_timeout(2500)
                    cards = page.query_selector_all('div.jftiEf')
                    for rc in cards[:6]:
                        author_el = rc.query_selector('div.d4r55')
                        author = author_el.inner_text().strip() if author_el else "Cliente Google"
                        clean_author = "".join(c for c in author if ord(c) < 10000).strip()

                        stars_el = rc.query_selector('span.kvMYJc')
                        stars_label = stars_el.get_attribute("aria-label") if stars_el else "5"
                        # Extrai número de estrelas
                        stars = 5.0
                        if "1" in stars_label: stars = 1.0
                        elif "2" in stars_label: stars = 2.0
                        elif "3" in stars_label: stars = 3.0
                        elif "4" in stars_label: stars = 4.0
                        elif "5" in stars_label: stars = 5.0

                        text_el = rc.query_selector('span.wiI7pd')
                        text = text_el.inner_text().strip().replace("\n", " ") if text_el else ""
                        clean_text = "".join(c for c in text if ord(c) < 10000).strip()

                        date_el = rc.query_selector('span.rsqaWe')
                        date_str = date_el.inner_text().strip() if date_el else "Recentemente"

                        if clean_text:
                            reviews.append({
                                "author": clean_author,
                                "rating": stars,
                                "comment": clean_text,
                                "date": date_str,
                                "source": "Google Maps",
                                "verified": True
                            })

                results[name] = {
                    "name": name,
                    "google_rating": rating,
                    "google_review_count": rev_count,
                    "address": addr,
                    "phone": phone,
                    "website": site,
                    "google_reviews": reviews
                }
                print(f"   -> OK: Rating {rating} ({rev_count} reviews), {len(reviews)} review texts extracted.")
            except Exception as e:
                print(f"   -> Erro em {name}: {e}")

        browser.close()

    with open("scripts/gmaps_sample_output.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Salvo em scripts/gmaps_sample_output.json")

if __name__ == "__main__":
    scrape_gmaps_batch()
