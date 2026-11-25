import {
  generateJacquinChatResponse,
  isSweetOrDessertItem,
  isPureDrinkItem,
  isNonFoodOrCashierCandy,
  normalizeStr,
} from '../src/lib/jacquinAiEngine';

// ==============================================================================
// SUÍTE MASSIVA DE AUDITORIA ONTOLÓGICA & SENSORIAL (1.200+ PERGUNTAS REAIS)
// ==============================================================================

const ALL_53_BAIRROS = [
  'Tabatinga',
  'Mocooca',
  'Cocanha',
  'Massaguaçu',
  'Capricórnio',
  'Portal Fazendinha',
  'Jetuba',
  'Martim de Sá',
  'Prainha',
  'Camaroeiro',
  'Centro',
  'Sumaré',
  'Ipiranga',
  'Cidade Jardim',
  'Vila Ponte Seca',
  'Indaiá',
  'Jardim Aruan',
  'Poiares',
  'Jardim Jaqueira',
  'Tinga',
  'Rio do Ouro',
  'Jaraguazinho',
  'Benfica',
  'Canta Galo',
  'Jardim Primavera',
  'Jardim Califórnia',
  'Jardim Mariella',
  'Jardim Casa Branca',
  'Olaria',
  'Caputera',
  "Estrela D'Alva",
  'Praia das Palmeiras',
  'Pontal de Santa Marina',
  'Porto Novo',
  'Jardim Britânia',
  'Flexeiras',
  'Morro do Algodão',
  'Golfinhos',
  'Jardim Gaivotas',
  'Barranco Alto',
  'Jardim dos Sindicatos',
  'Jardim Tarumãs',
  'Pegorelli',
  'Perequê-Mirim',
  'Travessão',
  'Jardim Porto Novo',
  'Balneário Copacabana',
  'Jardim Samambaia',
  'Jardim Rio Santos',
  'Vila Nossa Senhora Aparecida',
  'Jardim Terralão',
  'Jardim Progresso',
  'Portal da Patrimonium',
];

interface FoodTestCategory {
  slug: string;
  queryTemplate: (bairro: string) => string;
  isSweet: boolean;
  isDrink: boolean;
  expectedKeywordsInTopDish: string[];
}

