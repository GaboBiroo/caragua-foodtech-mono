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
  isPromotion: boolean;
  promoBadge?: string;
  verifiedSource: 'Google Maps' | 'iFood' | '99 Food' | 'Comunidade Local';
  regionalLLMSummary: string;
  isLocalProducer?: boolean;
  createdAt: string;
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
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
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
    neighborhood: "Martim de Sá",
    distanceKm: 1.2,
    postImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85",
    caption: "Badejo fresquinho que acabou de chegar dos barcos da enseada de Caraguá! Empanado na farinha panko com raspas de limão-cravo.",
    dishName: "Isca de Badejo com Molho Tártaro Caiçara",
    dishPrice: 68.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 142,
    commentsCount: 19,
    isPromotion: true,
    promoBadge: "Promoção Ativa por Perto • -15% até 18h",
    verifiedSource: "Google Maps",
    regionalLLMSummary: "LLM Martim de Sá: 94% de aprovação em crocância nas últimas 48h. Spike positivo de avaliações após troca de óleo vegetal.",
    isLocalProducer: true,
    createdAt: "Há 2 horas"
  },
  {
    id: "post-2",
    restaurantId: "rest-indaia-mar-terra",
    restaurantName: "Mar & Terra Gourmet",
    neighborhood: "Indaiá",
    distanceKm: 0.8,
    postImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=85",
    caption: "Festival de Camarão Rosa em andamento no Indaiá! Risoto al dente finalizado com limão siciliano e camarões rosa gigantes.",
    dishName: "Risoto de Camarão Rosa com Limão Siciliano",
    dishPrice: 89.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 218,
    commentsCount: 34,
    isPromotion: true,
    promoBadge: "Festival do Camarão • Risoto em Dobro no Jantar",
    verifiedSource: "iFood",
    regionalLLMSummary: "LLM Indaiá: Alta gastronomia da orla com nota de decaimento temporal subindo para 4.79. Camarões rosa frescos auditados.",
    createdAt: "Há 4 horas"
  },
  {
    id: "post-3",
    restaurantId: "rest-indaia-emporio-verde",
    restaurantName: "Empório & Bistrô Verde Mar",
    neighborhood: "Indaiá",
    distanceKm: 1.5,
    postImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85",
    caption: "Alimentação consciente e 100% segura! Nosso Bowl Caiçara com shimeji fresco, quinoa real, chips de banana da serra e castanhas.",
    dishName: "Bowl Caiçara de Quinoa, Shimeji e Castanhas da Mata",
    dishPrice: 49.0,
    dishCategory: "100% Vegano",
    isGlutenFree: true,
    isVegan: true,
    likes: 185,
    commentsCount: 22,
    isPromotion: true,
    promoBadge: "100% Vegano • Food Safety Certificado",
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "LLM Indaiá / Food Safety: Cozinha 100% livre de pescados ou produtos de origem animal. 0% risco de contaminação cruzada.",
    isLocalProducer: true,
    createdAt: "Há 6 horas"
  },
  {
    id: "post-4",
    restaurantId: "rest-centro-cantina-caicara",
    restaurantName: "Cantina Caiçara Tradição",
    neighborhood: "Centro",
    distanceKm: 2.1,
    postImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    caption: "O sabor centenário de Caraguatatuba: peixe fresco com banana da terra verde da serra, cozido no tacho de barro. Patrimônio cultural!",
    dishName: "Azul-Marinho Tradicional com Pirão",
    dishPrice: 75.0,
    dishCategory: "Especialidades Caiçaras",
    isGlutenFree: true,
    isVegan: false,
    likes: 290,
    commentsCount: 45,
    isPromotion: false,
    verifiedSource: "Comunidade Local",
    regionalLLMSummary: "LLM Centro Histórico: Prato ícone da cultura caiçara de Caraguá. Nota 5.0 nas últimas 4 semanas pela preservação da receita autêntica.",
    isLocalProducer: true,
    createdAt: "Ontem"
  },
  {
    id: "post-5",
    restaurantId: "rest-porto-novo-rancho",
    restaurantName: "Rancho das Ostras & Petiscos",
    neighborhood: "Porto Novo",
    distanceKm: 5.2,
    postImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85",
    caption: "Direto da cooperativa de maricultores do Rio Juqueriquerê: ostras vivas abertas na hora com limão-cravo do quintal.",
    dishName: "Ostras Vivas Depuradas ao Limão-Cravo",
    dishPrice: 48.0,
    dishCategory: "Frutos do Mar",
    isGlutenFree: true,
    isVegan: false,
    likes: 164,
    commentsCount: 15,
    isPromotion: true,
    promoBadge: "Dúzia Especial • Produtor Local Juqueriquerê",
    verifiedSource: "99 Food",
    regionalLLMSummary: "LLM Porto Novo: Maricultura limpa com água tratada e depuração controlada. Excelente aceitação entre os moradores locais.",
    isLocalProducer: true,
    createdAt: "Ontem"
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
