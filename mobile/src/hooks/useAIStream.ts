import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { fetchEventSource } from '@/services/sse';
import { API_BASE_URL } from '@/services/api';

// ==============================================================================
// useAIStream — Hook Cliente de Streaming para o Pipeline RAG (FastAPI + SSE)
// Permite fluxo de tokens contínuo em tempo real com controle de cancelamento,
// integrando o estado global do chat e acionando o pulso acelerado do Jacquin.
// ==============================================================================

export interface AIStreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (err: Error) => void;
}

export function useAIStream() {
  const {
    location,
    isCeliac,
    isVegan,
    bannedAllergens,
    updateLastAssistantMessage,
    setAIStreaming,
  } = useAppStore();

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsLocalStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (userQuery: string, options?: AIStreamOptions) => {
      // Cancela requisições anteriores ativas
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLocalStreaming(true);
      setAIStreaming(true);
      setError(null);
      setStreamedText('');

      let accumulated = '';

      const requestBody = JSON.stringify({
        query: userQuery,
        latitude: location.latitude,
        longitude: location.longitude,
        is_celiac: isCeliac,
        is_vegan: isVegan,
        banned_allergens: bannedAllergens,
      });

      await fetchEventSource(`${API_BASE_URL}/search/rag`, {
        body: requestBody,
        signal: controller.signal,
        onOpen: () => {
          // Conexão estabelecida com o FastAPI
        },
        onMessage: (token: string) => {
          accumulated += token;
          setStreamedText(accumulated);
          updateLastAssistantMessage(accumulated);
          if (options?.onToken) {
            options.onToken(token);
          }
        },
        onError: (err: Error) => {
          setError(err);
          setIsLocalStreaming(false);
          setAIStreaming(false);
          if (options?.onError) {
            options.onError(err);
          }
        },
        onClose: () => {
          setIsLocalStreaming(false);
          setAIStreaming(false);
          if (options?.onComplete) {
            options.onComplete(accumulated);
          }
        },
      });
    },
    [location, isCeliac, isVegan, bannedAllergens, updateLastAssistantMessage, setAIStreaming]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLocalStreaming(false);
    setAIStreaming(false);
  }, [setAIStreaming]);

  return {
    streamedText,
    isStreaming,
    error,
    startStream,
    stopStream,
  };
}

export default useAIStream;
