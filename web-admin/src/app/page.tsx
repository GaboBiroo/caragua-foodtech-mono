'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Utensils,
  Navigation,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  ChefHat,
  X,
  Heart,
  Bookmark,
  Award,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { CaraguaAIChatDrawer } from '../components/CaraguaAIChatDrawer';
import { realDataStore, dishMatchesFoodType } from '../data/realDataStore';

interface DishPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  savings_brl?: number;
  category: string;
  food_types?: string[];
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  last_price_delta_pct: number;
  suggested_sides?: string[];
  image_url?: string;
}

interface RestaurantCardData {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  phone?: string | null;
  website?: string | null;
  menu_url?: string | null;
  latitude: number;
  longitude: number;
  price_level: number;
  rating_score?: number;
  bayesian_rating?: number;
  ranking_score?: number;
  rating_average: number;
  total_reviews: number;
  active_dishes_count: number;
  dish_photos_count?: number;
  has_price_drop: boolean;
  is_real_osm?: boolean;
  source_platform: string;
  cuisine_types: string[];
  food_types?: string[];
  distance_meters: number;
  distance_km: number;
  dishes_preview: DishPreview[];
  dishes: DishPreview[];
  banner_url?: string;
  image_url?: string;
  gallery_photos?: string[];
}

interface NeighborhoodSummaryItem {
  slug: string;
  name: string;
  region: string;
  macro: string;
  latitude: number;
  longitude: number;
  restaurants_count: number;
  active_dishes_count: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (!BACKEND_URL || BACKEND_URL.includes('localhost') || BACKEND_URL.includes('127.0.0.1')) {
      return '/api';
    }
  }
  return BACKEND_URL || '/api';
};

const DIETARY_PILLS = [
  { key: 'vegan', label: 'Vegano', emoji: '🌱' },
  { key: 'vegetarian', label: 'Vegetariano', emoji: '🥗' },
  { key: 'gluten_free', label: 'Sem Glúten', emoji: '🌾' },
  { key: 'lactose_free', label: 'Sem Lactose', emoji: '🥛' },
] as const;

const FOOD_TYPE_TABS = [
  { key: 'todos', label: 'Todos os Tipos', emoji: '🍽️' },
  { key: 'lanches', label: 'Lanches & Burgers', emoji: '🍔' },
  { key: 'pizza', label: 'Pizzas & Esfihas', emoji: '🍕' },
  { key: 'sushi', label: 'Sushi & Japa', emoji: '🍣' },
  { key: 'combo_familia', label: 'Combo Família', emoji: '👨‍👩‍👧‍👦' },
  { key: 'marmitas', label: 'Marmitas & Executivos', emoji: '🍱' },
  { key: 'porcoes', label: 'Porções & Pastéis', emoji: '🍟' },
  { key: 'frutos_do_mar', label: 'Frutos do Mar', emoji: '🍤' },
  { key: 'doces_acai', label: 'Açaí & Sobremesas', emoji: '🍨' },
] as const;

const FEATURED_NEIGHBORHOODS = [
  'Todos',
  'Centro',
  'Martim de Sá',
  'Prainha',
  'Indaiá',
  'Cocanha',
  'Massaguaçu',
  'Jardim Aruan',
  'Praia das Palmeiras',
  'Porto Novo',
];

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDistanceHuman(meters: number, km: number): string {
  if (meters < 1000) {
    return `A ${Math.max(50, Math.round(meters / 10) * 10)}m`;
  }
  return `A ${km.toFixed(1).replace('.', ',')} km`;
}

