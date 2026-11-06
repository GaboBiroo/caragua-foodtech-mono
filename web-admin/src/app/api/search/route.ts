import { NextRequest, NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q') || '';
  const neighborhood = searchParams.get('neighborhood') || searchParams.get('polo') || '';

  if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (neighborhood) params.set('neighborhood', neighborhood);
      const upstreamUrl = `${BACKEND_API_BASE}/dishes/search?${params.toString()}`;
      const response = await fetch(upstreamUrl, { cache: 'no-store' });
      if (response.ok) {
        const payload = await response.json();
        return NextResponse.json({
          success: true,
          count: payload.count ?? 0,
          results: payload.results ?? [],
        });
      }
    } catch {
      // Fallback
    }
  }

  const results = realDataStore.searchDishes(q, neighborhood);
  return NextResponse.json({
    success: true,
    count: results.length,
    results,
  });
}
