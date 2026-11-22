'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Store,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  MessageSquare,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SocialPronoun, UserRole } from '../../types/auth';
import { formatUserDisplayWithPronoun } from '../../lib/security';

type AccountProfile = 'comensal' | 'gestor' | 'curador';
type AuthTab = 'login' | 'register' | 'recover';

interface ProfileOption {
  id: AccountProfile;
  title: string;
  subtitle: string;
  demoEmail: string;
  demoNomeCivil: string;
  demoNomeSocial: string;
  demoPronome: SocialPronoun;
  demoPoints: number;
  redirectPath: string;
  redirectLabel: string;
  icon: React.ElementType;
  perks: string[];
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'comensal',
    title: 'Avaliador Local & Visitante',
    subtitle: 'Morador, turista ou comensal de Caraguatatuba',
    demoEmail: 'comensal@carafood.com.br',
    demoNomeCivil: 'Mariana Silva',
    demoNomeSocial: 'Mariana S.',
    demoPronome: 'Ela/Dela',
    demoPoints: 350,
    redirectPath: '/',
    redirectLabel: 'Explorar Cardápios & Roteiro nos 53 Bairros',
    icon: Utensils,
    perks: [
      'Salvar pratos favoritos em "Meu Roteiro" para o fim de semana',
      'Votar na Cédula de 5 Critérios (+50 pts no Passaporte Gourmet)',
      'Exibir seu Nome Social e Pronome Social nas avaliações auditadas',
    ],
  },
  {
    id: 'gestor',
    title: 'Gestor de Restaurante',
    subtitle: 'Quiosque, restaurante, pizzaria ou produtor local',
    demoEmail: 'gestor@restaurante.com.br',
    demoNomeCivil: 'Roberto Caiçara',
    demoNomeSocial: 'Chef Roberto',
    demoPronome: 'Ele/Dele',
    demoPoints: 520,
    redirectPath: '/contato',
    redirectLabel: 'Abrir Credenciamento e Atualização de Cardápio',
    icon: Store,
    perks: [
      'Credenciamento 100% gratuito (0% de comissão sobre pedidos)',
      'Reivindicação oficial de perfil e atualização de fotos do cardápio',
      'Destaque de procedência local (Maricultura Cocanha e Pesca Z-8)',
    ],
  },
  {
    id: 'curador',
    title: 'Curadoria & Banca Módulo',
    subtitle: 'Prof. Me. Cristiano S. Negrão & Equipe',
    demoEmail: 'cristiano@modulo.edu.br',
    demoNomeCivil: 'Prof. Me. Cristiano S. Negrão',
    demoNomeSocial: 'Prof. Cristiano Negrão',
    demoPronome: 'Ele/Dele',
    demoPoints: 1000,
    redirectPath: '/moderation',
    redirectLabel: 'Abrir Painel de Curadoria de Cardápios (/moderation)',
    icon: ShieldCheck,
    perks: [
      'Revisão e aprovação em 1 clique dos pratos coletados nos 53 bairros',
      'Gestão de protocolos de Direitos Autorais (CG-DA) e Credenciamentos',
      'Auditoria da Nota Ponderada Bayesiana (WR) e governança LGPD',
    ],
  },
];

