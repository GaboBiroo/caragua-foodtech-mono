import { NextRequest, NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/restaurants/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Segue para fallback
    }
  }

  const detail = realDataStore.getRestaurantBySlug(slug);
  if (!detail) {
    return NextResponse.json(
      { success: false, error: 'Restaurante não encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
