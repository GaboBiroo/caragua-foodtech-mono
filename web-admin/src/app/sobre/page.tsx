'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, Award, ShieldCheck, Heart, Users, MapPin, 
  Sparkles, GraduationCap, ChevronRight, CheckCircle2,
  Fish, Anchor, BookOpen, ExternalLink, ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

export default function SobreNosPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      {/* NAVBAR GLOBAL INTEGRADA */}
      <Navbar />

      {/* HERO SECTION INSTITUCIONAL */}
      <header className="relative bg-[#135136] text-white pt-16 pb-20 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB703_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Entrega S04 • Análise e Projeto de Sistemas II</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            Nossa Missão: Conectar o Comensal à Alma Caiçara de <span className="text-[#FFB703]">Caraguatatuba</span>
          </h1>

          <p className="text-base sm:lg text-emerald-100 font-medium max-w-2xl leading-relaxed">
            O Caraguá FoodTech nasceu como Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas no Centro Universitário Módulo, sob a orientação do Prof. Cristiano S. Negrão.
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL EM CONTAINER ACADÊMICO E MERCADOLÓGICO */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* 1. O CONTEXTO DO NEGÓCIO REAL: CARAGUATATUBA E A GASTRONOMIA CAIÇARA */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#135136]/10 flex items-center justify-center text-[#135136]">
              <Anchor className="w-5 h-5 text-[#135136]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136]">
                Contexto Regional & Hiperlocal
              </span>
              <h2 className="font-heading font-black text-2xl text-stone-900">
                O Negócio Real: A Força da Costa Norte Paulista
              </h2>
            </div>
          </div>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              O município de <strong>Caraguatatuba</strong> abriga mais de 134 mil habitantes e uma das mais ricas heranças culinárias do litoral paulista. Dos <strong>53 bairros oficiais</strong> que compõem o território municipal, a dinâmica gastronômica estende-se desde as mariculturas de cultivo <em>longline</em> na <strong>Fazenda Marinha da Cocanha (AMAPEC)</strong> e o desembarque pesqueiro na <strong>Colônia de Pescadores Z-8 do Camaroeiro</strong>, até os quiosques pé na areia de Martim de Sá e as tradicionais panelas de ferro que cozinham o secular <strong>Azul-Marinho</strong> com banana nanica verde.
            </p>
            <p>
              Entretanto, os pequenos estabelecimentos gastronômicos locais — como quiosques familiares, trapiches e botecos dos bairros periféricos (Tinga, Pegorelli, Barranco Alto, Perequê-Mirim) — enfrentam dois graves obstáculos estruturais:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <h4 className="font-black text-xs text-amber-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Dependência e Sazonalidade Extrema
                </h4>
                <p className="text-xs text-stone-700 leading-normal">
                  Grandes plataformas comerciais impõem taxas de 27% a 30% sobre os pequenos empresários e concentram os pedidos exclusivamente na orla turística, negligenciando 85% do território municipal.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                <h4 className="font-black text-xs text-rose-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Opacidade e Avaliações Falsas
                </h4>
                <p className="text-xs text-stone-700 leading-normal">
                  Sistemas legados de recomendação carecem de auditoria por critérios técnicos, permitindo a proliferação de <em>fake reviews</em> e distorcendo as escolhas de turistas e moradores locais.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MISSÃO, VISÃO E VALORES */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#135136]">
              <Sparkles className="w-5 h-5 text-[#135136]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Missão</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Democratizar a visibilidade e o faturamento da gastronomia caiçara em todos os 53 bairros de Caraguatatuba através de tecnologia aberta, curadoria auditada e inteligência hiperlocal.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Award className="w-5 h-5 text-[#FFB703]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Visão</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Consolidar-se como o ecossistema oficial de referência gastronômica e turística do Litoral Norte de São Paulo, integrando festivais municipais (Caraguá a Gosto) com inteligência artificial auditada.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-[#023E8A]">
              <ShieldCheck className="w-5 h-5 text-[#023E8A]" />
            </div>
            <h3 className="font-heading font-black text-lg text-stone-900">Valores</h3>
            <ul className="text-xs sm:text-sm text-stone-600 space-y-1.5 list-disc list-inside">
              <li>Valorização do produtor e maricultor local;</li>
              <li>Transparência estatística e anti-fraude;</li>
              <li>Preservação do patrimônio caiçara imaterial;</li>
              <li>Acessibilidade digital WCAG 2.2 AAA.</li>
            </ul>
          </div>
        </section>

        {/* 3. CONEXÃO COM O RELATÓRIO TÉCNICO (SEÇÕES 1.1 E 1.2) */}
        <section className="bg-gradient-to-br from-emerald-900 to-[#135136] text-white rounded-[28px] p-6 sm:p-8 shadow-lg space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFB703]">
              <BookOpen className="w-5 h-5 text-[#FFB703]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                Alinhamento Pedagógico TCC • Prof. Cristiano S. Negrão
              </span>
              <h2 className="font-heading font-black text-2xl text-white">
                Conexão Direta com o Relatório da Disciplina
              </h2>
            </div>
          </div>

          <div className="text-emerald-100 text-xs sm:text-sm leading-relaxed space-y-3">
            <p>
              Esta página e toda a arquitetura de software implementada correspondem rigorosamente aos objetivos delimitados nas <strong>Seções 1.1 e 1.2 do Relatório de Análise e Projeto de Sistemas II</strong>:
            </p>
            <div className="bg-black/25 rounded-2xl p-4 border border-white/15 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Seção 1.1 (Contexto & Problema):</strong> Demonstração empírica da fragmentação dos dados gastronômicos em Caraguatatuba e da necessidade de um catálogo centralizado com geolocalização dos 53 bairros.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Seção 1.2 (Justificativa & Objetivos):</strong> Desenvolvimento de um pipeline de software resiliente, com scoring ponderado de 5 critérios inspirado na cédula do Festival Caraguá a Gosto e auditoria com decaimento temporal de notas.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REFLEXÃO PEDAGÓGICA DE UX SOLICITADA PELO PROFESSOR (5 A 8 LINHAS) */}
        <section className="bg-amber-50/70 border border-amber-200/90 rounded-[28px] p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">💡</span>
            <h3 className="font-heading font-black text-lg text-amber-950">
              Reflexão de UX: Do Relatório Teórico à Aplicação em Produção
            </h3>
          </div>
          <blockquote className="text-xs sm:text-sm text-stone-800 leading-relaxed italic border-l-4 border-[#FFB703] pl-4 py-1">
            &ldquo;Ao traduzir a tese acadêmica para uma interface real em Next.js, compreendemos que a teoria de UX não reside em meros enfeites visuais, mas na redução drástica da carga cognitiva do usuário. O maior desafio residiu em converter fórmulas complexas de anti-fraude e decaimento temporal em elementos visuais intuitivos — como a Cédula Oficial do festival e a Dynamic Island do Chef Jacquin. Descobrimos que priorizar os 53 bairros de Caraguatatuba e as fotos reais dos pratos transforma uma listagem fria de banco de dados em uma experiência imersiva de valor social e pertencimento comunitário.&rdquo;
          </blockquote>
          <span className="text-[11px] font-bold text-amber-900 block text-right">
            — Gabriel Rodrigues (Desenvolvedor & Aluno ADS)
          </span>
        </section>

        {/* 5. IDENTIFICAÇÃO DA EQUIPE E DO PROJETO */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#135136]/10 flex items-center justify-center text-[#135136]">
              <GraduationCap className="w-5 h-5 text-[#135136]" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#135136]">
                Ficha Técnica do Projeto
              </span>
              <h2 className="font-heading font-black text-2xl text-stone-900">
                Centro Universitário Módulo
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-700">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">Aluno / Desenvolvedor:</span>
              <span className="font-heading font-bold text-stone-900 text-base">Gabriel Rodrigues (@GaboBiroo)</span>
              <span className="text-stone-500 block text-xs">Curso: Análise e Desenvolvimento de Sistemas (ADS)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <span className="text-stone-500 font-bold block text-[11px] uppercase">Docente Orientador:</span>
              <span className="font-heading font-bold text-stone-900 text-base">Prof. Cristiano S. Negrão</span>
              <span className="text-stone-500 block text-xs">Disciplina: Análise e Projeto de Sistemas II</span>
            </div>
          </div>
        </section>

        {/* 6. CTAs DE NAVEGAÇÃO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <Compass className="w-4 h-4 text-[#FFB703]" />
            <span>Explorar Feed Gastronômico de Caraguá</span>
          </Link>

          <Link
            href="/contato"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-900 font-bold text-sm border-2 border-stone-300 shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <span>Credenciar Restaurante / Falar Conosco</span>
            <ArrowRight className="w-4 h-4 text-[#135136]" />
          </Link>
        </div>

      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="mt-16 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          Caraguá FoodTech • Desenvolvido com amor caiçara para o TCC ADS do Centro Universitário Módulo.
        </p>
      </footer>
    </div>
  );
}
