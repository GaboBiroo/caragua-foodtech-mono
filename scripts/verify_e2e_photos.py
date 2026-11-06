import sys
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page_errors = []
        page.on('pageerror', lambda e: page_errors.append(str(e)))

        print("1. Testing Home Page...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        page.wait_for_timeout(2000)
        print("Title:", page.title())
        print("Page errors count:", len(page_errors))
        if page_errors:
            for err in page_errors:
                print("  ERR:", err)
            sys.exit(1)

        images = page.query_selector_all("article img")
        print(f"Feed dishes & restaurant images rendered: {len(images)}")
        assert len(images) > 10, "Expected at least 10 images on feed"

        # Find buttons with text Checar Cardápio
        buttons = page.query_selector_all("button")
        cardapio_btn = None
        for b in buttons:
            if "Checar Cardápio" in b.inner_text():
                cardapio_btn = b
                break

        print("Checar Cardapio button found:", cardapio_btn is not None)
        if cardapio_btn:
            cardapio_btn.click()
            page.wait_for_timeout(1000)
            modal = page.query_selector("[role='dialog']")
            print("Quick Menu Modal opened:", modal is not None)
            assert modal is not None, "Modal should open on Checar Cardapio click"
            page.screenshot(path="test_home_modal.png")
            close_btn = page.query_selector("button[aria-label='Fechar prévia do cardápio']")
            if close_btn:
                close_btn.click()
                page.wait_for_timeout(500)

        page.screenshot(path="test_home_feed.png")

        print("\n2. Testing UUID Dish Page fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c...")
        page_errors.clear()
        page.goto("http://localhost:3000/prato/fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c", wait_until="networkidle")
        page.wait_for_timeout(2000)
        print("Title:", page.title())
        print("Page errors count:", len(page_errors))
        if page_errors:
            for err in page_errors:
                print("  ERR:", err)
            sys.exit(1)

        h1 = page.query_selector("h1")
        h1_text = h1.inner_text() if h1 else ""
        print("Dish H1:", h1_text)
        assert "Smash Burger" in h1_text, f"Expected Smash Burger, got {h1_text}"

        rest_heading = page.query_selector("h3")
        rest_text = rest_heading.inner_text() if rest_heading else ""
        print("Restaurant:", rest_text)
        assert "Rock Bar" in rest_text, f"Expected Rock Bar, got {rest_text}"

        cardapio_link = page.query_selector("a:has-text('Checar Cardápio Completo')")
        print("Link to check complete restaurant menu present:", cardapio_link is not None)
        assert cardapio_link is not None, "Expected button to check full menu"

        page.screenshot(path="test_prato_uuid.png")

        browser.close()
        print("\nALL PLAYWRIGHT TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    main()
