// ==============================================================================
// CARAGUÁ FOODTECH — TIPOS GLOBAIS DO APP MOBILE
// ==============================================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  price_level: number;
  rating_average: number;
  decayed_rating_average: number;
  total_reviews: number;
  cuisine_types: string[];
  distance_meters?: number;
  dishes: Dish[];
}

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  image_url?: string;
}

export interface RankingItem {
  id: string;
  name: string;
  neighborhood: string;
  historical_rating: number;
  decayed_rating: number;
  total_reviews: number;
  price_level: number;
  cuisine_types: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Cards de restaurante embutidos na resposta da IA */
  restaurant_cards?: Restaurant[];
  is_streaming?: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  neighborhood?: string;
}

export type DietaryFilter =
  | "all"
  | "frutos_do_mar"
  | "vegano"
  | "sem_gluten"
  | "promocoes"
  | "caicara";
