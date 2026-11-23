import type { DietaryFilter, UserLocation } from "@/types";

// ==============================================================================
// CONSTANTES GLOBAIS — MOBILE APP
// ==============================================================================

export const DEFAULT_LOCATION: UserLocation = {
  latitude: -23.6226,
  longitude: -45.4124,
  neighborhood: "Centro",
};

export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
};

export const SPRING_BOUNCY = {
  damping: 10,
  stiffness: 180,
};

export const FEED_FILTERS: { key: DietaryFilter; label: string; emoji: string }[] = [
  { key: "all", label: "Todos", emoji: "🍽️" },
  { key: "frutos_do_mar", label: "Frutos do Mar", emoji: "🦐" },
  { key: "caicara", label: "Caiçara", emoji: "🐟" },
  { key: "vegano", label: "Vegano", emoji: "🌱" },
  { key: "sem_gluten", label: "Sem Glúten", emoji: "🌾" },
  { key: "promocoes", label: "Promoções", emoji: "🔥" },
];

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://carafood.vercel.app/api";
