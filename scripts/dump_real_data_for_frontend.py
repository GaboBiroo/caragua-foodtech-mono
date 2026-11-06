import asyncio
import json
import httpx
from pathlib import Path

async def dump_data():
    base_url = "http://127.0.0.1:8000/api/v1"
    async with httpx.AsyncClient(base_url=base_url, timeout=45.0) as client:
        # 1. Restaurants catalog
        res_r = await client.get("/restaurants?limit=100")
        restaurants = res_r.json()
        print(f"Fetched {len(restaurants)} active restaurants")

        # 2. Neighborhoods summary
        res_n = await client.get("/restaurants/neighborhoods/summary")
        neighborhoods_summary = res_n.json()
        print(f"Fetched neighborhoods summary: {len(neighborhoods_summary.get('neighborhoods', []))} neighborhoods")

        # 3. Details for all restaurants
        restaurant_details = {}
        for r in restaurants:
            slug = r.get("slug")
            if slug:
                try:
                    res_d = await client.get(f"/restaurants/{slug}")
                    if res_d.status_code == 200:
                        restaurant_details[slug] = res_d.json()
                except Exception as e:
                    print(f"Error fetching restaurant {slug}: {e}")
        print(f"Fetched details for {len(restaurant_details)} restaurants")

        # 4. Details for all dishes
        dish_details = {}
        seen_dishes = set()
        for r in restaurants:
            for dish in (r.get("dishes_preview") or []) + (r.get("dishes") or []):
                dish_id = str(dish.get("id"))
                if dish_id and dish_id not in seen_dishes:
                    seen_dishes.add(dish_id)
                    try:
                        res_dish = await client.get(f"/restaurants/dishes/{dish_id}")
                        if res_dish.status_code == 200:
                            dish_details[dish_id] = res_dish.json()
                    except Exception as e:
                        print(f"Error fetching dish {dish_id}: {e}")
        print(f"Fetched details for {len(dish_details)} dishes")

        full_dump = {
            "restaurants": restaurants,
            "neighborhoods_summary": neighborhoods_summary,
            "restaurant_details": restaurant_details,
            "dish_details": dish_details
        }

        output_path = Path(__file__).resolve().parent.parent / "src" / "data" / "caraguaRealDump.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(full_dump, f, ensure_ascii=False, indent=2)

        print(f"Dump saved successfully to {output_path} ({output_path.stat().st_size} bytes)!")

if __name__ == "__main__":
    asyncio.run(dump_data())
