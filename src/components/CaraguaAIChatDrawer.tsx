'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  Send,
  Sparkles,
  MapPin,
  Star,
  TrendingDown,
  ShieldCheck,
  ArrowUpRight,
  Cpu,
  RotateCcw,
  Utensils,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface RRFBreakdown {
  svl_rrf_score: number;
  k_vec: number;
  k_geo: number;
  k_lex: number;
  semantic_similarity: number;
  lexical_similarity: number;
}

export interface SVLRRFRecommendation {
  dish_id: string;
  dish_name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string | null;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  dietary_tags: string[];
  smart_defaults: string[];
  last_price_delta_pct: number;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  neighborhood: string;
  restaurant_address: string;
  bayesian_rating: number;
  rating_average: number;
  review_count: number;
  distance_meters: number;
  distance_km: number;
  rrf_breakdown: RRFBreakdown;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  latencyMs?: number;
  candidatesCount?: number;
  recommendations?: SVLRRFRecommendation[];
}

interface CaraguaAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeNeighborhood?: string;
  initialPrompt?: string;
  userLat?: number;
  userLon?: number;
}

const HYPERLOCAL_SUGGESTED_PROMPTS: string[] = [
  'Onde comer peixe ou camarão fresco em Martim de Sá ou Centro?',
  'Quais opções veganas ou sem glúten estão disponíveis hoje até R$ 60?',
  'Mostre pratos que tiveram queda de preço auditada recentemente.',
];

