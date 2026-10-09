'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, MapPin } from 'lucide-react';

interface DynamicIslandProps {
  activePoloName: string;
  onOpenConcierge: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  activePoloName,
  onOpenConcierge,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 select-none">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-[#141413] text-[#F6F2EB] border border-white/[0.14] shadow-[0_12px_32px_-6px_rgba(14,14,13,0.55),0_2px_8px_rgba(0,0,0,0.25)] rounded-[26px] cursor-pointer overflow-hidden transition-all duration-300 ${
          isExpanded ? 'w-[min(540px,94vw)] p-4 rounded-[28px]' : 'w-[260px] hover:w-[320px] px-4 py-2.5'
        }`}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between text-xs font-semibold tracking-tight">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-green" />
              <span>RAG 5 Estágios Ativo</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300/90">{activePoloName}</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/[0.10] pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-green" />
                <span>Orquestrador RAG Central • Caraguatatuba</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Latência: 42ms
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">Polo: <b>{activePoloName}</b></span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Food Safety 100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-zinc-400">Clique para recolher a ilha dinâmica</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenConcierge();
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Falar com Jacquin
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
