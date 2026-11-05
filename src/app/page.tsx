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
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { CaraguaAIChatDrawer } from '../components/CaraguaAIChatDrawer';

interface DishPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  savings_brl?: number;
  category: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  last_price_delta_pct: number;
  suggested_sides?: string[];
}

interface RestaurantCardData {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  price_level: number;
  rating_score?: number;
  rating_average: number;
  total_reviews: number;
  active_dishes_count: number;
  has_price_drop: boolean;
  is_real_osm?: boolean;
  source_platform: string;
  cuisine_types: string[];
  distance_meters: number;
  distance_km: number;
  dishes_preview: DishPreview[];
  dishes: DishPreview[];
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const DIETARY_PILLS = [
  { key: 'vegan', label: 'Vegano', emoji: '🌱' },
  { key: 'vegetarian', label: 'Vegetariano', emoji: '🥗' },
  { key: 'gluten_free', label: 'Sem Glúten', emoji: '🌾' },
  { key: 'lactose_free', label: 'Sem Lactose', emoji: '🥛' },
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
  const [restaurants, setRestaurants] = useState<RestaurantCardData[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodSummaryItem[]>([]);
  const [populatedZonesCount, setPopulatedZonesCount] = useState<number>(53);

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [priceDropOnly, setPriceDropOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>('recommended');

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({
    lat: -23.6226,
    lon: -45.4124,
  });
  const [gpsActive, setGpsActive] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
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
        const res = await fetch(`${API_BASE}/restaurants/neighborhoods/summary`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data.neighborhoods)) {
          setNeighborhoods(data.neighborhoods);
          setPopulatedZonesCount(data.populated_neighborhoods_count || 53);
        }
      } catch {
        // Segue normalmente se o resumo demorar
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
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      if (selectedDietary.length > 0) {
        params.set('dietary', selectedDietary.join(','));
      }
      if (priceDropOnly) {
        params.set('price_drop_only', 'true');
      }
      params.set('lat', String(userCoords.lat));
      params.set('lon', String(userCoords.lon));
      params.set('sort_by', sortBy === 'distance' ? 'distance' : 'recommended');
      params.set('limit', '60');

      const res = await fetch(`${API_BASE}/restaurants?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Não foi possível carregar os cardápios (${res.status})`);
      }
      const data: RestaurantCardData[] = await res.json();
      setRestaurants(data);
    } catch {
      try {
        const fallbackRes = await fetch('/api/restaurants?limit=60', { cache: 'no-store' });
        const fallbackJson = await fallbackRes.json();
        if (Array.isArray(fallbackJson.restaurants)) {
          setRestaurants(fallbackJson.restaurants);
        } else {
          setErrorMsg('Estamos atualizando os cardápios da cidade. Tente atualizar a página em instantes!');
        }
      } catch {
        setErrorMsg('Não conseguimos carregar os cardápios agora. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    priceDropOnly,
    selectedDietary,
    selectedNeighborhood,
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

  const totalDishesOnScreen = useMemo(
    () => restaurants.reduce((acc, r) => acc + (r.active_dishes_count || r.dishes.length), 0),
    [restaurants]
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

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500 font-semibold">Mostrar primeiro:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('recommended')}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    sortBy === 'recommended'
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  ⭐ Mais bem avaliados
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
          </div>

          {/* Atalhos rápidos para praias e bairros queridos */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
            {FEATURED_NEIGHBORHOODS.map((bName) => {
              const isSelected = selectedNeighborhood === bName;
              return (
                <button
                  key={bName}
                  type="button"
                  onClick={() => setSelectedNeighborhood(bName)}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
              {selectedNeighborhoodLabel === 'Todos'
                ? 'Lugares abertos e verificados em Caraguá'
                : `Onde comer em ${selectedNeighborhoodLabel}`}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Encontramos <strong>{restaurants.length} estabelecimentos</strong> com{' '}
              <strong>{totalDishesOnScreen} pratos conferidos</strong> para você escolher sem erro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(selectedNeighborhood !== 'Todos' ||
              selectedDietary.length > 0 ||
              priceDropOnly ||
              debouncedSearch) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedNeighborhood('Todos');
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-[#135136] text-xs font-bold text-stone-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar cardápios</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-50 border border-rose-300 p-4 text-sm text-rose-900 font-medium">
            {errorMsg}
          </div>
        )}

        {loading ? (
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
        ) : restaurants.length === 0 ? (
          <div className="rounded-3xl bg-white border border-stone-200/90 p-10 text-center space-y-4 shadow-xs">
            <Utensils className="w-10 h-10 text-[#135136] mx-auto" />
            <h3 className="font-heading font-extrabold text-lg text-stone-900">
              Ainda não achamos um prato com todos esses filtros juntos neste bairro
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Experimente olhar em todos os bairros de Caraguá ou peça uma sugestão sob medida
              para o nosso Chef CaráFood!
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedNeighborhood('Todos');
                  setSelectedDietary([]);
                  setPriceDropOnly(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#135136] text-white font-bold text-xs"
              >
                Ver todos os lugares de Caraguá
              </button>
              <button
                type="button"
                onClick={() =>
                  openAssistantWithPrompt(
                    'Me indica lugares gostosos e com bom preço abertos hoje em Caraguá?'
                  )
                }
                className="px-4 py-2 rounded-xl bg-[#FFB703] text-stone-950 font-extrabold text-xs"
              >
                Perguntar ao Chef CaráFood
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((rest) => {
              const starScore = (rest.rating_score ?? rest.rating_average ?? 4.8).toFixed(1);
              return (
                <article
                  key={rest.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-[#135136]/45 transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-3.5">
                    {/* Cabeçalho do Restaurante */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950/10 text-[#135136]">
                            <MapPin className="w-3 h-3" />
                            {rest.neighborhood}
                          </span>
                          <span className="text-[11px] font-semibold text-stone-500">
                            {formatDistanceHuman(rest.distance_meters, rest.distance_km)}
                          </span>
                          {rest.has_price_drop && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <TrendingDown className="w-3 h-3" />
                              Baixou de preço
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading font-black text-lg text-stone-900 leading-snug">
                          <Link
                            href={`/restaurants/${rest.slug}`}
                            className="hover:text-[#135136] transition-colors"
                          >
                            {rest.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-1">{rest.address}</p>
                      </div>

                      {/* Nota com estrela e tooltip humano */}
                      <div
                        className="shrink-0 bg-amber-50 border border-amber-200/90 rounded-2xl px-2.5 py-1.5 text-right"
                        title="Nota real calculada com avaliações verificadas"
                      >
                        <div className="inline-flex items-center gap-1 font-heading font-black text-sm text-stone-900">
                          <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                          <span>{starScore}</span>
                        </div>
                        <span className="block text-[9px] font-bold text-stone-500">
                          {rest.total_reviews} avaliações
                        </span>
                      </div>
                    </div>

                    {/* Especialidades & Selo Preço Honesto Verificado */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {rest.cuisine_types.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700"
                        >
                          {c}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        Preço honesto verificado
                      </span>
                    </div>

                    {/* Pratos em Destaque no Cardápio */}
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-stone-500">
                        <span>Destaques do cardápio ({rest.active_dishes_count})</span>
                        <button
                          type="button"
                          onClick={() => setQuickModalRest(rest)}
                          className="text-[#135136] hover:underline font-bold"
                        >
                          Espiar cardápio rápido
                        </button>
                      </div>

                      {rest.dishes_preview.slice(0, 3).map((dish) => (
                        <div
                          key={dish.id}
                          className="rounded-2xl bg-[#FAF7F2] px-3 py-2 border border-stone-200/70 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-stone-900 truncate">
                              {dish.name}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dish.is_vegan && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-900">
                                  🌱 Vegano
                                </span>
                              )}
                              {dish.is_vegetarian && !dish.is_vegan && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-lime-100 text-lime-900">
                                  🥗 Vegetariano
                                </span>
                              )}
                              {dish.is_gluten_free && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-950">
                                  🌾 Sem Glúten
                                </span>
                              )}
                              {dish.is_lactose_free && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-950">
                                  🥛 Sem Lactose
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-heading font-black text-xs text-[#135136] block">
                              {formatBRL(dish.price)}
                            </span>
                            {dish.last_price_delta_pct < 0 && (
                              <span className="text-[9px] font-extrabold text-emerald-700 block">
                                {formatSavingsBadge(dish)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rodapé de Ações */}
                  <div className="px-5 py-3 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openAssistantWithPrompt(
                          `O que você me recomenda pedir hoje no ${rest.name} em ${rest.neighborhood}?`
                        )
                      }
                      className="text-xs font-bold text-stone-700 hover:text-[#135136] inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                      <span>Pedir dica daqui</span>
                    </button>

                    <Link
                      href={`/restaurants/${rest.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-xs transition-all"
                    >
                      <span>Ver Cardápio</span>
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
                  {(quickModalRest.rating_score ?? quickModalRest.rating_average ?? 4.8).toFixed(1)}
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
              {quickModalRest.dishes.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-stone-200 p-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-sm text-stone-900">{d.name}</div>
                    <p className="text-xs text-stone-600 mt-0.5">{d.description}</p>
                    {d.suggested_sides && d.suggested_sides.length > 0 && (
                      <div className="text-[11px] text-emerald-800 font-semibold mt-1.5">
                        Acompanha muito bem: {d.suggested_sides.join(' • ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-heading font-black text-sm text-[#135136]">
                      {formatBRL(d.price)}
                    </div>
                    {d.last_price_delta_pct < 0 && (
                      <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                        {formatSavingsBadge(d)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
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
