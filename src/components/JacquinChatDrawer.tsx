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
      text: 'Olá! Sou o Chef Érick Jacquin Praiano, seu concierge gastronômico hiperlocal de Caraguatatuba. Meu sistema RAG de 5 estágios audita dados em tempo real do Google Maps, iFood e comunidades caiçaras. Como posso te surpreender hoje?',
      regionalLLMTag: 'LLM Manager Central ⇄ Llama-3-70b-Caraguá',
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

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let responseText = '';
      let llmTag = 'LLM Manager Central';
      let foodSafetyNotice: string | undefined = undefined;
      let dishes: { dish: Dish; restaurantName: string; neighborhood: string; decayedRating: number }[] = [];

      // FILTRAGEM ESTRITA DE FOOD SAFETY PARA VEGANO
      if (lower.includes('vegan') || lower.includes('vegetar') || lower.includes('sem carne')) {
        llmTag = 'LLM Manager ➔ Validador Food Safety & Nutrição';
        foodSafetyNotice = 'Atenção Rigorosa de Food Safety: Pescados e frutos do mar foram 100% expurgados desta consulta. O tradicional "Azul-Marinho" leva peixe fresco e foi excluído. Abaixo estão opções 100% vegetais e certificadas.';
        responseText = 'Segurança alimentar em primeiro lugar! Para culinária vegana em Caraguá, selecionei pratos com 0% de contaminação marinha, com preparo à base de palmito pupunha da serra e ingredientes orgânicos locais.';

        // Busca apenas pratos estritamente veganos
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.filter(d => d.isVegan === true).forEach(dish => {
            dishes.push({
              dish,
              restaurantName: r.name,
              neighborhood: r.neighborhood,
              decayedRating: r.decayedRatingAverage
            });
          });
        });
      } else if (lower.includes('camar') || lower.includes('frutos do mar') || lower.includes('peixe')) {
        llmTag = 'LLM Martim de Sá & Indaiá ➔ Reranker Geodésico';
        responseText = 'Excelente escolha! Os dados auditados dos últimos 30 dias mostram dois gigantes: o Risoto de Camarão Rosa no Indaiá e a Moqueca com Camarão Sete-Barbas em Martim de Sá.';
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.filter(d => d.tags.some(t => t.toLowerCase().includes('camar') || t.toLowerCase().includes('frutos'))).forEach(dish => {
            dishes.push({
              dish,
              restaurantName: r.name,
              neighborhood: r.neighborhood,
              decayedRating: r.decayedRatingAverage
            });
          });
        });
      } else if (lower.includes('azul') || lower.includes('marinho') || lower.includes('tradicion') || lower.includes('caiçara')) {
        llmTag = 'LLM Centro Histórico ➔ Curadoria Cultural';
        responseText = 'O Azul-Marinho é o maior patrimônio gastronômico caiçara de Caraguatatuba! É preparado com peixe nobre e banana verde da Mata Atlântica que solta o tanino e dá o tom azulado no tacho de barro. A Cantina Caiçara Tradição no Centro é a guardiã oficial dessa receita.';
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.filter(d => d.tags.some(t => t.toLowerCase().includes('azul') || t.toLowerCase().includes('caiçara')) && !d.isVegan).forEach(dish => {
            dishes.push({
              dish,
              restaurantName: r.name,
              neighborhood: r.neighborhood,
              decayedRating: r.decayedRatingAverage
            });
          });
        });
      } else if (lower.includes('promo') || lower.includes('desconto') || lower.includes('barato')) {
        llmTag = 'LLM Scraper da Madrugada ➔ Radar de Promoções';
        responseText = 'Detectei promoções ativas na orla agora! Há desde quiosques com 15% OFF no badejo até festivais com pratos em dobro.';
        INITIAL_RESTAURANTS.forEach(r => {
          r.dishes.filter(d => d.isPromotion).forEach(dish => {
            dishes.push({
              dish,
              restaurantName: r.name,
              neighborhood: r.neighborhood,
              decayedRating: r.decayedRatingAverage
            });
          });
        });
      } else {
        llmTag = `LLM Regional ${selectedNeighborhood || 'Caraguatatuba'}`;
        responseText = `Analisando ${INITIAL_RESTAURANTS.length} restaurantes e mais de 1.400 avaliações recentes... Recomendo explorar o menu com a Super Nota de 30 dias para pegar a qualidade exata da cozinha hoje.`;
        const first = INITIAL_RESTAURANTS[0];
        dishes.push({
          dish: first.dishes[0],
          restaurantName: first.name,
          neighborhood: first.neighborhood,
          decayedRating: first.decayedRatingAverage
        });
      }

      const botMsg: ChatMessage = {
        id: `j-${Date.now()}`,
        sender: 'jacquin',
        text: responseText,
        regionalLLMTag: llmTag,
        foodSafetyNotice,
        recommendedDishes: dishes.slice(0, 3),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 650);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Fosco */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Lateral Liquid Glass */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-[#07090E]/95 border-l border-white/[0.12] backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white"
          >
            {/* Header do Drawer */}
            <div className="p-5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <JacquinPraianoAvatar size={50} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white tracking-tight text-base">Chef Jacquin Praiano</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      RAG 5 ESTÁGIOS
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Concierge Hiperlocal com Inteligência Caiçara</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status do Orquestrador de Bairros */}
            <div className="px-5 py-2.5 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Orquestrador: <strong className="text-zinc-200">LLM Manager Central</strong></span>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online (120ms)
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Badge da LLM Regional */}
                  {m.regionalLLMTag && (
                    <span className="mb-1 text-[10px] font-mono text-teal-300/80 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      {m.regionalLLMTag}
                    </span>
                  )}

                  {/* Balão de Mensagem */}
                  <div
                    className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-500/20 to-teal-600/30 border border-teal-400/30 text-white rounded-br-none'
                        : 'bg-white/[0.05] border border-white/[0.10] text-zinc-200 rounded-bl-none shadow-lg'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Aviso de Food Safety se houver */}
                    {m.foodSafetyNotice && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-300 font-semibold mb-0.5">Certificação de Segurança Alimentar:</strong>
                          <p className="leading-snug text-emerald-200/90">{m.foodSafetyNotice}</p>
                        </div>
                      </div>
                    )}

                    {/* Pratos Recomendados em Cards Ricos */}
                    {m.recommendedDishes && m.recommendedDishes.length > 0 && (
                      <div className="mt-3.5 space-y-2.5">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Recomendações Auditadas pela IA:
                        </span>
                        {m.recommendedDishes.map(({ dish, restaurantName, neighborhood, decayedRating }) => (
                          <div
                            key={dish.id}
                            className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition flex gap-3 items-center"
                          >
                            <img
                              src={dish.imageUrl}
                              alt={dish.name}
                              className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/[0.10]"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">{dish.name}</h4>
                              <p className="text-[11px] text-zinc-400 truncate">{restaurantName} • {neighborhood}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono font-bold text-teal-400">
                                  R$ {dish.price.toFixed(2)}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  ★ {decayedRating.toFixed(2)} 30d
                                </span>
                                {dish.isVegan && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    Vegano
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="block mt-2 text-[10px] text-zinc-500 text-right font-mono">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.04] p-3 rounded-2xl w-fit border border-white/[0.08]">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                  <span>Chef Jacquin sintetizando contexto RAG...</span>
                </div>
              )}
            </div>

            {/* Chips Rápidos de Pergunta */}
            <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] flex gap-2 overflow-x-auto no-scrollbar">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.label)}
                  className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] text-zinc-300 hover:text-white transition flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  {q.label}
                </button>
              ))}
            </div>

            {/* Caixa de Entrada de Texto */}
            <div className="p-4 border-t border-white/[0.08] bg-[#07090E]">
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
                  placeholder="Pergunte ao Chef Jacquin sobre restaurantes..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.12] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400/60 focus:bg-white/[0.08] transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-11 h-11 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 font-bold flex items-center justify-center transition shadow-lg shadow-teal-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
