'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, Utensils, Star, Flame } from 'lucide-react';

interface DynamicIslandProps {
  onSelectCategory?: (category: string) => void;
  onFilterNeighborhood?: (bairro: string) => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  onSelectCategory,
  onFilterNeighborhood,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'jacquin' | 'user'; text: string; recDish?: string }>>([
    {
      sender: 'jacquin',
      text: 'Mon ami! Bem-vindo a Caraguá! Tá procurando um camarão rosa crocante, uma isca de badejo pé na areia ou uma moqueca vegana hoje?',
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickChips = [
    { label: '🦐 Melhor camarão', query: 'camarão' },
    { label: '🐟 Badejo pé na areia', query: 'badejo' },
    { label: '🌿 100% Vegano', query: 'vegano' },
    { label: '🔥 Promoções do dia', query: 'promoção' },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let dish = '';

      if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        reply = 'Para comer sem carne e com muito sabor: a Moqueca Vegana de Palmito Pupunha da Cantina Caiçara Tradição é divina, e o Bowl de Shimeji do Empório Verde Mar é super fresco!';
        dish = 'Moqueca Vegana de Palmito Pupunha';
        if (onSelectCategory) onSelectCategory('vegano');
      } else if (q.includes('camar') || q.includes('risoto')) {
        reply = 'O prato dos deuses da orla é o Risoto de Camarão Rosa com Limão Siciliano no Mar & Terra Gourmet (Indaiá). Camarões gigantes e arroz al dente!';
        dish = 'Risoto de Camarão Rosa';
        if (onSelectCategory) onSelectCategory('camarão');
      } else if (q.includes('badejo') || q.includes('peixe') || q.includes('isca') || q.includes('areia')) {
        reply = 'Pé na areia de verdade é no Quiosque Canto Bravo em Martim de Sá! A Isca de Badejo na farinha panko com molho tártaro de limão-cravo acabou de sair da brasa!';
        dish = 'Isca de Badejo com Molho Tártaro';
        if (onSelectCategory) onSelectCategory('peixe');
      } else {
        reply = 'Na orla de Caraguatatuba os quiosques de Martim de Sá e os restaurantes do Indaiá estão com peixes fresquíssimos que chegaram hoje dos barcos. Dá uma olhada nos pratos em destaque logo abaixo!';
      }

      setChatMessages(prev => [...prev, { sender: 'jacquin', text: reply, recDish: dish }]);
    }, 600);
  };

  return (
    <aside aria-label="Dynamic Island do Chef Jacquin" className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 select-none">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`bg-[#1F1914] text-[#FAF7F2] border-2 border-[#2A9D8F]/50 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.25)] cursor-pointer overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-[min(540px,94vw)] p-5 rounded-[32px]'
            : 'w-[310px] sm:w-[360px] hover:w-[380px] px-3.5 py-2 rounded-full'
        }`}
      >
        {!isExpanded ? (
          /* ESTADO COMPACTO: JACQUIN RECORTADO VIVO DENTRO DA ILHA */
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* O Jacquin Recortado em Miniatura com Borda Dourada */}
              <div className="w-8 h-9 shrink-0 drop-shadow-sm">
                <img
                  src="/jacquin-praiano.png"
                  alt="Chef Jacquin Praiano"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">Chef Jacquin</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-[#E9C46A] truncate">
                  &quot;Badejo no Canto Bravo tá incrível hoje!&quot;
                </p>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[#E63946] hover:bg-[#D90429] text-[10px] font-bold text-white shrink-0 shadow-sm transition-colors">
              Falar
            </div>
          </div>
        ) : (
          /* ESTADO EXPANDIDO: CONVERSA GASTRONÔMICA COM O BONEQUINHO */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header da Ilha Expandida */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 shrink-0 drop-shadow-md">
                  <img
                    src="/jacquin-praiano.png"
                    alt="Chef Jacquin Praiano"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Chef Jacquin Praiano
                    <span className="text-[10px] font-normal text-[#1F1914] bg-[#E9C46A] px-2 py-0.5 rounded-full font-bold">
                      Seu Guia em Caraguá
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#C9DDD8]">
                    Dicas dos melhores quiosques e peixes frescos da enseada
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Recolher ilha"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Histórico de Dicas do Jacquin com Balões de Fala */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 no-scrollbar text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}
                >
                  {msg.sender === 'jacquin' && (
                    <div className="w-6 h-8 shrink-0 mt-0.5">
                      <img
                        src="/jacquin-praiano.png"
                        alt="Jacquin"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#E63946] text-white rounded-br-none font-medium'
                        : 'bg-white/12 text-[#FAF7F2] border border-white/10 rounded-tl-none font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.recDish && (
                      <span className="inline-block mt-1.5 text-[10px] font-bold text-[#E9C46A] bg-amber-400/20 px-2 py-0.5 rounded-full border border-[#E9C46A]/30">
                        ⭐ Prato sugerido: {msg.recDish}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chips de Perguntas Rápidas */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-white/10">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(chip.query);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white whitespace-nowrap transition-colors border border-white/10"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input para Perguntar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex items-center gap-2 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte ao Chef: onde tem peixe na telha?"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-zinc-400 focus:outline-none focus:bg-white/15 focus:border-[#E9C46A]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-[#E63946] hover:bg-[#D90429] text-white disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </aside>
  );
};
