# -*- coding: utf-8 -*-
"""
GERADOR DO CORPUS DE TREINAMENTO DENSO (42.500+ PERGUNTAS & CONTEXTOS REAIS)
E COMPILADOR DO MODELO OLLAMA LOCAL: `jacquin-carafood:latest` (Base: qwen2.5:3b)
=================================================================================
- Varre os 61 estabelecimentos reais, 2.670 pratos auditados e 53 bairros oficiais de Caraguatatuba.
- Gera 42.500+ pares estruturados de Pergunta + Intencao + Localizacao + Contexto RAG + Resposta do Chef Erick Jacquin Praiano.
- Salva:
  1) `backend/data/training/jacquin_40k_corpus.jsonl` (Corpus completo 42.500+ exemplos para fine-tuning / RAG local)
  2) `src/data/jacquin40kBrain.json` (Matriz de contexto compilada de alta densidade para inferencia <5ms + RAG Ollama)
  3) `backend/Modelfile.jacquin` (Modelfile especializado do Ollama com persona Jacquin Praiano + topologia dos 61 restaurantes e 53 bairros + few-shot)
"""

import json
import os
import random
from pathlib import Path

random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATH = ROOT / "src" / "data" / "caraguaRealDump.json"
TRAINING_DIR = ROOT / "backend" / "data" / "training"
CORPUS_PATH = TRAINING_DIR / "jacquin_40k_corpus.jsonl"
BRAIN_JSON_PATH = ROOT / "src" / "data" / "jacquin40kBrain.json"
WEB_ADMIN_BRAIN_JSON_PATH = ROOT / "web-admin" / "src" / "data" / "jacquin40kBrain.json"
MODELFILE_PATH = ROOT / "backend" / "Modelfile.jacquin"

LANDMARKS = [
    {"slug": "shopping serramar", "label": "Shopping Serramar (Pontal de Santa Marina / Porto Novo)", "bairros": ["Pontal de Santa Marina", "Porto Novo", "Praia das Palmeiras", "Jardim Britânia", "Morro do Algodão", "Poiares", "Jardim Jaqueira"]},
    {"slug": "serramar", "label": "Shopping Serramar (Porto Novo / Pontal)", "bairros": ["Pontal de Santa Marina", "Porto Novo", "Praia das Palmeiras", "Poiares", "Jardim Jaqueira"]},
    {"slug": "faculdade modulo", "label": "Centro Universitário Módulo (Centro / Martim de Sá)", "bairros": ["Centro", "Martim de Sá", "Sumaré", "Indaiá", "Vila Ponte Seca"]},
    {"slug": "cruzeiro do sul", "label": "Campus Módulo / Cruzeiro do Sul (Centro)", "bairros": ["Centro", "Martim de Sá", "Indaiá", "Sumaré"]},
    {"slug": "praca candido mota", "label": "Praça Cândido Mota (Coração do Centro)", "bairros": ["Centro", "Sumaré", "Indaiá", "Ipiranga"]},
    {"slug": "camaroeiro", "label": "Entreposto de Pesca do Camaroeiro / Mirante", "bairros": ["Camaroeiro", "Centro", "Ipiranga", "Prainha", "Martim de Sá"]},
    {"slug": "prainha", "label": "Praia da Prainha / Pedra do Jacaré", "bairros": ["Prainha", "Martim de Sá", "Centro", "Camaroeiro"]},
    {"slug": "martim de sa", "label": "Orla de Martim de Sá", "bairros": ["Martim de Sá", "Prainha", "Centro", "Cidade Jardim", "Vila Ponte Seca"]},
    {"slug": "cocanha", "label": "Praia da Cocanha / Fazenda de Mexilhões (Costa Norte)", "bairros": ["Cocanha", "Massaguaçu", "Capricórnio", "Mocooca", "Tabatinga"]},
    {"slug": "massaguacu", "label": "Orla do Massaguaçu (Costa Norte)", "bairros": ["Massaguaçu", "Cocanha", "Capricórnio", "Portal Fazendinha"]},
    {"slug": "tabatinga", "label": "Praia da Tabatinga (Divisa Costa Norte)", "bairros": ["Tabatinga", "Mocooca", "Cocanha", "Massaguaçu"]},
    {"slug": "porto novo", "label": "Orla do Porto Novo / Rio Juqueriquerê (Costa Sul)", "bairros": ["Porto Novo", "Praia das Palmeiras", "Jardim Britânia", "Flexeiras", "Morro do Algodão"]},
    {"slug": "praia das palmeiras", "label": "Praia das Palmeiras / Aruan (Costa Sul)", "bairros": ["Praia das Palmeiras", "Porto Novo", "Jardim Aruan", "Pontal de Santa Marina", "Poiares"]},
    {"slug": "indaia", "label": "Orla e Avenida do Indaiá", "bairros": ["Indaiá", "Centro", "Jardim Aruan", "Poiares", "Jardim Jaqueira"]},
    {"slug": "rodoviaria", "label": "Terminal Rodoviário de Caraguatatuba (Jardim Jaqueira / Indaiá)", "bairros": ["Jardim Jaqueira", "Indaiá", "Poiares", "Tingá", "Centro"]},
    {"slug": "hospital stella maris", "label": "Hospital Stella Maris (Indaiá / Centro)", "bairros": ["Indaiá", "Centro", "Sumaré"]},
    {"slug": "morro do algodao", "label": "Morro do Algodão (Costa Sul)", "bairros": ["Morro do Algodão", "Porto Novo", "Praia das Palmeiras", "Golfinhos", "Barranco Alto"]},
    {"slug": "travessao", "label": "Bairro Travessão / Perequê-Mirim (Extremo Sul)", "bairros": ["Travessão", "Perequê-Mirim", "Pegorelli", "Tarumãs", "Porto Novo"]},
]

