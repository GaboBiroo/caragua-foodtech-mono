import { UserSession, UserRole, SocialPronoun, AuthProvider } from '../types/auth';
import { CopyrightClaim } from '../types/copyright';
import { hashPasswordSecure, sanitizeUserInput } from './security';

// ==============================================================================
// Repositório Server-Side de Identidade, Sessões, OTP e Direitos Autorais
// Mantém compatibilidade com os 3 perfis oficiais de demonstração da Banca
// (Comensal, Gestor e Curador/Prof. Cristiano) e suporta cadastro dinâmico,
// OAuth Google/Apple, recuperação via E-mail/WhatsApp, Portabilidade LGPD
// e reivindicações de Direitos Autorais (Lei nº 9.610/98).
// ==============================================================================

export interface StoredUserRecord {
  session: UserSession;
  passwordHash: string;
  anonymized?: boolean;
}

export interface StoredOtpToken {
  target: string; // e-mail ou número de WhatsApp normalizado
  channel: 'email' | 'whatsapp';
  otpCode: string;
  expiresAt: number;
  used: boolean;
}

class ServerIdentityStore {
  private usersByEmail = new Map<string, StoredUserRecord>();
  private otpByTarget = new Map<string, StoredOtpToken>();
  private copyrightClaims: CopyrightClaim[] = [];
  private initialized = false;

  constructor() {
    this.seedInitialCopyrightClaims();
  }

  private seedInitialCopyrightClaims() {
    if (this.copyrightClaims.length > 0) return;
    this.copyrightClaims = [
      {
        protocol: 'CG-DA-910421',
        claimType: 'claim_ownership',
        restaurantName: 'Pádua Burguer',
        dishName: 'Box 3 Smashs + Batata Frita',
        claimantName: 'Lucas Pádua',
        claimantRole: 'Proprietário / Sócio-Administrador',
        email: 'contato@paduaburguer.com.br',
        whatsapp: '(12) 99741-2200',
        justification:
          'Solicitação de vínculo de titularidade oficial (0% taxa) para atualização direta das fotos autorais do cardápio no Centro.',
        status: 'Aprovado e Atualizado',
        createdAt: '2026-11-18T14:20:00.000Z',
      },
      {
        protocol: 'CG-DA-884310',
        claimType: 'replace_media',
        restaurantName: 'Billy Bruto Hamburgueria - Jardim Primavera',
        dishId: '03f09e72-5c04-508a-bab6-fe753e0fca15',
        dishName: "Billy Rose's",
        claimantName: 'Rafael Bruto',
        claimantRole: 'Gestor do Estabelecimento',
        email: 'gestao@billybruto.com.br',
        whatsapp: '(12) 99612-8890',
        justification:
          'Substituição da fotografia do prato pela foto oficial de estúdio cedida pelo estabelecimento sob licença gratuita ao catálogo CaráFood.',
        status: 'Em Análise Prioritária',
        createdAt: '2026-11-20T19:05:00.000Z',
      },
    ];
  }

