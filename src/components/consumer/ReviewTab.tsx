'use client';

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Toast de Sucesso com +50 CR */}
      <AnimatePresence>
        {isSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-xl text-[#065F46] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#059669]" />
              <div>
                <p className="font-bold text-sm">Avaliação Auditada com Sucesso!</p>
                <p className="text-xs text-[#047857]">Você recebeu +50 Créditos Nitro na sua carteira.</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-[#059669] text-white font-mono font-bold text-xs flex items-center gap-1 shadow-sm">
              <Coins className="w-3.5 h-3.5" /> +50 CR
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário Principal */}
      <div className="coucou-card p-6 md:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#18181B] tracking-tight flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-[#0D9488]" />
              <span>Avaliar Estabelecimento</span>
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
              Recompensa: +50 CR
            </span>
          </div>
          <p className="text-xs text-[#52525B] mt-1">
            Sua avaliação ajuda a treinar os 5 estágios do RAG e combate fraudes na gastronomia de Caraguá.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selecionar Restaurante */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] uppercase tracking-wider mb-2">
              Restaurante em Caraguá:
            </label>
            <select
              value={chosenRestId}
              onChange={(e) => setChosenRestId(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-[#18181B] text-sm font-semibold focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all"
            >
              {INITIAL_RESTAURANTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.neighborhood})
                </option>
              ))}
            </select>
          </div>

          {/* Sliders de Avaliação Ponderada */}
          <div className="space-y-5 p-5 rounded-2xl bg-[#EDE6DC]/40 border border-[#E2D9CC]">
            {/* Qualidade Gastronômica (45%) */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#18181B]">Qualidade dos Pratos & Sabor (Peso 45%)</span>
                <span className="font-mono text-[#0D9488]">{qualityScore}.0 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={qualityScore}
                onChange={(e) => setQualityScore(Number(e.target.value))}
                className="w-full accent-[#0D9488] cursor-pointer"
              />
            </div>

            {/* Atendimento & Hospitalidade (30%) */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#18181B]">Atendimento & Hospitalidade Caiçara (Peso 30%)</span>
                <span className="font-mono text-[#0D9488]">{serviceScore}.0 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={serviceScore}
                onChange={(e) => setServiceScore(Number(e.target.value))}
                className="w-full accent-[#0D9488] cursor-pointer"
              />
            </div>

            {/* Custo-Benefício (25%) */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-[#18181B]">Custo-Benefício & Preço Justo (Peso 25%)</span>
                <span className="font-mono text-[#0D9488]">{costBenefitScore}.0 ★</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={costBenefitScore}
                onChange={(e) => setCostBenefitScore(Number(e.target.value))}
                className="w-full accent-[#0D9488] cursor-pointer"
              />
            </div>

            {/* Prévia da Super Nota Calculada */}
            <div className="pt-3 border-t border-[#E2D9CC] flex items-center justify-between">
              <span className="text-xs text-[#52525B] font-semibold">Super Nota Ponderada Calculada:</span>
              <span className="font-mono font-bold text-lg text-[#0B2B26]">{overallScore} ★</span>
            </div>
          </div>

          {/* Campo de Comentário Detalhado */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] uppercase tracking-wider mb-2">
              Seu Parecer Gastronômico:
            </label>
            <textarea
              rows={4}
              value={critiqueText}
              onChange={(e) => setCritiqueText(e.target.value)}
              placeholder="Descreva a experiência: frescor dos frutos do mar, ponto de cocção, crocância, ambiente..."
              className="w-full p-4 rounded-2xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-[#18181B] placeholder-[#71717A] text-sm focus:outline-none focus:border-[#0D9488] focus:bg-white transition-all resize-none"
              required
            />
          </div>

          {/* Checkbox de Consumidor Local */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#52525B]">
            <input
              type="checkbox"
              checked={declaredLocal}
              onChange={(e) => setDeclaredLocal(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0D9488]"
            />
            <span>Declaro que consumi presencialmente no estabelecimento em Caraguatatuba.</span>
          </label>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#0B2B26] text-[#F6F2EB] font-bold text-sm hover:bg-[#134E4A] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
          >
            <span>Enviar Avaliação Auditada (+50 Créditos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
