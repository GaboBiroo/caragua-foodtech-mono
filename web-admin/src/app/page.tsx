'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Bookmark, Star, MapPin, 
  Sparkles, Search, X, CheckCircle2, Navigation, Award,
  Flame, Utensils, GraduationCap, ChevronRight, ChevronLeft, ArrowUpRight, Compass, Map
} from 'lucide-react';

import { NEIGHBORHOODS, INITIAL_FEED_POSTS, FeedPost } from '../data/caraguaData';
import { Navbar, CaraguaWaveEmblem } from '../components/Navbar';
import { DynamicIsland } from '../components/DynamicIsland';
import { FloatingJacquin } from '../components/FloatingJacquin';
import { AcademicPortalModal } from '../components/AcademicPortalModal';
import {
  DecaySparklineBadge,
  ClimateOccasionBar,
  ClimateOccasion,
  CaraguaInteractiveVectorMap,
  PassaporteCarafoodModal,
  DishStoryReelModal,
  DesignSystemRoadmapModal,
} from '../components/CorporateUXSuite';

// Os 10 Polos Gastronômicos Principais da Barra Rápida (Elimina a Hiper Poluição de 54 círculos seguidos)
const TOP_CURATED_POLE_IDS = [
  'todos',
  'centro',
  'martim-de-sa',
  'indaia',
  'cocanha',
  'prainha',
  'tabatinga',
  'tinga',
  'massaguacu',
  'porto-novo',
];

