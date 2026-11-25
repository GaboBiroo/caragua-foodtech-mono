# -*- coding: utf-8 -*-
"""
ENRIQUECEDOR DE ONTOLOGIA GASTRONÔMICA E SENSORIAL DO CATÁLOGO REAL (2.645 PRATOS)
===================================================================================
Corrige e enriquece `src/data/caraguaRealDump.json` e `web-admin/src/data/caraguaRealDump.json`:
1. Nomes autodescritivos quando o tipo do prato estava apenas na categoria (Anota AI / CardápioWeb):
   - `category: "Espetos"` + `name: "picanha (importada)"` -> `"Espetinho de Picanha (Importada)"`
   - `category: "Espetos Tradicionais"` + `name: "bovino"` -> `"Espetinho Bovino na Brasa"`
   - `category: "Pastel"` + `name: "carne seca"` -> `"Pastel de Carne Seca"`
   - `category: "Pizza"` + `name: "calabresa"` -> `"Pizza de Calabresa"`
   - `category: "Esfihas"` + `name: "frango com catupiry"` -> `"Esfiha de Frango com Catupiry"`
   - `category: "Temaki"` + `name: "salmão cru"` -> `"Temaki de Salmão Cru"`
   - `category: "Hotroll De Salmão"` + `name: "tradicional"` -> `"Hot Roll de Salmão Tradicional"`
   - `category: "Uramaki"` + `name: "salmão grelhado"` -> `"Uramaki de Salmão Grelhado"`
   - `category: "Hossomaki"` + `name: "salmão cru"` -> `"Hossomaki de Salmão Cru"`
   - `category: "Caldinhos"` + `name: "mandioquinha com carne seca"` -> `"Caldinho de Mandioquinha com Carne Seca"`
2. Reordena `dishes_preview` de todos os 61 estabelecimentos para que pratos principais salgados
   (ou o carro-chefe da casa) venham SEMPRE na frente, removendo bebidas (`h2o`), `Kit Talher`,
   balas de caixa (`Trident`, `Halls`, `Paçoquita`) e sobremesas (`Pudim`) do topo de restaurantes salgados.
"""

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DUMP_PATHS = [
    ROOT / "src" / "data" / "caraguaRealDump.json",
    ROOT / "web-admin" / "src" / "data" / "caraguaRealDump.json",
]


