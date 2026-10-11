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
      text: 'Mon ami! Bem-vindo a Caraguá! Tá procurando um camarão crocante, uma isca de badejo pé na areia ou um prato caiçara de verdade hoje?',
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickChips = [
    { label: '🦪 Mexilhão da Cocanha', query: 'cocanha' },
    { label: '🏺 Azul-Marinho', query: 'azul marinho' },
    { label: '🐙 Polvo no Aloha', query: 'polvo' },
    { label: '🐟 Peixe fresco da orla', query: 'peixe' },
    { label: '🏆 Vencedores Caraguá a Gosto', query: 'premiados' },
    { label: '🍕 Pizza artesanal a lenha', query: 'pizza' },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let dish = '';

      if (q.includes('cocanha') || q.includes('mexilh') || q.includes('amapec') || q.includes('zanfredo')) {
        reply = 'Mon ami, os mexilhões da Fazenda Marinha da Cocanha (AMAPEC) são os mais frescos do Brasil! Cultivados em espinhéis longline, servidos ao vapor com limão-cravo ou no Risotto premiado da Cantinetta Zanfredo!';
        dish = 'Mexilhões da Cocanha ao Vapor';
        if (onSelectCategory) onSelectCategory('maricultura');
      } else if (q.includes('azul') || q.includes('marinho') || q.includes('ancestral') || q.includes('banana')) {
        reply = 'O verdadeiro Azul-Marinho tem que ser feito na panela de ferro fundido bruto com banana nanica verde! A reação dos taninos deixa o caldo ardósia escuro e o pirão na Cantina Caiçara Tradição é patrimônio vivo!';
        dish = 'Azul-Marinho Tradicional na Panela de Ferro';
      } else if (q.includes('polvo') || q.includes('aloha')) {
        reply = 'Polvo exige ponto exato pra não virar borracha! No Aloha Bistrô da Praia no Centro, o polvo é braseado na grelha viva com batatas ao murro na manteiga de garrafa. Pódio consecutivo do festival!';
        dish = 'Polvo Grelhado Aloha';
      } else if (q.includes('fub') || q.includes('sol e cia') || q.includes('petisco')) {
        reply = 'Iscas de peixe fresquinhas no fubá mimoso e limão-cravo pé na areia! O Quiosque Sol e Cia em Martim de Sá levou 3º lugar do festival com a porção Boca da Noite!';
        dish = 'Boca da Noite – Iscas no Fubá Mimoso';
      } else if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        reply = 'Para comer sem carne e com muito frescor: o Bowl Caiçara do Empório Verde Mar é cheio de vida e ingredientes da Mata Atlântica!';
        dish = 'Bowl Caiçara de Quinoa e Shimeji';
        if (onSelectCategory) onSelectCategory('vegano');
      } else if (q.includes('camar') || q.includes('risoto')) {
        reply = 'Quer camarão nobre de verdade? O Camarão Tropical Espeticho na Tabatinga ou o Risoto no Indaiá são fantásticos, mon ami!';
        dish = 'Camarão Tropical Espeticho';
        if (onSelectCategory) onSelectCategory('camarão');
      } else if (q.includes('badejo') || q.includes('peixe') || q.includes('sororoca') || q.includes('isca')) {
        reply = 'A Sororoca a Mediterrâneo do Marujo Gastro Bar no Centro foi bicampeã do Caraguá a Gosto, e a Isca de Badejo no Canto Bravo em Martim de Sá é crocância pura!';
        dish = 'Sororoca a Mediterrâneo';
        if (onSelectCategory) onSelectCategory('peixe');
      } else if (q.includes('pizza') || q.includes('lenha')) {
        reply = 'No Indaiá a Pizzaria Japa Pizza foi multicampeã com a pizza de Pernil Supremo no forno a lenha, e o Garage Steakhouse levou pódio com a Pizza Garage Mar com salmão defumado!';
        dish = 'Pizza Pernil Supremo';
        if (onSelectCategory) onSelectCategory('pizza');
      } else {
        reply = 'Na orla de Caraguatatuba os quiosques e restaurantes estão com os peixes frescos da safra que chegaram hoje no Camaroeiro. Olha os pratos do feed!';
      }

      setChatMessages(prev => [...prev, { sender: 'jacquin', text: reply, recDish: dish }]);
    }, 550);
  };

  return (
    <aside aria-label="Dynamic Island do Chef Jacquin" className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 select-none">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className={`bg-[#135136] text-white border-2 border-[#FFB703]/80 shadow-[0_16px_36px_-6px_rgba(19,81,54,0.45),0_2px_8px_rgba(0,0,0,0.3)] cursor-pointer overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'w-[min(540px,94vw)] p-5 rounded-[32px]'
            : 'w-[310px] sm:w-[360px] hover:w-[380px] px-3.5 py-2 rounded-full'
        }`}
      >
        {!isExpanded ? (
          /* ESTADO COMPACTO: JACQUIN RECORTADO VIVO DENTRO DA ILHA */
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
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
                  <span className="w-2 h-2 rounded-full bg-[#FFB703] animate-pulse" />
                </div>
                <p className="text-[11px] text-amber-200 truncate">
                  &quot;Badejo crocante no Canto Bravo tá incrível!&quot;
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#FFB703] hover:bg-[#F59E0B] text-[10px] font-black text-stone-900 shrink-0 shadow-sm transition-colors">
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
                    <span className="text-[10px] text-stone-900 bg-[#FFB703] px-2 py-0.5 rounded-full font-black">
                      Guia Oficial
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    Dicas dos melhores quiosques e peixes frescos de Caraguá
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
