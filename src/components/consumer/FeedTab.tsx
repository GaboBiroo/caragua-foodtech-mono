'use client';

import React, { useState } from 'react';
import { FeedPost } from '@/data/caraguaData';
import { Heart, MessageCircle, Sparkles, MapPin, Flame, Send } from 'lucide-react';

interface FeedTabProps {
  posts: FeedPost[];
  onSelectRestaurant: (restaurantId: string) => void;
}

export function FeedTab({ posts: initialPosts, onSelectRestaurant }: FeedTabProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const handleToggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const isLiked = !prev[postId];
      setPosts(current =>
        current.map(p =>
          p.id === postId ? { ...p, likes: p.likes + (isLiked ? 1 : -1) } : p
        )
      );
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    setPosts(current =>
      current.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [
              ...p.commentsList,
              { author: "você", text: newComment.trim(), time: "Agora" }
            ]
          };
        }
        return p;
      })
    );
    setNewComment('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Stories / Polos de Caraguá */}
      <div className="pt-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">
          Polos Gastronômicos de Caraguá
        </h3>
        <div className="flex gap-3 overflow-x-auto px-3 pb-2 no-scrollbar">
          {[
            { name: "Martim de Sá", emoji: "🏖️", active: true },
            { name: "Centro", emoji: "🏛️", active: true },
            { name: "Indaiá", emoji: "🍤", active: true },
            { name: "Massaguaçu", emoji: "🐟", active: true },
            { name: "Porto Novo", emoji: "⛵", active: true },
          ].map((polo, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-sky-500 group-hover:scale-105 transition">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl">
                  {polo.emoji}
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-300 whitespace-nowrap">
                {polo.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-6 px-3">
        {posts.map((post) => {
          const isLiked = likedPosts[post.id];
          return (
            <div
              key={post.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md"
            >
              {/* Header do Post */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onSelectRestaurant(post.restaurantId)}
                >
                  <img
                    src={post.authorAvatar}
                    alt={post.restaurantName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm hover:text-sky-400 transition">
                      {post.restaurantName}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-400" /> {post.neighborhood} • {post.createdAt}
                    </span>
                  </div>
                </div>

                {post.isPromotion && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1 border border-rose-500/30">
                    <Flame className="w-3.5 h-3.5 fill-rose-500" /> {post.promoBadge}
                  </span>
                )}
              </div>

              {/* Imagem do Prato */}
              <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                <img
                  src={post.postImage}
                  alt={post.dishName}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white font-bold text-xs flex items-center gap-2">
                  <span>{post.dishName}</span>
                  <span className="text-sky-400">R$ {post.dishPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Ações (Curtir, Comentar) */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-rose-500 transition group"
                    >
                      <Heart
                        className={`w-6 h-6 transition ${
                          isLiked
                            ? 'fill-rose-500 text-rose-500 scale-110'
                            : 'text-slate-400 group-hover:text-rose-400'
                        }`}
                      />
                      <span className="text-xs font-semibold">{post.likes}</span>
                    </button>

                    <button
                      onClick={() =>
                        setActiveCommentPost(activeCommentPost === post.id ? null : post.id)
                      }
                      className="flex items-center gap-1.5 text-slate-300 hover:text-sky-400 transition"
                    >
                      <MessageCircle className="w-6 h-6 text-slate-400 hover:text-sky-400" />
                      <span className="text-xs font-semibold">{post.commentsCount}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectRestaurant(post.restaurantId)}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 transition"
                  >
                    Ver Restaurante →
                  </button>
                </div>

                {/* Legenda */}
                <p className="text-sm text-slate-200 leading-snug">
                  <span className="font-bold text-white mr-2">{post.restaurantName}</span>
                  {post.caption}
                </p>

                {/* Resumo da LLM Regional */}
                <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-200 leading-relaxed font-medium">
                    {post.regionalLLMSummary}
                  </p>
                </div>

                {/* Comentários Expansíveis */}
                {activeCommentPost === post.id && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {post.commentsList.map((c, i) => (
                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="font-bold text-white">{c.author}:</span>
                          <span className="flex-1">{c.text}</span>
                          <span className="text-[10px] text-slate-500">{c.time}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicionar um comentário..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
