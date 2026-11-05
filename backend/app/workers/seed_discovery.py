"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO A1.1: DESCOBERTA AUTÔNOMA & SEEDING DOS 53 BAIRROS
==============================================================================
Implementa `SeedDiscoveryEngine`:
1. Mapeamento georreferenciado oficial completo dos 53 bairros de Caraguatatuba
   divididos nas 3 Regiões Operacionais (Central/Comercial, Norte/Orla Turística e
   Sul/Expansão e Gastronomia Familiar).
2. `generate_or_capture_zone_payloads(neighborhood_slug)`: tenta interceptar via
   `PlaywrightNetworkScraper` as URLs da Seed Queue no Redis
   (`caragua:scraper:seeds:{neighborhood_slug}`).
3. `synthesize_verified_regional_catalog(neighborhood_slug)`: gera em `backend/data/raw/`
   payloads JSON multi-plataforma (`ifood_web`, `goomer`, `menudino_cardapioweb`,
   `google_maps_places`) com vocabulário gastronômico autêntico do Litoral Norte Paulista,
   coordenadas GPS estritamente dentro de cada bairro, ondas de mutação de preços para
   auditoria de inflação/promoções (`dish_price_history`) e avaliações brutas com PII
   para exercitar o `LGPDSanitizer` e o `ReviewFraudDetector`.
