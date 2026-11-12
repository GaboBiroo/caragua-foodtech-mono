import dump from './caraguaRealDump.json';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isGlutenFree?: boolean;
  isVegan?: boolean;
  isPromotion?: boolean;
  promoDiscount?: string;
  imageUrl: string;
  tags: string[];
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  decayedRating: number;
  comment: string;
  date: string;
  daysAgo: number;
  source: 'App' | 'Google' | 'iFood' | '99Food';
  isHighlighted?: boolean;
  verifiedAudit?: boolean;
  criteriaScores?: {
    quality: number;
    service: number;
    costBenefit: number;
  };
}

export interface RestaurantItem {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  polo: string;
  address: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  ratingAverage: number;
  decayedRatingAverage: number;
  totalReviews: number;
  foodSafetyScore: number;
  priceLevel: number;
  cuisineTypes: string[];
  bannerUrl: string;
  isVerified: boolean;
  isLocalProducer?: boolean;
  activePromotion?: string;
  regionalLLMInsight: string;
  dishes: Dish[];
  reviews: ReviewItem[];
}

export interface FeedPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAvatar?: string;
  neighborhood: string;
  distanceKm: number;
  postImage: string;
  postImageWidth?: number;
  postImageHeight?: number;
  caption: string;
  dishName: string;
  dishPrice: number;
  dishCategory: string;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  likes: number;
  commentsCount: number;
  superRating: number;
  totalReviews: number;
  caraguaGostoAward?: string;
  jacquinTip: string;
  isPromotion: boolean;
  promoBadge?: string;
  verifiedSource: 'Google Maps' | 'iFood' | '99 Food' | 'Comunidade Local';
  regionalLLMSummary: string;
  isLocalProducer?: boolean;
  createdAt: string;
  commentsList?: Array<{ author: string; text: string; rating: number; date: string }>;
  dishTag?: {
    x: number;
    y: number;
    label: string;
    price: number;
    highlight: string;
  };
}

export interface RadarAlert {
  id: string;
  type: 'spike' | 'scraper' | 'fraud_purged' | 'new_dish';
  title: string;
  description: string;
  timestamp: string;
  neighborhood: string;
  impactScore?: string;
}

export interface NeighborhoodConfig {
  id: string;
  name: string;
  llmName: string;
  llmSpecialty: string;
  tagline: string;
  emoji?: string;
}

