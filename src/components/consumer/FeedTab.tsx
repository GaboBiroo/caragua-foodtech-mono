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
      {/* Feed Cards Bento Grid */}
      <div className="grid grid-cols-1 gap-8">
        {filteredPosts.map((post, index) => {
          const isLiked = likedDishIds.has(post.id);
          const isSaved = savedPostIds.has(post.id);
          const restaurantObj = INITIAL_RESTAURANTS.find(r => r.id === post.restaurantId);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl backdrop-saturate-[180%] border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_20px_40px_-15px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden transition-all duration-300"
            >
              {/* Header do Card */}
              <div className="p-5 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/30 to-indigo-500/30 border border-white/[0.15] flex items-center justify-center font-bold text-teal-300 text-sm shadow-md">
                    {post.restaurantName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white tracking-tight text-sm md:text-base">
                        {post.restaurantName}
                      </h3>
                      {post.isLocalProducer && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-amber-500/10 text-amber-300 border border-amber-500/25">
                          Produtor Caiçara
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {post.neighborhood}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-zinc-400">{post.distanceKm} km daqui</span>
                      <span>•</span>
                      <span className="text-[11px] text-teal-400/90 font-mono bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
                        {post.verifiedSource}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Super Nota de Decaimento */}
                {restaurantObj && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="font-mono text-base font-bold text-white tracking-tighter">
                        {restaurantObj.decayedRatingAverage.toFixed(2)}
                      </span>
                      <span className="text-amber-400 text-sm">★</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      Super Nota (30d)
                    </span>
                  </div>
                )}
              </div>

              {/* Foto Principal com Banner de Promoção */}
              <div className="relative aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-black/40">
                <img
                  src={post.postImage}
                  alt={post.dishName}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />

                {/* Banner de Promoção Ativa no Topo da Foto */}
                {post.isPromotion && post.promoBadge && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-2xl bg-rose-950/80 backdrop-blur-xl border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2 shadow-xl shadow-rose-950/50">
                    <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>{post.promoBadge}</span>
                  </div>
                )}

                {/* Selo Vegano ou Sem Glúten se aplicável */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 items-end">
                  {post.isVegan && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      100% Vegano
                    </span>
                  )}
                  {post.isGlutenFree && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-950/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-[11px] font-mono shadow-md">
                      Sem Glúten
                    </span>
                  )}
                </div>

                {/* Faixa Flutuante de Preço */}
                <div className="absolute bottom-4 right-4 z-10 px-3.5 py-1.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/20 text-white font-mono font-bold text-sm shadow-xl">
                  R$ {post.dishPrice.toFixed(2)}
                </div>
              </div>

              {/* Síntese da LLM Regional */}
              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed text-zinc-300">
                    <strong className="text-teal-300 font-semibold block mb-0.5">
                      Síntese da IA Regional:
                    </strong>
                    {post.regionalLLMSummary}
                  </div>
                </div>

                {/* Descrição e Legenda */}
                <div>
                  <h4 className="text-base font-semibold text-white tracking-tight mb-1">
                    {post.dishName}
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                {/* Barra de Ações Interativas */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Botão Curtir (Alimenta Dicas da IA em Tempo Real) */}
                    <button
                      onClick={() => onToggleLike(post.id, post.dishName, post.dishCategory)}
                      className={`px-3 py-2 rounded-2xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                        isLiked
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/20'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.10] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform active:scale-125 ${
                          isLiked ? 'fill-rose-400 text-rose-400' : 'text-zinc-400'
                        }`}
                      />
                      <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>

                    {/* Botão de Ver Avaliações Auditadas */}
                    <button
                      onClick={() => setActiveReviewModalPost(post)}
                      className="px-3 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] text-zinc-300 hover:text-white flex items-center gap-2 text-xs font-semibold transition"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-400" />
                      <span>{post.commentsCount} Avaliações</span>
                    </button>

                    {/* Botão Salvar */}
                    <button
                      onClick={() => onToggleSave(post.id)}
                      className={`p-2 rounded-2xl border transition ${
                        isSaved
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.10] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Ação Decisiva: Avaliar Este Restaurante */}
                  {restaurantObj && (
                    <button
                      onClick={() => onSelectRestaurantForReview(restaurantObj)}
                      className="px-3.5 py-2 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/30 text-teal-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
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

      {/* Modal de Avaliações Auditadas */}
      <AnimatePresence>
        {activeReviewModalPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReviewModalPost(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg p-6 bg-[#07090E]/95 border border-white/[0.15] backdrop-blur-3xl rounded-3xl shadow-2xl text-white max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.10] mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Avaliações Auditadas</h3>
                  <p className="text-xs text-zinc-400">{activeReviewModalPost.restaurantName}</p>
                </div>
                <button
                  onClick={() => setActiveReviewModalPost(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs text-zinc-300 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              {/* Lista de Reviews Reais do Restaurante */}
              {(() => {
                const rest = INITIAL_RESTAURANTS.find(r => r.id === activeReviewModalPost.restaurantId);
                if (!rest || rest.reviews.length === 0) {
                  return <p className="text-sm text-zinc-400">Nenhuma avaliação detalhada no momento.</p>;
                }
                return (
                  <div className="space-y-4">
                    {rest.reviews.map(rev => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200">{rev.author}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-teal-400 font-bold">{rev.decayedRating.toFixed(2)}</span>
                            <span className="text-amber-400">★</span>
                            <span className="text-[10px] text-zinc-500 font-mono">({rev.source})</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                          <span>{rev.date}</span>
                          {rev.verifiedAudit && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hash Auditada
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
