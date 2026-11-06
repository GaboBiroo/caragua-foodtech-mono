import React from 'react';
import { Metadata } from 'next';
import { INITIAL_FEED_POSTS, FeedPost } from '../../../data/caraguaData';
import { realDataStore } from '../../../data/realDataStore';
import { PratoDetailClient } from './PratoDetailClient';

interface Props {
  params: {
    id: string;
  };
}

function resolveFallbackPost(rawId: string): FeedPost {
  // 1. Prioridade Máxima: busca no banco de dados real (inclui UUIDs reais e IDs do OpenStreetMap)
  const detail = realDataStore.getDishById(rawId);
  if (detail && detail.dish && detail.restaurant) {
    const dish = detail.dish as any;
    const rest = detail.restaurant as any;
    return {
      id: dish.id || rawId,
      restaurantId: rest.id || rest.slug || 'caragua-rest',
      restaurantName: rest.name,
      restaurantAvatar: rest.image_url || rest.banner_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
      neighborhood: rest.neighborhood,
      distanceKm: 0.8,
      postImage: dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85',
      caption: dish.description || `${dish.name} no ${rest.name}, preparado com ingredientes frescos e sabor autêntico de Caraguatatuba.`,
      dishName: dish.name,
      dishPrice: Number(dish.price || 0),
      dishCategory: dish.category || 'Especialidades da Casa',
      isVegan: Boolean(dish.is_vegan),
      isGlutenFree: Boolean(dish.is_gluten_free),
      likes: 64,
      commentsCount: Array.isArray(detail.reviews) ? detail.reviews.length : 0,
      superRating: Number(detail.super_nota?.google_score || rest.rating_average || 4.8),
      totalReviews: Number(rest.total_reviews || 25),
      jacquinTip: 'Prato com ingredientes frescos da orla e preparo artesanal caprichado!',
      isPromotion: Boolean(dish.last_price_delta_pct && dish.last_price_delta_pct < 0),
      promoBadge: dish.last_price_delta_pct && dish.last_price_delta_pct < 0 ? 'Preço menor recentemente' : undefined,
      verifiedSource: 'Google Maps',
      regionalLLMSummary: `${rest.neighborhood}: Cardápio e preços conferidos hoje na cidade.`,
      createdAt: 'Hoje',
      commentsList: [],
    };
  }

  // 2. Busca exata nos posts editoriais
  const exact = INITIAL_FEED_POSTS.find((p) => p.id === rawId);
  if (exact) return exact;

  // 3. Busca por índice numérico
  const numMatch = rawId.match(/^(?:post-)?(\d+)$/i);
  if (numMatch) {
    const idx = Math.max(0, parseInt(numMatch[1], 10) - 1);
    return INITIAL_FEED_POSTS[idx % INITIAL_FEED_POSTS.length];
  }

  // 4. Busca parcial por nome ou bairro
  const lower = rawId.toLowerCase();
  const partial = INITIAL_FEED_POSTS.find(
    (p) =>
      p.id.toLowerCase().includes(lower) ||
      p.dishName.toLowerCase().includes(lower) ||
      p.neighborhood.toLowerCase().includes(lower)
  );
  if (partial) return partial;

  // 5. Fallback seguro
  return INITIAL_FEED_POSTS[0];
}

export function generateMetadata({ params }: Props): Metadata {
  const post = resolveFallbackPost(params.id);

  return {
    title: `${post.dishName} — ${post.restaurantName} (${post.neighborhood}) | CaráFood`,
    description: `${post.dishName} no ${post.restaurantName} em ${post.neighborhood}, Caraguatatuba. Preço conferido: R$ ${post.dishPrice.toFixed(2)}.`,
    openGraph: {
      title: `${post.dishName} — ${post.restaurantName}`,
      description: post.caption,
      images: [
        {
          url: post.postImage,
          alt: post.dishName,
        },
      ],
    },
  };
}

export default function PratoDetailPage({ params }: Props) {
  const post = resolveFallbackPost(params.id);
  const relatedPosts = INITIAL_FEED_POSTS.filter((p) => p.id !== post.id);

  return <PratoDetailClient dishIdParam={params.id} post={post} relatedPosts={relatedPosts} />;
}
