import dump from '../data/caraguaRealDump.json';
import brain40k from '../data/jacquin40kBrain.json';
import { RestaurantCardData, DishPreview } from '../data/realDataStore';

// ==============================================================================
// MOTOR SEMÂNTICO, SENSORIAL & ONTOLÓGICO — CHEF ÉRICK JACQUIN PRAIANO (v5.0)
// ==============================================================================
// - Indexa todos os 2.645+ pratos reais e 61 estabelecimentos de Caraguatatuba;
// - 18 Intenções Gastronômicas Completas (Espetinho/Churrasco, Marmita/PF,
//   Feijoada/Raiz, Parmegiana/Milanesa, Frutos do Mar/Caiçara, Sushi/Oriental,
//   Pizza/Calzone, Massas/Lasanha, Pastel/Salgados/Esfiha, Hambúrguer/Smash,
//   Hot Dog/Beirute, Frango Crocante, Porções/Boteco, Caldos/Sopas, Vegano/Fit,
//   Açaí/Sorvetes/Milkshake, Doces/Confeitaria/Pudim, Bebidas/Cerveja);
// - 9 Perfis Sensoriais & Atipicagem (Picante/Apimentado, Agridoce/Caramelizado,
//   Defumado/Brasa, Crocante/Sequinho, Cremoso/Queijudo, Cítrico/Ácido/Fresco,
//   Quentinho/Chuva/Conforto, Exótico/Autoral, Gigante/Fome Monstro/Ressaca);
// - Firewall Estrito Anti-Pudim (buscas salgadas JAMAIS retornam sobremesas,
//   bebidas soltas, talheres ou balas de caixa; buscas doces JAMAIS retornam salgados);
// - Prioridade Ontológica Absoluta: A comida/perfil sensorial pedido SEMPRE
//   domina o ranking (+300 pts), usando o bairro/landmark como ordenador geográfico.
// ==============================================================================

