'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Star,
  ShieldCheck,
  Search,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Hash,
  Phone,
  Utensils,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CaraguaAIChatDrawer } from '@/components/CaraguaAIChatDrawer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface DishHistoryEntry {
  previous_price: number;
  new_price: number;
  delta_percentage: number;
  detected_at: string | null;
}

interface RestaurantMenuDish {
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
  price_history: DishHistoryEntry[];
}

interface MenuCategoryBlock {
  category: string;
  items: RestaurantMenuDish[];
}

interface SanitizedReviewItem {
  id: string;
  author_hash: string;
  author_hash_short: string;
  original_rating: number;
  effective_rating: number;
  time_decay_weight: number;
  comment_text: string;
  review_date: string | null;
  source_platform: string;
}

interface RestaurantDetailPayload {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  phone?: string | null;
  website?: string | null;
  latitude: number;
  longitude: number;
  h3_res8?: string | null;
  h3_res9?: string | null;
  geohash?: string | null;
  price_level: number;
  cuisine_types: string[];
  bayesian_rating: number;
  rating_average: number;
  decayed_rating_average: number;
  review_count: number;
  total_reviews: number;
  active_dishes_count: number;
  source_platform: string;
  distance_meters: number;
  distance_km: number;
  menu_by_category: MenuCategoryBlock[];
  dishes: RestaurantMenuDish[];
  reviews: SanitizedReviewItem[];
}

