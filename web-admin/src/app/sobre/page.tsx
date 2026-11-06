'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Award,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Anchor,
  BookOpen,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function SobreNosPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      <Navbar />

      {/* Cabeçalho Institucional */}
      <header className="relative bg-[#135136] text-white pt-14 pb-16 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Guia Gastronômico Hiperlocal • 53 Bairros de Caraguatatuba</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-white leading-tight">
            Conectando Moradores e Visitantes à Cozinha Real de{' '}
            <span className="text-[#FFB703]">Caraguatatuba</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            O CaráFood é uma plataforma de descoberta e curadoria gastronômica desenvolvida no
            Centro Universitário Módulo, sob orientação do Prof. Me. Cristiano S. Negrão.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* 1. O Contexto Real de Caraguatatuba */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#135136]/10 flex items-center justify-center text-[#135136]">
              <Anchor className="w-5 h-5 text-[#135136]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136]">
                Economia Local & Identidade Caiçara
              </span>
              <h2 className="font-heading font-black text-2xl text-stone-900">
                Por que Caraguatatuba precisava de uma vitrine própria
              </h2>
            </div>
          </div>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Com mais de 134 mil habitantes distribuídos em <strong>53 bairros oficiais</strong>,
              Caraguatatuba reúne uma cadeia gastronômica singular no Litoral Norte paulista: da
              produção de mexilhões na <strong>Fazenda Marinha da Cocanha (AMAPEC)</strong> e do
              pescado fresco desembarcado na{' '}
              <strong>Colônia de Pescadores Z-8 do Camaroeiro</strong>, até os quiosques da orla,
              padarias tradicionais, pizzarias e restaurantes familiares de bairro.
            </p>
            <p>
              Antes do CaráFood, quem procurava onde comer enfrentava dois problemas práticos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h4 className="font-black text-xs text-amber-950 uppercase tracking-wider mb-1">
                  1. Visibilidade Concentrada na Orla
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Aplicativos de entrega cobram comissões de até 27% dos pequenos comerciantes e
                  concentram a vitrine em poucos pontos turísticos, deixando de fora dezenas de
                  bairros residenciais da cidade.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <h4 className="font-black text-xs text-emerald-950 uppercase tracking-wider mb-1">
                  2. Notas Espalhadas e Sem Critério Claro
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  O consumidor precisava abrir vários aplicativos e mapas para descobrir o preço
                  real de um prato, se o local atendia restrições alimentares e se as avaliações
                  eram recentes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Como Funciona a Super Nota (HU06) */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136]">
                Transparência para quem escolhe onde comer
              </span>
              <h2 className="font-heading font-black text-2xl text-stone-900">
                Como calculamos a Super Nota CaráFood
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Para evitar distorções de notas antigas ou comentários sem verificação, consolidamos a
            reputação de cada estabelecimento em uma nota clara de 1,0 a 5,0 estrelas:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200">
              <span className="font-heading font-black text-xl text-[#135136] block">50%</span>
              <span className="font-bold text-xs text-stone-900 block mt-0.5">
                Volume & Consistência (Google Maps)
              </span>
              <p className="text-[11px] text-stone-600 mt-1">
                Reflete a experiência cotidiana de moradores e visitantes no salão e na entrega.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200">
              <span className="font-heading font-black text-xl text-[#135136] block">30%</span>
              <span className="font-bold text-xs text-stone-900 block mt-0.5">
                Experiência Gastronômica (TripAdvisor)
              </span>
              <p className="text-[11px] text-stone-600 mt-1">
                Avalia hospitalidade, regularidade da cozinha e custo-benefício nas quatro estações.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="font-heading font-black text-xl text-[#135136] block">20%</span>
              <span className="font-bold text-xs text-emerald-950 block mt-0.5">
                Cédula Caraguá a Gosto (5 Critérios)
              </span>
              <p className="text-[11px] text-stone-700 mt-1">
                Sabor (35%), Apresentação (20%), Originalidade (15%), Atendimento (15%) e Higiene
                (15%).
              </p>
            </div>
          </div>
        </section>

        {/* 3. Missão, Visão e Valores */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#135136]">
              <Sparkles className="w-5 h-5 text-[#135136]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Missão</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Dar visibilidade justa aos estabelecimentos dos 53 bairros de Caraguatatuba com
              cardápios conferidos, preços transparentes e rota direta sem taxas abusivas.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Award className="w-5 h-5 text-[#FFB703]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Visão</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Ser o guia gastronômico de referência do Litoral Norte de São Paulo, aproximando
              consumidores, produtores locais e o festival municipal Caraguá a Gosto.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[#023E8A]">
              <ShieldCheck className="w-5 h-5 text-[#023E8A]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Valores</h3>
            <ul className="text-xs sm:text-sm text-stone-600 space-y-1.5 list-disc list-inside">
              <li>Valorização do produtor e pescador local;</li>
              <li>Preço honesto e avaliações autênticas;</li>
              <li>Respeito à privacidade do consumidor (LGPD);</li>
              <li>Simplicidade e clareza em qualquer tela.</li>
            </ul>
          </div>
        </section>

        {/* 4. Síntese do Projeto & Reflexão de UX */}
        <section className="bg-gradient-to-br from-emerald-900 to-[#135136] text-white rounded-[28px] p-6 sm:p-8 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFB703]">
              <BookOpen className="w-5 h-5 text-[#FFB703]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                Engenharia de Software Aplicada • APS II
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
                Do Problema de Negócio à Experiência do Usuário
              </h2>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-4 border border-white/15 space-y-2.5 text-xs sm:text-sm text-emerald-50">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Descoberta sem fricção:</strong> organizamos os 53
                bairros em macro-regiões (Norte, Centro e Sul) e filtros alimentares claros (Vegano,
                Vegetariano, Sem Glúten, Sem Lactose) para que o usuário decida onde comer em poucos
                segundos.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Conexão direta com o comércio local:</strong> cada
                prato exibe sua composição de nota, histórico recente de preço e botões diretos para
                Google Maps e WhatsApp do restaurante.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Identificação da Equipe e Orientação */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#135136]/10 flex items-center justify-center text-[#135136]">
              <GraduationCap className="w-5 h-5 text-[#135136]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136]">
                Créditos Acadêmicos
              </span>
              <h2 className="font-heading font-black text-2xl text-stone-900">
                Centro Universitário Módulo
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-stone-400 font-bold block text-[10px] uppercase">
                Arquitetura & Full-Stack
              </span>
              <span className="font-heading font-black text-stone-900 text-sm block">
                Gabriel Rodrigues
              </span>
              <span className="text-stone-500 block text-[11px]">
                Produto, API & Assistente Local
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-stone-400 font-bold block text-[10px] uppercase">
                Back-End & Dados
              </span>
              <span className="font-heading font-black text-stone-900 text-sm block">
                Matheus Vicente
              </span>
              <span className="text-stone-500 block text-[11px]">
                Banco de Dados & Catálogo dos 53 Bairros
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <span className="text-stone-400 font-bold block text-[10px] uppercase">
                Front-End & Experiência do Usuário
              </span>
              <span className="font-heading font-black text-stone-900 text-sm block">
                Pedro Simone
              </span>
              <span className="text-stone-500 block text-[11px]">
                Design de Interface & Validação
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-2 text-xs text-stone-700">
            <div>
              <span className="text-stone-500 font-bold block text-[10px] uppercase">
                Professor Orientador
              </span>
              <span className="font-heading font-black text-[#135136] text-sm">
                Prof. Me. Cristiano S. Negrão
              </span>
              <span className="text-stone-500 block text-[11px]">
                Análise e Projeto de Sistemas II • Análise e Desenvolvimento de Sistemas
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#135136] text-white font-bold text-[10px]">
              Caraguatatuba • SP
            </span>
          </div>
        </section>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Compass className="w-4 h-4 text-[#FFB703]" />
            <span>Explorar Cardápios de Caraguá</span>
          </Link>

          <Link
            href="/contato"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 font-bold text-sm border-2 border-stone-300 shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <span>Credenciar Restaurante / Falar Conosco</span>
            <ArrowRight className="w-4 h-4 text-[#135136]" />
          </Link>
        </div>
      </main>

      <footer className="mt-12 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          CaráFood • Guia Gastronômico dos 53 Bairros de Caraguatatuba • Centro Universitário Módulo.
        </p>
      </footer>
    </div>
  );
}
