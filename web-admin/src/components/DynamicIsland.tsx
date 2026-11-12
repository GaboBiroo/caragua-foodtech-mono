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
      text: 'Mon ami! Bem-vindo ao CaráFood! Busque pratos reais com preços de hoje e fotos oficiais em Caraguatatuba!',
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickChips = [
    { label: '🍔 Lanches & Burgers', query: 'burger' },
    { label: '🍤 Frutos do Mar', query: 'camarão' },
    { label: '🍕 Pizzas', query: 'pizza' },
    { label: '🍣 Japonês', query: 'sushi' },
    { label: '🥩 Marmitas & Executivo', query: 'marmita' },
    { label: '🍧 Açaí & Sobremesas', query: 'açai' },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let dish = '';

      if (q.includes('burger') || q.includes('lanche') || q.includes('sandu')) {
        reply = 'Use os filtros de categoria ou bairro na tela inicial para ver lanchonetes reais em Caraguatatuba com cardápio e fotos conferidas!';
        if (onSelectCategory) onSelectCategory('lanches');
      } else if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        reply = 'Ative o filtro de restrição alimentar na busca para localizar apenas opções compatíveis no cardápio real!';
        if (onSelectCategory) onSelectCategory('vegano');
      } else if (q.includes('camar') || q.includes('peixe') || q.includes('frutos')) {
        reply = 'Explore os estabelecimentos de frutos do mar no guia principal com avaliações do Google Maps e cardápio original anexado!';
        if (onSelectCategory) onSelectCategory('frutos do mar');
      } else if (q.includes('pizza')) {
        reply = 'Veja as pizzarias ativas de Caraguatatuba no catálogo principal com preços reais por tamanho!';
        if (onSelectCategory) onSelectCategory('pizza');
      } else {
        reply = 'Use o campo de busca ou clique em "Checar Cardápio" em qualquer restaurante para conferir preços, fotos e link oficial!';
      }

      setChatMessages(prev => [...prev, { sender: 'jacquin', text: reply, recDish: dish }]);
    }, 550);
  };

  return (
    <aside aria-label="Dynamic Island do Chef Jacquin CaráFood" className="relative w-full max-w-xl mx-auto px-2 z-20 select-none flex justify-center">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`bg-[#0D3825] text-white border-2 border-[#FFB703]/85 shadow-[0_14px_32px_-6px_rgba(0,0,0,0.38)] cursor-pointer overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-full p-5 sm:p-6 rounded-[32px]'
            : 'w-full max-w-md sm:max-w-lg hover:border-[#FFB703] hover:scale-[1.01] px-4 py-2 rounded-full'
        }`}
      >
        {!isExpanded ? (
          /* ESTADO COMPACTO: JACQUIN RECORTADO VIVO DENTRO DA ILHA */
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-12 shrink-0 -my-1 drop-shadow-md animate-coucou-wave">
                <img
                  src="/jacquin-praiano.png"
                  alt="Chef Jacquin Praiano"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(255,183,3,0.4)]"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-white">Chef Jacquin • CaráFood</span>
                  <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-pulse" />
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200 truncate font-medium">
                  &quot;Pratos reais e fotos oficiais em Caraguatatuba!&quot;
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1 rounded-full bg-[#FFB703] hover:bg-[#F59E0B] text-xs font-black text-stone-900 shrink-0 shadow-sm transition-colors">
              Falar
            </div>
          </div>
        ) : (
          /* ESTADO EXPANDIDO: CONVERSA GASTRONÔMICA COM O CHEF JACQUIN */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header da Ilha Expandida */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-20 shrink-0 -my-2 drop-shadow-md animate-coucou-wave">
                  <img
                    src="/jacquin-praiano.png"
                    alt="Chef Jacquin Praiano"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(255,183,3,0.5)]"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Chef Jacquin Praiano
                    <span className="text-[10px] text-stone-900 bg-[#FFB703] px-2 py-0.5 rounded-full font-black">
                      CaráFood Oficial
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    Dicas dos melhores quiosques e peixes frescos de Caraguatatuba
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
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
                        ? 'bg-[#FFB703] text-stone-900 rounded-br-none font-extrabold'
                        : 'bg-white/15 text-white border border-white/15 rounded-tl-none font-medium'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.recDish && (
                      <span className="inline-block mt-1.5 text-[10px] font-black text-stone-900 bg-[#FFB703] px-2 py-0.5 rounded-full shadow-sm">
                        ⭐ Prato sugerido: {msg.recDish}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chips de Perguntas Rápidas */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-white/15">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(chip.query);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-bold text-white whitespace-nowrap transition-colors border border-white/10"
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
                placeholder="Pergunte ao Chef: onde comer a melhor sororoca?"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/15 border border-white/20 text-xs text-white placeholder-emerald-200 focus:outline-none focus:bg-white/20 focus:border-[#FFB703]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-[#FFB703] hover:bg-[#F59E0B] text-stone-900 disabled:opacity-40 transition-colors shadow-md font-bold"
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