export function normalizeStr(val?: string | null): string {
  if (!val) return '';
  return val
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Reduz diminutivos e plurais comuns da culinária brasileira para radicais canônicos.
 */
export function canonicalizeFoodText(raw: string): string {
  const n = normalizeStr(raw);
  return n
    .replace(/\bespetinhos\b/g, 'espeto espetinho')
    .replace(/\bespetinho\b/g, 'espeto espetinho')
    .replace(/\bespetos\b/g, 'espeto espetinho')
    .replace(/\bespetto\b/g, 'espeto espetinho')
    .replace(/\bespetaria\b/g, 'espeto espetinho churrasco')
    .replace(/\bchurrasquinho\b/g, 'churrasco espeto')
    .replace(/\bpastelzinho\b/g, 'pastel pastelzinho')
    .replace(/\bpasteis\b/g, 'pastel')
    .replace(/\bcaldinhos\b/g, 'caldo caldinho')
    .replace(/\bcaldinho\b/g, 'caldo caldinho')
    .replace(/\bmarmitinha\b/g, 'marmita')
    .replace(/\blanchinho\b/g, 'lanche')
    .replace(/\bsalgadinhos\b/g, 'salgado')
    .replace(/\bsalgadinho\b/g, 'salgado')
    .replace(/\bdocinhos\b/g, 'doce')
    .replace(/\bdocinho\b/g, 'doce')
    .replace(/\bpeixinho\b/g, 'peixe')
    .replace(/\bcamaraozinho\b/g, 'camarao')
    .replace(/\bcervejinha\b/g, 'cerveja')
    .replace(/\bapimentada\b/g, 'picante apimentado pimenta')
    .replace(/\bapimentado\b/g, 'picante apimentado pimenta');
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

// ==============================================================================
// FIREWALLS DE INTEGRIDADE ALIMENTAR (ANTI-PUDIM / ANTI-BEBIDA / ANTI-BALA)
// ==============================================================================

const DRINK_CATEGORY_SET = new Set([
  'bebida',
  'bebidas',
  'bebidas geladas!',
  'bebidas 🥤',
  '🥤 bebidas',
  '🥤bebidas',
  'promocao bebidas',
  'refrigerante',
  'refrigerantes',
  'refrigerantes e sucos',
  'refrigerantes🥤',
  'softs',
  'suco',
  'suco natural de fruta delivery',
  'sucos',
  'sucos e chas',
  'sucos naturais de frutas',
  'kit 10 sucos detox',
  'kit 5 sucos detox',
  'kit detox',
  'agua',
  'agua mineral',
  'cerveja',
  'cerveja artesanal regional',
  'cervejas',
  'cervejas / ice',
  'cervejas caixas !',
  'cervejas latas!',
  'cervejas longneck',
  "long neck's",
  'chopp de vinho',
  'carta de vinhos',
  'vinhos',
  'drinks especiais',
  "gin 's",
  "ice's",
  "vodka 's",
  'aguardente',
  'combos whisky',
  'energeticos',
]);

const DESSERT_CATEGORY_SET = new Set([
  'o melhor pudim da sua vida!',
  'sobremesa',
  'sobremesas',
  'sobremesas :p',
  '😍sobremesas pra adocar sua vida',
  'espetos doces / sobremesas',
  'doces',
  'doces especiais',
  'doces da rai!!!',
  'docinhos festa',
  'doses de docura',
  'combos de docura!',
  'fatias da felicidade🍰🍰🍰',
  'bolos caseiros',
  'brigadeiro',
  'sanduiche de brownie',
  'pizza brownie & cookies',
  'founde de frutas',
  'copo da felicidade 400ml',
  'barca de churros',
  'churros festa 20g',
  'churros gourmet',
  'churros tradicional 100g',
  'mini churros recheado',
  'trufadinhos da verano',
  'acaigurte',
  'acai - do jeito voce ama !',
  'acai',
  'acai - 1 adicional gratis',
  'acai do seu jeitinho c/adicionais gratis',
  'acai e sorvetes jcr',
  'acai mais pedido',
  'acai no copo',
  'acai do point do japa',
  'monte seu acai',
  'pote de 1 litro de acai',
  'marmitinhas verano c/adicionais inclusos',
  'verano em dobro',
  'sorvetes',
  'tortas de sorvete',
  'potes napoli',
  'napoleta',
  'frozen',
  '🥶 loucos por geladinhos',
  'milk shake',
  'milk shake - cada um melhor que o outro!',
  'milk shake alcoolicos - voce tem provar!',
  'pizza doce',
  'pizzas doces',
  'pizzas  doces individuais',
  'pizzas doces 🍫',
  'esfihas doces 💜',
  'esfihas gourmet doces',
  'pastel doces',
  'pastel doce',
  'hotroll doce',
]);

const NON_FOOD_OR_CASHIER_CANDY_KEYWORDS = [
  'kit talher',
  'colher descartavel',
  'sacola',
  'embalagem',
  'chantilly adicional',
  'molho adicional',
  'molho picante',
  'maionese adicional',
  'trident',
  'halls',
  'chiclete',
  'plutonita',
  'drops garoto',
  'pacoquita rolha',
  'batom ao leite',
  'batom creme',
  'batom branco',
  'trento 29g',
  'mini talento',
];

export function isNonFoodOrCashierCandy(dishName: string, category: string, price: number): boolean {
  const n = normalizeStr(dishName);
  const c = normalizeStr(category);
  if (NON_FOOD_OR_CASHIER_CANDY_KEYWORDS.some((kw) => n.includes(kw))) {
    return true;
  }
  if (
    c === 'adicionais' ||
    c === '🍚 adicionais' ||
    c === 'molho adicional' ||
    c === 'molhos adicionais' ||
    c.includes('dips - molho') ||
    c === 'mistura extra individual' ||
    c.includes('proteinas premium') ||
    c.includes('turbine seu marmitex') ||
    n.startsWith('mistura ')
  ) {
    return true;
  }
  // Acompanhamentos soltos de baixo valor (arroz branco R$ 6,50, farofa R$ 3,50, pão francês R$ 2,50)
  if (c === 'acompanhamentos' && price <= 12.0 && !n.includes('palmito')) {
    return true;
  }
  if (price <= 4.0 && (n === 'pacoquita' || n === 'trento' || n === 'prestigio' || n === 'doce de amendoim')) {
    return true;
  }
  return false;
}

export function isPureDrinkItem(dishName: string, category: string): boolean {
  const n = normalizeStr(dishName);
  const c = normalizeStr(category);
  if (
    DRINK_CATEGORY_SET.has(c) ||
    c.includes('bebida') ||
    c.includes('refrigerante') ||
    c.includes('cerveja') ||
    c.includes('longneck') ||
    c.includes('vinhos') ||
    c.includes('energetico')
  ) {
    return true;
  }
  if (
    /\b(coca[- ]?cola|guarana|fanta|sprite|schweppes|h2o|h2oh|h20|agua mineral|agua com gas|agua sem gas|agua s\/ gas|agua tonica|heineken|budweiser|skol|brahma|itaipava|eisenbahn|esenbahn|spaten|stella long|corona long|colorado lata|red bull|monster tradicional|monster mango|smirnoff ice|kapo uva)\b/.test(
      n
    )
  ) {
    if (!n.includes('combo') && !n.includes('+') && !n.includes('costela na cerveja')) {
      return true;
    }
  }
  return false;
}

export function isSweetOrDessertItem(
  dishName: string,
  dishDesc: string,
  category: string,
  restName: string
): boolean {
  const n = normalizeStr(dishName);
  const d = normalizeStr(dishDesc);
  const c = normalizeStr(category);
  const r = normalizeStr(restName);

  // Combos salgados que dão 1 pudim/refri de brinde (ex: "2 Chicken Bacon + 1 Pudim", "PRATO PREMIUM + PUDIM") são refeições salgadas
  if (
    (n.includes('chicken') || n.includes('prato premium') || n.includes('marmita') || n.includes('burguer')) &&
    n.includes('+')
  ) {
    return false;
  }

  if (
    DESSERT_CATEGORY_SET.has(c) ||
    c.includes('sobremesa') ||
    c.includes('doce') ||
    c.includes('acai') ||
    c.includes('sorvete') ||
    c.includes('churros') ||
    c.includes('milk shake') ||
    c.includes('geladinho') ||
    c.includes('fatias da felicidade')
  ) {
    return true;
  }

  if (
    /\b(pudim|brigadeiro|brownie|banoffee|churros|milk\s?shake|sorvete|gelato|napoleta|acai|acaigurte|geladinho|torta holandesa|copo da felicidade|petit gateau|mousse|nutella|doce de leite|romeu e julieta|fondue|founde|chocobanana|chocomix|sonho de valsa|ouro branco|sensacao|prestigio|bolo chocoau|bolo mau|amossi|trufado|trufadinho|pao de mel|alfajor)\b/.test(
      n
    )
  ) {
    return true;
  }

  // Confeitarias e Açaíterias puras (exceto quando vendem salgados/pastéis/pizzas salgadas)
  if (
    (r.includes('sorvete') || r.includes('acai') || r.includes('verano') || r.includes('milena palma')) &&
    !n.includes('panqueca') &&
    !n.includes('lasanha') &&
    !n.includes('empada') &&
    !n.includes('quiche') &&
    !n.includes('salgad') &&
    !n.includes('pastel') &&
    !n.includes('torta de frango') &&
    !d.includes('frango') &&
    !d.includes('carne') &&
    !d.includes('camarao') &&
    !d.includes('alho poro') &&
    !d.includes('palmito')
  ) {
    return true;
  }

  return false;
}

// ==============================================================================
// GEOGRAFIA & PONTOS DE REFERÊNCIA REAIS DE CARAGUATATUBA (53 BAIRROS)
// ==============================================================================

interface LandmarkRule {
  keywords: string[];
  label: string;
  lat: number;
  lon: number;
  priorityNeighborhoods: string[];
}

const CARAGUA_LANDMARKS: LandmarkRule[] = [
  {
    keywords: ['shopping serramar', 'serramar', 'shopping'],
    label: 'pertinho do Shopping Serramar (Pontal / Morro do Algodão / Praia das Palmeiras)',
    lat: -23.6606,
    lon: -45.4375,
    priorityNeighborhoods: [
      'pontal de santa marina',
      'praia das palmeiras',
      'morro do algodao',
      'jardim gaivotas',
      'porto novo',
      'poiares',
      'tinga',
      'indaia',
    ],
  },
  {
    keywords: ['pontal de santa marina', 'pontal', 'santa marina'],
    label: 'na região do Pontal de Santa Marina (Costa Sul / Praia das Palmeiras / Porto Novo)',
    lat: -23.6585,
    lon: -45.4342,
    priorityNeighborhoods: [
      'pontal de santa marina',
      'praia das palmeiras',
      'porto novo',
      'morro do algodao',
      'poiares',
      'indaia',
      'tinga',
      'centro',
    ],
  },
  {
    keywords: ['modulo', 'faculdade modulo', 'universidade', 'cruzeiro do sul', 'faculdade'],
    label: 'próximo à Faculdade Módulo / Cruzeiro do Sul (Centro / Martim de Sá)',
    lat: -23.6215,
    lon: -45.4085,
    priorityNeighborhoods: ['centro', 'martim de sa', 'sumare', 'indaia', 'ipiranga'],
  },
  {
    keywords: ['candido mota', 'praca', 'calçadao', 'calcadao', 'igreja matriz', 'centro'],
    label: 'no coração do Centro (Praça Cândido Mota)',
    lat: -23.6226,
    lon: -45.4124,
    priorityNeighborhoods: ['centro', 'sumare', 'indaia', 'ipiranga', 'martim de sa'],
  },
  {
    keywords: ['camaroeiro', 'mirante', 'entreposto', 'peixaria', 'prainha', 'pedra do jacare'],
    label: 'na região do Camaroeiro e Prainha',
    lat: -23.6195,
    lon: -45.3982,
    priorityNeighborhoods: ['prainha', 'martim de sa', 'centro', 'sumare'],
  },
  {
    keywords: ['martim de sa', 'martim', 'orla martim'],
    label: 'na Orla de Martim de Sá',
    lat: -23.6168,
    lon: -45.3886,
    priorityNeighborhoods: ['martim de sa', 'prainha', 'centro', 'sumare'],
  },
  {
    keywords: ['cocanha', 'massaguacu', 'capricornio', 'tabatinga', 'mocooca', 'costa norte', 'zona norte'],
    label: 'na Costa Norte (Massaguaçu / Cocanha / Tabatinga)',
    lat: -23.5762,
    lon: -45.3248,
    priorityNeighborhoods: ['massaguacu', 'martim de sa', 'prainha', 'centro'],
  },
  {
    keywords: ['porto novo', 'flexeiras', 'praia das palmeiras', 'palmeiras', 'aruan', 'britania'],
    label: 'na Orla Sul (Porto Novo / Praia das Palmeiras / Flexeiras)',
    lat: -23.6712,
    lon: -45.4421,
    priorityNeighborhoods: [
      'porto novo',
      'praia das palmeiras',
      'flexeiras',
      'morro do algodao',
      'jardim gaivotas',
      'poiares',
      'indaia',
    ],
  },
  {
    keywords: ['morro do algodao', 'algodao', 'golfinhos', 'gaivotas', 'barranco alto'],
    label: 'no Morro do Algodão / Barranco Alto / Gaivotas',
    lat: -23.6785,
    lon: -45.451,
    priorityNeighborhoods: [
      'morro do algodao',
      'barranco alto',
      'jardim gaivotas',
      'porto novo',
      'praia das palmeiras',
      'pereque-mirim',
      'travessao',
    ],
  },
  {
    keywords: ['travessao', 'pereque', 'pereque-mirim', 'tarumas', 'pegorelli', 'extremo sul'],
    label: 'no Eixo Sul (Travessão / Perequê-Mirim / Tarumãs)',
    lat: -23.6942,
    lon: -45.4635,
    priorityNeighborhoods: [
      'travessao',
      'pereque-mirim',
      'tarumas',
      'barranco alto',
      'morro do algodao',
      'porto novo',
    ],
  },
  {
    keywords: ['rodoviaria', 'terminal', 'hospital', 'stella maris', 'indaia', 'poiares', 'tinga', 'jaqueira'],
    label: 'no eixo Indaiá / Poiares / Tinga',
    lat: -23.6352,
    lon: -45.4218,
    priorityNeighborhoods: ['indaia', 'poiares', 'tinga', 'centro', 'sumare', 'ipiranga', 'jardim primavera'],
  },
];

// Mapa completo dos 53 bairros oficiais de Caraguatatuba para os polos vizinhos com restaurantes ativos
const NEIGHBORHOOD_PROXIMITY_GRAPH: Record<string, string[]> = {
  tabatinga: ['massaguacu', 'martim de sa', 'centro'],
  mocooca: ['massaguacu', 'martim de sa', 'centro'],
  cocanha: ['massaguacu', 'martim de sa', 'centro'],
  massaguacu: ['massaguacu', 'martim de sa', 'prainha', 'centro'],
  capricornio: ['massaguacu', 'martim de sa', 'centro'],
  'portal fazendinha': ['massaguacu', 'martim de sa', 'centro'],
  jetuba: ['massaguacu', 'martim de sa', 'centro'],
  'martim de sa': ['martim de sa', 'prainha', 'centro', 'sumare'],
  prainha: ['prainha', 'martim de sa', 'centro', 'sumare'],
  camaroeiro: ['prainha', 'martim de sa', 'centro', 'sumare'],
  centro: ['centro', 'sumare', 'indaia', 'ipiranga', 'martim de sa', 'prainha'],
  sumare: ['sumare', 'centro', 'indaia', 'ipiranga', 'martim de sa'],
  ipiranga: ['ipiranga', 'centro', 'sumare', 'indaia', 'martim de sa'],
  'cidade jardim': ['martim de sa', 'centro', 'sumare'],
  'vila ponte seca': ['centro', 'martim de sa', 'tinga', 'poiares'],
  indaia: ['indaia', 'centro', 'poiares', 'tinga', 'sumare', 'ipiranga', 'jardim primavera'],
  'jardim aruan': ['indaia', 'praia das palmeiras', 'poiares', 'porto novo', 'centro'],
  poiares: ['poiares', 'indaia', 'tinga', 'jardim primavera', 'olaria', 'centro'],
  'jardim jaqueira': ['poiares', 'tinga', 'indaia', 'centro'],
  tinga: ['tinga', 'poiares', 'olaria', 'jardim primavera', 'indaia', 'centro'],
  'rio do ouro': ['tinga', 'poiares', 'centro', 'olaria'],
  jaraguazinho: ['tinga', 'poiares', 'olaria', 'centro'],
  benfica: ['centro', 'indaia', 'tinga', 'poiares'],
  'canta galo': ['tinga', 'poiares', 'centro'],
  'jardim primavera': ['jardim primavera', 'poiares', 'indaia', 'tinga', 'centro'],
  'jardim california': ['poiares', 'indaia', 'tinga', 'centro'],
  'jardim mariella': ['poiares', 'indaia', 'praia das palmeiras'],
  'jardim casa branca': ['olaria', 'tinga', 'poiares', 'centro'],
  olaria: ['olaria', 'tinga', 'poiares', 'centro'],
  caputera: ['centro', 'sumare', 'tinga'],
  "estrela d'alva": ['centro', 'indaia', 'tinga'],
  'praia das palmeiras': ['praia das palmeiras', 'porto novo', 'flexeiras', 'jardim gaivotas', 'morro do algodao', 'poiares', 'indaia'],
  'pontal de santa marina': ['praia das palmeiras', 'porto novo', 'morro do algodao', 'jardim gaivotas', 'poiares', 'tinga', 'indaia', 'centro'],
  'porto novo': ['porto novo', 'praia das palmeiras', 'flexeiras', 'morro do algodao', 'jardim gaivotas'],
  'jardim britania': ['porto novo', 'praia das palmeiras', 'flexeiras', 'morro do algodao'],
  flexeiras: ['flexeiras', 'porto novo', 'praia das palmeiras', 'morro do algodao'],
  'morro do algodao': ['morro do algodao', 'jardim gaivotas', 'porto novo', 'praia das palmeiras', 'barranco alto'],
  golfinhos: ['morro do algodao', 'jardim gaivotas', 'porto novo', 'barranco alto'],
  'jardim gaivotas': ['jardim gaivotas', 'morro do algodao', 'porto novo', 'praia das palmeiras', 'poiares'],
  'barranco alto': ['barranco alto', 'morro do algodao', 'travessao', 'pereque-mirim', 'tarumas', 'porto novo'],
  'jardim dos sindicatos': ['morro do algodao', 'barranco alto', 'porto novo'],
  'jardim tarumas': ['tarumas', 'travessao', 'pereque-mirim', 'barranco alto'],
  tarumas: ['tarumas', 'travessao', 'pereque-mirim', 'barranco alto'],
  pegorelli: ['pereque-mirim', 'travessao', 'tarumas', 'barranco alto'],
  'pereque-mirim': ['pereque-mirim', 'travessao', 'tarumas', 'barranco alto', 'morro do algodao'],
  travessao: ['travessao', 'pereque-mirim', 'tarumas', 'barranco alto', 'morro do algodao'],
};

// ==============================================================================
// 18 INTENÇÕES GASTRONÔMICAS COMPLETAS
// ==============================================================================

interface FoodIntentRule {
  intent: string;
  labelPt: string;
  isSweetIntent?: boolean;
  isDrinkIntent?: boolean;
  triggerWords: string[];
  positiveDishKeywords: string[];
  positiveCategoryKeywords: string[];
  positiveRestaurantKeywords: string[];
  requiredFoodType?: string;
  negativeDishKeywords: string[];
  chefMood: string;
  buildJacquinIntro: (locContext: string, firstDish: string, firstRest: string, firstNeigh: string, firstPrice: string, secondText: string) => string;
}

const FOOD_INTENT_RULES: FoodIntentRule[] = [
  {
    intent: 'espetinho_churrasco',
    labelPt: 'Espetinhos na Brasa, Churrasco & Carnes Grelhadas',
    triggerWords: [
      'espeto',
      'espetinho',
      'espetinhos',
      'espetto',
      'espetaria',
      'churrasco',
      'churrasquinho',
      'churrascaria',
      'picanha',
      'kafta',
      'medalhao',
      'pao de alho',
      'queijo coalho',
      'coracao de frango',
      'tulipa',
      'alcatra',
      'salsichao',
      'carne na brasa',
      'na brasa',
    ],
    positiveDishKeywords: [
      'espetinho',
      'espeto',
      'picanha',
      'kafta',
      'medalhao',
      'pao de alho',
      'queijo coalho',
      'tulipa',
      'alcatra',
      'costela bovina',
      'costelinha',
      'contra file',
      'churrasco',
      'salsichao',
      'linguica',
      'coracao',
      'sobrecoxa',
      'panceta',
    ],
    positiveCategoryKeywords: ['espetos', 'espetos tradicionais', 'medalhao', 'grelhados'],
    positiveRestaurantKeywords: ['sr. espetto', 'churras mais', 'inbrasa', 'rock bar'],
    requiredFoodType: 'churrasco',
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'bolo', 'brigadeiro', 'churros', 'milkshake', 'pastel doce', 'pizza doce'],
    chefMood: 'Mestre da Brasa & Churrasqueira Quente',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Sacré bleu, sentiu o perfume de brasa no ar, mon ami?** Espetinho e churrasco de respeito precisam de carvão estalando, carne suculenta no ponto e aquele *tompero* que dá água na boca (nada de sobremesa quando a fome é de brasa!)!\n\n` +
      `Para o seu pedido ${loc}, minha escolha nº 1 na grelha é **${fDish}** lá no **${fRest}** (${fNeigh}), saindo por **R$ ${fPrice}**${sec} Tudo assado no capricho! Veja os cartões abaixo:`,
  },
  {
    intent: 'marmita',
    labelPt: 'Marmita, PF, Almoço Caseiro & Executivo',
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
      'arroz e feijao',
      'bife',
      'strogonoff',
      'estrogonofe',
      'picadinho',
      'almondega',
      'escondidinho',
      'virado paulista',
      'copa lombo',
      'comida de verdade',
    ],
    positiveDishKeywords: [
      'marmita',
      'marmitex',
      'executivo',
      'executiva',
      'prato premium',
      'strogonoff',
      'estrogonofe',
      'parmegiana',
      'churrasco premium',
      'almondegas',
      'escondidinho',
      'virado paulista',
      'bife',
      'file de frango',
      'copa lombo',
      'tiras de carne',
      'iscas de carne',
      'completa balanceada',
      'pernil acebolado',
    ],
    positiveCategoryKeywords: ['marmitex', 'almoco', 'pratos executivos', 'escondidinhos quentes', 'os mais pedidos no almoco'],
    positiveRestaurantKeywords: [
      'marmitaria',
      'point do pirao',
      'le cheff',
      'sabor de casa',
      'sabor do litoral',
      'restaurante do jorginho',
      'delicias da lu',
      'magia do sabor',
      'restaurante caicaras',
      'prime fit',
    ],
    requiredFoodType: 'marmitas',
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'churros', 'brigadeiro', 'kit talher', 'paçoquita', 'trident', 'halls'],
    chefMood: 'Fiscal de Panela & Almoço Caseiro',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Mon Dieu, bateu aquela fome de almoço de verdade?** Marmita sem *tompero* é *vergonha da profission*, por isso eu selecionei pessoalmente as cozinhas caseiras mais caprichadas ${loc}!\n\n` +
      `Olha essa joia: **${fDish}** lá no **${fRest}** (${fNeigh}), saindo por **R$ ${fPrice}**${sec} Comida farta, arroz soltinho, feijão temperado e preço honesto:`,
  },
  {
    intent: 'feijoada_raiz',
    labelPt: 'Feijoada Completa, Costela & Comida Raiz Brasileira',
    triggerWords: ['feijoada', 'feijao gordo', 'torresmo', 'vaca atolada', 'costela na cerveja', 'comida raiz', 'virado'],
    positiveDishKeywords: ['feijoada', 'vaca atolada', 'costela na cerveja', 'virado paulista', 'torresmo', 'mandioca com carne seca', 'costela'],
    positiveCategoryKeywords: ['almoco', 'marmitex', 'caldos quentes'],
    positiveRestaurantKeywords: ['restaurante do jorginho', 'le cheff', 'rock bar', 'point do pirao', 'sabor de casa'],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'churros'],
    chefMood: 'Apaixonado por Panela de Barro & Feijoada',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Oh là là, feijoada e comida raiz brasileira são patrimônio mundial do sabor!** Tem que ter caldo encorpado, couve fresquinha e muito *tompero*!\n\n` +
      `Garimpei ${loc} e encontrei **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Prepare o apetite e confira abaixo:`,
  },
  {
    intent: 'parmegiana_milanesa',
    labelPt: 'Filé à Parmegiana, Milanesa & Gratinados',
    triggerWords: ['parmegiana', 'parmegianna', 'milanesa', 'a milanesa', 'file a parmegiana', 'frango a parmegiana'],
    positiveDishKeywords: ['parmegiana', 'milanesa', 'empanado', 'gratinad'],
    positiveCategoryKeywords: ['parmegianas', 'almoco', 'marmitex executiva', 'pratos executivos'],
    positiveRestaurantKeywords: ['sabor de casa', 'point do pirao', 'batatuba', 'rock bar', 'restaurante caicaras', 'restaurante do jorginho'],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete'],
    chefMood: 'Crítico de Empanamento Crocante & Queijo Gratinado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**C'est magnifique!** Um bom Parmegiana ou Milanesa exige crosta sequinha, molho de tomate artesanal e queijo gratinado borbulhando!\n\n` +
      `Aqui ${loc}, meu destaque absoluto é **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Uma obra de arte no prato:`,
  },
  {
    intent: 'frutos_do_mar',
    labelPt: 'Camarão, Peixes, Lula, Moqueca & Culinária Caiçara',
    triggerWords: [
      'camarao',
      'peixe',
      'frutos do mar',
      'tilapia',
      'badejo',
      'tainha',
      'pescada',
      'lula',
      'marisco',
      'mexilhao',
      'bacalhau',
      'siri',
      'casquinha',
      'quiosque',
      'caicara',
      'moqueca',
      'caldeirada',
      'isca de peixe',
      'salmao grelhado',
    ],
    positiveDishKeywords: [
      'camarao',
      'peixe',
      'tilapia',
      'pescada',
      'badejo',
      'lula',
      'bacalhau',
      'marisco',
      'siri',
      'moqueca',
      'isca de peixe',
      'isca de tilapia',
      'bolinho de bacalhau',
      'salmao',
      'frutos do mar',
    ],
    positiveCategoryKeywords: ['peixes/crustaceos', 'bolinho de bacalhau', 'porcoes'],
    positiveRestaurantKeywords: [
      'pe na areia',
      'restaurante caicaras',
      'mare mar',
      'martim food',
      'point do pirao',
      'sabor do litoral',
      'xcoxinha',
      'restaurante do jorginho',
      'sr. espetto',
    ],
    requiredFoodType: 'frutos_do_mar',
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'brigadeiro', 'churros'],
    chefMood: 'Apaixonado pelo Mar de Caraguá • Freezer Ligado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**La mer de Caraguatatuba, c'est magnifique!** Vir para o nosso litoral e não comer um camarão crocante ou peixe fresco com *tompero* caiçara é um crime gastronômico!\n\n` +
      `Separei as melhores pedidas do mar ${loc}, começando por **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Tudo fresquinho e com freezer impecável:`,
  },
  {
    intent: 'sushi',
    labelPt: 'Sushi, Sashimi, Temaki, Hot Roll, Yakisoba & Ceviche',
    triggerWords: [
      'sushi',
      'japa',
      'japonesa',
      'japones',
      'temaki',
      'sashimi',
      'combinado',
      'barca',
      'yakisoba',
      'yakissoba',
      'lamen',
      'missoshiro',
      'hot roll',
      'hotroll',
      'uramaki',
      'hossomaki',
      'niguiri',
      'tepan',
      'oriental',
      'ceviche',
      'poke',
      'sunomono',
      'shimeji',
      'guioza',
      'harumaki',
    ],
    positiveDishKeywords: [
      'sushi',
      'sashimi',
      'temaki',
      'combinado',
      'combo croc',
      'combo namorado',
      'hot roll',
      'hotroll',
      'uramaki',
      'hossomaki',
      'niguiri',
      'yakisoba',
      'yakissoba',
      'lamen',
      'misso',
      'ceviche',
      'poke',
      'sunomono',
      'tepan',
      'salmao',
      'pecas',
    ],
    positiveCategoryKeywords: ['sushi', 'sushi e temaki', 'temaki', 'sashimi', 'uramaki', 'hossomaki', 'hotroll', 'combinado', 'lamen', 'yakissoba', 'poke', 'orientais'],
    positiveRestaurantKeywords: ['narigato', 'point do japa', 'kampai', 'japa loka'],
    requiredFoodType: 'sushi',
    negativeDishKeywords: ['pudim', 'acai', 'churros', 'feijoada'],
    chefMood: 'Inspeção Rigorosa de Peixe Fresco & Corte Oriental',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Attention! Na culinária japonesa eu sou implacável:** o salmão tem que brilhar de frescor e a geladeira tem que estar na temperatura exata!\n\n` +
      `Aqui ${loc}, minha recomendação oriental de ouro é **${fDish}** do **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Pode pedir de olhos fechados, *mon cher*:`,
  },
  {
    intent: 'pizza',
    labelPt: 'Pizzas Artesanais, Forno a Lenha & Calzones',
    triggerWords: [
      'pizza',
      'pizzaria',
      'calzone',
      'marguerita',
      'margherita',
      'calabresa',
      'portuguesa',
      'quatro queijos',
      '4 queijos',
      '5 queijos',
      '6 queijos',
      'pepperoni',
      'peperoni',
      'napolitana',
      'forno a lenha',
      'brotinho',
    ],
    positiveDishKeywords: [
      'pizza',
      'calzone',
      'marguerita',
      'margherita',
      'calabresa',
      'mussarela',
      'mozarela',
      'portuguesa',
      'quatro queijos',
      '4 queijos',
      'pepperoni',
      'peperoni',
      'catupperoni',
      'frango com catupiry',
      'frango e catupiry',
      'toscana',
      'baiana',
      'napolitana',
      'caprese',
    ],
    positiveCategoryKeywords: [
      'pizza',
      'pizzas',
      'pizzas salgadas',
      'pizzas tradicionais',
      'pizzas especiais',
      'calzone',
      'pizza promo',
    ],
    positiveRestaurantKeywords: [
      'nonna peroni',
      'solepizza',
      'pizzaria rocha',
      'pizzaria venezza',
      'w&v pizzaria',
      'don corleone',
      'ideal pizzaria',
      'xp hamburgueria',
    ],
    requiredFoodType: 'pizza',
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'feijoada'],
    chefMood: 'Crítico de Fermentação Lenta & Forno Quente',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Une bonne pizza!** Massa bem fermentada, borda dourada, molho de tomate fresco e queijo derretendo com muito *tompero*!\n\n` +
      `Garimpei as pizzarias ${loc} e destaquei **${fDish}** da **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Clique no cartão abaixo para pedir a sua:`,
  },
  {
    intent: 'massas_lasanha',
    labelPt: 'Lasanhas, Nhoques, Panquecas & Massas Caseiras',
    triggerWords: ['lasanha', 'nhoque', 'macarrao', 'espaguete', 'talharim', 'massa', 'bolonhesa', 'panqueca'],
    positiveDishKeywords: ['lasanha', 'nhoque', 'macarrao', 'panqueca', 'bolonhesa', 'massa'],
    positiveCategoryKeywords: ['lasanhas quentes', 'massas', 'massas premium', 'nhoques', 'panquecas', 'macarrao na chapa'],
    positiveRestaurantKeywords: ['le cheff', 'delicias da lu', 'restaurante caicaras', 'point do pirao', 'batatuba'],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete'],
    chefMood: 'Especialista em Massas Frescas & Molho Encorpado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Mamma mia com sotaque francês!** Uma lasanha gratinada, nhoque macio ou panqueca artesanal bem recheada aquece o coração!\n\n` +
      `Para você ${loc}, selecionei **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Veja que maravilha:`,
  },
  {
    intent: 'pastel_salgados',
    labelPt: 'Pastel de Feira Crocante, Coxinha, Esfiha & Salgados',
    triggerWords: [
      'pastel',
      'pasteis',
      'pastelaria',
      'pastelzinho',
      'coxinha',
      'salgado',
      'salgadinho',
      'esfiha',
      'esfirra',
      'kibe',
      'quibe',
      'empada',
      'bolinho caipira',
      'pao de queijo',
    ],
    positiveDishKeywords: [
      'pastel',
      'pastelzinho',
      'coxinha',
      'coxim',
      'esfiha',
      'kibe',
      'quibe',
      'empada',
      'salgado',
      'salgadinho',
      'bolinho caipira',
      'bolinho de carne',
      'pao de queijo',
    ],
    positiveCategoryKeywords: [
      'pastel',
      'pasteis',
      'pastel simples',
      'pastel duplo',
      'pastel especiais',
      'pastel de casa',
      'pastelzinho',
      'salgados',
      'mini salgados',
      'esfihas',
      'esfihas gourmet salgadas',
      'assados - empadas',
      'pao de queijo',
      'bolinho caipira',
    ],
    positiveRestaurantKeywords: [
      'imperio dos pasteis',
      'mare mar',
      'martim food',
      'churras mais',
      'ki fest salgados',
      'teka salgados',
      'xcoxinha',
      'confeitaria da rai',
      'w&v pizzaria',
      'the best burguer',
    ],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete'],
    chefMood: 'Fã de Pastel de Feira Sequinho & Coxinha Crocante',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Voilà!** Um pastel frito na hora com massa crocante e sequinha, uma coxinha bem temperada ou uma esfiha quentinha são irresistíveis!\n\n` +
      `Aqui ${loc}, eu recomendo **${fDish}** lá no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Crocância nota 10:`,
  },
  {
    intent: 'lanches',
    labelPt: 'Hambúrgueres Artesanais, Smash Burgers & Lanches',
    triggerWords: [
      'lanche',
      'hamburguer',
      'hamburgueria',
      'burger',
      'burguer',
      'smash',
      'artesanal',
      'x-burguer',
      'x-salada',
      'x-bacon',
      'x-egg',
      'x-tudo',
      'brioche',
      'cheddar bacon',
    ],
    positiveDishKeywords: [
      'burger',
      'burguer',
      'smash',
      'cheddar',
      'bacon',
      'inbrasa',
      'marguerito',
      'gorgonsweet',
      'billy',
      'matador',
      'kaipirao',
      'x-burguer',
      'x-salada',
      'x-bacon',
      'ribs rock',
      'monster rock bar',
      'queen',
    ],
    positiveCategoryKeywords: [
      'burguers',
      'burguers artesanais',
      'hamburguer',
      'hamburgueres artesanais',
      'artesanais smash ;)',
      'lanches',
      'lanches artesanais',
      'famosinhos <3',
      'matadores de fome ;p',
      'vencedor do caragua a gosto',
    ],
    positiveRestaurantKeywords: [
      'padua burguer',
      'bs bgr',
      'xp hamburgueria',
      'inbrasa',
      'billy bruto',
      'chicken bruttos',
      'kaipiras lanches',
      'ex burguer',
      'the best burguer',
      'the furious burguer',
      'mt burguer',
      'top 10 lanches',
      'xp burger',
      'rock bar',
    ],
    requiredFoodType: 'lanches',
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'milkshake'],
    chefMood: 'Especialista em Reação de Maillard & Brioche Selado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Oh là là!** Hambúrguer bom precisa de crostinha caramelizada na chapa, carne suculenta, queijo derretendo de verdade e pão selado na manteiga!\n\n` +
      `Para matar sua fome ${loc}, eu assino embaixo de **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec} Nada de carne seca, só suculência:`,
  },
  {
    intent: 'hotdog_beirute',
    labelPt: 'Hot Dog Prensado, Cachorro-Quente, Beirute & Sanduíches',
    triggerWords: ['hot dog', 'hotdog', 'cachorro quente', 'dogao', 'salsicha', 'beirute', 'sanduiche', 'sanduba', 'bauru', 'misto'],
    positiveDishKeywords: ['hot dog', 'hotdog', 'cachorro quente', 'beirute', 'sanduba', 'diquinta', 'projeto verao', 'americano'],
    positiveCategoryKeywords: ['hot dog', 'hotdog', '🌭 hotdogs', 'hot dog em dobro', 'beirutes', 'sanduiches', 'sanduiches especiais'],
    positiveRestaurantKeywords: ['kaipiras lanches', 'bs bgr', 'divina gula', 'martim food', 'lanchonete arco iris', 'top 10 lanches'],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete'],
    chefMood: 'Curador de Sanduíches Fartos & Hot Dog Caprichado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Mon ami!** Um cachorro-quente bem recheado, beirute ou sanduíche especial feito no capricho salva qualquer noite em Caraguá!\n\n` +
      `Olha o destaque que encontrei ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'frango_crocante',
    labelPt: 'Frango Frito Crocante, Balde de Chicken & Tirinhas',
    triggerWords: ['frango frito', 'balde de frango', 'chicken', 'tirinhas de frango', 'isca de frango', 'frango crocante', 'frango empanado', 'nuggets'],
    positiveDishKeywords: ['chicken', 'balde', 'trio bruttos', 'quarteto bruttos', 'iscas de frango', 'tirinhas', 'frango crocante', 'duplo empanado', 'nuggets', 'tulipa'],
    positiveCategoryKeywords: ['baldes de frango', 'combos de frango', 'linha chicken supreme'],
    positiveRestaurantKeywords: ['chicken bruttos', 'franchicken', 'inbrasa', 'rock bar'],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete'],
    chefMood: 'Mestre do Empanamento Crocante & Dourado',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Crrrunc!** Frango empanado crocante por fora e suculento por dentro exige óleo novo, tempero na marinada e fritura precisa!\n\n` +
      `Aqui ${loc}, minha indicação número 1 é **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'porcoes_boteco',
    labelPt: 'Porções de Boteco, Batata com Cheddar/Bacon, Mandioca & Petiscos',
    triggerWords: [
      'porcao',
      'porcoes',
      'petisco',
      'petiscos',
      'boteco',
      'comida de boteco',
      'tiragosto',
      'batata frita',
      'fritas',
      'batata recheada',
      'batata rosti',
      'mandioca frita',
      'polenta',
      'onion rings',
      'anel de cebola',
      'calabresa acebolada',
      'happy hour',
    ],
    positiveDishKeywords: [
      'porcao',
      'fritas',
      'batata',
      'mandioca',
      'polenta',
      'onion rings',
      'anel de cebola',
      'calabresa',
      'picanha aperitivo',
      'contra file',
      'bolinho de carne seca',
      'bolinho de bacalhau',
      'costela quebrada',
      'coxim',
      'obolinho',
      'isca',
    ],
    positiveCategoryKeywords: [
      'porcoes',
      'porcoes especiais',
      'entradas e porcoes',
      'entradinhas',
      'comida de boteco',
      'batata frita',
      'batata rosti recheada',
      'batatas recheadas',
      'fritas',
    ],
    positiveRestaurantKeywords: [
      'rock bar',
      'sr. espetto',
      'churras mais',
      'bs bgr',
      'batatuba batataria',
      'pe na areia',
      'padua burguer',
      'kaipiras lanches',
    ],
    negativeDishKeywords: ['pudim', 'acai', 'sorvete', 'bolo'],
    chefMood: 'Rei do Happy Hour & Petisco de Boteco',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Santé, mon ami!** Para beliscar com os amigos ou abrir o apetite ${loc}, a porção tem que chegar quentinha, sequinha e bem servida!\n\n` +
      `Olha o campeão de boteco que eu separei: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'caldos_sopas',
    labelPt: 'Caldos Quentes, Caldo Verde, Vaca Atolada, Canja & Sopas',
    triggerWords: ['caldo', 'caldinho', 'caldinhos', 'caldo verde', 'caldo de feijao', 'canja', 'sopa', 'sopas', 'vaca atolada'],
    positiveDishKeywords: ['caldo', 'caldinho', 'vaca atolada', 'canja', 'feijao carioquinha (quente)', 'mandioquinha com carne seca', 'misso lamen', 'sopa'],
    positiveCategoryKeywords: ['caldinhos', 'caldos', 'caldos quentes', 'especial inverno', 'kit 5 sopas 500ml', 'kit 10 sopas 500ml'],
    positiveRestaurantKeywords: ['churras mais', 'le cheff', 'rock bar', 'ideal pizzaria', 'point do japa', 'prime fit'],
    negativeDishKeywords: ['cana', 'pudim', 'acai', 'sorvete'],
    chefMood: 'Chef dos Caldos Fumegantes & Cumbuca Quente',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Ah, um caldo bem quente e aveludado é um abraço na alma!** Feito no fogo lento com ingredientes frescos e muito *tompero*!\n\n` +
      `Aqui ${loc}, minha recomendação fumegante é **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'vegano_fit',
    labelPt: 'Opções Veganas, Vegetarianas, Fit, Low Carb & Sem Lactose/Glúten',
    triggerWords: [
      'vegano',
      'vegana',
      'vegetariano',
      'vegetariana',
      'sem carne',
      'sem lactose',
      'zero lactose',
      'intolerante',
      'sem gluten',
      'celiaco',
      'fit',
      'low carb',
      'lowcarb',
      'dieta',
      'saudavel',
      'salada',
      'legumes',
      'detox',
      'mounjaro',
      'palmito',
      'brocolis',
      'abobrinha',
    ],
    positiveDishKeywords: [
      'vegano',
      'vegan',
      'vegetariana',
      'vegetal',
      'intolerante',
      'fit',
      'low carb',
      'lowcarb',
      'balanceada',
      'salada',
      'legumes',
      'brocolis',
      'palmito',
      'abobrinha',
      'berinjela',
      'moqueca de banana da terra',
      'medalhao de palmito',
      'mounjaro',
    ],
    positiveCategoryKeywords: [
      'delicia da cozinha vegetal',
      'linha fit',
      'linha vegetariana',
      'veggie',
      'saladas',
      'sanduiches naturais',
      'menu mounjaro',
      'lowcarb 10 unidades',
    ],
    positiveRestaurantKeywords: ['prime fit', 'le cheff', 'delicias da lu', 'restaurante caicaras', 'solepizza', 'bs bgr', 'churras mais'],
    negativeDishKeywords: ['pudim', 'torresmo', 'picanha', 'costela suina', 'churros'],
    chefMood: 'Chef da Leveza, Saúde & Cozinha Plant-Based',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Très bien!** Cozinhar leve, fit, sem lactose ou à base de vegetais exige ainda mais *tompero* e técnica para valorizar cada ingrediente!\n\n` +
      `Separei com carinho ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'acai_sorvete',
    labelPt: 'Açaí Trufado, Sorvetes Artesanais, Gelatos & Milkshakes',
    isSweetIntent: true,
    triggerWords: [
      'acai',
      'acaigurte',
      'sorvete',
      'sorveteria',
      'gelato',
      'napoleta',
      'picole',
      'milkshake',
      'milk shake',
      'shake',
      'sundae',
      'geladinho',
    ],
    positiveDishKeywords: ['acai', 'acaigurte', 'sorvete', 'napoleta', 'milk shake', 'milkshake', 'trufadinho', 'geladinho', 'torta holandesa', 'pote'],
    positiveCategoryKeywords: [
      'acai',
      'acaigurte',
      'sorvetes',
      'napoleta',
      'potes napoli',
      'milk shake',
      'trufadinhos da verano',
      'marmitinhas verano',
      '🥶 loucos por geladinhos',
    ],
    positiveRestaurantKeywords: [
      'verano',
      'napoli sorvetes',
      'caragua shake & acai',
      'yes! acai',
      'sorveteria & acai beira mar',
      'the furious burguer',
      'inbrasa',
    ],
    requiredFoodType: 'doces_acai',
    negativeDishKeywords: ['chantilly adicional', 'colher descartavel', 'trident', 'halls', 'chiclete'],
    chefMood: 'Mestre Gelatier & Fã de Açaí Praiano',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Oh là là, no calor de Caraguatatuba um açaí cremoso, gelato artesanal ou milkshake bem batido é pura felicidade!**\n\n` +
      `Para refrescar seu dia ${loc}, minha escolha é **${fDish}** lá no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'doces_confeitaria',
    labelPt: 'Pudim Artesanal, Bolos, Tortas, Churros, Brownie & Confeitaria',
    isSweetIntent: true,
    triggerWords: [
      'doce',
      'sobremesa',
      'pudim',
      'bolo',
      'torta',
      'banoffee',
      'brigadeiro',
      'brownie',
      'churros',
      'nutella',
      'confeitaria',
      'chocolate',
      'copo da felicidade',
      'fondue',
      'doce de leite',
      'romeu e julieta',
      'pizza doce',
      'pastel doce',
      'esfiha doce',
    ],
    positiveDishKeywords: [
      'pudim',
      'bolo',
      'torta',
      'banoffee',
      'brigadeiro',
      'brownie',
      'churros',
      'nutella',
      'copo da felicidade',
      'founde',
      'romeu e julieta',
      'pizza doce',
      'pastel doce',
      'esfiha doce',
      'hot roll doce',
      'espetinho doce',
    ],
    positiveCategoryKeywords: [
      'o melhor pudim da sua vida!',
      'sobremesa',
      'sobremesas',
      'doces da rai!!!',
      'fatias da felicidade🍰🍰🍰',
      'bolos caseiros',
      'churros gourmet',
      'barca de churros',
      'copo da felicidade 400ml',
      'pizza brownie & cookies',
      'pizzas doces',
      'pastel doces',
      'esfihas doces 💜',
    ],
    positiveRestaurantKeywords: [
      'milena palma',
      'confeitaria da rai',
      'churros magali',
      'verano',
      'napoli sorvetes',
      'bs bgr',
      'inbrasa',
      'point do pirao',
      'le cheff',
    ],
    requiredFoodType: 'doces_acai',
    negativeDishKeywords: ['trident', 'halls', 'chiclete', 'plutonita', 'drops garoto', 'pacoquita rolha'],
    chefMood: 'Pâtissier Francês & Guardião da Confeitaria',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**La pâtisserie est un art, mon ami!** Quando a vontade é de um doce verdadeiro — nada de balinha industrial de caixa, mas confeitaria com técnica e *tompero* doce!\n\n` +
      `Olha a joia que separei ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    intent: 'bebidas_cerveja',
    labelPt: 'Cervejas Geladas, Chopp, Sucos Naturais & Bebidas',
    isDrinkIntent: true,
    triggerWords: [
      'cerveja',
      'chopp',
      'heineken',
      'long neck',
      'drink',
      'vinho',
      'whisky',
      'suco natural',
      'suco detox',
      'caldo de cana',
      'refrigerante',
      'bebida',
    ],
    positiveDishKeywords: ['heineken', 'eisenbahn', 'esenbahn', 'spaten', 'corona', 'chopp', 'suco', 'caldo de cana', 'cerveja', 'drink'],
    positiveCategoryKeywords: ['cervejas', 'cervejas longneck', 'sucos naturais de frutas', 'drinks especiais', 'chopp de vinho'],
    positiveRestaurantKeywords: ['adega garagem', 'sr. espetto', 'rock bar', 'solepizza', 'churras mais'],
    negativeDishKeywords: ['kit talher', 'sacola'],
    chefMood: 'Sommelier & Mestre do Brinde Praiano',
    buildJacquinIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Santé!** Para brindar em Caraguatatuba com bebida trincando de gelada ${loc}, confira o que eu separei:\n\n` +
      `Destaque para **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
];

// ==============================================================================
// 9 PERFIS SENSORIAIS & ATIPICAGEM ("algo mais picante, agridoce, defumado...")
// ==============================================================================

interface SensoryProfileRule {
  id: string;
  labelPt: string;
  isSweetProfile?: boolean;
  triggerPhrases: string[];
  dishMatchKeywords: string[];
  categoryMatchKeywords: string[];
  chefMood: string;
  buildSensoryIntro: (loc: string, fDish: string, fRest: string, fNeigh: string, fPrice: string, sec: string) => string;
}

const SENSORY_ATIPICAGEM_RULES: SensoryProfileRule[] = [
  {
    id: 'agridoce_caramelizado',
    labelPt: 'Perfil Agridoce, Geleia de Pimenta, Tarê, Mel & Cebola Caramelizada',
    triggerPhrases: [
      'agridoce',
      'doce com salgado',
      'salgado com doce',
      'contraste',
      'geleia de pimenta',
      'cebola caramelizada',
      'caramelizad',
      'molho tare',
      'tare',
      'teriyaki',
      'barbecue',
      'coalho com mel',
      'queijo com mel',
      'gorgonsweet',
      'sunomono',
    ],
    dishMatchKeywords: [
      'gorgonsweet',
      'geleia de pimenta',
      'coxim',
      'diquinta',
      'queijo coalho',
      'com mel',
      'sunomono',
      'cebola caramelizada',
      'caramelizada',
      'barbecue',
      'texas bacon',
      'costela desfiada',
      'temaki hot',
      'hot roll',
      'california',
      'tare',
      'cheddar melting',
      'queen',
    ],
    categoryMatchKeywords: ['famosinhos <3', 'porcoes especiais', 'queijos', 'hotroll'],
    chefMood: 'Alquimista do Equilíbrio Agridoce & Caramelizado',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Magnifique, você pediu um perfil AGRIDOCE!** O contraste entre o salgado suculento e o toque adocicado/ácido (geleia de pimenta, queijo coalho na brasa com mel, cebola caramelizada, barbecue ou molho tarê) é alta gastronomia pura!\n\n` +
      `Garimpei ${loc} os pratos com o melhor equilíbrio agridoce: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'picante_apimentado',
    labelPt: 'Perfil Picante, Apimentado & Tempero Intenso',
    triggerPhrases: [
      'picante',
      'apimentad',
      'pimenta',
      'ardid',
      'caliente',
      'mexican',
      'nachos',
      'doritos',
      'jalapeno',
      'baiana',
      'tempero forte',
    ],
    dishMatchKeywords: [
      'kafta apimentada',
      'linguica apimentada',
      'apimentada',
      'geleia de pimenta',
      'pimenta',
      'coxim',
      'diquinta',
      'gorgonsweet',
      'baiana',
      'a baiana',
      'nachos',
      'doritos',
      'pepperoni',
      'peperoni',
      'catupperoni',
      'calabresa',
      'mexican',
    ],
    categoryMatchKeywords: ['espetos', 'porcoes especiais', 'pizzas salgadas'],
    chefMood: 'Chef do Fogo & Pimenta na Medida Certa',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Oh là là, você gosta de personalidade e picância no prato!** Pimenta boa não é para queimar a língua, é para despertar o *tompero* e levantar o sabor!\n\n` +
      `Separei as melhores opções picantes e intensas ${loc}: **${fDish}** lá no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'defumado_brasa',
    labelPt: 'Perfil Defumado, Assado na Brasa & Bacon Crocante',
    triggerPhrases: ['defumad', 'gosto de brasa', 'sabor de brasa', 'fumaca', 'churrasqueira', 'carvao', 'maionese defumada'],
    dishMatchKeywords: [
      'defumada',
      'defumado',
      'mussarela defumada',
      'espetinho',
      'picanha',
      'costela',
      'barbecue',
      'inbrasa',
      'texas bacon',
      'provolone',
      'bacon',
    ],
    categoryMatchKeywords: ['espetos', 'queijos', 'grelhados'],
    chefMood: 'Mestre do Defumado & Brasa Viva',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Sacré bleu! O aroma defumado da brasa e do bacon artesanal é um convite irrecusável!**\n\n` +
      `Aqui ${loc}, meu destaque com notas defumadas intensas é **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'crocante_sequinho',
    labelPt: 'Textura Super Crocante, Empanado Dourado & Fritura Sequinha',
    triggerPhrases: ['crocant', 'sequinh', 'crispy', 'crysps', 'empanad', 'fritura sequinha', 'bem crocante'],
    dishMatchKeywords: [
      'crocante',
      'empanado',
      'milanesa',
      'crispy',
      'crysps',
      'onion rings',
      'anel de cebola',
      'pastel',
      'coxinha',
      'coxim',
      'hot roll',
      'chicken',
      'isca',
      'bolinho',
      'torresmo',
    ],
    categoryMatchKeywords: ['pastel', 'baldes de frango', 'porcoes', 'hotroll'],
    chefMood: 'Auditor de Crocância & Fritura Sequinha',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Crrrunc! Crocância é música para os ouvidos de um chef!** Fritura limpa, dourada e sequinha por fora, mantendo toda a suculência por dentro!\n\n` +
      `Para quem quer textura crocante ${loc}, recomendo **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'cremoso_queijudo',
    labelPt: 'Textura Ultra Cremosa, Muito Queijo, Catupiry & Gratinados',
    triggerPhrases: ['cremos', 'queijud', 'muito queijo', 'bastante queijo', 'derretendo', 'gratinad', 'quatro queijos', 'catupiry original'],
    dishMatchKeywords: [
      'catupiry',
      'cheddar',
      'melting',
      '4 queijos',
      'quatro queijos',
      '5 queijos',
      '6 queijos',
      'cream cheese',
      'escondidinho',
      'strogonoff',
      'lasanha',
      'parmegiana',
      'batata rosti',
    ],
    categoryMatchKeywords: ['escondidinhos quentes', 'lasanhas quentes', 'parmegianas', 'batata rosti recheada'],
    chefMood: 'Apaixonado por Queijo Gratinado & Molho Aveludado',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Mon Dieu, cremosidade e queijo derretendo são a alma do conforto gastronômico!**\n\n` +
      `Garimpei ${loc} os pratos mais cremosos e queijudos: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'citrico_acido_fresco',
    labelPt: 'Perfil Cítrico, Ácido, Com Limão & Refrescante',
    triggerPhrases: ['citric', 'acid', 'azedinh', 'com limao', 'refrescant', 'ceviche', 'frescor'],
    dishMatchKeywords: ['ceviche', 'sunomono', 'sashimi', 'salmao cru', 'limao', 'maracuja', 'tilapia', 'camarao', 'peixe'],
    categoryMatchKeywords: ['sashimi', 'sushi e temaki', 'peixes/crustaceos', 'saladas'],
    chefMood: 'Curador de Frescor & Acidez Equilibrada',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**La fraîcheur!** Um toque cítrico e ácido ilumina o paladar e combina perfeitamente com a brisa de Caraguatatuba!\n\n` +
      `Olha a minha seleção refrescante ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'quentinho_chuva_conforto',
    labelPt: 'Comida Quentinha para Dia de Chuva, Frio & Comfort Food',
    triggerPhrases: ['quentinh', 'dia de chuva', 'chovendo', 'friozinho', 'noite fria', 'comfort food', 'comida de conforto', 'aquecer'],
    dishMatchKeywords: ['(quente)', 'caldo', 'vaca atolada', 'canja', 'lamen', 'lasanha', 'escondidinho', 'feijoada', 'strogonoff', 'parmegiana'],
    categoryMatchKeywords: ['caldos quentes', 'caldinhos', 'lasanhas quentes', 'escondidinhos quentes', 'lamen'],
    chefMood: 'Chef do Conforto & Panela Fumegante',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Quando o tempo esfria ou chove em Caraguá, mon ami, você precisa de uma comida quentinha que abrace a alma!**\n\n` +
      `Separei os campeões fumegantes ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'exotico_autoral',
    labelPt: 'Pratos Exóticos, Autorais, Premiados & Diferentes',
    triggerPhrases: ['exotic', 'diferent', 'inusitad', 'fora do comum', 'autoral', 'surpreend', 'caragua a gosto', 'premiad', 'jacare', 'pastrami'],
    dishMatchKeywords: [
      'jacare',
      'pastrami',
      'coxim',
      'gorgonsweet',
      'marguerito',
      'excalibur',
      'moqueca de banana da terra',
      'lasanha de camarao',
      'as autorais',
      'crostini',
      'diquinta',
    ],
    categoryMatchKeywords: ['exotico', 'vencedor do caragua a gosto', 'criacoes!'],
    chefMood: 'Explorador de Alta Criatividade & Sabores Inusitados',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Bravo! Você tem espírito de verdadeiro gourmet e quer provar algo autoral, premiado ou exótico em Caraguatatuba!**\n\n` +
      `Olha o que eu desenterrei dos cardápios ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
  {
    id: 'gigante_fome_monstro',
    labelPt: 'Porções Gigantes, Fome de Leão, Ressaca & Lanches de 1,5 kg',
    triggerPhrases: ['fome de leao', 'muita fome', 'faminto', 'gigante', 'monstro', '1,5 kg', 'matador', 'brutao', 'ressaca', 'larica', 'podrao', 'encher a barriga'],
    dishMatchKeywords: [
      '1,5 kg',
      '1,3 kg',
      'kaipirao',
      'matador',
      'brutao',
      'monster',
      'triplo',
      'dois andares',
      'em dobro',
      'churrasco gg',
      'familia',
    ],
    categoryMatchKeywords: ['lanche gigante, serve ate 2 pessoas', 'matadores de fome ;p', 'é pra encher a barriga', 'box familia'],
    chefMood: 'Chef Pesos-Pesados contra Fome de Leão',
    buildSensoryIntro: (loc, fDish, fRest, fNeigh, fPrice, sec) =>
      `**Sacré bleu, isso é uma fome épica, mon ami!** Para quem quer fartura brutal sem perder o *tompero*, eu chamei os gigantes de Caraguatatuba!\n\n` +
      `Olha esse colosso ${loc}: **${fDish}** no **${fRest}** (${fNeigh}) por **R$ ${fPrice}**${sec}`,
  },
];

// ==============================================================================
// INTERFACES & FUNÇÕES PRINCIPAIS
// ==============================================================================

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

export interface JacquinChatRequest {
  query: string;
  neighborhood?: string;
  userLat?: number;
  userLon?: number;
  limit?: number;
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
              `${idx + 1}. ${d.dish_name} — R$ ${Number(d.price).toFixed(2).replace('.', ',')} | Restaurante: ${d.restaurant_name} (Bairro: ${d.neighborhood}) | Categoria: ${d.category} | Nota: ⭐ ${Number(d.rating_score || 4.8).toFixed(1)} | ${d.description || ''}`
          )
          .join('\n')
      : 'Use os melhores pratos do catálogo real de Caraguatatuba.';

  return [
    {
      role: 'system',
      content:
        'Você é o Chef Érick Jacquin Praiano, o Concierge Gastronômico Oficial do CaráFood em Caraguatatuba (treinado com 42.870 perguntas e contextos reais dos 61 restaurantes, 2.645 pratos e 53 bairros). ' +
        'Fale SEMPRE em português com seu sotaque e bordões franceses clássicos ("Bonjour, mon ami!", "Écoutez-moi!", "tompero", "vergonha da profission zero", "aqui ninguém desliga o freezer à noite", "C\'est magnifique!"). ' +
        'REGRA INVIOLÁVEL: cite EXCLUSIVAMENTE os pratos, preços em R$, restaurantes e bairros fornecidos no [CONTEXTO AUDITADO CARÁFOOD]. Jamais recomende sobremesa/pudim se o usuário pediu prato salgado. Seja caloroso, carismático e direto (2 a 3 parágrafos curtos).',
    },
    {
      role: 'user',
      content:
        `[CONTEXTO AUDITADO CARÁFOOD - USE ESTES PRATOS REAIS]\n` +
        `Intenção / Perfil detectado: ${detectedIntent}\n` +
        `Local/Referência: ${detectedLocationLabel || 'Caraguatatuba (53 bairros)'}\n` +
        `Pratos selecionados do catálogo real:\n${dishesBlock}\n\n` +
        `Pergunta do usuário: "${userQuery}"\n\n` +
        `Responda agora como Chef Érick Jacquin Praiano apresentando os pratos acima com muito tompero:`,
    },
  ];
}

const STOPWORDS = new Set([
  'quero',
  'queria',
  'gostaria',
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
  'achar',
  'acho',
  'tem',
  'qual',
  'quais',
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
  'regiao',
  'reais',
  'ate',
  'mais',
  'muito',
  'bom',
  'boa',
  'bons',
  'boas',
  'gostoso',
  'gostosa',
  'algo',
  'coisa',
  'tipo',
  'chef',
  'jacquin',
  'erick',
  'indica',
  'indique',
  'recomenda',
  'pontal',
  'santa',
  'marina',
  'martim',
  'massaguacu',
  'indaia',
  'poiares',
  'tinga',
  'travessao',
  'pereque',
  'mirim',
  'algodao',
  'morro',
  'porto',
  'novo',
  'palmeiras',
  'sumare',
  'prainha',
  'camaroeiro',
  'cocanha',
  'tabatinga',
  'ipiranga',
  'gaivotas',
  'primavera',
  'olaria',
  'barranco',
  'alto',
  'flexeiras',
  'tarumas',
]);

export function generateJacquinChatResponse(req: JacquinChatRequest): JacquinChatResponse {
  const rawQuery = String(req.query || '').trim();
  const qNorm = normalizeStr(rawQuery);
  const q = canonicalizeFoodText(rawQuery);
  const allRests = (dump.restaurants || []) as unknown as RestaurantCardData[];
  const dishDetailsMap = (dump.dish_details || {}) as Record<string, any>;

  // 1. Detectar Landmark / Bairro / Microzona entre os 53 bairros oficiais
  let matchedLandmark: LandmarkRule | null = null;
  for (const lm of CARAGUA_LANDMARKS) {
    if (lm.keywords.some((kw) => qNorm.includes(normalizeStr(kw)))) {
      matchedLandmark = lm;
      break;
    }
  }

  let explicitNeighborhood: string | null = null;
  const allKnownBairros = Array.from(
    new Set([
      ...Object.keys(NEIGHBORHOOD_PROXIMITY_GRAPH),
      ...allRests.map((r) => normalizeStr(r.neighborhood)).filter(Boolean),
    ])
  ).sort((a, b) => b.length - a.length);

  for (const bNorm of allKnownBairros) {
    if (bNorm.length >= 4 && qNorm.includes(bNorm)) {
      const matchingRest = allRests.find((r) => normalizeStr(r.neighborhood) === bNorm);
      explicitNeighborhood =
        matchingRest?.neighborhood ||
        bNorm
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      break;
    }
  }
  if (!explicitNeighborhood && req.neighborhood && req.neighborhood !== 'Todos') {
    explicitNeighborhood = req.neighborhood;
  }

  const refLat = matchedLandmark?.lat ?? req.userLat ?? -23.6226;
  const refLon = matchedLandmark?.lon ?? req.userLon ?? -45.4124;

  // Lista de bairros prioritários para a localização detectada
  const priorityNeighborhoodsNorm: string[] = matchedLandmark
    ? matchedLandmark.priorityNeighborhoods
    : explicitNeighborhood
    ? NEIGHBORHOOD_PROXIMITY_GRAPH[normalizeStr(explicitNeighborhood)] || [normalizeStr(explicitNeighborhood)]
    : [];

  // 2. Detectar Teto de Preço e Promoções
  let maxBudget: number | null = null;
  const priceMatch = qNorm.match(/(?:ate|menos de|no maximo|por|r\$)\s*(\d{2,3})/);
  if (priceMatch) {
    maxBudget = parseInt(priceMatch[1], 10);
  } else if (qNorm.includes('barat') || qNorm.includes('econom') || qNorm.includes('pouco dinheiro')) {
    maxBudget = 35;
  }

  const wantsPriceDrop =
    qNorm.includes('baixou') ||
    qNorm.includes('promoc') ||
    qNorm.includes('desconto') ||
    qNorm.includes('oferta');

  // 3. Detectar Perfil Sensorial / Atipicagem ("picante", "agridoce", "defumado", "crocante", "cremoso", "cítrico", etc.)
  let matchedSensoryRule: SensoryProfileRule | null = null;
  let bestSensoryHits = 0;
  for (const sRule of SENSORY_ATIPICAGEM_RULES) {
    const hits = sRule.triggerPhrases.filter((tp) => q.includes(normalizeStr(tp)) || qNorm.includes(normalizeStr(tp))).length;
    if (hits > bestSensoryHits) {
      bestSensoryHits = hits;
      matchedSensoryRule = sRule;
    }
  }

  // 4. Detectar Intenção Gastronômica Principal (18 categorias)
  // Nota: Se for "agridoce" / "doce com salgado", NÃO ativar intenção de sobremesa ("doces_confeitaria")!
  const isBittersweetQuery =
    qNorm.includes('agridoce') ||
    qNorm.includes('doce com salgado') ||
    qNorm.includes('salgado com doce') ||
    qNorm.includes('geleia de pimenta') ||
    qNorm.includes('coalho com mel') ||
    qNorm.includes('queijo com mel') ||
    qNorm.includes('cebola caramelizada');

  let matchedIntentRule: FoodIntentRule | null = null;
  let bestIntentHits = 0;
  for (const rule of FOOD_INTENT_RULES) {
    if (isBittersweetQuery && (rule.isSweetIntent || rule.intent === 'pastel_salgados')) {
      continue;
    }
    const hits = rule.triggerWords.filter((tw) => {
      const twNorm = normalizeStr(tw);
      return q.includes(twNorm) || qNorm.includes(twNorm);
    }).length;
    if (hits > bestIntentHits) {
      bestIntentHits = hits;
      matchedIntentRule = rule;
    }
  }

  // Determinar se o usuário quer Sobremesa/Doce ou Bebida
  const wantsSweet =
    !isBittersweetQuery &&
    (Boolean(matchedIntentRule?.isSweetIntent) ||
      /\b(doce|doces|docinho|sobremesa|sobremesas|pudim|bolo|torta holandesa|banoffee|brigadeiro|brownie|churros|sorvete|gelato|napoleta|acai|acaigurte|milkshake|milk shake|nutella|confeitaria|copo da felicidade|fondue|geladinho|romeu e julieta)\b/.test(
        qNorm
      ));

  const wantsDrink =
    Boolean(matchedIntentRule?.isDrinkIntent) ||
    /\b(cerveja|cervejinha|chopp|heineken|long neck|refrigerante|bebida|bebidas|suco|drink|vinho|whisky|energetico|caldo de cana)\b/.test(
      qNorm
    );

  // Tokens culinários específicos da pergunta
  const queryFoodTokens = q
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter(
      (t) =>
        t.length >= 3 &&
        !STOPWORDS.has(t) &&
        !(isBittersweetQuery && (t === 'doce' || t === 'salgado' || t === 'prato'))
    );

  const hasSpecificFoodOrSensoryGoal =
    Boolean(matchedIntentRule) || Boolean(matchedSensoryRule) || queryFoodTokens.length > 0;

  // 5. Varredura e Pontuação Ontológica Estrita dos 2.645+ Pratos Reais
  interface ScoredCandidate {
    dish: DishPreview;
    restaurant: RestaurantCardData;
    distKm: number;
    score: number;
    hasCulinaryMatch: boolean;
    isTargetNeighborhood: boolean;
    matchReason: string;
  }

  const seenDishIds = new Set<string>();
  const candidates: ScoredCandidate[] = [];

  const addCandidateIfValid = (d: DishPreview, r: RestaurantCardData) => {
    if (!d || !d.id || seenDishIds.has(d.id)) return;
    if (!d.price || d.price <= 0) return;

    const dishName = d.name || '';
    const dishDesc = d.description || '';
    const dishCat = d.category || '';
    const restName = r.name || '';

    // FIREWALL 1: Bloqueio total de não-alimentos, talheres, adicionais e balas de caixa (Trident/Halls/Chiclete)
    if (isNonFoodOrCashierCandy(dishName, dishCat, d.price)) {
      return;
    }

    // FIREWALL 2: Bloqueio total de bebidas soltas quando o usuário pediu comida
    const isDrink = isPureDrinkItem(dishName, dishCat);
    if (!wantsDrink && isDrink) {
      return;
    }
    if (wantsDrink && !isDrink) {
      return;
    }

    // FIREWALL 3 (ANTI-PUDIM): Partição estrita Salgado vs. Doce/Sobremesa
    const isSweet = isSweetOrDessertItem(dishName, dishDesc, dishCat, restName);
    if (!wantsSweet && !wantsDrink && isSweet) {
      // NUNCA recomendar Pudim, Açaí, Sorvete, Bolo ou Churros em busca salgada, picante, agridoce ou geral!
      return;
    }
    if (wantsSweet && !isSweet) {
      // NUNCA recomendar marmita, peixe ou hambúrguer quando o usuário pediu sobremesa/doce/açaí!
      return;
    }

    seenDishIds.add(d.id);

    const distKm = calculateDistanceKm(refLat, refLon, r.latitude, r.longitude);
    const dishHay = canonicalizeFoodText(`${dishName} ${dishDesc} ${dishCat}`);
    const dishNameNorm = normalizeStr(dishName);
    const dishCatNorm = normalizeStr(dishCat);
    const restHay = canonicalizeFoodText(`${restName} ${r.neighborhood} ${(r.cuisine_types || []).join(' ')}`);
    const fullHay = `${dishHay} ${restHay}`;
    const rNeighNorm = normalizeStr(r.neighborhood);

    let score = 0;
    let hasCulinaryMatch = false;
    let matchReason = 'Selecionado pelo Chef Jacquin';

    // A) Pontuação pelo Perfil Sensorial / Atipicagem (Picante, Agridoce, Defumado, Crocante, Cremoso, Cítrico, etc.)
    if (matchedSensoryRule) {
      let sensoryMatchedHere = false;
      for (const skw of matchedSensoryRule.dishMatchKeywords) {
        const skwNorm = normalizeStr(skw);
        if (dishNameNorm.includes(skwNorm)) {
          score += 190;
          sensoryMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = matchedSensoryRule.labelPt;
        } else if (dishHay.includes(skwNorm)) {
          score += 135;
          sensoryMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = matchedSensoryRule.labelPt;
        }
      }
      for (const sck of matchedSensoryRule.categoryMatchKeywords) {
        if (dishCatNorm.includes(normalizeStr(sck))) {
          score += 85;
          sensoryMatchedHere = true;
          hasCulinaryMatch = true;
        }
      }
      if (!sensoryMatchedHere) {
        score -= 220;
      }
    }

    // B) Pontuação pela Intenção Gastronômica Principal (18 categorias)
    if (matchedIntentRule) {
      let intentMatchedHere = false;

      for (const kw of matchedIntentRule.positiveDishKeywords) {
        const kwNorm = normalizeStr(kw);
        if (dishNameNorm.includes(kwNorm)) {
          score += 180;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = matchedIntentRule.labelPt;
        } else if (dishHay.includes(kwNorm)) {
          score += 120;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = matchedIntentRule.labelPt;
        }
      }

      for (const ckw of matchedIntentRule.positiveCategoryKeywords) {
        if (dishCatNorm.includes(normalizeStr(ckw))) {
          score += 140;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = matchedIntentRule.labelPt;
        }
      }

      for (const rkw of matchedIntentRule.positiveRestaurantKeywords) {
        if (restHay.includes(normalizeStr(rkw))) {
          score += 80;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
        }
      }

      if (
        matchedIntentRule.requiredFoodType &&
        Array.isArray(r.food_types) &&
        r.food_types.includes(matchedIntentRule.requiredFoodType)
      ) {
        score += 45;
      }

      for (const nkw of matchedIntentRule.negativeDishKeywords) {
        if (dishHay.includes(normalizeStr(nkw))) {
          score -= 300;
        }
      }

      if (matchedIntentRule.intent === 'vegano_fit') {
        if (d.is_vegan) {
          score += 160;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = '100% Vegano Verificado';
        } else if (d.is_vegetarian) {
          score += 120;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = 'Opção Vegetariana';
        } else if (d.is_lactose_free || d.is_gluten_free) {
          score += 110;
          intentMatchedHere = true;
          hasCulinaryMatch = true;
          matchReason = 'Sem Lactose / Sem Glúten';
        }
      }

      if (!intentMatchedHere) {
        score -= 260;
      }
    }

    // C) Pontuação por Tokens Culinários Diretos da Pergunta (ex: "espetinho", "picanha", "coxinha", "yakisoba", "lasanha")
    for (const tok of queryFoodTokens) {
      if (dishNameNorm.includes(tok)) {
        score += 130;
        hasCulinaryMatch = true;
      } else if (dishCatNorm.includes(tok)) {
        score += 115;
        hasCulinaryMatch = true;
      } else if (dishHay.includes(tok)) {
        score += 80;
        hasCulinaryMatch = true;
      } else if (fullHay.includes(tok)) {
        score += 45;
        hasCulinaryMatch = true;
      }
    }

    // REGRA DE OURO: Se o usuário pediu uma comida ou perfil sensorial específico e este prato NÃO tem match culinário,
    // aplica barreira de -350 pontos para que o bônus de bairro JAMAIS promova um prato sem relação com a comida pedida!
    if (hasSpecificFoodOrSensoryGoal && !hasCulinaryMatch) {
      score -= 350;
    }

    // D) Ordenação Geográfica (Bairro explícito ou Ponto de Referência como Pontal / Shopping Serramar)
    let isTargetNeighborhood = false;
    if (explicitNeighborhood) {
      const targetNb = normalizeStr(explicitNeighborhood);
      if (rNeighNorm.includes(targetNb) || targetNb.includes(rNeighNorm)) {
        score += 85;
        isTargetNeighborhood = true;
        if (!hasSpecificFoodOrSensoryGoal) {
          matchReason = `Destaque em ${r.neighborhood}`;
        }
      } else {
        const idxNear = priorityNeighborhoodsNorm.findIndex(
          (nb) => rNeighNorm.includes(nb) || nb.includes(rNeighNorm)
        );
        if (idxNear >= 0) {
          score += Math.max(20, 55 - idxNear * 8);
        } else {
          score -= 25;
        }
      }
    } else if (matchedLandmark) {
      const idxInPriority = priorityNeighborhoodsNorm.findIndex(
        (nb) => rNeighNorm.includes(nb) || nb.includes(rNeighNorm)
      );
      if (idxInPriority === 0) {
        score += 80;
        isTargetNeighborhood = true;
      } else if (idxInPriority > 0) {
        score += Math.max(20, 65 - idxInPriority * 7);
        isTargetNeighborhood = idxInPriority <= 2;
      } else if (distKm <= 3.5) {
        score += 35;
      } else if (distKm > 7) {
        score -= 25;
      }
    }

    // E) Orçamento e Queda de Preço Auditada
    if (maxBudget !== null) {
      if (d.price <= maxBudget) {
        score += 70;
        if (!matchedIntentRule && !matchedSensoryRule) {
          matchReason = `Cabe no bolso: R$ ${d.price.toFixed(2).replace('.', ',')}`;
        }
      } else {
        score -= 180;
      }
    }

    if (wantsPriceDrop) {
      if (d.last_price_delta_pct && d.last_price_delta_pct < 0) {
        score += 95;
        matchReason = 'Baixou de preço esta semana';
      } else if (r.has_price_drop) {
        score += 35;
      }
    }

    // Penaliza kits congelados gigantes (R$ 150+) a menos que o usuário peça kit/congelado/família
    if (
      d.price > 125 &&
      !qNorm.includes('kit') &&
      !qNorm.includes('familia') &&
      !qNorm.includes('combo') &&
      !qNorm.includes('barca')
    ) {
      score -= 60;
    }

    // F) Qualidade Bayesiana ($W_R$), Foto Real e Distância Suave
    const wr = Number(r.bayesian_rating ?? r.rating_score ?? r.rating_average ?? 4.7);
    score += wr * 4;
    if (d.image_url) score += 10;
    score -= Math.min(18, distKm * 1.6);

    candidates.push({
      dish: d,
      restaurant: r,
      distKm: Number(distKm.toFixed(2)),
      score,
      hasCulinaryMatch,
      isTargetNeighborhood,
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

  // Se houver candidatos com match culinário real, filtramos estritamente para eles!
  const matchedCulinaryPool = candidates.filter((c) => c.hasCulinaryMatch);
  const workingPool =
    hasSpecificFoodOrSensoryGoal && matchedCulinaryPool.length > 0
      ? matchedCulinaryPool
      : candidates;

  workingPool.sort((a, b) => b.score - a.score);

  // Round-Robin inteligente por restaurante (prioriza diversidade de estabelecimentos quando há múltiplos disponíveis)
  const limit = req.limit || 5;
  const selected: ScoredCandidate[] = [];
  const restCount = new Map<string, number>();

  for (const passMax of [1, 2, 3]) {
    for (const cand of workingPool) {
      if (selected.length >= limit) break;
      if (selected.includes(cand)) continue;
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

  // 6. Construir a fala autêntica, contextualizada e honesta do Chef Érick Jacquin Praiano
  const first = selected[0];
  const second = selected[1];
  const locContext = matchedLandmark
    ? matchedLandmark.label
    : explicitNeighborhood
    ? `para você que pediu no bairro **${explicitNeighborhood}**`
    : 'aqui em Caraguatatuba';

  const firstPriceStr = first ? first.dish.price.toFixed(2).replace('.', ',') : '0,00';
  const secondText = second
    ? `, seguida de **${second.dish.name}** no **${second.restaurant.name}** (${second.restaurant.neighborhood}) por **R$ ${second.dish.price.toFixed(2).replace('.', ',')}**!`
    : `!`;

  let reply = '';
  let chefMood = 'Entusiasmado & Exigente com o Tompero';

  if (!first) {
    reply =
      `**Mon Dieu!** Eu revirei todas as panelas dos 53 bairros de Caraguá, mas com esse filtro exato ninguém ligou o fogão agora! ` +
      `Me pede um **espetinho na brasa**, uma **marmita caprichada**, um **camarão na praia**, algo **picante** ou **agridoce**, um **hambúrguer artesanal**, uma **pizza** ou um **sushi fresquinho** que eu te mostro onde tem *tompero* de verdade!`;
  } else if (
    qNorm.includes('bayes') ||
    qNorm.includes('formula') ||
    qNorm.includes('ranking comprado') ||
    qNorm.includes('nota ponderada')
  ) {
    chefMood = 'Auditor Matemático & Curador Técnico';
    reply =
      `**Ah, la mathématique da gastronomia, mon ami!** No CaráFood não existe ranking patrocinado nem nota comprada: usamos a **Média Bayesiana Ponderada** ($W_R = \\frac{v}{v+m}R + \\frac{m}{v+m}C$) combinada com a **Cédula Oficial de 5 Critérios** (Sabor 30%, Qualidade 25%, Tempo 15%, Embalagem 15% e Custo-Benefício 15%)!\n\n` +
      `E para provar na prática ${locContext}, olha quem brilha no ranking auditado: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${firstPriceStr}**${secondText}`;
  } else if (
    qNorm.includes('metade do dobro') ||
    qNorm.includes('descontao') ||
    qNorm.includes('preco real') ||
    qNorm.includes('promocao verdadeira')
  ) {
    chefMood = 'Fiscal Implacável contra Falsa Promoção';
    reply =
      `**Sacré bleu, eu odeio a famosa "metade do dobro"!** No CaráFood, nosso motor **Descontão Transparente** audita a mediana histórica de 30 dias dos **2.645 pratos** nos 61 estabelecimentos. O selo de queda real só acende quando o preço baixou de verdade!\n\n` +
      `Olha uma pedida honesta ${locContext}: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${firstPriceStr}**${secondText}`;
  } else if (
    qNorm.includes('freezer') ||
    qNorm.includes('vergonha') ||
    qNorm.includes('pesadelo') ||
    (qNorm.length <= 20 &&
      !hasSpecificFoodOrSensoryGoal &&
      (qNorm.includes('oi') || qNorm.includes('ola') || qNorm.includes('bom dia') || qNorm.includes('boa noite') || qNorm.includes('jacquin')))
  ) {
    chefMood = 'Modo Pesadelo na Cozinha (Freezer Ligado)';
    reply =
      `**Bonjour, mon ami!** Aqui em Caraguatatuba não tem *vergonha da profission*, não! Eu já fiscalizei os **61 restaurantes** da cidade: o freezer tá ligado, a cozinha tá limpa e o *tompero* é caiçara de verdade!\n\n` +
      `Para abrir o seu apetite ${locContext}, olha minha primeira recomendação de chef: **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por **R$ ${firstPriceStr}**${secondText}`;
  } else if (matchedSensoryRule && (!matchedIntentRule || bestSensoryHits >= bestIntentHits)) {
    chefMood = matchedSensoryRule.chefMood;
    reply = matchedSensoryRule.buildSensoryIntro(
      locContext,
      first.dish.name,
      first.restaurant.name,
      first.restaurant.neighborhood,
      firstPriceStr,
      secondText
    );
  } else if (matchedIntentRule) {
    chefMood = matchedIntentRule.chefMood;
    reply = matchedIntentRule.buildJacquinIntro(
      locContext,
      first.dish.name,
      first.restaurant.name,
      first.restaurant.neighborhood,
      firstPriceStr,
      secondText
    );
  } else if (maxBudget !== null) {
    chefMood = 'Chef Amigo do Bolso & Custo-Benefício';
    reply =
      `**Comer bem sem gastar muito? Isso é inteligência gastronômica, mon ami!** Quem disse que precisa pagar caro para ter *tompero* de chef?\n\n` +
      `Filtrei opções reais ${locContext} dentro do seu orçamento de **até R$ ${maxBudget},00**, começando por **${first.dish.name}** no **${first.restaurant.name}** (${first.restaurant.neighborhood}) por apenas **R$ ${firstPriceStr}**${secondText}`;
  } else {
    reply =
      `**Bonjour, mon ami!** Fui pessoalmente garimpar os cardápios reais ${locContext} para o seu pedido (**"${rawQuery}"**)!\n\n` +
      `Minha primeira escolha com muito *tompero* é **${first.dish.name}** lá no **${first.restaurant.name}** (${first.restaurant.neighborhood}), saindo por **R$ ${firstPriceStr}**${secondText} Confira os pratos selecionados logo abaixo:`;
  }

  const detectedIntent = matchedSensoryRule
    ? `${matchedIntentRule?.intent || 'sensorial'}:${matchedSensoryRule.id}`
    : matchedIntentRule?.intent || 'geral';
  const detectedLocationLabel = matchedLandmark?.label || explicitNeighborhood || null;

  const brainStats: JacquinBrainStats = {
    version: brain40k.version || '5.0.0-jacquin-ollama-40k-sensory',
    modelName: brain40k.modelName || 'jacquin-carafood:latest',
    baseModel: brain40k.baseModel || 'qwen2.5:3b',
    totalTrainedQuestions: brain40k.totalTrainedQuestions || 45200,
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
      matchedSensoryRule?.labelPt || matchedIntentRule?.labelPt || detectedIntent,
      detectedLocationLabel
    ),
  };
}
