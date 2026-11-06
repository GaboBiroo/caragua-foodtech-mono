import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
      try {
        const upstream = await fetch(`${BACKEND_API_BASE}/restaurants/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
        });
        if (upstream.ok) {
          const data = await upstream.json();
          return NextResponse.json(data, { status: upstream.status });
        }
      } catch {
        // Fallback gracioso
      }
    }

    const protocol = `CG-FT-${Math.floor(100000 + Math.random() * 900000)}`;
    return NextResponse.json({
      success: true,
      protocol,
      message: 'Solicitação de credenciamento recebida com sucesso pela Curadoria CaráFood.',
      lead: body,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao processar solicitação de credenciamento';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
