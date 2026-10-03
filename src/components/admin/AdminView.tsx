'use client';

import React, { useState } from 'react';
import { MetricCard } from '../MetricCard';
import { INITIAL_RESTAURANTS } from '@/data/caraguaData';
import { ShieldCheck, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';

export function AdminView() {
  const [moderationQueue, setModerationQueue] = useState([
    {
      id: "mod-1",
      restaurant: "Quiosque Canto Bravo",
      author: "Robô Spammer",
      text: "COMPREI SEGUIDORES COM DESCONTO NO PIX CHAMA NO WHATS!!!!!",
      rating: 5.0,
      reason: "Alta Entropia + Spam Comercial Detectado (Mackenzie 2024)",
      confidence: 0.98
    },
    {
      id: "mod-2",
      restaurant: "Mar & Terra Gourmet",
      author: "Conta Recém-Criada",
      text: "Pior lugar do mundo comida estragada odeio tudo horrível",
      rating: 1.0,
      reason: "Divergência Extrema sem Histórico / Burst Review",
      confidence: 0.89
    }
  ]);

  const handleApprove = (id: string) => {
    setModerationQueue(prev => prev.filter(q => q.id !== id));
  };

  const handleReject = (id: string) => {
    setModerationQueue(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Restaurantes Mapeados"
          value="48"
          subtitle="5 Polos Oficiais em Caraguá"
          icon="📍"
          badge="PostGIS Ativo"
        />
        <MetricCard
          title="Cardápios Vetorizados"
          value="1.240"
          subtitle="Embeddings 1536d (HNSW)"
          icon="🍲"
          badge="Semântica Ativa"
        />
        <MetricCard
          title="Avaliações Auditadas"
          value="3.890"
          subtitle="Blindagem LGPD Art. 5º e 6º"
          icon="💬"
          badge="100% Anonimizado"
        />
        <MetricCard
          title="Taxa de Fraude Barrada"
          value="7.8%"
          subtitle="Heurística Mackenzie 2024"
          icon="🛡️"
          badge="Expurgado das Médias"
        />
      </div>

      {/* Fila de Moderação */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Fila de Moderação Noturna (Detector Mackenzie)
            </h3>
            <p className="text-xs text-slate-400">
              Reviews sinalizadas por anomalias de texto ou comportamento que foram expurgadas do cálculo da Super Nota.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            {moderationQueue.length} pendentes
          </span>
        </div>

        {moderationQueue.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ✅ Todas as avaliações suspeitas foram moderadas! Fila limpa.
          </div>
        ) : (
          <div className="space-y-3">
            {moderationQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.restaurant}</span>
                    <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {item.reason}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{item.text}"</p>
                  <span className="text-[11px] text-slate-500">
                    Autor: {item.author} • Confiança da IA: {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/40 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <X className="w-4 h-4" /> Rejeitar e Purgar
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/40 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Check className="w-4 h-4" /> Aprovar como Legítima
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabela de Estabelecimentos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-white text-base mb-4">
          Monitoramento dos 5 Polos Gastronômicos de Caraguatatuba
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="p-3">Restaurante</th>
                <th className="p-3">Bairro / Polo</th>
                <th className="p-3">Média Bruta</th>
                <th className="p-3">Super Nota (Decaimento)</th>
                <th className="p-3">Food Safety</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {INITIAL_RESTAURANTS.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-white">{r.name}</td>
                  <td className="p-3">{r.neighborhood}</td>
                  <td className="p-3 text-slate-400">{r.ratingAverage}★</td>
                  <td className="p-3 font-bold text-sky-400">{r.decayedRatingAverage}★</td>
                  <td className="p-3 text-emerald-400 font-semibold">{r.foodSafetyScore}%</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                      Auditado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