export const NEIGHBORHOODS: NeighborhoodConfig[] = [
  {
    id: "todos",
    name: "Todos os 53 Bairros",
    llmName: "LLM Manager Central de Caraguá",
    llmSpecialty: "Orquestrador RAG de 5 Estágios & Roteamento Hiperlocal",
    tagline: "Todos os 53 bairros oficiais cadastrais do município de Caraguatatuba",
    emoji: "🌴"
  },
  {
    id: "centro",
    name: "Centro",
    llmName: "LLM Centro Histórico • v2.1",
    llmSpecialty: "Tradição Caiçara, Gastrobares & Patrimônio",
    tagline: "Gastrobares, trattorias, choperias históricas e azul-marinho tradicional",
    emoji: "🏛️"
  },
  {
    id: "indaia",
    name: "Indaiá",
    llmName: "LLM Indaiá Gourmet • v2.3",
    llmSpecialty: "Alta Gastronomia, Picanha na Brasa & Bistrôs Contemporâneos",
    tagline: "Orla gourmet nobre, pizzas artesanais campeãs e lanches na brasa",
    emoji: "🌊"
  },
  {
    id: "martim-de-sa",
    name: "Martim de Sá",
    llmName: "LLM Martim de Sá • v2.4",
    llmSpecialty: "Quiosques de Praia, Iscas Frescas & Agito Noturno",
    tagline: "Quiosques pé na areia com pescados da enseada e porções fartas",
    emoji: "🏖️"
  },
  {
    id: "prainha",
    name: "Prainha",
    llmName: "LLM Prainha Caiçara • v2.0",
    llmSpecialty: "Iscas de Peixe-Porco & Culinária Caiçara de Praia",
    tagline: "Águas calmas com quiosques tradicionais e vista da Pedra do Jacaré",
    emoji: "🐟"
  },
  {
    id: "sumare",
    name: "Sumaré",
    llmName: "LLM Sumaré Nobre • v2.0",
    llmSpecialty: "Cozinha Internacional Contemporânea & Bistrôs",
    tagline: "Enclave residencial com alta gastronomia contemporânea e bistrôs",
    emoji: "✨"
  },
  {
    id: "jardim-jaqueira",
    name: "Jardim Jaqueira",
    llmName: "LLM Jaqueira Express • v1.9",
    llmSpecialty: "Pizzarias Delivery, Padarias Artesanais & Marmitarias",
    tagline: "Corredor de serviços com restaurantes familiares e delivery expresso",
    emoji: "🍕"
  },
  {
    id: "estrela-dalva",
    name: "Estrela D'Alva",
    llmName: "LLM Estrela D'Alva • v1.8",
    llmSpecialty: "Espetarias, Salgaderias & Botecos Tradicionais",
    tagline: "Lanchonetes de bairro e petiscos autênticos de encosta",
    emoji: "⭐"
  },
  {
    id: "tinga",
    name: "Tinga",
    llmName: "LLM Tinga Tradicional • v2.2",
    llmSpecialty: "Porções Premiadas no Caraguá a Gosto & Defumados",
    tagline: "Casa do premiado Gama Restaurante e assados tradicionais da Zona Sul",
    emoji: "🍖"
  },
  {
    id: "poiares",
    name: "Poiares",
    llmName: "LLM Poiares Comercial • v1.9",
    llmSpecialty: "Churrascarias Comerciais & Rotisserias de Almoço",
    tagline: "Pólo comercial vibrante com comida caseira farta e rotisserias",
    emoji: "🥩"
  },
  {
    id: "pontal-santamarina",
    name: "Pontal Santamarina",
    llmName: "LLM Pontal & Shopping • v2.0",
    llmSpecialty: "Polo Gastronômico Serramar Shopping & Cafés",
    tagline: "Operações gastronômicas do shopping regional e restaurantes executivos",
    emoji: "🛍️"
  },
  {
    id: "jardim-gaivotas",
    name: "Jardim Gaivotas",
    llmName: "LLM Gaivotas Delivery • v1.8",
    llmSpecialty: "Pizzarias de Forno a Lenha & Hamburguerias",
    tagline: "Delivery de pizzas artesanais e doces caseiros tradicionais",
    emoji: "🕊️"
  },
  {
    id: "aruan",
    name: "Aruan",
    llmName: "LLM Aruan Orla • v2.0",
    llmSpecialty: "Quiosques de Orla Estruturados & Sorveterias",
    tagline: "Passeio à beira-mar com frutos do mar frescos e sorvetes artesanais",
    emoji: "🌴"
  },
  {
    id: "praia-das-palmeiras",
    name: "Praia das Palmeiras",
    llmName: "LLM Palmeiras Beira-Mar • v1.9",
    llmSpecialty: "Peixarias com Fritura na Hora & Comida Caiçara",
    tagline: "Peixe frito sequinho na hora com farofa e vinagrete beira-mar",
    emoji: "🌴"
  },
  {
    id: "jardim-britania",
    name: "Jardim Britânia",
    llmName: "LLM Britânia Praiano • v1.8",
    llmSpecialty: "Lanchonetes de Praia & Pizzarias de Veranistas",
    tagline: "Lanches caprichados e pizzas de massa média crocante",
    emoji: "🏖️"
  },
  {
    id: "porto-novo",
    name: "Porto Novo",
    llmName: "LLM Porto Novo & Ostras • v2.2",
    llmSpecialty: "Ostras Depuradas do Juqueriquerê & Pastéis Caiçaras",
    tagline: "Polo sul ribeirinho famoso pelas ostras vivas e pastel de palmito",
    emoji: "🦪"
  },
  {
    id: "barranco-alto",
    name: "Barranco Alto",
    llmName: "LLM Barranco Ribeirinho • v1.8",
    llmSpecialty: "Petiscarias Fluviais & Pescados de Água Doce e Salgada",
    tagline: "Tradição ribeirinha às margens do Juqueriquerê com porções rústicas",
    emoji: "🚣"
  },
  {
    id: "morro-do-algodao",
    name: "Morro do Algodão",
    llmName: "LLM Algodão Popular • v1.9",
    llmSpecialty: "Marmitarias de Alta Gramatura & Frangos Assados",
    tagline: "Comida caipira e caiçara em porções gigantes para trabalhadores",
    emoji: "🍗"
  },
  {
    id: "travessao",
    name: "Travessão",
    llmName: "LLM Travessão Divisa • v2.0",
    llmSpecialty: "Corredor Gastronômico Popular & Espetinhos de Rua",
    tagline: "Corredor gastronômico movimentado na divisa com São Sebastião",
    emoji: "🍢"
  },
  {
    id: "pereque-mirim",
    name: "Perequê-Mirim",
    llmName: "LLM Perequê Comunitário • v1.7",
    llmSpecialty: "Marmitarias Comunitárias & Porções de Beco",
    tagline: "Sabores comunitários populares com excelente custo-benefício",
    emoji: "🍲"
  },
  {
    id: "pegorelli",
    name: "Pegorelli",
    llmName: "LLM Pegorelli Rural • v1.7",
    llmSpecialty: "Quitutes da Roça, Queijos Caseiros & Doces",
    tagline: "Zona de transição rural-urbana com produtos caseiros da terra",
    emoji: "🧀"
  },
  {
    id: "tarumas",
    name: "Tarumãs",
    llmName: "LLM Tarumãs Express • v1.7",
    llmSpecialty: "Hamburguerias de Bairro & Lanches Prensados",
    tagline: "Hambúrgueres prensados saborosos com maionese temperada",
    emoji: "🍔"
  },
  {
    id: "massaguacu",
    name: "Massaguaçu",
    llmName: "LLM Massaguaçu & Pesca • v2.4",
    llmSpecialty: "Peixes Nobres em Travessas Fartas & Pesca Artesanal",
    tagline: "Casa do tradicional Restaurante Golfinho e tainha assada na brasa",
    emoji: "🐟"
  },
  {
    id: "capricornio",
    name: "Capricórnio",
    llmName: "LLM Capricórnio Costeira • v1.9",
    llmSpecialty: "Quiosques Rústicos Beira-Mar & Lagoa Azul",
    tagline: "Comida caiçara caseira entre as ondas fortes e a calma da lagoa",
    emoji: "🌊"
  },
  {
    id: "cocanha",
    name: "Cocanha",
    llmName: "LLM Cocanha Maricultura • v2.5",
    llmSpecialty: "Fazendas Marinhas de Mexilhões AMAPEC & Caldeiradas",
    tagline: "A capital dos mexilhões cultivados em espinhéis com selo AMAPEC",
    emoji: "🦐"
  },
  {
    id: "mococa",
    name: "Mococa",
    llmName: "LLM Mococa Artesanal • v2.1",
    llmSpecialty: "Peixes Inteiros na Brasa & Camarão no Bafo",
    tagline: "Praia familiar de areia monazítica com quiosques de pescadores",
    emoji: "🐠"
  },
  {
    id: "tabatinga",
    name: "Tabatinga",
    llmName: "LLM Tabatinga Náutica • v2.3",
    llmSpecialty: "Beach Clubs Sofisticados, Espeticho & Marinas",
    tagline: "Lounge pé na areia com camarões no espeto de bambu e drinks autorais",
    emoji: "⛵"
  },
  {
    id: "cantagalo",
    name: "Cantagalo",
    llmName: "LLM Cantagalo Encosta • v1.7",
    llmSpecialty: "Botecos Tradicionais de Encosta & Marmitas",
    tagline: "Petiscos simples e acolhedores no pé da serra de Caraguá",
    emoji: "⛰️"
  },
  {
    id: "olaria",
    name: "Olaria",
    llmName: "LLM Olaria Tradicional • v1.8",
    llmSpecialty: "Petiscos de Boteco & Pequenas Pizzarias",
    tagline: "Bairro tradicional com petiscos de boteco e receitas familiares",
    emoji: "🧱"
  },
  {
    id: "casa-branca",
    name: "Casa Branca",
    llmName: "LLM Casa Branca • v1.9",
    llmSpecialty: "Hamburguerias Artesanais & Caldos de Inverno",
    tagline: "Hamburguerias de quintal com blends de carne e caldos quentinhos",
    emoji: "🏡"
  },
  {
    id: "rio-do-ouro",
    name: "Rio do Ouro",
    llmName: "LLM Rio do Ouro Caipira • v2.0",
    llmSpecialty: "Comida no Fogão a Lenha & Restaurantes de Estrada",
    tagline: "Culinária caipira-caiçara feita no tacho com galinha caipira e polenta",
    emoji: "🍲"
  },
  {
    id: "ponte-seca",
    name: "Ponte Seca",
    llmName: "LLM Ponte Seca • v1.7",
    llmSpecialty: "Salgados de Estufa & Marmitex Rápido",
    tagline: "Pontos tradicionais de café com salgado frito na hora",
    emoji: "🥐"
  },
  {
    id: "jaraguazinho",
    name: "Jaraguazinho",
    llmName: "LLM Jaraguazinho Espetos • v1.9",
    llmSpecialty: "Espetarias de Brasa Viva & Marmitas Executivas",
    tagline: "Espetinhos de carne assados na brasa com vinagrete e farofa de milho",
    emoji: "🍢"
  },
  {
    id: "benfica",
    name: "Benfica",
    llmName: "LLM Benfica • v1.7",
    llmSpecialty: "Botecos Clássicos & Marmitex",
    tagline: "Encontro comunitário com petiscos de boteco bem temperados",
    emoji: "🍻"
  },
  {
    id: "capa-mao",
    name: "Capa Mão",
    llmName: "LLM Capa Mão Raiz • v1.7",
    llmSpecialty: "Cachaças Curtidas com Cambuci & Torresmo de Rolo",
    tagline: "Cachaça artesanal da serra curtida com cambuci e torresmo estaladiço",
    emoji: "🍶"
  },
  {
    id: "jardim-primavera",
    name: "Jardim Primavera",
    llmName: "LLM Primavera Lanches • v1.8",
    llmSpecialty: "Hamburguerias de Bairro & Dogs Prensados",
    tagline: "Dogs completos com purê artesanal e lanches da madrugada",
    emoji: "🌭"
  },
  {
    id: "jardim-terralao",
    name: "Jardim Terralão",
    llmName: "LLM Terralão Comunitário • v1.7",
    llmSpecialty: "Marmitas Caseiras & Botecos de Encosta",
    tagline: "Comida caseira feita com amor nas encostas do município",
    emoji: "🌿"
  },
  {
    id: "golfinho",
    name: "Golfinho",
    llmName: "LLM Golfinho Residencial • v1.8",
    llmSpecialty: "Pizzas Delivery & Açaí Artesanal",
    tagline: "Açaí batido na hora com frutas frescas e pizzas quentinhas em casa",
    emoji: "🫐"
  },
  {
    id: "pan-brasil",
    name: "Pan Brasil",
    llmName: "LLM Pan Brasil • v1.7",
    llmSpecialty: "Marmitex Econômico de Balcão & Quitutes",
    tagline: "Comida boa e farta com tempero caseiro da Zona Sul",
    emoji: "🍛"
  },
  {
    id: "jardim-samambaia",
    name: "Jardim Samambaia",
    llmName: "LLM Samambaia • v1.8",
    llmSpecialty: "Rotisserias de Bairro & Lanches na Chapa",
    tagline: "Lanches caprichados e frango com batatas aos domingos",
    emoji: "🪴"
  },
  {
    id: "jardim-forest",
    name: "Jardim Forest",
    llmName: "LLM Forest Confeitaria • v1.8",
    llmSpecialty: "Doces Artesanais, Bolos de Festa & Hamburguerias",
    tagline: "Bolos confeitados com frutas da estação e burgers artesanais",
    emoji: "🎂"
  },
  {
    id: "getuba",
    name: "Getuba",
    llmName: "LLM Getuba Estrada • v1.9",
    llmSpecialty: "Pastelarias de Estrada & Culinária Caipira",
    tagline: "Pastéis gigantes sequinhos na rodovia e comida caipira de panela",
    emoji: "🥟"
  },
  {
    id: "jetuba",
    name: "Jetuba",
    llmName: "LLM Jetuba Pesqueiros • v1.8",
    llmSpecialty: "Pesqueiros Familiares & Porções de Tilápia Frita",
    tagline: "Lazer campestre de fim de semana com porções de peixe fresco",
    emoji: "🎣"
  },
  {
    id: "verde-mar",
    name: "Verde Mar",
    llmName: "LLM Verde Mar Artesanal • v1.8",
    llmSpecialty: "Panificação Artesanal & Quitutes da Mata Atlântica",
    tagline: "Pães de fermentação natural e geleias artesanais de cambuci",
    emoji: "🍞"
  },
  {
    id: "praia-brava",
    name: "Praia Brava",
    llmName: "LLM Praia Brava Selvagem • v1.6",
    llmSpecialty: "Ecoturismo, Piqueniques Agrestes & Trilhas",
    tagline: "Natureza intocada preservada para ecoturismo e contemplação",
    emoji: "🏄"
  },
  {
    id: "canto-do-mar",
    name: "Canto do Mar",
    llmName: "LLM Canto do Mar Pescadores • v1.9",
    llmSpecialty: "Botecos de Pescadores & Porções Mistas da Costa",
    tagline: "Pescados trazidos direto dos barcos na divisa com São Sebastião",
    emoji: "⚓"
  },
  {
    id: "ipiranga",
    name: "Ipiranga",
    llmName: "LLM Ipiranga Express • v1.8",
    llmSpecialty: "Salgados Artesanais Congelados & Marmitarias",
    tagline: "Atendimento expresso para moradores e trabalhadores locais",
    emoji: "🥪"
  },
  {
    id: "jardim-jaqueira-2",
    name: "Jardim Jaqueira II",
    llmName: "LLM Jaqueira II Delivery • v1.8",
    llmSpecialty: "Hamburguerias de Garagem & Pastéis Especiais",
    tagline: "Hambúrguer artesanal saboroso com molhos caseiros secretos",
    emoji: "🍔"
  },
  {
    id: "jardim-california",
    name: "Jardim Califórnia",
    llmName: "LLM Califórnia Pizzas • v1.8",
    llmSpecialty: "Pizzarias Noturnas & Marmitas Executivas",
    tagline: "Pizzas bem recheadas e marmitas com entrega pontual",
    emoji: "🍕"
  },
  {
    id: "vila-everest",
    name: "Vila Everest",
    llmName: "LLM Everest Confeitaria • v1.9",
    llmSpecialty: "Cafés Intimistas & Confeitarias Finas de Encosta",
    tagline: "Cafés especiais coados e tortas finas com vista panorâmica",
    emoji: "☕"
  },
  {
    id: "vila-atlantica",
    name: "Vila Atlântica",
    llmName: "LLM Vila Atlântica • v1.8",
    llmSpecialty: "Bares de Petiscos Tradicionais de Calçada",
    tagline: "Petiscos de estufa com cerveja trincando em mesas de calçada",
    emoji: "🍻"
  },
  {
    id: "balneario-copacabana",
    name: "Balneário Copacabana",
    llmName: "LLM Copacabana Verão • v1.8",
    llmSpecialty: "Lanchonetes de Temporada & Sorvetes da Orla Sul",
    tagline: "Clima de férias o ano inteiro com açaí e lanches naturais",
    emoji: "🍦"
  },
  {
    id: "caputera",
    name: "Caputera",
    llmName: "LLM Caputera Raiz • v1.8",
    llmSpecialty: "Cachaça com Cambuci & Culinária Tradicional Caiçara",
    tagline: "História e tradição caiçara viva com caldos e petiscos de estufa",
    emoji: "🍶"
  },
  {
    id: "fazendinha",
    name: "Fazendinha",
    llmName: "LLM Fazendinha da Mata • v2.0",
    llmSpecialty: "Casas de Farinha Caiçara, Taioba & Palmito Pupunha",
    tagline: "Produtos agroflorestais sustentáveis colhidos aos pés da serra",
    emoji: "🥬"
  }
];


