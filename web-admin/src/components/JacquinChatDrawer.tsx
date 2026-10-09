'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JacquinPraianoAvatar } from './JacquinPraianoAvatar';
import { X, Send, Sparkles, ShieldCheck, MapPin, Star, Utensils, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { INITIAL_RESTAURANTS, Dish, RestaurantItem } from '../data/caraguaData';

interface JacquinChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNeighborhood: string;
}

interface ChatMessage {
  id: string;
  sender: 'jacquin' | 'user';
  text: string;
  regionalLLMTag?: string;
  timestamp: string;
  foodSafetyNotice?: string;
  recommendedDishes?: {
    dish: Dish;
    restaurantName: string;
    neighborhood: string;
    decayedRating: number;
  }[];
}

export const JacquinChatDrawer: React.FC<JacquinChatDrawerProps> = ({
  isOpen,
  onClose,
  selectedNeighborhood,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-initial',
      sender: 'jacquin',
      text: 'Olá! Sou o Chef Jacquin Praiano, seu concierge gastronômico hiperlocal de Caraguatatuba. Meu sistema RAG de 5 estágios audita dados em tempo real do Google Maps, iFood e pescadores caiçaras. O que você gostaria de saborear hoje?',
      regionalLLMTag: 'LLM Manager Central ⇄ RAG 5 Estágios',
      timestamp: 'Agora'
    }
  ]);

  const quickPrompts = [
    { label: 'Qual o melhor camarão de Caraguá?', query: 'camarão' },
    { label: 'Onde comer Azul-Marinho tradicional?', query: 'azul-marinho' },
    { label: 'Opções 100% veganas e seguras', query: 'vegano' },
    { label: 'Melhores promoções ativas agora', query: 'promoção' },
  ];

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Motor de Síntese RAG Simulado
    setTimeout(() => {
      const q = userText.toLowerCase();
      let replyText = '';
      let llmTag = 'LLM Manager Central • RAG Caraguá';
      let foodSafetyNotice: string | undefined = undefined;
      let recs: { dish: Dish; restaurantName: string; neighborhood: string; decayedRating: number }[] = [];

      if (q.includes('vegano') || q.includes('vegetar') || q.includes('sem carne')) {
        llmTag = 'LLM Regional Indaiá (Especialista Vegano & Orgânico)';
        foodSafetyNotice = '100% Livre de pescados ou carnes. Validado pelo Guardrail de Food Safety.';
        replyText = 'Mon ami, alimentação consciente é coisa séria! Recomendo a espetacular Moqueca Vegana de Palmito Pupunha da Cantina Caiçara Tradição e o Bowl Caiçara do Empório Verde Mar. Sem nenhum traço de peixe!';
        
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.forEach(d => {
            if (d.isVegan) {
              recs.push({ dish: d, restaurantName: r.name, neighborhood: r.neighborhood, decayedRating: r.decayedRatingAverage });
            }
          });
        });
      } else if (q.includes('azul') || q.includes('marinho') || q.includes('tradicional')) {
        llmTag = 'LLM Regional Centro Histórico (Patrimônio & Tradição)';
        replyText = 'O autêntico Azul-Marinho caiçara é feito com peixe fresco cozido na panela de barro com banana verde nanica, que confere o tom azulado natural à calda de pirão. A Cantina Tradição no Centro prepara com nota 4.94 ★!';
        
        const rTrad = INITIAL_RESTAURANTS.find(r => r.id === 'rest-centro-cantina');
        if (rTrad) {
          const dAzul = rTrad.dishes.find(d => d.id === 'd-4-azul');
          if (dAzul) recs.push({ dish: dAzul, restaurantName: rTrad.name, neighborhood: rTrad.neighborhood, decayedRating: rTrad.decayedRatingAverage });
        }
      } else if (q.includes('camar') || q.includes('frutos') || q.includes('peixe')) {
        llmTag = 'LLM Regional Martim de Sá & Indaiá';
        replyText = 'Para frutos do mar com frescor absoluto, o Risoto de Camarão Rosa do Mar & Terra Gourmet (Indaiá) e o Camarão Sete-Barbas do Quiosque Canto Bravo (Martim de Sá) têm os maiores spikes de qualidade nas últimas 48h!';
        
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.forEach(d => {
            if (d.category.includes('Mar') && !d.isVegan && recs.length < 3) {
              recs.push({ dish: d, restaurantName: r.name, neighborhood: r.neighborhood, decayedRating: r.decayedRatingAverage });
            }
          });
        });
      } else {
        replyText = `Com base nas 1.420 avaliações sincronizadas e na proximidade com ${selectedNeighborhood === 'todos' ? 'Caraguatatuba' : selectedNeighborhood}, os estabelecimentos auditados garantem o melhor frescor costeiro. Posso te indicar pratos por tipo de culinária ou promoções ativas!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `j-${Date.now()}`,
          sender: 'jacquin',
          text: replyText,
          regionalLLMTag: llmTag,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          foodSafetyNotice,
          recommendedDishes: recs.slice(0, 2)
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Escuro Suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B2B26]/30 backdrop-blur-sm z-50"
          />

          {/* Drawer Flutuante Lateral */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[#E2D9CC]"
          >
            {/* Header com Avatar do Jacquin */}
            <div className="p-5 border-b border-[#E2D9CC] flex items-center justify-between bg-[#F6F2EB]">
              <div className="flex items-center gap-3.5">
                <JacquinPraianoAvatar size={50} interactive={false} />
                <div>
                  <h3 className="font-bold text-[#18181B] text-base leading-tight">
                    Chef Jacquin Praiano
                  </h3>
                  <p className="text-xs text-[#0D9488] font-mono font-semibold">
                    Concierge RAG 5 Estágios
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-white transition-colors"
                aria-label="Fechar drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pílulas de Status dos 5 Estágios */}
            <div className="px-5 py-2.5 bg-[#EDE6DC]/50 border-b border-[#E2D9CC] flex items-center justify-between text-[11px] font-mono text-[#52525B]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RAG Pipeline Operacional</span>
              </div>
              <span>Caraguá • SP</span>
            </div>

            {/* Histórico de Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-[#0B2B26] text-[#F6F2EB] rounded-br-none shadow-sm'
                        : 'bg-[#F0FDFA] text-[#18181B] border border-[#99F6E4] rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.regionalLLMTag && (
                      <span className="block text-[10px] font-mono font-bold text-[#0D9488] uppercase tracking-wide">
                        {msg.regionalLLMTag}
                      </span>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {msg.foodSafetyNotice && (
                      <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#065F46] flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                        <span>{msg.foodSafetyNotice}</span>
                      </div>
                    )}

                    {/* Pratos Recomendados */}
                    {msg.recommendedDishes && msg.recommendedDishes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#99F6E4]/60">
                        {msg.recommendedDishes.map(({ dish, restaurantName, decayedRating }) => (
                          <div
                            key={dish.id}
                            className="p-2.5 rounded-xl bg-white border border-[#E2D9CC] flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-[11px] text-[#18181B] truncate">
                                {dish.name}
                              </p>
                              <p className="text-[10px] text-[#71717A]">
                                {restaurantName} • R$ {dish.price.toFixed(2)}
                              </p>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-[#0D9488]">
                              {decayedRating.toFixed(2)} ★
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#71717A] mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] w-fit">
                  <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Chips de Perguntas Rápidas */}
            <div className="p-3 bg-[#F6F2EB] border-t border-[#E2D9CC] overflow-x-auto no-scrollbar flex gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.query)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#E2D9CC] text-[11px] font-semibold text-[#52525B] hover:text-[#18181B] hover:border-[#D4D4D8] whitespace-nowrap transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input de Envio de Mensagem */}
            <div className="p-4 bg-white border-t border-[#E2D9CC]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Pergunte sobre pratos, quiosques ou peixes..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#EDE6DC]/70 border border-[#E2D9CC] text-xs text-[#18181B] placeholder-[#71717A] focus:outline-none focus:border-[#0D9488] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 rounded-2xl bg-[#0B2B26] text-white hover:bg-[#134E4A] disabled:opacity-40 transition-colors"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
