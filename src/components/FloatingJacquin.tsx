'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, X, Sparkles, Send, Star, Flame, 
  Utensils, CheckCircle2, ChevronRight, Compass, ShieldCheck 
} from 'lucide-react';

interface FloatingJacquinProps {
  onSelectCategory?: (category: string) => void;
}

export const FloatingJacquin: React.FC<FloatingJacquinProps> = ({
  onSelectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'jacquin' | 'user'; text: string; recDish?: string }>>([
    {
      sender: 'jacquin',
      text: 'Bonjour, mon ami! Bateu aquela fome de praia em Caraguá? Me diz o que você quer comer hoje: peixe frito, frutos do mar da enseada ou uma pizza a lenha?',
    }
  ]);

  const speechHints = [
    'Mon ami! Clica em mim pra achar os melhores peixes de Caraguá!',
    'Mexilhão fresco tem que ser da Fazenda Cocanha! Quer ver?',
    'Azul-Marinho na panela de ferro é patrimônio sagrado! Vem ver onde tem!',
    'Quer uma dica dos grandes campeões do Festival Caraguá a Gosto?',
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
    { label: '🍕 Pizza artesanal a lenha', query: 'pizza' },
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
      {/* 1. MASCÓTE FLUTUANTE COESO INSPIRADO EM KORUS / COUCOU */}
      <aside 
        aria-label="Assistente Central Chef Jacquin Praiano"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-6 md:right-6 z-30 flex flex-col items-end pointer-events-auto select-none"
      >
        <AnimatePresence mode="wait">
          {isMinimized ? (
            /* ESTADO MINIMIZADO: PÍLULA FLUTUANTE DISCRETA */
            <motion.button
              key="minimized"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#135136] text-white border-2 border-[#FFB703] shadow-[0_12px_28px_rgba(19,81,54,0.45)] cursor-pointer group"
              aria-label="Expandir Chef Jacquin"
            >
              <div className="relative w-8 h-10 shrink-0 -my-1">
                <img
                  src="/jacquin-praiano.png"
                  alt="Chef Jacquin"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(255,183,3,0.5)]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#135136] animate-pulse" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block font-heading font-black text-xs text-white leading-none">Chef Jacquin</span>
                <span className="text-[10px] text-amber-200 font-bold">Online • Dicas</span>
              </div>
              <span className="text-[#FFB703] text-xs font-black ml-1">↑</span>
            </motion.button>
          ) : (
            /* ESTADO EXPANDIDO: CARD COMPANHEIRO UNIFICADO E ELEGANTE */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              className="relative bg-white/95 backdrop-blur-md border-2 border-[#135136] rounded-3xl p-3.5 sm:p-4 shadow-[0_16px_36px_-6px_rgba(19,81,54,0.35)] max-w-[280px] sm:max-w-[320px]"
            >
              {/* Header com Status e Botão Minimizar */}
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-heading font-black text-xs text-[#135136] uppercase tracking-wide">
                    Chef Jacquin • Online
                  </span>
                </div>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center text-xs font-black transition-colors"
                  title="Minimizar assistente"
                  aria-label="Minimizar assistente"
                >
                  –
                </button>
              </div>

              {/* Corpo: Jacquin + Dica Dinâmica */}
              <div 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 drop-shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src="/jacquin-praiano.png"
                    alt="Chef Jacquin Praiano"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(255,183,3,0.4)]"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-stone-900 leading-tight">
                    &ldquo;{speechHints[currentHintIdx]}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-extrabold text-[#135136]">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate">53 Bairros & AMAPEC Conectados</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Direta */}
              <button
                onClick={() => setIsOpen(true)}
                className="mt-2.5 w-full py-2 rounded-full bg-[#135136] hover:bg-[#0D3825] text-[#FFB703] text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Conversar com o Chef</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* 2. MODAL CONVERSACIONAL DE ALTA FIDELIDADE COM O CHEF JACQUIN */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-xl bg-[#FAF7F2] rounded-[36px] shadow-2xl border-4 border-[#135136] overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header com Jacquin Gigante e Imersivo */}
              <div className="bg-gradient-to-r from-[#135136] via-[#1E6B47] to-[#135136] text-white p-5 sm:p-6 flex items-center justify-between border-b-4 border-[#FFB703]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 -my-3 drop-shadow-xl">
                    <img
                      src="/jacquin-praiano.png"
                      alt="Chef Jacquin Praiano"
                      className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(255,183,3,0.5)]"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-[#FFB703] mb-1">
                      <Sparkles className="w-3 h-3 text-[#FFB703]" />
                      <span>Curador Oficial de Caraguá</span>
                    </div>
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-white leading-tight">
                      Chef Jacquin Praiano
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                      Crítica gastronômica, insumos frescos & 53 bairros
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                  aria-label="Fechar conversa"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mensagens do Bate-Papo com Balões de Alta Qualidade */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}
                  >
                    {msg.sender === 'jacquin' && (
                      <div className="w-10 h-12 shrink-0 mt-1 drop-shadow-md">
                        <img
                          src="/jacquin-praiano.png"
                          alt="Jacquin"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div
                      className={`p-4 sm:p-5 rounded-3xl max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#FFB703] text-stone-900 rounded-br-none font-black shadow-md'
                          : 'bg-white text-stone-900 border border-stone-200 rounded-tl-none font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.recDish && (
                        <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs font-black text-stone-900 flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#FFB703] fill-[#FFB703] shrink-0" />
                            <span>Recomendação: {msg.recDish}</span>
                          </div>
                          <span className="text-[10px] text-[#135136] uppercase tracking-wide bg-white px-2 py-0.5 rounded-full border border-amber-200">
                            No Cardápio
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chips Rápidos de Comida */}
              <div className="p-3.5 bg-white border-t border-stone-200 flex gap-2 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.query)}
                    className="px-3.5 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FFB703] hover:text-stone-900 border border-stone-200 text-xs font-bold text-stone-800 whitespace-nowrap transition-colors shadow-sm"
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
                className="p-4 sm:p-5 bg-white border-t border-stone-200 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pergunte ao Chef: onde tem o melhor azul-marinho ou peixe fresco?"
                  className="flex-1 px-5 py-3.5 rounded-full bg-[#FAF7F2] border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-500 focus:outline-none focus:border-[#135136] focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3.5 rounded-full bg-[#FFB703] hover:bg-[#F59E0B] text-stone-900 disabled:opacity-40 transition-transform hover:scale-105 shadow-md font-bold"
                  aria-label="Enviar pergunta"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