  public async ensureSeeded(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    const demoPasswordHash = await hashPasswordSecure('Carafood@2026');
    const profPasswordHash = await hashPasswordSecure('Nota10');
    const nowIso = new Date().toISOString();

    const seeds: Array<{
      id: string;
      nomeCivil: string;
      nomeSocial?: string;
      pronomeSocial: SocialPronoun;
      email: string;
      whatsapp: string;
      role: UserRole;
      points: number;
      hash: string;
    }> = [
      {
        id: 'usr-comensal-01',
        nomeCivil: 'Mariana Silva',
        nomeSocial: 'Mariana S.',
        pronomeSocial: 'Ela/Dela',
        email: 'comensal@carafood.com.br',
        whatsapp: '12997112233',
        role: 'comensal',
        points: 350,
        hash: demoPasswordHash,
      },
      {
        id: 'usr-gestor-02',
        nomeCivil: 'Roberto Caiçara',
        nomeSocial: 'Chef Roberto',
        pronomeSocial: 'Ele/Dele',
        email: 'gestor@restaurante.com.br',
        whatsapp: '12997445566',
        role: 'gestor',
        points: 520,
        hash: demoPasswordHash,
      },
      {
        id: 'usr-curador-03',
        nomeCivil: 'Prof. Me. Cristiano S. Negrão',
        nomeSocial: 'Prof. Cristiano Negrão',
        pronomeSocial: 'Ele/Dele',
        email: 'cristiano@modulo.edu.br',
        whatsapp: '12997889900',
        role: 'curador',
        points: 1000,
        hash: demoPasswordHash,
      },
      {
        id: 'usr-curador-alias',
        nomeCivil: 'Prof. Me. Cristiano S. Negrão',
        nomeSocial: 'Prof. Cristiano Negrão',
        pronomeSocial: 'Ele/Dele',
        email: 'cristianobestprof',
        whatsapp: '12997889900',
        role: 'curador',
        points: 1000,
        hash: profPasswordHash,
      },
    ];

    for (const s of seeds) {
      const key = s.email.toLowerCase().trim();
      if (!this.usersByEmail.has(key)) {
        this.usersByEmail.set(key, {
          passwordHash: s.hash,
          session: {
            id: s.id,
            nomeCivil: s.nomeCivil,
            nomeSocial: s.nomeSocial,
            pronomeSocial: s.pronomeSocial,
            email: s.email,
            whatsapp: s.whatsapp,
            role: s.role,
            provider: 'email',
            points: s.points,
            savedDishIds: ['03f09e72-5c04-508a-bab6-fe753e0fca15'],
            lgpdConsent: {
              essential: true,
              analytics: true,
              geolocation: true,
              consentedAt: nowIso,
              policyVersion: '2026.2-LGPD',
            },
            createdAt: nowIso,
          },
        });
      }
    }
  }

  public async findByEmailOrWhatsapp(identifier: string): Promise<StoredUserRecord | null> {
    await this.ensureSeeded();
    const norm = String(identifier || '').toLowerCase().trim();
    if (!norm) return null;

    if (this.usersByEmail.has(norm)) {
      return this.usersByEmail.get(norm) || null;
    }

    const digits = norm.replace(/\D/g, '');
    if (digits.length >= 8) {
      for (const rec of Array.from(this.usersByEmail.values())) {
        const userDigits = String(rec.session.whatsapp || '').replace(/\D/g, '');
        if (userDigits && (userDigits.endsWith(digits) || digits.endsWith(userDigits))) {
          return rec;
        }
      }
    }
    return null;
  }

  public async registerUser(params: {
    nomeCivil: string;
    nomeSocial?: string;
    pronomeSocial: SocialPronoun;
    email: string;
    whatsapp?: string;
    passwordHash: string;
    role?: UserRole;
    provider?: AuthProvider;
    analyticsConsent?: boolean;
    geolocationConsent?: boolean;
  }): Promise<UserSession> {
    await this.ensureSeeded();
    const emailKey = params.email.toLowerCase().trim();
    const nowIso = new Date().toISOString();

    const cleanCivil = sanitizeUserInput(params.nomeCivil) || 'Usuário CaráFood';
    const cleanSocial = params.nomeSocial ? sanitizeUserInput(params.nomeSocial) : undefined;
    const cleanPronoun = sanitizeUserInput(params.pronomeSocial || 'Não informado') || 'Não informado';

    const existing = this.usersByEmail.get(emailKey);
    const session: UserSession = {
      id: existing?.session.id || `usr-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 899)}`,
      nomeCivil: cleanCivil,
      nomeSocial: cleanSocial || undefined,
      pronomeSocial: cleanPronoun,
      email: emailKey,
      whatsapp: params.whatsapp ? sanitizeUserInput(params.whatsapp) : existing?.session.whatsapp,
      role: params.role || existing?.session.role || 'comensal',
      provider: params.provider || 'email',
      points: existing?.session.points ?? 350,
      savedDishIds: existing?.session.savedDishIds || [],
      lgpdConsent: {
        essential: true,
        analytics: params.analyticsConsent ?? true,
        geolocation: params.geolocationConsent ?? true,
        consentedAt: nowIso,
        policyVersion: '2026.2-LGPD',
      },
      createdAt: existing?.session.createdAt || nowIso,
    };

    this.usersByEmail.set(emailKey, {
      session,
      passwordHash: params.passwordHash,
      anonymized: false,
    });

    return session;
  }

