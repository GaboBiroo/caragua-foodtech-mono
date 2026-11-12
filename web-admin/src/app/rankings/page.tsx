'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  ChefHat,
  SlidersHorizontal,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { CaraguaAIChatDrawer } from '../../components/CaraguaAIChatDrawer';
import { realDataStore } from '../../data/realDataStore';



interface FavoriteDishItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  last_price_delta_pct: number;
}

interface FavoriteRestaurantItem {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  address: string;
  cuisine_types: string[];
  food_types?: string[];
  rating_score?: number;
  bayesian_rating?: number;
  rating_average: number;
  total_reviews: number;
  has_price_drop: boolean;
  dishes_preview: FavoriteDishItem[];
}

const RANKING_CATEGORIES = [
  { key: 'Todos', label: '🏆 Todos de Caraguá' },
  { key: 'lanches', label: '🍔 Lanches & Burgers' },
  { key: 'pizza', label: '🍕 Pizzas & Esfihas' },
  { key: 'sushi', label: '🍣 Sushi & Japonês' },
  { key: 'combo_familia', label: '👨‍👩‍👧‍👦 Combo Família' },
  { key: 'marmitas', label: '🍱 Marmitas & Refeições' },
  { key: 'porcoes', label: '🍟 Porções & Pastéis' },
  { key: 'frutos_do_mar', label: '🍤 Frutos do Mar' },
  { key: 'doces_acai', label: '🍨 Açaí & Sobremesas' },
] as const;

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRestaurantItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortCriteria, setSortCriteria] = useState<'rating' | 'lowest_price' | 'most_reviewed'>(
    'rating'
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/restaurants?limit=120&sort_by=rating', {
          cache: 'no-store',
        });
        if (res.ok) {
          const json = await res.json();
          const items: FavoriteRestaurantItem[] = Array.isArray(json) ? json : json.restaurants || [];
          if (mounted && items.length > 0) {
            setFavorites(items);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }
      if (mounted) {
        const local = realDataStore.getRestaurants({ limit: 120, sortBy: 'rating' }) as unknown as FavoriteRestaurantItem[];
        setFavorites(local);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAndSortedFavorites = useMemo(() => {
    const filtered = favorites.filter((item) => {
      if (selectedCategory === 'Todos') return true;
      if (Array.isArray(item.food_types) && item.food_types.includes(selectedCategory)) return true;
      const needle = selectedCategory.toLowerCase();
      const corpus = [
        item.name,
        ...(item.cuisine_types || []),
        ...(item.dishes_preview || []).map((d) => `${d.name} ${d.category || ''}`),
      ]
        .join(' ')
        .toLowerCase();
      return corpus.includes(needle);
    });

    return [...filtered].sort((a, b) => {
      if (sortCriteria === 'lowest_price') {
        const pA = a.dishes_preview?.[0]?.price ?? 999;
        const pB = b.dishes_preview?.[0]?.price ?? 999;
        return pA - pB;
      }
      if (sortCriteria === 'most_reviewed') {
        return (b.total_reviews || 0) - (a.total_reviews || 0);
      }
      const sA = Number(a.bayesian_rating ?? a.rating_score ?? a.rating_average ?? 0);
      const sB = Number(b.bayesian_rating ?? b.rating_score ?? b.rating_average ?? 0);
      if (sB !== sA) return sB - sA;
      return (b.total_reviews || 0) - (a.total_reviews || 0);
    });
  }, [favorites, selectedCategory, sortCriteria]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex flex-col">
      <Navbar onOpenAIChat={() => setAiDrawerOpen(true)} />

      <header className="relative bg-[#135136] text-white pt-10 pb-10 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="max-w-5xl mx-auto relative z-10 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Ranking Oficial & Queridinhos dos Moradores</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white leading-tight">
            Os Melhores Lugares e Pratos de <span className="text-[#FFB703]">Caraguá</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            Compare as casas mais elogiadas nos 53 bairros de Caraguatatuba, filtre por estilo de
            comida e ordene pela maior nota ou pelo menor preço conferido hoje.
          </p>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-7 flex-1">
        {/* Pilares de Confiança */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#FFB703]" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Quem comeu agora tem voz
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              As avaliações recentes contam mais do que notas antigas, mostrando como a cozinha está
              atendendo nesta temporada.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#135136] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#135136]" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Nota Bayesiana Oficial (W_R)
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Equilibra a nota média real do Google Maps (R) com o volume de avaliações (v) e a média
              da cidade (C), evitando que casas com 1 ou 2 votos ultrapassem favoritos consolidados.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-sky-800" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Do Quiosque à Cozinha Caiçara
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Valorizamos desde os frutos do mar da Cocanha e do Camaroeiro até a pizzaria e a
              padaria tradicional de bairro.
            </p>
          </div>
        </div>

        {/* Barra de Filtros por Categoria e Ordenação (HU05) */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-700">
              <SlidersHorizontal className="w-4 h-4 text-[#135136]" />
              <span>Filtrar por especialidade:</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-500 font-bold">Ordenar por:</span>
              <button
                type="button"
                onClick={() => setSortCriteria('rating')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  sortCriteria === 'rating'
                    ? 'bg-[#135136] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ⭐ Maior Nota
              </button>
              <button
                type="button"
                onClick={() => setSortCriteria('lowest_price')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  sortCriteria === 'lowest_price'
                    ? 'bg-[#135136] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                💰 Menor Preço
              </button>
              <button
                type="button"
                onClick={() => setSortCriteria('most_reviewed')}
                className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                  sortCriteria === 'most_reviewed'
                    ? 'bg-[#135136] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                💬 Mais Avaliados
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {RANKING_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? 'bg-[#FFB703] text-stone-950 border-[#FFB703] shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Tabela Oficial de Classificação */}
        <section className="bg-white rounded-[28px] border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-black text-xl text-stone-900">
                Classificação Atualizada ({filteredAndSortedFavorites.length} estabelecimentos)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Clique no prato em destaque para avaliar ou no restaurante para abrir o cardápio
                completo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAiDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FFB703] hover:bg-amber-400 text-stone-950 text-xs font-extrabold"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Pedir Sugestão ao Chef</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-2xl w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="text-[11px] font-black uppercase tracking-wider bg-stone-50 text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3.5">Posição</th>
                    <th className="px-4 py-3.5">Restaurante & Prato Campeão</th>
                    <th className="px-4 py-3.5">Bairro</th>
                    <th className="px-4 py-3.5 text-center">Super Nota</th>
                    <th className="px-4 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredAndSortedFavorites.map((item, index) => {
                    const topDish = item.dishes_preview?.[0];
                    const wrVal = Number(item.bayesian_rating ?? item.rating_score ?? item.rating_average ?? 0);
                    const score = wrVal > 0 ? wrVal.toFixed(2).replace('.', ',') : 'Novo';
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-4 py-4 font-heading font-black text-base text-stone-900">
                          {index === 0
                            ? '🥇 1º'
                            : index === 1
                            ? '🥈 2º'
                            : index === 2
                            ? '🥉 3º'
                            : `${index + 1}º`}
                        </td>

                        <td className="px-4 py-4 space-y-1">
                          <div className="font-heading font-bold text-stone-900 text-sm flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/restaurants/${item.slug}`}
                              className="hover:text-[#135136] transition-colors"
                            >
                              {item.name}
                            </Link>
                            {item.has_price_drop && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                                <TrendingDown className="w-3 h-3" />
                                Baixou de preço
                              </span>
                            )}
                          </div>
                          {topDish && (
                            <div className="text-xs text-[#135136] font-semibold">
                              <Link
                                href={`/prato/${topDish.id}`}
                                className="hover:underline inline-flex items-center gap-1"
                              >
                                <span>
                                  Prato destaque: {topDish.name} • {formatBRL(topDish.price)}
                                </span>
                                <span className="text-[10px] font-extrabold text-amber-700">
                                  (Ver prato →)
                                </span>
                              </Link>
                            </div>
                          )}
                          <div className="text-[11px] text-stone-500">
                            {item.cuisine_types.slice(0, 2).join(' • ')}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                            <MapPin className="w-3 h-3 text-[#135136]" />
                            <span>{item.neighborhood}</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div
                            className="inline-flex items-center gap-1 font-heading font-black text-sm text-[#135136] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
                            title={
                              item.total_reviews > 0
                                ? `CaráFood W_R: ${score} • Google Maps: ${item.rating_average.toFixed(1)} (${item.total_reviews} avaliações)`
                                : 'Sem avaliações públicas no Google Maps'
                            }
                          >
                            <Star className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
                            <span>{score}</span>
                            <span className="text-[10px] text-stone-500 font-normal">
                              ({item.total_reviews})
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {topDish && (
                              <Link
                                href={`/prato/${topDish.id}`}
                                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-[#FFB703] text-stone-900 font-bold text-xs transition-colors"
                              >
                                <span>Prato</span>
                              </Link>
                            )}
                            <Link
                              href={`/restaurants/${item.slug}`}
                              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105"
                            >
                              <span>Cardápio</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#FFB703]" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 bg-[#135136] text-white py-6 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          CaráFood • Feito para quem mora e passeia pelos 53 bairros de Caraguatatuba.
        </p>
      </footer>

      <CaraguaAIChatDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </div>
  );
}