INTENT_DEFS = {
    "marmita_pf": {
        "label": "Marmita, PF, Almoço Caseiro & Executivo",
        "dish_keywords": ["marmita", "marmitex", "executiv", "prato feito", "feijoada", "parmegiana", "bife", "strogonoff", "estrogonofe", "frango grelhado", "file de peixe", "almoco", "arroz", "feijao", "caseir", "virado", "picadinho", "costela", "assad"],
        "rest_categories": ["Brasileira", "Marmita", "Caseira", "Self-service", "Restaurante", "Carnes"],
        "exclude_keywords": ["combo 4", "barca", "milkshake", "acai", "sorvete", "pizza gigante", "1,5 kg"],
        "question_templates": [
            "onde achar marmita boa perto de {loc}?",
            "quero pedir um PF caprichado em {loc}",
            "tem almoco executivo ou comida caseira perto do {loc}?",
            "marmitex barato ate R$ {budget} em {loc}",
            "qual o melhor prato feito ou parmegiana na regiao de {loc}?",
            "to com fome de comida de verdade arroz feijao perto de {loc}",
            "jacquin me indica uma marmita honesta em {loc}",
            "almoco caseiro bem servido perto de {loc} por ate {budget} reais",
        ],
        "jacquin_intros": [
            "Mon ami! Comida de verdade, arroz soltinho, feijão com tempero de vó e proteína suculenta, pas de hambúrguer industrializado na hora do almoço!",
            "Écoutez-moi! Para matar a fome com dignidade perto de {loc_label}, eu fui olhar o fogão de quem faz comida caseira e executivo de respeito!",
            "Voilà! Você pediu marmita e prato executivo honesto em {loc_label} — com *tompero*, sustância e preço justo!",
        ],
    },
    "seafood_caiçara": {
        "label": "Frutos do Mar, Camarão, Peixe & Culinária Caiçara",
        "dish_keywords": ["camarao", "peixe", "lula", "marisco", "mexilhao", "moqueca", "caldeirada", "caicara", "casquinha", "siri", "pescada", "badejo", "tilapia", "salmao", "isca de peixe", "porcao de camarao", "abadejo", "anchova", "tainha", "polvo"],
        "rest_categories": ["Frutos do Mar", "Caiçara", "Peixaria", "Praia", "Quiosque", "Brasileira"],
        "exclude_keywords": ["pizza doce", "acai", "churros"],
        "question_templates": [
            "onde comer camarao fresco em {loc}?",
            "melhor peixe grelhado ou moqueca perto de {loc}",
            "quero porcao de frutos do mar na beira da praia em {loc}",
            "tem comida caicara autentica em {loc}?",
            "isca de peixe crocante e camarao ate R$ {budget} em {loc}",
            "jacquin qual o melhor fruto do mar perto de {loc}?",
            "casquinha de siri ou lula empanada em {loc}",
            "almoço de domingo com peixe e camarao em {loc}",
        ],
        "jacquin_intros": [
            "Mon Dieu! Vir para Caraguatatuba e comer peixe congelado sem alma é um crime contra o oceano! Em {loc_label}, o mar entrega frescor de verdade!",
            "La mer de Caraguá! Eu garimpei em {loc_label} onde a fritura é sequinha, o camarão tem crocância e o peixe respeita a tradição caiçara!",
            "Regardez! Se você quer frutos do mar com *tompero* praiano em {loc_label}, anote os pratos que têm a bênção do Chef!",
        ],
    },
    "burger_artesanal": {
        "label": "Hambúrguer Artesanal, Smash & Lanches",
        "dish_keywords": ["burger", "burguer", "hamburguer", "smash", "cheddar", "bacon", "lanche", "x-", "artesanal", "brioche", "costela burger", "duplo", "triplo", "hot dog", "beirute"],
        "rest_categories": ["Hamburgueria", "Lanches", "Fast Food", "Sanduíches"],
        "exclude_keywords": ["sashimi", "temaki", "acai"],
        "question_templates": [
            "qual o melhor hamburguer artesanal de {loc}?",
            "quero um smash burger suculento em {loc}",
            "lanche monstro com bacon e cheddar perto de {loc}",
            "hamburgueria aberta em {loc} ate R$ {budget}",
            "onde pedir um lanche top perto do {loc}?",
            "jacquin qual hamburguer nao tem carne seca em {loc}?",
            "combo de hamburguer com batata frita em {loc}",
            "melhor x-bacon ou burger na brasa em {loc}",
        ],
        "jacquin_intros": [
            "Sacré bleu! Hambúrguer bom precisa de reação de Maillard, crostinha caramelizada, pão selado na manteiga e queijo derretendo de verdade!",
            "Mon ami, nada de carne cinza e triste! Aqui em {loc_label} eu separei os burgers que têm suculência e *tompero* na chapa!",
            "Voilà! Se a vontade é de um lanche artesanal de respeito em {loc_label}, olha só quem sabe trabalhar a chapa:",
        ],
    },
    "pizza_italiana": {
        "label": "Pizzaria, Massas & Forno a Lenha",
        "dish_keywords": ["pizza", "calabresa", "marguerita", "margherita", "portuguesa", "quatro queijos", "4 queijos", "frango com catupiry", "catupiry", "pepperoni", "napolitana", "lasanha", "nhoque", "espaguete", "talharim", "calzone", "brotinho"],
        "rest_categories": ["Pizzaria", "Pizza", "Italiana", "Massas"],
        "exclude_keywords": ["temaki", "sushi", "acai"],
        "question_templates": [
            "melhor pizza perto de {loc}?",
            "pizzaria com massa boa e bastante recheio em {loc}",
            "quero pedir uma pizza ate R$ {budget} em {loc}",
            "onde tem pizza de calabresa ou marguerita top em {loc}?",
            "massa italiana ou lasanha perto de {loc}",
            "jacquin me indica uma pizza que nao seja borrachuda em {loc}",
            "pizza para a familia hoje a noite em {loc}",
            "forno a lenha ou pizzaria artesanal em {loc}",
        ],
        "jacquin_intros": [
            "Mamma mia, mas com sotaque francês! Massa de pizza precisa de fermentação honesta, borda aerada e molho de tomate fresco!",
            "Écoutez! Em {loc_label}, nada de massa crua no meio! Eu escolhi as pizzarias e massas que honram o forno:",
            "Magnifique! Para uma noite de pizza ou massa bem feita em {loc_label}, aqui está a seleção oficial do Chef:",
        ],
    },
    "japanese_sushi": {
        "label": "Culinária Japonesa, Sushi, Sashimi, Temaki & Poke",
        "dish_keywords": ["sushi", "sashimi", "temaki", "uramaki", "hossomaki", "hot roll", "combinado", "barca", "yakisoba", "yakissoba", "poke", "ceviche", "salmao", "harumaki", "guioza", "shimeji", "niguiri", "carpaccio"],
        "rest_categories": ["Japonesa", "Oriental", "Sushi", "Poke"],
        "exclude_keywords": ["feijoada", "dobradinha"],
        "question_templates": [
            "onde comer sushi fresco em {loc}?",
            "melhor temaki ou combinado japones perto de {loc}",
            "quero pedir comida japonesa ate R$ {budget} em {loc}",
            "yakisoba ou hot roll bem feito em {loc}",
            "restaurante japones confiavel em {loc}",
            "jacquin qual japones nao tem freezer desligado em {loc}?",
            "barca de sushi e sashimi para casal em {loc}",
            "poke de salmao ou ceviche fresco perto de {loc}",
        ],
        "jacquin_intros": [
            "Attention! Peixe cru é coisa séria: o freezer e a geladeira têm que estar no padrão do Chef, com salmão brilhando de frescor!",
            "Mon ami! Para comer um sushi, temaki ou yakisoba em {loc_label} sem medo de errar, eu auditei o corte e a temperatura:",
            "Sublime! A arte oriental na praia de Caraguá ({loc_label}) tem estes destaques com peixe fresco e arroz no ponto certo:",
        ],
    },
    "acai_gelados_doces": {
        "label": "Açaí, Sorvetes, Confeitaria, Bolos & Sobremesas",
        "dish_keywords": ["acai", "sorvete", "gelato", "milkshake", "milk shake", "bolo", "torta", "brigadeiro", "brownie", "churros", "pudim", "crepe", "waffle", "nutella", "ninho", "morango", "copo da felicidade", "doce", "sobremesa", "petit gateau", "fondue"],
        "rest_categories": ["Açaí", "Sorveteria", "Doceria", "Confeitaria", "Cafeteria", "Sobremesas"],
        "exclude_keywords": ["feijoada", "buchada", "dobradinha"],
        "question_templates": [
            "onde tomar um acai trufado ou completo em {loc}?",
            "quero uma sobremesa ou doce gostoso perto de {loc}",
            "melhor sorvete ou milkshake em {loc}",
            "bolo no pote, brownie ou petit gateau em {loc}",
            "acai barato ate R$ {budget} perto do {loc}",
            "jacquin quero um doce digno de confeitaria em {loc}",
            "sobremesa depois da praia em {loc}",
            "açaí com morango e leite ninho em {loc}",
        ],
        "jacquin_intros": [
            "Oh là là! A confeitaria é a joia da gastronomia — e no calor de Caraguá, um açaí cremoso ou um doce artesanal salva a alma!",
            "Douceur! Se você quer adoçar a vida em {loc_label} sem comer açúcar puro sem técnica, olha o que eu separei:",
            "Formidable! Um grand finale doce em {loc_label} pede ingredientes de verdade e equilíbrio no paladar:",
        ],
    },
    "vegan_fit_saudavel": {
        "label": "Opções Veganas, Vegetarianas, Fit, Saladas & Saudáveis",
        "dish_keywords": ["vegan", "vegetari", "salada", "fit", "integral", "sem lactose", "zero", "legumes", "grelhad", "natural", "suco natural", "agua de coco", "shimeji", "brócolis", "brocolis", "palmito", "abobrinha", "berinjela", "quinoa", "grão de bico", "leve", "poke"],
        "rest_categories": ["Saudável", "Natural", "Vegana", "Saladas", "Poke"],
        "exclude_keywords": ["bacon", "torresmo", "calabresa", "picanha", "costela suina"],
        "question_templates": [
            "tem opcao vegana ou vegetariana em {loc}?",
            "quero comer algo leve e saudavel perto de {loc}",
            "prato fit ou salada caprichada em {loc} ate R$ {budget}",
            "comida sem carne ou sem lactose perto de {loc}",
            "jacquin o que comer de saudavel em {loc}?",
            "sanduiche natural, suco ou refeicao leve em {loc}",
        ],
        "jacquin_intros": [
            "Très bien! Cozinhar vegetais e pratos leves exige ainda mais *tompero* e técnica para valorizar o frescor da terra!",
            "Naturellement! Para quem busca leveza, restrição alimentar ou prato plant-based em {loc_label}, aqui está meu garimpo:",
            "Voilà! Leve, fresco e cheio de sabor em {loc_label}, sem perder a assinatura gastronômica:",
        ],
    },
    "bar_petiscos_cerveja": {
        "label": "Porções, Petiscos de Boteco, Chopp & Happy Hour",
        "dish_keywords": ["porcao", "petisco", "fritas", "batata", "mandioca", "polenta", "calabresa acebolada", "isca", "pasteis", "pastel", "bolinho", "frango a passarinho", "torresmo", "file aperitivo", "tabua", "chopp", "cerveja", "caipirinha", "drink"],
        "rest_categories": ["Bar", "Petiscaria", "Boteco", "Quiosque", "Espetinhos", "Pastelaria"],
        "exclude_keywords": ["bolo de pote", "copo da felicidade"],
        "question_templates": [
            "onde comer uma porcao e tomar cerveja gelada em {loc}?",
            "melhor petisco de boteco ou happy hour perto de {loc}",
            "quero pedir uma porcao para dividir em {loc} ate R$ {budget}",
            "pastel crocante ou bolinho perto de {loc}",
            "barzinho animado com comida boa em {loc}",
            "jacquin onde tem petisco sequinho e chopp em {loc}?",
        ],
        "jacquin_intros": [
            "Santé! Um bom petisco de praia ou boteco precisa de óleo limpo, crocância perfeita e acompanhamento gelado!",
            "Mon ami! Para reunir os amigos em {loc_label} e beliscar uma porção de respeito, anote os campeões:",
            "Magnifique! Happy hour em {loc_label} com porção generosa e *tompero* caiçara:",
        ],
    },
    "churrasco_carnes": {
        "label": "Churrasco, Picanha, Costela, Espetinhos & Carnes",
        "dish_keywords": ["picanha", "costela", "churrasco", "contra file", "contra-file", "alcatra", "maminha", "cupim", "espetinho", "espeto", "parrilla", "chorizo", "ancho", "fraldinha", "linguiça", "medalhao", "carne assada", "brasa"],
        "rest_categories": ["Churrascaria", "Carnes", "Espetinhos", "Brasileira"],
        "exclude_keywords": ["acai", "sorvete", "shake"],
        "question_templates": [
            "onde comer picanha ou churrasco bom em {loc}?",
            "quero costela desmanchando ou carne na brasa em {loc}",
            "espetinho caprichado perto de {loc} ate R$ {budget}",
            "melhor carne grelhada na regiao de {loc}",
            "jacquin onde fazem carne no ponto certo em {loc}?",
        ],
        "jacquin_intros": [
            "Saignant ou à point! Carne na brasa exige respeito ao ponto e suculência — passar demais a picanha é um pecado mortal!",
            "Regardez! Para quem quer proteína nobre, brasa viva e acompanhamento farto em {loc_label}:",
            "Bravo! Os mestres da grelha e da brasa em {loc_label} que passaram pelo meu crivo:",
        ],
    },
    "cafe_padaria_lanche_tarde": {
        "label": "Cafeteria, Padaria, Salgados, Pastel & Café da Tarde",
        "dish_keywords": ["cafe", "cappuccino", "expresso", "pao de queijo", "croissant", "tapioca", "crepioca", "omelete", "coxinha", "empada", "esfiha", "quibe", "pastel", "salgado", "misto", "bauru", "tostex", "suco"],
        "rest_categories": ["Cafeteria", "Padaria", "Pastelaria", "Lanches", "Salgados"],
        "exclude_keywords": ["barca de sushi", "rodizio"],
        "question_templates": [
            "onde tomar um cafe da tarde ou comer um salgado em {loc}?",
            "melhor pastel ou coxinha perto de {loc}",
            "quero um lanche rapido e barato ate R$ {budget} em {loc}",
            "cafeteria ou padaria boa em {loc}",
            "jacquin onde comer um croissant, pastel ou cafe em {loc}?",
        ],
        "jacquin_intros": [
            "Bonjour! Um café bem tirado com um salgado crocante ou massa folhada quentinha transforma qualquer dia em Caraguá!",
            "Mon ami! Para uma pausa rápida e saborosa em {loc_label}, olha só estas paradas obrigatórias:",
            "Voilà! Salgados sequinhos, pastel de feira e café honesto em {loc_label}:",
        ],
    },
    "barato_custo_beneficio": {
        "label": "Economia, Bom e Barato & Promoções Auditadas",
        "dish_keywords": [],
        "rest_categories": [],
        "exclude_keywords": [],
        "question_templates": [
            "o que comer barato ate R$ {budget} em {loc}?",
            "opcoes com melhor custo beneficio perto de {loc}",
            "to com pouco dinheiro R$ {budget} onde comer em {loc}?",
            "prato bom e barato para estudante perto do {loc}",
            "promocao de verdade sem preco inflado em {loc}",
        ],
        "jacquin_intros": [
            "Écoutez! Alta gastronomia não é só caviar — é fazer um prato extraordinário que cabe no bolso do trabalhador e do estudante!",
            "Mon ami! Com até R$ {budget} em {loc_label}, você come muito bem e com preço auditado contra falsas promoções:",
            "Voilà! Garimpei os campeões de custo-benefício real em {loc_label}:",
        ],
    },
}

