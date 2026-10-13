'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Heart, Bookmark, Share2, MapPin, Star, Award, 
  Sparkles, Navigation, Clock, Utensils, MessageCircle, 
  CheckCircle2, X, Send, ArrowUpRight, Flame, ShieldCheck, ChevronRight
} from 'lucide-react';
import { FeedPost, INITIAL_FEED_POSTS } from '../../../data/caraguaData';
import { Navbar } from '../../../components/Navbar';

interface PratoDetailClientProps {
  post: FeedPost;
  relatedPosts: FeedPost[];
}

export const PratoDetailClient: React.FC<PratoDetailClientProps> = ({ post, relatedPosts }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  // Cédula Oficial do Festival Caraguá a Gosto (5 Critérios Auditados)
  const [flavorScore, setFlavorScore] = useState<number>(5);
  const [presentationScore, setPresentationScore] = useState<number>(5);
  const [originalityScore, setOriginalityScore] = useState<number>(5);
  const [serviceScore, setServiceScore] = useState<number>(5);
  const [ambianceScore, setAmbianceScore] = useState<number>(5);
  const [tableVoucher, setTableVoucher] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Comentários vivos
  const [comments, setComments] = useState(
    post.commentsList || [
      { author: 'Comensal Caiçara', text: 'Prato sensacional, frescor incomparável e muito bem servido!', rating: 5, date: 'Recentemente' }
    ]
  );

  const calculatedWeightedScore = useMemo(() => {
    const score = flavorScore * 0.35 + presentationScore * 0.20 + originalityScore * 0.15 + serviceScore * 0.15 + ambianceScore * 0.15;
    return score.toFixed(2);
  }, [flavorScore, presentationScore, originalityScore, serviceScore, ambianceScore]);

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => prev + (isLiked ? -1 : 1));
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.dishName} — ${post.restaurantName}`,
        text: `Olha esse prato que encontrei no Caraguá FoodTech: ${post.dishName} por R$ ${post.dishPrice.toFixed(2)} em ${post.neighborhood}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      setComments(prev => [
        {
          author: 'Você (Avaliador Auditado)',
          text: reviewComment.trim(),
          rating: Number(calculatedWeightedScore),
          date: 'Agora'
        },
        ...prev
      ]);
    }
    setIsReviewModalOpen(false);
    setReviewComment('');
    setTableVoucher('');
    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 4500);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${post.restaurantName} ${post.neighborhood} Caraguatatuba`)}`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      {/* NAVBAR GLOBAL INTEGRADA */}
      <Navbar />

      {/* BREADCRUMB DE NAVEGAÇÃO HIERÁRQUICA */}
      <div className="bg-white border-b border-stone-200/80 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs font-semibold text-stone-500 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-[#135136] flex items-center gap-1 shrink-0">
            <span>Início</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <Link href={`/?bairro=${encodeURIComponent(post.neighborhood)}`} className="hover:text-[#135136] shrink-0">
            <span>{post.neighborhood}</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <span className="text-[#135136] font-bold truncate max-w-[200px] sm:max-w-none">
            {post.dishName}
          </span>
        </div>
      </div>

      {/* CONTAINER PRINCIPAL MASTER-DETAIL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* TOASTS FLUTUANTES DE FEEDBACK */}
        {shareToast && (
          <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl border border-white/20 animate-in fade-in">
            Link do prato copiado para a área de transferência!
          </div>
        )}

        {reviewSubmittedToast && (
          <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl bg-[#135136] text-white text-xs font-bold shadow-2xl border-2 border-[#FFB703] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#FFB703]" />
            <span>Cédula auditada enviada com sucesso! Você ganhou +50 Pontos Gourmet.</span>
          </div>
        )}

        {/* 1. SEÇÃO PRINCIPAL: GRID IMAGEM + DETALHES DE ALTA FIDELIDADE */}
        <section className="bg-white rounded-[32px] overflow-hidden border border-stone-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* COLUNA ESQUERDA: FOTO DO PRATO COM BADGES */}
            <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[480px] bg-stone-900 overflow-hidden">
              <img
                src={post.postImage}
                alt={post.dishName}
                className="w-full h-full object-cover object-center"
              />

              {/* Badges Flutuantes Liquid Glass */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 max-w-[85%]">
                {post.caraguaGostoAward && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-stone-950/85 text-[#FFB703] shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur-md">
                    <Award className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>{post.caraguaGostoAward}</span>
                  </span>
                )}

                {(post.id.includes('cocanha') || post.caption.toLowerCase().includes('cocanha')) && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#023E8A]/90 text-cyan-200 border border-cyan-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                    <span>🦪</span>
                    <span>Mexilhão AMAPEC • Fazenda Marinha Cocanha</span>
                  </span>
                )}

                {post.dishName.toLowerCase().includes('azul-marinho') && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#135136]/90 text-emerald-200 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                    <span>🏺</span>
                    <span>Patrimônio Imaterial • Panela de Ferro & Taninos</span>
                  </span>
                )}

                {(post.caption.toLowerCase().includes('camaroeiro') || post.caption.toLowerCase().includes('enseada')) && !post.dishName.toLowerCase().includes('azul-marinho') && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#1E6B47]/90 text-emerald-100 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                    <span>🐟</span>
                    <span>Pescado do Camaroeiro • Colônia Z-8</span>
                  </span>
                )}

                {post.isPromotion && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/90 text-white shadow-lg flex items-center gap-1 backdrop-blur-sm border border-white/20">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{post.promoBadge || 'Promoção'}</span>
                  </span>
                )}
              </div>

              {/* Botões Flutuantes de Ação Rápida no Canto Superior Direito */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={handleToggleLike}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110 ${
                    isLiked ? 'bg-rose-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isLiked ? "Descurtir" : "Curtir"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110 ${
                    isSaved ? 'bg-[#FFB703] text-stone-900' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isSaved ? "Remover do Roteiro" : "Salvar no Roteiro de Caraguá"}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-stone-900' : ''}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Badge de Verificação de Procedência */}
              <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Origem Auditada: {post.verifiedSource}</span>
              </div>
            </div>

            {/* COLUNA DIREITA: INFORMAÇÕES DO PRATO E RESTAURANTE */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                
                {/* Restaurante & Bairro */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#135136] to-[#023E8A] p-0.5 shadow-sm">
                    {post.restaurantAvatar ? (
                      <img src={post.restaurantAvatar} alt={post.restaurantName} className="w-full h-full object-cover rounded-[14px]" />
                    ) : (
                      <div className="w-full h-full rounded-[14px] bg-[#135136] flex items-center justify-center font-bold text-white text-base">
                        {post.restaurantName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-stone-900 leading-tight">
                      {post.restaurantName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#FFB703]" />
                      <span>{post.neighborhood} • {post.distanceKm.toFixed(1)} km do centro</span>
                    </div>
                  </div>
                </div>

                {/* Nome do Prato & Categoria */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] block">
                    {post.dishCategory}
                  </span>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
                    {post.dishName}
                  </h1>
                </div>

                {/* Preço e Super Nota */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] border border-stone-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Valor no Cardápio
                    </span>
                    <span className="font-heading font-black text-2xl text-[#135136]">
                      R$ {post.dishPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Super Nota Ponderada
                    </span>
                    <div className="flex items-center gap-1.5 justify-end font-heading font-black text-xl text-stone-900">
                      <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
                      <span>{post.superRating.toFixed(2)}</span>
                      <span className="text-xs text-stone-500 font-normal">({post.totalReviews} votos)</span>
                    </div>
                  </div>
                </div>

                {/* Descrição / Caption do Prato */}
                <div className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                  <p>{post.caption}</p>
                </div>

                {/* Dica Exclusiva do Chef Jacquin Praiano */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
                  <div className="w-11 h-12 shrink-0 drop-shadow-sm">
                    <img src="/jacquin-praiano.png" alt="Chef Jacquin" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <span className="font-heading font-black text-[#135136] block">
                      Parecer Gastronômico do Chef Jacquin:
                    </span>
                    <p className="text-stone-700 italic font-medium mt-1 leading-relaxed">
                      &quot;{post.jacquinTip}&quot;
                    </p>
                  </div>
                </div>

              </div>

              {/* BOTÕES DE AÇÃO PRINCIPAIS (CTAs) */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Navigation className="w-4 h-4 text-[#FFB703]" />
                  <span>Como Chegar (Abrir no Google Maps / Waze)</span>
                </a>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-3.5 rounded-full bg-[#FFB703] hover:bg-[#E5A502] text-stone-900 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Award className="w-4 h-4 text-stone-900" />
                  <span>Avaliar na Cédula Oficial (+50 Pontos)</span>
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* 2. SEÇÃO DE FICHA TÉCNICA CAIÇARA & RASTREABILIDADE */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Utensils className="w-5 h-5 text-[#135136]" />
            <h2 className="font-heading font-black text-xl text-stone-900">
              Ficha Técnica do Prato & Insumos Hiperlocais
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm text-stone-700">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">Polo Gastronômico:</span>
              <span className="font-heading font-bold text-stone-900 text-sm">{post.neighborhood}</span>
              <span className="text-stone-500 block text-xs">Caraguatatuba - Litoral Norte SP</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">Rastreabilidade dos Insumos:</span>
              <span className="font-heading font-bold text-stone-900 text-sm">
                {post.id.includes('cocanha') ? 'AMAPEC Fazenda Marinha' : 'Colônia Z-8 Camaroeiro'}
              </span>
              <span className="text-stone-500 block text-xs">Cadeia produtiva sustentável</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">Perfil Nutricional & Dieta:</span>
              <span className="font-heading font-bold text-stone-900 text-sm">
                {post.isVegan ? '🌿 100% Vegano' : '🦞 Frutos do Mar Frescos'}
              </span>
              <span className="text-stone-500 block text-xs">Preparado no dia</span>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO DE COMENTÁRIOS E AVALIAÇÕES DOS COMENSAIS */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5 text-[#135136]" />
              <h2 className="font-heading font-black text-xl text-stone-900">
                Avaliações Auditadas ({comments.length})
              </h2>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs font-bold text-[#135136] hover:text-[#0D3825] flex items-center gap-1"
            >
              <span>Emitir Cédula</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-heading font-bold text-stone-900">{c.author}</span>
                  <div className="flex items-center gap-1 text-[#FFB703]">
                    <Star className="w-3.5 h-3.5 fill-[#FFB703]" />
                    <span className="font-black text-stone-900">{c.rating.toFixed(1)}</span>
                    <span className="text-stone-400 font-normal">• {c.date}</span>
                  </div>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">&ldquo;{c.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. RECOMENDAÇÕES: OUTROS PRATOS DE CARAGUATATUBA */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-stone-900">
              Mais Pratos Recomendados em Caraguá
            </h2>
            <Link href="/" className="text-xs font-bold text-[#135136] hover:underline flex items-center gap-1">
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {relatedPosts.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/prato/${item.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-stone-900 relative overflow-hidden">
                  <img
                    src={item.postImage}
                    alt={item.dishName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-bold">
                    R$ {item.dishPrice.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                    {item.neighborhood}
                  </span>
                  <h4 className="font-heading font-bold text-stone-900 text-sm group-hover:text-[#135136] transition-colors line-clamp-1">
                    {item.dishName}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-stone-600">
                    <Star className="w-3 h-3 text-[#FFB703] fill-[#FFB703]" />
                    <span className="font-bold">{item.superRating.toFixed(2)}</span>
                    <span>• {item.restaurantName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* MODAL OFICIAL: CÉDULA DIGITAL DO FESTIVAL CARAGUÁ A GOSTO */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-stone-900/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-4 z-10 max-h-[92vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Header da Cédula */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/50 text-[10px] font-black text-amber-900 mb-1">
                  <Award className="w-3 h-3 text-[#FFB703]" />
                  <span>CÉDULA OFICIAL • CARAGUÁ A GOSTO</span>
                </div>
                <h3 className="font-heading font-black text-lg sm:text-xl text-stone-900 leading-tight">
                  Avaliar {post.dishName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {post.restaurantName} ({post.neighborhood}) • Ganhe +50 Pontos
                </p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Box de Resumo da Super Nota Ponderada Calculada em Tempo Real */}
            <div className="p-4 rounded-2xl bg-[#135136] text-white flex items-center justify-between border border-[#FFB703]/40 shadow-inner">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Super Nota Calculada (Auditoria Oficial)
                </span>
                <span className="text-xs text-white/80">5 Critérios Oficiais com Ponderação Algorítmica</span>
              </div>
              <div className="flex items-center gap-1.5 font-heading font-black text-2xl text-[#FFB703]">
                <Star className="w-6 h-6 fill-[#FFB703]" />
                <span>{calculatedWeightedScore}</span>
              </div>
            </div>

            {/* Formulário com os 5 Critérios Ponderados */}
            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              
              {/* Critério 1: Sabor & Tempero Caiçara (35%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">1. Sabor & Tempero Caiçara (Peso 35%)</span>
                  <span className="font-black text-[#135136]">{flavorScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={flavorScore}
                  onChange={(e) => setFlavorScore(parseFloat(e.target.value))}
                  className="w-full accent-[#135136] cursor-pointer"
                />
              </div>

              {/* Critério 2: Apresentação & Cocção (20%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">2. Apresentação & Cocção (Peso 20%)</span>
                  <span className="font-black text-[#135136]">{presentationScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={presentationScore}
                  onChange={(e) => setPresentationScore(parseFloat(e.target.value))}
                  className="w-full accent-[#135136] cursor-pointer"
                />
              </div>

              {/* Critério 3: Originalidade & Insumos Locais (15%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">3. Originalidade & Insumos Locais (Peso 15%)</span>
                  <span className="font-black text-[#135136]">{originalityScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={originalityScore}
                  onChange={(e) => setOriginalityScore(parseFloat(e.target.value))}
                  className="w-full accent-[#135136] cursor-pointer"
                />
              </div>

              {/* Critério 4: Atendimento & Equipe (15%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">4. Atendimento & Equipe (Peso 15%)</span>
                  <span className="font-black text-[#135136]">{serviceScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={serviceScore}
                  onChange={(e) => setServiceScore(parseFloat(e.target.value))}
                  className="w-full accent-[#135136] cursor-pointer"
                />
              </div>

              {/* Critério 5: Ambiente & Higiene (15%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">5. Ambiente & Higiene (Peso 15%)</span>
                  <span className="font-black text-[#135136]">{ambianceScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={ambianceScore}
                  onChange={(e) => setAmbianceScore(parseFloat(e.target.value))}
                  className="w-full accent-[#135136] cursor-pointer"
                />
              </div>

              {/* Voucher de Mesa Opcional */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Código da Comanda ou Mesa (Opcional):
                </label>
                <input
                  type="text"
                  value={tableVoucher}
                  onChange={(e) => setTableVoucher(e.target.value)}
                  placeholder="Ex: MESA-08 ou CARAGUA-2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>

              {/* Parecer do Comensal */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Seu Comentário Gastronômico: *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="O que você achou do prato? Ponto do peixe, tempero, crocância..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136] resize-none"
                />
              </div>

              {/* Botão de Submissão da Cédula */}
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB703]" />
                <span>Transmitir Cédula Auditada (+50 Pontos)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-16 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          Caraguá FoodTech • Ficha Oficial do Prato & Rastreabilidade Gastronômica Caiçara.
        </p>
      </footer>
    </div>
  );
};
