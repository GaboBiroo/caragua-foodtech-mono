'use client';

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
      <div className="border-b border-[#E2D9CC] pb-5">
        <span className="text-[#0D9488] text-xs font-mono uppercase tracking-wider block mb-1">
          Arquitetura de Inteligência Artificial & RAG
        </span>
        <h2 className="text-xl font-bold text-[#18181B] tracking-tight">
          Pipeline RAG de 5 Estágios & Orquestração de LLMs Regionais
        </h2>
        <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
          TCC em ADS • Centro Universitário Módulo (Caraguatatuba/SP). Implementação de Retrieval-Augmented Generation hiperlocal com decaimento temporal.
        </p>
      </div>

      {/* 5 Estágios Visuais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((st) => (
          <div
            key={st.num}
            className="coucou-card p-4 space-y-2 flex flex-col justify-between"
          >
            <div>
              <span className="font-mono text-xs font-bold text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#99F6E4]">
                Estágio {st.num}
              </span>
              <h3 className="font-bold text-xs text-[#18181B] mt-2">
                {st.title}
              </h3>
              <p className="text-[11px] text-[#52525B] mt-1 leading-relaxed">
                {st.desc}
              </p>
            </div>
            <div className="pt-2 border-t border-[#E2D9CC]/70">
              <span className="font-mono text-[10px] text-[#71717A] block">
                {st.tech}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Orquestração Multi-Agente dos Polos Gastronômicos */}
      <div className="coucou-card p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-[#18181B] text-base flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0D9488]" />
            <span>Matriz de Especialistas Regionais (Adapters LoRA por Bairro)</span>
          </h3>
          <p className="text-xs text-[#52525B] mt-1">
            Cada polo gastronômico possui um adapter de linguagem calibrado para sua vocação culinária.
          </p>
        </div>

        {/* Pílulas de Bairros */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NEIGHBORHOODS.filter(n => n.id !== 'todos').map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedPolo(n.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedPolo === n.id
                  ? 'bg-[#0B2B26] text-[#F6F2EB]'
                  : 'bg-white text-[#52525B] border border-[#E2D9CC] hover:text-[#18181B]'
              }`}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Detalhes do Especialista Selecionado */}
        <div className="p-5 rounded-2xl bg-[#EDE6DC]/60 border border-[#E2D9CC] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#0D9488]">
              {currentPoloObj.llmName}
            </span>
            <span className="text-[11px] font-mono text-[#71717A]">
              Especialidade: {currentPoloObj.llmSpecialty}
            </span>
          </div>
          <p className="text-xs text-[#18181B]">
            {currentPoloObj.tagline}
          </p>
          <div className="p-3 rounded-xl bg-white font-mono text-[11px] text-[#52525B] border border-[#E2D9CC]">
            System Prompt Context: &quot;Você é o concierge hiperlocal do polo {currentPoloObj.name}. Priorize ingredientes da estação, barcos de pesca locais de Caraguá e respeite 100% dos filtros de Food Safety.&quot;
          </div>
        </div>
      </div>
    </div>
  );
};
