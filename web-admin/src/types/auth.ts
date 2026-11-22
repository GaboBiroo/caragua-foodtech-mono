export type SocialPronoun =
  | 'Ele/Dele'
  | 'Ela/Dela'
  | 'Elu/Delu'
  | 'Não informado'
  | string;

export type UserRole = 'comensal' | 'gestor' | 'curador';
export type AuthProvider = 'email' | 'google' | 'apple';

export interface LgpdConsentRecord {
  essential: boolean;
  analytics: boolean;
  geolocation: boolean;
  consentedAt: string;
  policyVersion: string;
}

export interface UserSession {
  id: string;
  nomeCivil: string;
  nomeSocial?: string; // Exibido prioritariamente em toda a UI se preenchido
  pronomeSocial: SocialPronoun; // Respeito e inclusão em reviews e perfil
  email: string;
  whatsapp?: string;
  role: UserRole;
  provider: AuthProvider;
  avatarUrl?: string;
  points: number; // Passaporte Gourmet (ex: 350 base + 50 por avaliação)
  savedDishIds: string[];
  lgpdConsent: LgpdConsentRecord;
  createdAt: string;
}

export interface RegisterRequestPayload {
  nomeCivil: string;
  nomeSocial?: string;
  pronomeSocial: SocialPronoun;
  email: string;
  whatsapp?: string;
  password: string;
  role?: UserRole;
  lgpdConsent?: Partial<LgpdConsentRecord>;
}

export interface LoginRequestPayload {
  email: string;
  password: string;
  preferredRole?: UserRole;
}

export interface OAuthRequestPayload {
  provider: 'google' | 'apple';
  email?: string;
  nomeCivil?: string;
  nomeSocial?: string;
  pronomeSocial?: SocialPronoun;
  role?: UserRole;
}

export interface RecoverRequestPayload {
  action: 'request_otp' | 'verify_and_reset';
  channel: 'email' | 'whatsapp';
  target: string; // E-mail ou número de WhatsApp
  otpCode?: string;
  newPassword?: string;
}
