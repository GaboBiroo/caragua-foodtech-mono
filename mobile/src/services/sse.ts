// ==============================================================================
// sse.ts — Polyfill Avançado para Server-Sent Events via API Fetch
// Implementa streaming unilateral iterativo de bytes com mitigação de memory leaks
// no ambiente React Native (superando limitações do XMLHttpRequest padrão).
// ==============================================================================

export interface SSEOptions {
  headers?: Record<string, string>;
  body?: string;
  onOpen?: () => void;
  onMessage?: (data: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  signal?: AbortSignal;
}

export async function fetchEventSource(url: string, options: SSEOptions): Promise<void> {
  const { headers, body, onOpen, onMessage, onError, onClose, signal } = options;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...headers,
      },
      body,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Falha na requisição SSE HTTP ${response.status}: ${response.statusText}`);
    }

    if (onOpen) {
      onOpen();
    }

    if (!response.body) {
      // Fallback para buffers não-stream
      const rawText = await response.text();
      const lines = rawText.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            if (onClose) onClose();
            return;
          }
          if (onMessage) onMessage(payload);
        }
      }
      if (onClose) onClose();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataContent = trimmed.slice(6);
          if (dataContent === '[DONE]') {
            if (onClose) onClose();
            return;
          }
          if (onMessage) onMessage(dataContent);
        }
      }
    }

    if (onClose) {
      onClose();
    }
  } catch (error: any) {
    if (signal?.aborted) {
      if (onClose) onClose();
      return;
    }
    if (onError) {
      onError(error);
    } else {
      console.error('[SSE Fetch Error]:', error);
    }
  }
}

export default fetchEventSource;
