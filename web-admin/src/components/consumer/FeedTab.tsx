'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Bookmark, MessageSquare, Sparkles, MapPin, 
  ShieldCheck, Share2, Award, Zap, ArrowUpRight, Flame, CheckCircle2 
} from 'lucide-react';
import { FeedPost, INITIAL_FEED_POSTS, INITIAL_RESTAURANTS, RestaurantItem } from '../../data/caraguaData';

interface FeedTabProps {
  selectedNeighborhood: string;
  likedDishIds: Set<string>;
  onToggleLike: (postId: string, dishName: string, category: string) => void;
  savedPostIds: Set<string>;
  onToggleSave: (postId: string) => void;
  onSelectRestaurantForReview: (restaurant: RestaurantItem) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  selectedNeighborhood,
  likedDishIds,
  onToggleLike,
  savedPostIds,
  onToggleSave,
  onSelectRestaurantForReview,
}) => {
  const [activeReviewModalPost, setActiveReviewModalPost] = useState<FeedPost | null>(null);

  // Filtra posts pelo bairro selecionado
  const filteredPosts = INITIAL_FEED_POSTS.filter(post => {
    if (selectedNeighborhood === 'todos' || !selectedNeighborhood) return true;
    const cleanBairro = post.neighborhood.toLowerCase().replace(/\s+/g, '-');
    return cleanBairro.includes(selectedNeighborhood) || selectedNeighborhood.includes(cleanBairro);
  });

  return (
    <div className="space-y-8">
      {/* Feed Cards Bento Grid em Padrão Coucou Warm Coastal */}
      <div className="grid grid-cols-1 gap-8">
        {filteredPosts.map((post, index) => {
          const isLiked = likedDishIds.has(post.id);
          const isSaved = savedPostIds.has(post.id);
          const restaurantObj = INITIAL_RESTAURANTS.find(r => r.id === post.restaurantId);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="coucou-card overflow-hidden group"
            >
              {/* Header do Card */}
              <div className="p-5 flex items-center justify-between border-b border-[#E2D9CC]/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#0B2B26] text-[#F6F2EB] flex items-center justify-center font-bold text-sm shadow-sm">
                    {post.restaurantName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#18181B] tracking-tight text-base">
                        {post.restaurantName}
                      </h3>
                      {post.isLocalProducer && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wide bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                          Produtor Caiçara
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#52525B] mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0D9488]" />
                        {post.neighborhood}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{post.distanceKm} km daqui</span>
                      <span>•</span>
                      <span className="text-[11px] text-[#0D9488] font-mono bg-[#F0FDFA] px-1.5 py-0.5 rounded border border-[#99F6E4]">
                        {post.verifiedSource}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Super Nota de Decaimento */}
                {restaurantObj && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-mono text-base font-bold text-[#18181B] tracking-tight">
                        {restaurantObj.decayedRatingAverage.toFixed(2)}
                      </span>
                      <span className="text-amber-500 text-sm">★</span>
                    </div>
                    <span className="text-[10px] text-[#71717A] font-mono block">
                      Super Nota (30d)
                    </span>
                  </div>
                )}
              </div>

              {/* Foto Principal com Banner de Promoção e Tags */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE6DC]">
                <img
                  src={post.postImage}
                  alt={post.dishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Badges Flutuantes em Vidro Líquido */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                  {post.isPromotion && post.promoBadge && (
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#E11D48] text-white flex items-center gap-1.5 shadow-md">
                      <Flame className="w-3.5 h-3.5" />
                      {post.promoBadge}
                    </div>
                  )}
                  {post.isVegan && (
                    <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-sm">
                      100% Vegano
                    </div>
                  )}
                  {post.isGlutenFree && (
                    <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-[#18181B] border border-white/60 shadow-sm backdrop-blur-md">
                      Sem Glúten
                    </div>
                  )}
                </div>

                {/* Preço do Prato */}
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#141413]/90 text-white font-mono font-bold text-sm shadow-lg backdrop-blur-md">
                  R$ {post.dishPrice.toFixed(2)}
                </div>
              </div>

              {/* Conteúdo & Síntese RAG Regional */}
              <div className="p-5 space-y-4">
                {/* Síntese da IA Regional */}
                <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-mono font-bold text-[#0D9488] uppercase tracking-wide">
                      Síntese da IA Regional:
                    </p>
                    <p className="text-xs text-[#134E4A] leading-relaxed">
                      {post.regionalLLMSummary}
                    </p>
                  </div>
                </div>

                {/* Título & Descrição do Prato */}
                <div>
                  <h4 className="font-bold text-[#18181B] text-lg tracking-tight">
                    {post.dishName}
                  </h4>
                  <p className="text-sm text-[#52525B] leading-relaxed mt-1">
                    {post.caption}
                  </p>
                </div>

                {/* Barra de Ações: Curtir, Comentários, Salvar e Avaliar */}
                <div className="pt-2 flex items-center justify-between border-t border-[#E2D9CC]/70">
                  <div className="flex items-center gap-2">
                    {/* Botão Curtir */}
                    <button
                      onClick={() => onToggleLike(post.id, post.dishName, post.dishCategory)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                        isLiked
                          ? 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                          : 'bg-[#EDE6DC]/60 text-[#52525B] hover:text-[#18181B] hover:bg-[#EDE6DC]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#E11D48]' : ''}`} />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>

                    {/* Botão Salvar */}
                    <button
                      onClick={() => onToggleSave(post.id)}
                      className={`p-2 rounded-xl text-xs transition-all active:scale-95 ${
                        isSaved
                          ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                          : 'bg-[#EDE6DC]/60 text-[#52525B] hover:text-[#18181B] hover:bg-[#EDE6DC]'
                      }`}
                      aria-label="Salvar post"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#D97706]' : ''}`} />
                    </button>

                    <span className="text-xs text-[#71717A] font-mono ml-2">
                      {post.commentsCount} avaliações
                    </span>
                  </div>

                  {/* Ação de Avaliar Restaurante */}
                  {restaurantObj && (
                    <button
                      onClick={() => onSelectRestaurantForReview(restaurantObj)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B2B26] text-[#F6F2EB] hover:bg-[#134E4A] flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Avaliar (+50 CR)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};
