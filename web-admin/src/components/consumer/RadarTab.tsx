'use client';

import React from 'react';
import { RestaurantItem, SCRAPER_RADAR_ALERTS } from '@/data/caraguaData';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, Star, Sparkles } from 'lucide-react';

interface RadarTabProps {
  restaurants: RestaurantItem[];
  onSelectRestaurant: (restaurantId: string) => void;
}

export function RadarTab({ restaurants, onSelectRestaurant }: RadarTabProps) {
  // Ordena por Super Nota (decaimento)
  const ranked = [...restaurants].sort((a, b) => b.decayedRatingAverage - a.decayedRatingAverage);

  return (
    <div className="space-y-6 px-3 pt-2 pb-20">
      {/* Banner Explicativo de Decaimento */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          <h3 className="font-bold text-white text-sm">Super Nota com Decaimento Temporal (30d)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Nosso algoritmo expurga avaliações antigas (meia-vida de 30 dias: λ = ln(2)/30). 
          Assim, estabelecimentos que melhoraram recentemente sobem de nota, e estabelecimentos que caíram de padrão perdem posições!
        </p>

        {/* Mini Gráfico SVG de Decaimento */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Peso da Avaliação ao Longo do Tempo</span>
            <span className="text-sky-400 font-mono">f(t) = exp(-λ • Δt)</span>
          </div>
          <svg viewBox="0 0 300 60" className="w-full h-12 overflow-visible">
            {/* Eixos */}
            <line x1="10" y1="50" x2="290" y2="50" stroke="#334155" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="10" y2="50" stroke="#334155" strokeWidth="1.5" />
            {/* Curva de Decaimento */}
            <path
              d="M 10 12 Q 90 28, 150 40 T 290 49"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
            />
            {/* Pontos chave */}
            <circle cx="10" cy="12" r="4" fill="#38bdf8" />
            <text x="14" y="24" fill="#38bdf8" fontSize="9" fontWeight="bold">Hoje (100%)</text>
            <circle cx="150" cy="40" r="4" fill="#f59e0b" />
            <text x="145" y="32" fill="#f59e0b" fontSize="9" fontWeight="bold">30 dias (50%)</text>
            <circle cx="290" cy="49" r="4" fill="#ef4444" />
            <text x="235" y="44" fill="#94a3b8" fontSize="9">60 dias (25%)</text>
          </svg>
        </div>
      </div>

      {/* Tabela Comparativa de Rankings */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm px-1 flex items-center justify-between">
          <span>Ranking Auditado de Caraguá</span>
          <span className="text-xs text-sky-400 font-normal">Super Nota vs Nota Bruta</span>
        </h3>

        {ranked.map((r, idx) => {
          const diff = (r.decayedRatingAverage - r.ratingAverage).toFixed(2);
          const isHigher = Number(diff) >= 0;
          return (
            <div
              key={r.id}
              onClick={() => onSelectRestaurant(r.id)}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                  idx === 0 ? 'bg-amber-500 text-slate-950 font-black' :
                  idx === 1 ? 'bg-slate-300 text-slate-950 font-black' :
                  idx === 2 ? 'bg-amber-700 text-white font-black' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {idx + 1}º
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">{r.name}</h4>
                  <span className="text-xs text-slate-400">{r.neighborhood}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    {r.decayedRatingAverage}★
                  </span>
                  <span className={`text-[11px] font-bold ${isHigher ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({isHigher ? `+${diff}` : diff})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Média bruta: {r.ratingAverage}★</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar de Novidades da Madrugada (Scraper) */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-white text-sm px-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-400" />
          Radar de Novidades da Madrugada (Playwright + LGPD)
        </h3>

        <div className="space-y-2.5">
          {SCRAPER_RADAR_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {alert.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
              </div>
              <p className="text-slate-300">{alert.detail}</p>
              <span className="inline-block text-[10px] text-slate-500 font-mono">
                Fonte: {alert.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