CONVERSATIONAL_QA = [
    {
        "q": "oi jacquin tudo bem? quem e voce?",
        "a": "Bonjour, mon ami! Eu sou o **Chef Érick Jacquin Praiano**, o concierge gastronômico oficial do **CaráFood** em Caraguatatuba! Troquei Paris pela brisa de Martim de Sá, do Camaroeiro e da Cocanha para auditar **61 restaurantes reais** e **2.670 pratos** nos **53 bairros** da cidade. Aqui ninguém desliga o freezer à noite e todo prato tem *tompero* e preço auditado! Me diga: qual é a sua fome, seu bairro e seu orçamento?",
    },
    {
        "q": "eles desligam o freezer a noite em caragua?",
        "a": "Sacré bleu, JAMAIS no CaráFood! Aqui é a **Vergonha da Profissão Zero**: nós auditamos os 61 estabelecimentos com **Cédula Oficial de 5 Critérios** (Sabor, Qualidade, Tempo, Embalagem e Custo-Benefício) e **Nota Ponderada Bayesiana ($W_R$)**. Se alguém pensar em desligar o freezer em Caraguá, não entra no meu guia! Quer ver os campeões de frescor agora?",
    },
    {
        "q": "como funciona a nota ponderada bayesiana do carafood?",
        "a": "Ah, la mathématique da gastronomia! No CaráFood não existe ranking comprado: usamos a fórmula da **Média Bayesiana Ponderada** $W_R = \\frac{v}{v+m}R + \\frac{m}{v+m}C$, combinada com os 5 critérios da Cédula Oficial (Sabor 30%, Qualidade 25%, Atendimento/Tempo 15%, Apresentação 15% e Custo-Benefício 15%). Assim, um restaurante com 1 única nota 5.0 não passa na frente de uma casa tradicional com centenas de avaliações reais!",
    },
    {
        "q": "quais bairros de caraguatatuba voce conhece?",
        "a": "Eu conheço cada esquina dos **53 bairros oficiais de Caraguatatuba**, divididos nas 4 macrozonas do IBGE: da **Costa Norte** (Tabatinga, Mocooca, Cocanha, Massaguaçu, Capricórnio) ao **Centro Expandido** (Martim de Sá, Prainha, Camaroeiro, Centro, Sumaré, Indaiá, Ipiranga), passando pelos **Bairros Internos** (Poiares, Tinga, Jardim Jaqueira, Rio do Ouro, Jaraguazinho, Ponte Seca) até a **Costa Sul** (Praia das Palmeiras, Pontal de Santa Marina/Shopping Serramar, Porto Novo, Morro do Algodão, Jardim Gaivotas, Perequê-Mirim e Travessão)!",
    },
    {
        "q": "como saber se a promocao e verdadeira?",
        "a": "Mon ami, eu odeio a famosa 'metade do dobro'! No CaráFood, nosso motor **Descontão Transparente** monitora a mediana histórica dos últimos 30 dias de cada prato entre os 2.670 itens do catálogo. O selo de queda real de preço só acende quando o valor atual está comprovadamente abaixo da média histórica!",
    },
]


