import { NextRequest, NextResponse } from 'next/server';
import { generateJacquinChatResponse } from '@/lib/jacquinAiEngine';
import { sanitizeUserInput } from '@/lib/security';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function tryEnhanceWithGemini(
  userQuery: string,
  retrievedDishes: any[],
  fallbackReply: string
): Promise<string> {
  if (!GEMINI_API_KEY || retrievedDishes.length === 0) {
    return fallbackReply;
  }

  const dishesContext = retrievedDishes
    .slice(0, 5)
    .map(
      (d, idx) =>
        `${idx + 1}. Prato: "${d.dish_name}" | Restaurante: "${d.restaurant_name}" | Bairro: "${d.neighborhood}" | Preço: R$ ${Number(d.price).toFixed(2).replace('.', ',')} | Descrição: ${d.description || ''}`
    )
    .join('\n');

  const systemInstruction =
    'Você é o Chef Érick Jacquin Praiano, curador oficial do guia gastronômico CaráFood em Caraguatatuba (53 bairros). ' +
    'Fale em português com seu sotaque e bordões clássicos ("Bonjour, mon ami!", "tompero", "vergonha da profission", "freezer ligado", "C\'est magnifique!"), ' +
    'mas seja sempre acolhedor, prestativo e direto (máximo 2 parágrafos curtos). ' +
    'REGRA DE OURO: cite EXCLUSIVAMENTE os pratos, restaurantes, bairros e preços reais fornecidos abaixo. Nunca invente restaurantes ou preços.';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3800);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Pedido do cliente em Caraguatatuba: "${userQuery}"\n\nPratos reais encontrados nos cardápios da cidade:\n${dishesContext}\n\nResponda como Chef Jacquin Praiano recomendando os 2 primeiros pratos e convidando a clicar nos cartões abaixo:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 280,
          },
        }),
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return fallbackReply;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string' && text.trim().length > 25
      ? text.trim()
      : fallbackReply;
  } catch {
    clearTimeout(timeout);
    return fallbackReply;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Aceita query (enviado pelo CaraguaAIChatDrawer), message ou prompt
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

    const finalReply = await tryEnhanceWithGemini(
      cleanPrompt,
      generated.recommendations,
      generated.reply
    );

    return NextResponse.json({
      success: true,
      reply: finalReply,
      answer: finalReply,
      dishes: generated.recommendations,
      recommendations: generated.recommendations,
      detectedIntent: generated.detectedIntent,
      detectedLocationLabel: generated.detectedLocationLabel,
      chefMood: generated.chefMood,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Falha ao conversar com o Chef Jacquin Praiano';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
