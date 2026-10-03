import uuid
import math
from typing import List, Dict, Any, Optional

# ==============================================================================
# CARAGUATATUBA FOODTECH — CATÁLOGO GASTRONÔMICO OFICIAL
# Representação realista dos 5 Polos Gastronômicos de Caraguatatuba/SP:
# 1. Martim de Sá
# 2. Centro Histórico
# 3. Indaiá
# 4. Massaguaçu
# 5. Porto Novo
# ==============================================================================

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância em metros entre duas coordenadas geográficas (WGS-84)."""
    R = 6371000.0  # Raio da Terra em metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

CARAGUA_OFFICIAL_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "e4b10492-9a67-4f62-b715-e23e2dcfa101",
        "name": "Quiosque Canto Bravo",
        "slug": "quiosque-canto-bravo",
        "address": "Av. Dr. Arthur Costa Filho, 2100",
        "neighborhood": "Martim de Sá",
        "city": "Caraguatatuba",
        "state": "SP",
        "latitude": -23.6268,
        "longitude": -45.3934,
        "price_level": 2,
        "rating_average": 4.65,
        "decayed_rating_average": 4.88,
        "total_reviews": 412,
        "cuisine_types": ["Frutos do Mar", "Caiçara", "Porções"],
        "dishes": [
            {
                "id": "d101",
                "name": "Isca de Badejo com Molho Tártaro Caiçara",
                "description": "Badejo fresco do litoral norte empanado e frito na hora com raspas de limão cravo.",
                "price": 68.0,
                "category": "Porções & Entradas",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": True,
            },
            {
                "id": "d102",
                "name": "Casquinha de Siri Gratinada",
                "description": "Carne de siri pura gratinada no forno com queijo da canastra e azeite de dendê.",
                "price": 28.0,
                "category": "Porções & Entradas",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": False,
                "is_lactose_free": False,
            },
            {
                "id": "d103",
                "name": "Moqueca de Robalo com Camarão",
                "description": "Posta de robalo fresco com camarões médios no leite de coco, pirão e arroz.",
                "price": 135.0,
                "category": "Pratos Principais",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": True,
            }
        ],
        "reviews": [
            {"rating": 5.0, "comment": "Melhor quiosque do Martim de Sá! Peixe fresco e atendimento impecável.", "days_ago": 6},
            {"rating": 5.0, "comment": "Comida maravilhosa pé na areia com vista incrível da praia.", "days_ago": 18},
            {"rating": 4.5, "comment": "Excelente porção de badejo, super crocante.", "days_ago": 32}
        ]
    },
    {
        "id": "e4b10492-9a67-4f62-b715-e23e2dcfa102",
        "name": "Cantina Caiçara Tradição",
        "slug": "cantina-caicara-tradicao",
        "address": "Rua Altino Arantes, 450",
        "neighborhood": "Centro",
        "city": "Caraguatatuba",
        "state": "SP",
        "latitude": -23.6226,
        "longitude": -45.4124,
        "price_level": 2,
        "rating_average": 4.70,
        "decayed_rating_average": 4.92,
        "total_reviews": 320,
        "cuisine_types": ["Caiçara", "Tradicional", "Vegetariano"],
        "dishes": [
            {
                "id": "d104",
                "name": "Azul-Marinho Tradicional com Pirão",
                "description": "Peixe cozido na panela de barro com banana da terra verde da mata atlântica e pirão artesanal.",
                "price": 75.0,
                "category": "Especialidades Caiçaras",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": True,
            },
            {
                "id": "d105",
                "name": "Moqueca Vegana de Palmito Pupunha",
                "description": "Palmito fresco da mata atlântica, banana da terra, pimentões, leite de coco natural e azeite de dendê.",
                "price": 58.0,
                "category": "Vegano & Sem Glúten",
                "is_vegan": True,
                "is_vegetarian": True,
                "is_gluten_free": True,
                "is_lactose_free": True,
            }
        ],
        "reviews": [
            {"rating": 5.0, "comment": "O Azul-Marinho é patrimônio autêntico de Caraguatatuba!", "days_ago": 4},
            {"rating": 5.0, "comment": "A moqueca vegana de pupunha surpreendeu toda a família.", "days_ago": 22}
        ]
    },
    {
        "id": "e4b10492-9a67-4f62-b715-e23e2dcfa103",
        "name": "Mar & Terra Gourmet",
        "slug": "mar-e-terra-gourmet",
        "address": "Av. Geraldo Nogueira da Silva, 1800",
        "neighborhood": "Indaiá",
        "city": "Caraguatatuba",
        "state": "SP",
        "latitude": -23.6350,
        "longitude": -45.4210,
        "price_level": 3,
        "rating_average": 4.52,
        "decayed_rating_average": 4.65,
        "total_reviews": 198,
        "cuisine_types": ["Contemporânea", "Carnes", "Frutos do Mar"],
        "dishes": [
            {
                "id": "d106",
                "name": "Risoto de Camarão Rosa com Limão Siciliano",
                "description": "Camarões rosa selecionados flambados na cachaça da serra com arroz arbóreo al dente.",
                "price": 89.0,
                "category": "Pratos Principais",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": False,
            },
            {
                "id": "d107",
                "name": "Picanha Caiçara na Brasa",
                "description": "Picanha maturada grelhada na brasa com farofa de banana da terra e vinagrete de palmito.",
                "price": 95.0,
                "category": "Pratos Principais",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": True,
            }
        ],
        "reviews": [
            {"rating": 4.5, "comment": "Ambiente sofisticado e risoto de camarão impecável.", "days_ago": 12}
        ]
    },
    {
        "id": "e4b10492-9a67-4f62-b715-e23e2dcfa104",
        "name": "Barraca da Tainha & Pescados",
        "slug": "barraca-tainha-pescados",
        "address": "Rodovia Rio-Santos, Km 92",
        "neighborhood": "Massaguaçu",
        "city": "Caraguatatuba",
        "state": "SP",
        "latitude": -23.5950,
        "longitude": -45.3520,
        "price_level": 2,
        "rating_average": 4.60,
        "decayed_rating_average": 4.78,
        "total_reviews": 145,
        "cuisine_types": ["Pescados", "Caiçara", "Festival da Tainha"],
        "dishes": [
            {
                "id": "d108",
                "name": "Tainha Espalmada na Grelha com Farofa de Camarão",
                "description": "Tainha fresca espalmada e assada na brasa, servida com farofa crocante e vinagrete de maracujá da restinga.",
                "price": 82.0,
                "category": "Destaque Festival da Tainha",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": False,
                "is_lactose_free": True,
            }
        ],
        "reviews": [
            {"rating": 5.0, "comment": "Melhor tainha do litoral norte! Tradição pura em Massaguaçu.", "days_ago": 8}
        ]
    },
    {
        "id": "e4b10492-9a67-4f62-b715-e23e2dcfa105",
        "name": "Restaurante O Pescador do Sul",
        "slug": "restaurante-pescador-sul",
        "address": "Av. José da Costa Pinheiro Júnior, 320",
        "neighborhood": "Porto Novo",
        "city": "Caraguatatuba",
        "state": "SP",
        "latitude": -23.6700,
        "longitude": -45.4300,
        "price_level": 1,
        "rating_average": 4.45,
        "decayed_rating_average": 4.58,
        "total_reviews": 92,
        "cuisine_types": ["Frutos do Mar", "Caseira", "Caiçara"],
        "dishes": [
            {
                "id": "d109",
                "name": "Caldeirada Caiçara Família",
                "description": "Postas de pescada branca, lula, mariscos e camarões frescos cozidos em caldo aromático com pirão.",
                "price": 98.0,
                "category": "Para Compartilhar",
                "is_vegan": False,
                "is_vegetarian": False,
                "is_gluten_free": True,
                "is_lactose_free": True,
            }
        ],
        "reviews": [
            {"rating": 4.5, "comment": "Porções muito fartas e peixe fresquinho vindo dos barcos de pesca.", "days_ago": 15}
        ]
    }
]

def query_catalog_fallback(
    user_lat: float,
    user_lng: float,
    max_distance_meters: float = 20000.0,
    neighborhood: Optional[str] = None,
    is_vegan: bool = False,
    is_gluten_free: bool = False,
    is_lactose_free: bool = False,
    banned_allergens: Optional[List[str]] = None,
    query_text: Optional[str] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """Busca resiliente no catálogo oficial com cálculo de distância e regras de segurança alimentar."""
    results = []
    q_lower = query_text.lower() if query_text else ""

    for item in CARAGUA_OFFICIAL_CATALOG:
        dist_m = calculate_haversine(user_lat, user_lng, item["latitude"], item["longitude"])
        if dist_m > max_distance_meters:
            continue

        if neighborhood and neighborhood.lower() not in item["neighborhood"].lower():
            continue

        # Filtra pratos
        matched_dishes = []
        for dish in item["dishes"]:
            if is_vegan and not dish["is_vegan"]:
                continue
            if is_gluten_free and not dish["is_gluten_free"]:
                continue
            if is_lactose_free and not dish["is_lactose_free"]:
                continue

            # Afinidade textual simples
            score = 0.5
            if q_lower:
                if q_lower in dish["name"].lower() or q_lower in dish["description"].lower():
                    score = 0.1
                elif any(word in dish["name"].lower() for word in q_lower.split()):
                    score = 0.3

            matched_dishes.append({
                **dish,
                "semantic_distance": score
            })

        matched_dishes.sort(key=lambda d: d["semantic_distance"])

        results.append({
            "restaurant": type("RestaurantMock", (), {
                "id": uuid.UUID(item["id"]),
                "name": item["name"],
                "slug": item["slug"],
                "neighborhood": item["neighborhood"],
                "address": item["address"],
                "latitude": item["latitude"],
                "longitude": item["longitude"],
                "price_level": item["price_level"],
                "rating_average": item["rating_average"],
                "decayed_rating_average": item["decayed_rating_average"],
                "total_reviews": item["total_reviews"],
                "cuisine_types": item["cuisine_types"],
            })(),
            "distance_meters": round(dist_m, 1),
            "matched_dishes": matched_dishes[:4],
            "recent_reviews": [
                {
                    "rating": r["rating"],
                    "effective_rating": r["rating"],
                    "comment": r["comment"],
                    "decay_weight": round(math.exp(-(math.log(2)/30.0) * r["days_ago"]), 3)
                }
                for r in item["reviews"]
            ]
        })

    # Ordena por proximidade
    results.sort(key=lambda x: x["distance_meters"])
    return results[:limit]
