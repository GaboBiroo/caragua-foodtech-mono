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
}

export const NEIGHBORHOODS: NeighborhoodConfig[] = [
  {
    id: "todos",
    name: "Todos de Caraguá",
    llmName: "LLM Manager Central",
    llmSpecialty: "Orquestrador RAG de 5 Estágios & Roteamento Hiperlocal",
    tagline: "Panorama consolidado dos 5 polos gastronômicos do município"
  },
  {
    id: "martim-de-sa",
    name: "Martim de Sá",
    llmName: "LLM Martim de Sá • v2.4",
    llmSpecialty: "Quiosques de Praia, Frutos do Mar & Agito Noturno",
    tagline: "Especialista em frutos do mar frescos pé na areia e eventos"
  },
  {
    id: "centro",
    name: "Centro",
    llmName: "LLM Centro Histórico • v2.1",
    llmSpecialty: "Tradição Caiçara, Pastelarias Clássicas & Patrimônio",
    tagline: "O coração da gastronomia centenária e culinária caiçara"
  },
  {
    id: "indaia",
    name: "Indaiá",
    llmName: "LLM Indaiá • v2.3",
    llmSpecialty: "Alta Gastronomia, Picanha na Brasa & Bistrôs Contemporâneos",
    tagline: "Orla gourmet sofisticada com vista para Ilhabela"
  },
  {
    id: "massaguacu",
    name: "Massaguaçu",
    llmName: "LLM Massaguaçu & Cocanha • v1.9",
    llmSpecialty: "Pesca Artesanal Caiçara, Tainha & Fazendas de Mexilhão",
    tagline: "Tradição de pescadores e frutos do mar direto das redes"
  },
  {
    id: "porto-novo",
    name: "Porto Novo",
    llmName: "LLM Porto Novo & Sul • v1.8",
    llmSpecialty: "Petiscos de Enseada, Ostras & Pastel Caiçara Raiz",
    tagline: "Polo sul ribeirinho com sabores autênticos e quiosques familiares"
  }
];

