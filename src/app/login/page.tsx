'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Store,
  Award,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { Navbar, CaraguaWaveEmblem } from '../../components/Navbar';

type UserRole = 'comensal' | 'gestor' | 'curador';

const DEMO_PROFILES: Record<
  UserRole,
  {
    title: string;
    subtitle: string;
    email: string;
    badge: string;
    redirectHref: string;
    redirectLabel: string;
    permissions: string[];
  }
> = {
  comensal: {
    title: 'Avaliador Local & Visitante',
    subtitle: 'Morador ou Turista • Caraguá a Gosto',
    email: 'comensal@carafood.com.br',
    badge: 'Perfil Cliente',
    redirectHref: '/',
    redirectLabel: 'Ir para os Cardápios & Avaliar Pratos',
    permissions: [
      'Envio de avaliações verificadas nos 5 critérios do festival Caraguá a Gosto',
      'Acesso a quedas recentes de preço e filtros alimentares seguros',
      'Favoritos salvos e recomendações personalizadas pelo Chef CaráFood',
    ],
  },
  gestor: {
    title: 'Gestor de Restaurante',
    subtitle: 'Parceiro Credenciado • 53 Bairros',
    email: 'gestor@restaurante.com.br',
    badge: 'Perfil Comerciante',
    redirectHref: '/contato',
    redirectLabel: 'Acessar Portal de Credenciamento & Cardápio',
    permissions: [
      'Cadastro e atualização gratuita de pratos, preços do dia e horários',
      'Acompanhamento transparente da Super Nota e comentários recentes',
      'Solicitação de selo de procedência local (AMAPEC Cocanha / Colônia Z-8)',
    ],
  },
  curador: {
    title: 'Curadoria & Banca Módulo',
    subtitle: 'Prof. Me. Cristiano S. Negrão & Equipe',
    email: 'cristiano@modulo.edu.br',
    badge: 'Perfil Curador',
    redirectHref: '/moderation',
    redirectLabel: 'Abrir Painel de Curadoria de Cardápios',
    permissions: [
      'Revisão e aprovação em 1 clique de pratos coletados nos 53 bairros',
      'Verificação de avaliações autênticas e proteção de privacidade (LGPD)',
      'Acesso completo às métricas e relatórios do projeto CaráFood',
    ],
  },
};

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('curador');
  const [email, setEmail] = useState<string>(DEMO_PROFILES.curador.email);
  const [password, setPassword] = useState<string>('Carafood@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authState, setAuthState] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_PROFILES[role].email);
    setPassword('Carafood@2026');
    setAuthState('idle');
    setErrorMessage('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setAuthState('error');
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }
    if (password.trim().length < 6) {
      setAuthState('error');
      setErrorMessage('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }
    setAuthState('success');
    setErrorMessage('');
  };

  const handleSimulateError = () => {
    setPassword('123');
    setAuthState('error');
    setErrorMessage(
      'Senha incorreta ou inferior a 6 caracteres. Verifique suas credenciais ou selecione um dos perfis de acesso rápido ao lado.'
    );
  };

  const currentProfile = DEMO_PROFILES[selectedRole];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex flex-col justify-between selection:bg-[#FFB703]/30 selection:text-[#135136]">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: Seleção de Perfil */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#135136]/10 border border-[#135136]/20 text-xs font-black text-[#135136]">
              <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
              <span>Acesso Unificado • CaráFood</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                  Entrar na Plataforma
                </h1>
                <CaraguaWaveEmblem className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Acesse como morador/visitante para avaliar pratos, como comerciante dos{' '}
                <strong>53 bairros</strong> ou como membro da curadoria.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block">
                Escolha um perfil para preenchimento rápido (1 clique):
              </span>

              {(Object.keys(DEMO_PROFILES) as UserRole[]).map((roleKey) => {
                const prof = DEMO_PROFILES[roleKey];
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleSelectRole(roleKey)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#135136] text-white border-[#FFB703] shadow-lg ring-2 ring-[#FFB703]/40'
                        : 'bg-white hover:bg-amber-50/50 text-stone-900 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#FFB703] text-stone-900'
                            : 'bg-stone-100 text-[#135136]'
                        }`}
                      >
                        {roleKey === 'comensal' && <UserCheck className="w-5 h-5" />}
                        {roleKey === 'gestor' && <Store className="w-5 h-5" />}
                        {roleKey === 'curador' && <Award className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-heading font-black text-sm flex items-center gap-2">
                          <span>{prof.title}</span>
                        </div>
                        <p
                          className={`text-[11px] ${
                            isSelected ? 'text-emerald-100' : 'text-stone-500'
                          }`}
                        >
                          {prof.subtitle}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-white/15 text-[#FFB703]'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {prof.email}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] block">
                Recursos habilitados ({currentProfile.badge}):
              </span>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {currentProfile.permissions.map((perm, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#135136] shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Login */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 border-2 border-stone-200/90 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#135136] text-[#FFB703] flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#135136] block">
                    Acesso Protegido
                  </span>
                  <h2 className="font-heading font-black text-xl text-stone-900">
                    Entrar como {currentProfile.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateError}
                className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black transition-colors"
              >
                Testar Senha Inválida
              </button>
            </div>

            {authState === 'error' && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black">Não foi possível entrar</p>
                  <p className="text-rose-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {authState === 'success' && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-[#135136] text-[#135136] space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#135136] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFB703] text-stone-900 text-[10px] font-black">
                      ACESSO CONFIRMADO
                    </span>
                    <h3 className="font-heading font-black text-base text-stone-900">
                      Bem-vindo(a), {currentProfile.title}!
                    </h3>
                    <p className="text-xs text-stone-700">
                      Sessão iniciada para <strong>{email}</strong>. Escolha abaixo para onde
                      deseja seguir:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    href={currentProfile.redirectHref}
                    className="px-4 py-2.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-[#FFB703] text-xs font-black flex items-center gap-1.5 shadow-md transition-transform hover:scale-[1.02]"
                  >
                    <span>{currentProfile.redirectLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold transition-colors"
                  >
                    Ir para o Início (/)
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#135136] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAuthState('idle');
                    }}
                    placeholder="Ex.: cristiano@modulo.edu.br"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF7F2] border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:bg-white focus:border-[#135136] focus:ring-2 focus:ring-[#135136]/15"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#135136] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setAuthState('idle');
                    }}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#FAF7F2] border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:bg-white focus:border-[#135136] focus:ring-2 focus:ring-[#135136]/15"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1"
                    aria-label="Alternar visibilidade da senha"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-heading font-black text-sm shadow-lg shadow-[#135136]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Lock className="w-4 h-4 text-[#FFB703]" />
                <span>Entrar no CaráFood</span>
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
              <span>Tem um restaurante, quiosque ou padaria em Caraguá?</span>
              <Link
                href="/contato"
                className="font-black text-[#135136] hover:underline flex items-center gap-1"
              >
                <span>Solicitar Credenciamento Gratuito</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-[#135136] text-white py-6 px-4 border-t-4 border-[#FFB703] text-center text-xs">
        <span className="font-bold">CaráFood</span> • Guia Gastronômico dos 53 Bairros de
        Caraguatatuba • Centro Universitário Módulo
      </footer>
    </div>
  );
}
