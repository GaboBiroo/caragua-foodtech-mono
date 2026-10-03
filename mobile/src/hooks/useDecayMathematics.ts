import { useMemo } from 'react';

// ==============================================================================
// useDecayMathematics — Lógica Cliente-Side de Decaimento Temporal Exponencial
// Implementação formal baseada na Seção "Dinâmicas Anti-Fraude" (Página 9):
//
// 1. Formulação Discreta: W(t) = alpha * (1 - alpha)^t
// 2. Formulação Contínua: N_t = N_0 * e^(-lambda * t)
//
// Onde a meia-vida (half-life) algorítmica é estritamente de 30 dias (t_half = 30).
// lambda = ln(2) / 30 ~= 0.0231049
// As avaliações dos últimos 30 dias respondem por ~90% da pontuação efetiva.
// ==============================================================================

export const DECAY_HALF_LIFE_DAYS = 30.0;
export const DECAY_LAMBDA = Math.log(2) / DECAY_HALF_LIFE_DAYS; // ~0.0231049

export interface DecayCurvePoint {
  day: number;
  weight: number;
  retentionPercent: number;
}

export function useDecayMathematics(halfLifeDays: number = DECAY_HALF_LIFE_DAYS) {
  const lambda = useMemo(() => Math.log(2) / halfLifeDays, [halfLifeDays]);

  /**
   * Calcula o peso W(t) de uma avaliação com base na sua idade em dias.
   * W(t) = e^(-lambda * delta_t)
   */
  const calculateWeight = (daysAgo: number): number => {
    const d = Math.max(0, daysAgo);
    return Math.exp(-lambda * d);
  };

  /**
   * Calcula a nota efetiva N_t após o decaimento temporal.
   * N_t = N_0 * e^(-lambda * t)
   */
  const calculateEffectiveRating = (originalRating: number, daysAgo: number): number => {
    return originalRating * calculateWeight(daysAgo);
  };

  /**
   * Gera pontos para plotagem do Gráfico de Decaimento Temporal na Screen 3
   * em uma janela de 0 a 90 dias (demonstrando a meia-vida aos 30 dias).
   */
  const generateCurvePoints = (maxDays: number = 90, step: number = 5): DecayCurvePoint[] => {
    const points: DecayCurvePoint[] = [];
    for (let day = 0; day <= maxDays; day += step) {
      const weight = Math.exp(-lambda * day);
      points.push({
        day,
        weight: Number(weight.toFixed(4)),
        retentionPercent: Number((weight * 100).toFixed(1)),
      });
    }
    return points;
  };

  /**
   * Calcula a média ponderada de uma lista de reviews pelo tempo
   */
  const calculateWeightedAverage = (
    reviews: Array<{ rating: number; daysAgo: number }>
  ): { historicalAvg: number; decayedAvg: number; recentImpactRatio: number } => {
    if (!reviews || reviews.length === 0) {
      return { historicalAvg: 0, decayedAvg: 0, recentImpactRatio: 1 };
    }

    let totalRaw = 0;
    let totalWeighted = 0;
    let sumWeights = 0;
    let recentMonthWeight = 0;

    for (const r of reviews) {
      totalRaw += r.rating;
      const w = calculateWeight(r.daysAgo);
      totalWeighted += r.rating * w;
      sumWeights += w;
      if (r.daysAgo <= 30) {
        recentMonthWeight += w;
      }
    }

    const historicalAvg = totalRaw / reviews.length;
    const decayedAvg = sumWeights > 0 ? totalWeighted / sumWeights : historicalAvg;
    const recentImpactRatio = sumWeights > 0 ? recentMonthWeight / sumWeights : 1;

    return {
      historicalAvg: Number(historicalAvg.toFixed(2)),
      decayedAvg: Number(decayedAvg.toFixed(2)),
      recentImpactRatio: Number(recentImpactRatio.toFixed(2)),
    };
  };

  return {
    halfLifeDays,
    lambda,
    calculateWeight,
    calculateEffectiveRating,
    generateCurvePoints,
    calculateWeightedAverage,
  };
}

export default useDecayMathematics;
