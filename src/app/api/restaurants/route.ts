import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams.toString();
    const upstreamUrl = `${BACKEND_API_BASE}/restaurants${searchParams ? `?${searchParams}` : ''}`;
    const response = await fetch(upstreamUrl, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream FastAPI status ${response.status}` },
        { status: response.status }
      );
    }

    const restaurants = await response.json();
    return NextResponse.json({
      success: true,
      count: Array.isArray(restaurants) ? restaurants.length : 0,
      restaurants,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha de conexão com o backend FastAPI';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
