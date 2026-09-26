import { create } from "zustand";
import type { ChatMessage, DietaryFilter, UserLocation } from "@/types";
import { DEFAULT_LOCATION } from "@/lib/constants";

// ==============================================================================
// ZUSTAND STORE — Estado Global do App
// Coordenadas do Usuário, Preferências Alimentares e Chat com IA
// ==============================================================================

interface AppState {
  // Localização
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;

  // Filtros ativos
  activeFilter: DietaryFilter;
  setActiveFilter: (filter: DietaryFilter) => void;

  // Preferências alimentares persistentes
  isCeliac: boolean;
  isVegan: boolean;
  bannedAllergens: string[];
  setDietaryPrefs: (prefs: Partial<Pick<AppState, "isCeliac" | "isVegan" | "bannedAllergens">>) => void;

  // Chat IA
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  isAIStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setChatOpen: (open: boolean) => void;
  setAIStreaming: (streaming: boolean) => void;
  clearChat: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Localização — padrão: Centro de Caraguatatuba
  location: DEFAULT_LOCATION,
  setLocation: (loc) => set({ location: loc }),

  // Filtro
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  // Preferências
  isCeliac: false,
  isVegan: false,
  bannedAllergens: [],
  setDietaryPrefs: (prefs) =>
    set((state) => ({
      isCeliac: prefs.isCeliac ?? state.isCeliac,
      isVegan: prefs.isVegan ?? state.isVegan,
      bannedAllergens: prefs.bannedAllergens ?? state.bannedAllergens,
    })),

  // Chat
  chatMessages: [],
  isChatOpen: false,
  isAIStreaming: false,
  addMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.chatMessages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
        msgs[lastIdx] = { ...msgs[lastIdx], content, is_streaming: true };
      }
      return { chatMessages: msgs };
    }),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setAIStreaming: (streaming) => set({ isAIStreaming: streaming }),
  clearChat: () => set({ chatMessages: [] }),
}));