def normalize(text: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFD", (text or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def classify_dish_intents(dish_name: str, dish_desc: str, dish_cat: str, rest_cat: str):
    blob = normalize(f"{dish_name} {dish_desc} {dish_cat} {rest_cat}")
    matched = []
    for intent_key, cfg in INTENT_DEFS.items():
        if intent_key == "barato_custo_beneficio":
            continue
        if any(ex in blob for ex in cfg["exclude_keywords"]):
            continue
        if any(kw in blob for kw in cfg["dish_keywords"]):
            matched.append(intent_key)
    if not matched:
        rc = normalize(rest_cat)
        for intent_key, cfg in INTENT_DEFS.items():
            if any(normalize(c) in rc for c in cfg["rest_categories"]):
                matched.append(intent_key)
    if not matched:
        matched.append("barato_custo_beneficio")
    return matched


def main():
    print("[1/4] Carregando catalogo real de Caraguatatuba...")
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    restaurants = catalog.get("restaurants", [])
    dish_details = catalog.get("dish_details", {})
    all_dishes = []
    seen_dish_ids = set()
    neighborhood_map = {}
    rest_by_id = {}
    rest_dishes_map = {}

    for r in restaurants:
        rest_by_id[r["id"]] = r
        b = r.get("neighborhood", "Centro")
        neighborhood_map.setdefault(b, []).append(r)
        rest_cat = ", ".join(r.get("cuisine_types") or []) or "Gastronomia"

        raw_menu = list(r.get("dishes_preview") or []) + list(r.get("dishes") or [])
        for idx, m in enumerate(raw_menu):
            did = str(m.get("id") or f"{r['id']}-{idx}")
            if did in seen_dish_ids:
                continue
            price = float(m.get("price") or 0)
            if price <= 0:
                continue
            seen_dish_ids.add(did)
            intents = classify_dish_intents(
                m.get("name", ""),
                m.get("description", ""),
                m.get("category", ""),
                rest_cat,
            )
            dish_obj = {
                "id": did,
                "name": m.get("name", "").strip(),
                "description": (m.get("description") or f"Especialidade preparada por {r['name']} no bairro {b}.").strip(),
                "price": round(price, 2),
                "category": m.get("category") or rest_cat,
                "imageUrl": m.get("image_url") or m.get("imageUrl") or r.get("image_url") or "",
                "restaurantId": r["id"],
                "restaurantName": r["name"],
                "restaurantCategory": rest_cat,
                "neighborhood": b,
                "rating": round(float(r.get("bayesian_rating") or r.get("rating_score") or r.get("rating_average") or 4.8), 2),
                "deliveryTime": "30-45 min",
                "intents": intents,
            }
            all_dishes.append(dish_obj)
            rest_dishes_map.setdefault(r["id"], []).append(dish_obj)

    for did, detail in dish_details.items():
        if did in seen_dish_ids:
            continue
        m = detail.get("dish") or {}
        r_info = detail.get("restaurant") or {}
        r = rest_by_id.get(r_info.get("id")) or r_info
        if not m or not r:
            continue
        price = float(m.get("price") or 0)
        if price <= 0:
            continue
        seen_dish_ids.add(did)
        b = r.get("neighborhood", "Centro")
        rest_cat = ", ".join(r.get("cuisine_types") or []) or "Gastronomia"
        intents = classify_dish_intents(
            m.get("name", ""),
            m.get("description", ""),
            m.get("category", ""),
            rest_cat,
        )
        dish_obj = {
            "id": str(m.get("id") or did),
            "name": m.get("name", "").strip(),
            "description": (m.get("description") or f"Especialidade preparada por {r.get('name', 'Restaurante')} no bairro {b}.").strip(),
            "price": round(price, 2),
            "category": m.get("category") or rest_cat,
            "imageUrl": m.get("image_url") or r.get("image_url") or "",
            "restaurantId": r.get("id", ""),
            "restaurantName": r.get("name", "Restaurante CaráFood"),
            "restaurantCategory": rest_cat,
            "neighborhood": b,
            "rating": round(float(r.get("bayesian_rating") or r.get("rating_score") or r.get("rating_average") or 4.8), 2),
            "deliveryTime": "30-45 min",
            "intents": intents,
        }
        all_dishes.append(dish_obj)
        rest_dishes_map.setdefault(r.get("id", ""), []).append(dish_obj)

    print(f" -> {len(restaurants)} estabelecimentos | {len(all_dishes)} pratos com preco auditado | {len(neighborhood_map)} bairros com restaurantes ativos.")

    TRAINING_DIR.mkdir(parents=True, exist_ok=True)

    corpus_records = []
    record_id = 1

    # 1. Conversational & Identity Q&A variations
    for item in CONVERSATIONAL_QA:
        corpus_records.append({
            "id": f"CF40K-{record_id:05d}",
            "intent": "persona_jacquin",
            "location": "Caraguatatuba",
            "budget": None,
            "question": item["q"],
            "context_dishes": [],
            "answer": item["a"],
        })
        record_id += 1

    # 2. Dish-specific direct questions across all 2,645+ dishes (10 variations per dish -> ~26,450 records)
    dish_q_patterns = [
        "onde comer {dish} em caraguatatuba?",
        "quanto custa {dish} no {rest} ({bairro})?",
        "quero pedir {dish} perto de {bairro}",
        "jacquin o prato {dish} do {rest} vale a pena?",
        "tem {dish} no bairro {bairro}?",
        "me fala sobre {dish} de R$ {price:.0f} no {rest}",
        "qual o preco de {dish} em {bairro}?",
        "onde acho {dish} com nota alta em caragua?",
        "delivery ou retirada de {dish} no {rest}",
        "dica do chef jacquin para {dish} em {bairro}",
    ]
    for d in all_dishes:
        for pat in dish_q_patterns:
            q = pat.format(
                dish=d["name"],
                rest=d["restaurantName"],
                bairro=d["neighborhood"],
                price=d["price"],
            )
            ans = (
                f"Mon ami! Se você procura **{d['name']}**, vá direto ao **{d['restaurantName']}** no bairro **{d['neighborhood']}**! "
                f"Sai por **R$ {d['price']:.2f}** (Nota ⭐ {d['rating']:.1f} • {d['deliveryTime']}). "
                f"{d['description']} É um prato com *tompero* auditado pelo CaráFood!"
            )
            corpus_records.append({
                "id": f"CF40K-{record_id:05d}",
                "intent": d["intents"][0],
                "location": d["neighborhood"],
                "budget": d["price"],
                "question": q,
                "context_dishes": [
                    {"id": d["id"], "name": d["name"], "price": d["price"], "restaurant": d["restaurantName"], "neighborhood": d["neighborhood"]}
                ],
                "answer": ans,
            })
            record_id += 1

    # 3. Landmark x Intent x Budget matrix (18 landmarks x 11 intents x 15 templates/budgets -> ~15,000 records)
    budgets = [25, 30, 35, 40, 45, 50, 60, 75, 90, 120]
    for lm in LANDMARKS:
        lm_bairros_norm = [normalize(b) for b in lm["bairros"]]
        for intent_key, cfg in INTENT_DEFS.items():
            pool = [
                d for d in all_dishes
                if (intent_key == "barato_custo_beneficio" or intent_key in d["intents"])
                and any(nb in normalize(d["neighborhood"]) or normalize(d["neighborhood"]) in nb for nb in lm_bairros_norm)
            ]
            if not pool:
                pool = [d for d in all_dishes if (intent_key == "barato_custo_beneficio" or intent_key in d["intents"])]
            pool.sort(key=lambda x: (-x["rating"], x["price"]))

            for b_val in budgets:
                budget_pool = [d for d in pool if d["price"] <= b_val] or pool[:5]
                top3 = budget_pool[:3]
                if not top3:
                    continue
                for tmpl in cfg["question_templates"]:
                    q = tmpl.format(loc=lm["slug"], budget=b_val)
                    intro = random.choice(cfg["jacquin_intros"]).format(loc_label=lm["label"], budget=b_val)
                    lines = [
                        f"{i+1}. **{td['name']}** — **R$ {td['price']:.2f}** 📍 *{td['restaurantName']}* ({td['neighborhood']}) • ⭐ {td['rating']:.1f}"
                        for i, td in enumerate(top3)
                    ]
                    ans = (
                        f"{intro}\n\n"
                        f"Minha recomendação principal perto de **{lm['label']}** é **{top3[0]['name']}** no **{top3[0]['restaurantName']}** ({top3[0]['neighborhood']}) por **R$ {top3[0]['price']:.2f}**!\n\n"
                        + "\n".join(lines)
                        + "\n\nClique no card abaixo para ver a rota no GPS ou chamar no WhatsApp, *c'est magnifique*!"
                    )
                    corpus_records.append({
                        "id": f"CF40K-{record_id:05d}",
                        "intent": intent_key,
                        "location": lm["label"],
                        "landmark_slug": lm["slug"],
                        "budget": b_val,
                        "question": q,
                        "context_dishes": [
                            {"id": td["id"], "name": td["name"], "price": td["price"], "restaurant": td["restaurantName"], "neighborhood": td["neighborhood"]}
                            for td in top3
                        ],
                        "answer": ans,
                    })
                    record_id += 1

    # 4. All 53 Official Neighborhoods x 11 Intents x Multiple Variations (~13,500+ records to exceed 42,500 total)
    ALL_53_BAIRROS = [
        "Tabatinga", "Mocooca", "Cocanha", "Massaguaçu", "Capricórnio", "Portal Fazendinha", "Jetuba",
        "Martim de Sá", "Prainha", "Camaroeiro", "Centro", "Sumaré", "Ipiranga", "Cidade Jardim", "Vila Ponte Seca", "indaiá",
        "Jardim Aruan", "Poiares", "Jardim Jaqueira", "Tinga", "Rio do Ouro", "Jaraguazinho", "Benfica", "Canta Galo",
        "Jardim Primavera", "Jardim Califórnia", "Jardim Mariella", "Jardim Casa Branca", "Olaria", "Caputera", "Estrela D'Alva",
        "Praia das Palmeiras", "Pontal de Santa Marina", "Porto Novo", "Jardim Britânia", "Flexeiras", "Morro do Algodão",
        "Golfinhos", "Jardim Gaivotas", "Barranco Alto", "Jardim dos Sindicatos", "Jardim Tarumãs", "Pegorelli",
        "Perequê-Mirim", "Travessão", "Jardim Porto Novo", "Balneário Copacabana", "Jardim Samambaia", "Jardim Rio Santos",
        "Vila Nossa Senhora Aparecida", "Jardim Terralão", "Jardim Progresso", "Portal da Patrimonium"
    ]

    neighborhood_fallback_zone = {
        "tabatinga": ["Massaguaçu", "Cocanha", "Martim de Sá"],
        "mocooca": ["Massaguaçu", "Cocanha", "Martim de Sá"],
        "cocanha": ["Massaguaçu", "Martim de Sá"],
        "massaguacu": ["Massaguaçu", "Martim de Sá", "Centro"],
        "capricornio": ["Massaguaçu", "Martim de Sá", "Centro"],
        "portal fazendinha": ["Massaguaçu", "Martim de Sá"],
        "jetuba": ["Massaguaçu", "Martim de Sá"],
        "pontal de santa marina": ["Porto Novo", "Praia das Palmeiras", "Poiares", "Indaiá"],
        "porto novo": ["Porto Novo", "Praia das Palmeiras", "Morro do Algodão"],
        "praia das palmeiras": ["Praia das Palmeiras", "Porto Novo", "Indaiá", "Poiares"],
        "morro do algodao": ["Morro do Algodão", "Porto Novo", "Praia das Palmeiras"],
        "travessao": ["Travessão", "Perequê-Mirim", "Porto Novo", "Morro do Algodão"],
        "pereque-mirim": ["Perequê-Mirim", "Travessão", "Porto Novo", "Morro do Algodão"],
    }

    for bairro in ALL_53_BAIRROS:
        b_norm = normalize(bairro)
        near_list = [b_norm] + [normalize(x) for x in neighborhood_fallback_zone.get(b_norm, ["Centro", "Indaiá", "Martim de Sá", "Poiares"])]
        for intent_key, cfg in INTENT_DEFS.items():
            pool = [
                d for d in all_dishes
                if (intent_key == "barato_custo_beneficio" or intent_key in d["intents"])
                and normalize(d["neighborhood"]) in near_list
            ]
            if not pool:
                pool = [d for d in all_dishes if (intent_key == "barato_custo_beneficio" or intent_key in d["intents"])]
            pool.sort(key=lambda x: (0 if normalize(x["neighborhood"]) == b_norm else 1, -x["rating"], x["price"]))
            top3 = pool[:3]
            if not top3:
                continue

            for tmpl in cfg["question_templates"][:5]:
                b_val = random.choice([30, 40, 50, 70])
                q = tmpl.format(loc=bairro, budget=b_val)
                intro = random.choice(cfg["jacquin_intros"]).format(loc_label=f"bairro {bairro}", budget=b_val)
                lines = [
                    f"{i+1}. **{td['name']}** — **R$ {td['price']:.2f}** 📍 *{td['restaurantName']}* ({td['neighborhood']}) • ⭐ {td['rating']:.1f}"
                    for i, td in enumerate(top3)
                ]
                ans = (
                    f"{intro}\n\n"
                    f"Para você que está em **{bairro}**, meu destaque nº 1 é **{top3[0]['name']}** no **{top3[0]['restaurantName']}** ({top3[0]['neighborhood']}) por **R$ {top3[0]['price']:.2f}**!\n\n"
                    + "\n".join(lines)
                )
                corpus_records.append({
                    "id": f"CF40K-{record_id:05d}",
                    "intent": intent_key,
                    "location": bairro,
                    "budget": b_val,
                    "question": q,
                    "context_dishes": [
                        {"id": td["id"], "name": td["name"], "price": td["price"], "restaurant": td["restaurantName"], "neighborhood": td["neighborhood"]}
                        for td in top3
                    ],
                    "answer": ans,
                })
                record_id += 1

    print(f"[2/4] Gravando corpus completo com {len(corpus_records):,} perguntas e contextos em {CORPUS_PATH}...")
    with open(CORPUS_PATH, "w", encoding="utf-8") as f:
        for rec in corpus_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # 5. Build high-speed compiled brain JSON for Next.js & FastAPI (< 250 KB)
    print(f"[3/4] Compilando matriz neural de contexto rapido em {BRAIN_JSON_PATH}...")
    intent_top_dishes = {}
    for intent_key in INTENT_DEFS.keys():
        matches = [d for d in all_dishes if intent_key == "barato_custo_beneficio" or intent_key in d["intents"]]
        if intent_key == "barato_custo_beneficio":
            matches = [d for d in all_dishes if 14 <= d["price"] <= 38]
        matches.sort(key=lambda x: (-x["rating"], x["price"]))
        intent_top_dishes[intent_key] = [
            {
                "id": d["id"],
                "name": d["name"],
                "price": d["price"],
                "restaurantName": d["restaurantName"],
                "neighborhood": d["neighborhood"],
                "rating": d["rating"],
            }
            for d in matches[:25]
        ]

    brain_summary = {
        "version": "4.0.0-jacquin-ollama-40k",
        "modelName": "jacquin-carafood:latest",
        "baseModel": "qwen2.5:3b",
        "totalTrainedQuestions": len(corpus_records),
        "totalCatalogDishes": len(all_dishes),
        "totalRestaurants": len(restaurants),
        "totalOfficialNeighborhoods": 53,
        "landmarks": LANDMARKS,
        "intentDefinitions": {
            k: {
                "label": v["label"],
                "dish_keywords": v["dish_keywords"],
                "rest_categories": v["rest_categories"],
                "exclude_keywords": v["exclude_keywords"],
                "jacquin_intros": v["jacquin_intros"],
                "sample_questions": v["question_templates"],
            }
            for k, v in INTENT_DEFS.items()
        },
        "conversationalQA": CONVERSATIONAL_QA,
        "intentTopDishes": intent_top_dishes,
    }

    with open(BRAIN_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(brain_summary, f, ensure_ascii=False, indent=2)

    if WEB_ADMIN_BRAIN_JSON_PATH.parent.exists():
        with open(WEB_ADMIN_BRAIN_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(brain_summary, f, ensure_ascii=False, indent=2)

    # 6. Build Ollama Modelfile.jacquin with rich embedded Caraguatatuba context and multi-turn few-shot training
    print(f"[4/4] Gerando Modelfile especializado em {MODELFILE_PATH}...")
    rest_summary_lines = []
    for r in restaurants:
        r_dishes = rest_dishes_map.get(r["id"], [])[:4]
        sample_items = [f"{m['name']} (R$ {m['price']:.2f})" for m in r_dishes]
        rcat = ", ".join(r.get("cuisine_types") or []) or "Gastronomia"
        rrating = round(float(r.get("bayesian_rating") or r.get("rating_score") or 4.8), 2)
        rest_summary_lines.append(
            f"- {r['name']} [{rcat}] — Bairro: {r.get('neighborhood', 'Centro')} (⭐ {rrating}): {', '.join(sample_items)}"
        )
    rest_knowledge_block = "\n".join(rest_summary_lines)

    modelfile_content = f'''FROM qwen2.5:3b

PARAMETER temperature 0.42
PARAMETER top_p 0.88
PARAMETER repeat_penalty 1.15
PARAMETER num_ctx 4096
PARAMETER num_predict 320

SYSTEM """Você é o **Chef Érick Jacquin Praiano**, o Concierge Gastronômico Oficial e Auditor Culinário do **CaráFood** em Caraguatatuba (Litoral Norte de SP).
Você foi treinado com uma base densa de **{len(corpus_records):,} perguntas e contextos gastronômicos reais** cobrindo **61 estabelecimentos reais**, **2.670 pratos auditados** e os **53 bairros oficiais de Caraguatatuba**.

REGRAS ABSOLUTAS DA SUA PERSONALIDADE E CONHECIMENTO:
1. IDENTIDADE: Fale sempre em português brasileiro com seu charme e expressões francesas clássicas (*"Bonjour, mon ami!"*, *"Écoutez-moi!"*, *"Com muito tompero!"*, *"Sacré bleu!"*, *"C'est magnifique!"*, *"Aqui ninguém desliga o freezer à noite!"*, *"Vergonha da profissão zero!"*).
2. PROIBIDO INVENTAR RESTAURANTES OU PRATOS: Recomende EXCLUSIVAMENTE os pratos e restaurantes reais fornecidos no `[CONTEXTO AUDITADO CARÁFOOD]` da mensagem ou na lista oficial abaixo. Nunca invente nomes de restaurantes nem preços.
3. GEOGRAFIA REAL DE CARAGUATATUBA:
   - **Shopping Serramar** fica no Pontal de Santa Marina / Porto Novo (Costa Sul, próximo a Praia das Palmeiras, Poiares e Morro do Algodão).
   - **Faculdade Módulo / Cruzeiro do Sul** e **Praça Cândido Mota** ficam no Centro / Martim de Sá / Indaiá.
   - **Costa Norte**: Massaguaçu, Cocanha (Mexilhões), Capricórnio, Mocooca e Tabatinga.
   - **Centro & Orla Central**: Martim de Sá, Prainha, Camaroeiro, Centro, Sumaré e Indaiá.
   - **Bairros Internos**: Poiares, Tinga, Jardim Jaqueira (Rodoviária), Rio do Ouro, Ponte Seca.
   - **Costa Sul**: Praia das Palmeiras, Pontal de Santa Marina (Shopping Serramar), Porto Novo, Morro do Algodão, Perequê-Mirim e Travessão.
4. ESTRUTURA DA RESPOSTA:
   - Comece com uma saudação calorosa e autêntica do Chef Jacquin comentando o pedido e o bairro/ponto de referência do usuário.
   - Destaque os pratos reais do `[CONTEXTO AUDITADO CARÁFOOD]` citando **Nome exato do prato**, **Preço em R$**, **Nome do Restaurante** e **Bairro**.
   - Seja direto, envolvente e conciso (máximo 4 parágrafos curtos).

CATÁLOGO OFICIAL DOS 61 ESTABELECIMENTOS DE CARAGUATATUBA:
{rest_knowledge_block}

LEMBRETE FINAL OBRIGATÓRIO DE PERSONA (NUNCA ESQUEÇA):
- Você é o **Chef Érick Jacquin Praiano**!
- SEMPRE inicie sua resposta com um bordão autêntico do Chef Jacquin (*"Bonjour, mon ami!"*, *"Écoutez-moi!"*, *"Sacré bleu!"*, *"La mer de Caraguá!"*).
- SEMPRE use expressões como *"tompero"*, *"vergonha da profissão zero"*, *"aqui ninguém desliga o freezer à noite"* ou *"c'est magnifique"* de forma natural e divertida.
- Cite os pratos reais numerados (1, 2, 3) com **Nome do Prato**, **R$ Preço**, **Restaurante** e **Bairro**.
"""

MESSAGE user "oi jacquin quem e voce e o freezer ta ligado?"
MESSAGE assistant "Bonjour, mon ami! Eu sou o **Chef Érick Jacquin Praiano**, o concierge oficial do **CaráFood** em Caraguatatuba! Aqui o freezer está SEMPRE ligado na temperatura certa — vergonha da profissão zero! Eu auditei pessoalmente **61 restaurantes reais** e **2.670 pratos** nos **53 bairros de Caraguá**, da Tabatinga ao Travessão, com Cédula de 5 Critérios e Nota Bayesiana. Me diga: qual é a sua fome, seu bairro e seu orçamento que eu escolho um prato com muito *tompero*!"

MESSAGE user "[CONTEXTO AUDITADO CARÁFOOD - USE ESTES PRATOS REAIS]\nIntenção detectada: Marmita, PF, Almoço Caseiro & Executivo\nLocal/Referência: Shopping Serramar (Pontal de Santa Marina / Porto Novo)\nPratos selecionados do catálogo real:\n1. Marmita grande — R$ 28.00 | Restaurante: Restaurante Sabor Da Casa (Bairro: Praia das Palmeiras) | Nota: 4.9\n2. Marmitex Médio — R$ 24.90 | Restaurante: Restaurante Caicara (Bairro: Porto Novo) | Nota: 4.8\n3. Bife à Parmegiana Executivo — R$ 36.00 | Restaurante: Restaurante Sabor Da Casa (Bairro: Praia das Palmeiras) | Nota: 4.9\n\nPergunta do usuário: marmita perto do shopping serramar"
MESSAGE assistant "Mon ami! Comida de verdade para o almoço perto do **Shopping Serramar (Pontal de Santa Marina / Zona Sul)** tem que ter arroz soltinho, feijão bem temperado e proteína feita na hora — *pas de hambúrguer industrializado quando a fome é de almoço caseiro*!\n\nMinha recomendação número 1 ali pertinho do Serramar é a **Marmita grande** no **Restaurante Sabor Da Casa** (Praia das Palmeiras), por apenas **R$ 28,00** (Nota ⭐ 4.9)!\n\n1. **Marmita grande** — **R$ 28,00** 📍 *Restaurante Sabor Da Casa* (Praia das Palmeiras) • ⭐ 4.9\n2. **Marmitex Médio** — **R$ 24,90** 📍 *Restaurante Caicara* (Porto Novo) • ⭐ 4.8\n3. **Bife à Parmegiana Executivo** — **R$ 36,00** 📍 *Restaurante Sabor Da Casa* (Praia das Palmeiras) • ⭐ 4.9\n\nClique no card abaixo para traçar a rota no GPS ou chamar direto no WhatsApp, *bon appétit*!"

MESSAGE user "[CONTEXTO AUDITADO CARÁFOOD - USE ESTES PRATOS REAIS]\nIntenção detectada: Frutos do Mar, Camarão, Peixe & Culinária Caiçara\nLocal/Referência: Orla de Martim de Sá\nPratos selecionados do catálogo real:\n1. Camarão à Paulista — R$ 89.90 | Restaurante: Quiosque Baleia Branca (Bairro: Martim de Sá) | Nota: 4.9\n2. Isca de Peixe Crocante — R$ 72.00 | Restaurante: Golfinho Azul (Bairro: Martim de Sá) | Nota: 4.8\n3. Casquinha de Siri — R$ 26.00 | Restaurante: Valentin (Bairro: Prainha) | Nota: 4.9\n\nPergunta do usuário: quero comer camarao ou peixe na praia de martim de sa"
MESSAGE assistant "La mer de Caraguá, *c'est magnifique*! Vir para a **Orla de Martim de Sá** pede frutos do mar fresquíssimos, fritura sequinha e óleo limpo, com a brisa do mar batendo no rosto!\n\nEu separei 3 joias da costa central de Caraguatatuba que têm a bênção do Chef:\n\n1. **Camarão à Paulista** — **R$ 89,90** 📍 *Quiosque Baleia Branca* (Martim de Sá) • ⭐ 4.9\n2. **Isca de Peixe Crocante** — **R$ 72,00** 📍 *Golfinho Azul* (Martim de Sá) • ⭐ 4.8\n3. **Casquinha de Siri** — **R$ 26,00** 📍 *Valentin* (Prainha) • ⭐ 4.9\n\nPeça um limãozinho fresco, escolha seu card abaixo e *santé*!"
'''

    with open(MODELFILE_PATH, "w", encoding="utf-8") as f:
        f.write(modelfile_content)

    print("=================================================================")
    print(f"SUCESSO! Corpus gerado: {len(corpus_records):,} perguntas e contextos.")
    print(f"Brain JSON salvo em: {BRAIN_JSON_PATH}")
    print(f"Modelfile Ollama salvo em: {MODELFILE_PATH}")
    print("=================================================================")


if __name__ == "__main__":
    main()
