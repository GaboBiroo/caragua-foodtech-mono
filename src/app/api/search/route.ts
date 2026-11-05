import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const neighborhood = searchParams.get('neighborhood') || searchParams.get('polo') || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (neighborhood) params.set('neighborhood', neighborhood);

    const upstreamUrl = `${BACKEND_API_BASE}/dishes/search${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(upstreamUrl, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Upstream status ${response.status}` }, { status: response.status });
    }
    const payload = await response.json();
    return NextResponse.json({
      success: true,
      count: payload.count ?? 0,
      results: payload.results ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha na busca híbrida de pratos';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
