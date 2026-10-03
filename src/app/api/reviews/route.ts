import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, comment, rating, author } = body;

    // Sanitização LGPD
    const sanitizedComment = (comment || '')
      .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '[CPF_REMOVIDO]')
      .replace(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, '[TEL_REMOVIDO]');

    return NextResponse.json({
      success: true,
      review: {
        id: 'rev-' + Date.now(),
        restaurantId,
        author: author || 'Avaliador Anônimo',
        rating,
        decayedRating: rating,
        comment: sanitizedComment,
        date: 'Agora',
        verifiedAudit: true
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