const RAW_RESTAURANTS = ((dump as any).restaurants || []) as any[];
const RAW_DETAILS = ((dump as any).restaurant_details || {}) as Record<string, any>;

export const INITIAL_RESTAURANTS: RestaurantItem[] = RAW_RESTAURANTS.map((r) => {
  const det = RAW_DETAILS[r.slug] || {};
  const reviewsList = (det.recent_reviews || det.reviews || []) as any[];
  const dishesList = (r.dishes_preview || r.dishes || []) as any[];

  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    neighborhood: String(r.neighborhood || 'Caraguatatuba'),
    polo: String(r.neighborhood || 'Caraguatatuba'),
    address: String(r.address || 'Caraguatatuba - SP'),
    distanceKm: Number(r.distance_km || 0),
    latitude: Number(r.latitude || -23.6226),
    longitude: Number(r.longitude || -45.4124),
    ratingAverage: Number(r.rating_average || 0),
    decayedRatingAverage: Number(r.rating_score ?? r.rating_average ?? 0),
    totalReviews: Number(r.total_reviews || 0),
    foodSafetyScore: 100,
    priceLevel: Number(r.price_level || 2),
    cuisineTypes: Array.isArray(r.cuisine_types) ? r.cuisine_types : [],
    bannerUrl: String(r.banner_url || r.image_url || ''),
    isVerified: true,
    isLocalProducer: false,
    activePromotion: r.has_price_drop ? 'Promoção ativa no cardápio' : undefined,
    regionalLLMInsight: `${r.neighborhood || 'Caraguatatuba'} • ${r.active_dishes_count || dishesList.length} itens extraídos de ${r.source_platform || 'cardápio digital'}.`,
    dishes: dishesList.map((d) => ({
      id: String(d.id),
      name: String(d.name),
      description: String(d.description || ''),
      price: Number(d.price || 0),
      category: String(d.category || 'Cardápio'),
      isGlutenFree: Boolean(d.is_gluten_free),
      isVegan: Boolean(d.is_vegan),
      isPromotion: Number(d.last_price_delta_pct || 0) < 0,
      promoDiscount: Number(d.last_price_delta_pct || 0) < 0 ? `${Math.abs(Math.round(Number(d.last_price_delta_pct)))}% OFF` : undefined,
      imageUrl: String(d.image_url || ''),
      tags: Array.isArray(r.cuisine_types) ? r.cuisine_types : [],
    })),
    reviews: reviewsList.map((rev, idx) => ({
      id: String(rev.id || `${r.slug}-rev-${idx}`),
      author: String(rev.author || 'Cliente Google Maps'),
      rating: Number(rev.rating || 5),
      decayedRating: Number(rev.rating || 5),
      comment: String(rev.comment || ''),
      date: String(rev.date || 'Google Maps'),
      daysAgo: 1,
      source: 'Google' as const,
      verifiedAudit: true,
    })),
  };
});