// Agrupamento Oficial dos 53 Bairros nas 4 Macro-Zonas Territoriais (Dossiê 1 - Caraguatatuba)
const MACRO_REGIONS: Array<{
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  neighborhoodIds: string[];
}> = [
  {
    id: 'orla-central',
    title: '🌊 Orla Central, Histórica & Eixo Nobre',
    subtitle: 'Gastrobares, bistrôs, Camaroeiro (Colônia Z-8), quiosques de Martim de Sá e orla gourmet do Indaiá',
    badge: '15 Bairros',
    neighborhoodIds: [
      'centro', 'martim-de-sa', 'indaia', 'prainha', 'sumare', 'aruan',
      'jardim-jaqueira', 'estrela-dalva', 'poiares', 'pontal-santamarina',
      'jardim-primavera', 'vila-everest', 'jardim-california', 'ipiranga', 'jardim-jaqueira-2'
    ],
  },
  {
    id: 'costa-norte',
    title: '🦪 Costa Norte & Maricultura (AMAPEC)',
    subtitle: 'Fazenda Marinha da Cocanha, peixes na brasa na Massaguaçu, marinas da Tabatinga e quiosques da Mococa',
    badge: '14 Bairros',
    neighborhoodIds: [
      'cocanha', 'massaguacu', 'tabatinga', 'mococa', 'capricornio',
      'getuba', 'jetuba', 'verde-mar', 'praia-brava', 'fazendinha',
      'jardim-samambaia', 'jardim-forest', 'casa-branca', 'olaria'
    ],
  },
  {
    id: 'eixo-sul',
    title: '🏖️ Orla Sul & Bacia Ribeirinha do Juqueriquerê',
    subtitle: 'Ostras depuradas no Porto Novo, peixarias nas Palmeiras, Barranco Alto e corredor sul',
    badge: '14 Bairros',
    neighborhoodIds: [
      'porto-novo', 'praia-das-palmeiras', 'jardim-britania', 'jardim-gaivotas',
      'barranco-alto', 'travessao', 'pereque-mirim', 'pegorelli', 'tarumas',
      'golfinho', 'pan-brasil', 'vila-atlantica', 'balneario-copacabana', 'canto-do-mar'
    ],
  },
  {
    id: 'serra-interior',
    title: '⛰️ Encostas da Serra do Mar & Raiz Caiçara',
    subtitle: 'Defumados premiados no Tinga, fogão a lenha no Rio do Ouro e cachaça com cambuci',
    badge: '10 Bairros',
    neighborhoodIds: [
      'tinga', 'morro-do-algodao', 'rio-do-ouro', 'cantagalo', 'ponte-seca',
      'jaraguazinho', 'benfica', 'capa-mao', 'jardim-terralao', 'caputera'
    ],
  },
];

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
  const [isBairrosModalOpen, setIsBairrosModalOpen] = useState<boolean>(false);
  const [bairroSearchQuery, setBairroSearchQuery] = useState<string>('');
  const [activeMacroRegion, setActiveMacroRegion] = useState<string>('todas');

  // Estados da Trilha Industrial de 3 Meses (Mês 2 & Mês 3 - CorporateUXSuite)
  const [activeOccasion, setActiveOccasion] = useState<ClimateOccasion>('todos');
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isReelsOpen, setIsReelsOpen] = useState<boolean>(false);
  const [reelsInitialIdx, setReelsInitialIdx] = useState<number>(0);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);
  
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
  const [flavorScore, setFlavorScore] = useState<number>(5);
  const [presentationScore, setPresentationScore] = useState<number>(5);
  const [originalityScore, setOriginalityScore] = useState<number>(5);
  const [serviceScore, setServiceScore] = useState<number>(5);
  const [ambianceScore, setAmbianceScore] = useState<number>(5);
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
  const storiesRef = useRef<HTMLDivElement>(null);

  const scrollStories = (direction: 'left' | 'right') => {
    if (storiesRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      storiesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Polos visíveis na barra limpa do topo (10 Polos Curados + eventual bairro específico selecionado pelo usuário no Mapa dos 53 Bairros)
  const visibleStoryPoles = useMemo(() => {
    const basePoles = TOP_CURATED_POLE_IDS
      .map(id => NEIGHBORHOODS.find(n => n.id === id))
      .filter(Boolean) as typeof NEIGHBORHOODS;

    if (selectedNeighborhood !== 'todos' && !TOP_CURATED_POLE_IDS.includes(selectedNeighborhood)) {
      const activeExtra = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood);
      if (activeExtra) {
        return [basePoles[0], activeExtra, ...basePoles.slice(1)];
      }
    }
    return basePoles;
  }, [selectedNeighborhood]);

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
    setIsBairrosModalOpen(false);
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
        text: `Olha esse prato que encontrei no CaráFood: ${post.dishName} por R$ ${post.dishPrice.toFixed(2)} em ${post.neighborhood}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${post.dishName} - ${post.restaurantName} (CaráFood • Caraguatatuba)`);
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
      if (selectedCategory === 'salvos' && !savedPosts[post.id]) {
        return false;
      }

      if (selectedNeighborhood !== 'todos') {
        const cleanBairro = normalize(post.neighborhood).replace(/\s+/g, '-');
        const cleanSelected = normalize(selectedNeighborhood);
        if (!cleanBairro.includes(cleanSelected) && !cleanSelected.includes(cleanBairro)) {
          return false;
        }
      }

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

      // Filtro de Clima & Ocasião Sensorial (Mês 2 - Semana 6)
      if (activeOccasion === 'sol-praia') {
        const isBeachOrFresh = post.distanceKm <= 1.2 || normalize(post.dishName).includes('isca') || normalize(post.dishName).includes('camarao') || normalize(post.dishName).includes('mexilhao') || normalize(post.dishName).includes('lula') || normalize(post.dishName).includes('casquinha');
        if (!isBeachOrFresh) return false;
      } else if (activeOccasion === 'noite-panela') {
        const isNightOrPanela = normalize(post.dishName).includes('azul-marinho') || normalize(post.dishName).includes('caldeirada') || normalize(post.dishName).includes('moqueca') || normalize(post.dishName).includes('pizza') || normalize(post.dishName).includes('costela') || normalize(post.dishName).includes('polvo') || normalize(post.dishName).includes('risoto') || post.dishCategory === 'Pizzas' || post.dishCategory === 'Lanches Artesanais';
        if (!isNightOrPanela) return false;
      } else if (activeOccasion === 'maricultura-z8') {
        const isMaricultura = normalize(post.dishName).includes('mexilhao') || normalize(post.caption).includes('cocanha') || normalize(post.caption).includes('amapec') || normalize(post.caption).includes('camaroeiro') || normalize(post.dishName).includes('ostra') || normalize(post.dishName).includes('azul-marinho') || normalize(post.dishName).includes('badejo') || normalize(post.dishName).includes('sororoca');
        if (!isMaricultura) return false;
      }

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
  }, [selectedNeighborhood, selectedCategory, activeOccasion, searchQuery, savedPosts]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      
      {/* NAVBAR GLOBAL INTEGRADA */}
      <Navbar onOpenAcademicModal={() => setIsAcademicModalOpen(true)} />

      {/* 1. HEADER COM IDENTIDADE CARÁFOOD, SÍMBOLO DE MARÉ & DYNAMIC ISLAND INTEGRADA */}
      <header className="w-full bg-gradient-to-b from-[#135136] to-[#0E3F2A] text-white pt-6 pb-6 px-4 sm:px-6 shadow-xl border-b-4 border-[#FFB703] relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703] backdrop-blur-md">
              <CaraguaWaveEmblem className="w-4 h-4" />
              <span>CaráFood • O App Oficial da Gastronomia de Caraguatatuba</span>
            </div>
            
            <h1 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-white leading-tight flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <span>Sabores Caiçaras & Roteiro dos 53 Bairros</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
              Dos mexilhões frescos da Fazenda da Cocanha (AMAPEC) ao Azul-Marinho na panela de ferro. Fotos reais, cédula auditada do festival e dicas ao vivo do Chef Jacquin!
            </p>
          </div>

          {/* Cartão de Pontos do Usuário com Micro-Animação (Abre o Passaporte Caiçara Gamificado) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsPassportOpen(true)}
            title="Abrir Passaporte Gastronômico Caiçara"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white text-[#135136] font-bold text-sm shadow-lg border-2 border-[#FFB703] shrink-0 cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <span className="text-[#FFB703] text-lg animate-pulse">★</span>
            <span>{userCredits} Pontos Gourmet</span>
            <span className="px-2 py-0.5 rounded-full bg-[#135136] text-[#FFB703] text-[10px] font-black">
              Passaporte
            </span>
          </motion.button>
        </div>

        {/* DYNAMIC ISLAND DO CHEF JACQUIN */}
        <div className="mt-4 pt-3 border-t border-white/10 relative z-10">
          <DynamicIsland
            onSelectCategory={handleSelectCategory}
            onFilterNeighborhood={handleSelectNeighborhood}
          />
        </div>
      </header>

      {/* 2. BARRA LIMPA E VICIANTE DOS 10 POLOS GASTRONÔMICOS + EXPLORADOR DOS 53 BAIRROS (STICKY TOP-20 Z-30) */}
      <section className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 py-3 px-4 shadow-sm sticky top-20 z-30 relative">
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center justify-between mb-2.5 px-1 gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Polos Gastronômicos em Destaque</span>
            </span>

            {/* Botão Principal Despoluidor: Abre o Mapa Categorizado dos 53 Bairros */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsBairrosModalOpen(true)}
              className="px-3.5 py-1 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm border border-[#FFB703]/60 transition-colors"
            >
              <Map className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Explorar todos os 53 Bairros</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#FFB703] text-stone-900 text-[9px] font-black">53</span>
            </motion.button>
          </div>

          {/* Botões de Rolagem Horizontal para Desktop */}
          <button
            onClick={() => scrollStories('left')}
            className="hidden md:flex absolute -left-3 top-[60%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-stone-300 text-stone-700 hover:text-stone-950 hover:bg-white shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100"
            aria-label="Rolar polos para esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollStories('right')}
            className="hidden md:flex absolute -right-3 top-[60%] -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-stone-300 text-stone-700 hover:text-stone-950 hover:bg-white shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100"
            aria-label="Rolar polos para direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div 
            ref={storiesRef}
            className="flex items-center gap-3.5 overflow-x-auto no-scrollbar pb-1 scroll-smooth px-1"
          >
            {visibleStoryPoles.map((bairro) => {
              const isSelected = selectedNeighborhood === bairro.id;
              return (
                <motion.button
                  key={bairro.id}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectNeighborhood(bairro.id)}
                  title={`${bairro.name}: ${bairro.tagline}`}
                  className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
                >
                  <div className={`p-[2.5px] rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#FFB703] via-[#135136] to-[#023E8A] shadow-md ring-2 ring-[#FFB703]'
                      : 'bg-gradient-to-tr from-stone-200 to-stone-300 group-hover:from-[#FFB703] group-hover:to-[#135136]'
                  }`}>
                    <div className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden">
                      <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-base transition-colors ${
                        isSelected
                          ? 'bg-[#FFB703]/25 text-[#135136]'
                          : 'bg-[#135136]/10 text-[#135136] group-hover:bg-[#FFB703]/20'
                      }`}>
                        {bairro.emoji || '🌴'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tight whitespace-nowrap max-w-[74px] truncate ${
                    isSelected ? 'text-[#135136] font-black underline decoration-[#FFB703] decoration-2' : 'text-stone-600'
                  }`}>
                    {bairro.id === 'todos' ? 'Destaques (53)' : bairro.name}
                  </span>
                </motion.button>
              );
            })}

            {/* Card Final da Barra: Atalho Visual para Abrir o Mapa Completo dos 53 Bairros */}
            <motion.button
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBairrosModalOpen(true)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#FFB703] to-[#135136] shadow-sm">
                <div className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-[#135136] text-[#FFB703] flex items-center justify-center font-black text-xs">
                  +43
                </div>
              </div>
              <span className="text-[10px] font-black text-[#135136] whitespace-nowrap">
                Ver 53 Bairros
              </span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE CLIMA & OCASIÃO SENSORIAL (MÊS 2) + BUSCA, CATEGORIAS E FEEDBACK DE FILTRO */}
      <section className="max-w-4xl mx-auto px-4 pt-5 pb-2 space-y-4">
        {/* Seletor Sensorial de Clima & Ocasião + Passaporte + Reels + Trilha 3 Meses */}
        <ClimateOccasionBar
          activeOccasion={activeOccasion}
          onSelectOccasion={(occ) => {
            setActiveOccasion(occ);
            if (feedTopRef.current) feedTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onOpenPassport={() => setIsPassportOpen(true)}
          onOpenReels={() => {
            setReelsInitialIdx(0);
            setIsReelsOpen(true);
          }}
          onOpenRoadmap={() => setIsRoadmapOpen(true)}
          userCredits={userCredits}
          savedCount={savedCount}
        />
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

        {/* Feedback de Filtro Ativo por Bairro com Botão de Limpar */}
        {selectedNeighborhood !== 'todos' && (
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border-2 border-[#135136]/30 text-[#135136] shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-[#FFB703] shrink-0" />
              <span className="text-xs sm:text-sm font-black truncate">
                Filtrando pelo Bairro: <span className="underline decoration-[#FFB703] decoration-2">{NEIGHBORHOODS.find(n => n.id === selectedNeighborhood)?.name || selectedNeighborhood}</span>
              </span>
              <span className="text-xs text-stone-600 font-medium hidden sm:inline">
                • {filteredPosts.length} {filteredPosts.length === 1 ? 'prato encontrado' : 'pratos encontrados'}
              </span>
            </div>
            <button
              onClick={() => handleSelectNeighborhood('todos')}
              className="px-3 py-1 rounded-full bg-white text-xs font-bold text-stone-800 border border-stone-300 hover:bg-[#FFB703] hover:text-stone-900 transition-colors shadow-sm flex items-center gap-1 shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar filtro</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. O FEED DO INSTAGRAM (CARDS ORGÂNICOS COM FOTO NO MEIO, PERFIL EM CIMA, LIKES E PREÇO EMBAIXO) */}
      <main ref={feedTopRef} className="max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 space-y-12 pb-44">
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
          filteredPosts.map((post, idx) => {
            const isLiked = !!likedPosts[post.id];
            const isSaved = !!savedPosts[post.id];
            const currentLikes = likesCount[post.id] || post.likes;
            const comments = postComments[post.id] || [];

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 320, damping: 28, delay: Math.min(idx * 0.04, 0.2) }}
                className="bg-white rounded-[32px] border border-stone-200/90 shadow-[0_12px_36px_-8px_rgba(19,81,54,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_22px_52px_-10px_rgba(19,81,54,0.16)] hover:-translate-y-1"
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
                        <span className="w-4 h-4 rounded-full bg-[#023E8A] text-white flex items-center justify-center text-[9px] font-bold" title="Verificado pelo CaráFood">
                          ✓
                        </span>
                      </div>
                      
                      {/* Localização, Bairro e Indicador de Proximidade da Orla */}
                      <div className="flex items-center gap-1.5 text-[11px] font-bold mt-0.5 flex-wrap">
                        <button
                          onClick={() => handleSelectNeighborhood(post.neighborhood.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'))}
                          className="text-[#023E8A] hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-[#023E8A]" />
                          <span>{post.neighborhood}, Caraguatatuba</span>
                        </button>
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
                    className="p-2.5 rounded-full bg-stone-100 hover:bg-[#135136] hover:text-white text-stone-600 transition-colors shadow-sm"
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
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Coração Animado de Double-Tap + Explosão de Partículas Douradas */}
                  <AnimatePresence>
                    {heartAnimPostId === post.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.95] }}
                          exit={{ scale: 1.6, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 450, damping: 28 }}
                          className="relative"
                        >
                          <Heart className="w-24 h-24 text-[#FFB703] fill-[#FFB703] drop-shadow-[0_12px_36px_rgba(255,183,3,0.7)]" />
                        </motion.div>

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

                  {/* Badges Flutuantes Orgânicos na Imagem (Alinhamento Horizontal Translúcido z-10 - Não Obstrui o Prato) */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[92%]">
                    {post.caraguaGostoAward && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-stone-950/85 text-[#FFB703] shadow-md flex items-center gap-1 border border-white/25 backdrop-blur-md">
                        <Award className="w-3 h-3 text-[#FFB703] shrink-0" />
                        <span className="truncate">{post.caraguaGostoAward}</span>
                      </span>
                    )}

                    {(post.id.includes('cocanha') || post.caption.toLowerCase().includes('cocanha') || post.dishName.toLowerCase().includes('mexilhão')) && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#023E8A]/90 text-cyan-200 border border-cyan-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🦪</span>
                        <span>Mexilhão AMAPEC • Cocanha</span>
                      </span>
                    )}

                    {post.dishName.toLowerCase().includes('azul-marinho') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#135136]/90 text-emerald-200 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🏺</span>
                        <span>Azul-Marinho Tradicional</span>
                      </span>
                    )}

                    {(post.caption.toLowerCase().includes('camaroeiro') || post.caption.toLowerCase().includes('enseada')) && !post.dishName.toLowerCase().includes('azul-marinho') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E6B47]/90 text-emerald-100 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1">
                        <span>🐟</span>
                        <span>Pescado do Camaroeiro (Z-8)</span>
                      </span>
                    )}

                    {post.isPromotion && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600/90 text-white shadow-md flex items-center gap-1 backdrop-blur-sm border border-white/20">
                        <Flame className="w-3 h-3" />
                        <span>{post.promoBadge || 'Promoção'}</span>
                      </span>
                    )}
                  </div>

                  {post.isVegan && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-[#135136] text-white shadow-lg border border-white/30 backdrop-blur-md">
                      🌿 100% Vegano
                    </div>
                  )}

                  {/* Botão Rápido Modo Reels Vertical & Timestamp Discreto */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReelsInitialIdx(idx);
                        setIsReelsOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-full bg-stone-950/80 hover:bg-[#135136] text-[#FFB703] border border-white/20 backdrop-blur-md text-[10px] font-black flex items-center gap-1 shadow-md transition-colors"
                      title="Assistir em Modo Reels / Story Vertical"
                    >
                      <span>🎬</span>
                      <span>Modo Reels</span>
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                    {post.createdAt}
                  </div>
                </div>

                {/* 4.3 BARRA DE AÇÕES (LIKES, COMENTÁRIOS, SHARE, BOOKMARK) */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleToggleLike(post.id)}
                        className="flex items-center gap-1.5 group focus:outline-none"
                      >
                        <Heart className={`w-6 h-6 transition-transform group-hover:scale-125 ${
                          isLiked ? 'text-rose-500 fill-rose-500' : 'text-stone-700 hover:text-stone-900'
                        }`} />
                        <span className="text-xs font-bold text-stone-800">{currentLikes}</span>
                      </motion.button>

                      <button
                        onClick={() => setActiveReviewPost(post)}
                        className="flex items-center gap-1.5 group text-stone-700 hover:text-stone-900 focus:outline-none"
                      >
                        <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-125" />
                        <span className="text-xs font-bold">{comments.length}</span>
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="text-stone-700 hover:text-stone-900 transition-transform hover:scale-125 focus:outline-none"
                        title="Compartilhar no CaráFood"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleToggleSave(post)}
                      className="text-stone-700 hover:text-stone-900 transition-transform hover:scale-125 focus:outline-none"
                      title={isSaved ? "Salvo no seu Roteiro CaráFood" : "Salvar no Roteiro CaráFood"}
                    >
                      <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'text-[#FFB703] fill-[#FFB703]' : ''}`} />
                    </motion.button>
                  </div>

                  {/* 4.4 PREÇO, SUPER NOTA EM ESTRELAS & SPARKLINE DE DECAIMENTO EXPONENCIAL (MÊS 3) */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Preço no Cardápio
                        </span>
                        <span className="font-heading font-black text-xl text-[#135136]">
                          R$ {post.dishPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Super Nota Auditada
                        </span>
                        <div className="flex items-center gap-1 justify-end font-heading font-black text-lg text-stone-900">
                          <Star className="w-4 h-4 text-[#FFB703] fill-[#FFB703]" />
                          <span>{post.superRating.toFixed(2)}</span>
                          <span className="text-[11px] text-stone-500 font-normal">({post.totalReviews})</span>
                        </div>
                      </div>
                    </div>

                    {/* Telemetria Algorítmica: Sparkline λ=ln(2)/30 + Escudo Z-Score + Malha H3 */}
                    <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between flex-wrap gap-2">
                      <DecaySparklineBadge rating={post.superRating} reviews={post.totalReviews} />
                      <span className="text-[9px] font-mono font-bold text-stone-500">
                        📍 Malha H3 Res.9 • {post.neighborhood}
                      </span>
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

                  {/* 4.6 DICA EXCLUSIVA DO CHEF JACQUIN (COM ANIMAÇÃO COUCOU) */}
                  <div className="p-4 rounded-3xl bg-emerald-50/80 border-2 border-emerald-200/90 flex items-start gap-3.5 shadow-sm group/jacquin">
                    <div className="w-14 h-16 sm:w-16 sm:h-20 shrink-0 -my-1 drop-shadow-md animate-coucou-wave">
                      <img src="/jacquin-praiano.png" alt="Chef Jacquin" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-heading font-black text-[#135136] text-sm sm:text-base block">
                        Dica Exclusiva do Chef Jacquin:
                      </span>
                      <p className="text-stone-800 italic font-semibold mt-1 leading-relaxed">
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

                  {/* Ações: Ver Ficha Completa & Cédula Oficial */}
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
              </motion.article>
            );
          })
        )}
      </main>

      {/* 5. MASCOTE FLUTUANTE JACQUIN PRAIANO (COUCOU 60FPS) */}
      <FloatingJacquin onSelectCategory={handleSelectCategory} />

      {/* 5.5 MODAL EXPLORADOR INTELIGENTE DOS 53 BAIRROS POR MACRO-ZONAS (DESPOLUIÇÃO VISUAL Z-50) */}
      <AnimatePresence>
        {isBairrosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBairrosModalOpen(false)}
              className="fixed inset-0 bg-stone-950/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-[36px] shadow-2xl border-4 border-[#135136] overflow-hidden z-10 flex flex-col max-h-[88vh]"
            >
              {/* Header do Explorador dos 53 Bairros */}
              <div className="bg-gradient-to-r from-[#135136] via-[#1E6B47] to-[#135136] text-white p-5 sm:p-6 flex items-center justify-between border-b-4 border-[#FFB703]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFB703] text-stone-900 flex items-center justify-center shadow-md shrink-0">
                    <Map className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-[#FFB703]">
                        Mapeamento Territorial Oficial • Dossiê 1
                      </span>
                    </div>
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-white mt-0.5">
                      Explorador dos 53 Bairros de Caraguatatuba
                    </h3>
                    <p className="text-xs text-emerald-100 font-medium">
                      Agrupados nas 4 Macro-Regiões Gastronômicas para navegação rápida e sem poluição visual
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsBairrosModalOpen(false)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Fechar mapa de bairros"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Barra de Busca Instantânea de Bairro + Seletor de Macro-Região */}
              <div className="p-4 sm:p-5 bg-white border-b border-stone-200 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#135136] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bairroSearchQuery}
                    onChange={(e) => setBairroSearchQuery(e.target.value)}
                    placeholder="Buscar entre os 53 bairros ou especialidades (ex: Cocanha, Tinga, Massaguaçu, Ostras, Cambuci)..."
                    className="w-full pl-11 pr-9 py-2.5 rounded-full bg-[#FAF7F2] border border-stone-300 text-xs sm:text-sm font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#135136] focus:bg-white"
                  />
                  {bairroSearchQuery && (
                    <button
                      onClick={() => setBairroSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'todas', label: '🗺️ Todas as 4 Macro-Regiões (53 Bairros)' },
                    { id: 'orla-central', label: '🌊 Orla Central & Nobre (15)' },
                    { id: 'costa-norte', label: '🦪 Costa Norte & Cocanha (14)' },
                    { id: 'eixo-sul', label: '🏖️ Orla Sul & Juqueriquerê (14)' },
                    { id: 'serra-interior', label: '⛰️ Serra & Interior Caiçara (10)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMacroRegion(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        activeMacroRegion === tab.id
                          ? 'bg-[#135136] text-[#FFB703] shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista Categorizada dos 53 Bairros + Mapa Vetorial Interativo (Mês 2 - Semana 5) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Mapa Cartográfico Vetorial Interativo da Enseada de Caraguatatuba */}
                <CaraguaInteractiveVectorMap
                  activeMacroRegion={activeMacroRegion}
                  onSelectMacroRegion={(id) => setActiveMacroRegion(id)}
                  onSelectPole={(poleId) => handleSelectNeighborhood(poleId)}
                />

                {/* Botão Todos os 53 Bairros */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌴</span>
                    <div>
                      <div className="font-heading font-black text-sm text-[#135136]">
                        Ver Feed Completo (Todos os 53 Bairros de Caraguatatuba)
                      </div>
                      <div className="text-[11px] text-stone-600">
                        Exibe todos os pratos premiados, quiosques e restaurantes sem restrição territorial
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectNeighborhood('todos')}
                    className="px-4 py-2 rounded-full bg-[#135136] hover:bg-[#0D3825] text-[#FFB703] text-xs font-black shrink-0 shadow-sm"
                  >
                    Selecionar Tudo
                  </button>
                </div>

                {MACRO_REGIONS.filter(r => activeMacroRegion === 'todas' || r.id === activeMacroRegion).map((region) => {
                  const q = bairroSearchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  const regionBairros = region.neighborhoodIds
                    .map(id => NEIGHBORHOODS.find(n => n.id === id))
                    .filter((b): b is NonNullable<typeof b> => {
                      if (!b) return false;
                      if (!q) return true;
                      const matchName = b.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
                      const matchSpec = b.llmSpecialty.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
                      const matchTag = b.tagline.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
                      return matchName || matchSpec || matchTag;
                    });

                  if (regionBairros.length === 0) return null;

                  return (
                    <div key={region.id} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                        <div>
                          <h4 className="font-heading font-black text-base text-stone-900">
                            {region.title}
                          </h4>
                          <p className="text-xs text-stone-500">{region.subtitle}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFB703]/20 text-amber-900 font-black text-[11px]">
                          {regionBairros.length} bairros
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {regionBairros.map((bairro) => {
                          const isSelected = selectedNeighborhood === bairro.id;
                          return (
                            <button
                              key={bairro.id}
                              onClick={() => handleSelectNeighborhood(bairro.id)}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                                isSelected
                                  ? 'bg-[#135136] text-white border-[#FFB703] shadow-md'
                                  : 'bg-white hover:bg-amber-50/60 text-stone-900 border-stone-200/90 hover:border-[#135136]'
                              }`}
                            >
                              <span className="text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                {bairro.emoji || '🌴'}
                              </span>
                              <div className="min-w-0">
                                <div className={`font-heading font-black text-xs sm:text-sm truncate ${
                                  isSelected ? 'text-[#FFB703]' : 'text-stone-900'
                                }`}>
                                  {bairro.name}
                                </div>
                                <div className={`text-[10px] font-medium line-clamp-2 mt-0.5 ${
                                  isSelected ? 'text-emerald-100' : 'text-stone-500'
                                }`}>
                                  {bairro.llmSpecialty}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <p>{saveToast.isAdded ? '📌 Salvo no seu Roteiro do CaráFood!' : 'Removido dos seus salvos.'}</p>
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
            <p>Link do CaráFood copiado para compartilhar no WhatsApp ou redes!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FOOTER SÓLIDO CARÁFOOD COM SÍMBOLO DE ONDA & CRÉDITOS DA EQUIPE */}
      <footer className="bg-[#135136] text-white py-12 px-6 border-t-4 border-[#FFB703]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h4 className="font-heading font-black text-2xl sm:text-3xl text-white">
                Cará<span className="text-[#FFB703]">Food</span>
              </h4>
              <CaraguaWaveEmblem className="w-7 h-7" />
            </div>
            <p className="text-xs text-emerald-200 max-w-md">
              A plataforma gastronômica oficial de Caraguatatuba. Valorizando quiosques de praia, maricultores da Cocanha (AMAPEC), pescadores do Camaroeiro (Z-8) e os 53 bairros.
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
              Centro Universitário Módulo • Gabriel Rodrigues • Matheus Vicente • Pedro Simone
            </span>
          </div>
        </div>
      </footer>

      {/* MODAL ACADÊMICO RESTRITO DO PROFESSOR CRISTIANO */}
      <AcademicPortalModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
      />

      {/* MODAIS INTERATIVOS DA TRILHA INDUSTRIAL DE 3 MESES (MÊS 2 & MÊS 3) */}
      <PassaporteCarafoodModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        userCredits={userCredits}
        savedCount={savedCount}
      />

      <DishStoryReelModal
        isOpen={isReelsOpen}
        onClose={() => setIsReelsOpen(false)}
        posts={filteredPosts.length > 0 ? filteredPosts : INITIAL_FEED_POSTS}
        initialIndex={reelsInitialIdx}
        likedPosts={likedPosts}
        savedPosts={savedPosts}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
      />

      <DesignSystemRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />
    </div>
  );
}


