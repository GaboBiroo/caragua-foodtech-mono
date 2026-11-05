import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(`${BACKEND_API_BASE}/chat/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream RAG status ${response.status}` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json({
      success: true,
      reply: payload.answer,
      ...payload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao consultar o motor SVL-RRF';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
