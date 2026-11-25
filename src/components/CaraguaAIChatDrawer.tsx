'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  Sparkles,
  MapPin,
  TrendingDown,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Utensils,
} from 'lucide-react';

export interface DishSuggestionCard {
  dish_id: string;
  dish_name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  dietary_tags: string[];
  suggested_sides?: string[];
  last_price_delta_pct: number;
  friendly_match_label?: string;
  distance_label?: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  neighborhood: string;
  restaurant_address: string;
  rating_score?: number;
  rating_average?: number;
  distance_meters: number;
  distance_km: number;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chefMood?: string;
  recommendations?: DishSuggestionCard[];
  isStreaming?: boolean;
}

export interface CaraguaAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeNeighborhood?: string;
  initialPrompt?: string;
  userLat?: number;
  userLon?: number;
}

const QUICK_SUGGESTIONS: string[] = [
  '🍱 Marmita perto do Shopping Serramar',
  '🏖️ Porção de camarão ou peixe perto da praia',
  '🍔 Melhor hambúrguer artesanal com muito tompero',
  '🍣 Sushi fresquinho (com freezer ligado!)',
  '💸 Onde comer bem gastando até R$ 35?',
  '🌱 Opções veganas ou sem lactose gostosas',
];

function formatPriceBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace('.', ',')}`;
}

function formatFriendlyDistance(card: DishSuggestionCard): string {
  if (card.distance_label) {
    return card.distance_label;
  }
  if (card.distance_meters < 1000) {
    return `A ${Math.max(50, Math.round(card.distance_meters / 10) * 10)}m • ${card.neighborhood}`;
  }
  return `A ${card.distance_km.toFixed(1).replace('.', ',')} km • ${card.neighborhood}`;
}

/**
 * Converte marcações simples (**negrito** e *itálico*) em tipografia limpa.
 */
function renderCleanChatMessage(rawText: string): React.ReactNode {
  if (!rawText) return null;
  const paragraphs = rawText.split(/\n{2,}/);
  return paragraphs.map((para, pIdx) => {
    const cleanPara = para.replace(/^\s*[-*]\s+/gm, '• ');
    const segments = cleanPara.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
        {segments.map((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
            return (
              <strong key={sIdx} className="font-extrabold text-stone-950">
                {seg.slice(2, -2)}
              </strong>
            );
          }
          if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) {
            return (
              <em key={sIdx} className="italic font-semibold text-[#135136]">
                {seg.slice(1, -1)}
              </em>
            );
          }
          return <React.Fragment key={sIdx}>{seg.replace(/\*/g, '')}</React.Fragment>;
        })}
      </p>
    );
  });
}

export const CaraguaAIChatDrawer: React.FC<CaraguaAIChatDrawerProps> = ({
  isOpen,
  onClose,
  activeNeighborhood,
  initialPrompt,
  userLat = -23.6204,
  userLon = -45.4132,
}) => {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-chef',
      role: 'assistant',
      chefMood: 'Le Chef de Caraguá • Freezer Ligado',
      content:
        '**Bonjour, mon ami!** Eu sou o **Chef Érick Jacquin Praiano**, fiscal oficial das panelas dos 53 bairros de Caraguatatuba! Aqui não tem *vergonha da profission*: eu já inspecionei os **61 restaurantes** e **2.670 pratos reais** da cidade.\n\nMe conta o que você quer comer hoje: uma **marmita perto do Shopping Serramar**, um **peixe na praia**, um **hambúrguer com muito tompero** ou algo que caiba no seu bolso?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastInitialPromptSent = useRef<string>('');

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendQuery = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed || isLoading) return;

      const firstLetterIdx = trimmed.search(/[A-Za-zÀ-ÿ0-9]/);
      const cleanQuery =
        firstLetterIdx >= 0 ? trimmed.slice(firstLetterIdx).trim() : trimmed;

      const userTurnId = `user-${Date.now()}`;
      const assistantTurnId = `assistant-${Date.now() + 1}`;

      setMessages((prev) => [
        ...prev,
        { id: userTurnId, role: 'user', content: trimmed },
        {
          id: assistantTurnId,
          role: 'assistant',
          content: '',
          chefMood: 'Provando o Tompero nas Panelas...',
          isStreaming: true,
        },
      ]);
      setInputValue('');
      setIsLoading(true);

      const neighborhoodParam =
        activeNeighborhood && activeNeighborhood !== 'Todos'
          ? activeNeighborhood
          : undefined;

      try {
        const syncRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: cleanQuery,
            message: cleanQuery,
            user_lat: userLat,
            user_lon: userLon,
            neighborhood: neighborhoodParam,
            limit: 5,
          }),
        });
        const syncJson = await syncRes.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantTurnId
              ? {
                  ...m,
                  content:
                    syncJson.answer ||
                    syncJson.reply ||
                    '**Mon ami**, olha as sugestões com muito *tompero* que eu separei para você aqui embaixo!',
                  chefMood:
                    syncJson.chefMood || 'Tompero Aprovado pelo Chef Jacquin',
                  recommendations:
                    syncJson.recommendations || syncJson.dishes || [],
                  isStreaming: false,
                }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantTurnId
              ? {
                  ...m,
                  content:
                    '**Mon Dieu!** Deu uma pequena fumaça na cozinha agora, *mon ami*. Me pergunta de novo que eu já abro a panela para você!',
                  chefMood: 'Chef Reorganizando a Cozinha',
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeNeighborhood, isLoading, userLat, userLon]
  );

  useEffect(() => {
    if (!isOpen) {
      lastInitialPromptSent.current = '';
      return;
    }
    if (initialPrompt && initialPrompt !== lastInitialPromptSent.current) {
      lastInitialPromptSent.current = initialPrompt;
      void sendQuery(initialPrompt);
    }
  }, [initialPrompt, isOpen, sendQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Chef Érick Jacquin Praiano - Curadoria Gastronômica de Caraguatatuba"
    >
      <div className="hidden sm:block sm:flex-1" onClick={onClose} />

      <aside className="relative w-full sm:max-w-xl bg-[#FAF7F2] h-[100dvh] sm:h-full shadow-2xl sm:border-l-4 border-[#FFB703] flex flex-col overflow-hidden">
        {/* Cabeçalho com Identidade Oficial do Chef Érick Jacquin Praiano */}
        <header className="bg-[#0F382C] text-white px-4 sm:px-5 py-3.5 sm:py-4 border-b-2 border-[#FFB703]/80 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFB703]/20 border-2 border-[#FFB703] p-0.5 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <img
                src="/jacquin-praiano.png"
                alt="Chef Érick Jacquin Praiano"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  data-testid="jacquin-chat-header-title"
                  className="font-heading font-black text-base sm:text-lg leading-tight truncate text-white"
                >
                  Chef Jacquin Praiano
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFB703] text-stone-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  Freezer Ligado
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100/95 mt-0.5 leading-snug truncate">
                &ldquo;Aqui não tem vergonha da profission: só prato com tompero!&rdquo;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
            aria-label="Fechar conversa com Chef Jacquin"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Sugestões rápidas do Chef Jacquin */}
        <div className="px-4 py-2.5 bg-emerald-950/5 border-b border-stone-200/80 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#135136]" />
              Pergunte ao Chef Jacquin agora:
            </span>
            {activeNeighborhood && activeNeighborhood !== 'Todos' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]">
                📍 Filtro: {activeNeighborhood}
              </span>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {QUICK_SUGGESTIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={isLoading}
                onClick={() => void sendQuery(chip)}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-[#FFB703]/25 text-stone-800 border border-stone-300 transition-colors disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Histórico da conversa */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((turn) => (
            <div
              key={turn.id}
              className={`flex flex-col ${
                turn.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {turn.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <img
                    src="/jacquin-praiano.png"
                    alt="Chef Jacquin"
                    className="w-6 h-6 rounded-full bg-[#0F382C] border border-[#FFB703] object-contain p-0.5"
                  />
                  <span className="text-[11px] font-heading font-black text-[#0F382C]">
                    Chef Érick Jacquin Praiano
                  </span>
                  {turn.chefMood && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                      {turn.chefMood}
                    </span>
                  )}
                </div>
              )}

              <div
                data-testid={
                  turn.role === 'assistant'
                    ? 'jacquin-assistant-bubble'
                    : 'jacquin-user-bubble'
                }
                className={`max-w-[94%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  turn.role === 'user'
                    ? 'bg-[#135136] text-white rounded-br-sm font-medium'
                    : 'bg-white text-stone-800 border-2 border-[#FFB703]/45 rounded-tl-sm'
                }`}
              >
                {turn.role === 'assistant' ? (
                  turn.content ? (
                    renderCleanChatMessage(turn.content)
                  ) : turn.isStreaming ? (
                    <span className="text-stone-600 font-medium">
                      <em>&ldquo;Un moment, mon ami... Estou olhando as panelas e conferindo o tompero!&rdquo;</em>
                    </span>
                  ) : null
                ) : (
                  turn.content
                )}
                {turn.isStreaming && (
                  <span className="inline-flex items-center gap-1 ml-1.5 align-middle text-xs font-bold text-[#135136]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </span>
                )}
              </div>

              {/* Cartões ricos e clicáveis dos pratos selecionados pelo Chef Jacquin */}
              {turn.role === 'assistant' &&
                turn.recommendations &&
                turn.recommendations.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 px-1">
                      <span className="inline-flex items-center gap-1 text-[#135136]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        {turn.recommendations.length}{' '}
                        {turn.recommendations.length === 1
                          ? 'prato aprovado pelo Chef Jacquin'
                          : 'pratos aprovados pelo Chef Jacquin'}
                      </span>
                      <span className="text-stone-900 bg-[#FFB703]/35 px-2 py-0.5 rounded-full font-extrabold">
                        Selo Tompero Real
                      </span>
                    </div>

                    {turn.recommendations.slice(0, 5).map((rec) => {
                      const scoreDisplay = (
                        rec.rating_score ??
                        rec.rating_average ??
                        4.8
                      ).toFixed(1);
                      const matchBadge =
                        rec.friendly_match_label || 'Aprovado pelo Chef';
                      return (
                        <div
                          key={rec.dish_id}
                          data-testid="jacquin-recommendation-card"
                          className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs hover:border-[#135136]/60 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {rec.image_url && (
                              <img
                                src={rec.image_url}
                                alt={rec.dish_name}
                                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200 bg-stone-100"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFB703]/30 text-stone-900 mb-1">
                                    👨‍🍳 {matchBadge}
                                  </span>
                                  <div className="font-heading font-extrabold text-stone-900 text-sm leading-snug">
                                    {rec.dish_name}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-heading font-black text-base text-[#135136] block">
                                    {formatPriceBRL(rec.price)}
                                  </span>
                                  {rec.last_price_delta_pct < 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                      <TrendingDown className="w-3 h-3" />
                                      Baixou
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                                {rec.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-2 text-stone-700 min-w-0">
                              <span className="font-bold text-stone-900 truncate">
                                {rec.restaurant_name}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-stone-500 shrink-0">
                                <MapPin className="w-3 h-3 text-[#135136]" />
                                {formatFriendlyDistance(rec)}
                              </span>
                              <span className="inline-flex items-center gap-0.5 font-bold text-amber-700 shrink-0">
                                ⭐ {scoreDisplay}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/prato/${rec.dish_id}`}
                                onClick={onClose}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#135136] hover:bg-[#0F382C] text-white text-[11px] font-bold transition-colors"
                              >
                                <Utensils className="w-3 h-3 text-[#FFB703]" />
                                <span>Ver Prato</span>
                              </Link>
                              <Link
                                href={`/restaurants/${rec.restaurant_slug}`}
                                onClick={onClose}
                                className="inline-flex items-center gap-0.5 text-xs font-extrabold text-[#135136] hover:underline"
                              >
                                <span>Cardápio</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Campo de conversa com o Chef Jacquin */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendQuery(inputValue);
          }}
          className="p-3 sm:p-3.5 pb-safe-bottom bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            data-testid="jacquin-chat-input"
            placeholder="Pergunte ao Jacquin: ex. marmita perto do shopping serramar..."
            disabled={isLoading}
            className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            data-testid="jacquin-chat-submit"
            className="shrink-0 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#0F382C] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <Send className="w-4 h-4 text-[#FFB703]" />
            <span className="hidden sm:inline">Perguntar ao Chef</span>
            <span className="sm:hidden">Enviar</span>
          </button>
        </form>
      </aside>
    </div>
  );
};
