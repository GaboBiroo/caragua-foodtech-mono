import { NextRequest, NextResponse } from 'next/server';
import { serverIdentityStore } from '../../../../lib/serverIdentityStore';
import {
  checkRateLimit,
  resetRateLimit,
  sanitizeUserInput,
  verifyPasswordSecure,
} from '../../../../lib/security';
import { LoginRequestPayload } from '../../../../types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LoginRequestPayload>;
    const rawEmail = sanitizeUserInput(body.email || '').toLowerCase();
    const password = String(body.password || '');

    if (!rawEmail) {
      return NextResponse.json(
        { error: 'Informe seu e-mail para entrar.' },
        { status: 400 }
      );
    }

    // Rate Limiter contra Brute Force (máx. 5 falhas em 60s por identificador)
    const rlKey = `login:${rawEmail}`;
    const rl = checkRateLimit(rlKey, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Proteção contra acesso indevido ativada: aguarde ${rl.retryAfterSec} segundos antes de tentar novamente.`,
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSec: rl.retryAfterSec,
        },
        { status: 429 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            'Credenciais recusadas (HTTP 401): A senha deve conter no mínimo 6 caracteres.',
          code: 'HTTP_401_INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    const record = await serverIdentityStore.findByEmailOrWhatsapp(rawEmail);
    if (!record) {
      return NextResponse.json(
        {
          error:
            'E-mail ou senha não conferem. Verifique suas credenciais ou crie uma conta gratuita.',
          code: 'HTTP_401_UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const valid = await verifyPasswordSecure(password, record.passwordHash);
    if (!valid) {
      return NextResponse.json(
        {
          error: 'E-mail ou senha não conferem. Tente novamente ou use "Esqueci minha senha".',
          code: 'HTTP_401_UNAUTHORIZED',
          remainingAttempts: rl.remaining,
        },
        { status: 401 }
      );
    }

    resetRateLimit(rlKey);

    return NextResponse.json({
      status: 'authenticated',
      user: record.session,
    });
  } catch {
    return NextResponse.json(
      { error: 'Falha ao processar solicitação de login.' },
      { status: 400 }
    );
  }
}
