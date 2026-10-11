'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Send, Star, Flame, Utensils } from 'lucide-react';

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
      text: 'Bonjour, mon ami! Bateu aquela fome de praia em Caraguá? Me diz o que você quer comer hoje: peixe frito, frutos do mar da enseada ou uma pizza a lenha?',
    }
  ]);

  const speechHints = [
    'Bateu fome? Clica em mim!',
    'Procurando o melhor peixe de Caraguá?',
    'Quer uma dica dos campeões?',
  ];
  const [currentHintIdx, setCurrentHintIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHintIdx((prev) => (prev + 1) % speechHints.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [speechHints.length]);

  const quickPrompts = [
    { label: '🦪 Mexilhão da Cocanha', query: 'cocanha' },
    { label: '🏺 Azul-Marinho', query: 'azul marinho' },
    { label: '🐙 Polvo no Aloha', query: 'polvo' },
    { label: '🐟 Peixe fresco da orla', query: 'peixe' },
    { label: '🏆 Campeões Caraguá a Gosto', query: 'premiados' },
    { label: '🍕 Pizza artesanal', query: 'pizza' },
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputText('');

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let dish = '';

      if (q.includes('cocanha') || q.includes('mexilh') || q.includes('amapec') || q.includes('zanfredo')) {
        reply = 'Mon ami, os mexilhões da Fazenda Marinha da Cocanha (AMAPEC) são cultivados em águas limpas nos espinhéis longline! É o melhor marisco do litoral paulista, seja no vapor ou no Risotto premiado da Cantinetta Zanfredo!';
        dish = 'Mexilhões da Cocanha ao Vapor';
        if (onSelectCategory) onSelectCategory('maricultura');
      } else if (q.includes('azul') || q.includes('marinho') || q.includes('ancestral') || q.includes('banana')) {
        reply = 'O verdadeiro Azul-Marinho tem que ser feito na panela de ferro fundido bruto com banana nanica verde! A reação dos taninos deixa o caldo ardósia escuro e o pirão na Cantina Caiçara Tradição é patrimônio vivo!';
        dish = 'Azul-Marinho Tradicional na Panela de Ferro';
      } else if (q.includes('polvo') || q.includes('aloha')) {
        reply = 'Polvo exige ponto exato pra não virar borracha! No Aloha Bistrô da Praia no Centro, o polvo é braseado na grelha viva com batatas ao murro na manteiga de garrafa!';
        dish = 'Polvo Grelhado Aloha';
      } else if (q.includes('fub') || q.includes('sol e cia') || q.includes('petisco')) {
        reply = 'Iscas de peixe sequinhas no fubá mimoso e limão-cravo na beira da praia! O Quiosque Sol e Cia em Martim de Sá levou 3º lugar do festival com a porção Boca da Noite!';
        dish = 'Boca da Noite – Iscas no Fubá Mimoso';
      } else if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        reply = 'Mon ami, aqui em Caraguá tem comida limpa e consciente! O Bowl Caiçara do Empório Verde Mar no Indaiá é feito com shimeji fresco e banana da serra!';
        dish = 'Bowl Caiçara de Quinoa e Shimeji';
        if (onSelectCategory) onSelectCategory('vegano');
      } else if (q.includes('camar') || q.includes('risoto')) {
        reply = 'Camarão tem que ser graúdo e bem preparado! O Camarão Tropical Espeticho na Tabatinga ou o Risoto no Indaiá são fantásticos!';
        dish = 'Camarão Tropical Espeticho';
        if (onSelectCategory) onSelectCategory('camarão');
      } else if (q.includes('badejo') || q.includes('peixe') || q.includes('sororoca') || q.includes('isca')) {
        reply = 'A Sororoca a Mediterrâneo do Marujo Gastro Bar no Centro foi bicampeã do festival, e a Isca de Badejo no Canto Bravo em Martim de Sá é crocância pura!';
        dish = 'Sororoca a Mediterrâneo';
        if (onSelectCategory) onSelectCategory('peixe');
      } else if (q.includes('pizza') || q.includes('lenha')) {
        reply = 'No Indaiá a Pizzaria Japa Pizza foi multicampeã com a pizza de Pernil Supremo no forno a lenha, e o Garage Steakhouse levou pódio com a Pizza Garage Mar com salmão defumado!';
        dish = 'Pizza Pernil Supremo';
        if (onSelectCategory) onSelectCategory('pizza');
      } else {
        reply = 'Os pescadores do Camaroeiro trouxeram peixes fresquíssimos hoje! Dá uma olhada no feed dos pratos logo abaixo na página. Quer que eu filtre alguma categoria para você?';
      }

      setChatMessages((prev) => [...prev, { sender: 'jacquin', text: reply, recDish: dish }]);
    }, 550);
  };

  return (
    <>
      {/* 1. MASCÓTE FLUTUANTE NO CANTO INFERIOR DIREITO COM BALÃOZINHO */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
        {/* Balãozinho de Fala Animado */}
        <AnimatePresence>
          {!isOpen && showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="mb-2 max-w-[210px] bg-white border-2 border-[#135136] p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform relative speech-bubble"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="absolute -top-2 -left-2 w-5 h-5 bg-[#FAF7F2] border border-stone-200 rounded-full text-stone-500 hover:text-stone-800 flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
              <div className="flex items-center gap-1.5 text-[#135136] font-black text-[11px] mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB703] shrink-0" />
                <span>Chef Jacquin diz:</span>
              </div>
              <p className="text-xs font-bold text-stone-900 leading-tight">
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
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(19,81,54,0.35)]"
          />
          <span className="absolute bottom-1 right-2 w-4 h-4 bg-[#FFB703] border-2 border-white rounded-full shadow-sm" />
        </motion.button>
      </div>

      {/* 2. CHAT CONVERSACIONAL COM O CHEF JACQUIN */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-lg bg-[#FAF7F2] rounded-[32px] shadow-2xl border-2 border-[#135136]/30 overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header com o Bonequinho no Topo */}
              <div className="bg-gradient-to-r from-[#135136] to-[#1E6B47] text-white p-5 flex items-center justify-between border-b-2 border-[#FFB703]">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-16 shrink-0 drop-shadow-md">
                    <img
                      src="/jacquin-praiano.png"
                      alt="Chef Jacquin Praiano"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-white leading-tight">
                      Chef Jacquin Praiano
                    </h3>
                    <p className="text-xs text-[#FFB703] font-bold">
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
                          ? 'bg-[#FFB703] text-stone-900 rounded-br-none font-black'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.recDish && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-stone-900 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
                          <span>Sugestão: {msg.recDish}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chips Rápidos de Comida */}
              <div className="p-3 bg-white border-t border-stone-200 flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.query)}
                    className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FFB703] hover:text-stone-900 border border-stone-200 text-xs font-bold text-stone-800 whitespace-nowrap transition-colors"
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
                className="p-4 bg-white border-t border-stone-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pergunte ao Chef: onde tem a melhor sororoca?"
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs text-stone-900 placeholder-stone-500 focus:outline-none focus:border-[#135136] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 rounded-2xl bg-[#FFB703] hover:bg-[#F59E0B] text-stone-900 disabled:opacity-40 transition-colors shadow-md font-bold"
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
