import { NextRequest, NextResponse } from 'next/server';
import { serverIdentityStore } from '../../../../lib/serverIdentityStore';
import {
  checkRateLimit,
  hashPasswordSecure,
  sanitizeUserInput,
} from '../../../../lib/security';
import { RegisterRequestPayload } from '../../../../types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RegisterRequestPayload>;
    const rawEmail = sanitizeUserInput(body.email || '').toLowerCase();
    const nomeCivil = sanitizeUserInput(body.nomeCivil || '');
    const nomeSocial = body.nomeSocial ? sanitizeUserInput(body.nomeSocial) : undefined;
    const pronomeSocial = sanitizeUserInput(body.pronomeSocial || 'Não informado') || 'Não informado';
    const whatsapp = body.whatsapp ? sanitizeUserInput(body.whatsapp) : undefined;
    const password = String(body.password || '');

    // Proteção Rate-Limit para criação de contas
    const rl = checkRateLimit(`register:${rawEmail || 'anon'}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Muitas tentativas de cadastro. Aguarde ${rl.retryAfterSec}s antes de tentar novamente.`,
          retryAfterSec: rl.retryAfterSec,
        },
        { status: 429 }
      );
    }

    if (!nomeCivil || nomeCivil.length < 2) {
      return NextResponse.json(
        { error: 'Informe seu nome completo para criar a conta.' },
        { status: 400 }
      );
    }

    if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    if (body.lgpdConsent && body.lgpdConsent.essential === false) {
      return NextResponse.json(
        { error: 'É necessário aceitar os termos essenciais de privacidade (LGPD) para criar a conta.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPasswordSecure(password);
    const session = await serverIdentityStore.registerUser({
      nomeCivil,
      nomeSocial,
      pronomeSocial,
      email: rawEmail,
      whatsapp,
      passwordHash,
      role: body.role || 'comensal',
      provider: 'email',
      analyticsConsent: body.lgpdConsent?.analytics ?? true,
      geolocationConsent: body.lgpdConsent?.geolocation ?? true,
    });

    return NextResponse.json(
      {
        status: 'created',
        message: 'Conta criada com sucesso!',
        user: session,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível concluir o cadastro. Verifique os dados informados.' },
      { status: 400 }
    );
  }
}
