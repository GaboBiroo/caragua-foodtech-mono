import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, PenSquare, ShieldCheck, CheckCircle2, 
  Coins, Sparkles, AlertCircle, ArrowRight, Lock 
} from 'lucide-react';
import { INITIAL_RESTAURANTS, RestaurantItem } from '../../data/caraguaData';

interface ReviewTabProps {
  selectedRestaurant: RestaurantItem | null;
  onClearSelectedRestaurant: () => void;
  onSubmitReview: (
    restaurantId: string,
    scores: { quality: number; service: number; costBenefit: number },
    comment: string
  ) => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  selectedRestaurant,
  onClearSelectedRestaurant,
  onSubmitReview,
}) => {
  const [chosenRestId, setChosenRestId] = useState<string>(
    selectedRestaurant ? selectedRestaurant.id : INITIAL_RESTAURANTS[0].id
  );
  const [qualityScore, setQualityScore] = useState<number>(5);
  const [serviceScore, setServiceScore] = useState<number>(5);
  const [costBenefitScore, setCostBenefitScore] = useState<number>(4);
  const [critiqueText, setCritiqueText] = useState<string>('');
  const [declaredLocal, setDeclaredLocal] = useState<boolean>(true);
  const [isSuccessToast, setIsSuccessToast] = useState<boolean>(false);

  // Média ponderada calculada na hora
  const overallScore = ((qualityScore * 0.45) + (serviceScore * 0.3) + (costBenefitScore * 0.25)).toFixed(2);

  // Hash anônimo LGPD simulado
  const anonHash = `sha256:7f9a${(qualityScore * 13 + serviceScore * 7).toString(16)}...${Date.now().toString(16).slice(-4)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!critiqueText.trim()) return;

    onSubmitReview(
      chosenRestId,
      { quality: qualityScore, service: serviceScore, costBenefit: costBenefitScore },
      critiqueText
    );

    setIsSuccessToast(true);
    setCritiqueText('');

    setTimeout(() => {
      setIsSuccessToast(false);
      onClearSelectedRestaurant();
    }, 3500);
  };

  const currentRest = INITIAL_RESTAURANTS.find(r => r.id === chosenRestId) || INITIAL_RESTAURANTS[0];

  return (
    <div className="space-y-8">
      {/* Toast de Sucesso Apple Liquid Glass */}
      <AnimatePresence>
        {isSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-5 rounded-3xl bg-emerald-950/80 border border-emerald-400/40 backdrop-blur-3xl shadow-2xl text-white flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-200 text-sm">Avaliação Auditada e Registrada!</h4>
                <p className="text-xs text-emerald-300/80">
                  A Super Nota de {currentRest.name} foi recalculada e você ganhou <strong>+50 Créditos Nitro</strong>!
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 font-mono text-xs text-emerald-300 font-bold shrink-0">
              +50 CR
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário Principal em Liquid Glass */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_20px_40px_-15px_rgba(0,0,0,0.6)] space-y-6"
      >
        <div className="border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Ações Decisivas da Comunidade</span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Avaliar Restaurante com Garantia de Auditoria
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Sua opinião tem peso matemático real na equação de decaimento temporal e combate fraudes de avaliações compradas.
          </p>
        </div>

        {/* Seletor de Restaurante */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Selecione o Estabelecimento:
          </label>
          <select
            value={chosenRestId}
            onChange={(e) => setChosenRestId(e.target.value)}
            className="w-full bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.12] focus:border-teal-400/60 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition"
          >
            {INITIAL_RESTAURANTS.map((r) => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.name} — {r.neighborhood} (Super Nota: {r.decayedRatingAverage.toFixed(2)} ★)
              </option>
            ))}
          </select>
        </div>

        {/* 3 Critérios de Avaliação com Sliders Visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Critério 1: Qualidade do Prato */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Qualidade do Prato</span>
              <span className="font-mono text-teal-400 font-bold">{qualityScore}.0 ★</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={qualityScore}
              onChange={(e) => setQualityScore(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 block">Sabor, frescor e temperatura</span>
          </div>

          {/* Critério 2: Atendimento & Rapidez */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Atendimento & Rapidez</span>
              <span className="font-mono text-teal-400 font-bold">{serviceScore}.0 ★</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={serviceScore}
              onChange={(e) => setServiceScore(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 block">Cortesia e tempo de espera</span>
          </div>

          {/* Critério 3: Custo-Benefício & Ambiente */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Custo-Benefício</span>
              <span className="font-mono text-teal-400 font-bold">{costBenefitScore}.0 ★</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={costBenefitScore}
              onChange={(e) => setCostBenefitScore(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <span className="text-[10px] text-zinc-500 block">Preço justo e higiene</span>
          </div>
        </div>

        {/* Resumo da Nota Calculada */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-zinc-300">Nota Ponderada Calculada:</span>
          <div className="flex items-center gap-1.5 font-mono text-lg font-bold text-teal-300">
            <span>{overallScore}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        {/* Crítica Detalhada */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Crítica Detalhada (Mínimo de contexto caiçara):
          </label>
          <textarea
            rows={4}
            value={critiqueText}
            onChange={(e) => setCritiqueText(e.target.value)}
            placeholder="Descreva o prato degustado, o ponto do peixe ou camarão, o atendimento no local e se recomendaria a outros moradores..."
            className="w-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/[0.12] focus:border-teal-400/60 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition leading-relaxed"
          />
        </div>

        {/* Declaração de LGPD & Food Safety */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <input
            type="checkbox"
            id="declareCheck"
            checked={declaredLocal}
            onChange={(e) => setDeclaredLocal(e.target.checked)}
            className="w-4 h-4 rounded accent-teal-400"
          />
          <label htmlFor="declareCheck" className="text-xs text-zinc-400 cursor-pointer flex-1">
            Confirmo consumo presencial no restaurante. Meus dados pessoais serão protegidos via <strong>Hash Anônimo LGPD</strong> ({anonHash}).
          </label>
          <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
        </div>

        {/* Botão de Envio com Recompensa de Créditos */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Recompensa: +50 Créditos</span>
          </div>

          <button
            type="submit"
            disabled={!critiqueText.trim() || !declaredLocal}
            className="px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 transition active:scale-98"
          >
            <span>Publicar Avaliação Auditada</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
