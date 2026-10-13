'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Bookmark, Star, MapPin, 
  Sparkles, Search, X, CheckCircle2, Navigation, Award,
  Flame, Utensils, GraduationCap, ChevronRight, Send, ArrowUpRight
} from 'lucide-react';

import { NEIGHBORHOODS, INITIAL_FEED_POSTS, INITIAL_RESTAURANTS, FeedPost, RestaurantItem } from '../data/caraguaData';
import { Navbar } from '../components/Navbar';
import { DynamicIsland } from '../components/DynamicIsland';
import { FloatingJacquin } from '../components/FloatingJacquin';
import { AcademicPortalModal } from '../components/AcademicPortalModal';
interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  scale: number;
  size: number;
  color: string;
  isStar?: boolean;
}

const GOLDEN_PARTICLES: ParticleConfig[] = [
  { id: 1, x: 0, y: -90, scale: 1.3, size: 12, color: '#FFB703', isStar: true },
  { id: 2, x: 60, y: -70, scale: 0.9, size: 8, color: '#FCD34D' },
  { id: 3, x: 90, y: -20, scale: 1.2, size: 10, color: '#F59E0B', isStar: true },
  { id: 4, x: 80, y: 40, scale: 0.8, size: 7, color: '#FEF3C7' },
  { id: 5, x: 55, y: 80, scale: 1.3, size: 11, color: '#FFB703', isStar: true },
  { id: 6, x: 0, y: 95, scale: 0.9, size: 8, color: '#FCD34D' },
  { id: 7, x: -55, y: 80, scale: 1.2, size: 10, color: '#F59E0B', isStar: true },
  { id: 8, x: -80, y: 40, scale: 0.8, size: 7, color: '#FEF3C7' },
  { id: 9, x: -90, y: -20, scale: 1.3, size: 11, color: '#FFB703', isStar: true },
  { id: 10, x: -60, y: -70, scale: 0.9, size: 8, color: '#FCD34D' },
  { id: 11, x: 35, y: -45, scale: 0.7, size: 6, color: '#FFFFFF' },
  { id: 12, x: -35, y: -45, scale: 0.7, size: 6, color: '#FFFFFF' },
  { id: 13, x: 45, y: 35, scale: 0.6, size: 6, color: '#FFB703' },
  { id: 14, x: -45, y: 35, scale: 0.6, size: 6, color: '#FFB703' },
];

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
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({
    'post-centro-azul-marinho': true,
    'post-cocanha-mexilhoes': true,
  });
  const [saveToast, setSaveToast] = useState<{ show: boolean; isAdded: boolean; dishName: string } | null>(null);
  const [heartAnimPostId, setHeartAnimPostId] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(350);

  // Cédula Oficial do Festival Caraguá a Gosto (5 Critérios Auditados - Eixo 3.2 Dossiê Histórico)
  const [activeReviewPost, setActiveReviewPost] = useState<FeedPost | null>(null);
  const [flavorScore, setFlavorScore] = useState<number>(5); // 1. Sabor & Tempero Caiçara (Peso 35%)
  const [presentationScore, setPresentationScore] = useState<number>(5); // 2. Apresentação & Cocção (Peso 20%)
  const [originalityScore, setOriginalityScore] = useState<number>(5); // 3. Originalidade & Insumos Locais (Peso 15%)
  const [serviceScore, setServiceScore] = useState<number>(5); // 4. Atendimento & Equipe (Peso 15%)
  const [ambianceScore, setAmbianceScore] = useState<number>(5); // 5. Ambiente & Higiene (Peso 15%)
  const [tableVoucher, setTableVoucher] = useState<string>('');
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

  // Contagem de pratos salvos para a pílula do roteiro
  const savedCount = useMemo(() => Object.values(savedPosts).filter(Boolean).length, [savedPosts]);

  // Cálculo da Super Nota Ponderada da Cédula Oficial Caraguá a Gosto
  const calculatedWeightedScore = useMemo(() => {
    const score = flavorScore * 0.35 + presentationScore * 0.20 + originalityScore * 0.15 + serviceScore * 0.15 + ambianceScore * 0.15;
    return score.toFixed(2);
  }, [flavorScore, presentationScore, originalityScore, serviceScore, ambianceScore]);

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

  // Duplo clique na foto (Double-tap to like estilo Instagram com partículas solares)
  const handleDoubleTapPhoto = (postId: string) => {
    if (!likedPosts[postId]) {
      setLikedPosts(prev => ({ ...prev, [postId]: true }));
      setLikesCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
    setHeartAnimPostId(postId);
    setTimeout(() => setHeartAnimPostId(null), 900);
  };

  // Salvar no Roteiro Gastronômico de Caraguá (Coleção)
  const handleToggleSave = (post: FeedPost) => {
    const willBeSaved = !savedPosts[post.id];
    setSavedPosts(prev => ({ ...prev, [post.id]: willBeSaved }));
    setSaveToast({
      show: true,
      isAdded: willBeSaved,
      dishName: post.dishName
    });
    setTimeout(() => setSaveToast(null), 3500);
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

  // Emissão de Cédula Oficial Auditada do Festival Caraguá a Gosto
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewPost || !reviewComment.trim()) return;

    const voucherTag = tableVoucher.trim() ? ` [Comprovante: ${tableVoucher.trim()}]` : '';
    const criteriaSummary = `[Critérios: Sabor ${flavorScore}★ | Cocção ${presentationScore}★ | Insumos ${originalityScore}★ | Atendimento ${serviceScore}★ | Ambiente ${ambianceScore}★]`;

    const newComment = {
      author: 'Você (Comensal Auditado Caraguá a Gosto)',
      text: `${reviewComment.trim()} ${criteriaSummary}${voucherTag}`,
      rating: parseFloat(calculatedWeightedScore),
      date: 'Agora mesmo'
    };

    setPostComments(prev => ({
      ...prev,
      [activeReviewPost.id]: [newComment, ...(prev[activeReviewPost.id] || [])]
    }));

    setUserCredits(c => c + 50);
    setReviewToast(true);
    setReviewComment('');
    setTableVoucher('');
    setActiveReviewPost(null);
    setTimeout(() => setReviewToast(false), 4000);
  };

  // Filtragem dos Posts do Feed com Normalização Diacrítica
  const filteredPosts = useMemo(() => {
    const normalize = (txt: string) => txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return INITIAL_FEED_POSTS.filter(post => {
      // 0. Filtro Meus Salvos
      if (selectedCategory === 'salvos' && !savedPosts[post.id]) {
        return false;
      }

      // 1. Filtro de Bairro
      if (selectedNeighborhood !== 'todos') {
        const cleanBairro = normalize(post.neighborhood).replace(/\s+/g, '-');
        const cleanSelected = normalize(selectedNeighborhood);
        if (!cleanBairro.includes(cleanSelected) && !cleanSelected.includes(cleanBairro)) {
          return false;
        }
      }

      // 2. Filtro de Categoria
      if (selectedCategory !== 'todos' && selectedCategory !== 'salvos') {
        if (selectedCategory === 'vegano' && !post.isVegan) return false;
        if (selectedCategory === 'promoção' && !post.isPromotion) return false;
        if (selectedCategory === 'premiados' && !post.caraguaGostoAward) return false;
        if (selectedCategory === 'camarão') {
          const hasCamarao = normalize(post.dishName).includes('camarao') || normalize(post.caption).includes('camarao');
          if (!hasCamarao) return false;
        }
        if (selectedCategory === 'peixe') {
          const hasPeixe = normalize(post.dishName).includes('peixe') || normalize(post.dishName).includes('badejo') || normalize(post.dishName).includes('sororoca') || normalize(post.dishName).includes('polvo') || normalize(post.dishName).includes('abadejo');
          if (!hasPeixe) return false;
        }
        if (selectedCategory === 'maricultura') {
          const hasMussels = normalize(post.dishName).includes('mexilhao') || normalize(post.caption).includes('cocanha') || normalize(post.caption).includes('amapec');
          if (!hasMussels) return false;
        }
        if (selectedCategory === 'pizza' && post.dishCategory !== 'Pizzas') return false;
        if (selectedCategory === 'burger' && post.dishCategory !== 'Lanches Artesanais') return false;
      }

      // 3. Filtro de Busca por Texto com Normalização Diacrítica
      if (searchQuery.trim()) {
        const q = normalize(searchQuery);
        const matchName = normalize(post.dishName).includes(q);
        const matchRest = normalize(post.restaurantName).includes(q);
        const matchNeighborhood = normalize(post.neighborhood).includes(q);
        const matchCaption = normalize(post.caption).includes(q);
        const matchTip = normalize(post.jacquinTip || '').includes(q);
        const matchCategory = normalize(post.dishCategory || '').includes(q);
        const matchTag = post.dishTag ? (normalize(post.dishTag.label).includes(q) || normalize(post.dishTag.highlight).includes(q)) : false;
        if (!matchName && !matchRest && !matchNeighborhood && !matchCaption && !matchTip && !matchCategory && !matchTag) return false;
      }

      return true;
    });
  }, [selectedNeighborhood, selectedCategory, searchQuery, savedPosts]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      
      {/* NAVBAR GLOBAL INTEGRADA (ENTREGA S06) */}
      <Navbar onOpenAcademicModal={() => setIsAcademicModalOpen(true)} />

      {/* DYNAMIC ISLAND DO CHEF JACQUIN (CENTRALIZADA LOGO ABAIXO DA NAVBAR) */}
      <DynamicIsland
        onSelectCategory={handleSelectCategory}
        onFilterNeighborhood={handleSelectNeighborhood}
      />

      {/* 1. HEADER COM COR SÓLIDA VERDE TROPICAL & NOME BEM GRANDE */}
      <header className="w-full bg-[#135136] text-white pt-20 pb-8 px-6 shadow-xl border-b-4 border-[#FFB703]">
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

        {/* Chips de Sugestão de Busca por Insumos Históricos (Dossiê Histórico) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] text-stone-500 pt-0.5">
          <span className="font-bold text-stone-400 shrink-0">Sugestões:</span>
          {[
            { label: '🦪 Mexilhões da Cocanha', query: 'Cocanha' },
            { label: '🏺 Azul-Marinho', query: 'Azul-Marinho' },
            { label: '🐙 Polvo Grelhado', query: 'Polvo' },
            { label: '🐟 Iscas no Fubá', query: 'Fubá' },
            { label: '🍕 Forno a Lenha', query: 'Lenha' },
            { label: '🥩 Costela no Tinga', query: 'Costela' },
          ].map((chip) => (
            <button
              key={chip.query}
              onClick={() => {
                setSearchQuery(chip.query);
                if (feedTopRef.current) feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-[#FFB703]/25 hover:text-stone-900 border border-stone-200/80 whitespace-nowrap transition-colors font-medium text-stone-700"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Pílulas de Filtro Rápido com Cores do Brasil e Coleção de Salvos */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'todos', label: '🍽️ Todos os Posts' },
            { id: 'salvos', label: `📌 Meus Salvos (${savedCount})` },
            { id: 'premiados', label: '🏆 Caraguá a Gosto' },
            { id: 'maricultura', label: '🦪 Maricultura Cocanha' },
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
            {selectedCategory === 'salvos' ? (
              <>
                <Bookmark className="w-12 h-12 text-[#FFB703] mx-auto fill-[#FFB703]/20" />
                <h3 className="font-heading font-black text-xl text-stone-800">Nenhum prato salvo no seu roteiro</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Toque no ícone de marcador (bookmark) em qualquer prato do feed para salvar e montar seu roteiro gastronômico personalizado de Caraguá!
                </p>
                <button
                  onClick={() => setSelectedCategory('todos')}
                  className="px-5 py-2.5 rounded-full bg-[#135136] text-white text-xs font-bold hover:bg-[#1E6B47] transition-colors"
                >
                  Explorar Todo o Feed
                </button>
              </>
            ) : (
              <>
                <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-heading font-black text-xl text-stone-800">Nenhum post encontrado</h3>
                <p className="text-xs text-stone-500">Tente ajustar a busca ou os filtros para ver todos os pratos deliciosos de Caraguá.</p>
                <button
                  onClick={() => { setSelectedNeighborhood('todos'); setSelectedCategory('todos'); setSearchQuery(''); }}
                  className="px-5 py-2.5 rounded-full bg-[#135136] text-white text-xs font-bold hover:bg-[#1E6B47] transition-colors"
                >
                  Ver Todo o Feed
                </button>
              </>
            )}
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
                      
                      {/* Localização, Bairro e Indicador de Proximidade da Orla */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold mt-0.5 flex-wrap">
                        <span className="text-[#023E8A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#023E8A]" />
                          <span>{post.neighborhood}, Caraguá</span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          post.distanceKm <= 0.5 
                            ? 'bg-amber-100/90 text-amber-900 border border-amber-300/70'
                            : post.distanceKm <= 2.0
                            ? 'bg-sky-100/90 text-sky-900 border border-sky-300/70'
                            : 'bg-emerald-100/90 text-emerald-900 border border-emerald-300/70'
                        }`}>
                          {post.distanceKm <= 0.5 
                            ? `🏖️ Pé na Areia (${Math.round(post.distanceKm * 1000)}m da praia)`
                            : post.distanceKm <= 2.0
                            ? `🌊 Orla Marítima (${post.distanceKm} km)`
                            : `🌴 Eixo Sul / Encosta (${post.distanceKm} km)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Como Chegar / Ver Mapa */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.restaurantName + ' Caraguatatuba')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-stone-100 hover:bg-[#135136] hover:text-white text-stone-600 transition-colors shadow-sm"
                    title={`Ver rotas para ${post.restaurantName} no Google Maps`}
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

                  {/* Coração Animado de Double-Tap + Explosão de Partículas Douradas (Ideia 5) */}
                  <AnimatePresence>
                    {heartAnimPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        {/* Coração Central com Mola Gabriel Lamé */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.95] }}
                          exit={{ scale: 1.6, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 450, damping: 28 }}
                          className="relative"
                        >
                          <Heart className="w-24 h-24 text-[#FFB703] fill-[#FFB703] drop-shadow-[0_12px_36px_rgba(255,183,3,0.7)]" />
                        </motion.div>

                        {/* Partículas Douradas e Centelhas Solares Radiantes (Benchmark Starbucks & Apple HIG) */}
                        {GOLDEN_PARTICLES.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                            animate={{
                              x: p.x,
                              y: p.y,
                              scale: [0, p.scale, 0],
                              opacity: [1, 1, 0],
                              rotate: p.isStar ? [0, 90, 180] : 0,
                            }}
                            transition={{ duration: 0.75, ease: "easeOut" }}
                            style={{
                              position: 'absolute',
                              width: p.size,
                              height: p.size,
                              backgroundColor: p.isStar ? 'transparent' : p.color,
                              borderRadius: p.isStar ? '0' : '9999px',
                              boxShadow: `0 0 12px ${p.color}`,
                            }}
                            className="flex items-center justify-center pointer-events-none"
                          >
                            {p.isStar && (
                              <Sparkles className="w-full h-full" style={{ color: p.color }} />
                            )}
                          </motion.div>
                        ))}
                      </div>
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

                  {/* Badges Flutuantes Orgânicos na Imagem (Liquid Glass - Dossiê de Design & Histórico) */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 max-w-[85%]">
                    {post.caraguaGostoAward && (
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-stone-950/85 text-[#FFB703] shadow-lg flex items-center gap-1.5 border border-white/25 backdrop-blur-md">
                        <Award className="w-3.5 h-3.5 text-[#FFB703] shrink-0" />
                        <span className="truncate">{post.caraguaGostoAward}</span>
                      </span>
                    )}

                    {/* Badge de Procedência Histórica e Sustentabilidade da Maricultura (Dossiê Histórico) */}
                    {(post.id.includes('cocanha') || post.caption.toLowerCase().includes('cocanha') || post.dishName.toLowerCase().includes('mexilhão')) && (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#023E8A]/90 text-cyan-200 border border-cyan-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🦪</span>
                        <span>Mexilhão AMAPEC • Fazenda Cocanha</span>
                      </span>
                    )}

                    {post.dishName.toLowerCase().includes('azul-marinho') && (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#135136]/90 text-emerald-200 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🏺</span>
                        <span>Patrimônio Imaterial • Panela de Ferro & Taninos</span>
                      </span>
                    )}

                    {(post.caption.toLowerCase().includes('camaroeiro') || post.caption.toLowerCase().includes('enseada')) && !post.dishName.toLowerCase().includes('azul-marinho') && (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#1E6B47]/90 text-emerald-100 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🐟</span>
                        <span>Pescado do Camaroeiro • Colônia Z-8</span>
                      </span>
                    )}

                    {post.isPromotion && (
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-rose-600/90 text-white shadow-lg flex items-center gap-1 backdrop-blur-sm border border-white/20">
                        <Flame className="w-3 h-3" />
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

                    {/* Botão de Salvar / Bookmark no Roteiro de Caraguá */}
                    <button
                      onClick={() => handleToggleSave(post)}
                      className="text-stone-700 hover:text-stone-900 transition-transform hover:scale-125 focus:outline-none"
                      title={isSaved ? "Salvo no seu Roteiro de Caraguá" : "Salvar no Roteiro de Caraguá"}
                    >
                      <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'text-[#FFB703] fill-[#FFB703]' : ''}`} />
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
                      <Link 
                        href={`/prato/${post.id}`} 
                        className="font-heading font-extrabold text-sm text-stone-900 mr-1.5 hover:text-[#135136] hover:underline transition-colors"
                        title="Ver ficha técnica completa do prato"
                      >
                        {post.dishName}
                      </Link>
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

                  {/* Ações: Ver Ficha Completa (Master-Detail S09) & Cédula Oficial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/prato/${post.id}`}
                      className="w-full py-2.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02]"
                    >
                      <Utensils className="w-3.5 h-3.5 text-[#FFB703]" />
                      <span>Ver Ficha Completa & Rota</span>
                    </Link>

                    <button
                      onClick={() => setActiveReviewPost(post)}
                      className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-[#FFB703] hover:text-stone-900 text-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
                    >
                      <span>Avaliar (+50 Pontos)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* 5. MASCÓTE FLUTUANTE JACQUIN PRAIANO */}
      <FloatingJacquin onSelectCategory={handleSelectCategory} />

      {/* 6. MODAL OFICIAL: CÉDULA DIGITAL DO FESTIVAL CARAGUÁ A GOSTO (EIXO 3.2 DOSSIÊ HISTÓRICO) */}
      <AnimatePresence>
        {activeReviewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReviewPost(null)}
              className="fixed inset-0 bg-stone-900/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-4 z-10 max-h-[92vh] overflow-y-auto no-scrollbar"
            >
              {/* Header da Cédula */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/50 text-[10px] font-black text-amber-900 mb-1">
                    <Award className="w-3 h-3 text-[#FFB703]" />
                    <span>CÉDULA OFICIAL • CARAGUÁ A GOSTO</span>
                  </div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-stone-900 leading-tight">
                    Avaliar {activeReviewPost.dishName}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {activeReviewPost.restaurantName} ({activeReviewPost.neighborhood}) • Ganhe +50 Pontos
                  </p>
                </div>
                <button
                  onClick={() => setActiveReviewPost(null)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Box de Resumo da Super Nota Ponderada Calculada em Tempo Real */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#135136]/5 to-[#FFB703]/10 border border-[#FFB703]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#135136] block">
                    Super Nota Ponderada da Cédula
                  </span>
                  <div className="text-xs text-stone-600 font-medium">
                    5 Critérios Oficiais Auditados (Regulamento SECTUR)
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end font-heading font-black text-2xl text-[#135136]">
                    <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
                    <span>{calculatedWeightedScore}</span>
                    <span className="text-xs text-stone-400 font-normal">/ 5.0</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 block">
                    Equivale a {((parseFloat(calculatedWeightedScore) / 5) * 10).toFixed(1)} / 10.0 oficial
                  </span>
                </div>
              </div>

              {/* Os 5 Critérios Oficiais do Festival */}
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                <div className="space-y-2">
                  {[
                    { key: 'flavor', label: '1. Sabor & Tempero Caiçara (Peso 35%)', desc: 'Frescor do produto, ponto de sal e equilíbrio', score: flavorScore, setScore: setFlavorScore },
                    { key: 'presentation', label: '2. Apresentação Visual & Cocção (Peso 20%)', desc: 'Acabamento do prato, crocância ou suculência', score: presentationScore, setScore: setPresentationScore },
                    { key: 'originality', label: '3. Originalidade & Insumos Regionais (Peso 15%)', desc: 'Uso de insumos autênticos da costa e mata', score: originalityScore, setScore: setOriginalityScore },
                    { key: 'service', label: '4. Atendimento & Serviço da Equipe (Peso 15%)', desc: 'Cordialidade dos garçons e agilidade', score: serviceScore, setScore: setServiceScore },
                    { key: 'ambiance', label: '5. Ambiente & Higiene da Casa (Peso 15%)', desc: 'Conforto térmico, limpeza e acolhimento', score: ambianceScore, setScore: setAmbianceScore },
                  ].map((crit) => (
                    <div key={crit.key} className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[11px] font-black text-stone-800 block truncate">{crit.label}</span>
                        <span className="text-[10px] text-stone-500 font-medium block truncate">{crit.desc}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => crit.setScore(s)}
                            className="p-0.5 text-base sm:text-lg transition-transform hover:scale-125 focus:outline-none"
                          >
                            <span className={s <= crit.score ? 'text-[#FFB703]' : 'text-stone-300'}>★</span>
                          </button>
                        ))}
                        <span className="text-xs font-mono font-bold text-[#135136] w-5 text-right">{crit.score}.0</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comprovante / Mesa de Auditoria Fiscal */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      Nº da Mesa ou Cupom Fiscal (Auditoria Oficial)
                    </label>
                    <span className="text-[9px] text-stone-400">Opcional para demonstração</span>
                  </div>
                  <input
                    type="text"
                    value={tableVoucher}
                    onChange={(e) => setTableVoucher(e.target.value)}
                    placeholder="Ex: Mesa 07 / CF-8921 (auditoria contra bots)"
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#135136]"
                  />
                </div>

                {/* Parecer do Comensal */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Parecer do Comensal / Crítica Gastronômica:
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Conte sobre o sabor, o frescor do peixe ou o ponto da massa..."
                    className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-[#135136] focus:ring-2 focus:ring-[#135136]/10"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#1E6B47] text-white font-black text-xs transition-colors shadow-lg shadow-[#135136]/20 flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-[#FFB703]" />
                  <span>Emitir Cédula Auditada (+50 Pontos Gourmet)</span>
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
              <p>🏆 Cédula Auditada Enviada!</p>
              <p className="text-emerald-200 font-normal">Sua nota ponderada foi computada e você ganhou +50 Pontos Gourmet.</p>
            </div>
          </motion.div>
        )}

        {saveToast && saveToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-stone-900 text-white shadow-2xl flex items-center gap-3 text-xs font-bold border border-[#FFB703]"
          >
            <Bookmark className={`w-5 h-5 ${saveToast.isAdded ? 'text-[#FFB703] fill-[#FFB703]' : 'text-stone-400'}`} />
            <div>
              <p>{saveToast.isAdded ? '📌 Salvo no seu Roteiro de Caraguá!' : 'Removido dos seus salvos.'}</p>
              <p className="text-amber-200 font-normal text-[11px] truncate max-w-[240px]">
                {saveToast.dishName}
              </p>
            </div>
          </motion.div>
        )}

        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-[#023E8A] text-white shadow-2xl flex items-center gap-3 text-xs font-bold border border-cyan-400/40"
          >
            <CheckCircle2 className="w-5 h-5 text-[#FFB703]" />
            <p>Link copiado para compartilhar no WhatsApp ou redes!</p>
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