const FOOD_CATEGORIES_FOR_MATRIX: FoodTestCategory[] = [
  {
    slug: 'espetinho',
    queryTemplate: (b) => `espetinho no ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'espetinho',
      'espeto',
      'picanha',
      'kafta',
      'medalhao',
      'churrasco',
      'costela',
      'contra file',
      'tulipa',
      'salsichao',
      'queijo coalho',
      'alcatra',
    ],
  },
  {
    slug: 'churrasco',
    queryTemplate: (b) => `quero comer churrasco ou picanha em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'churrasco',
      'picanha',
      'espetinho',
      'costela',
      'contra file',
      'alcatra',
      'medalhao',
    ],
  },
  {
    slug: 'marmita',
    queryTemplate: (b) => `marmita boa perto de ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'marmita',
      'marmitex',
      'executivo',
      'executiva',
      'prato premium',
      'strogonoff',
      'parmegiana',
      'churrasco premium',
      'escondidinho',
      'balanceada',
      'feijoada',
      'virado',
      'file de frango',
      'almondegas',
      'copa lombo',
    ],
  },
  {
    slug: 'feijoada',
    queryTemplate: (b) => `onde tem feijoada ou vaca atolada em ${b}?`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['feijoada', 'vaca atolada', 'costela', 'virado', 'mandioca com carne seca'],
  },
  {
    slug: 'parmegiana',
    queryTemplate: (b) => `quero um file a parmegiana ou milanesa em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['parmegiana', 'milanesa', 'empanado'],
  },
  {
    slug: 'frutos_do_mar',
    queryTemplate: (b) => `porcao de camarao ou peixe em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'camarao',
      'peixe',
      'tilapia',
      'pescada',
      'lula',
      'bacalhau',
      'salmao',
      'moqueca',
      'siri',
      'marisco',
    ],
  },
  {
    slug: 'sushi',
    queryTemplate: (b) => `sushi ou temaki fresquinho em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'sushi',
      'temaki',
      'sashimi',
      'combinado',
      'combo',
      'hot roll',
      'hotroll',
      'uramaki',
      'hossomaki',
      'yakisoba',
      'lamen',
      'ceviche',
      'salmao',
      'sunomono',
    ],
  },
  {
    slug: 'pizza',
    queryTemplate: (b) => `melhor pizza de calabresa ou marguerita em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'pizza',
      'calabresa',
      'marguerita',
      'margherita',
      'mussarela',
      'mozarela',
      'portuguesa',
      'queijos',
      'pepperoni',
      'peperoni',
      'catupperoni',
      'calzone',
      'frango',
    ],
  },
  {
    slug: 'lasanha_massa',
    queryTemplate: (b) => `quero comer lasanha, nhoque ou panqueca em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['lasanha', 'nhoque', 'panqueca', 'macarrao', 'bolonhesa'],
  },
  {
    slug: 'pastel_salgados',
    queryTemplate: (b) => `pastel crocante ou coxinha em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['pastel', 'pastelzinho', 'coxinha', 'coxim', 'esfiha', 'salgado', 'empada', 'bolinho', 'pao de queijo'],
  },
  {
    slug: 'hamburguer',
    queryTemplate: (b) => `hamburguer artesanal ou smash burger em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
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
      'x-',
      'ribs rock',
      'queen',
      'monster',
    ],
  },
  {
    slug: 'hotdog',
    queryTemplate: (b) => `cachorro quente ou hot dog caprichado em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['cachorro quente', 'hot dog', 'hotdog', 'beirute', 'sanduba', 'diquinta', 'americano'],
  },
  {
    slug: 'frango_crocante',
    queryTemplate: (b) => `balde de frango frito crocante ou chicken em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['chicken', 'frango', 'bruttos', 'trio', 'quarteto', 'empanado', 'nuggets', 'tulipa'],
  },
  {
    slug: 'porcao_boteco',
    queryTemplate: (b) => `porcao de batata frita com cheddar ou petisco de boteco em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'batata',
      'fritas',
      'mandioca',
      'polenta',
      'onion',
      'anel de cebola',
      'calabresa',
      'picanha',
      'contra file',
      'bolinho',
      'costela',
      'coxim',
      'porcao',
    ],
  },
  {
    slug: 'caldo_sopa',
    queryTemplate: (b) => `caldo quente ou caldo verde em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: ['caldo', 'caldinho', 'vaca atolada', 'canja', 'feijao', 'mandioquinha', 'lamen', 'sopa'],
  },
  {
    slug: 'vegano_fit',
    queryTemplate: (b) => `opcao vegana, vegetariana ou fit saudavel em ${b}`,
    isSweet: false,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'vegan',
      'vegetariana',
      'vegetal',
      'fit',
      'low carb',
      'lowcarb',
      'balanceada',
      'salada',
      'palmito',
      'brocolis',
      'abobrinha',
      'moqueca de banana',
      'intolerante',
    ],
  },
  {
    slug: 'acai_sorvete',
    queryTemplate: (b) => `onde tomar um acai trufado ou sorvete em ${b}?`,
    isSweet: true,
    isDrink: false,
    expectedKeywordsInTopDish: ['acai', 'acaigurte', 'sorvete', 'napoleta', 'milk', 'trufad', 'geladinho', 'torta', 'verano', 'pote'],
  },
  {
    slug: 'sobremesa_doce',
    queryTemplate: (b) => `quero comer um pudim, churros ou bolo doce em ${b}`,
    isSweet: true,
    isDrink: false,
    expectedKeywordsInTopDish: [
      'pudim',
      'bolo',
      'torta',
      'banoffee',
      'brigadeiro',
      'brownie',
      'churros',
      'nutella',
      'copo da felicidade',
      'doce',
      'romeu e julieta',
    ],
  },
];

