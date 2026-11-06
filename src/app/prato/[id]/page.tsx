import React from 'react';
import { Metadata } from 'next';
import { INITIAL_FEED_POSTS, FeedPost } from '../../../data/caraguaData';
import { PratoDetailClient } from './PratoDetailClient';

interface Props {
  params: {
    id: string;
  };
}

function resolveFallbackPost(rawId: string): FeedPost {
  const exact = INITIAL_FEED_POSTS.find((p) => p.id === rawId);
  if (exact) return exact;

  const numMatch = rawId.match(/^(?:post-)?(\d+)$/i);
  if (numMatch) {
    const idx = Math.max(0, parseInt(numMatch[1], 10) - 1);
    return INITIAL_FEED_POSTS[idx % INITIAL_FEED_POSTS.length];
  }

  const lower = rawId.toLowerCase();
  const partial = INITIAL_FEED_POSTS.find(
    (p) =>
      p.id.toLowerCase().includes(lower) ||
      p.dishName.toLowerCase().includes(lower) ||
      p.neighborhood.toLowerCase().includes(lower)
  );
  return partial || INITIAL_FEED_POSTS[0];
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