function formatSavingsBadge(dish: DishPreview): string {
  if (dish.savings_brl && dish.savings_brl >= 1) {
    return `📉 Baixou R$ ${dish.savings_brl.toFixed(2).replace('.', ',')} recentemente`;
  }
  return '🔥 Preço menor que na semana passada';
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>(() => {
    return realDataStore.getRestaurants({ limit: 120 }) as unknown as RestaurantCardData[];
  });
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodSummaryItem[]>([]);
  const [populatedZonesCount, setPopulatedZonesCount] = useState<number>(53);

  const [viewMode, setViewMode] = useState<'feed' | 'places'>('feed');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [selectedMacroRegion, setSelectedMacroRegion] = useState<'Todas' | 'Norte' | 'Centro' | 'Sul'>('Todas');
  const [neighborhoodDrawerOpen, setNeighborhoodDrawerOpen] = useState<boolean>(false);
  const [drawerSearch, setDrawerSearch] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedFoodType, setSelectedFoodType] = useState<string>('todos');
  const [priceDropOnly, setPriceDropOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'distance'>('recommended');

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({
    lat: -23.6226,
    lon: -45.4124,
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [quickModalRest, setQuickModalRest] = useState<RestaurantCardData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 260);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/restaurants/neighborhoods/summary`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.neighborhoods) && data.neighborhoods.length > 0) {
            setNeighborhoods(data.neighborhoods);
            setPopulatedZonesCount(data.populated_neighborhoods_count || 53);
            return;
          }
        }
      } catch {
        // Segue para fallback com dados reais
      }
      if (mounted) {
        const local = realDataStore.getNeighborhoodsSummary();
        setNeighborhoods(local.neighborhoods);
        setPopulatedZonesCount(local.populated_neighborhoods_count);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (selectedNeighborhood && selectedNeighborhood !== 'Todos') {
        params.set('neighborhood', selectedNeighborhood);
      }
      if (selectedMacroRegion && selectedMacroRegion !== 'Todas') {
        params.set('macroRegion', selectedMacroRegion);
      }
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (selectedDietary.length > 0) {
        params.set('dietary', selectedDietary.join(','));
      }
      if (selectedFoodType && selectedFoodType !== 'todos') {
        params.set('food_type', selectedFoodType);
      }
      if (priceDropOnly) {
        params.set('price_drop_only', 'true');
      }
      params.set('lat', String(userCoords.lat));
      params.set('lon', String(userCoords.lon));
      params.set('sort_by', sortBy);
      params.set('limit', '120');

      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/restaurants?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const data: RestaurantCardData[] = Array.isArray(json) ? json : json.restaurants || [];
        setRestaurants(data);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    // Fallback garantido usando o banco de dados real com 0ms de latência
    try {
      const localData = realDataStore.getRestaurants({
        neighborhood: selectedNeighborhood,
        macroRegion: selectedMacroRegion,
        search: debouncedSearch,
        dietary: selectedDietary,
        foodType: selectedFoodType,
        priceDropOnly,
        lat: userCoords.lat,
        lon: userCoords.lon,
        sortBy,
        limit: 120,
      });
      setRestaurants(localData);
    } catch {
      setErrorMsg('Não conseguimos carregar os cardápios agora. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    priceDropOnly,
    selectedDietary,
    selectedFoodType,
    selectedNeighborhood,
    selectedMacroRegion,
    sortBy,
    userCoords.lat,
    userCoords.lon,
  ]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const toggleDietary = (key: string) => {
    setSelectedDietary((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleRequestGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setGpsActive(true);
        setSortBy('distance');
      },
      () => {
        setGpsActive(true);
        setSortBy('distance');
      },
      { timeout: 6000 }
    );
  };

  const openAssistantWithPrompt = (promptText?: string) => {
    setAiInitialPrompt(promptText);
    setAiDrawerOpen(true);
  };

  const selectedNeighborhoodLabel = useMemo(() => {
    if (selectedNeighborhood === 'Todos') return 'Todos';
    const found = neighborhoods.find(
      (n) => n.slug === selectedNeighborhood || n.name === selectedNeighborhood
    );
    return found ? found.name : selectedNeighborhood;
  }, [neighborhoods, selectedNeighborhood]);

  const neighborhoodRegionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const n of neighborhoods) {
      map[n.name.toLowerCase()] = n.region;
    }
    return map;
  }, [neighborhoods]);

  const displayedRestaurants = useMemo(() => {
    if (selectedMacroRegion === 'Todas') return restaurants;
    return restaurants.filter((r) => {
      const reg = neighborhoodRegionMap[(r.neighborhood || '').toLowerCase()] || 'Centro';
      return reg.toLowerCase() === selectedMacroRegion.toLowerCase();
    });
  }, [restaurants, selectedMacroRegion, neighborhoodRegionMap]);

  const hasActiveFilter =
    selectedNeighborhood !== 'Todos' ||
    selectedMacroRegion !== 'Todas' ||
    selectedFoodType !== 'todos' ||
    searchQuery.trim().length > 0 ||
    selectedDietary.length > 0 ||
    priceDropOnly;

  const effectiveRestaurants = useMemo(() => {
    if (displayedRestaurants.length > 0 || hasActiveFilter) return displayedRestaurants;
    return (realDataStore.getRestaurants({ limit: 120 }) as unknown as RestaurantCardData[]) || [];
  }, [displayedRestaurants, hasActiveFilter]);

  // Feed Estilo Instagram com Diversificação Anti-Agrupamento (Sliding-Window MMR + Round-Robin entre restaurantes)
  // Evita exibir vários pratos seguidos do mesmo restaurante e alterna categorias no topo do feed.
  const feedDishCards = useMemo(() => {
    const normalizeQ = (s: string) =>
      (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const queryNorm = normalizeQ(debouncedSearch);

    const queues: Array<{
      rest: RestaurantCardData;
      items: DishPreview[];
      cursor: number;
      lastPickedAt: number;
    }> = [];

    for (const rest of effectiveRestaurants) {
      const candidates = (rest.dishes_preview || rest.dishes || []).filter((dish) => {
        if (!dish.image_url || !dish.image_url.startsWith('http')) return false;
        if (selectedFoodType !== 'todos' && !dishMatchesFoodType(dish, selectedFoodType)) return false;
        if (selectedDietary.includes('vegan') && !dish.is_vegan) return false;
        if (selectedDietary.includes('vegetarian') && !(dish.is_vegetarian || dish.is_vegan)) return false;
        if (selectedDietary.includes('gluten_free') && !dish.is_gluten_free) return false;
        if (selectedDietary.includes('lactose_free') && !dish.is_lactose_free) return false;
        if (priceDropOnly && !((dish.savings_brl || 0) > 0 || (dish.last_price_delta_pct || 0) < 0)) return false;
        return true;
      });

      if (candidates.length === 0) continue;

      const sortedStoreItems = [...candidates].sort((a, b) => {
        if (queryNorm) {
          const hitA = normalizeQ(`${a.name} ${a.category}`).includes(queryNorm) ? 1 : 0;
          const hitB = normalizeQ(`${b.name} ${b.category}`).includes(queryNorm) ? 1 : 0;
          if (hitB !== hitA) return hitB - hitA;
        }
        const drinkA = (a.food_types || []).includes('bebidas') ? 1 : 0;
        const drinkB = (b.food_types || []).includes('bebidas') ? 1 : 0;
        if (drinkA !== drinkB) return drinkA - drinkB;
        const dropA = (a.last_price_delta_pct || 0) < 0 ? 1 : 0;
        const dropB = (b.last_price_delta_pct || 0) < 0 ? 1 : 0;
        if (dropB !== dropA) return dropB - dropA;
        return (b.price || 0) - (a.price || 0);
      });

      const maxPerStore = queryNorm || effectiveRestaurants.length <= 2 ? 12 : 5;
      queues.push({
        rest,
        items: sortedStoreItems.slice(0, maxPerStore),
        cursor: 0,
        lastPickedAt: -999,
      });
    }

    const result: Array<{ dish: DishPreview; restaurant: RestaurantCardData }> = [];
    const recentCategories: string[] = [];

    while (true) {
      const remaining = queues.filter((q) => q.cursor < q.items.length);
      if (remaining.length === 0) break;

      const step = result.length;
      const minGap = remaining.length >= 2 ? Math.min(6, remaining.length - 1) : 0;

      // Filtrar restaurantes que respeitam o espaçamento mínimo sem repetir seguido
      let eligible = remaining.filter((q) => step - q.lastPickedAt >= minGap);
      if (eligible.length === 0) {
        eligible = remaining.filter((q) => step - q.lastPickedAt >= 1);
      }
      if (eligible.length === 0) {
        eligible = remaining;
      }

      // Sliding Window MMR (janela de 3 slots) para variar estilos quando em "Todos"
      let chosen = eligible[0];
      if (selectedFoodType === 'todos' && eligible.length > 1) {
        // Prioriza a primeira rodada (Wave 0) entre restaurantes diferentes mantendo diversidade de categoria
        const scored = eligible.map((q, idx) => {
          const nextDish = q.items[q.cursor];
          const primaryType = (nextDish.food_types && nextDish.food_types[0]) || nextDish.category || 'outros';
          const inWindowPenalty = recentCategories.includes(primaryType) ? 18 : 0;
          const waveBonus = q.cursor === 0 ? 12 : -q.cursor * 4;
          const rankBonus = Math.max(0, 12 - idx * 0.6);
          return { q, score: waveBonus + rankBonus - inWindowPenalty };
        });
        scored.sort((a, b) => b.score - a.score);
        chosen = scored[0].q;
      } else {
        // Quando o usuário escolheu um tipo específico (ex: Pizza), respeita rigorosamente a ordem do ranking por ondas
        eligible.sort((a, b) => a.cursor - b.cursor);
        chosen = eligible[0];
      }

      const dish = chosen.items[chosen.cursor];
      chosen.cursor += 1;
      chosen.lastPickedAt = step;
      result.push({ dish, restaurant: chosen.rest });

      const catKey = (dish.food_types && dish.food_types[0]) || dish.category || 'outros';
      recentCategories.push(catKey);
      if (recentCategories.length > 3) {
        recentCategories.shift();
      }
    }

    return result;
  }, [effectiveRestaurants, selectedFoodType, selectedDietary, priceDropOnly, debouncedSearch]);

  const totalDishesOnScreen = useMemo(
    () => effectiveRestaurants.reduce((acc, r) => acc + (r.active_dishes_count || (r.dishes || []).length || (r.dishes_preview || []).length), 0),
    [effectiveRestaurants]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex flex-col">
      <Navbar onOpenAIChat={() => openAssistantWithPrompt(undefined)} />

      {/* Banner Principal Acolhedor e Apetitoso */}
      <header className="relative bg-gradient-to-br from-[#135136] via-[#165E3F] to-[#0D3B27] text-white border-b-4 border-[#FFB703] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-11 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-extrabold text-[#FFB703]">
                <span>🍽️ Bateu a fome em Caraguá?</span>
                <span className="text-white/50">•</span>
                <span className="text-emerald-100">{populatedZonesCount} bairros com cardápios abertos</span>
              </div>

              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.08]">
                O que vamos comer hoje em{' '}
                <span className="text-[#FFB703]">Caraguá?</span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/95 leading-relaxed max-w-2xl">
                Compare cardápios, descubra lugares novos no seu bairro e veja onde o preço
                baixou de verdade. Escolha seu bairro ou filtre pelo que você pode comer tranquilo!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openAssistantWithPrompt(undefined)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FFB703] hover:bg-amber-400 text-stone-950 font-heading font-black text-sm shadow-lg transition-all hover:scale-[1.02]"
              >
                <ChefHat className="w-5 h-5" />
                <span>Pedir Dica ao Chef CaráFood</span>
              </button>

              <Link
                href="/moderation"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
                <span>Painel da Equipe</span>
              </Link>
            </div>
          </div>

          {/* Barra de Busca e Seleção dos 53 Bairros */}
          <div className="mt-6 bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-stone-200/90 text-stone-900 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
              {/* Campo de busca simples e direto */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busque por prato, quiosque, pizzaria, padaria ou bairro..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-sm font-medium text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    aria-label="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Seletor completo dos 53 Bairros de Caraguá */}
              <div className="md:col-span-4 relative">
                <MapPin className="w-4 h-4 text-[#135136] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  aria-label="Escolher bairro de Caraguatatuba"
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white"
                >
                  <option value="Todos">Todos os 53 Bairros de Caraguá</option>
                  {neighborhoods.map((n) => (
                    <option key={n.slug} value={n.name}>
                      {n.name} ({n.restaurants_count} {n.restaurants_count === 1 ? 'local' : 'locais'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão de proximidade */}
              <div className="md:col-span-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={handleRequestGPS}
                  className={`w-full py-2.5 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                    gpsActive || sortBy === 'distance'
                      ? 'bg-[#135136] text-white border-[#135136]'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
                  }`}
                  title="Ordenar pelos lugares mais pertinho de você"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Perto de mim</span>
                </button>
              </div>
            </div>

            {/* Filtros para comer tranquilo + quedas de preço */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-stone-600 mr-1 inline-flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#135136]" />
                  Pode comer sem medo:
                </span>

                {DIETARY_PILLS.map((pill) => {
                  const active = selectedDietary.includes(pill.key);
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => toggleDietary(pill.key)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        active
                          ? 'bg-[#135136] text-white border-[#135136] shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                      }`}
                    >
                      {pill.emoji} {pill.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPriceDropOnly((prev) => !prev)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 transition-all ${
                    priceDropOnly
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <span>📉 Baixou de Preço</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-stone-500 font-semibold">Ordem:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('recommended')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    sortBy === 'recommended'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                  title="Posicionamento inteligente: Nota Bayesiana W_R + fotos reais + volume + proximidade"
                >
                  🎯 Mais recomendados
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    sortBy === 'rating'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                  title="Ordenar estritamente pela Nota Bayesiana oficial (W_R)"
                >
                  ⭐ Maior nota (W_R)
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    sortBy === 'distance'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  📍 Mais próximos
                </button>
              </div>
            </div>

            {/* Exibir por Tipo de Comida (Sushi, Pizza, Lanche, Combo Família, etc.) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-100 pb-0.5">
              <span className="text-[11px] font-extrabold text-stone-500 shrink-0 mr-1">
                Tipo:
              </span>
              {FOOD_TYPE_TABS.map((tab) => {
                const active = selectedFoodType === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedFoodType(tab.key)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all inline-flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#FFB703] text-stone-950 border-[#FFB703] shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro de Macro-Regiões + Atalhos Rápidos + Gaveta dos 53 Bairros */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['Todas', 'Norte', 'Centro', 'Sul'] as const).map((macro) => {
                const active = selectedMacroRegion === macro;
                const labelMap = {
                  Todas: '🗺️ Todas as Regiões',
                  Norte: '🏖️ Norte (Cocanha & Massaguaçu)',
                  Centro: '🏛️ Centro & Martim de Sá',
                  Sul: '⛵ Sul (Palmeiras & Porto Novo)',
                };
                return (
                  <button
                    key={macro}
                    type="button"
                    onClick={() => {
                      setSelectedMacroRegion(macro);
                      if (macro !== 'Todas') setSelectedNeighborhood('Todos');
                    }}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-white text-[#135136] shadow-xs'
                        : 'bg-emerald-950/50 hover:bg-emerald-950/75 text-emerald-100 border border-white/20'
                    }`}
                  >
                    {labelMap[macro]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setNeighborhoodDrawerOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFB703]/20 hover:bg-[#FFB703]/30 border border-[#FFB703]/60 text-xs font-extrabold text-[#FFB703] transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Explorar os 53 Bairros ({populatedZonesCount} ativos)</span>
            </button>
          </div>

          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
            {FEATURED_NEIGHBORHOODS.map((bName) => {
              const isSelected = selectedNeighborhood === bName;
              return (
                <button
                  key={bName}
                  type="button"
                  onClick={() => {
                    setSelectedNeighborhood(bName);
                    if (bName !== 'Todos') setSelectedMacroRegion('Todas');
                  }}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#FFB703] text-stone-950 shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-50 border border-white/15'
                  }`}
                >
                  {bName === 'Todos' ? '🌊 Toda Caraguá' : bName}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Vitrine Principal de Restaurantes, Quiosques, Pizzarias e Padarias */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-7 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
              {selectedNeighborhoodLabel !== 'Todos'
                ? `Onde comer em ${selectedNeighborhoodLabel}`
                : selectedMacroRegion !== 'Todas'
                ? `Lugares verificados na Região ${selectedMacroRegion} de Caraguá`
                : 'Lugares abertos e verificados em Caraguá'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Encontramos <strong>{effectiveRestaurants.length} estabelecimentos</strong> com{' '}
              <strong>{totalDishesOnScreen} pratos conferidos</strong> para você escolher sem erro.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Alternador de Visualização: Feed Estilo Instagram vs Guia de Lugares */}
            <div className="inline-flex p-1 rounded-2xl bg-stone-200/80 border border-stone-300/80">
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === 'feed'
                    ? 'bg-white text-[#135136] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>📸 Fotos & Pratos (Feed)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('places')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === 'places'
                    ? 'bg-white text-[#135136] shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🏪 Lista de Lugares</span>
              </button>
            </div>

            {(selectedNeighborhood !== 'Todos' ||
              selectedMacroRegion !== 'Todas' ||
              selectedFoodType !== 'todos' ||
              selectedDietary.length > 0 ||
              priceDropOnly ||
              debouncedSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedNeighborhood('Todos');
                  setSelectedMacroRegion('Todas');
                  setSelectedFoodType('todos');
                  setSelectedDietary([]);
                  setPriceDropOnly(false);
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors"
              >
                Limpar filtros
              </button>
            )}

            <button
              type="button"
              onClick={() => void fetchCatalog()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-[#135136] text-xs font-bold text-stone-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar cardápios</span>
            </button>
          </div>
        </div>

        {displayedRestaurants.length === 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🏖️</span>
              <span>
                Não encontramos estabelecimentos exclusivos neste bairro com todos os filtros ativos. Experimente ajustar a busca ou ver toda a cidade:
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedNeighborhood('Todos');
                setSelectedMacroRegion('Todas');
                setSelectedFoodType('todos');
                setSelectedDietary([]);
                setPriceDropOnly(false);
                setSearchQuery('');
              }}
              className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] shrink-0"
            >
              Ver toda a cidade
            </button>
          </div>
        )}

        {loading && effectiveRestaurants.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-stone-200 p-5 h-72 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-stone-200 rounded-lg w-3/4" />
                  <div className="h-3.5 bg-stone-100 rounded-lg w-1/2" />
                  <div className="h-16 bg-stone-100 rounded-2xl w-full mt-4" />
                </div>
                <div className="h-9 bg-stone-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : viewMode === 'feed' ? (
          /* Modo 1: Feed Estilo Instagram com Fotos Reais dos Pratos */
          feedDishCards.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center space-y-3">
              <Utensils className="w-8 h-8 mx-auto text-[#135136]" />
              <h3 className="font-heading font-black text-xl text-stone-900">
                Nenhum prato com foto encontrado para este filtro
              </h3>
              <p className="text-sm text-stone-600">
                Alterne para &ldquo;Restaurantes &amp; Cardápios&rdquo; ou clique em Limpar filtros para ver todos os cardápios reais.
              </p>
              <button
                type="button"
                onClick={() => setViewMode('places')}
                className="px-5 py-2.5 rounded-2xl bg-[#135136] text-white font-bold text-xs"
              >
                Ver Restaurantes &amp; Cardápios
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedDishCards.map(({ dish, restaurant }) => {
              const wrScore = Number(restaurant.bayesian_rating ?? restaurant.rating_score ?? restaurant.rating_average ?? 0);
              const starScore = wrScore > 0 ? wrScore.toFixed(2).replace('.', ',') : 'Novo';
              const isLiked = likedPostIds.has(dish.id);
              const isSaved = savedPostIds.has(dish.id);
              return (
                <article
                  key={`${restaurant.id}-${dish.id}`}
                  className="bg-white rounded-[28px] border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#135136]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Cabeçalho do Restaurante */}
                  <div className="p-4 flex items-center justify-between border-b border-stone-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#135136] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs overflow-hidden">
                        {restaurant.image_url ? (
                          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          (restaurant.name && restaurant.name[0]) || 'R'
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/restaurants/${restaurant.slug}`}
                          className="font-heading font-black text-sm text-stone-900 hover:text-[#135136] transition-colors truncate block"
                        >
                          {restaurant.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                          <MapPin className="w-3 h-3 text-[#135136] shrink-0" />
                          <span className="truncate">{restaurant.neighborhood}</span>
                          <span>•</span>
                          <span className="shrink-0">{formatDistanceHuman(restaurant.distance_meters, restaurant.distance_km)}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="shrink-0 bg-amber-50 border border-amber-200/80 rounded-xl px-2 py-1 text-right"
                      title={
                        restaurant.total_reviews > 0
                          ? `Nota Bayesiana W_R: ${starScore} • Google Maps: ${restaurant.rating_average.toFixed(1)} (${restaurant.total_reviews} avaliações)`
                          : 'Estabelecimento ainda sem avaliações públicas no Google Maps'
                      }
                    >
                      <div className="inline-flex items-center gap-1 font-heading font-black text-xs text-stone-900">
                        <Star className="w-3 h-3 fill-[#FFB703] text-[#FFB703]" />
                        <span>{starScore}</span>
                        {restaurant.total_reviews > 0 && (
                          <span className="text-[10px] font-semibold text-stone-500">
                            ({restaurant.total_reviews})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Foto Real do Prato */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    <img
                      src={dish.image_url!}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badges Flutuantes */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
                      {dish.is_vegan && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/90 text-white backdrop-blur-md shadow-xs">
                          🌱 Vegano
                        </span>
                      )}
                      {dish.is_gluten_free && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
                          🌾 Sem Glúten
                        </span>
                      )}
                      {dish.is_lactose_free && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/90 text-white backdrop-blur-md shadow-xs">
                          🥛 Sem Lactose
                        </span>
                      )}
                      {dish.savings_brl && dish.savings_brl > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600/90 text-white backdrop-blur-md shadow-xs">
                          📉 Baixou R$ {dish.savings_brl.toFixed(2).replace('.', ',')}
                        </span>
                      ) : null}
                    </div>

                    {/* Preço Flutuante em Vidro */}
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-stone-950/85 backdrop-blur-md text-white font-heading font-black text-sm shadow-lg border border-white/20">
                      {formatBRL(dish.price)}
                    </div>
                  </div>

                  {/* Informações do Prato */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#135136] block">
                        {dish.category || 'Especialidade da Casa'}
                      </span>
                      <h4 className="font-heading font-bold text-stone-900 text-base leading-snug group-hover:text-[#135136] transition-colors line-clamp-1">
                        <Link href={`/prato/${dish.id}`}>
                          {dish.name}
                        </Link>
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    {/* Ações Diretas: Checar Cardápio + Ver Prato */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickModalRest(restaurant)}
                          className="py-2.5 px-3 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-300/80"
                        >
                          <Utensils className="w-3.5 h-3.5 text-amber-900" />
                          <span>📖 Checar Cardápio</span>
                        </button>

                        <Link
                          href={`/prato/${dish.id}`}
                          className="py-2.5 px-3 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <span>Ver Prato</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleLike(dish.id)}
                            className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                              isLiked ? 'text-rose-600 font-bold' : 'hover:text-stone-800'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                            <span>{isLiked ? 'Recomendado' : 'Recomendar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave(dish.id)}
                            className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                              isSaved ? 'text-[#FFB703] font-bold' : 'hover:text-stone-800'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FFB703] text-[#FFB703]' : ''}`} />
                            <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Conferido Hoje
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          )
        ) : (
          /* Modo 2: Lista dos Estabelecimentos com Banners e Destaques Reais */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {effectiveRestaurants.map((rest) => {
              const wrScore = Number(rest.bayesian_rating ?? rest.rating_score ?? rest.rating_average ?? 0);
              const starScore = wrScore > 0 ? wrScore.toFixed(2).replace('.', ',') : 'Novo';
              const bannerSrc = rest.banner_url || rest.image_url || rest.gallery_photos?.[0] || '';
              return (
                <article
                  key={rest.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#135136]/45 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Banner Fotográfico Real do Restaurante */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#135136] to-[#0D3825]">
                    {bannerSrc ? (
                      <img
                        src={bannerSrc}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-100/70">
                        <Utensils className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                        <MapPin className="w-3 h-3 text-[#FFB703]" />
                        {rest.neighborhood}
                      </span>
                      {rest.has_price_drop && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-rose-600/90 text-white backdrop-blur-md shadow-xs border border-white/20">
                          <TrendingDown className="w-3 h-3" />
                          Baixou de preço
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                      <span className="text-xs font-semibold drop-shadow-md">
                        {formatDistanceHuman(rest.distance_meters, rest.distance_km)}
                      </span>
                      <div className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
                        <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                        <span className="font-heading font-black text-xs text-white">{starScore}</span>
                        <span className="text-[10px] text-stone-300">({rest.total_reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-heading font-black text-lg text-stone-900 leading-snug">
                        <Link
                          href={`/restaurants/${rest.slug}`}
                          className="hover:text-[#135136] transition-colors"
                        >
                          {rest.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">{rest.address}</p>

                      {/* Especialidades */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {rest.cuisine_types.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700"
                          >
                            {c}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Preço verificado
                        </span>
                      </div>
                    </div>

                    {/* Destaques do Cardápio com Miniatura */}
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-500">
                        <span>Pratos mais pedidos ({rest.active_dishes_count})</span>
                        <button
                          type="button"
                          onClick={() => setQuickModalRest(rest)}
                          className="text-[#135136] hover:underline font-bold"
                        >
                          Ver todos os itens →
                        </button>
                      </div>

                      {rest.dishes_preview.slice(0, 2).map((dish) => (
                        <Link
                          key={dish.id}
                          href={`/prato/${dish.id}`}
                          className="rounded-2xl bg-[#FAF7F2] hover:bg-amber-50/70 p-2 border border-stone-200/70 hover:border-[#135136]/40 flex items-center justify-between gap-2.5 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {dish.image_url && (
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                                <img
                                  src={dish.image_url}
                                  alt={dish.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-stone-900 group-hover:text-[#135136] truncate transition-colors">
                                {dish.name}
                              </div>
                              <span className="text-[10px] text-stone-500 block truncate">
                                {dish.category}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-heading font-black text-xs text-[#135136] block">
                              {formatBRL(dish.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Rodapé com Dois Botões Claros */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickModalRest(rest)}
                      className="py-2.5 px-3 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-300/80"
                    >
                      <Utensils className="w-3.5 h-3.5 text-amber-900" />
                      <span>📖 Checar Cardápio</span>
                    </button>

                    <Link
                      href={`/restaurants/${rest.slug}`}
                      className="py-2.5 px-3 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Ver Restaurante</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Janela Rápida para Espiar o Cardápio */}
      {quickModalRest && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Cardápio de ${quickModalRest.name}`}
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
            <div className="bg-[#135136] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#FFB703] uppercase tracking-wider">
                  {quickModalRest.neighborhood} • ⭐{' '}
                  {Number(quickModalRest.rating_score ?? quickModalRest.rating_average ?? 0) > 0
                    ? Number(quickModalRest.rating_score ?? quickModalRest.rating_average).toFixed(1)
                    : 'Novo'}
                </span>
                <h3 className="font-heading font-black text-xl">{quickModalRest.name}</h3>
                <p className="text-xs text-emerald-100">{quickModalRest.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickModalRest(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                aria-label="Fechar prévia do cardápio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {(quickModalRest.dishes && quickModalRest.dishes.length > 0
                ? quickModalRest.dishes
                : quickModalRest.dishes_preview || []
              ).map((d) => (
                <Link
                  key={d.id}
                  href={`/prato/${d.id}`}
                  onClick={() => setQuickModalRest(null)}
                  className="rounded-2xl border border-stone-200 hover:border-[#135136] p-3 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {d.image_url && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                        <img
                          src={d.image_url}
                          alt={d.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-stone-900 group-hover:text-[#135136] transition-colors truncate">
                        {d.name}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{d.description}</p>
                      {d.suggested_sides && d.suggested_sides.length > 0 && (
                        <div className="text-[11px] text-emerald-800 font-semibold mt-1 truncate">
                          Acompanha: {d.suggested_sides.join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-heading font-black text-sm text-[#135136]">
                      {formatBRL(d.price)}
                    </div>
                    {d.last_price_delta_pct < 0 ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                        {formatSavingsBadge(d)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-400 group-hover:text-[#135136] block mt-0.5">
                        Ver prato →
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const restName = quickModalRest.name;
                  setQuickModalRest(null);
                  openAssistantWithPrompt(
                    `Quais são os pratos mais gostosos hoje no ${restName}?`
                  );
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#135136] hover:underline"
              >
                <ChefHat className="w-4 h-4" />
                <span>Perguntar ao Chef sobre este lugar</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {(quickModalRest.menu_url || quickModalRest.website) && (
                  <a
                    href={(quickModalRest.menu_url || quickModalRest.website)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300"
                  >
                    <span>Conferir na Fonte ({quickModalRest.source_platform})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <Link
                  href={`/restaurants/${quickModalRest.slug}`}
                  onClick={() => setQuickModalRest(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135136] text-white font-bold text-xs"
                >
                  <span>Abrir Cardápio Completo e Avaliações</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gaveta Exploradora dos 53 Bairros Oficiais de Caraguatatuba (Progressive Disclosure) */}
      {neighborhoodDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Explorador dos 53 Bairros de Caraguatatuba"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-stone-200 flex flex-col">
            <div className="bg-[#135136] text-white px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-extrabold text-[#FFB703] uppercase tracking-wider">
                  Mapa Oficial • 53 Bairros de Caraguatatuba
                </span>
                <h3 className="font-heading font-black text-xl">
                  Escolha seu bairro na Região Norte, Central ou Sul
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNeighborhoodDrawerOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                aria-label="Fechar explorador de bairros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Filtrar entre os 53 bairros (ex.: Cocanha, Martim de Sá, Tinga, Perequê)..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedNeighborhood('Todos');
                  setSelectedMacroRegion('Todas');
                  setNeighborhoodDrawerOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FFB703] text-stone-950 text-xs font-extrabold"
              >
                Ver Todos os 53 Bairros
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {(['Norte', 'Centro', 'Sul'] as const).map((regionName) => {
                const regionItems = neighborhoods.filter(
                  (n) =>
                    n.region.toLowerCase() === regionName.toLowerCase() &&
                    (!drawerSearch.trim() ||
                      n.name.toLowerCase().includes(drawerSearch.trim().toLowerCase()))
                );
                if (regionItems.length === 0) return null;
                return (
                  <div key={regionName} className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <h4 className="font-heading font-black text-sm text-[#135136] uppercase tracking-wider">
                        Região {regionName} ({regionItems.length} bairros)
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMacroRegion(regionName);
                          setSelectedNeighborhood('Todos');
                          setNeighborhoodDrawerOpen(false);
                        }}
                        className="text-xs font-extrabold text-[#135136] hover:underline"
                      >
                        Filtrar toda a Região {regionName} →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {regionItems.map((n) => {
                        const active = selectedNeighborhood === n.name;
                        return (
                          <button
                            key={n.slug}
                            type="button"
                            onClick={() => {
                              setSelectedNeighborhood(n.name);
                              setSelectedMacroRegion('Todas');
                              setNeighborhoodDrawerOpen(false);
                            }}
                            className={`text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                              active
                                ? 'bg-[#135136] text-white border-[#135136] font-extrabold'
                                : 'bg-[#FAF7F2] hover:bg-emerald-50 text-stone-800 border-stone-200 font-bold'
                            }`}
                          >
                            <div className="truncate">{n.name}</div>
                            <div
                              className={`text-[10px] mt-0.5 ${
                                active ? 'text-amber-200' : 'text-stone-500 font-medium'
                              }`}
                            >
                              {n.restaurants_count} {n.restaurants_count === 1 ? 'local' : 'locais'} •{' '}
                              {n.active_dishes_count} pratos
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <CaraguaAIChatDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        activeNeighborhood={selectedNeighborhoodLabel}
        initialPrompt={aiInitialPrompt}
        userLat={userCoords.lat}
        userLon={userCoords.lon}
      />
    </div>
  );
}
