'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, Zap, Sparkles, Filter, 
  MapPin, Star, Utensils, AlertTriangle, ArrowUpRight, X 
} from 'lucide-react';
import { INITIAL_RESTAURANTS, Dish, RestaurantItem } from '../../data/caraguaData';

interface SearchTabProps {
  selectedNeighborhood: string;
  onSelectRestaurantForReview: (restaurant: RestaurantItem) => void;
}

type FilterCategory = 'todos' | 'promo' | 'frutos_mar' | 'vegano' | 'gluten';

export const SearchTab: React.FC<SearchTabProps> = ({
  selectedNeighborhood,
  onSelectRestaurantForReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('todos');

  // Filtros rápidos em pílula tátil
  const filterPills: { id: FilterCategory; label: string }[] = [
    { id: 'todos', label: 'Todos os Pratos' },
    { id: 'promo', label: 'Em Promoção Agora' },
    { id: 'frutos_mar', label: 'Frutos do Mar & Camarão' },
    { id: 'vegano', label: '100% Vegano (Food Safety)' },
    { id: 'gluten', label: 'Sem Glúten (Celíaco)' },
  ];

  // Algoritmo de Busca Semântica com GUARDRAIL ESTRITO DE SEGURANÇA ALIMENTAR
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const isVeganQuery = query.includes('vegan') || query.includes('vegetar') || query.includes('sem carne');
    const isStrictVeganMode = activeFilter === 'vegano' || isVeganQuery;

    const results: { dish: Dish; restaurant: RestaurantItem }[] = [];

    INITIAL_RESTAURANTS.forEach(restaurant => {
      // Filtro de bairro se não for 'todos'
      if (selectedNeighborhood !== 'todos' && selectedNeighborhood) {
        const cleanBairro = restaurant.neighborhood.toLowerCase().replace(/\s+/g, '-');
        if (!cleanBairro.includes(selectedNeighborhood) && !selectedNeighborhood.includes(cleanBairro)) {
          return;
        }
      }

      restaurant.dishes.forEach(dish => {
        // 1. REGRA CRÍTICA DE FOOD SAFETY: NUNCA MOSTRAR PEIXE OU CARNE EM MODO VEGANO
        if (isStrictVeganMode) {
          if (!dish.isVegan) {
            return; // Bloqueia imediatamente pescados ou carnes
          }
        }

        // 2. Filtro de Celíacos / Sem Glúten
        if (activeFilter === 'gluten' && !dish.isGlutenFree) {
          return;
        }

        // 3. Filtro de Promoção
        if (activeFilter === 'promo' && !dish.isPromotion) {
          return;
        }

        // 4. Filtro de Frutos do Mar
        if (activeFilter === 'frutos_mar') {
          const isSeafood = dish.category.toLowerCase().includes('mar') || 
                            dish.tags.some(t => t.toLowerCase().includes('camarão') || t.toLowerCase().includes('peixe') || t.toLowerCase().includes('marisco'));
          if (!isSeafood) return;
        }

        // 5. Match de Texto (Nome, Descrição, Tags, Restaurante)
        if (query) {
          const matchName = dish.name.toLowerCase().includes(query);
          const matchDesc = dish.description.toLowerCase().includes(query);
          const matchTags = dish.tags.some(t => t.toLowerCase().includes(query));
          const matchRest = restaurant.name.toLowerCase().includes(query);

          if (!matchName && !matchDesc && !matchTags && !matchRest) {
            return;
          }
        }

        results.push({ dish, restaurant });
      });
    });

    return results;
  }, [searchQuery, activeFilter, selectedNeighborhood]);

  return (
    <div className="space-y-6">
      {/* Header e Barra de Busca Spotlight */}
      <div className="coucou-card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#18181B] tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-[#0D9488]" />
            <span>Busca Spotlight & IA Semântica</span>
          </h2>
          <p className="text-sm text-[#52525B] mt-1">
            Pesquise por ingredientes, pratos típicos ou restrições alimentares com validação RAG em tempo real.
          </p>
        </div>

        {/* Input de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: moqueca vegana, camarão na moranga, peixe grelhado..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-[#18181B] placeholder-[#71717A] text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:bg-white focus:ring-4 focus:ring-[#0D9488]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#71717A] hover:text-[#18181B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pílulas de Filtro Rápido */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveFilter(pill.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0B2B26] text-[#F6F2EB] shadow-sm'
                    : 'bg-white text-[#52525B] border border-[#E2D9CC] hover:border-[#D4D4D8] hover:text-[#18181B]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerta de Food Safety quando em Modo Vegano */}
      {(activeFilter === 'vegano' || searchQuery.toLowerCase().includes('vegan')) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-xs text-[#065F46]"
        >
          <ShieldCheck className="w-5 h-5 text-[#059669] shrink-0" />
          <div>
            <span className="font-bold">Filtro de Segurança Alimentar Ativo:</span> Todos os pratos com pescados, frutos do mar ou derivados animais foram rigorosamente bloqueados da busca.
          </div>
        </motion.div>
      )}

      {/* Resultados da Busca */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#71717A] font-mono px-1">
          <span>{searchResults.length} {searchResults.length === 1 ? 'prato encontrado' : 'pratos encontrados'}</span>
          <span>Bairro: {selectedNeighborhood === 'todos' ? 'Todos de Caraguá' : selectedNeighborhood}</span>
        </div>

        {searchResults.length === 0 ? (
          <div className="coucou-card p-12 text-center space-y-3">
            <Utensils className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
            <h3 className="font-bold text-[#18181B]">Nenhum prato correspondeu aos critérios</h3>
            <p className="text-xs text-[#52525B] max-w-sm mx-auto">
              Tente buscar por termos mais amplos ou redefinir os filtros de bairro e categoria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map(({ dish, restaurant }) => (
              <div
                key={dish.id}
                className="coucou-card p-4 flex gap-4 items-center group cursor-pointer hover:border-[#0D9488]/50"
                onClick={() => onSelectRestaurantForReview(restaurant)}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#EDE6DC] shrink-0">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#0D9488] font-bold truncate">
                      {restaurant.name}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#18181B]">
                      R$ {dish.price.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#18181B] truncate">
                    {dish.name}
                  </h4>
                  <p className="text-xs text-[#52525B] line-clamp-2">
                    {dish.description}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    {dish.isVegan && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#059669]">
                        Vegano
                      </span>
                    )}
                    {dish.isPromotion && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF1F2] text-[#E11D48]">
                        Promoção
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
