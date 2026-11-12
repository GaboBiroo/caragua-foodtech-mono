import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { INITIAL_FEED_POSTS, FeedPost } from '../../../data/caraguaData';
import { realDataStore } from '../../../data/realDataStore';
import { PratoDetailClient } from './PratoDetailClient';

interface Props {
  params: {
    id: string;
  };
}

function resolvePostAndRelated(rawId: string): {
  post: FeedPost | null;
  relatedPosts: FeedPost[];
  extraMeta?: { menuUrl?: string | null; sourcePlatform?: string | null; phone?: string | null; openingHours?: string | null; address?: string | null };
} {
  const detail = realDataStore.getDishById(rawId);
  if (detail && detail.dish && detail.restaurant) {
    const dish = detail.dish as any;
    const rest = detail.restaurant as any;
    const post: FeedPost = {
      id: dish.id || rawId,
      restaurantId: rest.id || rest.slug || 'caragua-rest',
      restaurantName: rest.name,
      restaurantAvatar: rest.image_url || rest.banner_url || '',
      neighborhood: rest.neighborhood || 'Caraguatatuba',
      distanceKm: Number(rest.distance_km || 0),
      postImage: dish.image_url || rest.banner_url || rest.image_url || '',
      postImageWidth:
        Number(dish.image_url ? dish.image_width || 0 : rest.banner_width || 0) || undefined,
      postImageHeight:
        Number(dish.image_url ? dish.image_height || 0 : rest.banner_height || 0) || undefined,
      caption: dish.description || `${dish.name} no cardápio real de ${rest.name}.`,
      dishName: dish.name,
      dishPrice: Number(dish.price || 0),
      dishCategory: dish.category || 'Cardápio',
      isVegan: Boolean(dish.is_vegan),
      isGlutenFree: Boolean(dish.is_gluten_free),
      likes: 0,
      commentsCount: Array.isArray(detail.reviews) ? detail.reviews.length : 0,
      superRating: Number(detail.super_nota?.google_score || rest.rating_average || 0),
      totalReviews: Number(rest.total_reviews || 0),
      jacquinTip: `Extraído de ${rest.source_platform || 'cardápio digital'} • ${rest.neighborhood || 'Caraguatatuba'}.`,
      isPromotion: Boolean(dish.last_price_delta_pct && dish.last_price_delta_pct < 0),
      promoBadge:
        dish.last_price_delta_pct && dish.last_price_delta_pct < 0 && dish.savings_brl
          ? `Baixou R$ ${Number(dish.savings_brl).toFixed(2).replace('.', ',')}`
          : undefined,
      verifiedSource: 'Google Maps',
      regionalLLMSummary: `${rest.neighborhood}: Cardápio real conferido na cidade.`,
      createdAt: 'Conferido',
      commentsList: Array.isArray(detail.reviews)
        ? detail.reviews.map((r: any) => ({
            author: r.author || r.author_label || 'Cliente Google Maps',
            text: r.comment || r.comment_text || '',
            rating: Number(r.rating || r.original_rating || 5.0),
            date: r.date || r.review_date || 'Google Maps',
          }))
        : [],
    };

    const related: FeedPost[] = (detail.related_dishes || [])
      .filter((rd: any) => rd.id !== post.id && Boolean(rd.image_url))
      .map((rd: any) => ({
        ...post,
        id: rd.id,
        dishName: rd.name,
        dishPrice: Number(rd.price || 0),
        dishCategory: rd.category || 'Cardápio',
        postImage: rd.image_url || '',
        postImageWidth: Number(rd.image_width || 0) || undefined,
        postImageHeight: Number(rd.image_height || 0) || undefined,
        caption: rd.description || rd.name,
      }));

    const fallbackRelated = related.length > 0
      ? related
      : INITIAL_FEED_POSTS.filter((p) => p.id !== post.id).slice(0, 3);

    return {
      post,
      relatedPosts: fallbackRelated,
      extraMeta: {
        menuUrl: rest.menu_url || rest.website || null,
        sourcePlatform: rest.source_platform || null,
        phone: rest.phone || null,
        openingHours: rest.opening_hours || null,
        address: rest.address || null,
      },
    };
  }

  const exact = INITIAL_FEED_POSTS.find((p) => p.id === rawId);
  if (exact) {
    return {
      post: exact,
      relatedPosts: INITIAL_FEED_POSTS.filter((p) => p.id !== exact.id).slice(0, 3),
    };
  }

  return { post: null, relatedPosts: [] };
}

export function generateMetadata({ params }: Props): Metadata {
  const { post } = resolvePostAndRelated(params.id);
  if (!post) {
    return {
      title: 'Prato não encontrado | CaráFood Caraguatatuba',
      description: 'Explore os pratos reais, preços e fotos de restaurantes em Caraguatatuba.',
    };
  }

  return {
    title: `${post.dishName} — ${post.restaurantName} (${post.neighborhood}) | CaráFood`,
    description: `${post.dishName} no ${post.restaurantName} em ${post.neighborhood}, Caraguatatuba. Preço real: R$ ${post.dishPrice.toFixed(2)}.`,
    openGraph: post.postImage
      ? {
          title: `${post.dishName} — ${post.restaurantName}`,
          description: post.caption,
          images: [{ url: post.postImage, alt: post.dishName }],
        }
      : undefined,
  };
}

export default function PratoDetailPage({ params }: Props) {
  const { post, relatedPosts, extraMeta } = resolvePostAndRelated(params.id);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <h1 className="font-heading font-black text-2xl text-stone-900">
            Prato atualizado ou removido do cardápio
          </h1>
          <p className="text-sm text-stone-600">
            Esse link pertence a uma versão anterior do catálogo. Veja os pratos reais disponíveis agora em Caraguatatuba!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-sm transition-colors"
          >
            Ver Cardápios Reais de Caraguá
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PratoDetailClient
      dishIdParam={params.id}
      post={post}
      relatedPosts={relatedPosts}
      initialMenuUrl={extraMeta?.menuUrl ?? null}
      initialSourcePlatform={extraMeta?.sourcePlatform ?? null}
      initialPhone={extraMeta?.phone ?? null}
      initialOpeningHours={extraMeta?.openingHours ?? null}
      initialAddress={extraMeta?.address ?? null}
    />
  );
}
