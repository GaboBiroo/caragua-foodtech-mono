import { NextRequest, NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
      try {
        const response = await fetch(`${BACKEND_API_BASE}/chat/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            reply: data.answer || data.reply,
            ...data,
          });
        }
      } catch {
        // Fallback para motor caiçara embutido
      }
    }

    const prompt = body.message || body.prompt || '';
    const generated = realDataStore.generateAIChatReply(prompt);
    return NextResponse.json({
      success: true,
      reply: generated.reply,
      answer: generated.reply,
      dishes: generated.dishes,
      recommendations: generated.dishes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao processar mensagem com o Chef CaráFood';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
