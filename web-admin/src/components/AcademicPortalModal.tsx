'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Cpu,
  Database,
  Activity,
  GraduationCap,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AcademicPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicPortalModal: React.FC<AcademicPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState('CristianoBestProf');
  const [password, setPassword] = useState('Nota10');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'rag' | 'metrics' | 'scrapers' | 'dedication'>('rag');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'CristianoBestProf' && password === 'Nota10') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Credenciais acadêmicas inválidas. Use CristianoBestProf / Nota10 ou o botão rápido.');
    }
  };

  const handleQuickAuth = () => {
    setUsername('CristianoBestProf');
    setPassword('Nota10');
    setIsAuthenticated(true);
    setErrorMsg('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('CristianoBestProf');
    setPassword('Nota10');
  };

  const stages = [
    {
      step: '01',
      title: 'Coleta de Cardápios e Fotos Reais',
      desc: 'Extração automatizada de 61 estabelecimentos e 2.670 pratos reais de Caraguatatuba (Anota AI, Goomer, Cardápio Web e Google Maps).',
      tech: 'Playwright + Python Harvester',
    },
    {
      step: '02',
      title: 'Auditoria de Nitidez 1:1 (SmartFoodImage)',
      desc: 'Inspeção de dimensões reais (1.230 imagens catalogadas) que impede estiramento de miniaturas 200px e aplica =w1200-no nas capas HD.',
      tech: 'Pillow + SmartFoodImage.tsx',
    },
    {
      step: '03',
      title: 'Classificação Culinária & 53 Bairros',
      desc: 'Mapeamento em 8 categorias reais (Lanches, Pizzas, Sushi, Combos Família, Marmitas, Frutos do Mar, Porções e Doces) nas 4 macro-regiões.',
      tech: 'Regex Hiperlocal + Geohash',
    },
    {
      step: '04',
      title: 'Ranking Bayesiano (W_R) & Anti-Agrupamento',
      desc: 'Ordenação justa ponderada pelo volume real de avaliações do Google Maps com janela deslizante que evita repetir a mesma cozinha em sequência.',
      tech: 'W_R = (v/(v+m))R + (m/(v+m))C',
    },
    {
      step: '05',
      title: 'Chef CaráFood & Segurança HTTPS Campus',
      desc: 'Assistente gastronômico integrado via rota relativa /api/chat com cabeçalhos HSTS/CSP estritos compatíveis com a rede Cruzeiro do Sul.',
      tech: 'Next.js 14 API + HSTS Preload',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-6">
          {/* Backdrop Escuro Suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0A1612]/75 backdrop-blur-xs"
          />

          {/* Modal Container Responsivo (Sem Duplo Scroll no Celular) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-4xl max-h-[90dvh] sm:max-h-[88vh] bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#E2D9CC] flex flex-col overflow-hidden z-10"
          >
            {/* Header Fixo Compacto para Celular e Desktop */}
            <div className="bg-[#113228] text-[#FBF9F5] px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-2 shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FFB703] text-stone-950 flex items-center justify-center shadow-md shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-white leading-tight truncate">
                      Portal Prof. Cristiano &amp; Banca TCC
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-[#FFB703] border border-[#FFB703]/40 shrink-0">
                      ADS • Módulo
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#9DB8B1] truncate">
                    Centro Universitário Módulo • CaráFood (S01–S16)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-mono text-white transition-colors"
                  >
                    Sair
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#9DB8B1] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Fechar modal acadêmico"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo Rolável Único */}
            {!isAuthenticated ? (
              <div className="p-4 sm:p-8 overflow-y-auto max-w-md w-full mx-auto space-y-4 sm:space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#135136]/10 text-[#135136] flex items-center justify-center mx-auto border border-[#135136]/20">
                    <ShieldCheck className="w-6 h-6 text-[#135136]" />
                  </div>
                  <h4 className="font-heading font-black text-xl sm:text-2xl text-stone-900 tracking-tight">
                    Acesso Rápido do Professor
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Auditoria de arquitetura, catálogo real de Caraguatatuba e atalhos administrativos.
                  </p>
                </div>

                {/* Botão Principal de 1 Clique no Topo para Uso Imediato no Celular */}
                <button
                  type="button"
                  onClick={handleQuickAuth}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FFB703] hover:bg-amber-400 active:scale-[0.99] text-stone-950 text-xs font-black transition-all flex items-center justify-between shadow-md border-2 border-stone-900/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#135136] text-[#FFB703] flex items-center justify-center font-black text-sm shrink-0">
                      🎓
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-black text-stone-950 text-xs sm:text-sm truncate">
                        Entrar em 1 Clique (Prof. Cristiano)
                      </div>
                      <div className="text-[10px] text-stone-800 font-semibold truncate">
                        Credencial pré-preenchida • CristianoBestProf / Nota10
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-950 shrink-0" />
                </button>

                {/* Atalhos Diretos para Telas Administrativas */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/moderation"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#135136] shrink-0" />
                    <span className="truncate">Painel Curadoria</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#135136] shrink-0" />
                    <span className="truncate">Tela de Login (S07)</span>
                  </Link>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
                    Ou confirme os dados abaixo
                  </span>
                  <div className="border-t border-stone-200 w-full" />
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-black text-stone-700 uppercase tracking-wider mb-1">
                      Identificação do Docente:
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="CristianoBestProf"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-sm text-stone-900 font-medium focus:outline-none focus:border-[#135136] focus:bg-white transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-stone-700 uppercase tracking-wider mb-1">
                      Chave / Senha:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nota10"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] border border-stone-300 text-sm text-stone-900 font-mono focus:outline-none focus:border-[#135136] focus:bg-white transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 p-1"
                        title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {showPassword ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#135136] hover:bg-[#1E6B47] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
                    <span>Desbloquear Dossiê Completo</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                {/* Boas-vindas Responsivo ao Professor Cristiano */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-[#134E4A]">
                        Acesso Autorizado: Prof. Me. Cristiano S. Negrão
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#0F766E]">
                        Catálogo 100% real: 61 estabelecimentos, 2.670 pratos e 53 bairros de Caraguá.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#0D9488] text-white shrink-0">
                    Auditor Ativo • Nota 10
                  </span>
                </div>

                {/* Barra de Atalhos Rápidos das Telas Administrativas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Link
                    href="/moderation"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#135136] text-white text-xs font-bold shadow-xs hover:bg-[#1E6B47] transition-colors"
                  >
                    <span className="truncate">Curadoria (/moderation)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FFB703] shrink-0 ml-1" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold border border-stone-300 transition-colors"
                  >
                    <span className="truncate">Login 3 Perfis (/login)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#135136] shrink-0 ml-1" />
                  </Link>
                  <Link
                    href="/rankings"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold border border-stone-300 transition-colors"
                  >
                    <span className="truncate">Rankings W_R (/rankings)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#135136] shrink-0 ml-1" />
                  </Link>
                  <Link
                    href="/contato"
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold border border-stone-300 transition-colors"
                  >
                    <span className="truncate">Credenciar (/contato)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#135136] shrink-0 ml-1" />
                  </Link>
                </div>

                {/* Seletor de Abas Técnicas em Grade 2x2 no Celular (Zero Scroll Escondido) */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 border-b border-[#E2D9CC] pb-3">
                  {[
                    { id: 'rag', label: 'Pipeline & Dados Reais', icon: Cpu },
                    { id: 'metrics', label: 'Fórmula W_R & Notas', icon: Activity },
                    { id: 'scrapers', label: 'Segurança & Campus', icon: Database },
                    { id: 'dedication', label: 'Grupo & Entregas APS', icon: BookOpen },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center sm:justify-start gap-1.5 transition-all ${
                          isActive
                            ? 'bg-[#113228] text-white shadow-xs'
                            : 'bg-[#FAF6F0] text-[#52525B] hover:text-[#18181B]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 text-[#FFB703]" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Aba 1: Pipeline & Dados Reais */}
                {activeTab === 'rag' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h4 className="font-bold text-[#18181B] text-sm sm:text-base">
                        Pipeline de Engenharia de Dados Reais &amp; IA Hiperlocal
                      </h4>
                      <span className="self-start sm:self-auto text-[11px] font-mono text-[#0D9488] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-[#99F6E4]">
                        61 Locais • 2.670 Pratos Reais
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {stages.map((st) => (
                        <div
                          key={st.step}
                          className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-[#0D9488]">
                              Estágio {st.step}
                            </span>
                            <span className="font-mono text-[10px] text-[#71717A] truncate">
                              {st.tech}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-[#18181B]">{st.title}</h5>
                          <p className="text-[11px] text-[#52525B] leading-relaxed">{st.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aba 2: Fórmula Matemática W_R & Super Nota */}
                {activeTab === 'metrics' && (
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-[#18181B] text-sm sm:text-base">
                      Ponderação Bayesiana (W_R) e Cédula Oficial de 5 Critérios
                    </h4>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      Para ordenar os 61 restaurantes de forma justa (evitando que 1 única avaliação 5,0 supere casas consolidadas com centenas de avaliações no Google Maps), implementamos o estimador Bayesiano de credibilidade combinado com a Cédula de 5 critérios:
                    </p>

                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#113228] text-[#FBF9F5] font-mono text-[11px] sm:text-xs space-y-2 overflow-x-auto">
                      <p className="text-[#FFB703] font-bold">
                        W_R = [ v / (v + m) ] × R + [ m / (v + m) ] × C
                      </p>
                      <p className="text-[#7FD1C6] font-bold">
                        Cédula(5 Critérios) = Sabor(35%) + Apresentação(20%) + Insumos(15%) + Atendimento(15%) + Ambiente(15%)
                      </p>
                      <p className="text-[#9DB8B1] text-[10px] sm:text-[11px]">
                        Onde R = média real do Google Maps, v = volume de avaliações verificadas, m = 25 (limiar de confiança) e C = 4,62 (média municipal de Caraguatatuba).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC]">
                        <span className="text-[11px] text-[#71717A] block">Catálogo Auditado</span>
                        <span className="font-mono font-bold text-base sm:text-lg text-[#18181B]">
                          61 Casas / 2.670 Pratos
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC]">
                        <span className="text-[11px] text-[#71717A] block">Fontes Integradas</span>
                        <span className="font-mono font-bold text-base sm:text-lg text-[#18181B]">
                          Google Maps + Cardápios
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC]">
                        <span className="text-[11px] text-[#71717A] block">Nitidez Nativa 1:1</span>
                        <span className="font-mono font-bold text-base sm:text-lg text-[#0D9488]">
                          1.230 Fotos Reais
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aba 3: Segurança HTTPS Campus Cruzeiro do Sul & Telemetria */}
                {activeTab === 'scrapers' && (
                  <div className="space-y-3.5">
                    <h4 className="font-bold text-[#18181B] text-sm sm:text-base">
                      Conformidade HTTPS/HSTS (Rede Universitária Cruzeiro do Sul) &amp; Telemetria
                    </h4>
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC] space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#52525B]">
                        <span>Produção Vercel: https://foddtech.vercel.app</span>
                        <span className="text-[#059669] font-bold">TLS 1.3 + HSTS Preload Ativo</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-[11px] text-[#18181B]">
                        <p>• Zero Mixed-Content / Localhost Fetch: Todas as rotas operam via HTTPS relativo (/api/...)</p>
                        <p>• Cabeçalhos de Segurança: Strict-Transport-Security, CSP upgrade-insecure-requests e X-Frame-Options</p>
                        <p>• Cobertura Geográfica: 53 bairros oficiais de Caraguatatuba divididos em 4 macro-regiões</p>
                        <p>• Persistência Ativa (S13): /api/restaurants/leads, /api/restaurants/reviews e /api/moderation</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aba 4: Composição do Grupo & Agradecimento */}
                {activeTab === 'dedication' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border border-[#E2D9CC] space-y-3.5">
                    <h4 className="font-serif italic text-xl sm:text-2xl text-[#113228]">
                      Ao Prof. Me. Cristiano S. Negrão &amp; Banca Módulo
                    </h4>
                    <p className="text-xs text-[#52525B] leading-relaxed">
                      Projeto desenvolvido na disciplina de <b>Atividades Práticas Supervisionadas II (APS II)</b> do curso de Análise e Desenvolvimento de Sistemas no <b>Centro Universitário Módulo (Cruzeiro do Sul Educacional)</b>.
                    </p>

                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#135136] block">
                        Composição Oficial do Grupo:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-3 rounded-xl bg-white border border-[#E2D9CC] text-xs space-y-0.5">
                          <strong className="block text-stone-900 font-bold">
                            Gabriel H. Rodrigues
                          </strong>
                          <span className="text-[10px] font-mono text-stone-600 block">
                            RGM: 42073448
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold block">
                            Product Owner / Tech Lead / Full-stack
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#E2D9CC] text-xs space-y-0.5">
                          <strong className="block text-stone-900 font-bold">
                            Matheus Vicente
                          </strong>
                          <span className="text-[10px] font-mono text-stone-600 block">
                            RGM: 42138078
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold block">
                            Requisitos / Back-end / Banco de Dados
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-[#E2D9CC] text-xs space-y-0.5">
                          <strong className="block text-stone-900 font-bold">
                            Pedro Simone
                          </strong>
                          <span className="text-[10px] font-mono text-stone-600 block">
                            RGM: 44066872
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold block">
                            UI/UX / Front-end / Testes / Documentação
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E2D9CC] text-xs font-mono text-[#113228]">
                      &quot;Valorizando a gastronomia real dos 53 bairros de Caraguatatuba com engenharia de software rigorosa.&quot;
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