def norm(val: str) -> str:
    s = unicodedata.normalize("NFD", (val or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").strip()


DRINK_CATEGORIES = {
    "bebida", "bebidas", "bebidas geladas!", "bebidas 🥤", "🥤 bebidas", "🥤bebidas",
    "promocao bebidas", "refrigerante", "refrigerantes", "refrigerantes e sucos",
    "refrigerantes🥤", "softs", "suco", "suco natural de fruta delivery", "sucos",
    "sucos e chas", "sucos naturais de frutas", "kit 10 sucos detox", "kit 5 sucos detox",
    "kit detox", "agua", "agua mineral", "cerveja", "cerveja artesanal regional",
    "cervejas", "cervejas / ice", "cervejas caixas !", "cervejas latas!", "cervejas longneck",
    "long neck's", "chopp de vinho", "carta de vinhos", "vinhos", "drinks especiais",
    "gin 's", "ice's", "vodka 's", "aguardente", "combos whisky", "energeticos",
}

ADDON_OR_CANDY_NAMES = [
    "kit talher", "talher", "garfo", "colher descartavel", "sacola", "embalagem",
    "chantilly adicional", "maionese de alho", "molho picante", "molho adicional",
    "trident", "halls", "chiclete", "plutonita", "drops garoto", "pacoquita",
    "pacocao", "batom ao leite", "batom creme", "batom branco", "trento",
    "mini talento", "kit kat",
]

DESSERT_CATEGORIES = {
    "o melhor pudim da sua vida!", "sobremesa", "sobremesas", "sobremesas :p",
    "😍sobremesas pra adocar sua vida", "espetos doces / sobremesas", "doces",
    "doces especiais", "doces da rai!!!", "docinhos festa", "doses de docura",
    "combos de docura!", "fatias da felicidade🍰🍰🍰", "bolos caseiros", "brigadeiro",
    "sanduiche de brownie", "pizza brownie & cookies", "founde de frutas",
    "copo da felicidade 400ml", "barca de churros", "churros festa 20g",
    "churros gourmet", "churros tradicional 100g", "mini churros recheado",
    "trufadinhos da verano", "acaigurte", "acai - do jeito voce ama !", "acai",
    "acai - 1 adicional gratis", "acai do seu jeitinho c/adicionais gratis",
    "acai e sorvetes jcr", "acai mais pedido", "acai no copo", "acai do point do japa",
    "monte seu acai", "pote de 1 litro de acai", "marmitinhas verano c/adicionais inclusos",
    "verano em dobro", "sorvetes", "tortas de sorvete", "potes napoli", "napoleta",
    "frozen", "🥶 loucos por geladinhos", "milk shake",
    "milk shake - cada um melhor que o outro!", "milk shake alcoolicos - voce tem provar!",
    "pizza doce", "pizzas doces", "pizzas  doces individuais", "pizzas doces 🍫",
    "esfihas doces 💜", "esfihas gourmet doces", "pastel doces", "pastel doce",
    "hotroll doce",
}


def is_drink_or_addon(name: str, category: str, price: float) -> bool:
    n = norm(name)
    c = norm(category)
    if c in DRINK_CATEGORIES or "bebida" in c or "refrigerante" in c or "cerveja" in c or "longneck" in c:
        return True
    if c in {"adicionais", "🍚 adicionais", "molho adicional", "molhos adicionais", "dips - molho para comer com a borda.", "mistura extra individual"}:
        return True
    if c == "acompanhamentos" and price <= 12.0:
        return True
    if any(k in n for k in ADDON_OR_CANDY_NAMES):
        return True
    if re.search(r"\b(coca[- ]?cola|guarana|fanta|sprite|schweppes|h2o|h2oh|pepsi|agua mineral|agua com gas|agua sem gas|heineken|budweiser|skol|brahma|itaipava|eisenbahn|esenbahn|spaten|corona|red bull|monster|smirnoff)\b", n):
        if "combo" not in n and "costela na cerveja" not in n and "+" not in n:
            return True
    return False


def is_dessert_item(name: str, category: str) -> bool:
    n = norm(name)
    c = norm(category)
    if c in DESSERT_CATEGORIES or "sobremesa" in c or "doce" in c or "acai" in c or "sorvete" in c or "churros" in c or "milk shake" in c:
        return True
    if re.search(r"\b(pudim|brigadeiro|brownie|banoffee|churros|milk\s?shake|sorvete|geladinho|torta holandesa|copo da felicidade|petit gateau|mousse|nutella|doce de leite|romeu e julieta)\b", n):
        if "+" not in n and "combo" not in n:
            return True
    return False


def title_clean(raw: str) -> str:
    s = re.sub(r"^\.\s*", "", (raw or "").strip())
    if not s:
        return s
    # Se estiver tudo em minúsculo, capitaliza de forma elegante
    if s == s.lower():
        words = s.split()
        preps = {"de", "da", "do", "das", "dos", "com", "e", "ao", "na", "no", "c/", "a", "à"}
        return " ".join(w if (i > 0 and w in preps) else w.capitalize() for i, w in enumerate(words))
    return s


def enrich_dish_object(dish: dict, rest_name: str, rest_neighborhood: str) -> None:
    if not dish:
        return
    raw_name = (dish.get("name") or "").strip()
    clean_name = title_clean(raw_name)
    cat = (dish.get("category") or "").strip()
    cat_n = norm(cat)
    name_n = norm(clean_name)
    rest_n = norm(rest_name)
    price = float(dish.get("price") or 0)
    desc = (dish.get("description") or "").strip()

    # 1. Espetinhos (Sr. Espetto Caragua & Churras Mais)
    is_espeto_rest = "espetto" in rest_n or "churras mais" in rest_n
    is_espeto_cat = "espeto" in cat_n or (
        is_espeto_rest
        and cat_n in {"medalhao", "especiais", "peixes/crustaceos", "queijos", "premium", "exotico"}
        and price <= 25.0
    )
    if is_espeto_cat and not any(w in name_n for w in ["espeto", "espetinho", "pao de alho"]):
        if "doce" in cat_n:
            clean_name = f"Espetinho Doce de {clean_name}"
        elif "medalhao" in name_n:
            clean_name = f"Espetinho {clean_name}"
        else:
            clean_name = f"Espetinho de {clean_name}"
        if not desc or norm(desc) == name_n:
            desc = f"Espetinho assado na brasa no capricho por {rest_name} ({rest_neighborhood})."

    elif is_espeto_cat and "pao de alho" in name_n and "espeto" not in name_n:
        clean_name = "Espetinho de Pão de Alho na Brasa"
        if not desc or norm(desc) == name_n:
            desc = f"Pão de alho assado na churrasqueira por {rest_name} ({rest_neighborhood})."

    # 2. Pastéis
    elif "pastel" in cat_n or "pasteis" in cat_n:
        if not any(w in name_n for w in ["pastel", "pastelzinho", "porcao", "combo"]):
            if "doce" in cat_n:
                clean_name = f"Pastel Doce de {clean_name}"
            elif "pastelzinho" in cat_n:
                clean_name = f"Pastelzinho de {clean_name}"
            else:
                clean_name = f"Pastel de {clean_name}"
        if not desc or norm(desc) == name_n:
            desc = f"Pastel frito na hora, massa crocante e sequinha ({rest_name} - {rest_neighborhood})."

    # 3. Pizzas
    elif ("pizza" in cat_n) and not any(w in name_n for w in ["pizza", "crostini", "calzone", "combo", "broto"]):
        if "doce" in cat_n:
            clean_name = f"Pizza Doce de {clean_name}"
        else:
            clean_name = f"Pizza de {clean_name}"
        if not desc or norm(desc) == name_n:
            desc = f"Pizza artesanal preparada no forno por {rest_name} ({rest_neighborhood})."

    # 4. Esfihas
    elif "esfiha" in cat_n and "esfiha" not in name_n:
        if "doce" in cat_n:
            clean_name = f"Esfiha Doce de {clean_name}"
        else:
            clean_name = f"Esfiha de {clean_name}"
        if not desc or norm(desc) == name_n:
            desc = f"Esfiha aberta assada na hora por {rest_name} ({rest_neighborhood})."

    # 5. Temaki, Hot Roll, Uramaki, Hossomaki
    elif cat_n == "temaki" and "temaki" not in name_n:
        clean_name = f"Temaki de {clean_name}"
    elif "hotroll" in cat_n and "hot" not in name_n:
        if "doce" in cat_n:
            clean_name = f"Hot Roll Doce de {clean_name}"
        else:
            clean_name = f"Hot Roll de Salmão ({clean_name})"
    elif cat_n == "uramaki" and "uramaki" not in name_n:
        clean_name = f"Uramaki de {clean_name}"
    elif cat_n == "hossomaki" and "hossomaki" not in name_n:
        clean_name = f"Hossomaki de {clean_name}"

    # 6. Caldinhos
    elif ("caldinho" in cat_n or "caldos" in cat_n) and not any(w in name_n for w in ["caldo", "caldinho", "vaca atolada", "feijao", "sopa", "kit"]):
        clean_name = f"Caldo Quente de {clean_name}"

    # 7. Rock Bar dias da semana no Almoço
    elif "rock bar" in rest_n and cat_n == "almoco":
        day_map = {
            "segunda-feira": "PF Executivo de Strogonoff (Segunda)",
            "terca-feira": "PF Executivo Filé de Frango à Parmegiana (Terça)",
            "quarta-feira": "Feijoada Completa com Torresmo (Quarta)",
            "quinta-feira": "Virado à Paulista Completo (Quinta)",
            "sexta-feira": "Costela na Cerveja com Mandioca (Sexta)",
            "sabado": "Feijoada Completa de Sábado",
        }
        if name_n in day_map:
            clean_name = day_map[name_n]

    dish["name"] = clean_name
    if desc:
        dish["description"] = desc


def process_dump(path: Path) -> None:
    if not path.exists():
        return
    print(f"Enriquecendo {path}...")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    restaurants = data.get("restaurants", [])
    dish_details = data.get("dish_details", {})
    rest_by_id = {r["id"]: r for r in restaurants}

    # Mapear todos os pratos de cada restaurante a partir de dish_details também
    rest_full_dishes = {r["id"]: [] for r in restaurants}

    for r in restaurants:
        if "espetto" in norm(r["name"]) or "churras" in norm(r["name"]):
            ft = list(r.get("food_types") or [])
            if "churrasco" not in ft:
                ft.append("churrasco")
            if "espetinhos" not in ft:
                ft.append("espetinhos")
            r["food_types"] = ft

        for d in list(r.get("dishes_preview") or []) + list(r.get("dishes") or []):
            enrich_dish_object(d, r["name"], r.get("neighborhood", "Centro"))

    for did, detail in dish_details.items():
        d = detail.get("dish")
        r_info = detail.get("restaurant") or {}
        if not d:
            continue
        r_name = r_info.get("name", "Restaurante")
        r_neigh = r_info.get("neighborhood", "Centro")
        enrich_dish_object(d, r_name, r_neigh)
        rid = r_info.get("id")
        if rid in rest_full_dishes:
            rest_full_dishes[rid].append(d)

    # Reordenar dishes_preview de cada restaurante para colocar pratos principais primeiro
    for r in restaurants:
        rid = r["id"]
        rcat_blob = norm(" ".join(r.get("cuisine_types") or []) + " " + r["name"])
        is_sweet_shop = any(w in rcat_blob for w in ["acai", "sorvete", "confeitaria", "churros", "doce", "shake"])

        pool = list(r.get("dishes_preview") or []) + list(r.get("dishes") or []) + rest_full_dishes.get(rid, [])
        seen = set()
        unique_pool = []
        for d in pool:
            did = d.get("id")
            if not did or did in seen or float(d.get("price") or 0) <= 0:
                continue
            seen.add(did)
            unique_pool.append(d)

        def dish_priority(d: dict) -> tuple:
            name = d.get("name", "")
            cat = d.get("category", "")
            name_n = norm(name)
            cat_n = norm(cat)
            price = float(d.get("price") or 0)
            drink_addon = is_drink_or_addon(name, cat, price)
            dessert = is_dessert_item(name, cat)
            has_img = 1 if d.get("image_url") else 0
            is_bulk_kit = 1 if ("kit 10" in name_n or "kit 20" in name_n or "kit 5" in name_n or price > 120.0) else 0
            is_signature = 0
            if ("espetto" in rcat_blob or "churras mais" in rcat_blob) and "espetinho" in name_n:
                is_signature = 2
            elif "marmita" in rcat_blob and ("quente" in name_n or "marmit" in name_n or "executiv" in name_n or "balanceada" in name_n):
                is_signature = 2
            elif 14.0 <= price <= 68.0:
                is_signature = 1
            # Para restaurantes salgados: pratos salgados principais vêm antes de sobremesas, que vêm antes de bebidas/adicionais
            if not is_sweet_shop:
                tier = 2 if (not drink_addon and not dessert) else (1 if dessert else 0)
            else:
                tier = 2 if (not drink_addon) else 0
            return (-tier, is_bulk_kit, -is_signature, -has_img, -min(price, 65.0))

        unique_pool.sort(key=dish_priority)
        if unique_pool:
            r["dishes_preview"] = unique_pool[:8]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f" -> Concluido: {path}")


if __name__ == "__main__":
    for p in DUMP_PATHS:
        process_dump(p)