export const INITIAL_RESTAURANTS: RestaurantItem[] = [
  {
    id: "rest-martim-canto-bravo",
    slug: "quiosque-canto-bravo",
    name: "Quiosque Canto Bravo",
    neighborhood: "Martim de Sá",
    polo: "Polo Martim de Sá",
    address: "Av. Dr. Arthur Costa Filho, 2100",
    distanceKm: 1.2,
    latitude: -23.6268,
    longitude: -45.3934,
    ratingAverage: 4.65,
    decayedRatingAverage: 4.88,
    totalReviews: 412,
    foodSafetyScore: 98,
    priceLevel: 2,
    cuisineTypes: ["Frutos do Mar", "Caiçara", "Porções"],
    bannerUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    isLocalProducer: true,
    activePromotion: "Isca de Badejo com 15% OFF até 18h",
    regionalLLMInsight: "Badejo com 94% de aprovação em crocância nas últimas 48h. Fornecido diretamente pela colônia Z-8 de pescadores.",
    dishes: [
      {
        id: "d-1",
        name: "Isca de Badejo com Molho Tártaro Caiçara",
        description: "Badejo fresquinho do litoral norte empanado na farinha panko com raspas de limão-cravo.",
        price: 68.0,
        category: "Porções",
        isGlutenFree: true,
        isVegan: false,
        isPromotion: true,
        promoDiscount: "-15%",
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
        tags: ["Badejo", "Crocante", "Petisco", "Praia"]
      },
      {
        id: "d-2",
        name: "Casquinha de Siri Gratinada",
        description: "Carne pura de siri catado na barra da enseada com queijo canastra gratinado.",
        price: 28.0,
        category: "Entradas",
        isGlutenFree: true,
        isVegan: false,
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
        tags: ["Siri", "Gratinado", "Entrada"]
      },
      {
        id: "d-3",
        name: "Moqueca de Robalo com Camarão Sete-Barbas",
        description: "Cozida lentamente na panela de barro com leite de coco natural, dendê e pirão caiçara.",
        price: 135.0,
        category: "Pratos Principais",
        isGlutenFree: true,
        isVegan: false,
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
        tags: ["Robalo", "Camarão", "Moqueca", "Panela de Barro"]
      },
      {
        id: "d-acai-martim",
        name: "Açaí Orgânico da Mata Atlântica com Granola de Castanhas",
        description: "Polpa pura de açaí sem xarope artificial, servido com banana da serra e castanhas brasileiras.",
        price: 32.0,
        category: "100% Vegano",
        isGlutenFree: true,
        isVegan: true,
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegano", "Orgânico", "Sem Glúten", "Açaí"]
      }
    ],
    reviews: [
      {
        id: "rev-1",
        author: "M. Fernandes (Hash: 9a2b)",
        rating: 5.0,
        decayedRating: 4.95,
        comment: "O badejo mais crocante de Caraguá! Pé na areia, atendimento nota dez.",
        date: "Há 2 dias",
        daysAgo: 2,
        source: "App",
        isHighlighted: true,
        verifiedAudit: true,
        criteriaScores: { quality: 5.0, service: 4.9, costBenefit: 4.8 }
      },
      {
        id: "rev-2",
        author: "Turista SP (Hash: 4f1c)",
        rating: 4.8,
        decayedRating: 4.82,
        comment: "Excelente custo-benefício para frutos do mar na alta temporada.",
        date: "Há 12 dias",
        daysAgo: 12,
        source: "Google",
        criteriaScores: { quality: 4.8, service: 4.7, costBenefit: 4.9 }
      }
    ]
  },
  {
    id: "rest-centro-cantina-caicara",
    slug: "cantina-caicara-tradicao",
    name: "Cantina Caiçara Tradição",
    neighborhood: "Centro",
    polo: "Polo Centro Histórico",
    address: "Rua Altino Arantes, 450",
    distanceKm: 2.1,
    latitude: -23.6226,
    longitude: -45.4124,
    ratingAverage: 4.70,
    decayedRatingAverage: 4.94,
    totalReviews: 320,
    foodSafetyScore: 100,
    priceLevel: 2,
    cuisineTypes: ["Caiçara", "Tradicional", "Peixe Fresco", "Opções Veganas"],
    bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    isLocalProducer: true,
    activePromotion: "Azul-Marinho Tradicional com Pirão + Sobremesa de Banana Flambada",
    regionalLLMInsight: "Referência absoluta no resgate do Azul-Marinho centenário. Cozinha auditada com 100% de separação entre pratos de pescados e opções veganas.",
    dishes: [
      {
        id: "d-4",
        name: "Azul-Marinho Tradicional com Pirão",
        description: "Patrimônio imaterial caiçara: peixe fresco (badejo ou namorado) cozido lentamente com banana da terra verde da serra, servido com pirão escaldado. (Contém peixe fresco - NÃO é vegetariano/vegano).",
        price: 75.0,
        category: "Especialidades Caiçaras",
        isGlutenFree: true,
        isVegan: false,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        tags: ["Azul-Marinho", "Peixe", "Tradicional Caiçara", "Banana Verde"]
      },
      {
        id: "d-5",
        name: "Moqueca Vegana de Palmito Pupunha e Banana da Terra",
        description: "Palmito pupunha fresco cultivado no Litoral Norte, banana da terra regional, pimentões tostados e leite de coco artesanal. 100% livre de qualquer ingrediente animal, com certificação Food Safety.",
        price: 58.0,
        category: "100% Vegano",
        isVegan: true,
        isGlutenFree: true,
        isPromotion: true,
        promoDiscount: "-10%",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegano", "Palmito Pupunha", "Sem Glúten", "Moqueca Vegana"]
      }
    ],
    reviews: [
      {
        id: "rev-3",
        author: "Gabriel R. (Hash: 7e3d)",
        rating: 5.0,
        decayedRating: 5.0,
        comment: "O Azul-Marinho é um espetáculo histórico e cultural. A moqueca de pupunha também surpreendeu a família inteira!",
        date: "Ontem",
        daysAgo: 1,
        source: "App",
        isHighlighted: true,
        verifiedAudit: true,
        criteriaScores: { quality: 5.0, service: 5.0, costBenefit: 4.9 }
      }
    ]
  },
  {
    id: "rest-indaia-mar-terra",
    slug: "mar-e-terra-gourmet",
    name: "Mar & Terra Gourmet",
    neighborhood: "Indaiá",
    polo: "Polo Indaiá",
    address: "Av. Geraldo Nogueira da Silva, 1800",
    distanceKm: 0.8,
    latitude: -23.6350,
    longitude: -45.4210,
    ratingAverage: 4.52,
    decayedRatingAverage: 4.79,
    totalReviews: 198,
    foodSafetyScore: 96,
    priceLevel: 3,
    cuisineTypes: ["Contemporânea", "Carnes Nobres", "Camarão Rosa"],
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    activePromotion: "Festival do Camarão Rosa: Risoto em Dobro no Jantar",
    regionalLLMInsight: "O risoto de camarão rosa lidera o volume de menções positivas na orla do Indaiá. Decaimento temporal de 30 dias indica renovação do menu executivo.",
    dishes: [
      {
        id: "d-6",
        name: "Risoto de Camarão Rosa com Limão Siciliano",
        description: "Camarões rosa selecionados e grelhados no azeite extravirgem com arroz arbóreo al dente e raspas de limão siciliano.",
        price: 89.0,
        category: "Frutos do Mar",
        isGlutenFree: true,
        isVegan: false,
        isPromotion: true,
        promoDiscount: "2x1",
        imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
        tags: ["Camarão Rosa", "Risoto", "Limão Siciliano", "Gourmet"]
      },
      {
        id: "d-7",
        name: "Picanha Caiçara na Brasa",
        description: "Picanha maturada na brasa de lenha nobre com farofa crocante de banana da terra e vinagrete de palmito.",
        price: 95.0,
        category: "Carnes",
        isGlutenFree: true,
        isVegan: false,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        tags: ["Picanha", "Brasa", "Carne Nobre"]
      }
    ],
    reviews: [
      {
        id: "rev-4",
        author: "Paula B. (Hash: 11a0)",
        rating: 4.8,
        decayedRating: 4.75,
        comment: "O risoto de camarão é generoso e o ambiente com vista para o mar de Caraguá é lindo.",
        date: "Há 4 dias",
        daysAgo: 4,
        source: "iFood",
        criteriaScores: { quality: 4.9, service: 4.6, costBenefit: 4.6 }
      }
    ]
  },
  {
    id: "rest-indaia-emporio-verde",
    slug: "emporio-bistro-verde-mar",
    name: "Empório & Bistrô Verde Mar",
    neighborhood: "Indaiá",
    polo: "Polo Indaiá",
    address: "Av. Rio Branco, 820",
    distanceKm: 1.5,
    latitude: -23.6330,
    longitude: -45.4190,
    ratingAverage: 4.91,
    decayedRatingAverage: 4.96,
    totalReviews: 145,
    foodSafetyScore: 100,
    priceLevel: 2,
    cuisineTypes: ["100% Vegano", "Vegetariano", "Orgânico Caiçara", "Sem Glúten"],
    bannerUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    isLocalProducer: true,
    activePromotion: "Bowl Caiçara + Suco Prensado a Frio com 20% OFF",
    regionalLLMInsight: "Cozinha 100% livre de carne e pescados. Certificação rigorosa de celíacos e veganismo estrito pela vigilância nutricional do Litoral Norte.",
    dishes: [
      {
        id: "d-8-veg",
        name: "Bowl Caiçara de Quinoa, Shimeji e Castanhas da Mata",
        description: "Quinoa real, cogumelos shimeji salteados no azeite com alho-poró, chips de banana da terra e castanhas brasileiras tostadas.",
        price: 49.0,
        category: "100% Vegano",
        isVegan: true,
        isGlutenFree: true,
        isPromotion: true,
        promoDiscount: "-20%",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegano", "Quinoa", "Shimeji", "Sem Glúten", "Food Safety"]
      },
      {
        id: "d-9-veg",
        name: "Hambúrguer Artesanal de Grão de Bico e Cogumelos",
        description: "Blend vegetal artesanal de grão de bico e shimeji, queijo vegetal maçaricado, maionese de abacate caiçara e pão brioche vegano.",
        price: 42.0,
        category: "100% Vegano",
        isVegan: true,
        isGlutenFree: false,
        imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegano", "Burger Vegetal", "Grão de Bico"]
      }
    ],
    reviews: [
      {
        id: "rev-5",
        author: "Camila V. (Hash: 3b8c)",
        rating: 5.0,
        decayedRating: 5.0,
        comment: "Finalmente um lugar 100% seguro para veganos e celíacos em Caraguá! Pratos incríveis e cheios de sabor regional.",
        date: "Há 3 dias",
        daysAgo: 3,
        source: "App",
        isHighlighted: true,
        verifiedAudit: true,
        criteriaScores: { quality: 5.0, service: 5.0, costBenefit: 4.9 }
      }
    ]
  },
  {
    id: "rest-massaguacu-tainha",
    slug: "quiosque-tainha-dourada",
    name: "Quiosque & Peixaria Tainha Dourada",
    neighborhood: "Massaguaçu",
    polo: "Polo Massaguaçu",
    address: "Rod. Caraguá-Ubatuba, Km 90",
    distanceKm: 8.4,
    latitude: -23.5900,
    longitude: -45.3500,
    ratingAverage: 4.60,
    decayedRatingAverage: 4.85,
    totalReviews: 280,
    foodSafetyScore: 97,
    priceLevel: 2,
    cuisineTypes: ["Frutos do Mar", "Pesca Artesanal", "Caiçara"],
    bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    isLocalProducer: true,
    activePromotion: "Tainha na Brasa com Farofa de Camarão: Serve 3 pessoas com 20% OFF",
    regionalLLMInsight: "Tradição de pescadores caiçaras da Cocanha e Massaguaçu. Pescado fresco do dia com fogueira de chão e atendimento acolhedor.",
    dishes: [
      {
        id: "d-10",
        name: "Tainha na Brasa com Farofa de Camarão Seco",
        description: "Tainha inteira aberta recheada na brasa com farofa caiçara de camarão seco, arroz e vinagrete.",
        price: 110.0,
        category: "Frutos do Mar",
        isGlutenFree: true,
        isVegan: false,
        isPromotion: true,
        promoDiscount: "-20%",
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
        tags: ["Tainha", "Brasa", "Camarão", "Massaguaçu"]
      }
    ],
    reviews: [
      {
        id: "rev-6",
        author: "Rodrigo T. (Hash: c81a)",
        rating: 4.9,
        decayedRating: 4.88,
        comment: "A melhor tainha do litoral norte! Direto dos pescadores da Cocanha.",
        date: "Há 5 dias",
        daysAgo: 5,
        source: "Google",
        criteriaScores: { quality: 5.0, service: 4.7, costBenefit: 4.9 }
      }
    ]
  },
  {
    id: "rest-porto-novo-rancho",
    slug: "rancho-das-ostras-porto-novo",
    name: "Rancho das Ostras & Petiscos Porto Novo",
    neighborhood: "Porto Novo",
    polo: "Polo Porto Novo",
    address: "Av. José Herculano, 3400",
    distanceKm: 5.2,
    latitude: -23.6650,
    longitude: -45.4380,
    ratingAverage: 4.75,
    decayedRatingAverage: 4.92,
    totalReviews: 210,
    foodSafetyScore: 99,
    priceLevel: 2,
    cuisineTypes: ["Ostras Frescas", "Frutos do Mar", "Petiscos de Enseada"],
    bannerUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    isLocalProducer: true,
    activePromotion: "Dúzia de Ostras Vivas ao Limão-Cravo por R$ 48",
    regionalLLMInsight: "Ostras depuradas vivas provenientes da cooperativa de maricultores do Rio Juqueriquerê. Zero índice de contaminação.",
    dishes: [
      {
        id: "d-11",
        name: "Ostras Vivas Depuradas ao Limão-Cravo",
        description: "12 ostras frescas abertas na hora, acompanhadas de vinagrete caiçara e pimenta da casa.",
        price: 48.0,
        category: "Frutos do Mar",
        isGlutenFree: true,
        isVegan: false,
        isPromotion: true,
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        tags: ["Ostras", "Juqueriquerê", "Frescas"]
      },
      {
        id: "d-12-veg",
        name: "Pastel Vegano de Palmito Pupunha com Ervas da Mata",
        description: "Massa crocante artesanal recheada generosamente com palmito pupunha salteado no azeite com ervas frescas.",
        price: 18.0,
        category: "100% Vegano",
        isVegan: true,
        isGlutenFree: false,
        imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
        tags: ["Vegano", "Pastel", "Palmito Pupunha", "Petisco"]
      }
    ],
    reviews: [
      {
        id: "rev-7",
        author: "Fernanda L. (Hash: 66e2)",
        rating: 5.0,
        decayedRating: 4.96,
        comment: "Ostras mais frescas impossível! E o pastel de palmito é sequinho e muito saboroso.",
        date: "Há 1 dia",
        daysAgo: 1,
        source: "App",
        isHighlighted: true,
        verifiedAudit: true,
        criteriaScores: { quality: 5.0, service: 4.9, costBenefit: 4.9 }
      }
    ]
  }
];

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: "post-1",
    restaurantId: "rest-martim-canto-bravo",
    restaurantName: "Quiosque Canto Bravo",
    restaurantAvatar: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Martim de Sá",
    distanceKm: 1.2,
    postImage: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1000&q=85",
    caption: "Badejo fresquinho que acabou de desembarcar dos barcos da enseada de Caraguá! Empanado na farinha panko com raspas de limão-cravo e maionese artesanal. Pé na areia de verdade! #CaraguaFoodTech #MartimDeSa #BadejoFresco",
    dishName: "Isca de Badejo com Molho Tártaro Caiçara",
    dishPrice: 68.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: false,
    isVegan: false,
    likes: 342,
    commentsCount: 28,
    superRating: 4.88,
    totalReviews: 412,
    caraguaGostoAward: "Pódio Tradicional da Orla",
    jacquinTip: "O peixe foi frito em óleo novo e a crocância tá impecável, sem encharcar! Isso é respeito com o cliente e com o pescador!",
    isPromotion: true,
    promoBadge: "Promoção de Praia • -15% até 18h",
    verifiedSource: "Google Maps",
    regionalLLMSummary: "Polo Martim de Sá: 96% de aprovação em crocância nas últimas 48h.",
    isLocalProducer: true,
    createdAt: "Há 1 hora",
    commentsList: [
      { author: "Thiago P.", text: "Melhor isca de peixe de Martim de Sá! Crocante e bem servida.", rating: 5, date: "Há 30 min" },
      { author: "Marina S.", text: "O molho tártaro com limão-cravo é absurdo de bom!", rating: 5, date: "Há 1 hora" }
    ]
  },
  {
    id: "post-marujo-sororoca",
    restaurantId: "rest-centro-marujo",
    restaurantName: "Marujo Gastro Bar",
    restaurantAvatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Centro",
    distanceKm: 0.4,
    postImage: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1000&q=85",
    caption: "O prato que consagrou nosso bicampeonato no Caraguá a Gosto! Filé de sororoca da nossa costa grelhado na crosta de ervas, tomatinhos confit, azeitonas pretas, alcaparras e azeite perfumado. #CaraguaAGosto #Bicampeao #AltaGastronomia",
    dishName: "Sororoca a Mediterrâneo",
    dishPrice: 84.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 589,
    commentsCount: 46,
    superRating: 4.96,
    totalReviews: 870,
    caraguaGostoAward: "🏆 1º Lugar À La Carte Caraguá a Gosto",
    jacquinTip: "A sororoca é um peixe pelágico nobre da nossa costa. Manter a umidade interna desse peixe exige técnica de mestre! Magnifique!",
    isPromotion: false,
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "Centro: Bicampeão oficial do festival com notas máximas no júri técnico do Cliente Oculto.",
    isLocalProducer: true,
    createdAt: "Há 3 horas",
    commentsList: [
      { author: "Eduardo R.", text: "Comi na 20ª edição e voltei essa semana. Padrão internacional no Centro!", rating: 5, date: "Ontem" },
      { author: "Patrícia V.", text: "Azeite aromático impecável e peixe no ponto exato.", rating: 5, date: "Há 2 dias" }
    ]
  },
  {
    id: "post-japa-pizza-pernil",
    restaurantId: "rest-indaia-japa-pizza",
    restaurantName: "Pizzaria Japa Pizza",
    restaurantAvatar: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Indaiá",
    distanceKm: 0.9,
    postImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=85",
    caption: "Nossa campeã absoluta de votos no Caraguá a Gosto! Massa de fermentação longa de 48h, muçarela especial, pernil desfiado confitado lentamente com raspas de limão e especiarias. #JapaPizza #CaraguaAGosto #PizzaArtesanal",
    dishName: "Pizza Pernil Supremo no Forno a Lenha",
    dishPrice: 78.0,
    dishCategory: "Pizzas",
    isGlutenFree: false,
    isVegan: false,
    likes: 472,
    commentsCount: 39,
    superRating: 4.94,
    totalReviews: 642,
    caraguaGostoAward: "🏆 1º Lugar Pizzas Caraguá a Gosto",
    jacquinTip: "Fermentação fria de 48 horas! A massa tem alvéolos aerados e não pesa no estômago. O pernil é confitado com equilíbrio de acidez!",
    isPromotion: true,
    promoBadge: "Campeã de Votos • Borda Vulcão Grátis no Salão",
    verifiedSource: "iFood",
    regionalLLMSummary: "Indaiá: Referência em massas artesanais do mestre Sérgio Ikenaga.",
    createdAt: "Há 4 horas",
    commentsList: [
      { author: "Carlos M.", text: "Melhor pizza do litoral paulista inteiro. O pernil desmancha na boca!", rating: 5, date: "Há 1 hora" }
    ]
  },
  {
    id: "post-inbrasa-melt",
    restaurantId: "rest-indaia-inbrasa",
    restaurantName: "Inbrasa Caraguá",
    restaurantAvatar: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Indaiá",
    distanceKm: 1.1,
    postImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
    caption: "Campeão das categorias Lanches Artesanais e Delivery 2026! Duplo smash de costela prensado na chapa viva, cheddar inglês cremoso, cebola caramelizada na cerveja preta e bacon crocante no brioche selado. #Inbrasa #SmashBurger #AmericanBBQ",
    dishName: "Inbrasa Melt Tropical Defumado",
    dishPrice: 38.0,
    dishCategory: "Lanches Artesanais",
    isGlutenFree: false,
    isVegan: false,
    likes: 512,
    commentsCount: 53,
    superRating: 4.92,
    totalReviews: 815,
    caraguaGostoAward: "🏆 1º Lugar Lanches & Delivery 2026",
    jacquinTip: "Reação de Maillard perfeita na chapa! A carne tem crostinha caramelizada sem secar o centro. E o pão aguenta a viagem do motoboy sem amassar!",
    isPromotion: true,
    promoBadge: "Combo Campeão • Acompanha Batata Rústica",
    verifiedSource: "iFood",
    regionalLLMSummary: "Indaiá: Maior nota em integridade térmica na categoria Delivery do Caraguá a Gosto.",
    createdAt: "Há 5 horas",
    commentsList: [
      { author: "Lucas B.", text: "Chegou em casa como se tivesse saído da chapa agora. Imbatível!", rating: 5, date: "Há 2 horas" }
    ]
  },
  {
    id: "post-fcburger-gorgonzolita",
    restaurantId: "rest-indaia-fcburger",
    restaurantName: "FC Burger",
    restaurantAvatar: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Indaiá",
    distanceKm: 0.9,
    postImage: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1000&q=85",
    caption: "O burger autoral que conquistou o 1º lugar do Caraguá a Gosto! Blend bovino de 180g assado na brasa, creme suave de gorgonzola, cebola caramelizada na casa e fatias de bacon crocante. #FCBurger #Gorgonzolita #CaraguaAGosto",
    dishName: "Gorgonzolita na Brasa",
    dishPrice: 42.0,
    dishCategory: "Lanches Artesanais",
    isGlutenFree: false,
    isVegan: false,
    likes: 428,
    commentsCount: 31,
    superRating: 4.89,
    totalReviews: 530,
    caraguaGostoAward: "🏆 1º Lugar Lanches Artesanais 2025",
    jacquinTip: "Gorgonzola é perigoso porque pode roubar a cena toda. Mas aqui o creme tá sedoso e complementa a carne na brasa perfeitamente!",
    isPromotion: false,
    verifiedSource: "Google Maps",
    regionalLLMSummary: "Indaiá: Eleito pelo voto popular e júri técnico como o melhor hambúrguer na brasa.",
    createdAt: "Há 6 horas",
    commentsList: [
      { author: "Renata A.", text: "O creme de gorgonzola não é enjoativo, é suave e viciante!", rating: 5, date: "Há 3 horas" }
    ]
  },
  {
    id: "post-golfinho-massaguacu",
    restaurantId: "rest-massaguacu-golfinho",
    restaurantName: "Restaurante Golfinho",
    restaurantAvatar: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Massaguaçu",
    distanceKm: 9.8,
    postImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85",
    caption: "Quase 40 anos de tradição pé na areia na Praia do Massaguaçu! Travessa farta de abadejo fresco grelhado com molho denso de camarões médios, arroz soltinho e pirão tradicional. Serve 2 a 3 pessoas com fartura caiçara. #RestauranteGolfinho #Massaguacu #FrutosDoMar",
    dishName: "Abadejo ao Molho de Camarão com Pirão",
    dishPrice: 138.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 671,
    commentsCount: 58,
    superRating: 4.87,
    totalReviews: 2840,
    caraguaGostoAward: "🏛️ Patrimônio Gastronômico da Orla Norte",
    jacquinTip: "Quarenta anos de casa mantendo a mesma qualidade no peixe fresco! Esse pirão de caldo de peixe com farinha boa da região é ouro puro!",
    isPromotion: false,
    verifiedSource: "Google Maps",
    regionalLLMSummary: "Massaguaçu: Uma das casas mais tradicionais do Litoral Norte, com vista panorâmica da enseada.",
    isLocalProducer: true,
    createdAt: "Ontem",
    commentsList: [
      { author: "Família Silveira", text: "Almoço de domingo obrigatório quando descemos a serra. Porção gigante!", rating: 5, date: "Ontem" }
    ]
  },
  {
    id: "post-cocanha-mexilhoes",
    restaurantId: "rest-cocanha-amapec",
    restaurantName: "Fazenda Marinha da Cocanha (AMAPEC)",
    restaurantAvatar: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Cocanha",
    distanceKm: 12.4,
    postImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=85",
    caption: "Colhidos hoje de manhã nos espinhéis submersos (longlines) da maior fazenda marinha do estado de SP! Mexilhões Perna perna abertos no vapor da água do mar com gotas de limão-cravo e azeite. #Cocanha #AMAPEC #MariculturaSustentavel",
    dishName: "Mexilhões da Cocanha ao Vapor com Limão-Cravo",
    dishPrice: 45.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 495,
    commentsCount: 38,
    superRating: 4.98,
    totalReviews: 760,
    caraguaGostoAward: "🌊 Selo Oficial AMAPEC Maricultura",
    jacquinTip: "Mexilhão bivalve tem que ser colhido em água límpida e abrir na panela! A Cocanha produz o melhor marisco do Brasil, fresco e doce!",
    isPromotion: true,
    promoBadge: "Colheita do Dia • Degustação no Barco AMAPEC",
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "Cocanha: Produção cooperativa auditada com monitoramento contínuo contra biotoxinas.",
    isLocalProducer: true,
    createdAt: "Ontem",
    commentsList: [
      { author: "Gabriel M.", text: "Comi no passeio de barco da AMAPEC. Frescor inacreditável!", rating: 5, date: "Ontem" }
    ]
  },
  {
    id: "post-gama-costela",
    restaurantId: "rest-tinga-gama",
    restaurantName: "Gama Restaurante",
    restaurantAvatar: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Tinga",
    distanceKm: 2.8,
    postImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    caption: "1º Lugar na categoria Porções do Caraguá a Gosto! Costela bovina defumada por 12 horas no pit smoker em lenha frutífera, desfiada com temperos da casa e empanada na farinha panko sem massa. Sequinho por fora, derretendo por dentro! #GamaRestaurante #Tinga #PorcaoPremiada",
    dishName: "Bolinho de Costela Defumada Gama (6 unid.)",
    dishPrice: 39.0,
    dishCategory: "Porções",
    isGlutenFree: false,
    isVegan: false,
    likes: 389,
    commentsCount: 29,
    superRating: 4.85,
    totalReviews: 490,
    caraguaGostoAward: "🏆 1º Lugar Porções Caraguá a Gosto 2025",
    jacquinTip: "Bolinho de carne sem massa de batata pra enganar! É costela pura desfiada com crosta dourada. Quem inventou isso ama comida!",
    isPromotion: false,
    verifiedSource: "Google Maps",
    regionalLLMSummary: "Tinga: O orgulho da Zona Sul no festival gastronômico oficial.",
    createdAt: "Há 1 dia",
    commentsList: [
      { author: "Felipe T.", text: "O Tinga tem gastronomia de primeiro escalão! Esse bolinho é imbatível.", rating: 5, date: "Ontem" }
    ]
  },
  {
    id: "post-espeticho-camarao",
    restaurantId: "rest-tabatinga-espeticho",
    restaurantName: "Espeticho Beach House",
    restaurantAvatar: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Tabatinga",
    distanceKm: 16.5,
    postImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=85",
    caption: "Campeão de Petiscos de Praia no Caraguá a Gosto 2026! Camarões-rosa selecionados grelhados no espeto de bambu intercalados com cubos de manga madura na brasa e redução cítrica de maracujá da serra. Lounge pé na areia na Tabatinga! #Espeticho #Tabatinga #PetiscoDePraia",
    dishName: "Camarão Tropical Espeticho",
    dishPrice: 65.0,
    dishCategory: "Petiscos de Praia",
    isGlutenFree: true,
    isVegan: false,
    likes: 450,
    commentsCount: 33,
    superRating: 4.91,
    totalReviews: 610,
    caraguaGostoAward: "🏆 1º Lugar Petiscos de Praia 2026",
    jacquinTip: "A doçura da manga grelhada com a acidez do maracujá equilibra perfeitamente o camarão graúdo na brasa. C'est magnifique!",
    isPromotion: true,
    promoBadge: "Beach Club • Drink Autoral de Boas-Vindas",
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "Tabatinga: Beach club náutico com atendimento na areia e atracadouro de lanchas.",
    createdAt: "Há 1 dia",
    commentsList: [
      { author: "Helena G.", text: "Comer esse camarão olhando o mar da Tabatinga é uma experiência única.", rating: 5, date: "Há 2 dias" }
    ]
  },
  {
    id: "post-centro-azul-marinho",
    restaurantId: "rest-centro-cantina-caicara",
    restaurantName: "Cantina Caiçara Tradição",
    restaurantAvatar: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Centro",
    distanceKm: 2.1,
    postImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    caption: "A verdadeira receita ancestral de Caraguatatuba: peixe fresco com banana verde cozido lentamente na panela de ferro fundido. A reação química natural do tanino deixa o caldo com a cor azul-ardósia profunda. Acompanha pirão escaldado no tacho! #AzulMarinho #CulturaCaicara #CaraguaHistorica",
    dishName: "Azul-Marinho Tradicional na Panela de Ferro",
    dishPrice: 75.0,
    dishCategory: "Especialidades Caiçaras",
    isGlutenFree: true,
    isVegan: false,
    likes: 560,
    commentsCount: 52,
    superRating: 4.95,
    totalReviews: 780,
    caraguaGostoAward: "🏺 Patrimônio Cultural Imaterial Caiçara",
    jacquinTip: "Banana verde na panela de ferro bruto! Nada de panela de teflon ou corante químico! O caldo fica ardósia escuro e o pirão é denso e perfumado. Isso é história viva!",
    isPromotion: false,
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "Centro Histórico: Preservação rigorosa da receita secular caiçara do Litoral Norte.",
    isLocalProducer: true,
    createdAt: "Há 2 dias",
    commentsList: [
      { author: "Dona Neide", text: "Minha avó fazia exatamente assim no Canto do Bagre. Emocionante o sabor!", rating: 5, date: "Há 1 dia" }
    ]
  },
  {
    id: "post-goes-ice-roll",
    restaurantId: "rest-centro-goes-ice",
    restaurantName: "Góes Ice Roll",
    restaurantAvatar: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=150&q=80",
    neighborhood: "Centro",
    distanceKm: 0.3,
    postImage: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=85",
    caption: "1º Lugar na categoria Sobremesas do Caraguá a Gosto! Sorvete tailandês feito ao vivo na chapa a -30°C com leite condensado artesanal, raspado em rolinhos crocantes com frutas vermelhas frescas e calda artesanal. #GoesIceRoll #SorveteNaChapa #SobremesaPremiada",
    dishName: "Sorvete Tailandês Tradicional com Frutas Vermelhas",
    dishPrice: 24.0,
    dishCategory: "Sobremesas",
    isGlutenFree: true,
    isVegan: false,
    likes: 410,
    commentsCount: 35,
    superRating: 4.86,
    totalReviews: 420,
    caraguaGostoAward: "🏆 1º Lugar Sobremesas Caraguá a Gosto 2025",
    jacquinTip: "Textura aveludada sem cristal de gelo grande! A chapa a -30°C congela instantaneamente e preserva a cremosidade da base de leite!",
    isPromotion: false,
    verifiedSource: "Google Maps",
    regionalLLMSummary: "Centro: Praça Cândido Mota, ponto de encontro tradicional de famílias e jovens.",
    createdAt: "Há 2 dias",
    commentsList: [
      { author: "Jéssica L.", text: "Ver fazer na hora na chapa fria é um show, e o sabor é maravilhoso!", rating: 5, date: "Há 2 dias" }
    ]
  }
];

