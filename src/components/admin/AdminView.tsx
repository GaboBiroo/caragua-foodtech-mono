import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, BarChart2, Database } from 'lucide-react';
import { INITIAL_RESTAURANTS, RADAR_ALERTS } from '../../data/caraguaData';

export const AdminView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="border-b border-white/[0.08] pb-5">
        <span className="text-teal-400 text-xs font-mono uppercase tracking-wider block mb-1">
          Backoffice & Auditoria Algorítmica
        </span>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Painel de Moderação & Controle de Qualidade
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Monitoramento em tempo real do pipeline de ingestão do Google Maps, iFood e proteção contra avaliações fraudulentas.
        </p>
      </div>

      {/* Métricas do Scraper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <span className="text-xs text-zinc-400 block mb-1">Status do Scraper 03:00</span>
          <span className="font-mono text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Sincronizado
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <span className="text-xs text-zinc-400 block mb-1">Restaurantes Auditados</span>
          <span className="font-mono text-lg font-bold text-white">
            {INITIAL_RESTAURANTS.length} Ativos
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <span className="text-xs text-zinc-400 block mb-1">Taxa de Fraude Expurgada</span>
          <span className="font-mono text-lg font-bold text-amber-400">
            2.6% Bloqueadas
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <span className="text-xs text-zinc-400 block mb-1">Conformidade Food Safety</span>
          <span className="font-mono text-lg font-bold text-teal-400">
            98.5% Aprovado
          </span>
        </div>
      </div>

      {/* Tabela de Restaurantes & Super Notas */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Auditoria de Estabelecimentos por Bairro
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead>
              <tr className="border-b border-white/[0.08] text-zinc-500 font-mono">
                <th className="pb-3 font-medium">Restaurante</th>
                <th className="pb-3 font-medium">Bairro</th>
                <th className="pb-3 font-medium">Média Bruta</th>
                <th className="pb-3 font-medium">Super Nota (30d)</th>
                <th className="pb-3 font-medium">Reviews</th>
                <th className="pb-3 font-medium">Food Safety</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {INITIAL_RESTAURANTS.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-white">{r.name}</td>
                  <td className="py-3 text-zinc-400">{r.neighborhood}</td>
                  <td className="py-3 font-mono">{r.ratingAverage.toFixed(2)} ★</td>
                  <td className="py-3 font-mono text-teal-300 font-bold">{r.decayedRatingAverage.toFixed(2)} ★</td>
                  <td className="py-3 font-mono">{r.totalReviews}</td>
                  <td className="py-3 font-mono text-emerald-400">{r.foodSafetyScore}%</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
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
};
