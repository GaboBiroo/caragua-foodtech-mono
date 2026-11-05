'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { CaraguaAIChatDrawer } from '../../components/CaraguaAIChatDrawer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FavoriteDishItem {
  id: string;
  name: string;
  price: number;
  last_price_delta_pct: number;
}

interface FavoriteRestaurantItem {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  address: string;
  cuisine_types: string[];
  rating_score?: number;
  rating_average: number;
  total_reviews: number;
  has_price_drop: boolean;
  dishes_preview: FavoriteDishItem[];
}

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRestaurantItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/restaurants?limit=20`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json: FavoriteRestaurantItem[] = await res.json();
        if (mounted && Array.isArray(json)) {
          setFavorites(json);
        }
      } catch {
        // Mantém lista vazia em caso de oscilação momentânea
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex flex-col">
      <Navbar onOpenAIChat={() => setAiDrawerOpen(true)} />

      <header className="relative bg-[#135136] text-white pt-12 pb-12 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="max-w-5xl mx-auto relative z-10 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Queridinhos dos Moradores & Visitantes</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white leading-tight">
            Os Lugares Favoritos de <span className="text-[#FFB703]">Caraguá</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            Descubra os quiosques, restaurantes, padarias e lanchonetes mais elogiados hoje nos 53 bairros de Caraguatatuba.
          </p>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-9 space-y-8 flex-1">
        {/* Por que você pode confiar nesta seleção */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#FFB703]" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Quem comeu agora tem voz
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              As avaliações das últimas semanas contam mais do que notas antigas, mostrando como a cozinha está atendendo hoje.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#135136] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#135136]" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Opiniões 100% Verificadas
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Avaliações repetidas ou suspeitas ficam de fora para garantir uma escolha justa tanto na praia quanto nos bairros.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-sky-800" />
            </div>
            <div className="font-heading font-bold text-sm text-stone-900">
              Sabor, Capricho & Preço Justo
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Valorizamos desde os frutos do mar fresquinhos da Cocanha e do Camaroeiro até o lanche artesanal de bairro.
            </p>
          </div>
        </div>

        {/* Lista Viva dos Favoritos */}
        <section className="bg-white rounded-[28px] border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-black text-xl text-stone-900">
                Os Mais Bem Avaliados Hoje em Caraguatatuba
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Clique em qualquer restaurante para abrir o cardápio completo com os preços do dia
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
                    <th className="px-4 py-3.5">Lugar</th>
                    <th className="px-4 py-3.5">Restaurante & Destaque</th>
                    <th className="px-4 py-3.5">Bairro</th>
                    <th className="px-4 py-3.5 text-center">Nota Real</th>
                    <th className="px-4 py-3.5 text-right">Cardápio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {favorites.map((item, index) => {
                    const topDish = item.dishes_preview?.[0];
                    const score = (item.rating_score ?? item.rating_average ?? 4.8).toFixed(1);
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-4 py-4 font-heading font-black text-base text-stone-900">
                          {index === 0
                            ? '🥇'
                            : index === 1
                            ? '🥈'
                            : index === 2
                            ? '🥉'
                            : `${index + 1}º`}
                        </td>

                        <td className="px-4 py-4 space-y-0.5">
                          <div className="font-heading font-bold text-stone-900 text-sm flex items-center gap-2 flex-wrap">
                            <span>{item.name}</span>
                            {item.has_price_drop && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                                <TrendingDown className="w-3 h-3" />
                                Baixou de preço
                              </span>
                            )}
                          </div>
                          {topDish && (
                            <div className="text-xs text-[#135136] font-medium">
                              Destaque: {topDish.name} • {formatBRL(topDish.price)}
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
                            title="Nota real calculada com avaliações verificadas"
                          >
                            <Star className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
                            <span>{score.replace('.', ',')}</span>
                            <span className="text-[10px] text-stone-500 font-normal">
                              ({item.total_reviews})
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/restaurants/${item.slug}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs shadow-xs transition-transform hover:scale-105"
                          >
                            <span>Abrir Cardápio</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#FFB703]" />
                          </Link>
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
          CaráFood • Feito com carinho para quem mora e passeia pelos 53 bairros de Caraguatatuba.
        </p>
      </footer>

      <CaraguaAIChatDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
}
