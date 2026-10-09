'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Search, TrendingUp, PenSquare, Coins, 
  ShieldCheck, Cpu, Compass, MapPin, Heart, Bookmark, 
  ArrowUpRight, Award, Zap, ChevronRight, MessageSquare 
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
import { DynamicIsland } from '../components/DynamicIsland';

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

  // Recomendações Dinâmicas baseadas no que o usuário curtiu
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
        tag: 'Super Nota 4.92'
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
    <div className="relative min-h-screen bg-[#F6F2EB] text-[#18181B] selection:bg-[#0D9488]/20 selection:text-[#0B2B26]">
      
      {/* 1. DYNAMIC ISLAND FLUTUANTE NO TOPO (Padrão Louis-CFM/Coucou) */}
      <DynamicIsland
        activePoloName={activeNeighborhoodObj.name}
        onOpenConcierge={() => setIsJacquinOpen(true)}
      />

      {/* 2. SHELL PRINCIPAL 3 COLUNAS (DESKTOP) */}
      <div className="min-h-screen flex flex-col lg:flex-row max-w-[1540px] mx-auto">
        
        {/* ============================================================== */}
        {/* COLUNA ESQUERDA: SIDEBAR ÂNCORA VERDE-OCEANO (#0B2B26)         */}
        {/* ============================================================== */}
        <aside className="hidden lg:flex w-72 sticky top-0 h-screen flex-col justify-between p-6 bg-[#0B2B26] text-[#F6F2EB] border-r border-white/10 z-30">
          <div>
            {/* Header / Brand */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-white/12">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#34D399] flex items-center justify-center font-black text-slate-950 text-base shadow-md">
                CF
              </div>
              <div>
                <h1 className="font-bold text-white text-base tracking-tight leading-tight">
                  Caraguá FoodTech
                </h1>
                <p className="text-[11px] text-[#9DB8B1] font-mono">TCC ADS • Módulo</p>
              </div>
            </div>

            {/* Menu de Navegação Vertical */}
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
                    className={`relative w-full px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                      isActive
                        ? 'bg-[#F6F2EB] text-[#0B2B26] font-bold shadow-md'
                        : 'text-[#C9DDD8] hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B2B26]' : 'text-[#7FD1C6]'}`} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive 
                          ? 'bg-[#0B2B26] text-[#F6F2EB]' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Cartão da Carteira na Base da Sidebar */}
          <div className="p-4 rounded-2xl bg-white/8 border border-white/12 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9DB8B1]">Minha Carteira:</span>
              <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {userCredits} CR
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (userCredits / 500) * 100)}%` }} 
              />
            </div>
            <p className="text-[10px] text-[#9DB8B1] font-mono">Nível: Caiçara Gourmet</p>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* COLUNA CENTRAL: CONTEÚDO EDITORIAL WARM COASTAL                */}
        {/* ============================================================== */}
        <main className="flex-1 min-w-0 px-4 md:px-8 py-20 lg:py-16 space-y-8">
          
          {/* HERO BANNER EDITORIAL DO POLO ATIVO */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#0B2B26] text-[#F6F2EB] shadow-xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-mono font-bold text-[#7FD1C6] uppercase tracking-wider block">
                Polo Gastronômico • {activeNeighborhoodObj.name}
              </span>
              <h2 className="font-serif italic text-3xl md:text-5xl font-normal tracking-tight text-white leading-tight">
                {activeNeighborhoodObj.id === 'todos' 
                  ? 'Sabores da Costa de Caraguatatuba' 
                  : activeNeighborhoodObj.id === 'martim' 
                  ? 'Pé na Areia & Frutos do Mar Frescos' 
                  : activeNeighborhoodObj.id === 'indaia' 
                  ? 'Alta Gastronomia & Cozinha Contemporânea' 
                  : activeNeighborhoodObj.id === 'centro'
                  ? 'Tradição Caiçara & Culinária Patrimonial'
                  : 'Pesca Artesanal & Maricultura Sustentável'}
              </h2>
              <p className="text-xs md:text-sm text-[#B7CFC9] leading-relaxed">
                {activeNeighborhoodObj.tagline}. Síntese gerada em tempo real pela {activeNeighborhoodObj.llmName}.
              </p>
            </div>

            {/* Ação Rápida: Consultar Concierge */}
            <button
              onClick={() => setIsJacquinOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-2 whitespace-nowrap self-start md:self-auto transition-colors shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Perguntar ao Chef Jacquin</span>
            </button>
          </div>

          {/* SELETOR DE POLOS / BAIRROS EM PÍLULAS TÁTEIS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#52525B]">
              <span className="uppercase font-bold tracking-wider">Polos Gastronômicos de Caraguá:</span>
              <span className="text-[#0D9488] font-bold">{activeNeighborhoodObj.llmName}</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {NEIGHBORHOODS.map((n) => {
                const isSelected = selectedNeighborhood === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNeighborhood(n.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[#0B2B26] text-white shadow-sm'
                        : 'bg-white text-[#52525B] border border-[#E2D9CC] hover:text-[#18181B] hover:border-[#D4D4D8]'
                    }`}
                  >
                    {n.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RENDERIZADOR DINÂMICO DE TABS */}
          <div>
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
          </div>
        </main>

        {/* ============================================================== */}
        {/* COLUNA DIREITA: PAINEL CONTEXTUAL (DESKTOP)                     */}
        {/* ============================================================== */}
        <aside className="hidden xl:flex w-80 sticky top-0 h-screen flex-col gap-6 p-6 border-l border-[#E2D9CC] overflow-y-auto">
          
          {/* Card Mascote Chef Jacquin Praiano */}
          <div className="coucou-card p-6 text-center space-y-4">
            <JacquinPraianoAvatar size={80} interactive={true} className="mx-auto" />
            <div>
              <h3 className="font-bold text-[#18181B] text-base">Chef Jacquin Praiano</h3>
              <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                Concierge RAG 5 Estágios treinado na culinária caiçara de Caraguá.
              </p>
            </div>
            <button
              onClick={() => setIsJacquinOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Perguntar ao Chef</span>
            </button>
          </div>

          {/* Dicas da IA em Tempo Real (Personalizadas) */}
          <div className="coucou-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span>Dicas Para Você (IA)</span>
            </div>
            <div className="space-y-2.5">
              {personalizedTips.map((tip, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#18181B]">
                    <span>{tip.name}</span>
                    <span className="text-[10px] font-mono text-[#0D9488]">{tip.tag}</span>
                  </div>
                  <p className="text-[11px] text-[#52525B]">{tip.rest}</p>
                  <p className="text-[10px] text-[#0D9488] leading-tight">{tip.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spikes em Tempo Real */}
          <div className="coucou-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
              <span>Spikes em Tempo Real</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1 text-xs">
              <span className="font-mono text-[10px] text-[#D97706] font-bold block">
                Martim de Sá • Há 18 min
              </span>
              <p className="text-[#92400E] text-[11px] leading-relaxed">
                Isca de badejo subiu para 4.95 na Super Nota com novo lote de peixe fresco da enseada.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. BARRA DE NAVEGAÇÃO MOBILE (BOTTOM DOCK) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#0B2B26] border-t border-white/10 z-40 flex items-center justify-around">
        {[
          { id: 'feed', label: 'Feed', icon: Sparkles },
          { id: 'search', label: 'Busca', icon: Search },
          { id: 'radar', label: 'Radar', icon: TrendingUp },
          { id: 'review', label: 'Avaliar', icon: PenSquare },
          { id: 'credits', label: 'Nitro', icon: Coins },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MainTab)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#34D399] bg-white/10' : 'text-[#C9DDD8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsJacquinOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-3 text-[#34D399]"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
      </div>

      {/* 4. DRAWER DO CHEF JACQUIN PRAIANO */}
      <JacquinChatDrawer
        isOpen={isJacquinOpen}
        onClose={() => setIsJacquinOpen(false)}
        selectedNeighborhood={selectedNeighborhood}
      />
    </div>
  );
}
