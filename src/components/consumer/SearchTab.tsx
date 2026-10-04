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

  // Filtros rápidos em pílula de vidro
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
            return; // Bloqueia imediatamente Azul-Marinho, Badejo, Robalo, Carnes, etc.
          }
        }

        // 2. Filtro de Celíacos / Sem Glúten
        if (activeFilter === 'gluten' && !dish.isGlutenFree) {
          return;
        }

        // 3. Filtro de Promoção
        if (activeFilter === 'promo' && !dish.isPromotion && !restaurant.activePromotion) {
          return;
        }

        // 4. Filtro de Frutos do Mar
        if (activeFilter === 'frutos_mar') {
          const isSeafood = dish.tags.some(t => 
            t.toLowerCase().includes('camar') || 
            t.toLowerCase().includes('peixe') || 
            t.toLowerCase().includes('badejo') || 
            t.toLowerCase().includes('robalo') ||
            t.toLowerCase().includes('siri') ||
            t.toLowerCase().includes('ostra') ||
            t.toLowerCase().includes('tainha')
          );
          if (!isSeafood) return;
        }

        // 5. Comparação de Texto
        if (query) {
          const matchDishName = dish.name.toLowerCase().includes(query);
          const matchDishDesc = dish.description.toLowerCase().includes(query);
          const matchRestName = restaurant.name.toLowerCase().includes(query);
          const matchTags = dish.tags.some(t => t.toLowerCase().includes(query));

          if (!matchDishName && !matchDishDesc && !matchRestName && !matchTags) {
            return;
          }
        }

        results.push({ dish, restaurant });
      });
    });

    return results;
  }, [searchQuery, activeFilter, selectedNeighborhood]);

  const isVeganModeActive = activeFilter === 'vegano' || searchQuery.toLowerCase().includes('vegan');

  return (
    <div className="space-y-6">
      {/* Spotlight Search Bar */}
      <div className="relative">
        <div className="relative flex items-center bg-white/[0.06] hover:bg-white/[0.08] focus-within:bg-white/[0.10] border border-white/[0.14] focus-within:border-teal-400/60 rounded-3xl p-2.5 transition-all duration-300 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2),0_20px_40px_-15px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
          <div className="pl-3.5 pr-2 text-zinc-400">
            <Search className="w-5 h-5 text-teal-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por prato, ingrediente (ex: 'camarão', 'palmito') ou restaurante..."
            className="w-full bg-transparent border-none text-white text-sm md:text-base placeholder-zinc-500 focus:outline-none"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1.5 rounded-full hover:bg-white/[0.10] text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/[0.10] text-[11px] font-mono text-zinc-400">
            <span>Spotlight</span>
            <kbd className="px-1 py-0.5 rounded bg-black/40 text-[10px]">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Pílulas de Filtro Rápido com Framer Motion Spring */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterPills.map((pill) => {
          const isActive = activeFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`relative px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="searchFilterPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-white/[0.14] border border-white/[0.25] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3)] rounded-2xl backdrop-blur-xl"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {pill.id === 'vegano' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                {pill.id === 'promo' && <Zap className="w-3.5 h-3.5 text-rose-400" />}
                {pill.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Banner de Segurança Alimentar Ativa (Food Safety Shield) */}
      <AnimatePresence>
        {isVeganModeActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-2xl flex items-start gap-3 shadow-lg"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="text-emerald-300 font-semibold block mb-0.5">
                Modo Food Safety Ativo (Zero Contaminação Marinha):
              </strong>
              <p className="text-emerald-200/90">
                Pescados, frutos do mar e carnes foram rigorosamente bloqueados da listagem. O prato patrimonial <em>Azul-Marinho</em> leva peixe e não é exibido aqui. Apenas preparações 100% vegetais auditadas estão visíveis.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>
          Exibindo <strong className="text-zinc-200 font-mono">{searchResults.length}</strong> pratos auditados
        </span>
        <span className="text-[11px] font-mono text-teal-400">
          Rankeado por Super Nota (30d)
        </span>
      </div>

      {/* Grid de Pratos Encontrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searchResults.map(({ dish, restaurant }, index) => (
          <motion.div
            key={`${restaurant.id}-${dish.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="p-4 rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-2xl border border-white/[0.09] hover:border-white/[0.18] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_15px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Foto do Prato */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-black/40">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                {dish.isPromotion && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-rose-950/80 backdrop-blur-md border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                    PROMO {dish.promoDiscount || 'ATIVA'}
                  </span>
                )}
                {dish.isVegan && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Vegano
                  </span>
                )}
              </div>

              {/* Informações do Restaurante e Bairro */}
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="truncate max-w-[180px] font-medium text-zinc-300">{restaurant.name}</span>
                <span className="font-mono text-[11px] text-teal-400">{restaurant.neighborhood}</span>
              </div>

              <h4 className="font-semibold text-white tracking-tight text-sm mb-1.5 line-clamp-1">
                {dish.name}
              </h4>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                {dish.description}
              </p>
            </div>

            {/* Rodapé com Preço e Super Nota */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-sm font-mono font-bold text-teal-300 block">
                  R$ {dish.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  ★ {restaurant.decayedRatingAverage.toFixed(2)} Super Nota
                </span>
              </div>

              <button
                onClick={() => onSelectRestaurantForReview(restaurant)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <span>Avaliar</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {searchResults.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/[0.02] border border-white/[0.06] rounded-3xl">
          <Utensils className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white mb-1">Nenhum prato encontrado</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Tente buscar por outro ingrediente ou alterar o filtro de categoria selecionado.
          </p>
        </div>
      )}
    </div>
  );
};