  public async createOtpToken(
    target: string,
    channel: 'email' | 'whatsapp'
  ): Promise<StoredOtpToken> {
    await this.ensureSeeded();
    const key =
      channel === 'whatsapp'
        ? String(target || '').replace(/\D/g, '') || target.toLowerCase().trim()
        : String(target || '').toLowerCase().trim();

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const record: StoredOtpToken = {
      target: key,
      channel,
      otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
      used: false,
    };
    this.otpByTarget.set(key, record);
    return record;
  }

  public async verifyOtpAndResetPassword(
    target: string,
    channel: 'email' | 'whatsapp',
    otpCode: string,
    newPasswordHash: string
  ): Promise<{ ok: boolean; reason?: string; session?: UserSession }> {
    await this.ensureSeeded();
    const key =
      channel === 'whatsapp'
        ? String(target || '').replace(/\D/g, '') || target.toLowerCase().trim()
        : String(target || '').toLowerCase().trim();

    const token = this.otpByTarget.get(key);
    if (!token) {
      return { ok: false, reason: 'Nenhum código OTP ativo encontrado para este destinatário.' };
    }
    if (token.used) {
      return { ok: false, reason: 'Este código OTP já foi utilizado. Solicite um novo código.' };
    }
    if (Date.now() > token.expiresAt) {
      return { ok: false, reason: 'O código OTP expirou (limite de 10 minutos). Solicite um novo.' };
    }
    if (token.otpCode !== String(otpCode || '').trim()) {
      return { ok: false, reason: 'Código de verificação de 6 dígitos incorreto.' };
    }

    token.used = true;
    this.otpByTarget.set(key, token);

    let userRec = await this.findByEmailOrWhatsapp(target);
    if (!userRec) {
      // Se o e-mail/WhatsApp ainda não existia no store da instância Serverless, cria/vincula a conta recuperada
      const syntheticEmail =
        channel === 'email' ? key : `whatsapp.${key}@carafood.com.br`;
      const session = await this.registerUser({
        nomeCivil: 'Usuário Recuperado CaráFood',
        pronomeSocial: 'Não informado',
        email: syntheticEmail,
        whatsapp: channel === 'whatsapp' ? target : undefined,
        passwordHash: newPasswordHash,
        role: 'comensal',
      });
      return { ok: true, session };
    }

    userRec.passwordHash = newPasswordHash;
    this.usersByEmail.set(userRec.session.email.toLowerCase(), userRec);
    return { ok: true, session: userRec.session };
  }

  public async anonymizeUserAccount(email: string): Promise<{ ok: boolean; protocol: string }> {
    await this.ensureSeeded();
    const key = String(email || '').toLowerCase().trim();
    const protocol = `LGPD-DEL-${Math.floor(100000 + Math.random() * 900000)}`;
    this.usersByEmail.delete(key);
    return { ok: true, protocol };
  }

  public getCopyrightClaims(): CopyrightClaim[] {
    return this.copyrightClaims;
  }

  public addCopyrightClaim(
    input: Omit<CopyrightClaim, 'protocol' | 'status' | 'createdAt'>
  ): CopyrightClaim {
    const protocol = `CG-DA-${Math.floor(100000 + Math.random() * 900000)}`;
    const claim: CopyrightClaim = {
      protocol,
      claimType: input.claimType,
      restaurantName: sanitizeUserInput(input.restaurantName),
      dishId: input.dishId ? sanitizeUserInput(input.dishId) : undefined,
      dishName: input.dishName ? sanitizeUserInput(input.dishName) : undefined,
      claimantName: sanitizeUserInput(input.claimantName),
      claimantRole: sanitizeUserInput(input.claimantRole),
      email: sanitizeUserInput(input.email),
      whatsapp: sanitizeUserInput(input.whatsapp),
      justification: sanitizeUserInput(input.justification),
      replacementImageUrl: input.replacementImageUrl
        ? sanitizeUserInput(input.replacementImageUrl)
        : undefined,
      status: 'Em Análise Prioritária',
      createdAt: new Date().toISOString(),
    };
    this.copyrightClaims = [claim, ...this.copyrightClaims];
    return claim;
  }

  public resolveCopyrightClaim(
    protocol: string,
    newStatus: 'Aprovado e Atualizado' | 'Mídia Removida'
  ): CopyrightClaim | null {
    const found = this.copyrightClaims.find((c) => c.protocol === protocol);
    if (!found) return null;
    found.status = newStatus;
    return found;
  }
}

export const serverIdentityStore = new ServerIdentityStore();
