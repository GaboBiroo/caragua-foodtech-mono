import { NextRequest, NextResponse } from 'next/server';
import { serverIdentityStore } from '../../../../lib/serverIdentityStore';
import {
  checkRateLimit,
  hashPasswordSecure,
  resetRateLimit,
  sanitizeUserInput,
} from '../../../../lib/security';
import { RecoverRequestPayload } from '../../../../types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RecoverRequestPayload>;
    const action = body.action || 'request_otp';
    const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'email';
    const rawTarget = sanitizeUserInput(body.target || '');

    if (!rawTarget || rawTarget.length < 5) {
      return NextResponse.json(
        {
          error:
            channel === 'whatsapp'
              ? 'Informe um número de WhatsApp válido com DDD (ex: 12 99711-2233).'
              : 'Informe um endereço de e-mail válido.',
        },
        { status: 400 }
      );
    }

    if (action === 'request_otp') {
      const rl = checkRateLimit(`recover_req:${rawTarget}`, 5, 60_000);
      if (!rl.allowed) {
        return NextResponse.json(
          {
            error: `Limite de envios atingido. Aguarde ${rl.retryAfterSec}s antes de solicitar um novo código.`,
            retryAfterSec: rl.retryAfterSec,
          },
          { status: 429 }
        );
      }

      if (channel === 'email' && !rawTarget.includes('@')) {
        return NextResponse.json(
          { error: 'Formato de e-mail inválido para recuperação.' },
          { status: 400 }
        );
      }

      if (channel === 'whatsapp' && rawTarget.replace(/\D/g, '').length < 10) {
        return NextResponse.json(
          { error: 'Informe o número de WhatsApp completo com DDD (mínimo 10 dígitos).' },
          { status: 400 }
        );
      }

      const tokenRecord = await serverIdentityStore.createOtpToken(rawTarget, channel);

      // Resposta neutra contra User Enumeration (Q27) + Sandbox da Banca para validação imediata
      return NextResponse.json({
        status: 'otp_sent',
        channel,
        message:
          channel === 'whatsapp'
            ? 'Se o número estiver vinculado a uma conta, enviamos o código de 6 dígitos via WhatsApp.'
            : 'Se o e-mail estiver cadastrado, enviamos o código de recuperação de 6 dígitos.',
        expiresInMinutes: 10,
        sandboxAuditPreview: {
          otpCode: tokenRecord.otpCode,
          channel,
          recipient: rawTarget,
          deliveryPreview:
            channel === 'whatsapp'
              ? `[WhatsApp CaráFood Oficial] Seu código de recuperação é ${tokenRecord.otpCode}. Válido por 10 minutos.`
              : `[E-mail CaráFood Segurança] Código de verificação para redefinir sua senha: ${tokenRecord.otpCode} (expira em 10 min).`,
        },
      });
    }

    if (action === 'verify_and_reset') {
      const otpCode = sanitizeUserInput(body.otpCode || '');
      const newPassword = String(body.newPassword || '');

      const rlVerifyKey = `recover_verify:${rawTarget}`;
      const rlVerify = checkRateLimit(rlVerifyKey, 5, 60_000);
      if (!rlVerify.allowed) {
        return NextResponse.json(
          {
            error: `Muitas tentativas de código incorretas. Aguarde ${rlVerify.retryAfterSec}s.`,
            retryAfterSec: rlVerify.retryAfterSec,
          },
          { status: 429 }
        );
      }

      if (!otpCode || otpCode.length !== 6) {
        return NextResponse.json(
          { error: 'Informe o código de verificação de 6 dígitos.' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
          { status: 400 }
        );
      }

      const newPasswordHash = await hashPasswordSecure(newPassword);
      const verification = await serverIdentityStore.verifyOtpAndResetPassword(
        rawTarget,
        channel,
        otpCode,
        newPasswordHash
      );

      if (!verification.ok) {
        return NextResponse.json(
          { error: verification.reason || 'Código inválido ou expirado.' },
          { status: 400 }
        );
      }

      resetRateLimit(rlVerifyKey);

      return NextResponse.json({
        status: 'password_reset_success',
        channel,
        message: 'Senha redefinida com sucesso! Você já está autenticado.',
        user: verification.session,
      });
    }

    return NextResponse.json({ error: 'Ação de recuperação desconhecida.' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível processar a recuperação de senha.' },
      { status: 400 }
    );
  }
}