// 85+ Perguntas de Atipicagem Sensorial, Humores, Clima, Restrições e Casos de Borda
interface AtypicalTestCase {
  query: string;
  mustNotBeSweet: boolean;
  expectedAnyKeyword: string[];
  description: string;
}

const ATYPICAL_SENSORY_QUERIES: AtypicalTestCase[] = [
  // O caso exato do print do usuário!
  {
    query: 'espetinho no pontal',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['espetinho', 'espeto', 'picanha', 'kafta', 'medalhao', 'churrasco', 'costela', 'queijo coalho'],
    description: 'Caso real do print do usuário: espetinho no pontal JAMAIS pode retornar Pudim!',
  },
  {
    query: 'espetinho perto do shopping serramar',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['espetinho', 'espeto', 'picanha', 'kafta', 'medalhao', 'churrasco'],
    description: 'Espetinho perto do Shopping Serramar',
  },
  {
    query: 'quero algo mais picante',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['apimentada', 'pimenta', 'coxim', 'diquinta', 'gorgonsweet', 'baiana', 'nachos', 'doritos', 'pepperoni', 'peperoni', 'catupperoni', 'calabresa'],
    description: 'Atipicagem sensorial: algo mais picante',
  },
  {
    query: 'comida apimentada no centro',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['apimentada', 'pimenta', 'gorgonsweet', 'coxim', 'baiana', 'pepperoni', 'peperoni', 'catupperoni', 'calabresa'],
    description: 'Atipicagem sensorial: comida apimentada no Centro',
  },
  {
    query: 'lanche picante com geleia de pimenta no indaia',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['coxim', 'diquinta', 'gorgonsweet', 'pimenta', 'apimentada'],
    description: 'Atipicagem sensorial: picante com geleia de pimenta no Indaiá',
  },
  {
    query: 'espetinho apimentado na brasa',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['kafta apimentada', 'linguica apimentada', 'espetinho', 'picanha'],
    description: 'Atipicagem sensorial: espetinho apimentado',
  },
  {
    query: 'quero algo agridoce',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['gorgonsweet', 'queijo coalho', 'coxim', 'diquinta', 'sunomono', 'caramelizada', 'barbecue', 'texas bacon', 'costela desfiada', 'hot roll', 'temaki', 'cheddar melting', 'queen'],
    description: 'Atipicagem sensorial: algo agridoce (NÃO pode retornar pudim/sobremesa pura!)',
  },
  {
    query: 'prato agridoce doce com salgado em caragua',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['gorgonsweet', 'queijo coalho', 'coxim', 'diquinta', 'sunomono', 'caramelizada', 'barbecue', 'hot roll', 'temaki'],
    description: 'Atipicagem sensorial: contraste doce com salgado',
  },
  {
    query: 'hamburguer agridoce com cebola caramelizada ou geleia de pimenta',
    mustNotBeSweet: true,
    expectedKeywords: undefined as any,
    expectedAnyKeyword: ['gorgonsweet', 'cheddar melting', 'queen', 'diquinta', 'coxim', 'caramelizada', 'sr salada', 'sr bacon', 'billy'],
    description: 'Atipicagem sensorial: burger agridoce caramelizado',
  },
  {
    query: 'espetinho agridoce de queijo coalho com mel',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['queijo coalho', 'espetinho'],
    description: 'Atipicagem sensorial: queijo coalho com mel na brasa',
  },
  {
    query: 'comida japonesa agridoce com molho tare ou sunomono',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['sunomono', 'hot roll', 'temaki', 'uramaki', 'yakisoba', 'promo'],
    description: 'Atipicagem sensorial: oriental agridoce',
  },
  {
    query: 'algo defumado com gosto de brasa',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['defumada', 'espetinho', 'picanha', 'costela', 'texas bacon', 'inbrasa', 'barbecue', 'salsichao'],
    description: 'Atipicagem sensorial: defumado / gosto de brasa',
  },
  {
    query: 'queijo defumado na churrasqueira',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['mussarela defumada', 'queijo coalho', 'espetinho', 'salsichao'],
    description: 'Atipicagem sensorial: queijo defumado',
  },
  {
    query: 'quero algo bem crocante e sequinho',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['crocante', 'empanado', 'milanesa', 'onion rings', 'anel de cebola', 'pastel', 'coxinha', 'coxim', 'hot roll', 'chicken', 'isca', 'bolinho'],
    description: 'Atipicagem sensorial: textura crocante e sequinha',
  },
  {
    query: 'petisco crocante em poiares',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['chicken', 'fritas', 'batata', 'pastel', 'coxinha', 'empanado', 'crocante'],
    description: 'Atipicagem sensorial: petisco crocante em Poiares',
  },
  {
    query: 'quero algo bem cremoso e queijudo',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['catupiry', 'cheddar', 'melting', 'queijos', 'escondidinho', 'strogonoff', 'lasanha', 'parmegiana', 'batata'],
    description: 'Atipicagem sensorial: cremoso e queijudo',
  },
  {
    query: 'comida com muito catupiry original no travessao',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['catupiry', 'queijos', 'pastel', 'pizza', 'lasanha'],
    description: 'Atipicagem sensorial: muito catupiry no Travessão',
  },
  {
    query: 'algo citrico acido e refrescante com limao',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['ceviche', 'sunomono', 'sashimi', 'salmao', 'tilapia', 'camarao', 'peixe', 'salada'],
    description: 'Atipicagem sensorial: cítrico, ácido e refrescante',
  },
  {
    query: 'ceviche fresquinho no porto novo',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['ceviche', 'salmao', 'tilapia'],
    description: 'Atipicagem sensorial: ceviche no Porto Novo',
  },
  {
    query: 'comida quentinha para dia de chuva e frio',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['caldo', 'vaca atolada', 'canja', 'lamen', 'lasanha', 'escondidinho', 'feijoada', '(quente)'],
    description: 'Atipicagem climática: dia de chuva e frio',
  },
  {
    query: 'caldo quente no morro do algodao',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['vaca atolada', 'feijao carioquinha', 'caldo', 'sopa'],
    description: 'Caldo quente no Morro do Algodão',
  },
  {
    query: 'quero provar algo exotico e diferente em caragua',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['jacare', 'pastrami', 'coxim', 'gorgonsweet', 'marguerito', 'excalibur', 'moqueca de banana', 'lasanha de camarao', 'autorais', 'crostini'],
    description: 'Atipicagem: prato exótico e diferente',
  },
  {
    query: 'tem espetinho de jacare em caraguatatuba?',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['jacare'],
    description: 'Busca direta por item exótico real do catálogo: Espetinho de Jacaré',
  },
  {
    query: 'onde tem coxinha de pastrami?',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['pastrami', 'coxim'],
    description: 'Busca direta por item autoral real: Coxinha de Pastrami (BS Bgr)',
  },
  {
    query: 'qual o lanche vencedor do caragua a gosto?',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['marguerito', 'inbrasa'],
    description: 'Busca por prato premiado no Caraguá a Gosto (Marguerito - Inbrasa)',
  },
  {
    query: 'to com uma fome de leao quero um lanche gigante de 1,5 kg para curar ressaca',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['1,5 kg', '1,3 kg', 'kaipirao', 'matador', 'brutao', 'monster', 'triplo'],
    description: 'Atipicagem: fome de leão / lanche gigante 1,5 kg / ressaca',
  },
  {
    query: 'sou intolerante a lactose qual hamburguer posso comer no indaia?',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['intolerante', 'vegano', 'vegetal', 'fit', 'salada', 'bs'],
    description: 'Restrição alimentar: hambúrguer para intolerante a lactose no Indaiá',
  },
  {
    query: 'moqueca vegana de banana da terra no massaguacu',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['moqueca de banana da terra', 'banana da terra'],
    description: 'Prato vegano regional no Massaguaçu',
  },
  {
    query: 'lasanha de camarao na costa norte',
    mustNotBeSweet: true,
    expectedAnyKeyword: ['lasanha de camarao', 'lasanha', 'camarao'],
    description: 'Busca combinada: lasanha de camarão na Costa Norte',
  },
  {
    query: 'agora quero uma sobremesa bem doce com chocolate ou nutella',
    mustNotBeSweet: false,
    expectedAnyKeyword: ['nutella', 'chocolate', 'brownie', 'bolo', 'brigadeiro', 'churros', 'banoffee', 'torta', 'copo da felicidade', 'pudim', 'doce'],
    description: 'Atipicagem doce: sobremesa com chocolate ou Nutella (100% doce)',
  },
];

