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
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
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
      {/* 1. MASCÓTE FLUTUANTE CENTRALIZADO COMO PROTAGONISTA À DIREITA EM BAIXO */}
      <aside 
        aria-label="Assistente Central Chef Jacquin Praiano"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end pointer-events-auto select-none"
      >
        {/* Balão de Fala Animado e Expressivo */}
        <AnimatePresence>
          {!isOpen && showSpeechBubble && (
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="mb-3 max-w-[280px] sm:max-w-[320px] bg-white border-2 border-[#135136] p-4 rounded-3xl shadow-[0_16px_36px_-6px_rgba(19,81,54,0.35)] cursor-pointer hover:scale-105 transition-transform relative speech-bubble"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-[#FAF7F2] border-2 border-[#135136] rounded-full text-stone-700 hover:text-stone-950 flex items-center justify-center text-xs font-bold shadow-sm"
                title="Fechar balão"
              >
                ✕
              </button>
              <div className="flex items-center gap-1.5 text-[#135136] font-black text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-[#FFB703] shrink-0" />
                <span>Chef Jacquin Diz:</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
                &ldquo;{speechHints[currentHintIdx]}&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500 font-bold border-t border-stone-100 pt-1.5">
                <span className="text-[#135136]">Toque para conversar</span>
                <span className="text-[#FFB703] font-black">★ IA Hiperlocal</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTAINER DO PERSONAGEM CENTRAL COM DESIGN INSPIRADO EM KORUS / COUCOU */}
        <div className="flex flex-col items-end group">
          
          {/* Card Companheiro Acoplado (Estilo Korus / Claude Code Benchmark) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-2 hidden sm:flex flex-col items-end p-2.5 rounded-2xl bg-stone-950/85 backdrop-blur-md text-white border border-[#FFB703]/50 shadow-xl space-y-1.5 cursor-pointer max-w-[210px]"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-heading font-black text-xs text-[#FFB703] uppercase tracking-wide">
                Chef Jacquin
              </span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                No Ar
              </span>
            </div>
            
            {/* Checklist de Status Ativo do Personagem */}
            <div className="space-y-0.5 text-[10px] text-stone-300 w-full">
              <div className="flex items-center gap-1.5 text-stone-200">
                <CheckCircle2 className="w-3 h-3 text-[#FFB703] shrink-0" />
                <span className="truncate">Paladar Caiçara Ativo</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">53 Bairros Mapeados</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-200">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">AMAPEC & Z-8 Conectados</span>
              </div>
            </div>
          </motion.div>

          {/* O JACQUIN EM TAMANHO GIGANTE PROTAGONISTA COM ANIMAÇÃO SUAVE DE RESPIRAÇÃO */}
          <motion.button
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onClick={() => setIsOpen(true)}
            className="relative w-32 h-40 sm:w-44 sm:h-52 md:w-52 md:h-60 drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)] focus:outline-none cursor-pointer"
            aria-label="Abrir assistente oficial Chef Jacquin Praiano"
          >
            <img
              src="/jacquin-praiano.png"
              alt="Chef Jacquin Praiano - Personagem Central"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(19,81,54,0.45)]"
            />
            {/* Halo / Emblema Dourado Flutuante */}
            <div className="absolute -bottom-1 right-2 sm:right-4 px-3 py-1 rounded-full bg-[#135136] text-[#FFB703] border-2 border-[#FFB703] shadow-lg flex items-center gap-1.5 text-[10px] sm:text-xs font-black">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB703]" />
              <span>Falar com o Chef</span>
            </div>
          </motion.button>
        </div>
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
