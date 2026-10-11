'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Bookmark, Star, MapPin, 
  Sparkles, Search, X, CheckCircle2, Navigation, Award,
  Flame, Utensils, GraduationCap, ChevronRight, Send, ArrowUpRight
} from 'lucide-react';

import { NEIGHBORHOODS, INITIAL_FEED_POSTS, INITIAL_RESTAURANTS, FeedPost, RestaurantItem } from '../data/caraguaData';
import { DynamicIsland } from '../components/DynamicIsland';
import { FloatingJacquin } from '../components/FloatingJacquin';
import { AcademicPortalModal } from '../components/AcademicPortalModal';

export default function InstagramFoodFeedPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState<boolean>(false);
  
  // Interações de Feed do Instagram
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({ 'post-1': true, 'post-marujo-sororoca': true });
  const [likesCount, setLikesCount] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    INITIAL_FEED_POSTS.forEach(p => { counts[p.id] = p.likes; });
    return counts;
  });
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(350);

  // Modal / Drawer de Comentários & Avaliação (+50 pts)
  const [activeReviewPost, setActiveReviewPost] = useState<FeedPost | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewToast, setReviewToast] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // Lista viva de comentários por post
  const [postComments, setPostComments] = useState<Record<string, Array<{ author: string; text: string; rating: number; date: string }>>>(() => {
    const commentsMap: Record<string, Array<{ author: string; text: string; rating: number; date: string }>> = {};
    INITIAL_FEED_POSTS.forEach(p => {
      commentsMap[p.id] = p.commentsList || [
        { author: 'Comensal Caiçara', text: 'Prato sensacional, fresco e muito bem servido!', rating: 5, date: 'Hoje' }
      ];
    });
    return commentsMap;
  });

  const feedTopRef = useRef<HTMLDivElement>(null);

  // Filtros de Bairro e Categoria com scroll suave
  const handleSelectNeighborhood = (bairroId: string) => {
    setSelectedNeighborhood(bairroId);
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (feedTopRef.current) {
      feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Curtir com toggle e contador
  const handleToggleLike = (postId: string) => {
    const currentlyLiked = !!likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !currentlyLiked }));
    setLikesCount(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (currentlyLiked ? -1 : 1)
    }));
  };

  // Duplo clique na foto (Double-tap to like estilo Instagram)
  const handleDoubleTapPhoto = (postId: string) => {
    if (!likedPosts[postId]) {
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setLikesCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
    setHeartAnimPostId(postId);
    setTimeout(() => setHeartAnimPostId(null), 900);
  };

  const handleToggleSave = (postId: string) => {
    setSavedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post: FeedPost) => {
    if (navigator.share) {
      navigator.share({
        title: `${post.dishName} no ${post.restaurantName}`,
        text: `Olha esse prato que encontrei no Caraguá FoodTech: ${post.dishName} por R$ ${post.dishPrice.toFixed(2)} em ${post.neighborhood}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${post.dishName} - ${post.restaurantName} (Caraguatatuba)`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewPost || !reviewComment.trim()) return;

    const newComment = {
      author: 'Você (Comensal Gourmet)',
      text: reviewComment.trim(),
      rating: reviewScore,
      date: 'Agora mesmo'
    };

    setPostComments(prev => ({
      ...prev,
      [activeReviewPost.id]: [newComment, ...(prev[activeReviewPost.id] || [])]
    }));

    setUserCredits(c => c + 50);
    setReviewToast(true);
    setReviewComment('');
    setActiveReviewPost(null);
    setTimeout(() => setReviewToast(false), 3500);
  };

  // Filtragem dos Posts do Feed
  const filteredPosts = useMemo(() => {
    return INITIAL_FEED_POSTS.filter(post => {
      // 1. Filtro de Bairro
      if (selectedNeighborhood !== 'todos') {
        const cleanBairro = post.neighborhood.toLowerCase().replace(/\s+/g, '-');
        if (!cleanBairro.includes(selectedNeighborhood) && !selectedNeighborhood.includes(cleanBairro)) {
          return false;
        }
      }

      // 2. Filtro de Categoria
      if (selectedCategory !== 'todos') {
        if (selectedCategory === 'vegano' && !post.isVegan) return false;
        if (selectedCategory === 'promoção' && !post.isPromotion) return false;
        if (selectedCategory === 'premiados' && !post.caraguaGostoAward) return false;
        if (selectedCategory === 'camarão' && !post.dishName.toLowerCase().includes('camarão') && !post.caption.toLowerCase().includes('camarão')) return false;
        if (selectedCategory === 'peixe' && !post.dishName.toLowerCase().includes('peixe') && !post.dishName.toLowerCase().includes('badejo') && !post.dishName.toLowerCase().includes('sororoca')) return false;
        if (selectedCategory === 'pizza' && post.dishCategory !== 'Pizzas') return false;
        if (selectedCategory === 'burger' && post.dishCategory !== 'Lanches Artesanais') return false;
      }

      // 3. Filtro de Busca por Texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = post.dishName.toLowerCase().includes(q);
        const matchRest = post.restaurantName.toLowerCase().includes(q);
        const matchNeighborhood = post.neighborhood.toLowerCase().includes(q);
        const matchCaption = post.caption.toLowerCase().includes(q);
        if (!matchName && !matchRest && !matchNeighborhood && !matchCaption) return false;
      }

      return true;
    });
  }, [selectedNeighborhood, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      
      {/* DYNAMIC ISLAND DO CHEF JACQUIN (CENTRALIZADA NO TOPO) */}
      <DynamicIsland
        onSelectCategory={handleSelectCategory}
        onFilterNeighborhood={handleSelectNeighborhood}
      />

      {/* 1. HEADER COM COR SÓLIDA VERDE TROPICAL & NOME BEM GRANDE */}
      <header className="w-full bg-[#135136] text-white pt-24 pb-8 px-6 shadow-xl border-b-4 border-[#FFB703]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>O Feed Oficial de Caraguatatuba</span>
            </div>
            
            {/* NOME BEM GRANDE COMO PEDIDO PELA NAMORADA */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-none">
              CARAGUÁ <span className="text-[#FFB703]">FOODTECH</span>
            </h1>
            
            <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-xl">
              Descubra os pratos que dão água na boca na capital do Litoral Norte. Fotos reais, avaliações auditadas e curadoria do Chef Jacquin!
            </p>
          </div>

          {/* Cartão de Pontos do Usuário & Atalho Acadêmico */}
          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white text-[#135136] font-bold text-sm shadow-md border border-[#FFB703]">
              <span className="text-[#FFB703] text-lg">★</span>
              <span>{userCredits} Pontos Gourmet</span>
            </div>

            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="text-[11px] text-emerald-200 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-[#FFB703]" />
              <span>Portal Prof. Cristiano</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BARRA DE STORIES DOS 53 BAIRROS DE CARAGUATATUBA */}
      <section className="bg-white border-b border-stone-200/80 py-3.5 px-4 overflow-x-auto no-scrollbar shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#135136] flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#FFB703]" />
              53 Bairros Oficiais de Caraguatatuba
            </span>
            <span className="text-[10px] font-bold text-stone-500">
              Deslize para explorar →
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {NEIGHBORHOODS.map((bairro) => {
              const isSelected = selectedNeighborhood === bairro.id;
              return (
                <button
                  key={bairro.id}
                  onClick={() => handleSelectNeighborhood(bairro.id)}
                  title={`${bairro.name}: ${bairro.tagline}`}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                >
                  {/* Borda Gradiente estilo Stories do Instagram (Amarelo Solar, Verde Floresta e Azul Oceano) */}
                  <div className={`p-[2.5px] rounded-full transition-all duration-300 group-hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#FFB703] via-[#135136] to-[#023E8A] shadow-md ring-2 ring-[#FFB703]'
                      : 'bg-gradient-to-tr from-stone-200 to-stone-300 group-hover:from-[#FFB703] group-hover:to-[#135136]'
                  }`}>
                    <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full rounded-full bg-[#135136]/10 flex items-center justify-center font-black text-sm text-[#135136] group-hover:bg-[#FFB703]/20 transition-colors">
                        {bairro.emoji || '🌴'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight whitespace-nowrap max-w-[68px] truncate ${
                    isSelected ? 'text-[#135136] font-black' : 'text-stone-600'
                  }`}>
                    {bairro.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BARRA DE BUSCA E PÍLULAS DE CATEGORIAS ORGÂNICAS */}
      <section className="max-w-2xl mx-auto px-4 pt-6 pb-2 space-y-4">
        {/* Input de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#135136] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por prato, restaurante ou ingrediente... (ex: badejo, pernil, pizza)"
            className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border border-stone-300 text-sm font-medium text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:border-[#135136] focus:ring-4 focus:ring-[#135136]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pílulas de Filtro Rápido com Cores do Brasil (Amarelo, Verde e Azul) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'todos', label: '🍽️ Todos os Posts' },
            { id: 'premiados', label: '🏆 Caraguá a Gosto' },
            { id: 'peixe', label: '🐟 Peixes Frescos' },
            { id: 'camarão', label: '🦐 Camarões da Costa' },
            { id: 'pizza', label: '🍕 Pizzas a Lenha' },
            { id: 'burger', label: '🍔 Smash Burgers' },
            { id: 'vegano', label: '🌿 Vegano' },
            { id: 'promoção', label: '🔥 Promoções' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  isSelected
                    ? 'bg-[#FFB703] text-stone-900 font-extrabold shadow-md scale-105'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-[#135136] hover:text-[#135136]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. O FEED DO INSTAGRAM (CARDS ORGÂNICOS COM FOTO NO MEIO, PERFIL EM CIMA, LIKES E PREÇO EMBAIXO) */}
      <main ref={feedTopRef} className="max-w-xl mx-auto px-4 py-4 space-y-8 pb-32">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-[32px] bg-white border border-stone-200 shadow-sm space-y-3">
            <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-heading font-black text-xl text-stone-800">Nenhum post encontrado</h3>
            <p className="text-xs text-stone-500">Tente ajustar a busca ou os filtros para ver todos os pratos deliciosos de Caraguá.</p>
            <button
              onClick={() => { setSelectedNeighborhood('todos'); setSelectedCategory('todos'); setSearchQuery(''); }}
              className="px-5 py-2.5 rounded-full bg-[#135136] text-white text-xs font-bold hover:bg-[#1E6B47] transition-colors"
            >
              Ver Todo o Feed
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = !!likedPosts[post.id];
            const isSaved = !!savedPosts[post.id];
            const currentLikes = likesCount[post.id] || post.likes;
            const comments = postComments[post.id] || [];

            return (
              <article
                key={post.id}
                className="bg-white rounded-[32px] border border-stone-200/90 shadow-[0_12px_36px_-8px_rgba(19,81,54,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_18px_48px_-10px_rgba(19,81,54,0.12)]"
              >
                {/* 4.1 HEADER DO POST: PERFIL DO RESTAURANTE */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    {/* Avatar do Restaurante com Borda Gradiente */}
                    <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#FFB703] to-[#135136] shrink-0">
                      <img
                        src={post.restaurantAvatar || post.postImage}
                        alt={post.restaurantName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-heading font-black text-sm sm:text-base text-stone-900 tracking-tight">
                          {post.restaurantName}
                        </h2>
                        <span className="w-4 h-4 rounded-full bg-[#023E8A] text-white flex items-center justify-center text-[9px] font-bold" title="Verificado">
                          ✓
                        </span>
                      </div>
                      
                      {/* Localização e Bairro em Azul Marinho */}
                      <div className="flex items-center gap-1 text-[11px] text-[#023E8A] font-bold mt-0.5">
                        <MapPin className="w-3 h-3 text-[#023E8A]" />
                        <span>{post.neighborhood}, Caraguá</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-500 font-normal">{post.distanceKm} km da orla</span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Como Chegar / Ver Mapa */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.restaurantName + ' Caraguatatuba')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-stone-100 hover:bg-[#135136] hover:text-white text-stone-600 transition-colors"
                    title="Como Chegar"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                </div>

                {/* 4.2 IMAGEM DO PRATO COM DOUBLE-TAP & IN-IMAGE DISH TAGGING (XIAOHONGSHU/RED) */}
                <div 
                  className="relative aspect-square sm:aspect-[4/3] bg-stone-900 overflow-hidden cursor-pointer select-none group"
                  onDoubleClick={() => handleDoubleTapPhoto(post.id)}
                >
                  <img
                    src={post.postImage}
                    alt={post.dishName}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Coração Animado de Double-Tap (60fps Spring Gabriel Lamé) */}
                  <AnimatePresence>
                    {heartAnimPostId === post.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 0.95] }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                      >
                        <Heart className="w-24 h-24 text-[#FFB703] fill-[#FFB703] drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* IN-IMAGE DISH TAGGING (XIAOHONGSHU / RED BENCHMARK) */}
                  {post.dishTag && (
                    <div 
                      className="absolute z-20 group/tag cursor-pointer"
                      style={{ left: `${post.dishTag.x}%`, top: `${post.dishTag.y}%` }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute w-6 h-6 rounded-full bg-[#FFB703]/70 animate-ping" />
                        <span className="relative w-3.5 h-3.5 rounded-full bg-[#FFB703] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
                      </div>

                      {/* Tooltip Xiaohongshu com Nome, Preço e Destaque */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-95 group-hover/tag:opacity-100 transition-all pointer-events-auto">
                        <div className="px-3 py-1.5 rounded-2xl bg-stone-950/90 backdrop-blur-md text-white shadow-2xl border border-white/20 whitespace-nowrap text-left">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <span className="text-white font-black">{post.dishTag.label}</span>
                            <span className="text-[#FFB703] font-black">R$ {post.dishTag.price.toFixed(2)}</span>
                          </div>
                          <div className="text-[10px] text-amber-200 font-medium">{post.dishTag.highlight}</div>
                        </div>
                        <div className="w-2 h-2 bg-stone-950/90 rotate-45 mx-auto -mt-1 border-r border-b border-white/20" />
                      </div>
                    </div>
                  )}

                  {/* Badges Flutuantes Orgânicos na Imagem (Liquid Glass) */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {post.caraguaGostoAward && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#FFB703] text-stone-900 shadow-lg flex items-center gap-1 border border-white/40 backdrop-blur-md">
                        <Award className="w-3.5 h-3.5" />
                        {post.caraguaGostoAward}
                      </span>
                    )}
                    {post.isPromotion && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-600 text-white shadow-lg flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {post.promoBadge || 'Promoção'}
                      </span>
                    )}
                  </div>

                  {post.isVegan && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-[#135136] text-white shadow-lg border border-white/30 backdrop-blur-md">
                      🌿 100% Vegano
                    </div>
                  )}

                  {/* Timestamp Discreto */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                    {post.createdAt}
                  </div>
                </div>

                {/* 4.3 BARRA DE AÇÕES (LIKES, COMENTÁRIOS, SHARE, BOOKMARK) */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Botão de Curtir com Coração */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className="flex items-center gap-1.5 group focus:outline-none"
                      >
                        <Heart className={`w-6 h-6 transition-transform group-hover:scale-125 ${
                          isLiked ? 'text-rose-500 fill-rose-500' : 'text-stone-700 hover:text-stone-900'
                        }`} />
                        <span className="text-xs font-bold text-stone-800">{currentLikes}</span>
                      </button>

                      {/* Botão de Comentar */}
                      <button
                        onClick={() => setActiveReviewPost(post)}
                        className="flex items-center gap-1.5 group text-stone-700 hover:text-stone-900 focus:outline-none"
                      >
                        <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-125" />
                        <span className="text-xs font-bold">{comments.length}</span>
                      </button>

                      {/* Botão de Compartilhar */}
                      <button
                        onClick={() => handleShare(post)}
                        className="text-stone-700 hover:text-stone-900 transition-transform hover:scale-125 focus:outline-none"
                        title="Compartilhar"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Botão de Salvar / Bookmark */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className="text-stone-700 hover:text-stone-900 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Bookmark className={`w-6 h-6 ${isSaved ? 'text-[#FFB703] fill-[#FFB703]' : ''}`} />
                    </button>
                  </div>

                  {/* 4.4 PREÇO E SUPER NOTA EM ESTRELAS (DESTAQUE GASTRONÔMICO PEDIDO) */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F9FA] border border-stone-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Preço do Prato
                      </span>
                      <span className="font-heading font-black text-xl text-[#135136]">
                        R$ {post.dishPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Super Nota
                      </span>
                      <div className="flex items-center gap-1 justify-end font-heading font-black text-lg text-stone-900">
                        <Star className="w-4 h-4 text-[#FFB703] fill-[#FFB703]" />
                        <span>{post.superRating.toFixed(2)}</span>
                        <span className="text-[11px] text-stone-500 font-normal">({post.totalReviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* 4.5 LEGENDA DO POST (CAPTION) */}
                  <div className="space-y-1 text-xs text-stone-800 leading-relaxed">
                    <p>
                      <strong className="font-heading font-extrabold text-sm text-stone-900 mr-1.5">
                        {post.dishName}
                      </strong>
                      <span className="text-stone-600 font-medium">{post.caption}</span>
                    </p>
                  </div>

                  {/* 4.6 DICA EXCLUSIVA DO CHEF JACQUIN (BOX ORGÂNICO VERDE) */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                    <div className="w-9 h-10 shrink-0 drop-shadow-sm">
                      <img src="/jacquin-praiano.png" alt="Chef Jacquin" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs">
                      <span className="font-heading font-black text-[#135136] block">
                        Dica do Chef Jacquin:
                      </span>
                      <p className="text-stone-700 italic font-medium mt-0.5">
                        &quot;{post.jacquinTip}&quot;
                      </p>
                    </div>
                  </div>

                  {/* 4.7 COMENTÁRIOS E BOTÃO DE AVALIAR */}
                  {comments.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 text-xs text-stone-700 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 font-bold">
                        <span>Comentários recentes ({comments.length}):</span>
                        <button
                          onClick={() => setActiveReviewPost(post)}
                          className="text-[#135136] hover:underline"
                        >
                          Ver todos
                        </button>
                      </div>
                      
                      <p className="line-clamp-2">
                        <strong className="font-bold text-stone-900 mr-1">{comments[0].author}:</strong>
                        <span>&quot;{comments[0].text}&quot;</span>
                      </p>
                    </div>
                  )}

                  {/* Ação de Adicionar Avaliação (+50 pontos) */}
                  <button
                    onClick={() => setActiveReviewPost(post)}
                    className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-[#FFB703] hover:text-stone-900 text-stone-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Avaliar este prato e ganhar +50 pontos</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* 5. MASCÓTE FLUTUANTE JACQUIN PRAIANO */}
      <FloatingJacquin onSelectCategory={handleSelectCategory} />

      {/* 6. MODAL ORGÂNICO DE AVALIAÇÃO DO PRATO (+50 PONTOS) */}
      <AnimatePresence>
        {activeReviewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReviewPost(null)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] p-6 md:p-8 shadow-2xl border border-stone-200 space-y-5 z-10"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-heading font-black text-xl text-stone-900">
                    Avaliar {activeReviewPost.dishName}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {activeReviewPost.restaurantName} • Ganhe +50 Pontos Gourmet
                  </p>
                </div>
                <button
                  onClick={() => setActiveReviewPost(null)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-2">
                    Sua Nota para este Prato:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewScore(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110"
                      >
                        <span className={star <= reviewScore ? 'text-[#FFB703]' : 'text-stone-300'}>★</span>
                      </button>
                    ))}
                    <span className="font-bold text-sm text-stone-800 ml-2 font-mono">{reviewScore}.0 Estrelas</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-2">
                    O que você achou do sabor, ponto de cocção e apresentação?
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte como foi sua experiência: o peixe estava fresco? O camarão no ponto? A porção era generosa?"
                    className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#135136] focus:ring-2 focus:ring-[#135136]/10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs transition-colors shadow-lg shadow-[#135136]/20"
                >
                  Publicar Avaliação (+50 Pontos)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOASTS DE FEEDBACK */}
      <AnimatePresence>
        {reviewToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-[#135136] text-white shadow-2xl flex items-center gap-3 text-xs font-bold border border-[#FFB703]"
          >
            <CheckCircle2 className="w-5 h-5 text-[#FFB703]" />
            <div>
              <p>Avaliação publicada com sucesso!</p>
              <p className="text-emerald-200 font-normal">Você ganhou +50 Pontos Gourmet na sua carteira.</p>
            </div>
          </motion.div>
        )}

        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-[#023E8A] text-white shadow-2xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-5 h-5 text-[#FFB703]" />
            <p>Link copiado para a área de transferência!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FOOTER SÓLIDO COM ACESSO AO PROFESSOR CRISTIANO */}
      <footer className="bg-[#135136] text-white py-12 px-6 border-t-4 border-[#FFB703]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="font-heading font-black text-2xl text-white">Caraguá FoodTech</h4>
            <p className="text-xs text-emerald-200 max-w-md">
              O feed gastronômico definitivo de Caraguatatuba. Valorizando quiosques de praia, produtores locais e a cultura caiçara autêntica.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <button
              onClick={() => setIsAcademicModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-[#FFB703]" />
              <span>Portal Acadêmico / TCC Módulo (Prof. Cristiano)</span>
            </button>
            <span className="text-[10px] text-emerald-300 font-mono">
              Centro Universitário Módulo • ADS • Gabriel Rodrigues
            </span>
          </div>
        </div>
      </footer>

      {/* MODAL ACADÊMICO RESTRITO DO PROFESSOR CRISTIANO */}
      <AcademicPortalModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />
    </div>
  );
}
