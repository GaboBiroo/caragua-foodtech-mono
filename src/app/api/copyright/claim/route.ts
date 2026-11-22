import { NextRequest, NextResponse } from 'next/server';
import { serverIdentityStore } from '../../../../lib/serverIdentityStore';
import { sanitizeUserInput } from '../../../../lib/security';
import { CopyrightClaimType } from '../../../../types/copyright';

export async function GET() {
  const claims = serverIdentityStore.getCopyrightClaims();
  return NextResponse.json({
    total: claims.length,
    legalFramework:
      'Lei de Direitos Autorais (Lei nº 9.610/1998) & Marco Civil da Internet (Lei nº 12.965/2014) — Distinção entre Dados Factuais Públicos (nomes, endereços e preços públicos) e Obras Visuais Protegidas (Notice & Takedown).',
    claims,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const claimTypeRaw = String(body?.claimType || 'claim_ownership');
    const claimType: CopyrightClaimType =
      claimTypeRaw === 'replace_media' || claimTypeRaw === 'takedown_request'
        ? claimTypeRaw
        : 'claim_ownership';

    const restaurantName = sanitizeUserInput(body?.restaurantName || '');
    const claimantName = sanitizeUserInput(body?.claimantName || '');
    const claimantRole = sanitizeUserInput(body?.claimantRole || 'Proprietário / Responsável Legal');
    const email = sanitizeUserInput(body?.email || '');
    const whatsapp = sanitizeUserInput(body?.whatsapp || '');
    const justification = sanitizeUserInput(body?.justification || '');

    if (!restaurantName || !claimantName || !email || !justification) {
      return NextResponse.json(
        {
          error:
            'Preencha o nome do estabelecimento, seu nome, e-mail de contato e a descrição da solicitação.',
        },
        { status: 400 }
      );
    }

    const created = serverIdentityStore.addCopyrightClaim({
      claimType,
      restaurantName,
      dishId: body?.dishId ? sanitizeUserInput(String(body.dishId)) : undefined,
      dishName: body?.dishName ? sanitizeUserInput(String(body.dishName)) : undefined,
      claimantName,
      claimantRole,
      email,
      whatsapp,
      justification,
      replacementImageUrl: body?.replacementImageUrl
        ? sanitizeUserInput(String(body.replacementImageUrl))
        : undefined,
    });

    return NextResponse.json(
      {
        status: 'registered',
        protocol: created.protocol,
        claim: created,
        message:
          claimType === 'takedown_request'
            ? 'Solicitação de remoção autoral (Takedown) registrada com prioridade máxima na fila da Curadoria.'
            : 'Reivindicação de titularidade/atualização de acervo registrada com sucesso na fila da Curadoria.',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível registrar a solicitação de direitos autorais.' },
      { status: 400 }
    );
  }
}
