import { API_BASE_URL } from "./constants";

export interface StreamRAGParams {
  query: string;
  latitude: number;
  longitude: number;
  is_celiac?: boolean;
  is_vegan?: boolean;
  banned_allergens?: string[];
}

/**
 * Consome o endpoint SSE de streaming do RAG de 5 estágios.
 */
export async function streamRAGResponse(
  params: StreamRAGParams,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: any) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        query: params.query,
        latitude: params.latitude,
        longitude: params.longitude,
        is_celiac: params.is_celiac ?? false,
        is_vegan: params.is_vegan ?? false,
        banned_allergens: params.banned_allergens ?? [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      const text = await response.text();
      onToken(text);
      onDone();
      return;
    }

    // Suporte a ReadableStream (Web / React Native moderno)
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "");
            if (data.includes("[DONE]")) {
              onDone();
              return;
            }
            onToken(data);
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}
