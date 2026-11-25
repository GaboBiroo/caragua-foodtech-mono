import dump from '../data/caraguaRealDump.json';
import brain40k from '../data/jacquin40kBrain.json';
import { RestaurantCardData, DishPreview } from '../data/realDataStore';

// ==============================================================================
// Motor Semântico Hiperlocal & Persona Oficial — Chef Érick Jacquin Praiano
// - Indexa todos os 2.670 pratos e 61 estabelecimentos reais de Caraguatatuba;
// - Mapeia pontos de referência reais da cidade (Shopping Serramar, Faculdade
//   Módulo, Praça Cândido Mota, Camaroeiro, Orla Martim de Sá, Cocanha, etc.);
// - Entende intenção gastronômica (marmita/almoço, lanche/burger, pizza, sushi,
//   peixe/camarão, açaí/doce, fit/vegano, barato/orçamento, promoção);
// - Responde com a personalidade autêntica do Chef Érick Jacquin Praiano
//   ("tompero", "vergonha da profission", "freezer ligado", "mon ami", "magnifique").
// ==============================================================================

function normalizeStr(val?: string | null): string {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function calculateDistanceKm(lat1: number, lon1: number, lat2?: number, lon2?: number): number {
  if (typeof lat2 !== 'number' || typeof lon2 !== 'number') return 2.2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface LandmarkRule {
  keywords: string[];
  label: string;
  lat: number;
  lon: number;
  priorityNeighborhoods: string[];
}

const CARAGUA_LANDMARKS: LandmarkRule[] = [
  {
    keywords: ['serramar', 'shopping serramar', 'shopping', 'pontal', 'santa marina', 'morro do algodao', 'algodao'],
    label: 'pertinho do Shopping Serramar (Eixo Sul / Morro do Algodão / Gaivotas / Tinga)',
    lat: -23.6606,
    lon: -45.4375,
    priorityNeighborhoods: [
      'morro do algodao',
      'jardim gaivotas',
      'praia das palmeiras',
      'poiares',
      'tinga',
      'indaia',
      'travessao',
      'porto novo',
      'barranco alto',
      'pereque-mirim',
    ],
  },
  {
    keywords: ['faculdade', 'modulo', 'cruzeiro do sul', 'universidade', 'campus'],
    label: 'pertinho do Centro Universitário Módulo',
    lat: -23.6215,
    lon: -45.411,
    priorityNeighborhoods: ['centro', 'martim de sa', 'indaia', 'sumare', 'ipiranga'],
  },
  {
    keywords: ['martim de sa', 'martim', 'prainha', 'jacare', 'pedra da freira'],
    label: 'na região da Praia Martim de Sá e Prainha',
    lat: -23.6268,
    lon: -45.3934,
    priorityNeighborhoods: ['martim de sa', 'prainha', 'centro'],
  },
  {
    keywords: ['massaguacu', 'cocanha', 'tabatinga', 'mococa', 'costa norte', 'zona norte'],
    label: 'na Costa Norte (Massaguaçu / Cocanha / Tabatinga)',
    lat: -23.5812,
    lon: -45.3245,
    priorityNeighborhoods: ['massaguacu', 'cocanha', 'tabatinga'],
  },
  {
    keywords: ['porto novo', 'flexeiras', 'travessao', 'pereque', 'barranco alto', 'zona sul', 'orla sul'],
    label: 'na Região Sul (Porto Novo / Travessão / Perequê-Mirim)',
    lat: -23.6835,
    lon: -45.442,
    priorityNeighborhoods: [
      'porto novo',
      'flexeiras',
      'travessao',
      'pereque-mirim',
      'barranco alto',
      'morro do algodao',
      'praia das palmeiras',
    ],
  },
  {
    keywords: ['indaia', 'gaivotas', 'poiares', 'tinga', 'primavera'],
    label: 'na região do Indaiá, Poiares, Tinga e Gaivotas',
    lat: -23.638,
    lon: -45.424,
    priorityNeighborhoods: ['indaia', 'poiares', 'tinga', 'jardim gaivotas', 'jardim primavera'],
  },
  {
    keywords: ['centro', 'praca', 'candido mota', 'calcadao', 'camaroeiro', 'santo antonio'],
    label: 'no coração do Centro Histórico de Caraguá',
    lat: -23.6226,
    lon: -45.4124,
    priorityNeighborhoods: ['centro', 'sumare', 'ipiranga', 'olaria'],
  },
];

type FoodIntentCategory =
  | 'marmita'
  | 'frutos_do_mar'
  | 'lanches'
  | 'pizza'
  | 'sushi'
  | 'doces_acai'
  | 'vegano_fit'
  | 'combo_familia'
  | 'porcoes'
  | 'geral';

interface FoodIntentRule {
  intent: FoodIntentCategory;
  labelPt: string;
  triggerWords: string[];
  positiveDishKeywords: string[];
  positiveRestaurantKeywords: string[];
  requiredFoodType?: string;
  negativeDishKeywords: string[];
}

const FOOD_INTENT_RULES: FoodIntentRule[] = [
  {
    intent: 'marmita',
    labelPt: 'Marmita & Almoço Caseiro com Tompero',
    triggerWords: [
      'marmita',
      'marmitex',
      'marmitaria',
      'almoco',
      'almocar',
      'executivo',
      'pf',
      'prato feito',
      'comida caseira',
      'parmegiana',
      'strogonoff',
      'estrogonofe',
      'feijoada',
      'lasanha',
      'arroz e feijao',
      'churrasco',
      'milanesa',
    ],
    positiveDishKeywords: [
      'marmita',
      'marmitex',
      'parmegiana',
      'strogonoff',
      'churrasco',
      'milanesa',
      'cubos de frango',
      'tiras de carne',
      'iscas de carne',
      'copa lombo',
      'almondegas',
      'lasanha',
      'feijoada',
      'executivo',
      'prato premium',
      'tilapia',
      'kit 10 prime',
      'caldo',
    ],
    positiveRestaurantKeywords: [
      'marmitaria',
      'pirao',
      'le cheff',
      'sabor de casa',
      'sabor do litoral',
      'jorginho',
      'delicias da lu',
      'magia do sabor',
      'caicaras',
      'prime fit',
    ],
    requiredFoodType: 'marmitas',
    negativeDishKeywords: [
      'coca',
      'guarana',
      'fanta',
      'agua',
      'cerveja',
      'heineken',
      'chopp',
      'adicional',
      'chantilly',
      'molho',
      'churros',
      'brigadeiro',
      'sorvete',
      'acai',
    ],
  },
  {
    intent: 'frutos_do_mar',
    labelPt: 'Peixes, Camarões & Porções Caiçaras da Praia',
    triggerWords: [
      'camarao',
      'peixe',
      'frutos do mar',
      'tilapia',
      'badejo',
      'tainha',
      'lula',
      'marisco',
      'mexilhao',
      'bacalhau',
      'quiosque',
      'praia',
      'caicara',
      'moqueca',
      'pirao',
    ],
    positiveDishKeywords: [
      'camarao',
      'peixe',
      'tilapia',
      'isca',
      'bacalhau',
      'lula',
      'porcao',
      'frutos do mar',
      'marisco',
      'bolinho',
      'file',
    ],
    positiveRestaurantKeywords: [
      'pe na areia',
      'quiosque',
      'caicaras',
      'mare mar',
      'martim food',
      'pirao',
      'sabor do litoral',
      'xcoxinha',
    ],
    requiredFoodType: 'frutos_do_mar',
    negativeDishKeywords: ['refrigerante', 'agua', 'adicional', 'molho', 'chantilly'],
  },
  {
    intent: 'sushi',
    labelPt: 'Sushi, Combinados & Culinária Japonesa',
    triggerWords: [
      'sushi',
      'japa',
      'japonesa',
      'japones',
      'temaki',
      'sashimi',
      'combinado',
      'yakisoba',
      'lamen',
      'hot roll',
      'uramaki',
      'hossomaki',
      'tepan',
      'oriental',
    ],
    positiveDishKeywords: [
      'sushi',
      'combinado',
      'combo croc',
      'combo namorado',
      'temaki',
      'lamen',
      'misso',
      'yakisoba',
      'hot',
      'tepan',
      'salmao',
      'hossomaki',
      'peças',
      'pecas',
    ],
    positiveRestaurantKeywords: ['narigato', 'point do japa', 'kampai'],
    requiredFoodType: 'sushi',
    negativeDishKeywords: ['refrigerante', 'agua', 'adicional'],
  },
  {
    intent: 'pizza',
    labelPt: 'Pizzas Artesanais, Calzones & Esfihas',
    triggerWords: [
      'pizza',
      'pizzaria',
      'esfiha',
      'calzone',
      'marguerita',
      'calabresa',
      'portuguesa',
      'quatro queijos',
      'catupiry',
      'forno a lenha',
    ],
    positiveDishKeywords: [
      'pizza',
      'esfiha',
      'calzone',
      'marguerita',
      'calabresa',
      'mussarela',
      'portuguesa',
      'frango com catupiry',
      'brocolis',
    ],
    positiveRestaurantKeywords: [
      'nonna peroni',
      'solepizza',
      'pizzaria rocha',
      'venezza',
      'w&v pizzaria',
      'don corleone',
      'ideal pizzaria',
    ],
    requiredFoodType: 'pizza',
    negativeDishKeywords: ['refrigerante', 'agua', 'adicional', 'dips'],
  },
  {
    intent: 'lanches',
    labelPt: 'Hambúrgueres Artesanais, Smashs & Lanches',
    triggerWords: [
      'lanche',
      'hamburguer',
      'burger',
      'burguer',
      'smash',
      'artesanal',
      'bacon',
      'cheddar',
      'sanduiche',
      'x-bacon',
      'x-salada',
      'x-tudo',
      'hot dog',
      'cachorro quente',
      'beirute',
    ],
    positiveDishKeywords: [
      'burger',
      'burguer',
      'smash',
      'bacon',
      'cheddar',
      'costela',
      'billy',
      'yanke',
      'memphis',
      'marguerito',
      'artesanal',
      'kaipirao',
      'trio bruttos',
      'hot dog',
      'beirute',
    ],
    positiveRestaurantKeywords: [
      'padua',
      'bs bgr',
      'xp hamburgueria',
      'billy bruto',
      'inbrasa',
      'martim food',
      'kaipiras',
      'chicken bruttos',
      'ex burguer',
      'the best burguer',
      'furious',
      'mt burguer',
    ],
    requiredFoodType: 'lanches',
    negativeDishKeywords: ['refrigerante', 'agua', 'molho adicional', 'maionese adicional'],
  },
  {
    intent: 'doces_acai',
    labelPt: 'Açaí, Sorvetes, Bolos & Confeitaria',
    triggerWords: [
      'acai',
      'sorvete',
      'doce',
      'sobremesa',
      'bolo',
      'brigadeiro',
      'churros',
      'nutella',
      'milkshake',
      'shake',
      'pudim',
      'confeitaria',
      'chocolate',
    ],
    positiveDishKeywords: [
      'acai',
      'sorvete',
      'bolo',
      'brigadeiro',
      'churros',
      'brownie',
      'pudim',
      'trufado',
      'nutella',
      'doce',
      'napoleta',
    ],
    positiveRestaurantKeywords: [
      'verano',
      'napoli',
      'shake & acai',
      'yes! acai',
      'milena palma',
      'confeitaria da rai',
      'churros magali',
      'beira mar',
    ],
    requiredFoodType: 'doces_acai',
    negativeDishKeywords: ['chantilly adicional', 'colher descartavel'],
  },
  {
    intent: 'vegano_fit',
    labelPt: 'Opções Veganas, Vegetarianas, Fit & Sem Lactose/Glúten',
    triggerWords: [
      'vegano',
      'vegana',
      'vegetariano',
      'vegetariana',
      'sem lactose',
      'zero lactose',
      'sem gluten',
      'celiaco',
      'fit',
      'saudavel',
      'dieta',
      'salada',
      'legumes',
      'palmito',
      'brocolis',
    ],
    positiveDishKeywords: [
      'vegano',
      'vegetal',
      'fit',
      'prime',
      'palmito',
      'brocolis',
      'salada',
      'acai',
      'legumes',
    ],
    positiveRestaurantKeywords: ['prime fit', 'caicaras', 'verano', 'napoli'],
    negativeDishKeywords: ['refrigerante', 'cerveja'],
  },
  {
    intent: 'combo_familia',
    labelPt: 'Combos para Dividir, Box Família & Promoções',
    triggerWords: [
      'combo',
      'familia',
      'casal',
      'dividir',
      'galera',
      'box',
      'em dobro',
      'barca',
      'balde',
    ],
    positiveDishKeywords: [
      'combo',
      'familia',
      'casal',
      'box',
      'em dobro',
      'trio',
      'barca',
      'balde',
      'gigante',
    ],
    positiveRestaurantKeywords: ['padua', 'xp', 'bs bgr', 'chicken bruttos', 'pirao', 'franchicken'],
    requiredFoodType: 'combo_familia',
    negativeDishKeywords: ['molho', 'adicional'],
  },
];

function isPureDrinkOrAddon(dishName: string, category: string): boolean {
  const n = normalizeStr(`${dishName} ${category}`);
  if (
    n.includes('molho adicional') ||
    n.includes('chantilly adicional') ||
    n.includes('adicionais')
  ) {
    return true;
  }
  const drinkCats = ['bebida', 'bebidas', 'refrigerante', 'refrigerantes', 'cerveja', 'cervejas', 'energeticos', 'aguardente', 'combos whisky'];
  if (drinkCats.some((c) => normalizeStr(category) === c)) {
    return true;
  }
  return false;
}

export interface JacquinChatRequest {
  query: string;
  neighborhood?: string;
  userLat?: number;
  userLon?: number;
  limit?: number;
}

export interface JacquinBrainStats {
  version: string;
  modelName: string;
  baseModel: string;
  totalTrainedQuestions: number;
  totalCatalogDishes: number;
  totalRestaurants: number;
  totalOfficialNeighborhoods: number;
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JacquinChatResponse {
  reply: string;
  answer: string;
  dishes: any[];
  recommendations: any[];
  detectedIntent: string;
  detectedLocationLabel: string | null;
  chefMood: string;
  brainStats: JacquinBrainStats;
  ollamaMessages: OllamaChatMessage[];
}

export function buildOllamaRagMessages(
  userQuery: string,
  recommendations: any[],
  detectedIntent: string,
  detectedLocationLabel: string | null
): OllamaChatMessage[] {
  const dishesBlock =
    recommendations.length > 0
      ? recommendations
          .slice(0, 4)
          .map(
            (d, idx) =>
              `${idx + 1}. ${d.dish_name} — R$ ${Number(d.price).toFixed(2).replace('.', ',')} | Restaurante: ${d.restaurant_name} (Bairro: ${d.neighborhood}) | Nota: ⭐ ${Number(d.rating_score || 4.8).toFixed(1)} | ${d.description || ''}`
          )
          .join('\n')
      : 'Use os melhores pratos do catálogo real de Caraguatatuba.';

  return [
    {
      role: 'system',
      content:
        'Você é o Chef Érick Jacquin Praiano, o Concierge Gastronômico Oficial do CaráFood em Caraguatatuba (treinado com 42.870 perguntas e contextos reais dos 61 restaurantes, 2.670 pratos e 53 bairros). ' +
        'Fale SEMPRE em português com seu sotaque e bordões franceses clássicos ("Bonjour, mon ami!", "Écoutez-moi!", "tompero", "vergonha da profission zero", "aqui ninguém desliga o freezer à noite", "C\'est magnifique!"). ' +
        'REGRA INVIOLÁVEL: cite EXCLUSIVAMENTE os pratos, preços em R$, restaurantes e bairros fornecidos no [CONTEXTO AUDITADO CARÁFOOD]. Seja caloroso, carismático e direto (2 a 3 parágrafos curtos).',
    },
    {
      role: 'user',
      content:
        `[CONTEXTO AUDITADO CARÁFOOD - USE ESTES PRATOS REAIS]\n` +
        `Intenção detectada: ${detectedIntent}\n` +
        `Local/Referência: ${detectedLocationLabel || 'Caraguatatuba (53 bairros)'}\n` +
        `Pratos selecionados do catálogo real:\n${dishesBlock}\n\n` +
        `Pergunta do usuário: "${userQuery}"\n\n` +
        `Responda agora como Chef Érick Jacquin Praiano apresentando os pratos acima com muito tompero:`,
    },
  ];
}

export function generateJacquinChatResponse(req: JacquinChatRequest): JacquinChatResponse {
  const rawQuery = String(req.query || '').trim();
  const q = normalizeStr(rawQuery);
  const allRests = (dump.restaurants || []) as unknown as RestaurantCardData[];
  const dishDetailsMap = (dump.dish_details || {}) as Record<string, any>;

  // 1. Detectar Landmark / Região / Bairro mencionado pelo usuário
  let matchedLandmark: LandmarkRule | null = null;
  for (const lm of CARAGUA_LANDMARKS) {
    if (lm.keywords.some((kw) => q.includes(normalizeStr(kw)))) {
      matchedLandmark = lm;
      break;
    }
  }

  let explicitNeighborhood: string | null = null;
  const allNeighborhoodNames = Array.from(
    new Set(allRests.map((r) => r.neighborhood).filter(Boolean))
  );
  for (const bName of allNeighborhoodNames) {
    const nb = normalizeStr(bName);
    if (nb.length >= 4 && q.includes(nb)) {
      explicitNeighborhood = bName;
      break;
    }
  }
  if (!explicitNeighborhood && req.neighborhood && req.neighborhood !== 'Todos') {
    explicitNeighborhood = req.neighborhood;
  }

  const refLat = matchedLandmark?.lat ?? req.userLat ?? -23.6226;
  const refLon = matchedLandmark?.lon ?? req.userLon ?? -45.4124;

  // 2. Detectar teto de preço (ex: "até 35", "até R$ 45", "barato")
  let maxBudget: number | null = null;
  const priceMatch = q.match(/(?:ate|menos de|no maximo|r\$)\s*(\d{2,3})/);
  if (priceMatch) {
    maxBudget = parseInt(priceMatch[1], 10);
  } else if (q.includes('barat') || q.includes('econom')) {
    maxBudget = 36;
  }

  const wantsPriceDrop =
    q.includes('baixou') ||
    q.includes('promoc') ||
    q.includes('desconto') ||
    q.includes('oferta');

  // 3. Detectar Intenção Gastronômica Principal
  let matchedIntentRule: FoodIntentRule | null = null;
  let bestIntentHits = 0;
  for (const rule of FOOD_INTENT_RULES) {
    const hits = rule.triggerWords.filter((tw) => q.includes(normalizeStr(tw))).length;
    if (hits > bestIntentHits) {
      bestIntentHits = hits;
      matchedIntentRule = rule;
    }
  }

  // 4. Construir pool completo de pratos reais (usando r.dishes + r.dishes_preview + dishDetailsMap)
  interface ScoredCandidate {
    dish: DishPreview;
    restaurant: RestaurantCardData;
    distKm: number;
    score: number;
    matchReason: string;
  }

  const seenDishIds = new Set<string>();
  const candidates: ScoredCandidate[] = [];

  // Palavras-chave relevantes da busca (ignorando stopwords)
  const STOPWORDS = new Set([
    'quero',
    'uma',
    'uns',
    'umas',
    'para',
    'com',
    'sem',
    'perto',
    'proximo',
    'onde',
    'comer',
    'pedir',
    'tem',
    'qual',
    'melhor',
    'melhores',
    'dica',
    'dicas',
    'hoje',
    'agora',
    'caragua',
    'caraguatatuba',
    'shopping',
    'serramar',
    'praia',
    'centro',
    'bairro',
    'reais',
    'ate',
    'mais',
    'muito',
    'bom',
    'boa',
    'gostoso',
    'gostosa',
    'chef',
    'jacquin',
  ]);
  const queryTokens = q
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  const addCandidateIfValid = (d: DishPreview, r: RestaurantCardData) => {
    if (!d || !d.id || seenDishIds.has(d.id)) return;
    if (!d.price || d.price <= 0) return;

    // Ignora bebidas soltas e adicionais a menos que o usuário peça bebida
    const asksForDrink =
      q.includes('cerveja') ||
      q.includes('bebida') ||
      q.includes('refrigerante') ||
      q.includes('chopp') ||
      q.includes('whisky');
    if (!asksForDrink && isPureDrinkOrAddon(d.name, d.category)) {
      return;
    }

    seenDishIds.add(d.id);

    const distKm = calculateDistanceKm(refLat, refLon, r.latitude, r.longitude);
    const dishHay = normalizeStr(`${d.name} ${d.description || ''} ${d.category || ''}`);
    const restHay = normalizeStr(`${r.name} ${r.neighborhood} ${(r.cuisine_types || []).join(' ')}`);
    const fullHay = `${dishHay} ${restHay}`;
    const rNeighNorm = normalizeStr(r.neighborhood);

    let score = 0;
    let matchReason = 'Selecionado pelo Chef Jacquin';

    // A) Pontuação por Intenção Gastronômica (Marmita, Peixe, Lanche, Pizza, Sushi, Açaí, Vegano)
    if (matchedIntentRule) {
      let hasPositiveMatch = false;

      for (const kw of matchedIntentRule.positiveDishKeywords) {
        if (dishHay.includes(normalizeStr(kw))) {
          score += 55;
          hasPositiveMatch = true;
          matchReason = matchedIntentRule.labelPt;
        }
      }

      for (const rkw of matchedIntentRule.positiveRestaurantKeywords) {
        if (restHay.includes(normalizeStr(rkw))) {
          score += 48;
          hasPositiveMatch = true;
          matchReason = matchedIntentRule.labelPt;
        }
      }

      if (
        matchedIntentRule.requiredFoodType &&
        Array.isArray(r.food_types) &&
        r.food_types.includes(matchedIntentRule.requiredFoodType)
      ) {
        score += 32;
        hasPositiveMatch = true;
      }

      for (const nkw of matchedIntentRule.negativeDishKeywords) {
        if (dishHay.includes(normalizeStr(nkw))) {
          score -= 80;
        }
      }

      if (matchedIntentRule.intent === 'vegano_fit') {
        if (d.is_vegan) {
          score += 75;
          matchReason = '100% Vegano Verificado';
        } else if (d.is_vegetarian) {
          score += 55;
          matchReason = 'Opção Vegetariana';
        } else if (d.is_lactose_free || d.is_gluten_free) {
          score += 45;
          matchReason = 'Sem Lactose / Sem Glúten';
        }
      }

      // Se o usuário pediu uma categoria específica (ex: marmita) e o item não tem relação nenhuma, penaliza forte
      if (!hasPositiveMatch) {
        score -= 65;
      }
    }

    // B) Pontuação por Tokens Diretos da Pergunta
    for (const tok of queryTokens) {
      if (dishHay.includes(tok)) {
        score += 40;
      } else if (fullHay.includes(tok)) {
        score += 22;
      }
    }

    // C) Pontuação Geográfica (Landmark como Shopping Serramar ou Bairro explícito)
    if (matchedLandmark) {
      const idxInPriority = matchedLandmark.priorityNeighborhoods.findIndex(
        (nb) => rNeighNorm.includes(nb) || nb.includes(rNeighNorm)
      );
      if (idxInPriority >= 0) {
        // Quanto mais próximo na lista de bairros do landmark, maior o bônus
        score += Math.max(25, 70 - idxInPriority * 6);
        matchReason = `Pertinho: ${r.neighborhood}`;
      } else if (distKm <= 3.5) {
        score += 45;
      } else if (distKm > 7) {
        score -= 35;
      }
    } else if (explicitNeighborhood) {
      const targetNb = normalizeStr(explicitNeighborhood);
      if (rNeighNorm.includes(targetNb) || targetNb.includes(rNeighNorm)) {
        score += 75;
        matchReason = `No bairro ${r.neighborhood}`;
      } else {
        score -= 30;
      }
    }

    // D) Orçamento e Queda de Preço
    if (maxBudget !== null) {
      if (d.price <= maxBudget) {
        score += 45;
        matchReason = `Cabe no bolso: R$ ${d.price.toFixed(2).replace('.', ',')}`;
      } else {
        score -= 90;
      }
    }

    if (wantsPriceDrop) {
      if (d.last_price_delta_pct && d.last_price_delta_pct < 0) {
        score += 65;
        matchReason = 'Baixou de preço esta semana';
      } else if (r.has_price_drop) {
        score += 25;
      }
    }

    // E) Qualidade Bayesiana, Foto Real e Proximidade Suave
    const wr = Number(r.bayesian_rating ?? r.rating_score ?? r.rating_average ?? 4.5);
    score += wr * 4;
    if (d.image_url) score += 12;
    score -= Math.min(15, distKm * 1.8);

    candidates.push({
      dish: d,
      restaurant: r,
      distKm: Number(distKm.toFixed(2)),
      score,
      matchReason,
    });
  };

  for (const r of allRests) {
    for (const d of r.dishes_preview || []) {
      addCandidateIfValid(d, r);
    }
    for (const d of (r as any).dishes || []) {
      addCandidateIfValid(d, r);
    }
  }

  // Também varre dishDetailsMap para encontrar pratos profundos do cardápio (como marmitas do Point do Pirão, etc.)
  const restById = new Map<string, RestaurantCardData>();
  for (const r of allRests) {
    restById.set(r.id, r);
  }
  for (const detail of Object.values(dishDetailsMap)) {
    if (detail?.dish && detail?.restaurant) {
      const parentRest = restById.get(detail.restaurant.id) || (detail.restaurant as RestaurantCardData);
      addCandidateIfValid(detail.dish as DishPreview, parentRest);
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  // Seleciona até 5 pratos aplicando Round-Robin por restaurante (máx. 1 prato por restaurante na primeira passada, depois permite 2º)
  const limit = req.limit || 5;
  const selected: ScoredCandidate[] = [];
  const restCount = new Map<string, number>();

  for (const passMax of [1, 2]) {
    for (const cand of candidates) {
      if (selected.length >= limit) break;
      if (selected.includes(cand)) continue;
      if (cand.score < -15 && selected.length >= 2) continue;
      const rId = cand.restaurant.id || cand.restaurant.name;
      const current = restCount.get(rId) || 0;
      if (current < passMax) {
        selected.push(cand);
        restCount.set(rId, current + 1);
      }
    }
  }

  const recommendations = selected.map((m) => {
    const distMeters = Math.max(60, Math.round(m.distKm * 1000));
    const distanceLabel =
      m.distKm < 1
        ? `A ${Math.round(distMeters / 10) * 10}m • ${m.restaurant.neighborhood}`
        : `A ${m.distKm.toFixed(1).replace('.', ',')} km • ${m.restaurant.neighborhood}`;

    return {
      id: m.dish.id,
      dish_id: m.dish.id,
      name: m.dish.name,
      dish_name: m.dish.name,
      description:
        m.dish.description ||
        `Especialidade preparada no capricho pelo ${m.restaurant.name} (${m.restaurant.neighborhood}).`,
      price: m.dish.price,
      image_url: m.dish.image_url || m.restaurant.banner_url || m.restaurant.image_url || '',
      restaurant_id: m.restaurant.id,
      restaurant_name: m.restaurant.name,
      restaurant_slug: m.restaurant.slug,
      restaurant_address: m.restaurant.address,
      neighborhood: m.restaurant.neighborhood,
      category: m.dish.category || 'Cardápio Real',
      rating_score:
        m.restaurant.bayesian_rating ??
        m.restaurant.rating_score ??
        m.restaurant.rating_average ??
        4.8,
      rating_average: m.restaurant.rating_average || 4.8,
      distance_meters: distMeters,
      distance_km: m.distKm,
      distance_label: distanceLabel,
      friendly_match_label: m.matchReason,
      last_price_delta_pct: m.dish.last_price_delta_pct ?? 0,
      dietary_tags: [],
      is_real_osm: true,
      is_vegan: Boolean(m.dish.is_vegan),
      is_vegetarian: Boolean(m.dish.is_vegetarian),
      is_gluten_free: Boolean(m.dish.is_gluten_free),
      is_lactose_free: Boolean(m.dish.is_lactose_free),
    };
  });

  // 5. Construir a fala autêntica e carismática do Chef Érick Jacquin Praiano
  const first = selected[0];
  const second = selected[1];
  const locContext = matchedLandmark
    ? matchedLandmark.label
    : explicitNeighborhood
    ? `no bairro **${explicitNeighborhood}**`
    : 'aqui em Caraguatatuba';

  let reply = '';
  let chefMood = 'Entusiasmado & Exigente com o Tompero';

  if (!first) {
    reply =
      `Mon Dieu! Eu revirei todas as panelas dos 53 bairros de Caraguá, mas com esse filtro exato ninguém ligou o fogão hoje! ` +
      `Me pede uma **marmita caprichada**, um **camarão na praia**, um **hambúrguer artesanal**, uma **pizza** ou um **sushi fresquinho** que eu te mostro onde tem *tompero* de verdade!`;
  } else if (
    q.includes('bayes') ||
    q.includes('formula') ||
    q.includes('ranking comprado') ||
    q.includes('nota ponderada')
  ) {
    chefMood = 'Auditor Matemático & Curador Técnico';
    reply =
      `**Ah, la mathématique da gastronomia, mon ami!** No CaráFood não existe ranking patrocinado nem nota comprada: usamos a **Média Bayesiana Ponderada** ($W_R = \\frac{v}{v+m}R + \\frac{m}{v+m}C$) combinada com a **Cédula Oficial de 5 Critérios** (Sabor 30%, Qualidade 25%, Tempo 15%, Embalagem 15% e Custo-Benefício 15%)!\n\n` +
      `E para provar na prática ${locContext}, olha quem brilha no ranking auditado: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**!`;
  } else if (
    q.includes('metade do dobro') ||
    q.includes('descontao') ||
    q.includes('preco real') ||
    q.includes('promocao verdadeira')
  ) {
    chefMood = 'Fiscal Implacável contra Falsa Promoção';
    reply =
      `**Sacré bleu, eu odeio a famosa "metade do dobro"!** No CaráFood, nosso motor **Descontão Transparente** audita a mediana histórica de 30 dias dos **2.670 pratos** nos 61 estabelecimentos. O selo de queda real só acende quando o preço baixou de verdade!\n\n` +
      `Olha uma pedida honesta ${locContext}: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**!`;
  } else if (
    q.includes('freezer') ||
    q.includes('vergonha') ||
    q.includes('pesadelo') ||
    q.includes('tompero') ||
    (q.length <= 18 && (q.includes('oi') || q.includes('ola') || q.includes('bom dia') || q.includes('boa noite') || q.includes('jacquin')))
  ) {
    chefMood = 'Modo Pesadelo na Cozinha (Humorado)';
    reply =
      `**Bonjour, mon ami!** Aqui em Caraguatatuba não tem *vergonha da profission*, não! Eu já fiscalizei os **61 restaurantes** da cidade: o freezer tá ligado, a cozinha tá limpa e o *tompero* é caiçara de verdade!\n\n` +
      `Para abrir o seu apetite ${locContext}, olha minha primeira recomendação de chef: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**! Confira os cartões aqui embaixo:`;
  } else if (matchedIntentRule?.intent === 'marmita') {
    chefMood = 'Fiscal de Panela & Almoço Caseiro';
    reply =
      `**Mon Dieu, bateu aquela fome de almoço de verdade?** Marmita sem *tompero* é *vergonha da profission*, por isso eu selecionei pessoalmente as cozinhas mais caprichadas ${locContext}!\n\n` +
      `Olha essa joia: **${first.dish.name}** lá no **${first.restaurant.name}** (${first.restaurant.neighborhood}), saindo por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? `, e também **${second.dish.name}** no **${second.restaurant.name}** (${second.restaurant.neighborhood}) por **R$ ${second.dish.price.toFixed(2).replace('.', ',')}**!`
        : `!`) +
      ` Comida farta, quentinha e preço honesto. Veja as fichas completas abaixo:`;
  } else if (matchedIntentRule?.intent === 'frutos_do_mar') {
    chefMood = 'Apaixonado pelo Mar de Caraguá';
    reply =
      `**C'est magnifique!** Vir para Caraguatatuba e não comer um peixe fresco ou camarão com *tompero* caiçara é um pecado gastronômico!\n\n` +
      `Separei as melhores pedidas ${locContext}, começando por **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? ` e **${second.dish.name}** no **${second.restaurant.name}** (${second.restaurant.neighborhood})!`
        : `!`) +
      ` Tudo fresquinho, com freezer ligado e nota alta!`;
  } else if (matchedIntentRule?.intent === 'sushi') {
    chefMood = 'Inspeção Rigorosa de Peixe Fresco';
    reply =
      `**Ah, culinária japonesa!** No sushi eu sou implacável: o peixe tem que estar na temperatura certa, *freezer e geladeira impecáveis*!\n\n` +
      `Aqui ${locContext}, minha recomendação de ouro é **${first.dish.name}** do **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? `, além de **${second.dish.name}** no **${second.restaurant.name}**!`
        : `!`) +
      ` Pode pedir de olhos fechados, *mon cher*:`;
  } else if (matchedIntentRule?.intent === 'pizza') {
    chefMood = 'Crítico de Massa & Forno Quente';
    reply =
      `**Une bonne pizza!** Massa bem fermentada, queijo derretendo e bastante *tompero* no molho!\n\n` +
      `Garimpei os cardápios ${locContext} e destaquei **${first.dish.name}** da **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? ` e **${second.dish.name}** na **${second.restaurant.name}**!`
        : `!`) +
      ` Clique no cartão abaixo para ver a ficha completa:`;
  } else if (matchedIntentRule?.intent === 'lanches') {
    chefMood = 'Especialista em Ponto da Carne & Brioche';
    reply =
      `**Oh là là!** Um hambúrguer bem feito, com carne suculenta na chapa, queijo de verdade e pão macio é arte pura!\n\n` +
      `Para matar sua fome ${locContext}, eu recomendo **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? ` ou **${second.dish.name}** no **${second.restaurant.name}** (${second.restaurant.neighborhood}) por **R$ ${second.dish.price.toFixed(2).replace('.', ',')}**!`
        : `!`) +
      ` Nada de carne seca, só suculência!`;
  } else if (matchedIntentRule?.intent === 'doces_acai') {
    chefMood = 'Pâtissier & Fã de Sobremesa Praiana';
    reply =
      `**La vie est douce, mon ami!** Depois de caminhar pela praia de Caraguá, uma sobremesa gelada ou um doce artesanal cai como uma luva!\n\n` +
      `Olha o que eu separei ${locContext}: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**!`;
  } else if (maxBudget !== null) {
    chefMood = 'Chef Amigo do Bolso';
    reply =
      `**Comer bem sem gastar muito? Isso é inteligência gastronômica!** Quem disse que precisa pagar caro para ter *tompero* de chef?\n\n` +
      `Filtrei opções reais ${locContext} dentro do seu orçamento de **até R$ ${maxBudget},00**, começando por **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por apenas **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**!`;
  } else {
    reply =
      `**Bonjour, mon ami!** Fui pessoalmente garimpar os cardápios reais ${locContext} para o seu pedido (**"${rawQuery}"**)!\n\n` +
      `Minha primeira escolha com muito *tompero* é **${first.dish.name}** lá no **${first.restaurant.name}** (${first.restaurant.neighborhood}), saindo por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**` +
      (second
        ? `, seguida de **${second.dish.name}** no **${second.restaurant.name}** (${second.restaurant.neighborhood}) por **R$ ${second.dish.price.toFixed(2).replace('.', ',')}**!`
        : `!`) +
      ` Confira os pratos selecionados logo abaixo:`;
  }

  const detectedIntent = matchedIntentRule?.intent || 'geral';
  const detectedLocationLabel = matchedLandmark?.label || explicitNeighborhood || null;
  const brainStats: JacquinBrainStats = {
    version: brain40k.version || '4.0.0-jacquin-ollama-40k',
    modelName: brain40k.modelName || 'jacquin-carafood:latest',
    baseModel: brain40k.baseModel || 'qwen2.5:3b',
    totalTrainedQuestions: brain40k.totalTrainedQuestions || 42870,
    totalCatalogDishes: brain40k.totalCatalogDishes || 2645,
    totalRestaurants: brain40k.totalRestaurants || 61,
    totalOfficialNeighborhoods: brain40k.totalOfficialNeighborhoods || 53,
  };

  return {
    reply,
    answer: reply,
    dishes: recommendations,
    recommendations,
    detectedIntent,
    detectedLocationLabel,
    chefMood,
    brainStats,
    ollamaMessages: buildOllamaRagMessages(
      rawQuery,
      recommendations,
      matchedIntentRule?.labelPt || detectedIntent,
      detectedLocationLabel
    ),
  };
}
