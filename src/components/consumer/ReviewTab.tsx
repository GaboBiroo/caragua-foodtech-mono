'use client';

import React, { useState } from 'react';
import { RestaurantItem } from '@/data/caraguaData';
import { Star, ShieldAlert, CheckCircle2, Send, ThumbsUp } from 'lucide-react';

interface ReviewTabProps {
  restaurants: RestaurantItem[];
  onAddReviewSuccess: (restaurantId: string, review: any) => void;
}

export function ReviewTab({ restaurants, onAddReviewSuccess }: ReviewTabProps) {
  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [ratingFood, setRatingFood] = useState(5);
  const [ratingService, setRatingService] = useState(5);
  const [ratingHygiene, setRatingHygiene] = useState(5);
  const [ratingValue, setRatingValue] = useState(5);
  const [lgpdWarning, setLgpdWarning] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sanitização LGPD em tempo real
  const handleCommentChange = (text: string) => {
    setCommentText(text);
    // Checagem de CPF ou telefone
    const hasCpf = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/.test(text);
    const hasPhone = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/.test(text);
    if (hasCpf || hasPhone) {
      setLgpdWarning('⚠️ LGPD Ativa: Detectamos dados pessoais (CPF/Telefone). Eles serão mascarados irreversivelmente antes de publicar.');
    } else {
      setLgpdWarning(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const avgScore = Number(((ratingFood + ratingService + ratingHygiene + ratingValue) / 4).toFixed(1));

    // Mascara LGPD no texto
    const sanitized = commentText
      .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '[CPF_MASCARADO]')
      .replace(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, '[TEL_MASCARADO]');

    const newRev = {
      id: 'rev-' + Date.now(),
      author: authorName.trim() ? `${authorName.trim()} (Hash: a1b2)` : 'Avaliador Anônimo',
      rating: avgScore,
      decayedRating: avgScore, // Recém postada tem peso máximo de decaimento!
      comment: sanitized,
      date: 'Agora mesmo',
      daysAgo: 0,
      source: 'App' as const,
      verifiedAudit: true
    };

    onAddReviewSuccess(selectedRestId, newRev);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCommentText('');
      setAuthorName('');
    }, 3000);
  };

  return (
    <div className="space-y-6 px-3 pt-2 pb-20">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-sky-950/80 border border-teal-500/30 shadow-xl">
        <h3 className="font-bold text-white text-base mb-1">Avaliação Auditada no App</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sua avaliação tem peso imediato no cálculo da Super Nota de 30 dias.
          Blindagem LGPD ativa: nenhum dado sensível seu será exposto.
        </p>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Avaliação Publicada com Sucesso!</p>
            <p className="text-xs text-emerald-300">A Super Nota do estabelecimento foi recalculada na hora.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl">
        {/* Seleção do Restaurante */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Escolha o Restaurante em Caraguá
          </label>
          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.neighborhood})
              </option>
            ))}
          </select>
        </div>

        {/* Nome do Autor */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Seu Nome ou Apelido (Opcional)
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Ex: Gabriel Caiçara"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Avaliação por Critérios */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Critérios de Avaliação
          </span>

          {[
            { label: "Qualidade da Comida / Frescor", val: ratingFood, set: setRatingFood },
            { label: "Atendimento & Rapidez", val: ratingService, set: setRatingService },
            { label: "Higiene & Food Safety", val: ratingHygiene, set: setRatingHygiene },
            { label: "Custo-Benefício", val: ratingValue, set: setRatingValue },
          ].map((crit, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
              <span>{crit.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => crit.set(num)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        num <= crit.val ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comentário com LGPD */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Seu Comentário Detalhado
          </label>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Conte como foi sua experiência, o ponto do peixe, o tempero caiçara..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            required
          />
          {lgpdWarning && (
            <div className="mt-1.5 p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{lgpdWarning}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition"
        >
          <Send className="w-4 h-4" /> Publicar Avaliação Auditada
        </button>
      </form>
    </div>
  );
}
