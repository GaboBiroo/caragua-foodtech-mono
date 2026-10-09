'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, BarChart2, Database } from 'lucide-react';
import { INITIAL_RESTAURANTS, RADAR_ALERTS } from '../../data/caraguaData';

export const AdminView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="border-b border-[#E2D9CC] pb-5">
        <span className="text-[#0D9488] text-xs font-mono uppercase tracking-wider block mb-1">
          Backoffice & Auditoria Algorítmica
        </span>
        <h2 className="text-xl font-bold text-[#18181B] tracking-tight">
          Painel de Moderação & Controle de Integridade
        </h2>
        <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
          Monitoramento em tempo real do pipeline de ingestão do Google Maps, iFood e proteção contra avaliações fraudulentas em Caraguá.
        </p>
      </div>

      {/* Métricas do Scraper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="coucou-card p-4">
          <span className="text-xs text-[#71717A] block mb-1">Status do Scraper 03:00</span>
          <span className="font-mono text-base font-bold text-[#059669] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 100% Sincronizado
          </span>
        </div>
        <div className="coucou-card p-4">
          <span className="text-xs text-[#71717A] block mb-1">Restaurantes Auditados</span>
          <span className="font-mono text-base font-bold text-[#18181B]">
            {INITIAL_RESTAURANTS.length} Ativos
          </span>
        </div>
        <div className="coucou-card p-4">
          <span className="text-xs text-[#71717A] block mb-1">Taxa de Fraude Expurgada</span>
          <span className="font-mono text-base font-bold text-[#D97706]">
            2.6% Bloqueadas
          </span>
        </div>
        <div className="coucou-card p-4">
          <span className="text-xs text-[#71717A] block mb-1">Conformidade Food Safety</span>
          <span className="font-mono text-base font-bold text-[#0D9488]">
            98.5% Aprovado
          </span>
        </div>
      </div>

      {/* Tabela de Restaurantes & Super Notas */}
      <div className="coucou-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
          Auditoria de Estabelecimentos por Bairro
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#18181B]">
            <thead>
              <tr className="border-b border-[#E2D9CC] text-[#71717A] font-mono">
                <th className="pb-3 font-medium">Restaurante</th>
                <th className="pb-3 font-medium">Bairro</th>
                <th className="pb-3 font-medium">Média Bruta</th>
                <th className="pb-3 font-medium">Super Nota (30d)</th>
                <th className="pb-3 font-medium">Food Safety</th>
                <th className="pb-3 font-medium">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9CC]/60 font-mono">
              {INITIAL_RESTAURANTS.map((r) => (
                <tr key={r.id} className="hover:bg-[#EDE6DC]/40 transition-colors">
                  <td className="py-3 font-sans font-bold text-[#18181B]">{r.name}</td>
                  <td className="py-3 text-[#52525B] font-sans">{r.neighborhood}</td>
                  <td className="py-3 text-[#71717A]">{r.ratingAverage.toFixed(2)} ★</td>
                  <td className="py-3 font-bold text-[#0B2B26]">{r.decayedRatingAverage.toFixed(2)} ★</td>
                  <td className="py-3 text-[#059669] font-bold">{r.foodSafetyScore}%</td>
                  <td className="py-3 text-[11px] text-[#0D9488]">Auditado</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
