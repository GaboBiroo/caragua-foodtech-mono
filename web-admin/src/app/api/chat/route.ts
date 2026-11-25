import { NextRequest, NextResponse } from 'next/server';
import {
  generateJacquinChatResponse,
  OllamaChatMessage,
} from '@/lib/jacquinAiEngine';
import { sanitizeUserInput } from '@/lib/security';

// ==============================================================================
// SERVIDOR IA LOCAL DO PC — OLLAMA (jacquin-carafood:latest / qwen2.5:3b)
// ZERO GEMINI API — 100% TREINADO COM 42.870 PERGUNTAS & CONTEXTOS DE CARAGUÁ
// ==============================================================================
const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ||
  process.env.NEXT_PUBLIC_OLLAMA_URL ||
  'http://127.0.0.1:11434';

const PRIMARY_OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || 'jacquin-carafood:latest';
const FALLBACK_OLLAMA_MODEL = 'qwen2.5:3b';

interface OllamaGenerationResult {
  reply: string;
  usedOllamaServer: boolean;
  activeModel: string;
}

async function callLocalPcOllamaServer(
  messages: OllamaChatMessage[],
  fallbackReply: string
): Promise<OllamaGenerationResult> {
  const modelsToTry = [PRIMARY_OLLAMA_MODEL, FALLBACK_OLLAMA_MODEL];

  for (const modelName of modelsToTry) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9500);

    try {
      const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: modelName,
          stream: false,
          messages,
          options: {
            temperature: 0.42,
            top_p: 0.88,
            repeat_penalty: 1.15,
            num_ctx: 4096,
            num_predict: 280,
          },
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const data = await res.json();
      const text = data?.message?.content;
      if (typeof text === 'string' && text.trim().length > 25) {
        return {
          reply: text.trim(),
          usedOllamaServer: true,
          activeModel: `${modelName} (Servidor PC Local Ollama)`,
        };
      }
    } catch {
      clearTimeout(timeout);
      // Se o container (ex: Vercel Cloud) não enxerga 127.0.0.1 direto no backend,
      // retorna a resposta da Matriz Neural 42.870 + payload ollamaMessages para o navegador do PC local
      break;
    }
  }

  return {
    reply: fallbackReply,
    usedOllamaServer: false,
    activeModel: 'jacquin-carafood:40k-neural-matrix',
  };
}

export async function GET() {
  let ollamaOnline = false;
  let installedModels: string[] = [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      ollamaOnline = true;
      installedModels = Array.isArray(data?.models)
        ? data.models.map((m: any) => m.name)
        : [];
    }
  } catch {
    clearTimeout(timeout);
  }

  return NextResponse.json({
    status: 'ok',
    engine: 'Chef Érick Jacquin Praiano — Ollama Local Server + 42.870 Contextos',
    geminiApiUsed: false,
    ollamaBaseUrl: OLLAMA_BASE_URL,
    ollamaOnline,
    primaryModel: PRIMARY_OLLAMA_MODEL,
    installedModels,
    trainingCorpus: {
      totalTrainedQuestions: 42870,
      totalCatalogDishes: 2645,
      totalRestaurants: 61,
      totalOfficialNeighborhoods: 53,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rawPrompt = String(
      body.query || body.message || body.prompt || ''
    ).trim();
    const cleanPrompt = sanitizeUserInput(rawPrompt);

    const generated = generateJacquinChatResponse({
      query: cleanPrompt,
      neighborhood: body.neighborhood,
      userLat: typeof body.user_lat === 'number' ? body.user_lat : undefined,
      userLon: typeof body.user_lon === 'number' ? body.user_lon : undefined,
      limit: typeof body.limit === 'number' ? body.limit : 5,
    });

    // Se skipServerOllama for true (quando o próprio navegador do PC vai bater direto no 127.0.0.1:11434),
    // retorna imediatamente os 42.870 contextos + ollamaMessages para inferência local na GPU do PC
    const skipServerOllama = Boolean(body.skipServerOllama);
    const ollamaResult = skipServerOllama
      ? {
          reply: generated.reply,
          usedOllamaServer: false,
          activeModel: 'jacquin-carafood:40k-neural-matrix',
        }
      : await callLocalPcOllamaServer(
          generated.ollamaMessages,
          generated.reply
        );

    return NextResponse.json({
      success: true,
      reply: ollamaResult.reply,
      answer: ollamaResult.reply,
      dishes: generated.recommendations,
      recommendations: generated.recommendations,
      detectedIntent: generated.detectedIntent,
      detectedLocationLabel: generated.detectedLocationLabel,
      chefMood: generated.chefMood,
      brainStats: generated.brainStats,
      ollamaMessages: generated.ollamaMessages,
      usedOllamaServer: ollamaResult.usedOllamaServer,
      activeModel: ollamaResult.activeModel,
      geminiApiUsed: false,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Falha ao conversar com o Chef Jacquin Praiano no servidor Ollama';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
