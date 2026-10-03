'use client';

import React, { useState } from 'react';
import { Sparkles, Database, MapPin, ShieldCheck, Cpu, Play } from 'lucide-react';

export function RAGArchitectureView() {
  const [testQuery, setTestQuery] = useState('Quero moqueca de peixe fresco sem glúten perto de Martim de Sá');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulate = async () => {
    setIsProcessing(true);
    setOutput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery })
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch {
      setOutput('Erro na simulação do endpoint.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          Pipeline RAG de 5 Estágios & LLMs Regionais de Caraguatatuba
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Arquitetura híbrida determinística prevenindo alucinações e garantindo Food Safety para o TCC.
        </p>
      </div>

      {/* Os 5 Estágios */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          {
            step: "1",
            title: "Extração de Intenção",
            sub: "Pydantic V2",
            desc: "Isola culinária, faixa de preço e restrições (ex: sem glúten)."
          },
          {
            step: "2",
            title: "Enriquecimento",
            sub: "GPS & Contexto",
            desc: "Injeta coordenadas de Caraguá e status de Food Safety."
          },
          {
            step: "3",
            title: "Busca Híbrida",
            sub: "PostGIS + pgvector",
            desc: "Filtro radial Haversine + distância de cosseno (<->)."
          },
          {
            step: "4",
            title: "Ancoragem Factual",
            sub: "Guardrails <context>",
            desc: "Estrutura tags <restaurant> com dados imutáveis auditados."
          },
          {
            step: "5",
            title: "Streaming SSE",
            sub: "Jacquin Caiçara",
            desc: "Geração token a token com persona caiçara e cards ricos."
          }
        ].map((s) => (
          <div
            key={s.step}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative overflow-hidden"
          >
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-500/30">
              {s.step}
            </span>
            <h4 className="font-bold text-white text-xs">{s.title}</h4>
            <span className="text-[10px] text-teal-400 font-mono block">{s.sub}</span>
            <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Console de Teste Interativo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm">Simulador do Pipeline RAG em Produção</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={handleSimulate}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> Executar
          </button>
        </div>

        {output && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold block mb-2">
              Payload JSON da Resposta:
            </span>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
