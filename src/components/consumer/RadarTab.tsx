import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Activity, ShieldCheck, Zap, 
  Sparkles, Award, ArrowUpRight, BarChart3, Clock, AlertCircle 
} from 'lucide-react';
import { INITIAL_RESTAURANTS, RADAR_ALERTS, RestaurantItem } from '../../data/caraguaData';

interface RadarTabProps {
  onSelectRestaurantForReview: (restaurant: RestaurantItem) => void;
}

export const RadarTab: React.FC<RadarTabProps> = ({
  onSelectRestaurantForReview,
}) => {
  // Ordena restaurantes pela Super Nota de 30 dias
  const topRanked = [...INITIAL_RESTAURANTS].sort(
    (a, b) => b.decayedRatingAverage - a.decayedRatingAverage
  );

  return (
    <div className="space-y-8">
      {/* Banner Superior com Estatísticas de Integridade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Avaliações Monitoradas</span>
          </div>
          <div className="font-mono text-2xl font-bold text-white tracking-tight">
            1.420
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Google Maps + iFood + App (Caraguá)
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Detector Anti-Fraude</span>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-300 tracking-tight">
            38 Bots Expurgados
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Filtro Z-Score & Isolamento de IP
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Decaimento Temporal</span>
          </div>
          <div className="font-mono text-2xl font-bold text-amber-300 tracking-tight">
            λ = 30 Dias (Meia-Vida)
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            Ponderação Exponencial Recente
          </p>
        </div>
      </div>

      {/* Gráfico SVG de Curva Suave: Histórico 6 Meses vs Super Nota 30d */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_20px_40px_-15px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/[0.08] gap-2">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              Evolução Comparativa: Nota Bruta vs Super Nota de 30 Dias
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              A curva verde demonstra como o algoritmo de decaimento capta com precisão melhorias recentes na cozinha, enquanto a nota tradicional (linha cinza) demora meses para responder.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-teal-400" />
              <span className="text-zinc-300">Super Nota (30d)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-zinc-600" />
              <span className="text-zinc-500">Média Bruta Histórica</span>
            </div>
          </div>
        </div>

        {/* Gráfico SVG Interativo */}
        <div className="pt-6">
          <div className="relative w-full h-48 md:h-56">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

              {/* Rótulos do Eixo Y */}
              <text x="25" y="34" fill="#71717A" fontSize="10" fontFamily="monospace" textAnchor="end">5.0</text>
              <text x="25" y="84" fill="#71717A" fontSize="10" fontFamily="monospace" textAnchor="end">4.8</text>
              <text x="25" y="134" fill="#71717A" fontSize="10" fontFamily="monospace" textAnchor="end">4.5</text>
              <text x="25" y="184" fill="#71717A" fontSize="10" fontFamily="monospace" textAnchor="end">4.0</text>

              {/* Área preenchida sob a curva verde */}
              <path
                d="M 50 140 C 150 130, 250 100, 350 70 C 450 45, 520 38, 570 34 L 570 180 L 50 180 Z"
                fill="url(#curveGradient)"
              />

              {/* Linha Cinza (Média Tradicional Bruta sem decaimento) */}
              <path
                d="M 50 140 C 150 138, 250 135, 350 130 C 450 125, 520 120, 570 115"
                fill="none"
                stroke="#52525B"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Linha Verde Teal (Super Nota com Decaimento Temporal Exponencial) */}
              <path
                d="M 50 140 C 150 130, 250 100, 350 70 C 450 45, 520 38, 570 34"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Pontos de Destaque na Curva */}
              {[
                { cx: 50, cy: 140, label: 'Mês -5' },
                { cx: 180, cy: 120, label: 'Mês -4' },
                { cx: 300, cy: 88, label: 'Mês -3' },
                { cx: 420, cy: 52, label: 'Mês -2' },
                { cx: 570, cy: 34, label: 'Hoje (4.94)' },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#14B8A6" stroke="#07090E" strokeWidth="2" />
                  <text x={pt.cx} y="195" fill="#A1A1AA" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Seção Radar de Novidades (Scraper da Madrugada) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Radar de Novidades & Alertas em Tempo Real
          </h3>
          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08]">
            Última varredura: 03:00 AM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RADAR_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-3xl bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-teal-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {alert.neighborhood}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px]">{alert.timestamp}</span>
                </div>

                <h4 className="font-semibold text-white text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{alert.description}</p>
              </div>

              {alert.impactScore && (
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Impacto Mensurado:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {alert.impactScore}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard dos Top Restaurantes da Cidade */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-xl">
        <h3 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Ranking Oficial de Caraguatatuba (Super Nota 30d)
        </h3>

        <div className="space-y-3">
          {topRanked.map((rest, index) => (
            <div
              key={rest.id}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] flex items-center justify-between gap-4 transition"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  index === 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : index === 1
                    ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                    : index === 2
                    ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                    : 'bg-white/[0.05] text-zinc-400'
                }`}>
                  #{index + 1}
                </span>

                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-sm truncate">{rest.name}</h4>
                  <p className="text-xs text-zinc-400 truncate">
                    {rest.neighborhood} • {rest.totalReviews} avaliações auditadas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-base font-bold text-teal-300">
                    {rest.decayedRatingAverage.toFixed(2)} ★
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    Bruta: {rest.ratingAverage.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectRestaurantForReview(rest)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Avaliar</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