export const RADAR_ALERTS: RadarAlert[] = [
  {
    id: "al-1",
    type: "spike",
    title: "Spike Positivo no Martim de Sá",
    description: "Quiosque Canto Bravo registrou aumento de +18% em avaliações 5 estrelas nas últimas 72 horas após novo lote de badejo fresco.",
    timestamp: "Há 18 min",
    neighborhood: "Martim de Sá",
    impactScore: "+0.23 Super Nota"
  },
  {
    id: "al-2",
    type: "scraper",
    title: "Scraper da Madrugada (03:00) Concluído",
    description: "Ingestão automatizada de 412 avaliações no Google Maps e iFood. 100% dos dados normalizados para a equação de decaimento temporal.",
    timestamp: "Há 2 horas",
    neighborhood: "Todos de Caraguá",
    impactScore: "1.420 Reviews Ativas"
  },
  {
    id: "al-3",
    type: "fraud_purged",
    title: "Anomalia & Bots Expurgados",
    description: "Algoritmo de isolamento estatístico (Z-Score > 3.2) detectou e expurgou 12 avaliações falsas geradas pelo mesmo IP em 10 minutos.",
    timestamp: "Há 5 horas",
    neighborhood: "Indaiá",
    impactScore: "99.8% Integridade"
  },
  {
    id: "al-4",
    type: "new_dish",
    title: "Novidade Catalogada no Porto Novo",
    description: "Novo lote de ostras depuradas catalogado na cooperativa do Juqueriquerê com selo de inspeção sanitária nota 100.",
    timestamp: "Ontem",
    neighborhood: "Porto Novo",
    impactScore: "Novo Item"
  }
];
