'use client';

import React, { useState } from 'react';
import { INITIAL_RESTAURANTS, INITIAL_FEED_POSTS, RestaurantItem } from '@/data/caraguaData';
import { FeedTab } from './FeedTab';
import { SearchTab } from './SearchTab';
import { RadarTab } from './RadarTab';
import { ReviewTab } from './ReviewTab';
import { CreditsTab } from './CreditsTab';
import { JacquinChatDrawer } from '../JacquinChatDrawer';
import { JacquinPraianoAvatar } from '../JacquinPraianoAvatar';
import { Compass, Search, TrendingUp, Star, Coins, Sparkles } from 'lucide-react';

export function ConsumerApp() {
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'radar' | 'review' | 'credits'>('feed');
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(INITIAL_RESTAURANTS);
  const [creditBalance, setCreditBalance] = useState(350);
  const [isJacquinOpen, setIsJacquinOpen] = useState(false);

  // Manipulação de Review no App
  const handleAddReview = (restaurantId: string, review: any) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          const updatedReviews = [review, ...r.reviews];
          const newAvg = Number(
            (updatedReviews.reduce((acc, cur) => acc + cur.rating, 0) / updatedReviews.length).toFixed(2)
          );
          // Recalcula super nota com decaimento
          const newDecayed = Number(
            (updatedReviews.reduce((acc, cur) => acc + cur.decayedRating, 0) / updatedReviews.length).toFixed(2)
          );
          return {
            ...r,
            totalReviews: r.totalReviews + 1,
            ratingAverage: newAvg,
            decayedRatingAverage: newDecayed,
            reviews: updatedReviews
          };
        }
        return r;
      })
    );
  };

  const handleUseCredits = (amount: number, reason: string) => {
    if (creditBalance < amount) return false;
    setCreditBalance(prev => prev - amount);
    return true;
  };

  const handleAddCredits = (amount: number) => {
    setCreditBalance(prev => prev + amount);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      
      {/* Top Header estilo iOS Liquid Glass */}
      <header className="pt-3 pb-2.5 px-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between shrink-0 z-20">
        <div>
          <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Caraguatatuba • SP</span>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            Caraguá <span className="text-sky-400 font-extrabold">FoodTech</span>
          </h1>
        </div>

        {/* Saldo de Créditos no Topo */}
        <button
          onClick={() => setActiveTab('credits')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold shadow hover:bg-slate-800 transition"
        >
          <Coins className="w-3.5 h-3.5 fill-amber-400" />
          <span>{creditBalance}</span>
        </button>
      </header>

      {/* Conteúdo Principal com Scroll */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'feed' && (
          <FeedTab
            posts={INITIAL_FEED_POSTS}
            onSelectRestaurant={(id) => setActiveTab('search')}
          />
        )}
        {activeTab === 'search' && (
          <SearchTab
            restaurants={restaurants}
            onSelectRestaurant={(id) => {}}
          />
        )}
        {activeTab === 'radar' && (
          <RadarTab
            restaurants={restaurants}
            onSelectRestaurant={(id) => {}}
          />
        )}
        {activeTab === 'review' && (
          <ReviewTab
            restaurants={restaurants}
            onAddReviewSuccess={handleAddReview}
          />
        )}
        {activeTab === 'credits' && (
          <CreditsTab
            creditBalance={creditBalance}
            onUseCredits={handleUseCredits}
            onAddCredits={handleAddCredits}
          />
        )}
      </main>

      {/* Floating Action Button do Mascote Jacquin Praiano */}
      <div className="absolute bottom-20 right-4 z-40">
        <button
          onClick={() => setIsJacquinOpen(true)}
          className="relative group p-1 rounded-full bg-gradient-to-tr from-teal-400 via-sky-500 to-indigo-600 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          title="Fale com o Jacquin Praiano"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
          <JacquinPraianoAvatar size={54} />
        </button>
      </div>

      {/* Tab Bar Inferior (iOS 18 Liquid Glass) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/80 flex items-center justify-around px-2 z-30">
        {[
          { key: 'feed', label: 'Feed', icon: Compass },
          { key: 'search', label: 'Busca IA', icon: Search },
          { key: 'radar', label: 'Rankings', icon: TrendingUp },
          { key: 'review', label: 'Avaliar', icon: Star },
          { key: 'credits', label: 'Créditos', icon: Coins },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition duration-200 ${
                isActive ? 'text-sky-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-sky-400' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Drawer de Chat com Jacquin Praiano */}
      <JacquinChatDrawer
        isOpen={isJacquinOpen}
        onClose={() => setIsJacquinOpen(false)}
        onSelectRestaurant={() => {
          setIsJacquinOpen(false);
          setActiveTab('search');
        }}
      />
    </div>
  );
}
