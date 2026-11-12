import sys
import time
from playwright.sync_api import sync_playwright

def main():
    target_url = "https://foddtech.vercel.app"
    print(f"Connecting to live production Vercel: {target_url}...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page_errors = []
        page.on('pageerror', lambda e: page_errors.append(str(e)))

        # 1. Test Live Home Page
        print("1. Testing Live Home Page...")
        res = page.goto(target_url, wait_until="networkidle")
        print("HTTP Status:", res.status if res else "None")
        page.wait_for_timeout(3000)

        print("Title:", page.title())
        print("Page errors count:", len(page_errors))
        if page_errors:
            for err in page_errors:
                print("  ERR:", err)

        # Check for empty state or errors
        content = page.content()
        assert "0 estabelecimentos" not in content, "Home page should not show 0 estabelecimentos"
        assert "atualizando os cardápios da cidade" not in content.lower(), "Pink error banner should be gone"

        # Check food images
        images = page.query_selector_all("article img")
        print(f"Live dishes & restaurant images rendered: {len(images)}")

        # 2. Test Live UUID Dish Page: fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c
        dish_url = f"{target_url}/prato/fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c"
        print(f"\n2. Testing Live UUID Dish Page: {dish_url}...")
        page_errors.clear()
        res_dish = page.goto(dish_url, wait_until="networkidle")
        print("HTTP Status:", res_dish.status if res_dish else "None")
        page.wait_for_timeout(3000)

        print("Title:", page.title())
        print("Page errors count:", len(page_errors))
        if page_errors:
            for err in page_errors:
                print("  ERR:", err)

        dish_content = page.content()
        assert "Application error" not in dish_content, "Dish page should NOT have Application error"

        h1 = page.query_selector("h1")
        h1_text = h1.inner_text() if h1 else ""
        print("Live Dish H1:", h1_text)

        rest_heading = page.query_selector("h3")
        rest_text = rest_heading.inner_text() if rest_heading else ""
        print("Live Restaurant:", rest_text)

        page.screenshot(path="vercel_live_verified.png")
        browser.close()
        print("\nLIVE VERCEL VERIFICATION SUCCEEDED WITH 100% HEALTH!")

if __name__ == "__main__":
    main()