const PRONOUN_CHOICES: SocialPronoun[] = [
  'Ela/Dela',
  'Ele/Dele',
  'Elu/Delu',
  'Não informado',
];

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loginWithCredentials,
    registerAccount,
    loginWithOAuth,
    setDirectSession,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [selectedProfile, setSelectedProfile] = useState<AccountProfile>('comensal');

  // Estado Aba 1: Login
  const [email, setEmail] = useState('comensal@carafood.com.br');
  const [password, setPassword] = useState('Carafood@2026');
  const [showPassword, setShowPassword] = useState(false);

  // Estado Aba 2: Criar Conta (Cadastro com Nome Social, Pronome Social e LGPD)
  const [regNomeCivil, setRegNomeCivil] = useState('');
  const [regNomeSocial, setRegNomeSocial] = useState('');
  const [regPronome, setRegPronome] = useState<SocialPronoun>('Elu/Delu');
  const [regCustomPronome, setRegCustomPronome] = useState('');
  const [regIsCustomPronome, setRegIsCustomPronome] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('comensal');
  const [regPassword, setRegPassword] = useState('');
  const [regLgpdAccepted, setRegLgpdAccepted] = useState(true);

  // Estado Aba 3: Recuperar Senha (E-mail e WhatsApp)
  const [recoverChannel, setRecoverChannel] = useState<'email' | 'whatsapp'>('email');
  const [recoverTarget, setRecoverTarget] = useState('comensal@carafood.com.br');
  const [recoverOtpInput, setRecoverOtpInput] = useState('');
  const [recoverNewPassword, setRecoverNewPassword] = useState('');
  const [sandboxOtpData, setSandboxOtpData] = useState<{
    otpCode: string;
    channel: 'email' | 'whatsapp';
    recipient: string;
    deliveryPreview: string;
  } | null>(null);
  const [recoverStepSuccess, setRecoverStepSuccess] = useState<string | null>(null);

  // Feedback global
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentProfileObj =
    PROFILE_OPTIONS.find((p) => p.id === selectedProfile) || PROFILE_OPTIONS[0];

  const handleSelectDemoProfile = (profile: ProfileOption) => {
    setSelectedProfile(profile.id);
    setEmail(profile.demoEmail);
    setPassword('Carafood@2026');
    setErrorMsg(null);
    setSuccessBanner(null);
  };

  const handleQuickDemoAuthenticateAndGo = (profile: ProfileOption) => {
    const nowIso = new Date().toISOString();
    setDirectSession({
      id: `usr-demo-${profile.id}`,
      nomeCivil: profile.demoNomeCivil,
      nomeSocial: profile.demoNomeSocial,
      pronomeSocial: profile.demoPronome,
      email: profile.demoEmail,
      role: profile.id,
      provider: 'email',
      points: profile.demoPoints,
      savedDishIds: ['03f09e72-5c04-508a-bab6-fe753e0fca15'],
      lgpdConsent: {
        essential: true,
        analytics: true,
        geolocation: true,
        consentedAt: nowIso,
        policyVersion: '2026.2-LGPD',
      },
      createdAt: nowIso,
    });
    router.push(profile.redirectPath);
  };

  const handleSimulateError = async () => {
    setPassword('123');
    setSuccessBanner(null);
    setErrorMsg(
      'Credenciais recusadas (HTTP 401): A senha deve conter no mínimo 6 caracteres. Verifique os dados ou use o preenchimento rápido ao lado.'
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessBanner(null);
    setSubmitting(true);

    const result = await loginWithCredentials({ email, password });
    setSubmitting(false);

    if (!result.ok || !result.user) {
      setErrorMsg(result.error || 'Falha na autenticação.');
      return;
    }

    setSuccessBanner(
      `Sessão iniciada como ${formatUserDisplayWithPronoun(result.user)}!`
    );
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setErrorMsg(null);
    setSuccessBanner(null);
    setSubmitting(true);

    const res = await loginWithOAuth({
      provider,
      role: selectedProfile,
    });
    setSubmitting(false);

    if (!res.ok || !res.user) {
      setErrorMsg(res.error || 'Não foi possível autenticar via provedor social.');
      return;
    }

    setSuccessBanner(
      `Autenticado via ${provider === 'google' ? 'Google' : 'Apple'} como ${formatUserDisplayWithPronoun(res.user)}!`
    );
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessBanner(null);

    if (!regLgpdAccepted) {
      setErrorMsg(
        'Para criar sua conta, confirme a ciência dos termos de privacidade (LGPD).'
      );
      return;
    }

    const finalPronoun = regIsCustomPronome
      ? regCustomPronome.trim() || 'Não informado'
      : regPronome;

    setSubmitting(true);
    const res = await registerAccount({
      nomeCivil: regNomeCivil,
      nomeSocial: regNomeSocial || undefined,
      pronomeSocial: finalPronoun,
      email: regEmail,
      whatsapp: regWhatsapp || undefined,
      password: regPassword,
      role: regRole,
      lgpdConsent: {
        essential: true,
        analytics: true,
        geolocation: true,
      },
    });
    setSubmitting(false);

    if (!res.ok || !res.user) {
      setErrorMsg(res.error || 'Não foi possível concluir o cadastro.');
      return;
    }

    setSuccessBanner(
      `Conta criada! Bem-vinde, ${formatUserDisplayWithPronoun(res.user)} — você ganhou 350 pontos iniciais no Passaporte Gourmet!`
    );
  };

  const handleRequestRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRecoverStepSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_otp',
          channel: recoverChannel,
          target: recoverTarget,
        }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setErrorMsg(data?.error || 'Não foi possível enviar o código.');
        return;
      }

      if (data?.sandboxAuditPreview) {
        setSandboxOtpData(data.sandboxAuditPreview);
        setRecoverOtpInput(data.sandboxAuditPreview.otpCode);
      }
      setRecoverStepSuccess(data?.message || 'Código enviado com sucesso.');
    } catch {
      setSubmitting(false);
      setErrorMsg('Falha ao solicitar código de recuperação.');
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_and_reset',
          channel: recoverChannel,
          target: recoverTarget,
          otpCode: recoverOtpInput,
          newPassword: recoverNewPassword,
        }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setErrorMsg(data?.error || 'Código inválido ou expirado.');
        return;
      }

      if (data?.user) {
        setDirectSession(data.user);
      }
      setSandboxOtpData(null);
      setRecoverStepSuccess(null);
      setSuccessBanner(
        data?.message ||
          `Senha redefinida via ${recoverChannel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} e sessão iniciada!`
      );
    } catch {
      setSubmitting(false);
      setErrorMsg('Erro ao validar código de recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Seleção de Perfil Rápido & Diferença Logado vs Deslogado */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/10 border border-emerald-800/20 text-[#135136] text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Identidade, Nome Social &amp; LGPD • CaráFood
            </span>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-stone-900 mt-3 leading-tight">
              Sua Conta nos 53 Bairros
            </h1>
            <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
              Entre com e-mail, Google ou Apple, cadastre seu <strong>Nome Social</strong> e <strong>Pronome Social</strong>, ou recupere sua senha via <strong>E-mail e WhatsApp</strong>.
            </p>
          </div>

          {/* Card de Status da Sessão Atual (Diferença Clara Deslogado vs Logado) */}
          <div
            data-testid="auth-status-card"
            className={`p-4 rounded-2xl border-2 transition-all ${
              isAuthenticated && user
                ? 'bg-emerald-50/90 border-emerald-400'
                : 'bg-white border-stone-200'
            }`}
          >
            {isAuthenticated && user ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase">
                    <UserCheck className="w-3 h-3 text-[#FFB703]" />
                    Usuário Autenticado (Logado)
                  </span>
                  <span className="text-xs font-black text-[#135136]">
                    {user.points} pts no Passaporte
                  </span>
                </div>
                <div>
                  <p
                    data-testid="logged-in-user-summary"
                    className="font-heading font-black text-base text-stone-900"
                  >
                    {formatUserDisplayWithPronoun(user)}
                  </p>
                  <p className="text-xs text-stone-600">
                    {user.email} • Perfil:{' '}
                    <strong className="uppercase">{user.role}</strong> • Provedor:{' '}
                    <strong className="uppercase">{user.provider}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href="/"
                    className="py-2 px-3 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-colors"
                  >
                    Ir para o Catálogo →
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    data-testid="auth-card-logout-btn"
                    className="py-2 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs transition-colors"
                  >
                    Sair da Conta
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-black uppercase">
                  Modo Visitante (Deslogado)
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Como visitante você pode consultar os 61 restaurantes e 2.670 pratos. <strong>Entre ou crie sua conta</strong> para acumular +50 pontos por avaliação na Cédula Oficial com seu Nome Social e Pronome.
                </p>
              </div>
            )}
          </div>

          {/* 3 Perfis Rápidos da Banca (1 Clique) */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Acesso Rápido de Demonstração (1 Clique para a Banca):
            </p>
            {PROFILE_OPTIONS.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfile === profile.id;
              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelectDemoProfile(profile)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#135136] text-white border-[#135136] shadow-md'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#FFB703] text-stone-900'
                          : 'bg-stone-100 text-[#135136]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-heading font-bold text-sm">
                          {profile.title}
                        </h2>
                        {isSelected && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFB703] text-stone-900">
                            Ativo
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-emerald-100' : 'text-stone-500'
                        }`}
                      >
                        {profile.demoNomeSocial} ({profile.demoPronome}) •{' '}
                        {profile.demoEmail}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-white/15">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickDemoAuthenticateAndGo(profile);
                        }}
                        data-testid={`demo-quick-enter-${profile.id}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FFB703] hover:bg-[#e5a400] text-stone-950 font-black text-xs flex items-center justify-between shadow-sm active:scale-[0.99] transition-all"
                      >
                        <span className="truncate">{profile.redirectLabel}</span>
                        <ArrowRight className="w-4 h-4 shrink-0 ml-1.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Painel Principal com Abas (Entrar | Criar Conta | Recuperar Senha) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            {/* Barra de Abas */}
            <div
              role="tablist"
              aria-label="Modos de Autenticação"
              className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-stone-100 border border-stone-200"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'login'}
                data-testid="tab-login"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg(null);
                  setSuccessBanner(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'login'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'register'}
                data-testid="tab-register"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg(null);
                  setSuccessBanner(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'register'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'recover'}
                data-testid="tab-recover"
                onClick={() => {
                  setActiveTab('recover');
                  setErrorMsg(null);
                  setSuccessBanner(null);
                }}
                className={`py-2.5 px-3 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'recover'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Recuperar Senha</span>
              </button>
            </div>

            {/* Alertas de Erro ou Sucesso */}
            {errorMsg && (
              <div
                role="alert"
                data-testid="auth-error-alert"
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successBanner && (
              <div
                role="status"
                data-testid="auth-success-banner"
                className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2 text-emerald-950"
              >
                <div className="flex items-center gap-2 font-heading font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successBanner}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={currentProfileObj.redirectPath}
                    className="py-2 px-3.5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <span>{currentProfileObj.redirectLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                  </Link>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* ABA 1: ENTRAR (E-MAIL/SENHA + GOOGLE & APPLE OAUTH)           */}
            {/* ============================================================== */}
            {activeTab === 'login' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#135136]">
                      Acesso Seguro (PBKDF2 + Rate Limit)
                    </span>
                    <h2 className="font-heading font-black text-xl text-stone-900">
                      Entrar como {currentProfileObj.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateError}
                    data-testid="simulate-401-btn"
                    className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                  >
                    Simular Erro (HTTP 401)
                  </button>
                </div>

                {/* Botões de Login Social: Google e Apple */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleOAuthLogin('google')}
                    data-testid="oauth-google-btn"
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.74-.06-1.47-.19-2.18H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.06Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                    <span>Continuar com Google</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleOAuthLogin('apple')}
                    data-testid="oauth-apple-btn"
                    className="py-3 px-4 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
                    </svg>
                    <span>Continuar com Apple</span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold uppercase text-stone-400">
                    ou com seu e-mail e senha
                  </span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="login-email"
                      className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5"
                    >
                      E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="login-email-input"
                        placeholder="seuemail@carafood.com.br"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-[#135136] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-bold uppercase tracking-wider text-stone-600"
                      >
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoverTarget(email || 'comensal@carafood.com.br');
                          setActiveTab('recover');
                        }}
                        data-testid="goto-recover-link"
                        className="text-xs font-bold text-[#135136] hover:underline"
                      >
                        Esqueci minha senha (E-mail / WhatsApp)
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        data-testid="login-password-input"
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-[#135136] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        aria-label="Alternar visibilidade da senha"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="login-submit-btn"
                    className="w-full py-3.5 rounded-2xl bg-[#135136] hover:bg-[#0D3825] disabled:opacity-60 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-[#FFB703]" />
                    <span>{submitting ? 'Autenticando...' : 'Entrar no CaráFood'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================== */}
            {/* ABA 2: CRIAR CONTA (NOME SOCIAL, PRONOME SOCIAL & LGPD)       */}
            {/* ============================================================== */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="pb-2 border-b border-stone-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#135136]">
                    Cadastro Gratuito • Respeito à Identidade &amp; LGPD
                  </span>
                  <h2 className="font-heading font-black text-xl text-stone-900">
                    Criar Nova Conta no CaráFood
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Nome Completo (Registro Civil) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regNomeCivil}
                      onChange={(e) => setRegNomeCivil(e.target.value)}
                      data-testid="register-nome-civil"
                      placeholder="Seu nome completo"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#135136] block mb-1">
                      Nome Social (Como prefere ser chamado)
                    </label>
                    <input
                      type="text"
                      value={regNomeSocial}
                      onChange={(e) => setRegNomeSocial(e.target.value)}
                      data-testid="register-nome-social"
                      placeholder="Ex: Alex Costa (Exibido em todo o site)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/40 border border-emerald-300 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    />
                  </div>
                </div>

                {/* Seletor de Pronome Social */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Pronome Social (Exibido no seu Perfil e na Cédula de Avaliação) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[...PRONOUN_CHOICES, 'Personalizado'].map((pron) => {
                      const active = regIsCustomPronome
                        ? pron === 'Personalizado'
                        : regPronome === pron;
                      return (
                        <button
                          key={pron}
                          type="button"
                          data-testid={`pronoun-option-${pron.replace('/', '-')}`}
                          onClick={() => {
                            if (pron === 'Personalizado') {
                              setRegIsCustomPronome(true);
                            } else {
                              setRegIsCustomPronome(false);
                              setRegPronome(pron);
                            }
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? 'bg-[#135136] text-white border-[#135136]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {pron}
                        </button>
                      );
                    })}
                  </div>
                  {regIsCustomPronome && (
                    <input
                      type="text"
                      value={regCustomPronome}
                      onChange={(e) => setRegCustomPronome(e.target.value)}
                      data-testid="register-custom-pronoun"
                      placeholder="Informe seu pronome (ex: Ile/Dile)"
                      className="mt-2 w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      data-testid="register-email"
                      placeholder="voce@exemplo.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      WhatsApp com DDD (Para recuperação de senha)
                    </label>
                    <input
                      type="text"
                      value={regWhatsapp}
                      onChange={(e) => setRegWhatsapp(e.target.value)}
                      data-testid="register-whatsapp"
                      placeholder="(12) 99700-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Tipo de Perfil
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      data-testid="register-role-select"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    >
                      <option value="comensal">
                        Comensal / Morador / Turista
                      </option>
                      <option value="gestor">
                        Gestor de Restaurante / Quiosque (0% Taxa)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Criar Senha (mín. 6 caracteres) *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      data-testid="register-password"
                      placeholder="Mínimo de 6 caracteres"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#135136]"
                    />
                  </div>
                </div>

                {/* Consentimento LGPD */}
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regLgpdAccepted}
                    onChange={(e) => setRegLgpdAccepted(e.target.checked)}
                    data-testid="register-lgpd-checkbox"
                    className="mt-0.5 w-4 h-4 accent-[#135136]"
                  />
                  <span className="text-xs text-stone-600 leading-relaxed">
                    Concordo com o tratamento dos meus dados cadastrais conforme a <strong>LGPD (Lei nº 13.709/2018)</strong> exclusivamente para uso do Passaporte Gourmet e avaliações auditadas, podendo exportar em JSON ou excluir minha conta a qualquer momento.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="register-submit-btn"
                  className="w-full py-3.5 rounded-2xl bg-[#135136] hover:bg-[#0D3825] disabled:opacity-60 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#FFB703]" />
                  <span>
                    {submitting
                      ? 'Criando sua conta...'
                      : 'Criar Conta Gratuita (+350 pts no Passaporte)'}
                  </span>
                </button>
              </form>
            )}

            {/* ============================================================== */}
            {/* ABA 3: RECUPERAR SENHA (VIA E-MAIL E VIA WHATSAPP COM OTP)    */}
            {/* ============================================================== */}
            {activeTab === 'recover' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-stone-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#135136]">
                    Recuperação Multicanal (Código OTP de 6 Dígitos)
                  </span>
                  <h2 className="font-heading font-black text-xl text-stone-900">
                    Recuperar Senha por E-mail ou WhatsApp
                  </h2>
                </div>

                {/* Seletor de Canal: E-mail vs WhatsApp */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    data-testid="recover-channel-email"
                    onClick={() => {
                      setRecoverChannel('email');
                      setRecoverTarget('comensal@carafood.com.br');
                      setSandboxOtpData(null);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      recoverChannel === 'email'
                        ? 'bg-emerald-50 border-[#135136] text-[#135136]'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Mail className="w-4 h-4 mb-1" />
                    <span className="font-bold text-xs block">
                      Recuperar via E-mail
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Envia código de 6 dígitos para sua caixa de entrada
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="recover-channel-whatsapp"
                    onClick={() => {
                      setRecoverChannel('whatsapp');
                      setRecoverTarget('12997112233');
                      setSandboxOtpData(null);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      recoverChannel === 'whatsapp'
                        ? 'bg-emerald-50 border-[#135136] text-[#135136]'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mb-1" />
                    <span className="font-bold text-xs block">
                      Recuperar via WhatsApp
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Envia token instantâneo pelo WhatsApp
                    </span>
                  </button>
                </div>

                {/* Passo 1: Solicitar Código OTP */}
                <form onSubmit={handleRequestRecoveryOtp} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      {recoverChannel === 'whatsapp'
                        ? 'Seu Número de Celular / WhatsApp com DDD *'
                        : 'Seu E-mail Cadastrado *'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={recoverChannel === 'whatsapp' ? 'text' : 'email'}
                        required
                        value={recoverTarget}
                        onChange={(e) => setRecoverTarget(e.target.value)}
                        data-testid="recover-target-input"
                        placeholder={
                          recoverChannel === 'whatsapp'
                            ? 'Ex: (12) 99711-2233'
                            : 'Ex: comensal@carafood.com.br'
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm"
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        data-testid="recover-send-otp-btn"
                        className="px-4 py-2.5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs whitespace-nowrap transition-colors"
                      >
                        Enviar Código OTP
                      </button>
                    </div>
                  </div>
                </form>

                {/* Preview do Sandbox da Banca para Teste Imediato sem depender de e-mail externo */}
                {sandboxOtpData && (
                  <div
                    data-testid="recover-sandbox-box"
                    className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-black text-amber-950 uppercase">
                        Mensagem Entregue ({sandboxOtpData.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'})
                      </span>
                      <span
                        data-testid="recover-sandbox-otp"
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-400 font-mono font-black text-sm text-[#135136]"
                      >
                        {sandboxOtpData.otpCode}
                      </span>
                    </div>
                    <p className="text-stone-700 font-medium">
                      {sandboxOtpData.deliveryPreview}
                    </p>
                  </div>
                )}

                {recoverStepSuccess && (
                  <p className="text-xs font-bold text-emerald-700">
                    {recoverStepSuccess}
                  </p>
                )}

                {/* Passo 2: Validar Código OTP e Definir Nova Senha */}
                <form
                  onSubmit={handleVerifyOtpAndReset}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Código de 6 Dígitos Recebido *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={recoverOtpInput}
                        onChange={(e) => setRecoverOtpInput(e.target.value)}
                        data-testid="recover-otp-input"
                        placeholder="000000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 font-mono font-bold text-sm tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Nova Senha (mín. 6 caracteres) *
                      </label>
                      <input
                        type="password"
                        required
                        value={recoverNewPassword}
                        onChange={(e) => setRecoverNewPassword(e.target.value)}
                        data-testid="recover-new-password-input"
                        placeholder="Digite a nova senha"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="recover-verify-btn"
                    className="w-full py-3 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-[#FFB703]" />
                    <span>Validar Código e Redefinir Minha Senha</span>
                  </button>
                </form>
              </div>
            )}

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
              <span>Tem um restaurante, quiosque ou padaria em Caraguá?</span>
              <Link
                href="/contato"
                className="font-bold text-[#135136] hover:underline"
              >
                Solicitar Credenciamento Gratuito (0% Taxa) →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200/80 py-6 pb-24 lg:pb-6 px-4 text-center text-xs text-stone-500">
        <p>
          <strong>CaráFood</strong> — Roteiro Gastronômico dos 53 Bairros de Caraguatatuba • Governança LGPD &amp; Inclusão (Nome Social e Pronome Social)
        </p>
      </footer>
    </div>
  );
}
