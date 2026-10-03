'use client';

import React, { useState } from 'react';
import { RestaurantItem, Dish } from '@/data/caraguaData';
import { Search, MapPin, Star, ShieldCheck, Flame, Filter, Sparkles } from 'lucide-react';

interface SearchTabProps {
  restaurants: RestaurantItem[];
  onSelectRestaurant: (restaurantId: string) => void;
}

export function SearchTab({ restaurants, onSelectRestaurant }: SearchTabProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');

  const FILTERS = [
    { key: 'todos', label: 'Todos' },
    { key: 'promo', label: '🔥 Promoções' },
    { key: 'camarao', label: '🦐 Camarão & Frutos' },
    { key: 'vegano', label: '🌱 Vegano' },
    { key: 'sem_gluten', label: '🌾 Sem Glúten' },
    { key: 'caicara', label: '🐟 Caiçara Raiz' }
  ];

  // Filtra restaurantes e pratos
  const filteredRestaurants = restaurants.filter(r => {
    const qLower = query.toLowerCase();
    const matchesQuery =
      r.name.toLowerCase().includes(qLower) ||
      r.neighborhood.toLowerCase().includes(qLower) ||
      r.dishes.some(d => d.name.toLowerCase().includes(qLower) || d.description.toLowerCase().includes(qLower));

    if (!matchesQuery) return false;

    if (activeFilter === 'promo') return !!r.activePromotion || r.dishes.some(d => d.isPromotion);
    if (activeFilter === 'camarao') return r.dishes.some(d => d.name.toLowerCase().includes('camarão') || d.name.toLowerCase().includes('badejo'));
    if (activeFilter === 'vegano') return r.dishes.some(d => d.isVegan);
    if (activeFilter === 'sem_gluten') return r.dishes.some(d => d.isGlutenFree);
    if (activeFilter === 'caicara') return r.cuisineTypes.includes('Caiçara');

    return true;
  });

  return (
    <div className="space-y-5 px-3 pt-2 pb-20">
      {/* Spotlight Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-sky-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque comida em Caraguá: camarão, azul-marinho, moqueca..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 shadow-xl backdrop-blur-md"
        />
      </div>

      {/* Pílulas de Filtro */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === f.key
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Dicas de IA para você */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h4 className="font-bold text-white text-xs">Dicas da IA para Caraguatatuba</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {query.toLowerCase().includes('camarão')
            ? '🦐 Para Camarão Rosa fresco, o Mar & Terra Gourmet (Indaiá) lidera com nota 4.8★ unificada entre iFood e Google.'
            : '💡 O Quiosque Canto Bravo (Martim de Sá) e Cantina Caiçara (Centro) estão com as melhores notas recentes com decaimento temporal de 30 dias.'}
        </p>
      </div>

      {/* Resultados da Busca */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{filteredRestaurants.length} estabelecimentos encontrados</span>
          <span>Notas cruzadas: Google • iFood • 99Food</span>
        </div>

        {filteredRestaurants.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelectRestaurant(r.id)}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition cursor-pointer shadow-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white text-base hover:text-sky-400 transition">
                  {r.name}
                </h4>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> {r.neighborhood} • {r.address}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {r.decayedRatingAverage}★
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Bruta: {r.ratingAverage}★ ({r.totalReviews})
                </span>
              </div>
            </div>

            {/* Pratos Destaque */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {r.dishes.slice(0, 2).map((dish) => (
                <div
                  key={dish.id}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-200">{dish.name}</span>
                    <p className="text-[11px] text-slate-400 truncate">{dish.description}</p>
                  </div>
                  <span className="font-bold text-teal-400 shrink-0">
                    R$ {dish.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Badges do Estabelecimento */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Food Safety: {r.foodSafetyScore}%
              </span>
              <div className="flex gap-1.5">
                {r.cuisineTypes.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
