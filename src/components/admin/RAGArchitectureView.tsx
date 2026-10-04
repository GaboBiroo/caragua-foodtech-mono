import React, { useState } from 'react';
import { Brain, Cpu, Database, Network, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { NEIGHBORHOODS } from '../../data/caraguaData';

export const RAGArchitectureView: React.FC = () => {
  const [selectedPolo, setSelectedPolo] = useState(NEIGHBORHOODS[1].id);

  const stages = [
    {
      num: '01',
      title: 'Ingestão Multicanal & Scraper',
      desc: 'Varredura noturna (03:00) capturando resenhas de Google Maps, iFood, 99Food e submissões locais com hash criptográfico.',
      tech: 'FastAPI + BeautifulSoup + Celery'
    },
    {
      num: '02',
      title: 'Embeddings & Chunking Hiperlocal',
      desc: 'Vetorização contextual com chunking semântico focado em pratos típicos (Azul-Marinho, Badejo, Tainha, Camarão).',
      tech: 'Text-Embedding-3-Small / BGE'
    },
    {
      num: '03',
      title: 'Reranker Geodésico & Decaimento',
      desc: 'Ponderação com meia-vida de 30 dias (λ = ln(2)/30) e proximidade geodésica do usuário na orla de Caraguatatuba.',
      tech: 'PostGIS + Half-Life Math Equation'
    },
    {
      num: '04',
      title: 'Orquestrador LLM Manager ⇄ LLMs Regionais',
      desc: 'O modelo mestre despacha a consulta para a LLM especialista daquele bairro específico de Caraguá.',
      tech: 'Llama-3-70b Manager + Adapters LoRA'
    },
    {
      num: '05',
      title: 'Guardrail de Food Safety & Síntese',
      desc: 'Validador estrito de alérgenos (celíacos, veganos, frutos do mar) antes da entrega da resposta final com citação.',
      tech: 'NeMo Guardrails + JSON Strict Schema'
    }
  ];

  const currentPoloObj = NEIGHBORHOODS.find(n => n.id === selectedPolo) || NEIGHBORHOODS[0];

  return (
    <div className="space-y-8">
      <div className="border-b border-white/[0.08] pb-5">
        <span className="text-teal-400 text-xs font-mono uppercase tracking-wider block mb-1">
          Arquitetura de Inteligência Artificial & RAG
        </span>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Pipeline RAG de 5 Estágios & Orquestração de LLMs Regionais
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          TCC em ADS • Centro Universitário Módulo (Caraguatatuba/SP). Implementação de Retrieval-Augmented Generation hiperlocal com decaimento temporal.
        </p>
      </div>

      {/* 5 Estágios Visuais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((st) => (
          <div
            key={st.num}
            className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] flex flex-col justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-teal-400 block mb-2">
                ESTÁGIO {st.num}
              </span>
              <h4 className="font-semibold text-white text-xs mb-1.5 leading-snug">
                {st.title}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {st.desc}
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.05] block">
              {st.tech}
            </span>
          </div>
        ))}
      </div>

      {/* Simulador do Orquestrador de LLMs Regionais */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              Simulador de Despacho: LLM Manager ➔ LLM Regional
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Selecione o polo geográfico para visualizar o contexto ativado no RAG.
            </p>
          </div>
        </div>

        {/* Bairros */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NEIGHBORHOODS.slice(1).map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedPolo(n.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedPolo === n.id
                  ? 'bg-teal-500/20 border border-teal-400/40 text-teal-200'
                  : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Painel do Modelo Ativo */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-zinc-400">Modelo Especialista Ativado:</span>
            <span className="text-teal-300 font-bold">{currentPoloObj.llmName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-zinc-400">Especialidade Gastronômica:</span>
            <span className="text-zinc-200">{currentPoloObj.llmSpecialty}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Temperatura de Amostragem:</span>
            <span className="text-amber-300">0.2 (Rigor Factual & Food Safety)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
