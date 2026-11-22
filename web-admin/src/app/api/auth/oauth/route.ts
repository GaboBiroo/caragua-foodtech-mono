import { NextRequest, NextResponse } from 'next/server';
import { serverIdentityStore } from '../../../../lib/serverIdentityStore';
import { hashPasswordSecure, sanitizeUserInput } from '../../../../lib/security';
import { OAuthRequestPayload } from '../../../../types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<OAuthRequestPayload>;
    const provider = body.provider === 'apple' ? 'apple' : 'google';

    const defaultEmail =
      provider === 'google'
        ? 'visitante.google@carafood.com.br'
        : 'visitante.apple@icloud.com';
    const defaultCivil =
      provider === 'google' ? 'Lucas Oliveira (Conta Google)' : 'Beatriz Santos (ID Apple)';
    const defaultSocial =
      provider === 'google' ? 'Lucas Oliveira' : 'Bia Santos';
    const defaultPronoun = provider === 'google' ? 'Ele/Dele' : 'Ela/Dela';

    const email = sanitizeUserInput(body.email || defaultEmail).toLowerCase();
    const nomeCivil = sanitizeUserInput(body.nomeCivil || defaultCivil);
    const nomeSocial = sanitizeUserInput(body.nomeSocial || defaultSocial);
    const pronomeSocial = sanitizeUserInput(body.pronomeSocial || defaultPronoun);

    // Se o usuário já existir com o mesmo e-mail, vincula o provedor OAuth mantendo os pontos e salvos (Q28)
    const existing = await serverIdentityStore.findByEmailOrWhatsapp(email);
    if (existing) {
      existing.session.provider = provider;
      if (nomeSocial) existing.session.nomeSocial = nomeSocial;
      if (pronomeSocial) existing.session.pronomeSocial = pronomeSocial;
      return NextResponse.json({
        status: 'authenticated',
        provider,
        oauthMode: process.env.GOOGLE_CLIENT_ID || process.env.APPLE_CLIENT_ID ? 'production_federated' : 'interactive_sandbox',
        user: existing.session,
      });
    }

    const federatedSecretHash = await hashPasswordSecure(`oauth_${provider}_${email}_2026`);
    const session = await serverIdentityStore.registerUser({
      nomeCivil,
      nomeSocial,
      pronomeSocial,
      email,
      passwordHash: federatedSecretHash,
      role: body.role || 'comensal',
      provider,
    });

    return NextResponse.json({
      status: 'authenticated',
      provider,
      oauthMode: process.env.GOOGLE_CLIENT_ID || process.env.APPLE_CLIENT_ID ? 'production_federated' : 'interactive_sandbox',
      user: session,
    });
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível autenticar via provedor social.' },
      { status: 400 }
    );
  }
}
