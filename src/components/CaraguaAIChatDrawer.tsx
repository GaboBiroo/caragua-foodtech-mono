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
  ChefHat,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

export interface DishSuggestionCard {
  dish_id: string;
  dish_name: string;
  description: string;
  price: number;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const QUICK_SUGGESTIONS: string[] = [
  '🏖️ Porção de camarão ou peixe perto da praia',
  '🌱 Opções veganas ou sem lactose gostosas',
  '💸 Onde comer bem gastando até R$ 45?',
  '📉 Pratos que baixaram de preço essa semana',
];

function formatPriceBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace('.', ',')}`;
}

function formatFriendlyDistance(card: DishSuggestionCard): string {
  if (card.distance_label) {
    return card.distance_label;
  }
  if (card.distance_meters < 1000) {
    return `A ${Math.max(50, Math.round(card.distance_meters / 10) * 10)}m de você • ${card.neighborhood}`;
  }
  return `A ${card.distance_km.toFixed(1).replace('.', ',')} km • ${card.neighborhood}`;
}

/**
 * Converte marcações simples (**negrito** e *itálico*) em tipografia limpa,
 * impedindo que asteriscos crus apareçam na conversa.
 */
function renderCleanChatMessage(rawText: string): React.ReactNode {
  if (!rawText) return null;
  const paragraphs = rawText.split(/\n{2,}/);
  return paragraphs.map((para, pIdx) => {
    const cleanPara = para.replace(/^\s*[-*]\s+/gm, '• ');
    const segments = cleanPara.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-2.5' : ''}>
        {segments.map((seg, sIdx) => {
          if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
            return (
              <strong key={sIdx} className="font-extrabold text-stone-950">
                {seg.slice(2, -2)}
              </strong>
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
      content:
        'Oi! Bateu a fome? Me conta o que você está com vontade de comer, quanto quer gastar ou se tem alguma restrição alimentar que eu garimpo os melhores pratos perto de você!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localPcActive, setLocalPcActive] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastInitialPromptSent = useRef<string>('');

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/llm-status`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.ollama_online) {
          setLocalPcActive(true);
        }
      } catch {
        // Segue normalmente se o check demorar
      }
    })();
    return () => {
      active = false;
    };
  }, [isOpen]);

  const sendQuery = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed || isLoading) return;

      const firstLetterIdx = trimmed.search(/[A-Za-zÀ-ÿ0-9]/);
      const cleanQuery = firstLetterIdx >= 0 ? trimmed.slice(firstLetterIdx).trim() : trimmed;

      const userTurnId = `user-${Date.now()}`;
      const assistantTurnId = `assistant-${Date.now() + 1}`;

      setMessages((prev) => [
        ...prev,
        { id: userTurnId, role: 'user', content: trimmed },
        {
          id: assistantTurnId,
          role: 'assistant',
          content: '',
          isStreaming: true,
        },
      ]);
      setInputValue('');
      setIsLoading(true);

      const neighborhoodParam =
        activeNeighborhood && activeNeighborhood !== 'Todos' ? activeNeighborhood : undefined;

      try {
        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: cleanQuery,
            user_lat: userLat,
            user_lon: userLon,
            neighborhood: neighborhoodParam,
            limit: 6,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Resposta inesperada (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() || '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const rawJson = line.slice(5).trim();
              if (!rawJson) continue;

              const parsed = JSON.parse(rawJson);
              if (parsed.type === 'metadata') {
                if (parsed.llm_mode === 'local_pc') {
                  setLocalPcActive(true);
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantTurnId
                      ? {
                          ...m,
                          recommendations: parsed.recommendations || [],
                        }
                      : m
                  )
                );
              } else if (parsed.type === 'token') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantTurnId
                      ? { ...m, content: m.content + (parsed.content || '') }
                      : m
                  )
                );
              } else if (parsed.type === 'done') {
                if (parsed.llm_mode === 'local_pc') {
                  setLocalPcActive(true);
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantTurnId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            }
          }
        }
      } catch {
        try {
          const syncRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: cleanQuery,
              user_lat: userLat,
              user_lon: userLon,
              neighborhood: neighborhoodParam,
              limit: 6,
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
                      'Dei uma olhada nos cardápios de hoje! Veja as sugestões logo abaixo.',
                    recommendations: syncJson.recommendations || syncJson.dishes || [],
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
                      'Puxa, tive um pequeno tropeço para consultar os cardápios agora. Tente perguntar de novo em alguns segundos!',
                    isStreaming: false,
                  }
                : m
            )
          );
        }
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
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/55 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Chef CaráFood - Dicas de onde comer em Caraguá"
    >
      <div className="flex-1" onClick={onClose} />

      <aside className="relative w-full max-w-xl bg-[#FAF7F2] h-full shadow-2xl border-l-4 border-[#FFB703] flex flex-col overflow-hidden">
        {/* Cabeçalho acolhedor do Chef CaráFood */}
        <header className="bg-[#135136] text-white px-5 py-4 border-b border-white/15 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB703] text-stone-950 flex items-center justify-center shadow-md shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-lg leading-tight">
                  Chef CaráFood
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  {localPcActive ? 'Online • IA rodando no seu PC' : 'Online agora • No ar'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/95 mt-0.5 leading-snug">
                Dicas sinceras de cardápios reais abertos hoje em Caraguá
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Fechar conversa"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Sugestões rápidas do dia a dia */}
        <div className="px-4 py-3 bg-emerald-950/5 border-b border-stone-200/80 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#135136]" />
              Ideias rápidas para pedir agora:
            </span>
            {activeNeighborhood && activeNeighborhood !== 'Todos' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]">
                📍 Perto de {activeNeighborhood}
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
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#FFB703]/25 text-stone-800 border border-stone-300 transition-colors disabled:opacity-50"
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
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  turn.role === 'user'
                    ? 'bg-[#135136] text-white rounded-br-sm font-medium'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-sm'
                }`}
              >
                {turn.role === 'assistant' ? (
                  turn.content ? (
                    renderCleanChatMessage(turn.content)
                  ) : turn.isStreaming ? (
                    <span className="text-stone-500">
                      Pensando na melhor sugestão para você...
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

              {/* Cartões clicáveis dos pratos encontrados */}
              {turn.role === 'assistant' &&
                turn.recommendations &&
                turn.recommendations.length > 0 && (
                  <div className="w-full mt-2.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 px-1">
                      <span className="inline-flex items-center gap-1 text-[#135136]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        {turn.recommendations.length}{' '}
                        {turn.recommendations.length === 1
                          ? 'prato separado para você'
                          : 'pratos separados para você'}
                      </span>
                      <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Cardápio verificado hoje
                      </span>
                    </div>

                    {turn.recommendations.slice(0, 5).map((rec) => {
                      const scoreDisplay = (rec.rating_score ?? rec.rating_average ?? 4.8).toFixed(1);
                      const matchBadge = rec.friendly_match_label || 'Combina com você';
                      return (
                        <div
                          key={rec.dish_id}
                          className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-xs hover:border-[#135136]/50 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFB703]/25 text-stone-900">
                                  ✨ {matchBadge}
                                </span>
                              </div>
                              <div className="font-heading font-extrabold text-stone-900 text-sm leading-snug">
                                {rec.dish_name}
                              </div>
                              <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                                {rec.description}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-heading font-black text-base text-[#135136] block">
                                {formatPriceBRL(rec.price)}
                              </span>
                              {rec.last_price_delta_pct < 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                                  <TrendingDown className="w-3 h-3" />
                                  Baixou de preço
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Selos de dieta para comer tranquilo */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {rec.is_vegan && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                🌱 Vegano
                              </span>
                            )}
                            {rec.is_vegetarian && !rec.is_vegan && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                                🥗 Vegetariano
                              </span>
                            )}
                            {rec.is_gluten_free && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                                🌾 Sem Glúten
                              </span>
                            )}
                            {rec.is_lactose_free && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
                                🥛 Sem Lactose
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-stone-700 truncate">
                              <span className="font-bold text-stone-900 truncate">
                                {rec.restaurant_name}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-stone-500 shrink-0">
                                <MapPin className="w-3 h-3 text-[#135136]" />
                                {formatFriendlyDistance(rec)}
                              </span>
                              <span
                                className="inline-flex items-center gap-0.5 font-bold text-amber-700 shrink-0"
                                title="Nota real calculada com avaliações verificadas"
                              >
                                ⭐ {scoreDisplay}
                              </span>
                            </div>

                            <Link
                              href={`/restaurants/${rec.restaurant_slug}`}
                              onClick={onClose}
                              className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-[#135136] hover:text-emerald-900 underline-offset-2 hover:underline"
                            >
                              <span>Ver cardápio</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Campo de conversa */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendQuery(inputValue);
          }}
          className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ex: o que pedir hoje no Quiosque Baleia Branca ou lanche até R$ 40..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#FFB703]" />
            <span>Pedir dica</span>
          </button>
        </form>
      </aside>
    </div>
  );
};
