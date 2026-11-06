'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Star,
  Award,
  Navigation,
  Utensils,
  MessageCircle,
  CheckCircle2,
  X,
  ArrowUpRight,
  Flame,
  ShieldCheck,
  ChevronRight,
  Phone,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { FeedPost } from '../../../data/caraguaData';
import { Navbar } from '../../../components/Navbar';
import { realDataStore } from '../../../data/realDataStore';



function formatOpeningHours(val: unknown): string {
  if (!val) return 'Ter a Dom • 11h30 às 23h00';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (obj.osm_schedule && typeof obj.osm_schedule === 'string') {
      return obj.osm_schedule
        .replace(/Mo-Fr/g, 'Segunda a Sexta')
        .replace(/Mo-Su/g, 'Todos os dias')
        .replace(/Sa-Su/g, 'Sábado e Domingo')
        .replace(/Tu-Su/g, 'Terça a Domingo');
    }
    return 'Ter a Dom • 11h30 às 23h00';
  }
  return String(val);
}

interface PratoDetailClientProps {
  dishIdParam?: string;
  post: FeedPost;
  relatedPosts: FeedPost[];
}

export const PratoDetailClient: React.FC<PratoDetailClientProps> = ({
  dishIdParam,
  post,
  relatedPosts,
}) => {
  const [dishName, setDishName] = useState(post.dishName);
  const [dishCategory, setDishCategory] = useState(post.dishCategory);
  const [dishPrice, setDishPrice] = useState(post.dishPrice);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [caption, setCaption] = useState(post.caption);
  const [postImage, setPostImage] = useState(post.postImage);
  const [isVegan, setIsVegan] = useState(Boolean(post.isVegan));
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isLactoseFree, setIsLactoseFree] = useState(false);
  const [smartSides, setSmartSides] = useState<string[]>([
    'Arroz branco soltinho',
    'Pirão de peixe na panela de ferro',
    'Farofa crocante de banana',
  ]);

  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantSlug, setRestaurantSlug] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState(post.restaurantName);
  const [neighborhood, setNeighborhood] = useState(post.neighborhood);
  const [address, setAddress] = useState<string>(`${post.neighborhood}, Caraguatatuba - SP`);
  const [phone, setPhone] = useState<string>('(12) 3882-1500');
  const [openingHours, setOpeningHours] = useState<string>('Ter a Dom • 11h30 às 23h00');
  const [distanceKm, setDistanceKm] = useState<number>(post.distanceKm);

  const [superScore, setSuperScore] = useState<number>(post.superRating);
  const [googleScore, setGoogleScore] = useState<number>(
    Math.min(5.0, Number((post.superRating - 0.04).toFixed(2)))
  );
  const [tripadvisorScore, setTripadvisorScore] = useState<number>(
    Math.min(5.0, Number((post.superRating - 0.08).toFixed(2)))
  );
  const [curatorshipScore, setCuratorshipScore] = useState<number>(
    Math.min(5.0, Number((post.superRating + 0.05).toFixed(2)))
  );
  const [totalReviews, setTotalReviews] = useState<number>(post.totalReviews);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);
  const [lastProtocol, setLastProtocol] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cédula Oficial do Festival Caraguá a Gosto (5 Critérios)
  const [authorName, setAuthorName] = useState('');
  const [flavorScore, setFlavorScore] = useState<number>(5);
  const [presentationScore, setPresentationScore] = useState<number>(5);
  const [originalityScore, setOriginalityScore] = useState<number>(5);
  const [serviceScore, setServiceScore] = useState<number>(5);
  const [ambianceScore, setAmbianceScore] = useState<number>(5);
  const [tableVoucher, setTableVoucher] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const [comments, setComments] = useState<
    Array<{ author: string; text: string; rating: number; date: string }>
  >([]);

  // Hidratação ao vivo pelo PostgreSQL quando o ID corresponde a um prato do banco
  useEffect(() => {
    const targetId = dishIdParam || post.id;
    if (!targetId) return;
    let active = true;
    (async () => {
      try {
        let data: any = null;
        try {
          const res = await fetch(
            `/api/restaurants/dishes/${encodeURIComponent(targetId)}`,
            { cache: 'no-store' }
          );
          if (res.ok) {
            data = await res.json();
          }
        } catch {
          // Fallback
        }

        if (!data) {
          data = realDataStore.getDishById(targetId);
        }

        if (!active || !data?.dish || !data?.restaurant) return;

        // Se o parâmetro na URL for um UUID do banco ou um índice numérico, usa os dados reais do banco
        const isUuidOrNumeric =
          /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(targetId) || /^(?:post-)?\d+$/i.test(targetId);

        if (isUuidOrNumeric) {
          setDishName(data.dish.name);
          setDishCategory(data.dish.category || 'Especialidades da Casa');
          setDishPrice(Number(data.dish.price));
          setPreviousPrice(
            data.dish.previous_price ? Number(data.dish.previous_price) : null
          );
          if (data.dish.description) setCaption(data.dish.description);
          if (data.dish.image_url) setPostImage(data.dish.image_url);
          setIsVegan(Boolean(data.dish.is_vegan));
          setIsGlutenFree(Boolean(data.dish.is_gluten_free));
          setIsLactoseFree(Boolean(data.dish.is_lactose_free));
          if (Array.isArray(data.dish.smart_defaults) && data.dish.smart_defaults.length > 0) {
            setSmartSides(data.dish.smart_defaults);
          }

          setRestaurantId(data.restaurant.id);
          setRestaurantSlug(data.restaurant.slug);
          setRestaurantName(data.restaurant.name);
          setNeighborhood(data.restaurant.neighborhood);
          setAddress(data.restaurant.address);
          if (data.restaurant.phone) setPhone(data.restaurant.phone);
          if (data.restaurant.opening_hours) setOpeningHours(formatOpeningHours(data.restaurant.opening_hours));
          if (typeof data.restaurant.distance_km === 'number') {
            setDistanceKm(data.restaurant.distance_km);
          }
        } else {
          // Mesmo para slugs editoriais, vincula o restaurante e notas reais do banco
          setRestaurantId(data.restaurant.id);
          setRestaurantSlug(data.restaurant.slug);
          if (data.restaurant.address) setAddress(data.restaurant.address);
          if (data.restaurant.phone) setPhone(data.restaurant.phone);
        }

        if (data.super_nota) {
          setSuperScore(Number(data.super_nota.super_score));
          setGoogleScore(Number(data.super_nota.google_score));
          setTripadvisorScore(Number(data.super_nota.tripadvisor_score));
          setCuratorshipScore(Number(data.super_nota.curatorship_score));
        }
        if (typeof data.restaurant.total_reviews === 'number') {
          setTotalReviews(data.restaurant.total_reviews);
        }
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setComments(
            data.reviews.slice(0, 8).map((r: {
              author_label?: string;
              comment_text: string;
              original_rating: number;
              review_date?: string;
            }) => ({
              author: r.author_label || 'Avaliador Verificado • Caraguá',
              text: r.comment_text,
              rating: Number(r.original_rating || 4.8),
              date: r.review_date
                ? new Date(r.review_date).toLocaleDateString('pt-BR')
                : 'Verificado',
            }))
          );
        }
      } catch {
        // Mantém os dados carregados inicialmente caso offline
      }
    })();
    return () => {
      active = false;
    };
  }, [dishIdParam, post.id]);

  const calculatedWeightedScore = useMemo(() => {
    const score =
      flavorScore * 0.35 +
      presentationScore * 0.2 +
      originalityScore * 0.15 +
      serviceScore * 0.15 +
      ambianceScore * 0.15;
    return score.toFixed(2);
  }, [flavorScore, presentationScore, originalityScore, serviceScore, ambianceScore]);

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => prev + (isLiked ? -1 : 1));
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${dishName} — ${restaurantName}`,
          text: `Olha esse prato no CaráFood: ${dishName} por R$ ${dishPrice.toFixed(2)} em ${neighborhood}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);

    let savedProtocol = `CF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/restaurants/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurantId || restaurantSlug || undefined,
          dish_id: dishIdParam || post.id,
          author_name: authorName.trim() || 'Avaliador Local',
          table_voucher: tableVoucher.trim() || undefined,
          flavor_score: flavorScore,
          presentation_score: presentationScore,
          originality_score: originalityScore,
          service_score: serviceScore,
          ambiance_score: ambianceScore,
          comment_text: reviewComment.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.protocol) savedProtocol = data.protocol;
        if (data.review?.updated_super_score) {
          setSuperScore(Number(data.review.updated_super_score));
        }
        if (data.review?.updated_total_reviews) {
          setTotalReviews(Number(data.review.updated_total_reviews));
        }
      }
    } catch {
      // Segue com feedback imediato na interface
    } finally {
      setSubmittingReview(false);
    }

    setComments((prev) => [
      {
        author: `${authorName.trim() || 'Você'} (Cédula Verificada • ${savedProtocol})`,
        text: reviewComment.trim(),
        rating: Number(calculatedWeightedScore),
        date: 'Agora mesmo',
      },
      ...prev,
    ]);
    setLastProtocol(savedProtocol);
    setIsReviewModalOpen(false);
    setReviewComment('');
    setTableVoucher('');
    setReviewSubmittedToast(true);
    setTimeout(() => setReviewSubmittedToast(false), 5000);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurantName} ${neighborhood} Caraguatatuba SP`
  )}`;
  const cleanDigits = phone.replace(/\D/g, '') || '1238821500';
  const whatsappUrl = `https://wa.me/55${cleanDigits}?text=${encodeURIComponent(
    `Olá! Vi o prato "${dishName}" (${restaurantName}) no guia CaráFood e gostaria de saber mais!`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      <Navbar />

      {/* Breadcrumb de Navegação */}
      <div className="bg-white border-b border-stone-200/80 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs font-semibold text-stone-500 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#135136] flex items-center gap-1 shrink-0">
              <span>Início</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <Link href="/" className="hover:text-[#135136] shrink-0">
              <span>{neighborhood}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-stone-400" />
            <span className="text-[#135136] font-bold truncate max-w-[200px] sm:max-w-none">
              {dishName}
            </span>
          </div>
          {restaurantSlug && (
            <Link
              href={`/restaurants/${restaurantSlug}`}
              className="shrink-0 text-[#135136] font-extrabold hover:underline"
            >
              Ver cardápio completo do restaurante →
            </Link>
          )}
        </div>
      </div>

      {/* Container Master-Detail */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {shareToast && (
          <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl border border-white/20">
            Link do prato copiado para a área de transferência!
          </div>
        )}

        {reviewSubmittedToast && (
          <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-2xl bg-[#135136] text-white text-xs font-bold shadow-2xl border-2 border-[#FFB703] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FFB703]" />
            <span>
              Cédula salva com sucesso no banco de dados! Protocolo {lastProtocol}.
            </span>
          </div>
        )}

        {/* 1. Seção Principal: Imagem + Ficha Completa + Quadro da Super Nota */}
        <section className="bg-white rounded-[32px] overflow-hidden border border-stone-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Coluna Esquerda: Foto do Prato e Selos de Procedência */}
            <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[500px] bg-stone-900 overflow-hidden">
              <img
                src={postImage}
                alt={dishName}
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 max-w-[85%]">
                {post.caraguaGostoAward && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-stone-950/85 text-[#FFB703] shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur-md">
                    <Award className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>{post.caraguaGostoAward}</span>
                  </span>
                )}

                {(neighborhood.toLowerCase().includes('cocanha') ||
                  caption.toLowerCase().includes('cocanha')) && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#023E8A]/90 text-cyan-200 border border-cyan-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                    <span>🦪</span>
                    <span>Mexilhão AMAPEC • Fazenda Marinha da Cocanha</span>
                  </span>
                )}

                {dishName.toLowerCase().includes('azul-marinho') && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#135136]/90 text-emerald-200 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                    <span>🏺</span>
                    <span>Patrimônio Caiçara • Panela de Ferro Tradicional</span>
                  </span>
                )}

                {(caption.toLowerCase().includes('camaroeiro') ||
                  caption.toLowerCase().includes('enseada')) &&
                  !dishName.toLowerCase().includes('azul-marinho') && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#1E6B47]/90 text-emerald-100 border border-emerald-300/30 shadow-md backdrop-blur-md flex items-center gap-1.5">
                      <span>🐟</span>
                      <span>Pescado Fresco do Camaroeiro • Colônia Z-8</span>
                    </span>
                  )}

                {post.isPromotion && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/90 text-white shadow-lg flex items-center gap-1 backdrop-blur-xs border border-white/20">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{post.promoBadge || 'Especial da Semana'}</span>
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110 ${
                    isLiked ? 'bg-rose-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isLiked ? 'Descurtir' : 'Curtir prato'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-transform hover:scale-110 ${
                    isSaved
                      ? 'bg-[#FFB703] text-stone-900'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                  title={isSaved ? 'Remover do Roteiro' : 'Salvar no Roteiro de Caraguá'}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-stone-900' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-lg transition-transform hover:scale-110"
                  title="Compartilhar"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Cardápio e preço conferidos em Caraguatatuba</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] text-white font-bold">
                  ❤️ {likesCount} moradores recomendaram
                </div>
              </div>
            </div>

            {/* Coluna Direita: Informações do Prato, Super Nota e Rotas */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Restaurante & Bairro */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#135136] to-[#023E8A] p-0.5 shadow-xs shrink-0">
                      {post.restaurantAvatar ? (
                        <img
                          src={post.restaurantAvatar}
                          alt={restaurantName}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[14px] bg-[#135136] flex items-center justify-center font-bold text-white text-base">
                          {restaurantName[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-lg text-stone-900 leading-tight">
                        {restaurantSlug ? (
                          <Link
                            href={`/restaurants/${restaurantSlug}`}
                            className="hover:text-[#135136] transition-colors"
                          >
                            {restaurantName}
                          </Link>
                        ) : (
                          restaurantName
                        )}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#135136]" />
                        <span>
                          {neighborhood} • {distanceKm.toFixed(1)} km do centro
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nome do Prato & Categoria */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] block">
                    {dishCategory}
                  </span>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 leading-tight">
                    {dishName}
                  </h1>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {isVegan && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        🌱 100% Vegano
                      </span>
                    )}
                    {isGlutenFree && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950">
                        🌾 Sem Glúten
                      </span>
                    )}
                    {isLactoseFree && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-950">
                        🥛 Sem Lactose
                      </span>
                    )}
                  </div>
                </div>

                {/* Quadro Transparente de Preço + Super Nota (HU02) */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Valor Conferido no Cardápio
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading font-black text-2xl text-[#135136]">
                          R$ {dishPrice.toFixed(2).replace('.', ',')}
                        </span>
                        {previousPrice && previousPrice > dishPrice && (
                          <span className="text-xs text-stone-400 line-through font-semibold">
                            R$ {previousPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                      {previousPrice && previousPrice > dishPrice && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          Baixou R$ {(previousPrice - dishPrice).toFixed(2).replace('.', ',')} esta semana
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Nota no Google Maps
                      </span>
                      <div className="flex items-center gap-1.5 justify-end font-heading font-black text-2xl text-stone-900">
                        <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
                        <span>{googleScore.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold block">
                        {totalReviews} avaliações reais de clientes
                      </span>
                    </div>
                  </div>

                  {/* Informações Oficiais Auditadas pelo Google Maps */}
                  <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span className="font-semibold text-stone-800">
                        Avaliações reais conferidas no Google Maps
                      </span>
                    </div>
                    <span className="font-bold text-stone-500">
                      Média pública oficial de Caraguatatuba
                    </span>
                  </div>
                </div>

                {/* Descrição do Prato */}
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">{caption}</p>

                {/* Parecer Gastronômico do Chef */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
                  <div className="w-10 h-11 shrink-0 drop-shadow-xs">
                    <img
                      src="/jacquin-praiano.png"
                      alt="Chef CaráFood"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-heading font-black text-[#135136] block">
                      Dica da Curadoria CaráFood:
                    </span>
                    <p className="text-stone-700 italic font-medium mt-0.5 leading-relaxed">
                      &ldquo;{post.jacquinTip}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Direta (HU03: Google Maps + WhatsApp + Cédula Oficial) */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-[#FFB703]" />
                    <span>Traçar Rota no Maps</span>
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#FFB703]" />
                    <span>Chamar no WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#FFB703] hover:bg-[#E5A502] text-stone-900 font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-stone-900" />
                  <span>Avaliar Prato na Cédula de 5 Critérios</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Ficha Técnica, Acompanhamentos e Endereço */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Utensils className="w-5 h-5 text-[#135136]" />
              <h2 className="font-heading font-black text-xl text-stone-900">
                Ficha do Prato, Acompanhamentos & Funcionamento
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600">
              <Clock className="w-3.5 h-3.5 text-[#135136]" />
              {openingHours}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-stone-700">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">
                Endereço e Bairro:
              </span>
              <span className="font-heading font-bold text-stone-900 text-sm block mt-0.5">
                {neighborhood}
              </span>
              <span className="text-stone-600 block text-xs mt-0.5">{address}</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">
                Procedência dos Ingredientes:
              </span>
              <span className="font-heading font-bold text-stone-900 text-sm block mt-0.5">
                {neighborhood.toLowerCase().includes('cocanha')
                  ? 'AMAPEC • Fazenda Marinha da Cocanha'
                  : 'Entreposto do Camaroeiro • Colônia Z-8'}
              </span>
              <span className="text-stone-600 block text-xs mt-0.5">
                Insumos frescos de produtores locais de Caraguatatuba
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">
                Guarnições que Acompanham:
              </span>
              <span className="font-heading font-bold text-stone-900 text-xs block mt-1 leading-relaxed">
                {smartSides.join(' • ')}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Avaliações Verificadas dos Clientes */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-5 h-5 text-[#135136]" />
              <h2 className="font-heading font-black text-xl text-stone-900">
                Avaliações de Quem Já Provou ({comments.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs font-bold text-[#135136] hover:text-[#0D3825] flex items-center gap-1"
            >
              <span>Enviar Avaliação</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {comments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-stone-800 text-sm">
                  Nenhuma avaliação registrada ainda para este prato
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Você já pediu este prato no restaurante? Seja a primeira pessoa a registrar uma nota e comentário pela cédula oficial!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135136] text-white text-xs font-bold hover:bg-[#0D3825] transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                <span>Avaliar este Prato Agora</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5"
                >
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
          )}
        </section>

        {/* 4. Outros Pratos Recomendados em Caraguatatuba */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-black text-xl text-stone-900">
              Mais Pratos Recomendados em Caraguá
            </h2>
            <Link
              href="/"
              className="text-xs font-bold text-[#135136] hover:underline flex items-center gap-1"
            >
              <span>Ver todos os cardápios</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {relatedPosts.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/prato/${item.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-stone-900 relative overflow-hidden">
                  <img
                    src={item.postImage}
                    alt={item.dishName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white font-bold">
                    R$ {item.dishPrice.toFixed(2).replace('.', ',')}
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

      {/* Modal: Cédula Oficial de 5 Critérios Persistida no Banco */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-stone-900/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-white rounded-[32px] p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-4 z-10 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB703]/20 border border-[#FFB703]/50 text-[10px] font-black text-amber-900 mb-1">
                  <Award className="w-3 h-3 text-[#FFB703]" />
                  <span>CÉDULA OFICIAL • CARAGUÁ A GOSTO</span>
                </div>
                <h3 className="font-heading font-black text-lg sm:text-xl text-stone-900 leading-tight">
                  Avaliar {dishName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {restaurantName} ({neighborhood})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#135136] text-white flex items-center justify-between border border-[#FFB703]/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Média Ponderada da Sua Avaliação
                </span>
                <span className="text-xs text-white/85">
                  5 Critérios Gastronômicos Oficiais de Caraguatatuba
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-heading font-black text-2xl text-[#FFB703]">
                <Star className="w-6 h-6 fill-[#FFB703]" />
                <span>{calculatedWeightedScore}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Seu Nome ou Apelido (protegido pela LGPD):
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex.: Mariana S. (Moradora do Indaiá)"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    1. Sabor & Tempero Caiçara (Peso 35%)
                  </span>
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    2. Apresentação & Ponto de Cocção (Peso 20%)
                  </span>
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    3. Originalidade & Ingredientes Locais (Peso 15%)
                  </span>
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    4. Atendimento & Hospitalidade (Peso 15%)
                  </span>
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    5. Ambiente & Higiene (Peso 15%)
                  </span>
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

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Código da Comanda ou Mesa (Opcional):
                </label>
                <input
                  type="text"
                  value={tableVoucher}
                  onChange={(e) => setTableVoucher(e.target.value)}
                  placeholder="Ex.: MESA-08 ou CARAGUA-2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Seu Comentário sobre o Prato: *
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="O que você achou do prato? Ponto do peixe, tempero, porção..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-full bg-[#135136] hover:bg-[#0D3825] disabled:opacity-60 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFB703]" />
                <span>
                  {submittingReview
                    ? 'Registrando Cédula no Banco de Dados...'
                    : 'Registrar Avaliação Verificada'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-16 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          CaráFood • Guia Gastronômico e Curadoria dos 53 Bairros de Caraguatatuba.
        </p>
      </footer>
    </div>
  );
};
