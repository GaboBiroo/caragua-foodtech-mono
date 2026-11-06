import json
import re

# Curated high-resolution photography for real food categories
PHOTO_MAP = {
    # Peixes e Frutos do Mar Caiçaras
    "badejo": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1000&q=85",
    "pescada": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85",
    "moqueca": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1000&q=85",
    "camarao": "https://images.unsplash.com/photo-1559737558-245ff23115e6?auto=format&fit=crop&w=1000&q=85",
    "camarão": "https://images.unsplash.com/photo-1559737558-245ff23115e6?auto=format&fit=crop&w=1000&q=85",
    "lula": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "polvo": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "siri": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=85",
    "casquinha": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=1000&q=85",
    "ostra": "https://images.unsplash.com/photo-1559737558-245ff23115e6?auto=format&fit=crop&w=1000&q=85",
    "tainha": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1000&q=85",
    "frutos do mar": "https://images.unsplash.com/photo-1559737558-245ff23115e6?auto=format&fit=crop&w=1000&q=85",
    "peixe": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=85",

    # Burgers & Sanduíches
    "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
    "smash": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1000&q=85",
    "hamburguer": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
    "lanche": "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=1000&q=85",

    # Porções & Fritas
    "batata": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1000&q=85",
    "frango": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=85",
    "mandioca": "https://images.unsplash.com/photo-1625937329931-411335025f0e?auto=format&fit=crop&w=1000&q=85",
    "pastel": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
    "porcao": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1000&q=85",
    "porção": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1000&q=85",

    # Carnes & Brasa
    "parmegiana": "https://images.unsplash.com/photo-1625937329931-411335025f0e?auto=format&fit=crop&w=1000&q=85",
    "bife": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1000&q=85",
    "contrafilé": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "picanha": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "carne": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "churrasco": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "costela": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    "picadinho": "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1000&q=85",

    # Culinária Caseira / Almoço Comercial
    "comercial": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
    "executivo": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
    "arroz": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
    "caseiro": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",

    # Pizza & Massas
    "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85",
    "massa": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1000&q=85",
    "risoto": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1000&q=85",

    # Japonesa & Oriental
    "sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85",
    "temaki": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85",
    "sashimi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85",
    "hot roll": "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1000&q=85",
    "yakisoba": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
    "oriental": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=85",
    "chines": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
    "chinês": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",

    # Árabe
    "esfiha": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=85",
    "kafta": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=85",
    "falafel": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=85",
    "arabe": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=85",
    "árabe": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1000&q=85",

    # Saudável / Vegano
    "vegano": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",
    "salada": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",
    "bowl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",
    "poke": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",

    # Açaí, Sobremesas, Café
    "açai": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1000&q=85",
    "açaí": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1000&q=85",
    "sorvete": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=85",
    "café": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85",
    "cafe": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85",
    "bolo": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
    "doce": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
    "tapioca": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",

    # Bebidas & Chopp
    "chopp": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1000&q=85",
    "cerveja": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1000&q=85",
    "suco": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=85",
    "bebida": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=85",
}

DEFAULT_DISH_PHOTO = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85"

def get_dish_photo(name: str, category: str) -> str:
    combined = f"{name} {category}".lower()
    for key, url in PHOTO_MAP.items():
        if key in combined:
            return url
    return DEFAULT_DISH_PHOTO

def get_restaurant_banner(name: str, cuisines: list, neighborhood: str) -> str:
    combined = f"{name} {' '.join(cuisines or [])} {neighborhood}".lower()
    if any(k in combined for k in ["quiosque", "praia", "canto bravo", "mar bravo", "martim", "cocanha", "mar"]):
        return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    if any(k in combined for k in ["rock", "bar", "pub", "chopp", "cervejaria"]):
        return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"
    if any(k in combined for k in ["japones", "japonês", "sushi", "oriental", "shu yan", "chines", "chinês"]):
        return "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1200&q=80"
    if any(k in combined for k in ["pizza", "pizzaria", "forno"]):
        return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
    if any(k in combined for k in ["padaria", "cafe", "café", "confeitaria", "pão"]):
        return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
    if any(k in combined for k in ["churrasco", "brasa", "costela", "parrilla"]):
        return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"

