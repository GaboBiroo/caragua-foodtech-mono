'use client';

import React, { useState, useRef, useEffect } from 'react';
import { JacquinPraianoAvatar } from './JacquinPraianoAvatar';
import { X, Send, Sparkles, MapPin, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { INITIAL_RESTAURANTS } from '@/data/caraguaData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'jacquin';
  text: string;
  restaurantCard?: {
    id: string;
    name: string;
    neighborhood: string;
    dish: string;
    price: number;
    rating: number;
    foodSafety: number;
  };
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRestaurant?: (id: string) => void;
}

export function JacquinChatDrawer({ isOpen, onClose, onSelectRestaurant }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'jacquin',
      text: 'Fala meu consagrado! Eu sou o Jacquin Praiano, sua IA gastronômica oficial de Caraguatatuba! 🌊 O que você tá procurando hoje? Um peixe fresco pé na areia, moqueca tradicional caiçara ou uma porção crocante sem glúten?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_PROMPTS = [
    'Onde tem o melhor peixe no Martim de Sá?',
    'Opções sem glúten no Centro?',
    'Camarão rosa com promoção no Indaiá?',
    'Tainha assada na brasa em Massaguaçu?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsgId = 'user-' + Date.now();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: q }]);
    setInput('');
    setIsTyping(true);

    try {
      // Chama o endpoint serverless do Next.js
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      if (!res.ok) throw new Error('Falha na resposta');

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: 'jacquin-' + Date.now(),
          sender: 'jacquin',
          text: data.reply,
          restaurantCard: data.restaurantCard
        }
      ]);
    } catch {
      // Fallback inteligente offline
      const lower = q.toLowerCase();
      let found = INITIAL_RESTAURANTS[0];
      if (lower.includes('centro') || lower.includes('azul') || lower.includes('vegano')) {
        found = INITIAL_RESTAURANTS[1];
      } else if (lower.includes('indaiá') || lower.includes('camarão') || lower.includes('carne')) {
        found = INITIAL_RESTAURANTS[2];
      } else if (lower.includes('massaguaçu') || lower.includes('tainha')) {
        found = INITIAL_RESTAURANTS[3];
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'jacquin-' + Date.now(),
          sender: 'jacquin',
          text: `Eita parceiro! Consultei aqui as LLMs regionais de Caraguá! Pra essa pedida, sua melhor escolha é no ${found.neighborhood}:`,
          restaurantCard: {
            id: found.id,
            name: found.name,
            neighborhood: found.neighborhood,
            dish: found.dishes[0]?.name || "Especialidade Caiçara",
            price: found.dishes[0]?.price || 65.0,
            rating: found.decayedRatingAverage,
            foodSafety: found.foodSafetyScore
          }
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md transition-all">
      <div className="w-full sm:max-w-lg h-[85vh] sm:h-[650px] bg-slate-900/95 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Header do Drawer */}
        <div className="p-4 bg-gradient-to-r from-teal-950/80 via-slate-900 to-sky-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JacquinPraianoAvatar size={46} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Jacquin Praiano</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-semibold flex items-center gap-1 border border-teal-500/30">
                  <Sparkles className="w-3 h-3" /> IA Caiçara
                </span>
              </div>
              <p className="text-xs text-slate-400">RAG de 5 Estágios • Caraguatatuba/SP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-md shadow-sky-600/20'
                    : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/60 shadow-lg'
                }`}
              >
                {m.text}

                {/* Card de Restaurante embutido na resposta */}
                {m.restaurantCard && (
                  <div
                    onClick={() => onSelectRestaurant && onSelectRestaurant(m.restaurantCard!.id)}
                    className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-teal-500/40 hover:border-teal-400 transition cursor-pointer flex flex-col gap-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-teal-300 transition">
                          {m.restaurantCard.name}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-400" /> {m.restaurantCard.neighborhood}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {m.restaurantCard.rating}★
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 rounded-lg text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-medium truncate mr-2">
                        🍤 {m.restaurantCard.dish}
                      </span>
                      <span className="text-teal-400 font-bold shrink-0">
                        R$ {m.restaurantCard.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Food Safety {m.restaurantCard.foodSafety}%
                      </span>
                      <span className="text-sky-400 flex items-center font-medium group-hover:translate-x-1 transition">
                        Ver Cardápio <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-3 rounded-2xl w-fit border border-slate-700/40">
              <JacquinPraianoAvatar size={24} />
              <span className="animate-pulse">Jacquin Praiano está analisando as 5 regiões...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs text-slate-300 hover:text-white whitespace-nowrap border border-slate-700/60 transition shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao Jacquin Praiano sobre comida em Caraguá..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 disabled:opacity-50 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