export default function RestaurantMenuDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [detail, setDetail] = useState<RestaurantDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [menuSearch, setMenuSearch] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<{
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
    priceDrop: boolean;
  }>({
    vegan: false,
    vegetarian: false,
    glutenFree: false,
    lactoseFree: false,
    priceDrop: false,
  });

  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  const fetchRestaurantDetail = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/restaurants/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`Estabelecimento não encontrado (HTTP ${res.status})`);
      }
      const json: RestaurantDetailPayload = await res.json();
      setDetail(json);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar os detalhes do estabelecimento.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchRestaurantDetail();
  }, [fetchRestaurantDetail]);

  const filteredCategories = useMemo(() => {
    if (!detail) return [];
    const q = menuSearch.trim().toLowerCase();

    return detail.menu_by_category
      .map((block) => {
        const matchingItems = block.items.filter((dish) => {
          if (dietFilter.vegan && !dish.is_vegan) return false;
          if (dietFilter.vegetarian && !(dish.is_vegetarian || dish.is_vegan))
            return false;
          if (dietFilter.glutenFree && !dish.is_gluten_free) return false;
          if (dietFilter.lactoseFree && !dish.is_lactose_free) return false;
          if (
            dietFilter.priceDrop &&
            dish.last_price_delta_pct >= 0 &&
            !dish.price_history.some((h) => h.delta_percentage < 0)
          ) {
            return false;
          }
          if (q) {
            const hay = `${dish.name} ${dish.description} ${dish.category}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });

        return {
          category: block.category,
          items: matchingItems,
        };
      })
      .filter((block) => block.items.length > 0);
  }, [detail, menuSearch, dietFilter]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar
        onOpenAIChat={() => {
          setAiInitialPrompt('');
          setAiDrawerOpen(true);
        }}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7 flex-1">
        {/* Navegação de Retorno */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#135136] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Vitrine dos 53 Bairros</span>
          </Link>

          <Link
            href="/moderation"
            className="text-xs font-bold text-stone-600 hover:text-[#135136]"
          >
            Gerenciar Quarentena no Command Center →
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-stone-200 rounded-xl w-1/2" />
            <div className="h-4 bg-stone-100 rounded-xl w-2/3" />
            <div className="h-32 bg-stone-100 rounded-2xl w-full" />
          </div>
        ) : errorMsg || !detail ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4">
            <h1 className="font-heading font-black text-2xl text-rose-950">
              {errorMsg || 'Estabelecimento não encontrado'}
            </h1>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#135136] text-white font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retornar ao Marketplace</span>
            </Link>
          </div>
        ) : (
          <>
            {/* CABEÇALHO DO ESTABELECIMENTO (ENDEREÇO, H3, W_R, AVALIAÇÕES VERIFICADAS) */}
            <header className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {detail.cuisine_types.map((c) => (
                      <span
                        key={c}
                        className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]"
                      >
                        {c}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Entidade Auditada • {detail.source_platform}
                    </span>
                  </div>

                  <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900">
                    {detail.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-stone-600">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#135136]">
                      <MapPin className="w-4 h-4" />
                      {detail.neighborhood} — {detail.address}
                    </span>
                    {detail.phone && (
                      <span className="inline-flex items-center gap-1 text-stone-600">
                        <Phone className="w-3.5 h-3.5" />
                        {detail.phone}
                      </span>
                    )}
                  </div>

                  {/* Metadados Geodésicos PostGIS + Uber H3 */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-stone-600">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200 inline-flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#135136]" />
                      H3 Res-8: <strong>{detail.h3_res8 || 'N/A'}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200">
                      GPS: {detail.latitude.toFixed(5)}, {detail.longitude.toFixed(5)}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200">
                      Distância: <strong>{detail.distance_km.toFixed(2)} km</strong>
                    </span>
                  </div>
                </div>

                {/* Painel Bayesiano W_R */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-4 sm:p-5 min-w-[240px] flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                      Score Bayesiano Ponderado (W_R)
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <Star className="w-6 h-6 fill-[#FFB703] text-[#FFB703] self-center" />
                      <span className="font-heading font-black text-3xl text-stone-900">
                        {detail.bayesian_rating.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-stone-600">/ 5.00</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Baseado em <strong>{detail.review_count}</strong> avaliações verificadas (média bruta {detail.rating_average.toFixed(2)})
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAiInitialPrompt(
                        `Quais pratos você recomenda no restaurante ${detail.name} em ${detail.neighborhood}?`
                      );
                      setAiDrawerOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                    <span>Consultar Assistente IA</span>
                  </button>
                </div>
              </div>
            </header>

            {/* BUSCA INTERNA E FILTROS DIETÉTICOS DO CARDÁPIO */}
            <section className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder={`Buscar nos ${detail.active_dishes_count} pratos aprovados de ${detail.name}`}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'vegan' as const, label: '🌱 Vegano' },
                  { key: 'vegetarian' as const, label: '🥗 Vegetariano' },
                  { key: 'glutenFree' as const, label: '🌾 Sem Glúten' },
                  { key: 'lactoseFree' as const, label: '🥛 Zero Lactose' },
                  { key: 'priceDrop' as const, label: '📉 Queda de Preço' },
                ].map((f) => {
                  const active = dietFilter[f.key];
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() =>
                        setDietFilter((prev) => ({
                          ...prev,
                          [f.key]: !prev[f.key],
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                        active
                          ? 'bg-[#135136] text-white border-[#135136]'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-[#135136]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CARDÁPIO APROVADO AGRUPADO POR CATEGORIA */}
            <section className="space-y-6">
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-600">
                  Nenhum prato aprovado corresponde aos filtros selecionados neste estabelecimento.
                </div>
              ) : (
                filteredCategories.map((group) => (
                  <div key={group.category} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <Utensils className="w-4 h-4 text-[#135136]" />
                      <h2 className="font-heading font-black text-xl text-stone-900">
                        {group.category}
                      </h2>
                      <span className="text-xs font-bold text-stone-500">
                        ({group.items.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((dish) => {
                        const latestHist =
                          dish.price_history.length > 0
                            ? dish.price_history[dish.price_history.length - 1]
                            : null;
                        const deltaPct =
                          dish.last_price_delta_pct !== 0
                            ? dish.last_price_delta_pct
                            : latestHist?.delta_percentage ?? 0;

                        return (
                          <div
                            key={dish.id}
                            className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-sm flex flex-col justify-between gap-3 hover:border-[#135136]/50 transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-heading font-bold text-base text-stone-900">
                                  {dish.name}
                                </h3>
                                <div className="text-right shrink-0">
                                  {latestHist && deltaPct < 0 && (
                                    <div className="text-[11px] font-mono text-stone-400 line-through">
                                      R$ {latestHist.previous_price.toFixed(2)}
                                    </div>
                                  )}
                                  <div className="font-heading font-black text-lg text-[#135136]">
                                    R$ {dish.price.toFixed(2)}
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                                {dish.description}
                              </p>

                              {/* Indicadores Dietéticos e Variação de Preço */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                {dish.is_vegan && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                                    🌱 Vegano
                                  </span>
                                )}
                                {dish.is_vegetarian && !dish.is_vegan && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 font-extrabold text-[10px]">
                                    🥗 Vegetariano
                                  </span>
                                )}
                                {dish.is_gluten_free && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                                    🌾 Sem Glúten
                                  </span>
                                )}
                                {dish.is_lactose_free && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-extrabold text-[10px]">
                                    🥛 Zero Lactose
                                  </span>
                                )}

                                {deltaPct !== 0 && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                                      deltaPct < 0
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                                    }`}
                                  >
                                    {deltaPct < 0 ? (
                                      <TrendingDown className="w-3 h-3" />
                                    ) : (
                                      <TrendingUp className="w-3 h-3" />
                                    )}
                                    {deltaPct > 0 ? '+' : ''}
                                    {deltaPct.toFixed(1)}% em dish_price_history
                                  </span>
                                )}
                              </div>
                            </div>

                            {dish.smart_defaults && dish.smart_defaults.length > 0 && (
                              <div className="pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 flex flex-wrap items-center gap-1.5">
                                <span className="font-extrabold text-[#135136]">
                                  Smart Defaults:
                                </span>
                                {dish.smart_defaults.map((sd) => (
                                  <span
                                    key={sd}
                                    className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-medium"
                                  >
                                    {sd}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* SEÇÃO INFERIOR: AVALIAÇÕES REAIS ANONIMIZADAS PELO LGPDSANITIZER */}
            <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    Conformidade Estrita Lei nº 13.709/2018 (LGPD)
                  </div>
                  <h2 className="font-heading font-black text-2xl text-stone-900 mt-1.5">
                    Avaliações Auditadas & Anonimizadas em SHA-256 ({detail.reviews.length})
                  </h2>
                </div>

                <div className="text-xs text-stone-500 max-w-xs">
                  Identificadores pessoais são convertidos em hash irreversível SHA-256 e padrões de CPF/telefone/e-mail são expurgados antes da persistência.
                </div>
              </div>

              {detail.reviews.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Nenhuma avaliação pública registrada para este estabelecimento até o momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.reviews.map((rev) => (
                    <article
                      key={rev.id}
                      className="rounded-2xl bg-stone-50/90 border border-stone-200 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-stone-900 text-amber-300"
                          title={`Integridade SHA-256 completa: ${rev.author_hash}`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {rev.author_hash_short}
                        </span>

                        <div className="inline-flex items-center gap-1 text-xs font-extrabold text-stone-900">
                          <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                          <span>{rev.original_rating.toFixed(1)}</span>
                          <span className="text-[10px] font-normal text-stone-500">
                            (peso {rev.time_decay_weight.toFixed(2)})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {rev.comment_text}
                      </p>

                      <div className="text-[10px] text-stone-400 flex items-center justify-between pt-1">
                        <span>Fonte: {rev.source_platform}</span>
                        {rev.review_date && (
                          <span>
                            {new Date(rev.review_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <CaraguaAIChatDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        activeNeighborhood={detail?.neighborhood}
        initialPrompt={aiInitialPrompt}
        userLat={detail?.latitude ?? -23.6204}
        userLon={detail?.longitude ?? -45.4132}
      />
    </div>
  );
}
