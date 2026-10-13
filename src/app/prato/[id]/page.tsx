import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INITIAL_FEED_POSTS } from '../../../data/caraguaData';
import { PratoDetailClient } from './PratoDetailClient';

interface Props {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return INITIAL_FEED_POSTS.map((post) => ({
    id: post.id,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = INITIAL_FEED_POSTS.find((p) => p.id === params.id);
  if (!post) {
    return {
      title: 'Prato Não Encontrado | Caraguá FoodTech',
    };
  }

  return {
    title: `${post.dishName} — ${post.restaurantName} (${post.neighborhood}) | Caraguá FoodTech`,
    description: `${post.dishName} no ${post.restaurantName}. Preço: R$ ${post.dishPrice.toFixed(2)}. ${post.caption}`,
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
  const post = INITIAL_FEED_POSTS.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  const relatedPosts = INITIAL_FEED_POSTS.filter((p) => p.id !== post.id);

  return <PratoDetailClient post={post} relatedPosts={relatedPosts} />;
}
