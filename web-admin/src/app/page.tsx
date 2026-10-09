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
    // Rolagem suave para o topo do feed, eliminando o problema do scroll preso embaixo
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

  const handleToggleSave = (id: string) => {
    setSavedPostIds(prev => {
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

  // Filtragem dos Restaurantes por Bairro e Busca
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
    <div className="relative min-h-screen bg-[#FBF9F5] text-[#18181B] selection:bg-[#E0533C]/20 selection:text-[#E0533C]">
      
      {/* 1. DYNAMIC ISLAND VIVA DO COUCOU COM CHEF JACQUIN DENTRO */}
      <DynamicIsland
        onSelectCategory={handleSelectCategory}
        onFilterNeighborhood={handleSelectNeighborhood}
      />

      {/* 2. TOPO EDITORIAL / BRANDING DISCRETO */}
      <header className="pt-24 pb-8 px-6 max-w-6xl mx-auto flex items-center justify-between border-b border-[#EBE6DD]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#113228] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            CF
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-[#113228] leading-none">
              Caraguá FoodTech
            </h1>
            <p className="text-[11px] text-[#71717A] mt-1">
              Guia Gastronômico da Costa • Litoral Norte de SP
            </p>
          </div>
        </div>

        {/* Indicador de Créditos do Consumidor */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EBE6DD] shadow-sm text-xs">
          <span className="text-amber-500 font-bold">★ {userCredits}</span>
          <span className="text-[#71717A] text-[11px]">Pontos Gourmet</span>
        </div>
      </header>

      {/* 3. HERO EDITORIAL LONGPAGE: A ALMA GASTRONÔMICA DE CARAGUATATUBA */}
      <section className="px-6 py-12 md:py-16 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE6DD] text-xs text-[#113228] shadow-sm font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#E0533C]" />
          <span>Curadoria Pessoal do Chef Jacquin Praiano</span>
        </div>

        <h2 className="font-serif italic text-4xl sm:text-6xl md:text-7xl text-[#113228] tracking-tight max-w-4xl mx-auto leading-[1.08]">
          Onde a brisa do mar encontra o melhor sabor caiçara.
        </h2>

        <p className="text-sm md:text-base text-[#52525B] max-w-2xl mx-auto leading-relaxed">
          Descubra os quiosques mais disputados da orla, os pescados frescos que chegam nos barcos da manhã e os restaurantes premiados de Caraguá.
        </p>

        {/* Barra de Pesquisa Ampla e Clean */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative">
            <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você quer comer hoje? Ex: badejo, risoto de camarão, moqueca..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-[#EBE6DD] text-sm text-[#18181B] placeholder-[#71717A] shadow-[0_4px_20px_-2px_rgba(24,23,20,0.04)] focus:outline-none focus:border-[#113228] focus:ring-4 focus:ring-[#113228]/5 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#71717A] hover:text-[#18181B]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categorias Rápidas em Pílulas */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'todos', label: 'Todos os Pratos' },
            { id: 'camarão', label: '🦐 Camarão da Enseada' },
            { id: 'peixe', label: '🐟 Peixe Fresco do Dia' },
            { id: 'vegano', label: '🌿 100% Vegano' },
            { id: 'promoção', label: '🔥 Promoções Ativas' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#113228] text-white shadow-sm'
                  : 'bg-white text-[#52525B] border border-[#EBE6DD] hover:border-[#D4D4D8] hover:text-[#18181B]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 4. SELETOR DE BAIRROS / POLOS DA COSTA (LONGPAGE ANCHOR) */}
      <section ref={feedRef} className="px-6 py-6 max-w-6xl mx-auto border-t border-[#EBE6DD]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#E0533C] font-bold">
              Polos da Orla de Caraguá
            </span>
            <h3 className="text-xl font-bold text-[#113228]">
              {selectedNeighborhood === 'todos' 
                ? 'Todos os Polos de Caraguatatuba' 
                : NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)?.name}
            </h3>
          </div>
          <span className="text-xs text-[#71717A] font-mono">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
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
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#113228] text-white shadow-md'
                    : 'bg-white text-[#52525B] border border-[#EBE6DD] hover:text-[#18181B] hover:border-[#D4D4D8]'
                }`}
              >
                {n.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. FEED LONGPAGE DE RESTAURANTES (CARDS AMPLOS EDITORIAL COUCOU) */}
      <main className="px-6 pb-20 max-w-6xl mx-auto space-y-10">
        {filteredRestaurants.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#EBE6DD] space-y-3">
            <Utensils className="w-10 h-10 text-[#71717A] mx-auto opacity-40" />
            <h4 className="font-bold text-base text-[#18181B]">Nenhum prato encontrado</h4>
            <p className="text-xs text-[#52525B]">Tente redefinir os filtros de busca para ver todos os pratos.</p>
            <button
              onClick={() => { setSelectedNeighborhood('todos'); setSelectedCategory('todos'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-[#113228] text-white text-xs font-bold"
            >
              Ver Tudo
            </button>
          </div>
        ) : (
          filteredRestaurants.map((rest, idx) => (
            <article
              key={rest.id}
              className="bg-white rounded-[32px] border border-[#EBE6DD] shadow-[0_4px_24px_-4px_rgba(24,23,20,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_-4px_rgba(24,23,20,0.09)]"
            >
              {/* Header do Restaurante */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE6DD]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#113228] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                    {rest.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg md:text-xl text-[#18181B] tracking-tight">
                        {rest.name}
                      </h3>
                      {rest.isLocalProducer && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#D49B35] border border-[#FDE68A]">
                          Produtor Caiçara
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#52525B] mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                        {rest.neighborhood}
                      </span>
                      <span>•</span>
                      <span>{rest.distanceKm} km daqui</span>
                      <span>•</span>
                      <span className="text-[#71717A]">{rest.cuisineTypes.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Avaliação do Restaurante */}
                <div className="flex items-center gap-4 self-start md:self-auto">
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-bold text-lg text-[#18181B]">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{rest.decayedRatingAverage.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-[#71717A] block">
                      {rest.totalReviews} avaliações
                    </span>
                  </div>

                  <button
                    onClick={() => setReviewingRestaurant(rest)}
                    className="px-4 py-2.5 rounded-2xl bg-[#113228] hover:bg-[#1B4B3D] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Avaliar (+50 pts)</span>
                  </button>
                </div>
              </div>

              {/* Dica de Especialista do Chef Jacquin (Sem jargões de TI!) */}
              <div className="px-6 md:px-8 py-3.5 bg-[#FAF6F0] border-b border-[#EBE6DD] flex items-center gap-3 text-xs text-[#113228]">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#38A398] shrink-0 border border-[#D49B35]">
                  <img src="/jacquin-praiano.png" alt="Chef Jacquin" className="w-full h-full object-cover scale-110" />
                </div>
                <p className="italic">
                  <b>Dica do Chef Jacquin:</b> &quot;{rest.regionalLLMInsight}&quot;
                </p>
              </div>

              {/* Grid de Pratos Assinados pelo Restaurante */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rest.dishes.map((dish) => {
                    const isLiked = likedDishIds.has(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="rounded-2xl border border-[#EBE6DD] p-4 flex flex-col justify-between gap-4 hover:border-[#113228]/40 transition-all bg-[#FAF9F5]/40"
                      >
                        <div className="space-y-3">
                          {/* Imagem do Prato com Zoom Suave */}
                          <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#EBE6DD]">
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            {dish.isPromotion && (
                              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E0533C] text-white flex items-center gap-1 shadow-sm">
                                <Flame className="w-3 h-3" />
                                {dish.promoDiscount || 'Promoção do Dia'}
                              </div>
                            )}
                            {dish.isVegan && (
                              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-sm">
                                🌿 100% Vegano
                              </div>
                            )}
                          </div>

                          {/* Nome e Descrição */}
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-base text-[#18181B]">
                                {dish.name}
                              </h4>
                              <span className="font-bold text-base text-[#113228]">
                                R$ {dish.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                              {dish.description}
                            </p>
                          </div>
                        </div>

                        {/* Botões do Prato: Curtir e Pedir */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#EBE6DD]">
                          <button
                            onClick={() => handleToggleLike(dish.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isLiked 
                                ? 'bg-[#FFF1F2] text-[#E0533C]' 
                                : 'text-[#71717A] hover:text-[#18181B] bg-white border border-[#EBE6DD]'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#E0533C]' : ''}`} />
                            <span>{isLiked ? 'Gostei' : 'Curtir'}</span>
                          </button>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rest.name + ' Caraguatatuba')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#113228] hover:text-[#E0533C] flex items-center gap-1 transition-colors"
                          >
                            <span>Como Chegar</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comentários Recentes de Clientes */}
                {rest.reviews && rest.reviews.length > 0 && (
                  <div className="pt-4 border-t border-[#EBE6DD] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] block">
                      O que dizem os clientes:
                    </span>
                    <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EBE6DD] text-xs text-[#52525B] flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#113228] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {rest.reviews[0].author[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#18181B]">{rest.reviews[0].author}</span>
                          <span className="text-amber-500 font-bold">★ {rest.reviews[0].rating.toFixed(1)}</span>
                          <span className="text-[10px] text-[#71717A]">• {rest.reviews[0].date}</span>
                        </div>
                        <p className="mt-1 leading-relaxed italic">
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

      {/* 6. MODAL DE AVALIAÇÃO DO CLIENTE (+50 CRÉDITOS) */}
      <AnimatePresence>
        {reviewingRestaurant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingRestaurant(null)}
              className="fixed inset-0 bg-[#0A1612]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-[#EBE6DD] space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-[#EBE6DD] pb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#18181B]">
                    Avaliar {reviewingRestaurant.name}
                  </h3>
                  <p className="text-xs text-[#52525B]">Ganhe +50 Pontos Gourmet pela sua opinião sincera.</p>
                </div>
                <button
                  onClick={() => setReviewingRestaurant(null)}
                  className="p-1.5 rounded-full text-[#71717A] hover:text-[#18181B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#18181B] mb-2">
                    Sua Nota Geral:
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
                    <span className="font-bold text-sm text-[#18181B] ml-2 font-mono">{reviewScore}.0 Estrelas</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#18181B] mb-2">
                    Seu Comentário sobre a Comida & Atendimento:
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="O peixe estava fresquinho? O atendimento do quiosque foi rápido? Conte sua experiência..."
                    className="w-full p-4 rounded-2xl bg-[#FAF6F0] border border-[#EBE6DD] text-xs text-[#18181B] placeholder-[#71717A] focus:outline-none focus:bg-white focus:border-[#113228]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#113228] text-white font-bold text-xs hover:bg-[#1B4B3D] transition-colors shadow-md"
                >
                  Enviar Avaliação (+50 Pontos Gourmet)
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
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#113228] text-white shadow-2xl flex items-center gap-3 text-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold">Obrigado pela avaliação!</p>
              <p className="text-[#9DB8B1]">Você ganhou +50 Pontos Gourmet na sua carteira.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FOOTER EDITORIAL COM ÁREA DISCRETA DO PROFESSOR CRISTIANO */}
      <footer className="bg-[#113228] text-[#FBF9F5] py-14 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="font-serif italic text-2xl text-white">Caraguá FoodTech</h4>
            <p className="text-xs text-[#9DB8B1] max-w-md leading-relaxed">
              Plataforma dedicada à valorização gastronômica e cultural de Caraguatatuba. Todos os restaurantes e fotos são baseados na culinária da orla e comunidades caiçaras.
            </p>
          </div>

          {/* Botão de Acesso Exclusivo para o Professor Cristiano */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-[#D49B35]" />
              <span>Portal Acadêmico / TCC Módulo (Prof. Cristiano)</span>
            </button>
            <span className="text-[10px] text-[#9DB8B1] font-mono">
              Centro Universitário Módulo • ADS • Gabriel Rodrigues
            </span>
          </div>
        </div>
      </footer>

      {/* 8. MODAL ACADÊMICO EXCLUSIVO DO PROF. CRISTIANO (LOGIN: CristianoBestProf | SENHA: Nota10) */}
      <AcademicPortalModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
}
