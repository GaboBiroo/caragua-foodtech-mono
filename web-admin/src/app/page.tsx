'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Search, TrendingUp, PenSquare, Coins, 
  ShieldCheck, Cpu, Compass, MapPin, Heart, Bookmark, 
  ArrowUpRight, Award, Zap, ChevronRight 
} from 'lucide-react';

import { NEIGHBORHOODS, INITIAL_RESTAURANTS, RestaurantItem } from '../data/caraguaData';
import { FeedTab } from '../components/consumer/FeedTab';
import { SearchTab } from '../components/consumer/SearchTab';
import { RadarTab } from '../components/consumer/RadarTab';
import { ReviewTab } from '../components/consumer/ReviewTab';
import { CreditsTab } from '../components/consumer/CreditsTab';
import { AdminView } from '../components/admin/AdminView';
import { RAGArchitectureView } from '../components/admin/RAGArchitectureView';
import { JacquinPraianoAvatar } from '../components/JacquinPraianoAvatar';
import { JacquinChatDrawer } from '../components/JacquinChatDrawer';

type MainTab = 'feed' | 'search' | 'radar' | 'review' | 'credits' | 'admin' | 'rag';

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('feed');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('todos');
  const [isJacquinOpen, setIsJacquinOpen] = useState<boolean>(false);
  const [userCredits, setUserCredits] = useState<number>(250);
  const [likedDishIds, setLikedDishIds] = useState<Set<string>>(new Set(['post-1']));
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [selectedRestaurantForReview, setSelectedRestaurantForReview] = useState<RestaurantItem | null>(null);

  // Histórico de categorias curtidas para Dicas IA em tempo real
  const [likedCategories, setLikedCategories] = useState<string[]>(['Frutos do Mar']);

  const handleToggleLike = (postId: string, dishName: string, category: string) => {
    setLikedDishIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
        setLikedCategories(cats => [...cats, category]);
      }
      return next;
    });
  };

  const handleToggleSave = (postId: string) => {
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleSelectRestaurantForReview = (restaurant: RestaurantItem) => {
    setSelectedRestaurantForReview(restaurant);
    setActiveTab('review');
  };

  const handleSubmitReview = (
    restaurantId: string,
    scores: { quality: number; service: number; costBenefit: number },
    comment: string
  ) => {
    const calculatedScore = (scores.quality * 0.45) + (scores.service * 0.3) + (scores.costBenefit * 0.25);
    
    // Atualiza o restaurante em memória
    const rest = INITIAL_RESTAURANTS.find(r => r.id === restaurantId);
    if (rest) {
      rest.totalReviews += 1;
      // Atualiza com fórmula de decaimento temporal
      rest.decayedRatingAverage = Number(((rest.decayedRatingAverage * 0.85) + (calculatedScore * 0.15)).toFixed(2));
      rest.reviews.unshift({
        id: `rev-user-${Date.now()}`,
        author: `Avaliador Local (${comment.slice(0, 4)})`,
        rating: calculatedScore,
        decayedRating: calculatedScore,
        comment,
        date: 'Agora mesmo',
        daysAgo: 0,
        source: 'App',
        verifiedAudit: true,
        criteriaScores: scores
      });
    }

    // Concede +50 Créditos ao usuário
    setUserCredits(c => c + 50);
  };

  const handleSpendCredits = (amount: number, reason: string): boolean => {
    if (userCredits >= amount) {
      setUserCredits(c => c - amount);
      return true;
    }
    return false;
  };

  const activeNeighborhoodObj = NEIGHBORHOODS.find(n => n.id === selectedNeighborhood) || NEIGHBORHOODS[0];

  // Recomendações Dinâmicas em Tempo Real baseadas no que o usuário curtiu
  const personalizedTips = useMemo(() => {
    const isVeganFan = likedCategories.some(c => c.toLowerCase().includes('vegano'));
    if (isVeganFan) {
      return [
        {
          name: 'Moqueca Vegana de Pupunha',
          rest: 'Cantina Caiçara Tradição',
          reason: '100% Livre de pescados, aprovado por suas curtidas em culinária consciente.',
          tag: 'Food Safety 100%'
        },
        {
          name: 'Bowl Caiçara de Quinoa e Shimeji',
          rest: 'Empório & Bistrô Verde Mar',
          reason: 'Cogumelos frescos e chips de banana da terra da Mata Atlântica.',
          tag: 'Orgânico Caiçara'
        }
      ];
    }
    return [
      {
        name: 'Risoto de Camarão Rosa',
        rest: 'Mar & Terra Gourmet (Indaiá)',
        reason: 'Baseado no seu gosto por frutos do mar e porções de praia.',
        tag: 'Super Nota 4.79'
      },
      {
        name: 'Isca de Badejo com Panko',
        rest: 'Quiosque Canto Bravo (Martim de Sá)',
        reason: 'Spike de crocância de 94% detectado nas últimas 48h.',
        tag: 'Promoção Ativa'
      }
    ];
  }, [likedCategories]);

  return (
    <div className="relative min-h-screen bg-[#07090E] text-zinc-100 overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* CANVASES DE FUNDO: AMBIENT MESH LIGHTS FIXAS */}
      <div className="fixed -top-40 -left-20 w-[550px] h-[550px] bg-teal-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed -top-40 right-0 w-[650px] h-[650px] bg-indigo-700/15 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ============================================================== */}
      {/* 1. LAYOUT DESKTOP WIDESCREEN REAL (md:flex) - SEM CAPINHA FALSA */}
      {/* ============================================================== */}
      <div className="hidden md:flex min-h-screen relative z-10 max-w-7xl mx-auto px-6 py-6 gap-8">
        
        {/* SIDEBAR ESQUERDA FLUTUANTE EM LIQUID GLASS */}
        <aside className="w-64 lg:w-72 sticky top-6 h-[calc(100vh-3rem)] flex flex-col justify-between p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_20px_40px_-15px_rgba(0,0,0,0.6)]">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-teal-500/25">
                CF
              </div>
              <div>
                <h1 className="font-semibold text-white text-sm tracking-tight leading-tight">
                  Caraguá FoodTech
                </h1>
                <p className="text-[11px] text-zinc-400">TCC ADS • Módulo</p>
              </div>
            </div>

            {/* Menu de Navegação Vertical com Lucide Icons */}
            <nav className="mt-6 space-y-1.5">
              {[
                { id: 'feed', label: 'Feed & Timeline', icon: Sparkles },
                { id: 'search', label: 'Busca Spotlight & IA', icon: Search },
                { id: 'radar', label: 'Radar 30d & Rankings', icon: TrendingUp },
                { id: 'review', label: 'Avaliar Restaurante', icon: PenSquare, badge: '+50 CR' },
                { id: 'credits', label: 'Créditos Nitro & B2B', icon: Coins },
                { id: 'admin', label: 'Painel Moderação', icon: ShieldCheck },
                { id: 'rag', label: 'Arquitetura RAG & LLMs', icon: Cpu },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as MainTab)}
                    className={`relative w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktopNavPill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-white/[0.12] border border-white/[0.20] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3)] rounded-2xl backdrop-blur-xl"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon className="w-4 h-4 text-teal-400" />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Cartão de Créditos do Usuário na Base da Sidebar */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Minha Carteira:</span>
              <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {userCredits} CR
              </span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (userCredits / 500) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Nível: Caiçara Gourmet</p>
          </div>
        </aside>

        {/* ÁREA CENTRAL PRINCIPAL: BENTO GRID / FEED EDITORIAL */}
        <main className="flex-1 min-w-0 max-w-3xl space-y-6">
          
          {/* HEADER SPOTLIGHT & ORQUESTRADOR DE BAIRROS */}
          <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)] space-y-4">
            
            {/* Seletor de Bairros em Pílulas de Vidro com layoutId */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-mono text-zinc-400 uppercase tracking-wider">
                  Polos Gastronômicos de Caraguá:
                </span>
                <span className="text-[11px] font-mono text-teal-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {activeNeighborhoodObj.llmName}
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {NEIGHBORHOODS.map((n) => {
                  const isSelected = selectedNeighborhood === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNeighborhood(n.id)}
                      className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                        isSelected
                          ? 'text-white'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="desktopNeighborhoodPill"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          className="absolute inset-0 bg-white/[0.14] border border-white/[0.22] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.25)] rounded-xl"
                        />
                      )}
                      <span className="relative z-10">{n.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner da LLM Regional Ativa */}
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-300">
              <span className="text-zinc-400 truncate max-w-md">
                {activeNeighborhoodObj.tagline}
              </span>
              <button
                onClick={() => setIsJacquinOpen(true)}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Consultar Concierge</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CONTEÚDO DA ABA ATIVA (COM ANIMATEPRESENCE) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'feed' && (
                <FeedTab
                  selectedNeighborhood={selectedNeighborhood}
                  likedDishIds={likedDishIds}
                  onToggleLike={handleToggleLike}
                  savedPostIds={savedPostIds}
                  onToggleSave={handleToggleSave}
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'search' && (
                <SearchTab
                  selectedNeighborhood={selectedNeighborhood}
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'radar' && (
                <RadarTab
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'review' && (
                <ReviewTab
                  selectedRestaurant={selectedRestaurantForReview}
                  onClearSelectedRestaurant={() => setSelectedRestaurantForReview(null)}
                  onSubmitReview={handleSubmitReview}
                />
              )}

              {activeTab === 'credits' && (
                <CreditsTab
                  userCredits={userCredits}
                  onSpendCredits={handleSpendCredits}
                />
              )}

              {activeTab === 'admin' && <AdminView />}
              {activeTab === 'rag' && <RAGArchitectureView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* PAINEL DIREITO CONTEXTUAL EM LIQUID GLASS (hidden xl:block) */}
        <aside className="hidden xl:block w-80 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto space-y-6 no-scrollbar">
          
          {/* Card Mascote Jacquin Praiano */}
          <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-xl text-center">
            <div className="flex justify-center mb-3">
              <JacquinPraianoAvatar size={74} />
            </div>
            <h3 className="font-semibold text-white text-sm">Chef Jacquin Praiano</h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3 leading-relaxed">
              Concierge RAG 5 Estágios treinado na culinária caiçara de Caraguá.
            </p>
            <button
              onClick={() => setIsJacquinOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perguntar ao Chef</span>
            </button>
          </div>

          {/* Dicas Sob Medida da IA (Reagem às Curtidas em Tempo Real) */}
          <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Dicas para Você (IA)
              </h4>
              <span className="text-[10px] font-mono text-zinc-500">Live</span>
            </div>

            <div className="space-y-2.5">
              {personalizedTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-zinc-200 truncate">{tip.name}</strong>
                    <span className="text-[10px] font-mono text-teal-400">{tip.tag}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{tip.rest}</p>
                  <p className="text-[10px] text-zinc-500 leading-snug">{tip.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radar da Madrugada (Últimos Spikes) */}
          <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-xl space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Spikes em Tempo Real
            </h4>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 space-y-1">
              <span className="text-teal-300 font-mono text-[11px] block">Martim de Sá • Há 18 min</span>
              <p className="text-zinc-300 leading-snug">
                Isca de badejo subiu para 4.95 na Super Nota com novo lote fresco.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================================== */}
      {/* 2. LAYOUT MOBILE NATIVO (md:hidden) - TELA CHEIA & BOTTOM DOCK */}
      {/* ============================================================== */}
      <div className="md:hidden min-h-screen pb-28 relative z-10">
        
        {/* Top Bar Móvel Translúcida */}
        <header className="sticky top-0 z-40 px-4 py-3 bg-[#07090E]/80 backdrop-blur-2xl border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                CF
              </div>
              <div>
                <h1 className="font-semibold text-white text-xs leading-none">Caraguá FoodTech</h1>
                <span className="text-[10px] text-zinc-400 font-mono">IA Caiçara & RAG</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-white/[0.05] px-2.5 py-1 rounded-xl border border-white/[0.10]">
              <Coins className="w-3.5 h-3.5" />
              <span>{userCredits} CR</span>
            </div>
          </div>

          {/* Seletor Horizontal de Bairros */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {NEIGHBORHOODS.map((n) => {
              const isSelected = selectedNeighborhood === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNeighborhood(n.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-teal-500/20 border border-teal-400/40 text-teal-200'
                      : 'bg-white/[0.04] text-zinc-400'
                  }`}
                >
                  {n.name}
                </button>
              );
            })}
          </div>
        </header>

        {/* Conteúdo Mobile da Aba Ativa */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'feed' && (
                <FeedTab
                  selectedNeighborhood={selectedNeighborhood}
                  likedDishIds={likedDishIds}
                  onToggleLike={handleToggleLike}
                  savedPostIds={savedPostIds}
                  onToggleSave={handleToggleSave}
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'search' && (
                <SearchTab
                  selectedNeighborhood={selectedNeighborhood}
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'radar' && (
                <RadarTab
                  onSelectRestaurantForReview={handleSelectRestaurantForReview}
                />
              )}

              {activeTab === 'review' && (
                <ReviewTab
                  selectedRestaurant={selectedRestaurantForReview}
                  onClearSelectedRestaurant={() => setSelectedRestaurantForReview(null)}
                  onSubmitReview={handleSubmitReview}
                />
              )}

              {activeTab === 'credits' && (
                <CreditsTab
                  userCredits={userCredits}
                  onSpendCredits={handleSpendCredits}
                />
              )}

              {activeTab === 'admin' && <AdminView />}
              {activeTab === 'rag' && <RAGArchitectureView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FLOATING ACTION BUTTON (FAB) DO JACQUIN NO MOBILE */}
        <button
          onClick={() => setIsJacquinOpen(true)}
          className="fixed bottom-24 right-4 z-40 p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.20] backdrop-blur-2xl shadow-2xl transition active:scale-95"
          title="Perguntar ao Chef Jacquin"
        >
          <JacquinPraianoAvatar size={48} />
        </button>

        {/* BOTTOM DOCK FLUTUANTE ESTILO IOS 18 EM LIQUID GLASS */}
        <div className="fixed bottom-4 left-4 right-4 z-40 bg-white/[0.08] backdrop-blur-3xl border border-white/[0.15] rounded-full p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-around">
          {[
            { id: 'feed', icon: Sparkles, label: 'Feed' },
            { id: 'search', icon: Search, label: 'Busca' },
            { id: 'radar', icon: TrendingUp, label: 'Radar' },
            { id: 'review', icon: PenSquare, label: 'Avaliar' },
            { id: 'credits', icon: Coins, label: 'Nitro' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MainTab)}
                className={`relative px-3 py-2 rounded-full flex flex-col items-center gap-1 transition ${
                  isActive ? 'text-teal-300' : 'text-zinc-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileDockPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white/[0.15] rounded-full -z-10"
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DRAWER DO CHEF JACQUIN (CONCIERGE RAG) */}
      <JacquinChatDrawer
        isOpen={isJacquinOpen}
        onClose={() => setIsJacquinOpen(false)}
        selectedNeighborhood={selectedNeighborhood}
      />
    </div>
  );
}
