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
  Phone,
  Utensils,
  CheckCircle2,
  ChefHat,
  ExternalLink,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CaraguaAIChatDrawer } from '@/components/CaraguaAIChatDrawer';
import { SmartFoodImage } from '@/components/SmartFoodImage';
import { realDataStore } from '@/data/realDataStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface DishPriceStep {
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
  previous_price?: number | null;
  savings_brl?: number;
  category: string;
  image_url?: string | null;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  last_price_delta_pct: number;
  suggested_sides?: string[];
  price_history: DishPriceStep[];
}

interface MenuCategoryBlock {
  category: string;
  items: RestaurantMenuDish[];
}

interface VerifiedCustomerReview {
  id: string;
  author_label?: string;
  original_rating: number;
  public_comment?: string;
  comment_text: string;
  review_date: string | null;
}

function formatOpeningHours(val: unknown): string {
  if (!val) return 'Ter a Dom • 11h30 às 23h00';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (obj.osm_schedule && typeof obj.osm_schedule === 'string') {
      return obj.osm_schedule
        .replace(/Mo-Fr/g, 'Segunda a Sexta')
        .replace(/Mo-Su/g, 'Todos os dias')
        .replace(/Sa-Su/g, 'Sábado e Domingo')
        .replace(/Tu-Su/g, 'Terça a Domingo');
    }
    return 'Ter a Dom • 11h30 às 23h00';
  }
  return String(val);
}

interface RestaurantDetailData {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  phone?: string | null;
  website?: string | null;
  menu_url?: string | null;
  source_platform?: string | null;
  image_url?: string | null;
  cover_image?: string | null;
  banner_url?: string | null;
  gallery_photos?: string[];
  opening_hours?: any;
  latitude: number;
  longitude: number;
  price_level: number;
  cuisine_types: string[];
  rating_score?: number;
  rating_average: number;
  review_count: number;
  total_reviews: number;
  active_dishes_count: number;
  is_real_osm?: boolean;
  distance_meters: number;
  distance_km: number;
  menu_by_category: MenuCategoryBlock[];
  dishes: RestaurantMenuDish[];
  reviews: VerifiedCustomerReview[];
}

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatDistanceFriendly(meters: number, km: number): string {
  if (meters < 1000) {
    return `A ${Math.max(50, Math.round(meters / 10) * 10)}m do Centro`;
  }
  return `A ${km.toFixed(1).replace('.', ',')} km do Centro`;
}

