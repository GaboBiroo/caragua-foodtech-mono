'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, CheckCircle2,
  AlertCircle, UserCheck, Store, Award, ArrowRight, KeyRound
} from 'lucide-react';
import { Navbar, CaraguaWaveEmblem } from '../../components/Navbar';

type UserRole = 'comensal' | 'gestor' | 'curador';

const DEMO_PROFILES: Record<UserRole, {
  title: string;
  subtitle: string;
  email: string;
  badge: string;
  redirectHref: string;
  redirectLabel: string;
  permissions: string[];
}> = {
  comensal: {
    title: 'Comensal Auditado',
    subtitle: 'Morador ou Turista • Caraguá a Gosto',
    email: 'comensal@carafood.com.br',
    badge: 'HU03 • Passaporte Caiçara',
    redirectHref: '/',
    redirectLabel: 'Ir para o Feed & Emitir Cédula (+50 pts)',
    permissions: [
      'Emissão de Cédulas Oficiais de 5 Critérios Ponderados',
      'Acúmulo de Pontos Gourmet e Carimbos nas 4 Macro-Regiões',
      'Sincronização da coleção pessoal "📌 Meus Salvos"',
    ],
  },
  gestor: {
    title: 'Gestor de Restaurante',
    subtitle: 'Parceiro Credenciado • 53 Bairros',
    email: 'gestor@restaurante.com.br',
    badge: 'HU04 • Gestão de Cardápio',
    redirectHref: '/contato',
    redirectLabel: 'Acessar Portal de Credenciamento & Cardápio',
    permissions: [
      'Atualização de preços reais, fotos e In-Image Dish Tags',
      'Visualização da curva de meia-vida de 30 dias (λ = ln2/30)',
      'Solicitação de selo oficial AMAPEC Cocanha ou Colônia Z-8',
    ],
  },
  curador: {
    title: 'Curador / Admin Módulo',
    subtitle: 'Prof. Cristiano S. Negrão & Banca SECTUR',
    email: 'cristiano@modulo.edu.br',
    badge: 'HU05 • Auditoria Z-Score',
    redirectHref: '/moderation',
    redirectLabel: 'Abrir Painel de Moderação Anti-Fraude',
    permissions: [
      'Auditoria estatística de avaliações retidas pelo filtro Z-Score (|Z| > 2.5)',
      'Homologação de novos restaurantes nos 53 bairros de Caraguatatuba',
      'Inspeção completa dos artefatos acadêmicos de APS II (S01 a S16)',
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
      setErrorMessage('Por favor, informe um endereço de e-mail institucional ou pessoal válido.');
      return;
    }
    if (password.trim().length < 6) {
      setAuthState('error');
      setErrorMessage('Credenciais inválidas: a senha de segurança deve possuir no mínimo 6 caracteres.');
      return;
    }
    setAuthState('success');
    setErrorMessage('');
  };

  const handleSimulateError = () => {
    setPassword('123');
    setAuthState('error');
    setErrorMessage('Falha de Autenticação (HTTP 401): Senha incorreta ou inferior a 6 caracteres. Verifique suas credenciais ou utilize um perfil de demonstração abaixo.');
  };

  const currentProfile = DEMO_PROFILES[selectedRole];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex flex-col justify-between selection:bg-[#FFB703]/30 selection:text-[#135136]">
      <Navbar />

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: CONTEXTO RBAC & PERFIS DE DEMONSTRAÇÃO (S07) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#135136]/10 border border-[#135136]/20 text-xs font-black text-[#135136]">
              <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
              <span>CONTROLE DE ACESSO RBAC • SEMANA 07 (APS II)</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                  Acesso Restrito CaráFood
                </h1>
                <CaraguaWaveEmblem className="w-7 h-7" />
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Autenticação unificada para comensais avaliadores do festival <strong>Caraguá a Gosto</strong>, gestores de restaurantes dos <strong>53 bairros</strong> e curadores acadêmicos.
              </p>
            </div>

            {/* Cards Seletores de Perfil em 1 Clique */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block">
                Selecione um Perfil para Preenchimento Automático (1 Clique):
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
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#FFB703] text-stone-900' : 'bg-stone-100 text-[#135136]'
                      }`}>
                        {roleKey === 'comensal' && <UserCheck className="w-5 h-5" />}
                        {roleKey === 'gestor' && <Store className="w-5 h-5" />}
                        {roleKey === 'curador' && <Award className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-heading font-black text-sm flex items-center gap-2">
                          <span>{prof.title}</span>
                        </div>
                        <p className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                          {prof.subtitle}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/15 text-[#FFB703]' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {prof.email}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Permissões do Perfil Selecionado */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-sm">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] block">
                Privilégios de Negócio deste Perfil ({currentProfile.badge}):
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

          {/* COLUNA DIREITA: FORMULÁRIO DE LOGIN COM FEEDBACK DE ERRO E SUCESSO */}
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
                    Autenticação Criptografada TLS 1.3
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
                title="Clique para demonstrar o estado de erro exigido na S07"
              >
                Simular Erro (S07)
              </button>
            </div>

            {/* FEEDBACK VISUAL DE ERRO (EXIGÊNCIA S07) */}
            {authState === 'error' && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black">Acesso Negado — Verifique suas Credenciais</p>
                  <p className="text-rose-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* FEEDBACK VISUAL DE SUCESSO E REDIRECIONAMENTO (EXIGÊNCIA S07) */}
            {authState === 'success' && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-[#135136] text-[#135136] space-y-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#135136] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFB703] text-stone-900 text-[10px] font-black">
                      SESSÃO AUTENTICADA COM SUCESSO
                    </span>
                    <h3 className="font-heading font-black text-base text-stone-900">
                      Bem-vindo(a), {currentProfile.title}!
                    </h3>
                    <p className="text-xs text-stone-700">
                      Token JWT emitido para <strong>{email}</strong>. Seus privilégios de acesso já estão ativos no ecossistema CaráFood.
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
                    Voltar para a Home (/)
                  </Link>
                </div>
              </div>
            )}

            {/* FORMULÁRIO DE ENTRADA DE DADOS */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  E-mail ou Usuário Cadastrado
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
                    placeholder="Ex: cristiano@modulo.edu.br"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF7F2] border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:bg-white focus:border-[#135136] focus:ring-2 focus:ring-[#135136]/15"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Senha de Segurança
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
                <span>Autenticar no Ecossistema CaráFood</span>
              </button>
            </form>

            {/* Rodapé do Card de Login: Link para Credenciamento S05 */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
              <span>Ainda não possui credencial de restaurante?</span>
              <Link
                href="/contato"
                className="font-black text-[#135136] hover:underline flex items-center gap-1"
              >
                <span>Solicitar Credenciamento B2B nos 53 Bairros</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-[#135136] text-white py-6 px-4 border-t-4 border-[#FFB703] text-center text-xs">
        <span className="font-bold">CaráFood</span> • Centro Universitário Módulo (APS II — Prof. Me. Cristiano S. Negrão) • Gabriel Rodrigues, Matheus Vicente & Pedro Simone
      </footer>
    </div>
  );
}