export const INITIAL_FEED_POSTS: FeedPost[] = RAW_RESTAURANTS.flatMap((r) => {
  const det = RAW_DETAILS[r.slug] || {};
  const reviewsList = (det.recent_reviews || det.reviews || []) as any[];
  const dishesList = ((r.dishes_preview || r.dishes || []) as any[]).filter((d) => Boolean(d.image_url));

  return dishesList.slice(0, 3).map((d) => ({
    id: String(d.id),
    restaurantId: String(r.id),
    restaurantName: String(r.name),
    restaurantAvatar: String(r.image_url || r.banner_url || ''),
    neighborhood: String(r.neighborhood || 'Caraguatatuba'),
    distanceKm: Number(r.distance_km || 0),
    postImage: String(d.image_url),
    caption: String(d.description || `${d.name} disponível no cardápio de ${r.name}.`),
    dishName: String(d.name),
    dishPrice: Number(d.price || 0),
    dishCategory: String(d.category || 'Cardápio'),
    isVegan: Boolean(d.is_vegan),
    isGlutenFree: Boolean(d.is_gluten_free),
    likes: 0,
    commentsCount: reviewsList.length,
    superRating: Number(r.rating_score ?? r.rating_average ?? 0),
    totalReviews: Number(r.total_reviews || 0),
    jacquinTip: `Extraído de ${r.source_platform || 'cardápio digital'} • Preço conferido em Caraguatatuba.`,
    isPromotion: Number(d.last_price_delta_pct || 0) < 0,
    promoBadge: Number(d.last_price_delta_pct || 0) < 0 && d.savings_brl
      ? `Baixou R$ ${Number(d.savings_brl).toFixed(2).replace('.', ',')}`
      : undefined,
    verifiedSource: 'Google Maps' as const,
    regionalLLMSummary: `${r.neighborhood || 'Caraguatatuba'}: ${r.active_dishes_count || 0} pratos reais catalogados.`,
    createdAt: 'Conferido',
    commentsList: reviewsList.map((rev) => ({
      author: String(rev.author || 'Cliente Google Maps'),
      text: String(rev.comment || ''),
      rating: Number(rev.rating || 5),
      date: String(rev.date || 'Google Maps'),
    })),
  }));
});

export const RADAR_ALERTS: RadarAlert[] = RAW_RESTAURANTS.filter((r) => r.has_price_drop)
  .slice(0, 6)
  .map((r, idx) => {
    const promoDish = ((r.dishes_preview || []) as any[]).find((d) => Number(d.last_price_delta_pct || 0) < 0) || r.dishes_preview?.[0];
    return {
      id: `real-drop-${idx + 1}`,
      type: 'new_dish' as const,
      title: `Preço promocional em ${r.name}`,
      description: promoDish
        ? `${promoDish.name} por R$ ${Number(promoDish.price).toFixed(2).replace('.', ',')}${promoDish.previous_price ? ` (de R$ ${Number(promoDish.previous_price).toFixed(2).replace('.', ',')})` : ''}.`
        : 'Promoção real detectada no cardápio oficial.',
      timestamp: 'Ao vivo',
      neighborhood: String(r.neighborhood || 'Caraguatatuba'),
      impactScore: promoDish && promoDish.last_price_delta_pct ? `${promoDish.last_price_delta_pct}%` : 'Oferta Ativa',
    };
  });