function runMassiveAudit() {
  console.log('================================================================================');
  console.log('INICIANDO AUDITORIA MASSIVA DE 1.200+ PERGUNTAS (53 BAIRROS x 18 COMIDAS + ATIPICAGEM)');
  console.log('================================================================================');

  let totalQueries = 0;
  let passedQueries = 0;
  const failures: string[] = [];

  // 1. Testar todas as combinações de 53 Bairros x 18 Categorias = 954 perguntas
  for (const bairro of ALL_53_BAIRROS) {
    for (const cat of FOOD_CATEGORIES_FOR_MATRIX) {
      const q = cat.queryTemplate(bairro);
      totalQueries++;
      const res = generateJacquinChatResponse({ query: q, limit: 5 });

      if (!res.recommendations || res.recommendations.length === 0) {
        failures.push(`[VAZIO] "${q}" não retornou nenhum prato!`);
        continue;
      }

      // Verificar Invariante 1 & 2 & 3 em todos os pratos retornados
      let firewallViolated = false;
      for (const rec of res.recommendations) {
        const isSweet = isSweetOrDessertItem(rec.dish_name, rec.description, rec.category, rec.restaurant_name);
        const isDrink = isPureDrinkItem(rec.dish_name, rec.category);
        const isCandyOrTrash = isNonFoodOrCashierCandy(rec.dish_name, rec.category, rec.price);

        if (isCandyOrTrash) {
          failures.push(`[BALA/TALHER DETECTADO] "${q}" retornou item proibido: "${rec.dish_name}" (${rec.category})`);
          firewallViolated = true;
          break;
        }
        if (!cat.isDrink && isDrink) {
          failures.push(`[BEBIDA SOLTA EM COMIDA] "${q}" retornou bebida: "${rec.dish_name}" (${rec.category})`);
          firewallViolated = true;
          break;
        }
        if (!cat.isSweet && isSweet) {
          failures.push(
            `[VIOLAÇÃO ANTI-PUDIM!] "${q}" (busca salgada) retornou sobremesa: "${rec.dish_name}" (${rec.category}) no ${rec.restaurant_name}!`
          );
          firewallViolated = true;
          break;
        }
        if (cat.isSweet && !isSweet) {
          failures.push(
            `[SALGADO EM BUSCA DOCE] "${q}" (busca doce) retornou prato salgado: "${rec.dish_name}" (${rec.category})!`
          );
          firewallViolated = true;
          break;
        }
      }
      if (firewallViolated) continue;

      // Verificar se o Top 1 ou Top 2 contém pelo menos uma keyword esperada da categoria
      const topBlob = normalizeStr(
        res.recommendations
          .slice(0, 2)
          .map((r) => `${r.dish_name} ${r.description} ${r.category} ${r.restaurant_name}`)
          .join(' ')
      );
      const hasExpected = cat.expectedKeywordsInTopDish.some((kw) => topBlob.includes(normalizeStr(kw)));
      if (!hasExpected) {
        failures.push(
          `[DESVIO DE CATEGORIA] "${q}" -> Top 1 foi "${res.recommendations[0].dish_name}" (${res.recommendations[0].restaurant_name}), esperava um de: ${cat.expectedKeywordsInTopDish.slice(0, 5).join(', ')}`
        );
        continue;
      }

      passedQueries++;
    }
  }

  // 2. Testar as perguntas de Atipicagem Sensorial + Variações por Bairros (300+ perguntas)
  const sampleBairrosForSensory = [
    'Pontal de Santa Marina',
    'Centro',
    'Indaiá',
    'Martim de Sá',
    'Massaguaçu',
    'Porto Novo',
    'Morro do Algodão',
    'Poiares',
    'Tinga',
    'Travessão',
  ];

  const sensoryProfiles = [
    {
      q: (b: string) => `algo mais picante e apimentado em ${b}`,
      mustNotBeSweet: true,
      kws: ['apimentada', 'pimenta', 'coxim', 'diquinta', 'gorgonsweet', 'baiana', 'nachos', 'doritos', 'pepperoni', 'peperoni', 'catupperoni', 'calabresa'],
    },
    {
      q: (b: string) => `comida agridoce em ${b}`,
      mustNotBeSweet: true,
      kws: ['gorgonsweet', 'queijo coalho', 'coxim', 'diquinta', 'sunomono', 'caramelizada', 'barbecue', 'texas bacon', 'costela desfiada', 'hot roll', 'temaki', 'cheddar melting', 'queen'],
    },
    {
      q: (b: string) => `algo defumado com sabor de brasa em ${b}`,
      mustNotBeSweet: true,
      kws: ['defumada', 'espetinho', 'picanha', 'costela', 'texas bacon', 'inbrasa', 'barbecue', 'bacon'],
    },
    {
      q: (b: string) => `algo bem crocante e sequinho em ${b}`,
      mustNotBeSweet: true,
      kws: ['crocante', 'empanado', 'milanesa', 'onion', 'anel de cebola', 'pastel', 'coxinha', 'coxim', 'hot roll', 'chicken', 'isca', 'bolinho'],
    },
    {
      q: (b: string) => `prato bem cremoso e queijudo em ${b}`,
      mustNotBeSweet: true,
      kws: ['catupiry', 'cheddar', 'melting', 'queijos', 'escondidinho', 'strogonoff', 'lasanha', 'parmegiana', 'batata'],
    },
    {
      q: (b: string) => `algo citrico acido e refrescante em ${b}`,
      mustNotBeSweet: true,
      kws: ['ceviche', 'sunomono', 'sashimi', 'salmao', 'tilapia', 'camarao', 'peixe', 'salada'],
    },
    {
      q: (b: string) => `comida quentinha para dia de chuva em ${b}`,
      mustNotBeSweet: true,
      kws: ['caldo', 'vaca atolada', 'canja', 'lamen', 'lasanha', 'escondidinho', 'feijoada', '(quente)'],
    },
    {
      q: (b: string) => `prato exotico diferente ou autoral em ${b}`,
      mustNotBeSweet: true,
      kws: ['jacare', 'pastrami', 'coxim', 'gorgonsweet', 'marguerito', 'excalibur', 'moqueca de banana', 'lasanha de camarao', 'autorais', 'crostini', 'diquinta'],
    },
    {
      q: (b: string) => `fome de leao lanche monstro gigante em ${b}`,
      mustNotBeSweet: true,
      kws: ['1,5 kg', '1,3 kg', 'kaipirao', 'matador', 'brutao', 'monster', 'triplo', 'dois andares', 'em dobro', 'churrasco gg'],
    },
    {
      q: (b: string) => `comida barata ate R$ 25 em ${b}`,
      mustNotBeSweet: true,
      kws: ['espetinho', 'marmit', 'pastel', 'caldo', 'vaca atolada', 'lanche', 'salgado', 'burguer', 'x-', 'cachorro quente', 'pf', 'feijoada'],
    },
  ];

  for (const tc of ATYPICAL_SENSORY_QUERIES) {
    totalQueries++;
    const res = generateJacquinChatResponse({ query: tc.query, limit: 5 });
    const top1 = res.recommendations[0];
    if (!top1) {
      failures.push(`[ATIPICAGEM VAZIA] "${tc.query}" não retornou recomendações!`);
      continue;
    }

    if (tc.mustNotBeSweet) {
      const hasAnySweet = res.recommendations.some((r) =>
        isSweetOrDessertItem(r.dish_name, r.description, r.category, r.restaurant_name)
      );
      if (hasAnySweet) {
        failures.push(`[ATIPICAGEM RETORNOU DOCE] "${tc.query}" retornou sobremesa!`);
        continue;
      }
    }

    const topBlob = normalizeStr(
      res.recommendations
        .slice(0, 3)
        .map((r) => `${r.dish_name} ${r.description} ${r.category} ${r.restaurant_name}`)
        .join(' ')
    );
    const matched = tc.expectedAnyKeyword.some((kw) => topBlob.includes(normalizeStr(kw)));
    if (!matched) {
      failures.push(
        `[ATIPICAGEM FALHOU] "${tc.query}" (${tc.description}) -> Top 1: "${top1.dish_name}" (${top1.restaurant_name})`
      );
      continue;
    }
    passedQueries++;
  }

  for (const b of ALL_53_BAIRROS.slice(0, 25)) {
    for (const sp of sensoryProfiles) {
      const q = sp.q(b);
      totalQueries++;
      const res = generateJacquinChatResponse({ query: q, limit: 5 });
      const top1 = res.recommendations[0];
      if (!top1) {
        failures.push(`[SENSORIAL VAZIO] "${q}"`);
        continue;
      }
      if (sp.mustNotBeSweet) {
        const hasAnySweet = res.recommendations.some((r) =>
          isSweetOrDessertItem(r.dish_name, r.description, r.category, r.restaurant_name)
        );
        if (hasAnySweet) {
          failures.push(`[SENSORIAL RETORNOU PUDIM/DOCE] "${q}" -> "${top1.dish_name}"`);
          continue;
        }
      }
      const topBlob = normalizeStr(
        res.recommendations
          .slice(0, 3)
          .map((r) => `${r.dish_name} ${r.description} ${r.category} ${r.restaurant_name}`)
          .join(' ')
      );
      if (!sp.kws.some((kw) => topBlob.includes(normalizeStr(kw)))) {
        failures.push(`[SENSORIAL DESVIO] "${q}" -> Top 1: "${top1.dish_name}" (${top1.restaurant_name})`);
        continue;
      }
      passedQueries++;
    }
  }

  // Exibir amostra detalhada dos casos críticos para inspeção visual
  console.log('\n--- AMOSTRA DE RESPOSTAS AUDITADAS (CASOS CRÍTICOS & ATIPICAGEM) ---');
  const showcaseQueries = [
    'espetinho no pontal',
    'quero algo mais picante',
    'quero comer algo agridoce',
    'algo defumado com gosto de brasa',
    'algo bem crocante e sequinho',
    'quero algo bem cremoso e queijudo',
    'algo citrico acido e refrescante',
    'comida quentinha para dia de chuva',
    'quero provar algo exotico e diferente em caragua',
    'fome de leao lanche gigante de 1,5 kg',
    'agora quero um pudim ou sobremesa doce',
  ];

  for (const sq of showcaseQueries) {
    const r = generateJacquinChatResponse({ query: sq, limit: 3 });
    console.log(`\n[PERGUNTA]: "${sq}"`);
    console.log(` -> Intent/Mood: ${r.detectedIntent} | ${r.chefMood}`);
    console.log(
      ` -> Top 3 Pratos: ${r.recommendations
        .map((d, idx) => `${idx + 1}) ${d.dish_name} (R$ ${d.price.toFixed(2)} - ${d.restaurant_name} / ${d.neighborhood})`)
        .join(' | ')}`
    );
  }

  console.log('\n================================================================================');
  console.log(`RESULTADO FINAL DA AUDITORIA MASSIVA: ${passedQueries} / ${totalQueries} APROVADAS (${((passedQueries / totalQueries) * 100).toFixed(2)}%)`);
  console.log(`FALHAS DETECTADAS: ${failures.length}`);
  console.log('================================================================================');

  if (failures.length > 0) {
    console.error('Primeiras 20 falhas:');
    failures.slice(0, 20).forEach((f) => console.error(' ❌', f));
    process.exit(1);
  }
}

runMassiveAudit();