export const CaraguaAIChatDrawer: React.FC<CaraguaAIChatDrawerProps> = ({
  isOpen,
  onClose,
  activeNeighborhood,
  initialPrompt,
  userLat = -23.6204,
  userLon = -45.4132,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-svl-rrf',
      role: 'assistant',
      content:
        'Olá! Sou o Assistente Gastronômico Hiperlocal do CaráFood. Opero com fusão híbrida SVL-RRF sobre PostgreSQL 16 (PostGIS + pgvector 1536d + pg_trgm), respeitando travas estritas de segurança alimentar e preços reais auditados nos 53 bairros de Caraguatatuba. O que você deseja saborear hoje?',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastInitialPromptRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendQuery = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || isLoading) return;

      const userMsgId = `usr-${Date.now()}`;
      const assistantMsgId = `ast-${Date.now() + 1}`;

      setInputValue('');
      setIsLoading(true);

      setMessages((prev) =>
        prev.concat([
          { id: userMsgId, role: 'user', content: trimmed },
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            recommendations: [],
          },
        ])
      );

      const requestBody = {
        query: trimmed,
        user_lat: userLat,
        user_lon: userLon,
        neighborhood:
          activeNeighborhood && activeNeighborhood !== 'todos' ? activeNeighborhood : null,
        limit: 6,
      };

      try {
        const response = await fetch(`${API_BASE}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let sseBuffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const frames = sseBuffer.split('\n\n');
          sseBuffer = frames.pop() || '';

          for (const frame of frames) {
            const lines = frame.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data:')) continue;
              const rawJson = line.slice(5).trim();
              if (!rawJson) continue;

              const evt = JSON.parse(rawJson);
              if (evt.type === 'metadata') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          latencyMs: evt.latency_ms,
                          candidatesCount: evt.candidates_count,
                          recommendations: Array.isArray(evt.recommendations)
                            ? evt.recommendations
                            : [],
                        }
                      : m
                  )
                );
              } else if (evt.type === 'token') {
                const tokenText = String(evt.content || '');
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + tokenText }
                      : m
                  )
                );
              } else if (evt.type === 'done') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m
          )
        );
      } catch {
        // Fallback resiliente síncrono via /api/v1/chat/query
        try {
          const syncRes = await fetch(`${API_BASE}/chat/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          if (!syncRes.ok) {
            throw new Error(`Status ${syncRes.status}`);
          }
          const syncData = await syncRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      syncData.answer ||
                      'Consulta processada com sucesso no catálogo SVL-RRF.',
                    isStreaming: false,
                    latencyMs: syncData.latency_ms,
                    candidatesCount: syncData.candidates_count,
                    recommendations: Array.isArray(syncData.recommendations)
                      ? syncData.recommendations
                      : [],
                  }
                : m
            )
          );
        } catch {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      'Não foi possível conectar ao servidor FastAPI local (porta 8000). Verifique se o backend está em execução.',
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
    if (isOpen && initialPrompt && initialPrompt !== lastInitialPromptRef.current) {
      lastInitialPromptRef.current = initialPrompt;
      void sendQuery(initialPrompt);
    }
  }, [isOpen, initialPrompt, sendQuery]);

  const handleResetConversation = () => {
    lastInitialPromptRef.current = '';
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Conversa reiniciada! Escolha uma sugestão hiperlocal abaixo ou pergunte por pratos, bairros de Caraguatatuba, faixa de preço ou restrições alimentares.',
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Assistente Gastronômico IA SVL-RRF"
    >
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      <aside className="relative w-full max-w-xl bg-[#FAF7F2] h-full shadow-2xl border-l-2 border-[#135136]/30 flex flex-col overflow-hidden">
        {/* Cabeçalho do Drawer */}
        <header className="bg-[#135136] text-white px-5 py-4 border-b-2 border-[#FFB703] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB703]/20 border border-[#FFB703]/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#FFB703]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg leading-tight text-white">
                  Assistente IA Hiperlocal
                </h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900 text-[#FFB703] border border-[#FFB703]/40">
                  SVL-RRF • SSE
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>PostGIS + pgvector 1536d + Trava SQL Dietética</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetConversation}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-colors"
              title="Limpar conversa"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-colors"
              aria-label="Fechar Assistente IA"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sugestões Hiperlocais Clicáveis */}
        <div className="bg-emerald-950/5 border-b border-stone-200 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#135136]">
              Consultas Hiperlocais Sugeridas
            </span>
            {activeNeighborhood && activeNeighborhood !== 'todos' && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Foco: {activeNeighborhood}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HYPERLOCAL_SUGGESTED_PROMPTS.map((promptText) => (
              <button
                key={promptText}
                type="button"
                disabled={isLoading}
                onClick={() => void sendQuery(promptText)}
                className="text-left text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-[#135136] text-stone-800 hover:text-white border border-stone-300 hover:border-[#135136] transition-all shadow-sm disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Histórico de Mensagens & Cards SVL-RRF */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-[#135136] text-white rounded-br-sm'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && msg.latencyMs !== undefined && (
                  <div className="flex flex-wrap items-center gap-2 mb-2 pb-1.5 border-b border-stone-100 text-[11px] font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      {msg.candidatesCount ?? 0} pratos auditados
                    </span>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      Retrieval: {msg.latencyMs.toFixed(1)} ms
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-line">
                  {msg.content || (msg.isStreaming ? 'Consultando índices PostGIS + pgvector 1536d' : '')}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 align-middle bg-[#FFB703] animate-pulse rounded-sm" />
                  )}
                </div>
              </div>

              {/* Cards de Pratos Recomendados pelo Motor SVL-RRF */}
              {msg.role === 'assistant' &&
                msg.recommendations &&
                msg.recommendations.length > 0 && (
                  <div className="w-full mt-3 space-y-2.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 px-1 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#135136]" />
                      <span>Cards Ranqueados por Score SVL-RRF</span>
                    </div>

                    {msg.recommendations.map((rec) => (
                      <div
                        key={rec.dish_id}
                        className="bg-white rounded-2xl border border-stone-200/90 hover:border-[#135136]/60 p-3.5 shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-heading font-bold text-sm text-stone-900">
                                {rec.dish_name}
                              </h4>
                              {rec.last_price_delta_pct < 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <TrendingDown className="w-3 h-3" />
                                  {rec.last_price_delta_pct.toFixed(1)}% Auditado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                              {rec.description}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-heading font-black text-base text-[#135136]">
                              R$ {rec.price.toFixed(2)}
                            </span>
                            <div className="text-[10px] font-mono font-bold text-stone-500">
                              SVL {rec.rrf_breakdown.svl_rrf_score.toFixed(4)}
                            </div>
                          </div>
                        </div>

                        {/* Tags Alimentares Verificadas + Métricas Geodésicas */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {rec.is_vegan && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                              🌱 Vegano
                            </span>
                          )}
                          {rec.is_vegetarian && !rec.is_vegan && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-900">
                              🥗 Vegetariano
                            </span>
                          )}
                          {rec.is_gluten_free && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                              🌾 Sem Glúten
                            </span>
                          )}
                          {rec.is_lactose_free && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">
                              🥛 Zero Lactose
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            k_vec #{rec.rrf_breakdown.k_vec} • k_geo #{rec.rrf_breakdown.k_geo} • k_lex #{rec.rrf_breakdown.k_lex}
                          </span>
                        </div>

                        {/* Rodapé do Card com Link para o Restaurante */}
                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2 text-stone-600">
                            <span className="font-bold text-stone-800">
                              {rec.restaurant_name}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-stone-600">
                              <MapPin className="w-3 h-3 text-[#135136]" />
                              {rec.neighborhood} ({rec.distance_km.toFixed(2)} km)
                            </span>
                            <span className="inline-flex items-center gap-0.5 font-bold text-amber-700">
                              <Star className="w-3 h-3 fill-[#FFB703] text-[#FFB703]" />
                              {rec.bayesian_rating.toFixed(2)}
                            </span>
                          </div>

                          <Link
                            href={`/restaurants/${rec.restaurant_slug}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shrink-0 transition-colors"
                          >
                            <span>Ver Restaurante</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Formulário de Envio */}
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
            placeholder="Pergunte por prato, bairro, preço ou dieta em Caraguatatuba"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#135136] focus:bg-white disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-[#FFB703]" />
            <span>Enviar</span>
          </button>
        </form>
      </aside>
    </div>
  );
};
