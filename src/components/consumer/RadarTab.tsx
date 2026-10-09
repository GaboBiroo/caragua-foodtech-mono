'use client';

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
        <div className="coucou-card p-5">
          <div className="flex items-center gap-2 text-xs text-[#52525B] mb-2 font-medium">
            <Activity className="w-4 h-4 text-[#0D9488]" />
            <span>Avaliações Monitoradas</span>
          </div>
          <div className="font-mono text-2xl font-bold text-[#18181B] tracking-tight">
            1.420
          </div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">
            Google Maps + iFood + App (Caraguá)
          </p>
        </div>

        <div className="coucou-card p-5">
          <div className="flex items-center gap-2 text-xs text-[#52525B] mb-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Detector Anti-Fraude</span>
          </div>
          <div className="font-mono text-2xl font-bold text-[#059669] tracking-tight">
            38 Bots Expurgados
          </div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">
            Filtro Z-Score & Isolamento de IP
          </p>
        </div>

        <div className="coucou-card p-5">
          <div className="flex items-center gap-2 text-xs text-[#52525B] mb-2 font-medium">
            <Zap className="w-4 h-4 text-[#D97706]" />
            <span>Decaimento Temporal</span>
          </div>
          <div className="font-mono text-2xl font-bold text-[#D97706] tracking-tight">
            λ = 30 Dias (Meia-Vida)
          </div>
          <p className="text-[11px] text-[#71717A] mt-1 font-mono">
            Ponderação Exponencial Recente
          </p>
        </div>
      </div>

      {/* Explicação da Fórmula da Super Nota */}
      <div className="coucou-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#18181B] text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0D9488]" />
            <span>Fórmula Matemática da Super Nota (TCC Módulo ADS)</span>
          </h3>
          <span className="text-[11px] font-mono bg-[#F0FDFA] text-[#0D9488] px-2.5 py-1 rounded-full border border-[#99F6E4]">
            Algoritmo Proprietário
          </span>
        </div>
        <p className="text-xs text-[#52525B] leading-relaxed">
          Para evitar que restaurantes tradicionais fiquem no topo com avaliações antigas desatualizadas, aplicamos decaimento temporal exponencial com meia-vida de 30 dias.
        </p>
        <div className="p-3.5 rounded-2xl bg-[#EDE6DC] font-mono text-xs text-[#18181B] space-y-1">
          <p className="font-bold text-[#0B2B26]">
            SuperNota = (MédiaHistórica × 0.85) + (AvaliaçãoRecente × 0.15)
          </p>
          <p className="text-[11px] text-[#71717A]">
            Onde pesos de critérios: Qualidade (45%), Atendimento (30%), Custo-Benefício (25%).
          </p>
        </div>
      </div>

      {/* Tabela de Rankings Auditados */}
      <div className="coucou-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#18181B] text-base">
            Ranking Geral de Caraguatatuba (Auditado)
          </h3>
          <span className="text-xs text-[#71717A] font-mono">Atualizado hoje</span>
        </div>

        <div className="space-y-3">
          {topRanked.map((restaurant, idx) => (
            <div
              key={restaurant.id}
              className="p-4 rounded-2xl bg-[#EDE6DC]/40 hover:bg-[#EDE6DC] border border-[#E2D9CC] flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                  idx === 0 
                    ? 'bg-[#0B2B26] text-white shadow-sm' 
                    : idx === 1 
                    ? 'bg-[#0D9488] text-white' 
                    : idx === 2 
                    ? 'bg-[#E2D9CC] text-[#18181B]' 
                    : 'bg-white text-[#71717A] border border-[#E2D9CC]'
                }`}>
                  #{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#18181B]">
                    {restaurant.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#52525B]">
                    <span>{restaurant.neighborhood}</span>
                    <span>•</span>
                    <span>{restaurant.totalReviews} avaliações</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono font-bold text-base text-[#18181B]">
                    {restaurant.decayedRatingAverage.toFixed(2)} ★
                  </div>
                  <span className="text-[10px] text-[#71717A] font-mono block">
                    Super Nota
                  </span>
                </div>
                <button
                  onClick={() => onSelectRestaurantForReview(restaurant)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0B2B26] text-[#F6F2EB] hover:bg-[#134E4A] transition-colors"
                >
                  Avaliar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