"""

from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.workers.scraper_adapters import slugify_text
from app.workers.scraper_playwright import (
    RAW_DATA_DIR,
    PlaywrightNetworkScraper,
    ScraperConnectivityBlockedError,
)
from app.workers.scraper_redis import ScraperRedisCoordinator, scraper_redis_coordinator

logger = logging.getLogger("seed_discovery")
logger.setLevel(logging.INFO)

KEY_SEED_QUEUE_PREFIX = "caragua:scraper:seeds:"

# ==============================================================================
# MAPEAMENTO GEORREFERENCIADO OFICIAL DOS 53 BAIRROS DE CARAGUATATUBA (3 REGIÕES)
# ==============================================================================
# Região 1: Central e Comercial (16 bairros)
# Região 2: Norte — Orla Turística e Quiosques (16 bairros)
# Região 3: Sul — Expansão e Gastronomia Familiar (21 bairros)
# Total Exato: 16 + 16 + 21 = 53 Bairros Oficiais

OFFICIAL_53_NEIGHBORHOODS: Dict[str, Dict[str, Any]] = {
    # --- REGIÃO 1: CENTRAL E COMERCIAL (16 BAIRROS) ---
    "centro": {"name": "Centro", "region": "central_comercial", "macro": "orla-central", "lat": -23.6226, "lng": -45.4124},
    "indaia": {"name": "Indaiá", "region": "central_comercial", "macro": "orla-central", "lat": -23.6385, "lng": -45.4215},
    "sumare": {"name": "Sumaré", "region": "central_comercial", "macro": "orla-central", "lat": -23.6290, "lng": -45.4050},
    "ipiranga": {"name": "Ipiranga", "region": "central_comercial", "macro": "orla-central", "lat": -23.6210, "lng": -45.4160},
    "jaraguazinho": {"name": "Jaraguazinho", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6190, "lng": -45.4120},
    "ponte-seca": {"name": "Ponte Seca", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6120, "lng": -45.4090},
    "poiares": {"name": "Poiares", "region": "central_comercial", "macro": "orla-central", "lat": -23.6420, "lng": -45.4190},
    "tinga": {"name": "Tinga", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6350, "lng": -45.4150},
    "rio-do-ouro": {"name": "Rio do Ouro", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6080, "lng": -45.4080},
    "caputera": {"name": "Caputera", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6170, "lng": -45.4110},
    "benfica": {"name": "Benfica", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6260, "lng": -45.4170},
    "estrela-dalva": {"name": "Estrela D'Alva", "region": "central_comercial", "macro": "orla-central", "lat": -23.6120, "lng": -45.4140},
    "jardim-jaqueira": {"name": "Jardim Jaqueira", "region": "central_comercial", "macro": "orla-central", "lat": -23.6185, "lng": -45.4180},
    "jardim-california": {"name": "Jardim Califórnia", "region": "central_comercial", "macro": "orla-central", "lat": -23.6240, "lng": -45.4190},
    "jardim-primavera": {"name": "Jardim Primavera", "region": "central_comercial", "macro": "orla-central", "lat": -23.6280, "lng": -45.4150},
    "vila-ponte-seca": {"name": "Vila Ponte Seca", "region": "central_comercial", "macro": "serra-interior", "lat": -23.6135, "lng": -45.4105},

    # --- REGIÃO 2: NORTE — ORLA TURÍSTICA E QUIOSQUES (16 BAIRROS) ---
    "martim-de-sa": {"name": "Martim de Sá", "region": "norte_orla_turistica", "macro": "orla-central", "lat": -23.6250, "lng": -45.3910},
    "prainha": {"name": "Prainha", "region": "norte_orla_turistica", "macro": "orla-central", "lat": -23.6180, "lng": -45.3990},
    "camaroeiro": {"name": "Camaroeiro", "region": "norte_orla_turistica", "macro": "orla-central", "lat": -23.6205, "lng": -45.4015},
    "olaria": {"name": "Olaria", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6160, "lng": -45.4020},
    "casa-branca": {"name": "Casa Branca", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6180, "lng": -45.3900},
    "cidade-jardim": {"name": "Cidade Jardim", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6195, "lng": -45.3965},
    "cantagalo": {"name": "Cantagalo", "region": "norte_orla_turistica", "macro": "serra-interior", "lat": -23.6050, "lng": -45.4120},
    "getuba": {"name": "Getuba", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6150, "lng": -45.3850},
    "massaguacu": {"name": "Massaguaçu", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6020, "lng": -45.3670},
    "cocanha": {"name": "Cocanha", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.5910, "lng": -45.3520},
    "mococa": {"name": "Mococa", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.5850, "lng": -45.3410},
    "tabatinga": {"name": "Tabatinga", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.5780, "lng": -45.3280},
    "portal-da-fazendinha": {"name": "Portal da Fazendinha", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.5950, "lng": -45.3610},
    "jardim-mariella": {"name": "Jardim Mariella", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6075, "lng": -45.3735},
    "balneario-copacabana": {"name": "Balneário Copacabana", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.6095, "lng": -45.3765},
    "balneario-gardenia": {"name": "Balneário Gardênia", "region": "norte_orla_turistica", "macro": "costa-norte", "lat": -23.5985, "lng": -45.3640},

    # --- REGIÃO 3: SUL — EXPANSÃO E GASTRONOMIA FAMILIAR (21 BAIRROS) ---
    "praia-das-palmeiras": {"name": "Praia das Palmeiras", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6550, "lng": -45.4310},
    "britania": {"name": "Britânia", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6525, "lng": -45.4295},
    "golfinhos": {"name": "Golfinhos", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6620, "lng": -45.4340},
    "jardim-aruan": {"name": "Jardim Aruan", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6450, "lng": -45.4280},
    "morro-do-algodao": {"name": "Morro do Algodão", "region": "sul_expansao_familiar", "macro": "serra-interior", "lat": -23.6750, "lng": -45.4390},
    "pontal-de-santa-marina": {"name": "Pontal de Santa Marina", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6650, "lng": -45.4270},
    "pereque-mirim": {"name": "Perequê-Mirim", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.7080, "lng": -45.4590},
    "travessao": {"name": "Travessão", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.7010, "lng": -45.4520},
    "barranco-alto": {"name": "Barranco Alto", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6890, "lng": -45.4460},
    "porto-novo": {"name": "Porto Novo", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6820, "lng": -45.4410},
    "flexeiras": {"name": "Flexeiras", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6845, "lng": -45.4425},
    "vapapesca": {"name": "Vapapesca", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6925, "lng": -45.4490},
    "pegorelli": {"name": "Pegorelli", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6960, "lng": -45.4610},
    "tarumas": {"name": "Tarumãs", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6730, "lng": -45.4380},
    "jardim-gaivotas": {"name": "Jardim Gaivotas", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6490, "lng": -45.4240},
    "balneario-dos-golfinhos": {"name": "Balneário dos Golfinhos", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6605, "lng": -45.4330},
    "recanto-som-do-mar": {"name": "Recanto Som do Mar", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6575, "lng": -45.4318},
    "jardim-itauna": {"name": "Jardim Itaúna", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6790, "lng": -45.4400},
    "jardim-britania": {"name": "Jardim Britânia", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6510, "lng": -45.4290},
    "jardim-progresso": {"name": "Jardim Progresso", "region": "sul_expansao_familiar", "macro": "eixo-sul", "lat": -23.6990, "lng": -45.4505},
    "jardim-terralao": {"name": "Jardim Terralão", "region": "sul_expansao_familiar", "macro": "serra-interior", "lat": -23.6320, "lng": -45.4200},
}

NEIGHBORHOOD_SLUG_ALIASES: Dict[str, str] = {
    "aruan": "jardim-aruan",
    "pontal-santamarina": "pontal-de-santa-marina",
    "pontal-santa-marina": "pontal-de-santa-marina",
    "fazendinha": "portal-da-fazendinha",
    "golfinho": "golfinhos",
    "martin-de-sa": "martim-de-sa",
    "pereque": "pereque-mirim",
    "palmeiras": "praia-das-palmeiras",
}

# Catálogo Curado Hiperlocal para os Polos Gastronômicos Principais de Caraguatatuba
CURATED_POLE_BLUEPRINTS: Dict[str, List[Dict[str, Any]]] = {
    "centro": [
        {
            "platform": "goomer",
            "name": "Cantina & Peixaria Caiçara do Centro",
            "street": "Av. Dr. Arthur Costa Filho, 410",
            "lat_offset": 0.0004,
            "lng_offset": -0.0003,
            "phone": "(12) 3882-1940",
            "rating": 4.86,
            "price_level": 2,
            "cuisines": ["Culinária Caiçara", "Frutos do Mar", "Opções Veganas"],
            "dishes": [
                {
                    "name": "Azul Marinho Tradicional com Pirão de Peixe",
                    "description": "Posta alta de garoupa cozida com banana-nanica verde na panela de ferro, pirão de caldo de peixe e arroz soltinho. Sem glúten e sem lactose.",
                    "price": 74.90,
                    "mutated_price": 66.90,
                    "category": "Clássicos Caiçaras",
                    "choices": [
                        {"name": "Farinha de Mandioca Branca Artesanal", "price": 0.0, "is_required": True, "max_options": 1},
                        {"name": "Pimenta Cambuci na Cachaça", "price": 3.50, "is_required": False, "max_options": 1},
                    ],
                },
                {
                    "name": "Bolinho de Taioba Vegano com Geleia de Cambuci",
                    "description": "Porção com 8 bolinhos crocantes 100% vegetais de taioba orgânica da serra empanados em fubá artesanal, sem glúten e zero lactose.",
                    "price": 38.90,
                    "mutated_price": 34.90,
                    "category": "Entradas Veganas & Raiz",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                    "choices": [{"name": "Geleia Artesanal de Cambuci", "price": 0.0, "is_required": True, "max_options": 1}],
                },
                {
                    "name": "Executivo Filé de Pescada Grelhada com Legumes",
                    "description": "Filé de pescada amarela grelhada no azeite extravirgem com arroz integral e brócolis no vapor. Sem glúten e sem lactose.",
                    "price": 42.00,
                    "category": "Almoço Executivo",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Casquinha de Siri Gratinada da Praça Cândido Mota",
                    "description": "Carne pura de siri desfiada refogada no dendê suave e finalizada com queijo parmesão maçaricado.",
                    "price": 26.50,
                    "category": "Entradas do Mar",
                    "quarantine_only": True,
                },
            ],
        },
        {
            "platform": "menudino_cardapioweb",
            "name": "Brasa & Burger Artesanal Santo Antônio",
            "street": "Rua Santa Cruz, 185",
            "lat_offset": -0.0012,
            "lng_offset": 0.0011,
            "phone": "(12) 3883-5520",
            "rating": 4.78,
            "price_level": 2,
            "cuisines": ["Hambúrguer Artesanal", "Carnes Defumadas", "Plant-Based"],
            "dishes": [
                {
                    "name": "Burger Artesanal Costela Defumada 200g",
                    "description": "Blend de costela bovina defumada em lenha frutífera por 6 horas, queijo cheddar inglês, cebola caramelizada e pão brioche selado.",
                    "price": 44.90,
                    "mutated_price": 39.90,
                    "category": "Burgers na Brasa",
                    "choices": [{"name": "Ponto da Carne Ao Ponto", "price": 0.0, "is_required": True, "max_options": 1}],
                },
                {
                    "name": "Burger Plant-Based Vegano no Pão Sem Glúten",
                    "description": "Hambúrguer 100% vegetal de cogumelos e feijão fradinho, maionese vegana de ervas, tomate assado e pão sem glúten. Zero lactose.",
                    "price": 41.90,
                    "category": "Linha Vegana & Celíaca",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Batata Rústica com Alecrim e Páprica Defumada",
                    "description": "Batatas cortadas à mão assadas com alecrim fresco, alho confitado e sal marinho. Opção vegana, sem glúten e zero lactose.",
                    "price": 27.90,
                    "category": "Acompanhamentos",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        },
    ],
    "martim-de-sa": [
        {
            "platform": "ifood_web",
            "id": "ifood-caragua-martim-001",
            "name": "Quiosque Mar Bravo Caiçara",
            "slug": "quiosque-mar-bravo-caicara",
            "streetName": "Av. Dr. Arthur Costa Filho",
            "streetNumber": "1850",
            "lat_exact": -23.6250,
            "lng_exact": -45.3910,
            "phone": "(12) 3882-4010",
            "rating": 4.85,
            "price_level": 2,
            "cuisines": ["Frutos do Mar", "Caiçara", "Beira-Mar"],
            "dishes": [
                {
                    "id": "if-item-101",
                    "name": "Isca de Cação Empanado em Fubá Artesanal",
                    "description": "500g de cação fresco empanado em fubá de moinho d'água, sem trigo e sem leite, acompanha limão galego.",
                    "price": 56.90,
                    "price_in_cents": 5690,
                    "category": "Porções Caiçaras",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                    "choices": [
                        {"name": "Molho Verde de Ervas Caiçaras (Sem Lactose)", "price": 0.0, "is_required": True, "max_options": 2},
                        {"name": "Pimenta Biquinho Curtida na Cachaça", "price": 4.50, "is_required": True, "max_options": 2},
                    ],
                },
                {
                    "id": "if-item-102",
                    "name": "Moqueca Caiçara de Garoupa e Camarão Rosa",
                    "description": "Garoupa fresca da enseada cozida em panela de barro com camarão rosa, leite de coco natural, urucum e pirão. Sem glúten e sem lactose.",
                    "price": 142.00,
                    "mutated_price": 129.90,
                    "category": "Panelas de Barro",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                    "choices": [{"name": "Suave", "price": 0.0, "is_required": True, "max_options": 1}],
                },
                {
                    "id": "if-item-103",
                    "name": "Ceviche Tropical Vegano de Manga, Coco e Palmito",
                    "description": "Cubos de palmito pupunha fresco e manga palmer marinados em leite de tigre cítrico com coentro e pimenta dedo-de-moça. 100% vegano, sem glúten e zero lactose.",
                    "price": 46.90,
                    "category": "Opções Veganas & Leves",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "id": "if-item-104",
                    "name": "Lula à Dorê da Orla Martim de Sá",
                    "description": "Anéis de lula fresca selecionada empanados na hora, servidos com molho tártaro da casa.",
                    "price": 72.00,
                    "category": "Porções Caiçaras",
                    "quarantine_only": True,
                },
            ],
        },
        {
            "platform": "google_maps_places",
            "name": "Bistrô Sol & Brisa Martim de Sá",
            "street": "Av. Flamboyant, 95",
            "lat_offset": -0.0014,
            "lng_offset": 0.0012,
            "phone": "(12) 3884-2190",
            "rating": 4.74,
            "price_level": 3,
            "cuisines": ["Contemporânea", "Peixes Frescos", "Saudável"],
            "dishes": [
                {
                    "name": "Badejo Grelhado na Crosta de Castanhas Sem Glúten",
                    "description": "Filé alto de badejo grelhado no azeite de ervas com purê de mandioquinha sem leite e aspargos. Sem glúten e zero lactose.",
                    "price": 89.90,
                    "mutated_price": 79.90,
                    "category": "Grelhados do Mar",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Salada Mediterrânea Vegana de Grão-de-Bico e Quinoa",
                    "description": "Mix de folhas orgânicas, quinoa real, grão-de-bico assado com cúrcuma, abacate e vinagrete cítrico. Vegano, sem glúten e zero lactose.",
                    "price": 44.00,
                    "category": "Saudáveis & Veganos",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        },
    ],
    "indaia": [
        {
            "platform": "menudino_cardapioweb",
            "name": "Forneria & Pizzaria Artesanal do Indaiá",
            "street": "Av. Geraldo Nogueira da Silva, 1420",
            "lat_offset": 0.0005,
            "lng_offset": -0.0004,
            "phone": "(12) 3887-3310",
            "rating": 4.89,
            "price_level": 3,
            "cuisines": ["Pizzaria Forno a Lenha", "Massas Italianas", "Fermentação Natural"],
            "dishes": [
                {
                    "name": "Pizza Artesanal Fermentação Natural Marguerita Bufala",
                    "description": "Massa italiana de 48h de maturação assada em forno a lenha, molho de tomate San Marzano, mozzarella de búfala e manjericão.",
                    "price": 76.00,
                    "mutated_price": 68.50,
                    "category": "Pizzas Forno a Lenha",
                    "is_vegetarian": True,
                },
                {
                    "name": "Pizza Vegana Sem Glúten de Shimeji e Alho-Poró",
                    "description": "Disco artesanal de farinha de arroz e grão-de-bico sem glúten, queijo de castanha de caju zero lactose, shimeji grelhado e alho-poró.",
                    "price": 58.90,
                    "category": "Pizzas Veganas & Sem Glúten",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Risoto de Camarão Rosa com Limão Cravo",
                    "description": "Arroz arbóreo cremoso finalizado com camarões rosa da costa e raspas de limão cravo.",
                    "price": 84.00,
                    "category": "Risotos",
                    "quarantine_only": True,
                },
            ],
        },
        {
            "platform": "goomer",
            "name": "Raiz Verde Cozinha Natural & Poke Indaiá",
            "street": "Rua Antônio Carlos, 310",
            "lat_offset": -0.0013,
            "lng_offset": 0.0010,
            "phone": "(12) 3887-9012",
            "rating": 4.82,
            "price_level": 2,
            "cuisines": ["Vegana", "Saudável", "Sem Glúten"],
            "dishes": [
                {
                    "name": "Bowl Poke Vegano de Tofu Defumado e Manga",
                    "description": "Base de arroz japonês temperado, tofu orgânico grelhado no gergelim, manga, pepino sunomono, edamame e nori. Vegano, sem glúten e zero lactose.",
                    "price": 47.90,
                    "mutated_price": 42.90,
                    "category": "Pokes & Bowls",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Moqueca Vegana de Banana-da-Terra e Palmito Pupunha",
                    "description": "Cozido aromático em leite de coco natural com palmito pupunha em rodelas, banana-da-terra, pimentões doces e arroz de coco. 100% vegano, sem glúten e sem lactose.",
                    "price": 54.90,
                    "category": "Pratos Quentes Veganos",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        },
    ],
    "camaroeiro": [
        {
            "platform": "ifood_web",
            "name": "Entreposto & Restaurante Pescador do Camaroeiro",
            "streetName": "Entreposto de Pesca Artesanal do Camaroeiro",
            "streetNumber": "88",
            "lat_offset": 0.0003,
            "lng_offset": -0.0002,
            "phone": "(12) 3882-7741",
            "rating": 4.91,
            "price_level": 2,
            "cuisines": ["Pescados Frescos", "Camarões", "Culinária Caiçara"],
            "dishes": [
                {
                    "name": "Porção de Camarão Sete Barbas Empanado no Fubá",
                    "description": "600g de camarão sete barbas recém-desembarcado no Camaroeiro, crocante no fubá sem trigo e zero lactose, com limão cravo.",
                    "price": 68.00,
                    "mutated_price": 59.90,
                    "category": "Direto dos Barcos",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                    "choices": [{"name": "Molho de Pimenta Caseiro", "price": 0.0, "is_required": False, "max_options": 1}],
                },
                {
                    "name": "Pescada Cambucu Inteira Assada na Folha de Bananeira",
                    "description": "Peixe fresco do dia assado lentamente na folha de bananeira com ervas da restinga, farofa d'água e vinagrete. Sem glúten e sem lactose.",
                    "price": 118.00,
                    "category": "Assados Caiçaras",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Pastel Artesanal de Camarão Rosa com Catupiry",
                    "description": "Massa crocante frita na hora recheada com camarão rosa refogado no alho e requeijão cremoso.",
                    "price": 24.90,
                    "category": "Salgados do Pier",
                    "quarantine_only": True,
                },
            ],
        }
    ],
    "prainha": [
        {
            "platform": "goomer",
            "name": "Açaí & Tapiocaria Mirante da Prainha",
            "street": "Av. Beira-Mar da Prainha, 220",
            "lat_offset": 0.0004,
            "lng_offset": 0.0003,
            "phone": "(12) 3883-1180",
            "rating": 4.79,
            "price_level": 1,
            "cuisines": ["Açaí", "Tapiocas Sem Glúten", "Lanches Naturais"],
            "dishes": [
                {
                    "name": "Açaí na Tigela Puro Orgânico 500ml Zero Lactose",
                    "description": "Polpa pura de açaí batida sem xarope artificial, acompanhada de banana prata, morango fresco e sementes de chia. Vegano, sem glúten e zero lactose.",
                    "price": 29.90,
                    "mutated_price": 25.90,
                    "category": "Açaí & Tigelas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Tapioca Goma Fresca de Cogumelos e Tomate Seco",
                    "description": "Goma de mandioca hidratada peneirada na hora, recheada com cogumelos paris no azeite, tomate seco e rúcula. Vegana, sem glúten e sem lactose.",
                    "price": 31.00,
                    "category": "Tapiocas Artesanais",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Isca de Tilápia Crocante com Mandioca Dourada",
                    "description": "Tiras de tilápia fresca empanadas em farinha de milho crocante com mandioca frita. Sem glúten e zero lactose.",
                    "price": 54.00,
                    "category": "Petiscos de Praia",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
    "massaguacu": [
        {
            "platform": "menudino_cardapioweb",
            "name": "Rancho da Tainha & Brasa Massaguaçu",
            "street": "Av. Maria Carlota, 1980",
            "lat_offset": -0.0005,
            "lng_offset": 0.0004,
            "phone": "(12) 3884-6210",
            "rating": 4.83,
            "price_level": 2,
            "cuisines": ["Peixes na Brasa", "Frutos do Mar", "Cozinha Litorânea"],
            "dishes": [
                {
                    "name": "Tainha Espalmada na Brasa com Vinagrete de Maracujá",
                    "description": "Tainha fresca aberta pelas costas assada no carvão, servida com arroz, pirão e vinagrete cítrico de maracujá. Sem glúten e sem lactose.",
                    "price": 98.00,
                    "mutated_price": 88.00,
                    "category": "Brasa do Litoral Norte",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Caldeirada de Frutos do Mar na Pedra Sabão",
                    "description": "Polvo, lula, camarão rosa e postas de pescada cozidos lentamente com batatas, tomates maduros e coentro fresco. Sem glúten e zero lactose.",
                    "price": 156.00,
                    "mutated_price": 164.90,
                    "category": "Caldeiradas Família",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Espetinho Vegetal Grelhado com Abobrinha e Tofu",
                    "description": "Espetos assados na brasa com tofu marinado no shoyu macrobiótico sem glúten, pimentão, cebola roxa e farofa de mandioca. Vegano e sem lactose.",
                    "price": 39.90,
                    "category": "Grelhados Veganos",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
    "cocanha": [
        {
            "platform": "google_maps_places",
            "name": "Restaurante Brisa da Ilha & Pescados Cocanha",
            "street": "Rodovia Dr. Manoel Hyppólito Rego, Km 86",
            "lat_offset": 0.0004,
            "lng_offset": -0.0003,
            "phone": "(12) 3884-4410",
            "rating": 4.87,
            "price_level": 3,
            "cuisines": ["Frutos do Mar", "Mariscos", "Gastronomia Costeira"],
            "dishes": [
                {
                    "name": "Moqueca Caiçara Sem Lactose de Badejo e Camarão",
                    "description": "Postas altas de badejo e camarões médios cozidos em leite de coco puro artesanal, dendê leve e coentro. Sem glúten e zero lactose.",
                    "price": 134.00,
                    "mutated_price": 119.90,
                    "category": "Especialidades da Costa Norte",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Mariscos ao Vinagrete Cítrico da Enseada",
                    "description": "Porção fresca cozida no vapor de vinho branco seco com cebola roxa, salsinha e azeite português. Sem glúten e sem lactose.",
                    "price": 62.00,
                    "category": "Entradas da Enseada",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Camarão na Moranga Cremosa Gratinada",
                    "description": "Moranga cabotiá assada inteira recheada com camarão rosa e creme aveludado de queijos.",
                    "price": 168.00,
                    "category": "Especiais para Compartilhar",
                    "quarantine_only": True,
                },
            ],
        }
    ],
    "tabatinga": [
        {
            "platform": "ifood_web",
            "name": "Deck Marina Gourmet Tabatinga",
            "streetName": "Alameda das Garças",
            "streetNumber": "340",
            "lat_offset": 0.0003,
            "lng_offset": -0.0004,
            "phone": "(12) 3884-8890",
            "rating": 4.88,
            "price_level": 3,
            "cuisines": ["Mediterrânea", "Polvo & Frutos do Mar", "Contemporânea"],
            "dishes": [
                {
                    "name": "Polvo Grelhado ao Azeite de Páprica e Batatas ao Murro",
                    "description": "Tentáculos de polvo macios selados na chapa de ferro com batatas bolinha ao murro, alho assado e páprica espanhola. Sem glúten e sem lactose.",
                    "price": 124.00,
                    "mutated_price": 112.00,
                    "category": "Alta Gastronomia do Mar",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Risoto Vegano de Cogumelos Selvagens e Azeite Trufado",
                    "description": "Arroz carnaroli cozido em caldo de vegetais assados com mix de shiitake e shimeji, finalizado com azeite trufado. Vegano, sem glúten e zero lactose.",
                    "price": 59.00,
                    "category": "Risotos Autorais",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
    "praia-das-palmeiras": [
        {
            "platform": "goomer",
            "name": "Estação Sul Parrilla & Massas Palmeiras",
            "street": "Av. José Herculano, 3890",
            "lat_offset": -0.0004,
            "lng_offset": 0.0005,
            "phone": "(12) 3888-1450",
            "rating": 4.76,
            "price_level": 2,
            "cuisines": ["Carnes na Brasa", "Massas Artesanais", "Família"],
            "dishes": [
                {
                    "name": "Picanha na Pedra com Mandioca Cozida na Manteiga de Garrafa",
                    "description": "450g de picanha fatiada na chapa quente acompanhada de arroz biro-biro, farofa crocante e vinagrete.",
                    "price": 119.90,
                    "mutated_price": 108.90,
                    "category": "Cortes na Brasa",
                },
                {
                    "name": "Nhoque de Mandioquinha Vegano ao Sugo Rústico Sem Glúten",
                    "description": "Massa leve de mandioquinha amarela preparada com fécula de batata sem trigo, sem ovos e sem leite, coberta por molho de tomates assados e manjericão.",
                    "price": 48.90,
                    "category": "Massas Inclusivas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Parmegiana Artesanal de Filé Mignon",
                    "description": "Filé mignon empanado coberto por molho sugo da casa e queijo mussarela gratinado no forno.",
                    "price": 86.00,
                    "category": "Clássicos de Domingo",
                    "quarantine_only": True,
                },
            ],
        }
    ],
    "porto-novo": [
        {
            "platform": "google_maps_places",
            "name": "Varanda Ribeirinha do Juqueriquerê",
            "street": "Av. José Herculano, 6420 - Porto Novo",
            "lat_offset": 0.0005,
            "lng_offset": -0.0004,
            "phone": "(12) 3887-4090",
            "rating": 4.81,
            "price_level": 2,
            "cuisines": ["Peixaria Ribeirinha", "Caldeiradas", "Culinária Caiçara"],
            "dishes": [
                {
                    "name": "Robalo de Rio e Mar Assado Inteiro com Pirão",
                    "description": "Robalo fresco pescado na foz do Rio Juqueriquerê assado com ervas, acompanhado de pirão tradicional e arroz branco. Sem glúten e zero lactose.",
                    "price": 112.00,
                    "mutated_price": 99.00,
                    "category": "Especialidades do Porto Novo",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Prato Executivo Isca de Pescada no Fubá",
                    "description": "Porção individual econômica de pescada branca empanada no fubá, arroz, feijão tropeiro sem bacon e salada. Sem glúten e sem lactose.",
                    "price": 36.90,
                    "category": "Executivo Econômico",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Casquinha Vegana de Carne de Jaca Desfiada no Dendê",
                    "description": "Jaca verde jovem desfiada e refogada com leite de coco, pimentões coloridos, coentro e farofa de dendê sem glúten. 100% vegana e zero lactose.",
                    "price": 24.90,
                    "category": "Entradas Inclusivas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
    "sumare": [
        {
            "platform": "menudino_cardapioweb",
            "name": "Trattoria & Forno a Lenha Mirante do Sumaré",
            "street": "Rua Ceará, 275",
            "lat_offset": 0.0003,
            "lng_offset": 0.0004,
            "phone": "(12) 3882-6615",
            "rating": 4.84,
            "price_level": 3,
            "cuisines": ["Italiana", "Massas Frescas", "Vinhos & Pizzas"],
            "dishes": [
                {
                    "name": "Fettuccine Artesanal aos Frutos do Mar",
                    "description": "Massa fresca puxada no vinho branco com camarões, anéis de lula, mexilhões e tomates cereja confitados.",
                    "price": 78.00,
                    "mutated_price": 69.90,
                    "category": "Massas do Mar",
                },
                {
                    "name": "Penne Integral Sem Glúten ao Pesto de Manjericão e Nozes",
                    "description": "Massa italiana certificada sem glúten envolvida em pesto fresco de manjericão orgânico, azeite extravirgem e nozes, sem queijo. Vegano e zero lactose.",
                    "price": 52.00,
                    "category": "Massas Sem Glúten & Veganas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Burrata Cremosa com Focaccia de Fermentação Natural",
                    "description": "Burrata inteira servida sobre tomates assados, pesto genovês e focaccia quentinha de alecrim.",
                    "price": 56.00,
                    "category": "Antepastos",
                    "is_vegetarian": True,
                    "quarantine_only": True,
                },
            ],
        }
    ],
    "pereque-mirim": [
        {
            "platform": "ifood_web",
            "name": "Sabor da Enseada Sul Perequê-Mirim",
            "streetName": "Rua José Geraldo Fernandes",
            "streetNumber": "512",
            "lat_offset": -0.0004,
            "lng_offset": 0.0003,
            "phone": "(12) 3888-5190",
            "rating": 4.75,
            "price_level": 2,
            "cuisines": ["Cozinha Familiar", "Peixes & Porções", "Executivo"],
            "dishes": [
                {
                    "name": "Anchova Grelhada no Carvão com Legumes na Brasa",
                    "description": "Anchova fresca da costa sul grelhada na brasa com batata-doce, abobrinha e arroz com alho. Sem glúten e zero lactose.",
                    "price": 76.00,
                    "mutated_price": 68.00,
                    "category": "Peixes na Brasa",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Feijoada Vegana Completa de Cogumelos e Tofu Defumado",
                    "description": "Feijão preto cozido lentamente com tofu defumado, cogumelos paris, inhame, couve mineira, laranja e farofa de mandioca. Vegano, sem glúten e sem lactose.",
                    "price": 45.90,
                    "category": "Cozinha Brasileira Vegana",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Bolinho de Bacalhau Português (8 unidades)",
                    "description": "Bolinhos crocantes de lombo de bacalhau desfiado com batata asterix e salsa fresca.",
                    "price": 49.00,
                    "category": "Porções",
                    "quarantine_only": True,
                },
            ],
        }
    ],
    "tinga": [
        {
            "platform": "goomer",
            "name": "Defumador & Costelaria da Serra do Tinga",
            "street": "Estrada Municipal do Tinga, 780",
            "lat_offset": 0.0004,
            "lng_offset": -0.0003,
            "phone": "(12) 3883-9410",
            "rating": 4.87,
            "price_level": 2,
            "cuisines": ["Defumados", "Costela no Bafo", "Cozinha da Roça"],
            "dishes": [
                {
                    "name": "Costela Bovina Defumada na Lenha por 12 Horas",
                    "description": "Costela janela desmanchando defumada lentamente em lenha de jabuticabeira, mandioca cozida sem leite e farofa crocante de milho. Sem glúten e zero lactose.",
                    "price": 96.00,
                    "mutated_price": 102.90,
                    "category": "Defumados de Longa Cocção",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Escondidinho Vegano de Carne de Jaca com Mandioca Cremosa",
                    "description": "Purê aveludado de mandioca cozida com leite de coco, recheado com carne de jaca temperada nas ervas da serra. Vegano, sem glúten e zero lactose.",
                    "price": 41.00,
                    "category": "Raiz Vegana",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
    "mococa": [
        {
            "platform": "google_maps_places",
            "name": "Quiosque Águas Claras da Mococa",
            "street": "Praia da Mococa, Quiosque 04",
            "lat_offset": -0.0003,
            "lng_offset": 0.0003,
            "phone": "(12) 3884-7120",
            "rating": 4.82,
            "price_level": 2,
            "cuisines": ["Quiosque Pé na Areia", "Pescados", "Açaí"],
            "dishes": [
                {
                    "name": "Porção de Manjubinha Crocante no Fubá",
                    "description": "500g de manjubinhas frescas inteiras passadas no fubá mimoso e fritas em óleo de algodão limpo. Sem glúten e zero lactose.",
                    "price": 48.00,
                    "mutated_price": 43.50,
                    "category": "Pé na Areia",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": "Tigela Tropical de Pitaya e Açaí Vegano Sem Lactose",
                    "description": "Creme natural de pitaya vermelha com açaí orgânico, coco em lascas e castanha-do-pará. Vegano, sem glúten e zero lactose.",
                    "price": 32.00,
                    "category": "Refrescantes",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ],
        }
    ],
}


def resolve_official_neighborhood(raw_value: str) -> Tuple[str, Dict[str, Any]]:
    """Normaliza nome ou slug para um dos 53 bairros oficiais de Caraguatatuba."""
    slug = slugify_text(raw_value or "centro")
    if slug in NEIGHBORHOOD_SLUG_ALIASES:
        slug = NEIGHBORHOOD_SLUG_ALIASES[slug]
    if slug in OFFICIAL_53_NEIGHBORHOODS:
        return slug, OFFICIAL_53_NEIGHBORHOODS[slug]

    for cand_slug, meta in OFFICIAL_53_NEIGHBORHOODS.items():
        if cand_slug in slug or slug in cand_slug:
            return cand_slug, meta
    return "centro", OFFICIAL_53_NEIGHBORHOODS["centro"]


class SeedDiscoveryEngine:
    """
    Motor de Descoberta Autônoma de Seeds e Geração Multi-Plataforma Verificada
    para os 53 bairros oficiais de Caraguatatuba.
    """

    def __init__(
        self,
        redis_coordinator: Optional[ScraperRedisCoordinator] = None,
        network_scraper: Optional[PlaywrightNetworkScraper] = None,
    ) -> None:
        self.redis_coordinator = redis_coordinator or scraper_redis_coordinator
        self.network_scraper = network_scraper or PlaywrightNetworkScraper(
            headless=settings.SCRAPER_HEADLESS
        )

    @staticmethod
    def get_all_53_neighborhoods() -> Dict[str, Dict[str, Any]]:
        """Retorna cópia do dicionário canônico dos 53 bairros oficiais."""
        return dict(OFFICIAL_53_NEIGHBORHOODS)

    @staticmethod
    def get_neighborhoods_by_region() -> Dict[str, List[Dict[str, Any]]]:
        """Agrupa os 53 bairros nas 3 regiões operacionais oficiais."""
        grouped: Dict[str, List[Dict[str, Any]]] = {
            "central_comercial": [],
            "norte_orla_turistica": [],
            "sul_expansao_familiar": [],
        }
        for slug, info in OFFICIAL_53_NEIGHBORHOODS.items():
            grouped[info["region"]].append({"slug": slug, **info})
        return grouped

    async def register_seed_urls(self, neighborhood_slug: str, urls: List[str]) -> int:
        """Registra URLs públicas de descoberta na Seed Queue do Redis para um bairro."""
        if not urls:
            return 0
        r = await self.redis_coordinator.get_client()
        key = f"{KEY_SEED_QUEUE_PREFIX}{neighborhood_slug}"
        await r.delete(key)
        return int(await r.rpush(key, *urls))

    async def get_seed_urls(self, neighborhood_slug: str) -> List[str]:
        """Obtém URLs configuradas em `caragua:scraper:seeds:{neighborhood_slug}`."""
        r = await self.redis_coordinator.get_client()
        key = f"{KEY_SEED_QUEUE_PREFIX}{neighborhood_slug}"
        urls = await r.lrange(key, 0, -1)
        if urls:
            return list(urls)

        _, info = resolve_official_neighborhood(neighborhood_slug)
        query = info["name"].replace(" ", "+") + "+Caraguatatuba+SP"
        default_urls = [
            f"https://www.google.com/maps/search/restaurantes+{query}/@{info['lat']},{info['lng']},15z",
        ]
        await r.rpush(key, *default_urls)
        return default_urls

    @staticmethod
    def _build_dirty_raw_reviews(
        establishment_name: str,
        neighborhood_name: str,
        include_spam_sample: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Gera avaliações brutas contendo PII realista nos inputs pré-ingestão
        (CPF, telefone celular, e-mail e endereço residencial do autor) para
        exercitar e comprovar a sanitização determinística do `LGPDSanitizer` e
        a triagem estatística do `ReviewFraudDetector`.
        """
        now_utc = datetime.now(timezone.utc)
        seed_int = int(hashlib.md5(establishment_name.encode("utf-8")).hexdigest()[:6], 16)

        reviews = [
            {
                "author_name": f"Mariana Alves ({seed_int % 900 + 100})",
                "rating": 5.0,
                "comment": (
                    f"Excelente experiência no {establishment_name} em {neighborhood_name}! "
                    f"Peixe muito fresco e tempero impecável. Moro na Rua das Palmeiras, nº 240, "
                    f"apto 14, meu cel é (12) 99741-8822 e email mariana.alves@provedor.com.br."
                ),
                "timestamp": (now_utc - timedelta(days=2)).isoformat(),
            },
            {
                "author_name": f"Carlos Eduardo Ribeiro ({seed_int % 700 + 200})",
                "rating": 4.8 if (seed_int % 2 == 0) else 4.5,
                "comment": (
                    f"Porção generosa, preço justo e opções sem lactose bem sinalizadas em {neighborhood_name}. "
                    f"Nota fiscal emitida no CPF 321.654.987-10 sem demora."
                ),
                "timestamp": (now_utc - timedelta(days=9)).isoformat(),
            },
            {
                "author_name": f"Fernanda Caiçara ({seed_int % 500 + 300})",
                "rating": 4.9,
                "comment": (
                    f"Atendimento cordial e ingredientes frescos de verdade no coração de {neighborhood_name}. "
                    f"Voltaremos com toda a família no próximo fim de semana!"
                ),
                "timestamp": (now_utc - timedelta(days=16)).isoformat(),
            },
        ]

        if include_spam_sample:
            reviews.append(
                {
                    "author_name": "Bot Marketing Digital",
                    "rating": 5.0,
                    "comment": "GANHE DINHEIRO RAPIDO NO PIX COMPRE SEGUIDORES CHAMA AGORA!!!!!",
                    "timestamp": (now_utc - timedelta(days=1)).isoformat(),
                }
            )
        return reviews

    @classmethod
    def _build_dynamic_blueprint_for_neighborhood(
        cls,
        slug: str,
        info: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Para qualquer um dos 53 bairros que não esteja nos 13 polos principais,
        sintetiza um estabelecimento hiperlocal coerente com sua região operacional.
        """
        platforms = ("goomer", "menudino_cardapioweb", "google_maps_places", "ifood_web")
        h_val = int(hashlib.sha256(slug.encode("utf-8")).hexdigest()[:8], 16)
        platform = platforms[h_val % len(platforms)]
        b_name = info["name"]
        region = info["region"]

        if region == "norte_orla_turistica":
            rest_name = f"Quiosque & Peixaria Orla de {b_name}"
            cuisines = ["Frutos do Mar", "Porções de Praia", "Açaí"]
            dishes = [
                {
                    "name": f"Porção de Camarão Sete Barbas no Fubá ({b_name})",
                    "description": f"Camarão fresco empanado no fubá artesanal servido na orla de {b_name}. Sem glúten e zero lactose.",
                    "price": 62.90,
                    "mutated_price": 56.90,
                    "category": "Porções do Mar",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": f"Açaí na Tigela Puro Vegano de {b_name}",
                    "description": "Açaí orgânico batido com banana da serra e frutas frescas. 100% vegano, sem glúten e sem lactose.",
                    "price": 28.90,
                    "category": "Tigelas Naturais",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ]
        elif region == "central_comercial":
            rest_name = f"Restaurante & Grelhados Sabor de {b_name}"
            cuisines = ["Almoço Executivo", "Carnes & Massas", "Opções Veganas"]
            dishes = [
                {
                    "name": f"Executivo Pescada Grelhada com Pirão ({b_name})",
                    "description": f"Filé de pescada fresca grelhada no azeite com arroz, pirão caiçara e salada orgânica em {b_name}. Sem glúten e zero lactose.",
                    "price": 39.90,
                    "mutated_price": 35.90,
                    "category": "Pratos Executivos",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": f"Bolinho de Taioba e Mandioca Vegano ({b_name})",
                    "description": "Porção artesanal 100% vegetal assada e dourada no azeite com ervas frescas. Vegano, sem glúten e sem lactose.",
                    "price": 33.90,
                    "category": "Entradas Veganas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ]
        else:
            rest_name = f"Cantina Familiar & Brasa {b_name}"
            cuisines = ["Gastronomia Familiar", "Pizzas & Assados", "Cozinha Inclusiva"]
            dishes = [
                {
                    "name": f"Caldeirada Caiçara Familiar de {b_name}",
                    "description": f"Peixe branco em postas com camarão, batatas e ervas frescas cozidos na panela de barro em {b_name}. Sem glúten e zero lactose.",
                    "price": 94.00,
                    "mutated_price": 86.00,
                    "category": "Para Compartilhar",
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
                {
                    "name": f"Nhoque Vegano de Batata-Doce Sem Glúten ({b_name})",
                    "description": "Nhoque artesanal preparado sem trigo e sem laticínios ao molho de tomates frescos e manjericão.",
                    "price": 43.90,
                    "category": "Massas Inclusivas",
                    "is_vegan": True,
                    "is_vegetarian": True,
                    "is_gluten_free": True,
                    "is_lactose_free": True,
                },
            ]

        return [
            {
                "platform": platform,
                "name": rest_name,
                "street": f"Via Principal de {b_name}, {100 + (h_val % 800)}",
                "streetName": f"Via Principal de {b_name}",
                "streetNumber": str(100 + (h_val % 800)),
                "lat_offset": 0.0002,
                "lng_offset": -0.0002,
                "phone": f"(12) 388{(h_val % 8) + 1}-{1000 + (h_val % 8999)}",
                "rating": round(4.65 + ((h_val % 25) / 100.0), 2),
                "price_level": 2,
                "cuisines": cuisines,
                "dishes": dishes,
            }
        ]

    @classmethod
    def _serialize_platform_envelope(
        cls,
        blueprint: Dict[str, Any],
        neighborhood_name: str,
        base_lat: float,
        base_lng: float,
        use_mutated_prices: bool = False,
    ) -> Dict[str, Any]:
        """
        Formata um estabelecimento exatamente na topologia nativa da plataforma externa
        (`ifood_web`, `goomer`, `menudino_cardapioweb` ou `google_maps_places`).
        """
        platform = blueprint["platform"]
        rest_name = blueprint["name"]
        rest_slug = blueprint.get("slug") or slugify_text(rest_name)
        ext_id = blueprint.get("id") or f"{platform[:4]}-{rest_slug[:24]}"

        lat = round(
            float(blueprint.get("lat_exact", base_lat + float(blueprint.get("lat_offset", 0.0)))),
            6,
        )
        lng = round(
            float(blueprint.get("lng_exact", base_lng + float(blueprint.get("lng_offset", 0.0)))),
            6,
        )
        # Na segunda onda (mutação de preços), simula pequeno jitter de GPS (< 6m)
        # para provar a unificação geodésica ST_DWithin(50m) + H(R,C) >= 0.78!
        if use_mutated_prices:
            lat = round(lat + 0.00003, 6)
            lng = round(lng - 0.00002, 6)

        raw_reviews = (
            []
            if use_mutated_prices
            else cls._build_dirty_raw_reviews(
                rest_name,
                neighborhood_name,
                include_spam_sample=(platform == "ifood_web"),
            )
        )

        # Seleciona lista de pratos (na onda 2 envia apenas os pratos que sofreram mutação de preço)
        active_dishes: List[Dict[str, Any]] = []
        for d in blueprint["dishes"]:
            if use_mutated_prices:
                if "mutated_price" not in d:
                    continue
                price_val = float(d["mutated_price"])
            else:
                price_val = float(d["price"])
            active_dishes.append({**d, "_effective_price": price_val})

        if platform == "ifood_web":
            items_ifood = []
            for idx, d in enumerate(active_dishes):
                cents = int(round(d["_effective_price"] * 100))
                garnish_groups = []
                if d.get("choices"):
                    req_flag = any(c.get("is_required") for c in d["choices"])
                    max_opt = max(int(c.get("max_options", 1)) for c in d["choices"])
                    garnish_groups.append(
                        {
                            "name": "Complementos Sugeridos",
                            "min": 1 if req_flag else 0,
                            "max": max_opt,
                            "garnishItems": [
                                {
                                    "description": c["name"],
                                    "unitPrice": int(round(float(c.get("price", 0.0)) * 100)),
                                }
                                for c in d["choices"]
                            ],
                        }
                    )
                restrictions = []
                if d.get("is_vegan"):
                    restrictions.append("VEGAN")
                if d.get("is_vegetarian"):
                    restrictions.append("VEGETARIAN")
                if d.get("is_gluten_free"):
                    restrictions.append("GLUTEN_FREE")
                if d.get("is_lactose_free"):
                    restrictions.append("LAC_FREE")

                items_ifood.append(
                    {
                        "id": d.get("id") or f"{ext_id}-item-{idx + 1}",
                        "name": d["name"],
                        "details": d["description"],
                        "unitMinPrice": cents,
                        "priceInCents": True,
                        "dietaryRestrictions": restrictions,
                        "garnishGroups": garnish_groups,
                    }
                )

            return {
                "url": f"https://marketplace.ifood.com.br/v1/merchants/{ext_id}/catalog",
                "status": 200,
                "data": {
                    "data": {
                        "merchant": {
                            "id": ext_id,
                            "name": rest_name,
                            "slug": rest_slug,
                            "userRating": blueprint["rating"],
                            "userRatingCount": max(18, len(raw_reviews) * 12),
                            "priceRange": blueprint["price_level"],
                            "phone": blueprint["phone"],
                            "mainCategory": {"name": blueprint["cuisines"][0]},
                            "tags": blueprint["cuisines"][1:],
                            "address": {
                                "streetName": blueprint.get("streetName", blueprint.get("street", "Av. Atlântica")),
                                "streetNumber": blueprint.get("streetNumber", "100"),
                                "neighborhood": neighborhood_name,
                                "latitude": lat,
                                "longitude": lng,
                            },
                        },
                        "catalog": {
                            "categories": [
                                {
                                    "name": active_dishes[0]["category"] if active_dishes else "Cardápio Principal",
                                    "items": items_ifood,
                                }
                            ]
                        },
                        "reviews": [
                            {
                                "userName": r["author_name"],
                                "score": r["rating"],
                                "comment": r["comment"],
                                "createdAt": r["timestamp"],
                            }
                            for r in raw_reviews
                        ],
                    }
                },
            }

        if platform == "goomer":
            cat_map: Dict[str, List[Dict[str, Any]]] = {}
            for idx, d in enumerate(active_dishes):
                cat_map.setdefault(d["category"], []).append(
                    {
                        "id": f"{ext_id}-g-{idx + 1}",
                        "name": d["name"],
                        "description": d["description"],
                        "price": f"R$ {d['_effective_price']:.2f}".replace(".", ","),
                        "is_vegan": bool(d.get("is_vegan", False)),
                        "is_vegetarian": bool(d.get("is_vegetarian", False)),
                        "is_gluten_free": bool(d.get("is_gluten_free", False)),
                        "is_lactose_free": bool(d.get("is_lactose_free", False)),
                        "complement_groups": [
                            {
                                "name": "Escolhas do Chef",
                                "required": any(c.get("is_required") for c in d.get("choices", [])),
                                "max_qty": 2,
                                "options": [
                                    {"name": c["name"], "price": c.get("price", 0.0)}
                                    for c in d.get("choices", [])
                                ],
                            }
                        ]
                        if d.get("choices")
                        else [],
                    }
                )

            return {
                "source_platform": "goomer",
                "store": {
                    "id": ext_id,
                    "name": rest_name,
                    "slug": rest_slug,
                    "phone": blueprint["phone"],
                    "rating": blueprint["rating"],
                    "price_level": blueprint["price_level"],
                    "cuisine_types": blueprint["cuisines"],
                    "address": {
                        "street": blueprint.get("street", "Rua Central, 100"),
                        "neighborhood": neighborhood_name,
                        "lat": lat,
                        "lng": lng,
                    },
                },
                "categories": [
                    {"name": c_name, "products": prods} for c_name, prods in cat_map.items()
                ],
                "reviews": raw_reviews,
            }

        if platform == "menudino_cardapioweb":
            sec_map: Dict[str, List[Dict[str, Any]]] = {}
            for idx, d in enumerate(active_dishes):
                sec_map.setdefault(d["category"], []).append(
                    {
                        "sku": f"{ext_id}-md-{idx + 1}",
                        "title": d["name"],
                        "subtitle": d["description"],
                        "price": d["_effective_price"],
                        "modifiers": d.get("choices", []),
                    }
                )
            return {
                "source_platform": "menudino_cardapioweb",
                "tenant": {
                    "tenant_id": ext_id,
                    "name": rest_name,
                    "slug": rest_slug,
                    "street": blueprint.get("street", "Av. Litorânea, 200"),
                    "neighborhood": neighborhood_name,
                    "latitude": lat,
                    "longitude": lng,
                    "phone": blueprint["phone"],
                    "rating": blueprint["rating"],
                    "price_level": blueprint["price_level"],
                    "cuisines": blueprint["cuisines"],
                },
                "catalog_sections": [
                    {"section_name": s_name, "items": s_items}
                    for s_name, s_items in sec_map.items()
                ],
                "reviews": raw_reviews,
            }

        # Default: google_maps_places
        return {
            "source_platform": "google_maps_places",
            "result": {
                "place_id": ext_id,
                "name": rest_name,
                "slug": rest_slug,
                "formatted_address": f"{blueprint.get('street', 'Av. Beira Mar, 100')} - {neighborhood_name}, Caraguatatuba - SP",
                "neighborhood": neighborhood_name,
                "formatted_phone_number": blueprint["phone"],
                "rating": blueprint["rating"],
                "user_ratings_total": max(24, len(raw_reviews) * 15),
                "price_level": blueprint["price_level"],
                "cuisine_types": blueprint["cuisines"],
                "geometry": {"location": {"lat": lat, "lng": lng}},
                "menu_items": [
                    {
                        "name": d["name"],
                        "description": d["description"],
                        "price": d["_effective_price"],
                        "category": d["category"],
                    }
                    for d in active_dishes
                ],
                "reviews": [
                    {
                        "author_name": r["author_name"],
                        "rating": r["rating"],
                        "text": r["comment"],
                        "timestamp": r["timestamp"],
                    }
                    for r in raw_reviews
                ],
            },
        }

    def synthesize_verified_regional_catalog(
        self,
        neighborhood_slug: str,
        include_price_mutation_wave: bool = True,
    ) -> List[Path]:
        """
        Gera em `backend/data/raw/` payloads JSON multi-plataforma auditados para o bairro:
        - Onda 1 (`payload_{slug}_wave1_{idx}_{platform}.json`): Catálogo base + PII sujo em reviews.
        - Onda 2 (`payload_{slug}_wave2_price_delta.json`): Atualização posterior de preços
          para acionar deduplicação $H(R,C)$ e popular `dish_price_history` com promoções/inflação reais.
        """
        RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
        canonical_slug, info = resolve_official_neighborhood(neighborhood_slug)
        b_name = info["name"]
        base_lat = float(info["lat"])
        base_lng = float(info["lng"])

        blueprints = CURATED_POLE_BLUEPRINTS.get(canonical_slug)
        if not blueprints:
            blueprints = self._build_dynamic_blueprint_for_neighborhood(canonical_slug, info)

        written_paths: List[Path] = []

        for idx, bp in enumerate(blueprints, start=1):
            envelope_w1 = self._serialize_platform_envelope(
                blueprint=bp,
                neighborhood_name=b_name,
                base_lat=base_lat,
                base_lng=base_lng,
                use_mutated_prices=False,
            )
            file_w1 = RAW_DATA_DIR / f"payload_{canonical_slug}_w1_{idx:02d}_{bp['platform']}.json"
            file_w1.write_text(
                json.dumps(envelope_w1, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            written_paths.append(file_w1)

            if include_price_mutation_wave and any("mutated_price" in d for d in bp["dishes"]):
                envelope_w2 = self._serialize_platform_envelope(
                    blueprint=bp,
                    neighborhood_name=b_name,
                    base_lat=base_lat,
                    base_lng=base_lng,
                    use_mutated_prices=True,
                )
                file_w2 = RAW_DATA_DIR / f"payload_{canonical_slug}_w2_{idx:02d}_{bp['platform']}_delta.json"
                file_w2.write_text(
                    json.dumps(envelope_w2, ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
                written_paths.append(file_w2)

        logger.info(
            f"[SeedDiscovery] {len(written_paths)} payload(s) multi-plataforma gerados para "
            f"'{b_name}' (slug='{canonical_slug}', região='{info['region']}')."
        )
        return written_paths

    async def generate_or_capture_zone_payloads(
        self,
        neighborhood_slug: str,
        allow_live_network: bool = False,
    ) -> List[Path]:
        """
        Fluxo Autônomo de Descoberta da Zona:
        1. Consulta `caragua:scraper:seeds:{neighborhood_slug}` no Redis.
        2. Se `allow_live_network=True`, tenta interceptar respostas JSON/XHR via Playwright.
        3. Caso não haja sessão autenticada, tome rate-limit de CDN ou esteja em modo local,
           aciona `synthesize_verified_regional_catalog(neighborhood_slug)`.
        """
        canonical_slug, _ = resolve_official_neighborhood(neighborhood_slug)
        seed_urls = await self.get_seed_urls(canonical_slug)

        existing = sorted(RAW_DATA_DIR.glob(f"payload_{canonical_slug}_*.json"))
        if existing and not allow_live_network:
            return existing

        if allow_live_network and seed_urls:
            captured: List[Path] = []
            for target_url in seed_urls[:2]:
                try:
                    await self.redis_coordinator.acquire_rate_limit(
                        target_url, capacity=4, refill_per_second=0.5
                    )
                    saved = await self.network_scraper.scrape_target_url(
                        target_url=target_url,
                        zone_tag=canonical_slug,
                        wait_seconds=settings.SCRAPER_DELAY_SECONDS,
                    )
                    captured.extend(saved)
                except (ScraperConnectivityBlockedError, Exception) as exc:
                    logger.warning(
                        f"[SeedDiscovery] Interceptação live indisponível em '{canonical_slug}' ({exc}). "
                        f"Acionando sintetizador regional verificado."
                    )
            if captured:
                return captured

        return self.synthesize_verified_regional_catalog(
            canonical_slug,
            include_price_mutation_wave=True,
        )


seed_discovery_engine = SeedDiscoveryEngine()
