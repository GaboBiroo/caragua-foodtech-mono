'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Compass,
  SlidersHorizontal,
  RefreshCw,
  Utensils,
  Navigation,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CaraguaAIChatDrawer } from '@/components/CaraguaAIChatDrawer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface DishPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string | null;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  last_price_delta_pct: number;
  smart_defaults: string[];
}

interface MarketplaceRestaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  h3_res8?: string | null;
  price_level: number;
  bayesian_rating: number;
  rating_average: number;
  decayed_rating_average: number;
  total_reviews: number;
  review_count: number;
  active_dishes_count: number;
  has_price_drop: boolean;
  lgpd_verified: boolean;
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
  quarantined_dishes_count: number;
  checkpoint_active: boolean;
}

const DIETARY_CHIPS: Array<{
  key: string;
  label: string;
  emoji: string;
}> = [
  { key: 'vegan', label: 'Vegano', emoji: '🌱' },
  { key: 'vegetarian', label: 'Vegetariano', emoji: '🥗' },
  { key: 'gluten_free', label: 'Sem Glúten', emoji: '🌾' },
  { key: 'lactose_free', label: 'Zero Lactose', emoji: '🥛' },
];

export default function CaraguaMarketplacePage() {
  const [restaurants, setRestaurants] = useState<MarketplaceRestaurant[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('todos');
  const [activeDietary, setActiveDietary] = useState<string[]>([]);
  const [priceDropOnly, setPriceDropOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'bayesian' | 'distance'>('bayesian');

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>({
    lat: -23.6204,
    lon: -45.4132,
  });

  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [quickModalRest, setQuickModalRest] = useState<MarketplaceRestaurant | null>(
    null
  );

  const loadNeighborhoodSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/restaurants/neighborhoods/summary`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.neighborhoods)) {
        setNeighborhoods(data.neighborhoods);
      }
    } catch {
      // Silencioso: tratado no carregamento principal de restaurantes
    }
  }, []);

  const loadMarketplaceRestaurants = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (selectedNeighborhood && selectedNeighborhood !== 'todos') {
        params.set('neighborhood', selectedNeighborhood);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      if (activeDietary.length > 0) {
        params.set('dietary', activeDietary.join(','));
      }
      if (priceDropOnly) {
        params.set('price_drop_only', 'true');
      }
      params.set('lat', String(userCoords.lat));
      params.set('lon', String(userCoords.lon));
      params.set('sort_by', sortBy);
      params.set('limit', '60');

      const res = await fetch(`${API_BASE}/restaurants?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch {
      setErrorMessage(
        'Não foi possível carregar o catálogo em tempo real na porta 8000. Verifique se o backend FastAPI está ativo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedNeighborhood,
    searchQuery,
    activeDietary,
    priceDropOnly,
    userCoords,
    sortBy,
  ]);

  useEffect(() => {
    void loadNeighborhoodSummary();
  }, [loadNeighborhoodSummary]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      void loadMarketplaceRestaurants();
    }, 180);
    return () => clearTimeout(debounce);
  }, [loadMarketplaceRestaurants]);

  // Centraliza coordenadas caso o usuário selecione um bairro específico dos 53
  const handleSelectNeighborhood = (slugOrTodos: string) => {
    setSelectedNeighborhood(slugOrTodos);
    if (slugOrTodos !== 'todos') {
      const match = neighborhoods.find((n) => n.slug === slugOrTodos);
      if (match) {
        setUserCoords({ lat: match.latitude, lon: match.longitude });
      }
    } else {
      setUserCoords({ lat: -23.6204, lon: -45.4132 });
    }
  };

  const toggleDietaryFilter = (key: string) => {
    setActiveDietary((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : prev.concat(key)
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedNeighborhood('todos');
    setActiveDietary([]);
    setPriceDropOnly(false);
    setSortBy('bayesian');
    setUserCoords({ lat: -23.6204, lon: -45.4132 });
  };

  const openAssistantWithPrompt = (promptText = '') => {
    setAiInitialPrompt(promptText);
    setAiDrawerOpen(true);
  };

  const totalActiveDishesAcrossCity = useMemo(
    () =>
      neighborhoods.reduce((acc, item) => acc + (item.active_dishes_count || 0), 0),
    [neighborhoods]
  );

  const selectedNeighborhoodLabel = useMemo(() => {
    if (selectedNeighborhood === 'todos') return undefined;
    return (
      neighborhoods.find((n) => n.slug === selectedNeighborhood)?.name ||
      selectedNeighborhood
    );
  }, [neighborhoods, selectedNeighborhood]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar onOpenAIChat={() => openAssistantWithPrompt('')} />

      {/* HERO SECTION HIPERLOCAL DE CARAGUATATUBA */}
      <section className="relative bg-gradient-to-br from-[#135136] via-[#175E3F] to-[#0E3D28] text-white border-b-4 border-[#FFB703] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-11 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFB703] text-stone-950 shadow-sm">
                  <Compass className="w-3.5 h-3.5" />
                  53 Bairros Oficiais Mapeados
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-emerald-100 border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703]" />
                  Ranking Bayesiano W_R & Auditoria LGPD SHA-256
                </span>
              </div>

              <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-[42px] leading-[1.1] tracking-tight text-white">
                Gastronomia Real de Caraguatatuba com{' '}
                <span className="text-[#FFB703]">Segurança Alimentar & IA Híbrida</span>
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/95 leading-relaxed max-w-2xl">
                Explore estabelecimentos deduplicados via PostGIS, pratos com preços auditados em série histórica e busca conversacional SVL-RRF sobre vetores de 1536 dimensões.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openAssistantWithPrompt('')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#FFB703] hover:bg-amber-400 text-stone-950 font-heading font-black text-sm shadow-lg transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Abrir Assistente Gastronômico IA</span>
              </button>

              <Link
                href="/moderation"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#FFB703]" />
                <span>Command Center (/moderation)</span>
              </Link>
            </div>
          </div>

          {/* Barra Integrada de Busca Instantânea + Seletor dos 53 Bairros */}
          <div className="mt-7 bg-white rounded-3xl p-2.5 sm:p-3 shadow-2xl border border-white/40 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-6 relative flex items-center">
              <Search className="w-5 h-5 text-[#135136] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prato, ingrediente, peixe fresco, caldeirada ou restaurante"
                aria-label="Buscar restaurantes e pratos em Caraguatatuba"
                className="w-full pl-11 pr-9 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-medium text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-full text-stone-400 hover:text-stone-700"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-4 relative flex items-center">
              <MapPin className="w-4 h-4 text-[#135136] absolute left-3.5 pointer-events-none" />
              <select
                aria-label="Filtrar por um dos 53 bairros de Caraguatatuba"
                value={selectedNeighborhood}
                onChange={(e) => handleSelectNeighborhood(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135136]"
              >
                <option value="todos">
                  Todos os 53 Bairros ({totalActiveDishesAcrossCity || 'Catálogo Completo'} pratos)
                </option>
                {neighborhoods.map((neigh) => (
                  <option key={neigh.slug} value={neigh.slug}>
                    {neigh.name} ({neigh.restaurants_count} rest. • {neigh.active_dishes_count} pratos)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                aria-label="Ordenação de estabelecimentos"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'bayesian' | 'distance')
                }
                className="w-full px-3.5 py-3 rounded-2xl bg-emerald-950/5 border border-stone-200 text-xs font-extrabold text-[#135136] focus:outline-none focus:ring-2 focus:ring-[#135136]"
              >
                <option value="bayesian">⭐ Nota W_R</option>
                <option value="distance">📍 Distância</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE FILTROS DE SEGURANÇA ALIMENTAR (FOOD SAFETY FIRST) */}
      <section className="sticky top-20 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mr-1">
              Food Safety First:
            </span>

            {DIETARY_CHIPS.map((chip) => {
              const active = activeDietary.includes(chip.key);
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => toggleDietaryFilter(chip.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                    active
                      ? 'bg-[#135136] text-white border-[#135136] shadow-sm scale-[1.02]'
                      : 'bg-white text-stone-800 border-stone-300 hover:border-[#135136]'
                  }`}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPriceDropOnly(!priceDropOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                priceDropOnly
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm scale-[1.02]'
                  : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <span>📉</span>
              <span>Queda de Preço Auditada</span>
            </button>

            {(activeDietary.length > 0 ||
              priceDropOnly ||
              selectedNeighborhood !== 'todos' ||
              searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 px-2.5 py-1 underline"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-stone-600">
            Exibindo <strong>{restaurants.length}</strong> estabelecimentos auditados
          </div>
        </div>
      </section>

      {/* VITRINE DE RESTAURANTES E PRATOS REAIS */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-7 flex-1">
        {errorMessage && (
          <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-center space-y-3 mb-6">
            <p className="font-heading font-bold text-base text-rose-950">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => void loadMarketplaceRestaurants()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 text-white font-bold text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-3xl bg-white border border-stone-200 p-6 h-80 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-5 bg-stone-200 rounded-xl w-3/4" />
                  <div className="h-3.5 bg-stone-100 rounded-xl w-1/2" />
                </div>
                <div className="space-y-2">
                  <div className="h-12 bg-stone-100 rounded-2xl" />
                  <div className="h-12 bg-stone-100 rounded-2xl" />
                </div>
                <div className="h-9 bg-stone-200 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <Utensils className="w-10 h-10 text-[#135136] mx-auto" />
            <h2 className="font-heading font-black text-xl text-stone-900">
              Nenhum estabelecimento com pratos compatíveis para esta combinação
            </h2>
            <p className="text-sm text-stone-600">
              Você pode limpar os filtros restritivos ou acionar a raspagem deste bairro direto no Command Center de Moderação.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2.5 rounded-2xl bg-[#135136] text-white font-bold text-xs"
              >
                Restaurar Todos os 53 Bairros
              </button>
              <Link
                href="/moderation"
                className="px-4 py-2.5 rounded-2xl bg-[#FFB703] text-stone-950 font-extrabold text-xs"
              >
                Ir ao Command Center (/moderation)
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <article
                key={rest.id}
                className="squircle-card p-5 sm:p-6 flex flex-col justify-between bg-white"
              >
                <div>
                  {/* Topo do Card: Selos de Auditoria + Nota Bayesiana W_R */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        LGPD & Anti-Fraude
                      </span>
                      {rest.has_price_drop && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                          <TrendingDown className="w-3 h-3" />
                          Queda de Preço Auditada
                        </span>
                      )}
                    </div>

                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-amber-50 border border-amber-200 shrink-0"
                      title={`Nota Bayesiana Ponderada W_R = ${rest.bayesian_rating.toFixed(
                        2
                      )} (${rest.review_count} avaliações auditadas)`}
                    >
                      <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                      <span className="font-heading font-black text-xs text-stone-900">
                        {rest.bayesian_rating.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-500">
                        W_R ({rest.review_count})
                      </span>
                    </div>
                  </div>

                  {/* Nome, Bairro e Distância PostGIS */}
                  <div className="mt-3">
                    <Link
                      href={`/restaurants/${rest.slug}`}
                      className="font-heading font-black text-xl text-stone-900 hover:text-[#135136] transition-colors line-clamp-1"
                    >
                      {rest.name}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1">
                      <span className="inline-flex items-center gap-1 font-bold text-[#135136]">
                        <MapPin className="w-3.5 h-3.5" />
                        {rest.neighborhood}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Navigation className="w-3 h-3 text-stone-500" />
                        {rest.distance_km.toFixed(2)} km
                      </span>
                      <span>•</span>
                      <span className="text-stone-500">
                        {rest.cuisine_types.slice(0, 2).join(' / ')}
                      </span>
                    </div>
                  </div>

                  {/* Preview dos 3 Principais Pratos Aprovados */}
                  <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                      <span>Destaques Auditados ({rest.active_dishes_count})</span>
                      <span>Preço Real</span>
                    </div>

                    {rest.dishes_preview.length === 0 ? (
                      <p className="text-xs text-stone-400 italic py-2">
                        Pratos deste estabelecimento aguardando aprovação em /moderation.
                      </p>
                    ) : (
                      rest.dishes_preview.map((dish) => (
                        <div
                          key={dish.id}
                          className="rounded-2xl bg-stone-50/90 border border-stone-200/80 px-3 py-2 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-stone-900 truncate">
                              {dish.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {dish.is_vegan && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                  🌱 Vegano
                                </span>
                              )}
                              {dish.is_vegetarian && !dish.is_vegan && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-lime-100 text-lime-900">
                                  🥗 Vegetariano
                                </span>
                              )}
                              {dish.is_gluten_free && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                  🌾 Sem Glúten
                                </span>
                              )}
                              {dish.is_lactose_free && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900">
                                  🥛 Zero Lactose
                                </span>
                              )}
                              {dish.last_price_delta_pct < 0 && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                  {dish.last_price_delta_pct.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-heading font-extrabold text-xs text-[#135136] shrink-0">
                            R$ {dish.price.toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                  <Link
                    href={`/restaurants/${rest.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <span>Ver Cardápio Completo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setQuickModalRest(rest)}
                    className="px-3 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
                    title="Resumo rápido dos pratos"
                  >
                    Resumo
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Botão Flutuante do Assistente IA Hiperlocal */}
      <button
        type="button"
        onClick={() => openAssistantWithPrompt('')}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#135136] hover:bg-[#1E6B47] text-white border-2 border-[#FFB703] font-heading font-black text-xs sm:text-sm shadow-2xl transition-all hover:scale-105"
      >
        <Sparkles className="w-4 h-4 text-[#FFB703]" />
        <span>Perguntar ao Assistente IA (SVL-RRF)</span>
      </button>

      {/* Modal Rápido Opcional de Cardápio */}
      {quickModalRest && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
            <div className="bg-[#135136] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-xl">
                  {quickModalRest.name}
                </h3>
                <p className="text-xs text-emerald-100">
                  {quickModalRest.neighborhood} • {quickModalRest.address} • H3{' '}
                  {quickModalRest.h3_res8}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickModalRest(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
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
                    {d.smart_defaults && d.smart_defaults.length > 0 && (
                      <div className="text-[11px] text-emerald-800 font-semibold mt-1.5">
                        Acompanhamentos sugeridos: {d.smart_defaults.join(' • ')}
                      </div>
                    )}
                  </div>
                  <div className="font-heading font-black text-sm text-[#135136] shrink-0">
                    R$ {d.price.toFixed(2)}
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
                    `Quais são os melhores pratos disponíveis no ${restName}?`
                  );
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#135136] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consultar IA sobre este cardápio</span>
              </button>

              <Link
                href={`/restaurants/${quickModalRest.slug}`}
                onClick={() => setQuickModalRest(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135136] text-white font-bold text-xs"
              >
                <span>Abrir Página Completa & Reviews LGPD</span>
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