function sanitizeReviewText(raw: string): string {
  const cleaned = raw
    .replace(/\[[A-Z0-9_]+\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .trim();
  return cleaned;
}

const MiniPriceCurve: React.FC<{ steps: DishPriceStep[]; currentPrice: number }> = ({
  steps,
  currentPrice,
}) => {
  const values =
    steps.length > 0
      ? [steps[0].previous_price, ...steps.map((s) => s.new_price)]
      : [currentPrice, currentPrice];
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = maxV - minV || 1;
  const width = 92;
  const height = 26;
  const pad = 4;

  const pts = values.map((v, idx) => {
    const x = pad + (idx / Math.max(1, values.length - 1)) * (width - pad * 2);
    const y = pad + (height - pad * 2) - ((v - minV) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const dropped = values[values.length - 1] < values[0];
  const color = dropped ? '#059669' : '#D97706';

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Histórico recente de preço deste prato"
      className="shrink-0"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(' ')}
      />
    </svg>
  );
};

export default function RestaurantMenuDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === 'string' ? params.slug : '';

  const [detail, setDetail] = useState<RestaurantDetailData | null>(null);
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
      const res = await fetch(`/api/restaurants/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: RestaurantDetailData = await res.json();
        setDetail(json);
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback gracioso
    }

    try {
      const fallbackData = realDataStore.getRestaurantBySlug(slug) as unknown as RestaurantDetailData;
      if (fallbackData) {
        setDetail(fallbackData);
      } else {
        setErrorMsg('Não encontramos este restaurante agora.');
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não conseguimos abrir este cardápio agora. Tente novamente em instantes!'
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
            !(dish.price_history || []).some((h) => h.delta_percentage < 0)
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

  const rawRating = detail ? (detail.rating_score ?? detail.rating_average ?? 0) : 0;
  const starRating = rawRating > 0 ? rawRating.toFixed(1) : 'Novo';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar
        onOpenAIChat={() => {
          setAiInitialPrompt('');
          setAiDrawerOpen(true);
        }}
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7 flex-1">
        {/* Navegação Superior */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#135136] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para os Cardápios de Caraguá</span>
          </Link>

          <Link
            href="/moderation"
            className="text-xs font-bold text-stone-600 hover:text-[#135136]"
          >
            Painel da Equipe →
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
            <div className="font-heading font-black text-2xl text-rose-950">
              {errorMsg || 'Restaurante não encontrado'}
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#135136] text-white font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver outros lugares em Caraguá</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Apresentação Acolhedora do Estabelecimento */}
            <header className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="space-y-3">
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
                      Cardápio & Preço Verificados
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
                      <a
                        href={`tel:${detail.phone.replace(/\D/g, '')}`}
                        className="inline-flex items-center gap-1 text-stone-700 hover:text-[#135136] font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {detail.phone}
                      </a>
                    )}
                    {detail.opening_hours && (
                      <span className="inline-flex items-center gap-1 text-stone-600">
                        <Clock className="w-3.5 h-3.5 text-[#135136]" />
                        {formatOpeningHours(detail.opening_hours)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold">
                      📍 {formatDistanceFriendly(detail.distance_meters, detail.distance_km)}
                    </span>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${detail.latitude},${detail.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#135136] border border-emerald-200 font-bold transition-colors"
                    >
                      <span>Como chegar no Mapa</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {(detail.menu_url || detail.website) && (
                      <a
                        href={detail.menu_url || detail.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#135136] hover:bg-[#0D3B27] text-white font-bold transition-colors shadow-xs"
                      >
                        <span>
                          Conferir Cardápio Original
                          {detail.source_platform ? ` (${detail.source_platform})` : ''}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {detail.website && detail.website !== detail.menu_url && (
                      <a
                        href={detail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-bold transition-colors"
                      >
                        <span>Site / Rede Social</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Nota Real dos Clientes + Dica do Chef */}
                <div
                  className="bg-amber-50/85 border border-amber-200 rounded-3xl p-4 sm:p-5 min-w-[250px] flex flex-col justify-between gap-3"
                  title="Nota real calculada com avaliações verificadas"
                >
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950">
                      Nota dos Clientes
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <Star className="w-6 h-6 fill-[#FFB703] text-[#FFB703] self-center" />
                      <span className="font-heading font-black text-3xl text-stone-900">
                        {starRating}
                      </span>
                      {rawRating > 0 && (
                        <span className="text-xs font-bold text-stone-600">de 5,0</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      {detail.review_count > 0 ? (
                        <>
                          Com base em <strong>{detail.review_count}</strong> avaliações públicas no Google Maps
                        </>
                      ) : (
                        <>Ainda sem avaliações públicas indexadas no Google Maps</>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAiInitialPrompt(
                        `O que vale mais a pena pedir hoje no ${detail.name} em ${detail.neighborhood}?`
                      );
                      setAiDrawerOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <ChefHat className="w-4 h-4 text-[#FFB703]" />
                    <span>Pedir Dica ao Chef CaráFood</span>
                  </button>
                </div>
              </div>

              {(() => {
                const rawPhotos = [
                  detail.cover_image,
                  detail.banner_url,
                  detail.image_url,
                  ...(detail.gallery_photos || []),
                  ...detail.dishes.map((d) => d.image_url),
                ].filter((u): u is string => Boolean(u && typeof u === 'string' && u.startsWith('http')));
                const uniquePhotos = Array.from(new Set(rawPhotos)).slice(0, 12);
                if (uniquePhotos.length === 0) return null;
                return (
                  <div className="pt-4 border-t border-stone-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                        📸 Fotos Reais do Lugar & Pratos ({uniquePhotos.length})
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">
                        Google Maps & Cardápio Digital
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                      {uniquePhotos.map((photoUrl, idx) => (
                        <a
                          key={`${photoUrl}-${idx}`}
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 w-36 h-28 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 hover:border-[#135136] transition-all group"
                          title="Abrir foto real em tamanho original"
                        >
                          <SmartFoodImage
                            src={photoUrl}
                            alt={`${detail.name} — foto real ${idx + 1}`}
                            mode="card"
                            hoverZoom
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </header>

            {/* Busca no Cardápio e Filtros de Restrição Alimentar */}
            <section className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder={`Buscar nos ${detail.active_dishes_count} itens do cardápio de ${detail.name}...`}
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-extrabold text-stone-600 mr-1 inline-flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#135136]" />
                  Filtrar:
                </span>
                {[
                  { key: 'vegan' as const, label: '🌱 Vegano' },
                  { key: 'vegetarian' as const, label: '🥗 Vegetariano' },
                  { key: 'glutenFree' as const, label: '🌾 Sem Glúten' },
                  { key: 'lactoseFree' as const, label: '🥛 Sem Lactose' },
                  { key: 'priceDrop' as const, label: '📉 Baixou de Preço' },
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

            {/* Cardápio Completo Separado por Categoria */}
            <section className="space-y-6">
              {filteredCategories.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center text-stone-600">
                  Nenhum prato deste cardápio combina com todos os filtros marcados. Tente limpar um filtro acima!
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
                        ({group.items.length} {group.items.length === 1 ? 'opção' : 'opções'})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.items.map((dish) => {
                        const priceHistory = Array.isArray(dish.price_history) ? dish.price_history : [];
                        const latestStep =
                          priceHistory.length > 0
                            ? priceHistory[priceHistory.length - 1]
                            : null;
                        const deltaPct =
                          dish.last_price_delta_pct !== 0
                            ? dish.last_price_delta_pct
                            : latestStep?.delta_percentage ?? 0;
                        const prevPrice =
                          dish.previous_price ??
                          (latestStep && deltaPct < 0 ? latestStep.previous_price : null);
                        const savedAmount =
                          dish.savings_brl && dish.savings_brl > 0
                            ? dish.savings_brl
                            : prevPrice && prevPrice > dish.price
                            ? prevPrice - dish.price
                            : 0;

                        return (
                          <div
                            key={dish.id}
                            className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-[#135136]/50 transition-all"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                {dish.image_url && (
                                  <Link
                                    href={`/prato/${dish.id}`}
                                    className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0"
                                  >
                                    <img
                                      src={dish.image_url}
                                      alt={dish.name}
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                    />
                                  </Link>
                                )}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/prato/${dish.id}`}
                                    className="font-heading font-bold text-base text-stone-900 hover:text-[#135136] transition-colors block"
                                  >
                                    {dish.name}
                                  </Link>
                                </div>
                                <div className="text-right shrink-0">
                                  {prevPrice && deltaPct < 0 && (
                                    <div className="text-[11px] text-stone-400 line-through">
                                      De {formatBRL(prevPrice)}
                                    </div>
                                  )}
                                  <div className="font-heading font-black text-lg text-[#135136]">
                                    {formatBRL(dish.price)}
                                  </div>
                                  <Link
                                    href={`/prato/${dish.id}`}
                                    className="text-[10px] font-bold text-stone-400 hover:text-[#135136] block mt-0.5"
                                  >
                                    Avaliar prato →
                                  </Link>
                                </div>
                              </div>

                              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                                {dish.description}
                              </p>

                              {/* Selos Alimentares e Economia Real */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                                <div className="flex flex-wrap items-center gap-1.5">
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
                                      🥛 Sem Lactose
                                    </span>
                                  )}

                                  {deltaPct < 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                                      <TrendingDown className="w-3 h-3" />
                                      {savedAmount >= 1
                                        ? `📉 Baixou ${formatBRL(savedAmount)} recentemente`
                                        : '🔥 Preço menor que na semana passada'}
                                    </span>
                                  )}
                                </div>

                                {priceHistory.length > 0 && (
                                  <div className="flex items-center gap-1.5" title="Histórico recente de preço">
                                    <MiniPriceCurve
                                      steps={priceHistory}
                                      currentPrice={dish.price}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {dish.suggested_sides && dish.suggested_sides.length > 0 && (
                              <div className="pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 flex flex-wrap items-center gap-1.5">
                                <span className="font-extrabold text-[#135136]">
                                  Acompanha muito bem:
                                </span>
                                {dish.suggested_sides.map((sd) => (
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

            {/* Avaliações Verificadas de Moradores e Visitantes */}
            <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Opiniões Verificadas • Privacidade Protegida
                  </div>
                  <h2 className="font-heading font-black text-2xl text-stone-900 mt-1.5">
                    O que quem já pediu achou ({detail.reviews.length})
                  </h2>
                </div>

                <div className="text-xs text-stone-500 max-w-xs">
                  Exibimos apenas relatos reais de clientes, protegendo o nome, telefone e endereço pessoal de quem avaliou.
                </div>
              </div>

              {detail.reviews.length === 0 ? (
                <p className="text-sm text-stone-500">
                  Nenhuma avaliação pública do Google Maps registrada até o momento para este estabelecimento.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.reviews
                    .filter((rev) => {
                      const cleanText = sanitizeReviewText(
                        rev.public_comment || rev.comment_text || (rev as any).comment || ''
                      );
                      return cleanText.length > 0;
                    })
                    .map((rev) => {
                    const cleanText = sanitizeReviewText(
                      rev.public_comment || rev.comment_text || (rev as any).comment || ''
                    );
                    const stars = Number(rev.original_rating ?? (rev as any).rating ?? 5.0);
                    const author = rev.author_label || (rev as any).author || 'Cliente Google Maps';
                    const dateDisplay = (rev as any).date || (rev.review_date ? new Date(rev.review_date).toLocaleDateString('pt-BR') : 'Recentemente');
                    return (
                      <article
                        key={rev.id}
                        className="rounded-2xl bg-stone-50/90 border border-stone-200 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/10 text-[#135136]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            {author}
                          </span>

                          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-stone-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                            <span>{stars.toFixed(1).replace('.', ',')}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                          &ldquo;{cleanText}&rdquo;
                        </p>

                        <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1">
                          <span>Avaliação real no Google Maps</span>
                          <span>{dateDisplay}</span>
                        </div>
                      </article>
                    );
                  })}
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
