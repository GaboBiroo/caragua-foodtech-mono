'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Send, Star, Flame, Utensils } from 'lucide-react';
import { INITIAL_RESTAURANTS, Dish } from '../data/caraguaData';

interface FloatingJacquinProps {
  onSelectCategory?: (category: string) => void;
}

export const FloatingJacquin: React.FC<FloatingJacquinProps> = ({
  onSelectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'jacquin' | 'user'; text: string; recDish?: string }>>([
    {
      sender: 'jacquin',
      text: 'Bonjour, mon ami! Bateu aquela fome de praia? Me diz o que você quer comer hoje: peixe frito, camarão rosa ou uma opção 100% vegana?',
    }
  ]);

  const speechHints = [
    'Bateu fome? Clica em mim!',
    'Procurando o melhor peixe da praia?',
    'Dúvidas de onde comer em Caraguá?',
  ];
  const [currentHintIdx, setCurrentHintIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHintIdx((prev) => (prev + 1) % speechHints.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [speechHints.length]);

  const quickPrompts = [
    { label: '🦐 Melhor camarão', query: 'camarão' },
    { label: '🐟 Badejo na praia', query: 'badejo' },
    { label: '🌿 Prato vegano', query: 'vegano' },
    { label: '🔥 Promoção hoje', query: 'promoção' },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let dish = '';

      if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        reply = 'Mon ami, aqui em Caraguá tem comida consciente de primeira! A Moqueca Vegana de Palmito Pupunha da Cantina Caiçara Tradição é feita com azeite de dendê e leite de coco fresco. Uma explosão de sabor!';
        dish = 'Moqueca Vegana de Palmito Pupunha';
        if (onSelectCategory) onSelectCategory('vegano');
      } else if (q.includes('camar') || q.includes('risoto')) {
        reply = 'Ah, camarão é a minha paixão! O Risoto de Camarão Rosa com Limão Siciliano do Mar & Terra Gourmet (Indaiá) é espetacular. Camarões rosa gigantes e ponto perfeito!';
        dish = 'Risoto de Camarão Rosa';
        if (onSelectCategory) onSelectCategory('camarão');
      } else if (q.includes('badejo') || q.includes('peixe') || q.includes('isca') || q.includes('areia')) {
        reply = 'Pé na areia sem frescura e com peixe fresquinho é no Quiosque Canto Bravo em Martim de Sá! A Isca de Badejo na farinha panko com molho tártaro de limão-cravo é imbatível!';
        dish = 'Isca de Badejo com Molho Tártaro';
        if (onSelectCategory) onSelectCategory('peixe');
      } else {
        reply = 'Os pescadores da enseada trouxeram peixes fresquíssimos hoje! Dá uma olhada no cardápio de Martim de Sá e Indaiá logo aqui embaixo na página. Quer que eu filtre alguma categoria para você?';
      }

      setChatMessages((prev) => [...prev, { sender: 'jacquin', text: reply, recDish: dish }]);
    }, 600);
  };

  return (
    <>
      {/* 1. MASCÓTE FLUTUANTE NO CANTO INFERIOR DIREITO COM BALÃOZINHO */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        {/* Balãozinho de Fala Animado Estilo Gibi */}
        <AnimatePresence>
          {!isOpen && showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="mb-2 max-w-[210px] bg-white border-2 border-[#2A9D8F] p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform relative speech-bubble"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="absolute -top-2 -left-2 w-5 h-5 bg-[#FAF7F2] border border-[#E8E2D8] rounded-full text-[#6B5E52] hover:text-[#1F1914] flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
              <div className="flex items-center gap-1.5 text-[#E63946] font-bold text-[11px] mb-0.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Chef Jacquin diz:</span>
              </div>
              <p className="text-xs font-semibold text-[#1F1914] leading-tight">
                {speechHints[currentHintIdx]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bonequinho Recortado do Jacquin com Física de Hover & Bounce */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative w-20 h-24 md:w-24 md:h-28 drop-shadow-2xl focus:outline-none cursor-pointer group"
          aria-label="Abrir assistente Chef Jacquin"
        >
          <img
            src="/jacquin-praiano.png"
            alt="Chef Jacquin Praiano"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(42,157,143,0.35)]"
          />
          <span className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
        </motion.button>
      </div>

      {/* 2. CHAT CONVERSACIONAL COM O CHEF JACQUIN (GRANDE, DENTRO DA CAIXINHA) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#1F1914]/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[32px] shadow-2xl border-2 border-[#2A9D8F]/30 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header com o Bonequinho Grandão no Topo */}
              <div className="bg-gradient-to-r from-[#2A9D8F] to-[#1E6B62] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-16 shrink-0 drop-shadow-md">
                    <img
                      src="/jacquin-praiano.png"
                      alt="Chef Jacquin Praiano"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white leading-tight">
                      Chef Jacquin Praiano
                    </h3>
                    <p className="text-xs text-[#E9C46A] font-medium">
                      O seu Guia Gourmet em Caraguatatuba
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mensagens do Bate-Papo com Balõezinhos de Fala */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 no-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-2.5'}`}
                  >
                    {msg.sender === 'jacquin' && (
                      <div className="w-8 h-10 shrink-0 mt-1">
                        <img
                          src="/jacquin-praiano.png"
                          alt="Jacquin"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-3xl max-w-[85%] text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#E63946] text-white rounded-br-none font-medium'
                          : 'bg-white text-[#1F1914] border border-[#E8E2D8] rounded-tl-none font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.recDish && (
                        <div className="mt-2.5 p-2 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] text-[11px] font-bold text-[#E63946] flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Sugestão: {msg.recDish}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chips Rápidos de Comida */}
              <div className="p-3 bg-white border-t border-[#E8E2D8] flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.query)}
                    className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#E8E2D8] border border-[#E8E2D8] text-xs font-semibold text-[#1F1914] whitespace-nowrap transition-colors"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input de Envio de Mensagem */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="p-4 bg-white border-t border-[#E8E2D8] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pergunte ao Chef Jacquin..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D8] text-xs text-[#1F1914] placeholder-[#6B5E52] focus:outline-none focus:border-[#2A9D8F] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 rounded-2xl bg-[#E63946] hover:bg-[#D90429] text-white disabled:opacity-40 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
