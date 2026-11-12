import { NextRequest, NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const neighborhood = searchParams.get('neighborhood') || undefined;
  const macroRegion = (searchParams.get('macroRegion') as 'Todas' | 'Norte' | 'Centro' | 'Sul') || undefined;
  const search = searchParams.get('search') || undefined;
  const dietaryRaw = searchParams.get('dietary');
  const dietary = dietaryRaw ? dietaryRaw.split(',') : undefined;
  const priceDropOnly = searchParams.get('price_drop_only') === 'true';
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined;
  const sortBy = (searchParams.get('sort_by') as 'recommended' | 'distance') || 'recommended';
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 120;

  // Se houver backend externo configurado explicitamente via env, tenta upstream
  if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
    try {
      const upstreamUrl = `${BACKEND_API_BASE}/restaurants${req.nextUrl.search}`;
      const response = await fetch(upstreamUrl, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const restaurants = Array.isArray(data) ? data : data.restaurants || [];
        return NextResponse.json({
          success: true,
          count: restaurants.length,
          restaurants,
        });
      }
    } catch {
      // Segue para fallback gracioso com dados reais
    }
  }

  // Fallback instantâneo e robusto com dados reais do mapa de Caraguatatuba
  const restaurants = realDataStore.getRestaurants({
    neighborhood,
    macroRegion,
    search,
    dietary,
    priceDropOnly,
    lat,
    lon,
    sortBy,
    limit,
  });

  return NextResponse.json({
    success: true,
    count: restaurants.length,
    restaurants,
  });
}
