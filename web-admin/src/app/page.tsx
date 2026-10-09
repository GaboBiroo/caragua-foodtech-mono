'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Search, Star, MapPin, Heart, Bookmark, 
  ArrowUpRight, Utensils, Flame, CheckCircle2, 
  MessageSquare, GraduationCap, X, ChevronRight, Compass,
  Phone, Share2, ThumbsUp, ShieldCheck
} from 'lucide-react';

import { NEIGHBORHOODS, INITIAL_RESTAURANTS, RestaurantItem, Dish } from '../data/caraguaData';
import { DynamicIsland } from '../components/DynamicIsland';
import { FloatingJacquin } from '../components/FloatingJacquin';
import { AcademicPortalModal } from '../components/AcademicPortalModal';

export default function MasterPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState<boolean>(false);
  const [likedDishIds, setLikedDishIds] = useState<Set<string>>(new Set(['post-1']));
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [userCredits, setUserCredits] = useState<number>(250);

  // Modal de Avaliação Rápida para o Cliente
  const [reviewingRestaurant, setReviewingRestaurant] = useState<RestaurantItem | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewToast, setReviewToast] = useState<boolean>(false);

  const feedRef = useRef<HTMLDivElement>(null);

  const handleSelectNeighborhood = (bairroId: string) => {
    setSelectedNeighborhood(bairroId);
    // Rolagem suave para o topo do feed, garantindo que o scroll nunca fique preso
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleLike = (id: string) => {
    setLikedDishIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRestaurant || !reviewComment.trim()) return;

    // Atualiza restaurante
    reviewingRestaurant.totalReviews += 1;
    reviewingRestaurant.reviews.unshift({
      id: `rev-${Date.now()}`,
      author: 'Cliente Local',
      rating: reviewScore,
      decayedRating: reviewScore,
      comment: reviewComment,
      date: 'Agora mesmo',
      daysAgo: 0,
      source: 'App',
      verifiedAudit: true,
    });

    setUserCredits(c => c + 50);
    setReviewToast(true);
    setReviewComment('');
    setReviewingRestaurant(null);
    setTimeout(() => setReviewToast(false), 3500);
  };

  // Filtragem dos Restaurantes por Bairro e Categoria
  const filteredRestaurants = useMemo(() => {
    return INITIAL_RESTAURANTS.filter(rest => {
      // Filtro de Bairro
      if (selectedNeighborhood !== 'todos') {
        const cleanBairro = rest.neighborhood.toLowerCase().replace(/\s+/g, '-');
        if (!cleanBairro.includes(selectedNeighborhood) && !selectedNeighborhood.includes(cleanBairro)) {
          return false;
        }
      }

      // Filtro de Categoria
      if (selectedCategory !== 'todos') {
        if (selectedCategory === 'vegano') {
          const hasVegan = rest.dishes.some(d => d.isVegan);
          if (!hasVegan) return false;
        } else if (selectedCategory === 'promoção') {
          const hasPromo = rest.dishes.some(d => d.isPromotion) || rest.activePromotion;
          if (!hasPromo) return false;
        } else if (selectedCategory === 'camarão') {
          const hasCamarao = rest.dishes.some(d => d.name.toLowerCase().includes('camarão'));
          if (!hasCamarao) return false;
        } else if (selectedCategory === 'peixe') {
          const hasPeixe = rest.dishes.some(d => d.category.toLowerCase().includes('peixe') || d.name.toLowerCase().includes('badejo') || d.name.toLowerCase().includes('pescada'));
          if (!hasPeixe) return false;
        }
      }

      // Filtro de Busca por Texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rest.name.toLowerCase().includes(q);
        const matchNeighborhood = rest.neighborhood.toLowerCase().includes(q);
        const matchDishes = rest.dishes.some(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
        if (!matchName && !matchNeighborhood && !matchDishes) return false;
      }

      return true;
    });
  }, [selectedNeighborhood, selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#1F1914] selection:bg-[#E63946]/20 selection:text-[#E63946]">
      
      {/* 1. DYNAMIC ISLAND NO TOPO COM O JACQUIN DENTRO */}
      <DynamicIsland
        onSelectCategory={handleSelectCategory}
        onFilterNeighborhood={handleSelectNeighborhood}
      />

      {/* 2. TOPO CHAMATIVO & CALOROSO (CORES QUENTES GASTRONÔMICAS) */}
      <header className="pt-20 pb-6 px-6 max-w-6xl mx-auto flex items-center justify-between border-b border-[#E8E2D8]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E63946] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#E63946]/20">
            CF
          </div>
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[#E63946] leading-none">
              CARAGUÁ FOODTECH
            </h1>
            <p className="text-xs text-[#2A9D8F] font-bold mt-0.5">
              O Guia Gastronômico da Costa Caiçara
            </p>
          </div>
        </div>

        {/* Indicador de Pontos do Cliente */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E2D8] shadow-sm text-xs font-semibold">
          <span className="text-amber-500 font-bold">★ {userCredits}</span>
          <span className="text-[#6B5E52] text-[11px]">Pontos</span>
        </div>
      </header>

      {/* 3. HERO APETITOSO COM CORES QUENTES (CHAMA PARA COMER!) */}
      <section className="px-6 pt-10 pb-12 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E63946]/10 border border-[#E63946]/20 text-xs text-[#E63946] font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
          <span>Curadoria Oficial do Chef Jacquin Praiano</span>
        </div>

        <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl text-[#1F1914] tracking-tight max-w-3xl mx-auto leading-[1.08]">
          A verdadeira comida de praia que dá água na boca.
        </h2>

        <p className="text-sm md:text-base text-[#6B5E52] max-w-2xl mx-auto leading-relaxed font-medium">
          Iscas de badejo sequinhas, camarões rosa gigantes da enseada, moquecas de tacho e os quiosques mais disputados de Caraguatatuba.
        </p>

        {/* Barra de Pesquisa Ampla e Clean */}
        <div className="max-w-xl mx-auto pt-3">
          <div className="relative">
            <Search className="w-5 h-5 text-[#E63946] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você quer saborear hoje? Ex: badejo, risoto, moqueca..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white border-2 border-[#E8E2D8] text-sm text-[#1F1914] placeholder-[#6B5E52] shadow-[0_4px_20px_-2px_rgba(31,25,20,0.06)] focus:outline-none focus:border-[#E63946] focus:ring-4 focus:ring-[#E63946]/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#6B5E52] hover:text-[#1F1914]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categorias Rápidas em Pílulas Quentes */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'todos', label: '🍽️ Todos os Pratos' },
            { id: 'camarão', label: '🦐 Camarão da Enseada' },
            { id: 'peixe', label: '🐟 Peixe Fresco do Dia' },
            { id: 'vegano', label: '🌿 100% Vegano' },
            { id: 'promoção', label: '🔥 Promoções do Dia' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/25'
                  : 'bg-white text-[#6B5E52] border border-[#E8E2D8] hover:border-[#E63946] hover:text-[#E63946]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. SELETOR DE BAIRROS / POLOS DA COSTA (LONGPAGE ANCHOR) */}
      <section ref={feedRef} className="px-6 py-6 max-w-6xl mx-auto border-t border-[#E8E2D8]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F]">
              Polos Gastronômicos de Caraguá
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-[#1F1914]">
              {selectedNeighborhood === 'todos' 
                ? 'Todos os Quiosques & Restaurantes' 
                : NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)?.name}
            </h3>
          </div>
          <span className="text-xs text-[#6B5E52] font-bold">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'lugar' : 'lugares'}
          </span>
        </div>

        {/* Pílulas de Bairro */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {NEIGHBORHOODS.map((n) => {
            const isSelected = selectedNeighborhood === n.id;
            return (
              <button
                key={n.id}
                onClick={() => handleSelectNeighborhood(n.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#2A9D8F] text-white shadow-md shadow-[#2A9D8F]/25'
                    : 'bg-white text-[#6B5E52] border border-[#E8E2D8] hover:text-[#2A9D8F] hover:border-[#2A9D8F]'
                }`}
              >
                {n.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. FEED LONGPAGE (CARDS ARREDONDADOS E APETITOSOS - SEM QUADRADOS DUROS) */}
      <main className="px-6 pb-28 max-w-6xl mx-auto space-y-10">
        {filteredRestaurants.length === 0 ? (
          <div className="p-12 text-center rounded-[32px] bg-white border border-[#E8E2D8] space-y-3">
            <Utensils className="w-10 h-10 text-[#6B5E52] mx-auto opacity-40" />
            <h4 className="font-heading font-bold text-lg text-[#1F1914]">Nenhum prato encontrado</h4>
            <p className="text-xs text-[#6B5E52]">Tente redefinir os filtros para ver todas as delícias de Caraguá.</p>
            <button
              onClick={() => { setSelectedNeighborhood('todos'); setSelectedCategory('todos'); setSearchQuery(''); }}
              className="px-5 py-2.5 rounded-full bg-[#E63946] text-white text-xs font-bold shadow-sm"
            >
              Ver Tudo
            </button>
          </div>
        ) : (
          filteredRestaurants.map((rest) => (
            <article
              key={rest.id}
              className="food-card overflow-hidden"
            >
              {/* Header do Restaurante */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E2D8]/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#1E6B62] text-white flex items-center justify-center font-heading font-black text-lg shrink-0 shadow-md">
                    {rest.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-extrabold text-xl md:text-2xl text-[#1F1914] tracking-tight">
                        {rest.name}
                      </h3>
                      {rest.isLocalProducer && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9C46A]/20 text-[#B7791F] border border-[#E9C46A]">
                          Produtor Caiçara
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6B5E52] mt-1 font-medium">
                      <span className="flex items-center gap-1 font-semibold text-[#2A9D8F]">
                        <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        {rest.neighborhood}
                      </span>
                      <span>•</span>
                      <span>{rest.distanceKm} km da orla</span>
                      <span>•</span>
                      <span>{rest.cuisineTypes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Avaliação e Ação */}
                <div className="flex items-center gap-4 self-start md:self-auto">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-heading font-black text-xl text-[#1F1914]">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span>{rest.decayedRatingAverage.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-[#6B5E52] font-semibold block">
                      {rest.totalReviews} avaliações
                    </span>
                  </div>

                  <button
                    onClick={() => setReviewingRestaurant(rest)}
                    className="px-4 py-2.5 rounded-full bg-[#E63946] hover:bg-[#D90429] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Avaliar (+50 pts)</span>
                  </button>
                </div>
              </div>

              {/* Dica Gostosa do Chef Jacquin (Sem jargões técnicos) */}
              <div className="px-6 md:px-8 py-3.5 bg-[#FAF7F2] border-b border-[#E8E2D8] flex items-center gap-3 text-xs text-[#1F1914]">
                <div className="w-8 h-9 shrink-0 drop-shadow-sm">
                  <img src="/jacquin-praiano.png" alt="Chef Jacquin" className="w-full h-full object-contain" />
                </div>
                <p className="font-medium text-[#1F1914] leading-relaxed">
                  <b className="text-[#E63946]">Dica do Chef Jacquin:</b> &quot;{rest.regionalLLMInsight}&quot;
                </p>
              </div>

              {/* Grid de Pratos do Restaurante com Fotos Grandes e Apetitosas */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rest.dishes.map((dish) => {
                    const isLiked = likedDishIds.has(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="rounded-3xl border border-[#E8E2D8] p-4 flex flex-col justify-between gap-4 hover:border-[#2A9D8F]/60 transition-all bg-[#FAF7F2]/50 hover:bg-white"
                      >
                        <div className="space-y-3">
                          {/* Imagem do Prato Bem Grande */}
                          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#E8E2D8]">
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {dish.isPromotion && (
                              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#E63946] text-white flex items-center gap-1 shadow-md">
                                <Flame className="w-3.5 h-3.5" />
                                {dish.promoDiscount || 'Promoção'}
                              </div>
                            )}
                            {dish.isVegan && (
                              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#2A9D8F] text-white shadow-md">
                                🌿 100% Vegano
                              </div>
                            )}
                          </div>

                          {/* Nome e Preço */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-base md:text-lg text-[#1F1914]">
                                {dish.name}
                              </h4>
                              <span className="font-heading font-black text-lg text-[#E63946] shrink-0">
                                R$ {dish.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B5E52] mt-1 leading-relaxed font-medium">
                              {dish.description}
                            </p>
                          </div>
                        </div>

                        {/* Ações do Prato */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D8]">
                          <button
                            onClick={() => handleToggleLike(dish.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              isLiked 
                                ? 'bg-[#FFF1F2] text-[#E63946] border border-[#FECDD3]' 
                                : 'text-[#6B5E52] hover:text-[#1F1914] bg-white border border-[#E8E2D8]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#E63946]' : ''}`} />
                            <span>{isLiked ? 'Gostei' : 'Curtir'}</span>
                          </button>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rest.name + ' Caraguatatuba')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#2A9D8F] hover:text-[#1E6B62] flex items-center gap-1 transition-colors"
                          >
                            <span>Como Chegar</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comentário Real de Cliente */}
                {rest.reviews && rest.reviews.length > 0 && (
                  <div className="pt-4 border-t border-[#E8E2D8] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B5E52] block">
                      O que diz quem comeu aqui:
                    </span>
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs text-[#1F1914] flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#E63946] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {rest.reviews[0].author[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1F1914]">{rest.reviews[0].author}</span>
                          <span className="text-amber-500 font-bold">★ {rest.reviews[0].rating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#6B5E52]">• {rest.reviews[0].date}</span>
                        </div>
                        <p className="mt-1 leading-relaxed italic text-[#6B5E52] font-medium">
                          &quot;{rest.reviews[0].comment}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </main>

      {/* 6. MASCÓTE FLUTUANTE JACQUIN NO CANTO INFERIOR DIREITO COM BALÃO DE FALA */}
      <FloatingJacquin onSelectCategory={handleSelectCategory} />

      {/* 7. MODAL DE AVALIAÇÃO DO CLIENTE (+50 PONTOS) */}
      <AnimatePresence>
        {reviewingRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingRestaurant(null)}
              className="fixed inset-0 bg-[#1F1914]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] p-6 md:p-8 shadow-2xl border border-[#E8E2D8] space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-[#1F1914]">
                    Avaliar {reviewingRestaurant.name}
                  </h3>
                  <p className="text-xs text-[#6B5E52]">Ganhe +50 Pontos Gourmet pela sua opinião honesta.</p>
                </div>
                <button
                  onClick={() => setReviewingRestaurant(null)}
                  className="p-1.5 rounded-full text-[#6B5E52] hover:text-[#1F1914]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F1914] mb-2">
                    Sua Nota para a Comida:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewScore(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110"
                      >
                        <span className={star <= reviewScore ? 'text-amber-500' : 'text-zinc-300'}>★</span>
                      </button>
                    ))}
                    <span className="font-bold text-sm text-[#1F1914] ml-2 font-mono">{reviewScore}.0 Estrelas</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1F1914] mb-2">
                    O que achou do prato e do atendimento?
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="O peixe estava crocante? O camarão fresco? Conte a sua experiência..."
                    className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs text-[#1F1914] placeholder-[#6B5E52] focus:outline-none focus:bg-white focus:border-[#E63946]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#E63946] text-white font-bold text-xs hover:bg-[#D90429] transition-colors shadow-md shadow-[#E63946]/20"
                >
                  Enviar Avaliação (+50 Pontos)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST DE SUCESSO */}
      <AnimatePresence>
        {reviewToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-[#2A9D8F] text-white shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <p>Obrigado pela sua avaliação!</p>
              <p className="text-[#FAF7F2] font-normal">Você ganhou +50 Pontos Gourmet na sua carteira.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. FOOTER ELEGANTE COM BOTÃO DO PROFESSOR CRISTIANO */}
      <footer className="bg-[#1F1914] text-[#FAF7F2] py-14 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="font-heading font-black text-2xl text-[#E63946]">Caraguá FoodTech</h4>
            <p className="text-xs text-[#C9DDD8] max-w-md leading-relaxed font-medium">
              Plataforma dedicada à gastronomia autêntica de Caraguatatuba. Valorizando quiosques locais, pescadores caiçaras e a melhor comida litorânea.
            </p>
          </div>

          {/* Botão de Acesso Exclusivo para o Professor Cristiano */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-[#E9C46A]" />
              <span>Portal Acadêmico / TCC Módulo (Prof. Cristiano)</span>
            </button>
            <span className="text-[10px] text-[#C9DDD8] font-mono">
              Centro Universitário Módulo • ADS • Gabriel Rodrigues
            </span>
          </div>
        </div>
      </footer>

      {/* 9. MODAL ACADÊMICO RESTRITO DO PROF. CRISTIANO */}
      <AcademicPortalModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
}