def process_file(path: str):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Atualiza restaurantes
    for rest in data.get("restaurants", []):
        banner = get_restaurant_banner(rest.get("name", ""), rest.get("cuisine_types", []), rest.get("neighborhood", ""))
        rest["banner_url"] = banner
        rest["image_url"] = banner
        rest["cover_image"] = banner

        for d in rest.get("dishes_preview", []):
            photo = get_dish_photo(d.get("name", ""), d.get("category", ""))
            d["image_url"] = photo

    # 2. Atualiza dish_details
    dish_details = data.get("dish_details", {})
    for key, item in dish_details.items():
        if "dish" in item:
            photo = get_dish_photo(item["dish"].get("name", ""), item["dish"].get("category", ""))
            item["dish"]["image_url"] = photo
        if "restaurant" in item:
            r = item["restaurant"]
            b = get_restaurant_banner(r.get("name", ""), r.get("cuisine_types", []), r.get("neighborhood", ""))
            r["banner_url"] = b
            r["image_url"] = b

    # 3. Adiciona explicitamente o ID UUID "fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c"
    rock_bar_dish = {
        "dish": {
            "id": "fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c",
            "restaurant_id": "29584650-11ee-4adf-9371-9b063e06ec94",
            "name": "Smash Burger Duplo Costela na Chapa + Batata Crocante",
            "description": "Dois discos prensados de costela bovina de 90g com crostinha caramelizada na chapa, queijo cheddar derretido, cebola na chapa e maionese verde artesanal. Acompanha batata frita sequinha.",
            "price": 35.40,
            "category": "Lanches na Brasa",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
            "is_vegan": False,
            "is_vegetarian": False,
            "is_gluten_free": False,
            "is_lactose_free": False,
            "last_price_delta_pct": -8.5,
            "price_history": [
                {"recorded_at": "2026-11-06T00:00:00Z", "price": 35.40, "delta_percentage": -8.5}
            ],
            "smart_defaults": ["Maionese Verde Artesanal", "Batata Frita Palito"]
        },
        "restaurant": {
            "id": "29584650-11ee-4adf-9371-9b063e06ec94",
            "name": "Rock Bar Caraguá",
            "slug": "rock-bar-caragua-centro",
            "address": "Rua Altino Arantes, 120",
            "neighborhood": "Centro",
            "phone": "(12) 3883-2000",
            "website": None,
            "opening_hours": "Terça a Domingo • 18h00 às 02h00",
            "latitude": -23.6215,
            "longitude": -45.4110,
            "rating_average": 4.5,
            "total_reviews": 470,
            "cuisine_types": ["Pub & Petiscos", "Hambúrguer Artesanal", "Música ao Vivo"],
            "is_real_osm": True,
            "banner_url": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80"
        },
        "super_nota": {
            "super_score": 4.5,
            "google_score": 4.5,
            "google_weight_pct": 100,
            "tripadvisor_score": 4.5,
            "tripadvisor_weight_pct": 0,
            "curatorship_score": 4.5,
            "curatorship_weight_pct": 0
        },
        "reviews": [
            {
                "id": "gmap-rock-1",
                "author_label": "Dorival Rocha (Google Maps)",
                "comment_text": "Lugar excelente para curtir um rock e tomar uma cerveja gelada com hambúrguer artesanal muito bem feito.",
                "original_rating": 5.0,
                "review_date": "2 semanas atrás"
            },
            {
                "id": "gmap-rock-2",
                "author_label": "Robson Lima (Google Maps)",
                "comment_text": "Ambiente show de bola, chopp bem tirado e lanches saborosos.",
                "original_rating": 5.0,
                "review_date": "1 mês atrás"
            }
        ],
        "related_dishes": [
            {
                "id": "dish-rock-bar-caragua-centro-2",
                "name": "Porção de Batata Frita com Cheddar e Bacon",
                "description": "Batatas cortadas palito, fritas sequinhas, cobertas com molho cheddar cremoso e bacon.",
                "price": 38.0,
                "category": "Porções de Bar",
                "image_url": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1000&q=85",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": False,
                "last_price_delta_pct": 0
            }
        ]
    }
    dish_details["fe2d07d8-6ce4-43ec-b81f-4f09373c9a0c"] = rock_bar_dish

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {path} successfully!")

if __name__ == "__main__":
    process_file("caragua-foodtech-mono/src/data/caraguaRealDump.json")
    try:
        process_file("caragua-foodtech-mono/web-admin/src/data/caraguaRealDump.json")
    except Exception as e:
        print("web-admin skipped:", e)
