'use client';

import React, { useState } from 'react';
import { Coins, Zap, ShieldCheck, Flame, Star, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface CreditsTabProps {
  creditBalance: number;
  onUseCredits: (amount: number, reason: string) => boolean;
  onAddCredits: (amount: number) => void;
}

export function CreditsTab({ creditBalance, onUseCredits, onAddCredits }: CreditsTabProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAction = (cost: number, label: string) => {
    const ok = onUseCredits(cost, label);
    if (ok) {
      setSuccessMsg(`Sucesso! Você ativou: "${label}" (-${cost} créditos).`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      alert(`Saldo insuficiente! Você precisa de ${cost} créditos.`);
    }
  };

  return (
    <div className="space-y-6 px-3 pt-2 pb-20">
      {/* Saldo de Créditos Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-tr from-indigo-900 via-slate-900 to-sky-900 border border-sky-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-wider text-sky-300 font-bold">
              Seu Saldo Caiçara Nitro
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-black text-white">{creditBalance}</span>
              <span className="text-xs text-slate-300 font-semibold self-end mb-1">créditos</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> Nitro Ativo
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          Use seus créditos para destacar avaliações no topo do feed, obter selos verificados ou impulsionar estabelecimentos locais.
        </p>

        {/* Botões de Recarga Rápida */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/60">
          <button
            onClick={() => {
              onAddCredits(100);
              setSuccessMsg('Recarga de +100 créditos confirmada!');
              setTimeout(() => setSuccessMsg(null), 2500);
            }}
            className="flex-1 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition"
          >
            +100 Créditos
          </button>
          <button
            onClick={() => {
              onAddCredits(500);
              setSuccessMsg('Recarga de +500 créditos confirmada!');
              setTimeout(() => setSuccessMsg(null), 2500);
            }}
            className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition"
          >
            +500 Créditos
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ações com Créditos (Estilo Nitro) */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm px-1">Ações Exclusivas com Créditos</h3>

        <div className="space-y-2.5">
          {[
            {
              title: "Destacar Avaliação no Topo",
              cost: 50,
              desc: "Fixa sua avaliação com borda dourada e prioridade na timeline por 7 dias.",
              icon: Star,
              color: "amber"
            },
            {
              title: "Selo de Restaurante Verificado & Auditado",
              cost: 120,
              desc: "Ganha selo de certificação LGPD + Food Safety conferido pela IA.",
              icon: ShieldCheck,
              color: "emerald"
            },
            {
              title: "Impulsionar Promoção na Aba de Anunciantes",
              cost: 100,
              desc: "Exibe seu prato ou quiosque na vitrine de promoções em alta da cidade.",
              icon: Flame,
              color: "rose"
            }
          ].map((act, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <act.icon className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{act.title}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{act.desc}</p>
                </div>
              </div>

              <button
                onClick={() => handleAction(act.cost, act.title)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 transition shadow"
              >
                {act.cost} pts
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Aba de Anunciantes & Patrocinadores Locais */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-white text-sm px-1 flex items-center justify-between">
          <span>Aba de Anunciantes Impulsionados</span>
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Patrocinado</span>
        </h3>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 border border-amber-500/40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80')" }} />
            <div>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Destaque da Semana</span>
              <h4 className="font-bold text-white text-sm">Quiosque Canto Bravo</h4>
              <p className="text-xs text-slate-400">15% de desconto no almoço pé na areia</p>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400">
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
