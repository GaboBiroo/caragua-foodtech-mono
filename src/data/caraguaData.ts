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
}

export interface RestaurantItem {
  id: string;
  slug: string;
  name: string;
  neighborhood: string;
  polo: string;
  address: string;
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
  activePromotion?: string;
  dishes: Dish[];
  reviews: ReviewItem[];
}

export interface FeedPost {
  id: string;
  restaurantId: string;
  restaurantName: string;
  neighborhood: string;
  authorAvatar: string;
  postImage: string;
  caption: string;
  dishName: string;
  dishPrice: number;
  likes: number;
  commentsCount: number;
  commentsList: { author: string; text: string; time: string }[];
  isPromotion: boolean;
  promoBadge?: string;
  regionalLLMSummary: string;
  createdAt: string;
}

export const INITIAL_RESTAURANTS: RestaurantItem[] = [
  {
    id: "rest-martim-canto-bravo",
    slug: "quiosque-canto-bravo",
    name: "Quiosque Canto Bravo",
    neighborhood: "Martim de Sá",
    polo: "Polo Martim de Sá",
    address: "Av. Dr. Arthur Costa Filho, 2100",
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
    activePromotion: "Isca de Badejo com 15% OFF até 18h",
    dishes: [
      {
        id: "d-1",
        name: "Isca de Badejo com Molho Tártaro Caiçara",
        description: "Badejo fresquinho do litoral norte empanado na farinha panko com raspas de limão-cravo.",
        price: 68.0,
        category: "Porções",
        isGlutenFree: true,
        isPromotion: true,
        promoDiscount: "-15%",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "d-2",
        name: "Casquinha de Siri Gratinada",
        description: "Carne pura de siri catado na barra da enseada com queijo canastra gratinado.",
        price: 28.0,
        category: "Entradas",
        imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "d-3",
        name: "Moqueca de Robalo com Camarão Sete-Barbas",
        description: "Cozida lentamente na panela de barro com leite de coco natural, dendê e pirão.",
        price: 135.0,
        category: "Pratos Principais",
        isGlutenFree: true,
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
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
        verifiedAudit: true
      },
      {
        id: "rev-2",
        author: "Turista SP (Hash: 4f1c)",
        rating: 4.8,
        decayedRating: 4.82,
        comment: "Excelente custo-benefício para frutos do mar na alta temporada.",
        date: "Há 12 dias",
        daysAgo: 12,
        source: "Google"
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
    latitude: -23.6226,
    longitude: -45.4124,
    ratingAverage: 4.70,
    decayedRatingAverage: 4.92,
    totalReviews: 320,
    foodSafetyScore: 100,
    priceLevel: 2,
    cuisineTypes: ["Caiçara", "Tradicional", "Vegano"],
    bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    activePromotion: "Azul-Marinho com Pirão Tradicional + Sobremesa Grátis",
    dishes: [
      {
        id: "d-4",
        name: "Azul-Marinho Tradicional com Pirão",
        description: "Patrimônio imaterial caiçara: peixe cozido com banana da terra verde da serra do mar.",
        price: 75.0,
        category: "Especialidades",
        isGlutenFree: true,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "d-5",
        name: "Moqueca Vegana de Palmito Pupunha",
        description: "Palmito fresco regional, pimentões tostados e castanhas com leite de coco.",
        price: 58.0,
        category: "Vegano",
        isVegan: true,
        isGlutenFree: true,
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
      }
    ],
    reviews: [
      {
        id: "rev-3",
        author: "Gabriel R. (Hash: 7e3d)",
        rating: 5.0,
        decayedRating: 5.0,
        comment: "O Azul-Marinho é um espetáculo cultural. Sabor que não se encontra em outro lugar.",
        date: "Ontem",
        daysAgo: 1,
        source: "App",
        isHighlighted: true,
        verifiedAudit: true
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
    latitude: -23.6350,
    longitude: -45.4210,
    ratingAverage: 4.52,
    decayedRatingAverage: 4.65,
    totalReviews: 198,
    foodSafetyScore: 96,
    priceLevel: 3,
    cuisineTypes: ["Contemporânea", "Carnes", "Camarão"],
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    activePromotion: "Festival de Camarão Rosa: Risoto em Dobro no Jantar",
    dishes: [
      {
        id: "d-6",
        name: "Risoto de Camarão Rosa com Limão Siciliano",
        description: "Camarões rosa selecionados flambados na cachaça da serra com arroz arbóreo al dente.",
        price: 89.0,
        category: "Pratos Principais",
        isGlutenFree: true,
        isPromotion: true,
        promoDiscount: "2x1",
        imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80"
      },
      {
        id: "d-7",
        name: "Picanha Caiçara na Brasa",
        description: "Picanha maturada na brasa de eucalipto com farofa crocante de banana da terra.",
        price: 95.0,
        category: "Carnes",
        isGlutenFree: true,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
      }
    ],
    reviews: [
      {
        id: "rev-4",
        author: "Paula B. (Hash: 11a0)",
        rating: 4.8,
        decayedRating: 4.75,
        comment: "O risoto de camarão é generoso e o ambiente com vista para o mar é lindo.",
        date: "Há 4 dias",
        daysAgo: 4,
        source: "iFood"
      }
    ]
  },
  {
    id: "rest-massaguacu-tainha",
    slug: "barraca-tainha-pescados",
    name: "Barraca da Tainha & Pescados",
    neighborhood: "Massaguaçu",
    polo: "Polo Massaguaçu",
    address: "Rodovia Rio-Santos, Km 92",
    latitude: -23.5950,
    longitude: -45.3520,
    ratingAverage: 4.60,
    decayedRatingAverage: 4.78,
    totalReviews: 145,
    foodSafetyScore: 97,
    priceLevel: 2,
    cuisineTypes: ["Pescados", "Caiçara Raiz", "Festival da Tainha"],
    bannerUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    isVerified: true,
    activePromotion: "Tainha Espalmada na Brasa por R$ 69,90",
    dishes: [
      {
        id: "d-8",
        name: "Tainha Espalmada na Grelha com Farofa",
        description: "Tainha fresca espalmada e assada na brasa, servida com vinagrete de maracujá da restinga.",
        price: 82.0,
        category: "Especialidades",
        isPromotion: true,
        promoDiscount: "-15%",
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
      }
    ],
    reviews: [
      {
        id: "rev-5",
        author: "Pescador Local (Hash: 88bb)",
        rating: 5.0,
        decayedRating: 4.90,
        comment: "Peixe chega do barco direto pra grelha. Autenticidade total em Massaguaçu.",
        date: "Há 5 dias",
        daysAgo: 5,
        source: "App",
        verifiedAudit: true
      }
    ]
  },
  {
    id: "rest-portonovo-pescador",
    slug: "restaurante-pescador-sul",
    name: "Restaurante O Pescador do Sul",
    neighborhood: "Porto Novo",
    polo: "Polo Porto Novo",
    address: "Av. José da Costa Pinheiro Júnior, 320",
    latitude: -23.6700,
    longitude: -45.4300,
    ratingAverage: 4.45,
    decayedRatingAverage: 4.58,
    totalReviews: 92,
    foodSafetyScore: 95,
    priceLevel: 1,
    cuisineTypes: ["Frutos do Mar", "Caseira", "Família"],
    bannerUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    isVerified: false,
    activePromotion: "Caldeirada Família para 3 Pessoas por R$ 98",
    dishes: [
      {
        id: "d-9",
        name: "Caldeirada Caiçara Família",
        description: "Postas de pescada branca, lula, mariscos e camarões frescos com pirão de caldo natural.",
        price: 98.0,
        category: "Para Compartilhar",
        isGlutenFree: true,
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
      }
    ],
    reviews: [
      {
        id: "rev-6",
        author: "Caiçara Antigo (Hash: 23fa)",
        rating: 4.5,
        decayedRating: 4.60,
        comment: "Fartura enorme, peixe fresquinho e preço justo de verdade.",
        date: "Há 8 dias",
        daysAgo: 8,
        source: "99Food"
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
    authorAvatar: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
    postImage: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80",
    caption: "Acabou de sair do fogo! Isca de badejo crocante com molho tártaro artesanal. Quem vem almoçar com vista pro mar hoje?",
    dishName: "Isca de Badejo Crocante",
    dishPrice: 68.0,
    likes: 142,
    commentsCount: 18,
    commentsList: [
      { author: "mari_caicara", text: "Melhor quiosque do Martim! To descendo agora!", time: "Há 25 min" },
      { author: "gabo_dev", text: "Esse molho tártaro com limão cravo é diferenciado demais 🔥", time: "Há 10 min" }
    ],
    isPromotion: true,
    promoBadge: "Promoção Ativa: 15% OFF",
    regionalLLMSummary: "🤖 LLM Regional Martim de Sá: Alta procura por frutos do mar no Quiosque Canto Bravo com 98% de aprovação e tempo médio de 18 min.",
    createdAt: "Há 35 min"
  },
  {
    id: "post-2",
    restaurantId: "rest-centro-cantina-caicara",
    restaurantName: "Cantina Caiçara Tradição",
    neighborhood: "Centro",
    authorAvatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
    postImage: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
    caption: "Tradição viva no coração de Caraguá. O Azul-Marinho é feito com banana da terra colhida na mata atlântica e peixe fresco do dia. Venha provar nossa história!",
    dishName: "Azul-Marinho Tradicional",
    dishPrice: 75.0,
    likes: 219,
    commentsCount: 27,
    commentsList: [
      { author: "prof_carlos", text: "Patrimônio gastronômico do nosso Litoral Norte!", time: "Há 1h" },
      { author: "chef_caique", text: "Receita que respeita as raízes caiçaras.", time: "Há 40 min" }
    ],
    isPromotion: false,
    regionalLLMSummary: "🤖 LLM Regional Centro: Pico de busca por culinária tradicional caiçara. O Azul-Marinho lidera com 100% de satisfação no índice temporal.",
    createdAt: "Há 2 horas"
  },
  {
    id: "post-3",
    restaurantId: "rest-indaia-mar-terra",
    restaurantName: "Mar & Terra Gourmet",
    neighborhood: "Indaiá",
    authorAvatar: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    postImage: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=80",
    caption: "Festival de Camarão Rosa começou! Nosso risoto é finalizado com limão siciliano e cachaça artesanal da serra. Hoje tem promoção especial!",
    dishName: "Risoto de Camarão Rosa",
    dishPrice: 89.0,
    likes: 308,
    commentsCount: 42,
    commentsList: [
      { author: "anapaula_sjc", text: "Estou indo jantar aí com a família hoje à noite!", time: "Há 3h" }
    ],
    isPromotion: true,
    promoBadge: "Promoção Ativa: Camarão em Dobro",
    regionalLLMSummary: "🤖 LLM Regional Indaiá: Alta demanda para jantar romântico e frutos do mar com notas recentes de 4.8★.",
    createdAt: "Há 4 horas"
  }
];

export const SCRAPER_RADAR_ALERTS = [
  {
    id: "alert-1",
    time: "Hoje às 04:30",
    source: "Varredura Noturna XHR",
    type: "Prato Novo",
    title: "Moqueca Vegana adicionada no Centro",
    detail: "Novo item sem glúten e sem lactose catalogado com sucesso."
  },
  {
    id: "alert-2",
    time: "Hoje às 04:35",
    source: "Auditoria Mackenzie 2024",
    type: "Fraude Bloqueada",
    title: "3 avaliações suspeitas expurgadas",
    detail: "Detecção de burst de reviews com texto repetido e alta entropia no Martim de Sá."
  },
  {
    id: "alert-3",
    time: "Hoje às 04:40",
    source: "Algoritmo de Decaimento Temporal",
    type: "Recálculo de Notas",
    title: "Super Nota recalculada (Meia-vida 30d)",
    detail: "Quiosque Canto Bravo subiu para 4.88★ (+0.23) devido ao fluxo de notas positivas recentes."
  }
];
