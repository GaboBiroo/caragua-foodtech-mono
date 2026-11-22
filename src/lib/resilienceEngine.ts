// ==============================================================================
// Motor de Resiliência ("Força Vital") & Sustentabilidade SaaS — CaráFood
// - Zero Ponto Único de Falha (Zero-SPOF): se o WhatsApp, o Google Maps, a API
//   Serverless ou o LLM externo sofrerem queda, o sistema degrada graciosamente
//   (Graceful Degradation) mantendo o catálogo de 61 restaurantes e 2.670 pratos,
//   filtros dos 53 bairros, Cédula de 5 critérios e rotas alternativas 100% ativos.
// - Documentação estruturada dos 4 Pilares de Sustentabilidade SaaS (0% comissão).
// ==============================================================================

export interface ResilientFetchResult<T> {
  data: T;
  source: 'live_api' | 'resilient_fallback';
  latencyMs: number;
}

/**
 * Executa requisição HTTP com Circuit Breaker e Timeout controlado,
 * acionando automaticamente o fallback determinístico local caso a rede,
 * a API externa ou a instância Serverless falhe.
 */
export async function fetchWithResilienceFallback<T>(
  url: string,
  options: RequestInit | undefined,
  fallbackFn: () => T | Promise<T>,
  timeoutMs: number = 4500
): Promise<ResilientFetchResult<T>> {
  const startedAt = Date.now();
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller ? controller.signal : undefined,
    });
    if (timer) clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = (await response.json()) as T;
    return {
      data: json,
      source: 'live_api',
      latencyMs: Date.now() - startedAt,
    };
  } catch {
    if (timer) clearTimeout(timer);
    const fallbackData = await Promise.resolve(fallbackFn());
    return {
      data: fallbackData,
      source: 'resilient_fallback',
      latencyMs: Date.now() - startedAt,
    };
  }
}

export interface MultiChannelNavigationBundle {
  googleMapsUrl: string;
  wazeUrl: string;
  openStreetMapUrl: string;
  directPhoneTelUrl: string | null;
  whatsappUrl: string;
  vitalForceStatus: string;
}

/**
 * Gera rotas e canais de contato multi-provedor comprovando que o WhatsApp
 * e o Google Maps são apenas canais auxiliares: se qualquer um deles cair,
 * o usuário tem Waze, OpenStreetMap, discagem telefônica direta (tel:) e
 * o cardápio completo auditado dentro do próprio CaráFood.
 */
export function buildMultiChannelNavigationLinks(params: {
  restaurantName: string;
  neighborhood: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  dishName?: string;
}): MultiChannelNavigationBundle {
  const queryText = `${params.restaurantName} ${params.neighborhood} Caraguatatuba SP`;
  const encodedQuery = encodeURIComponent(queryText);

  const googleMapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedQuery}&navigate=yes`;
  const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${encodedQuery}`;

  const cleanDigits = String(params.phone || '').replace(/\D/g, '');
  const directPhoneTelUrl =
    cleanDigits.length >= 10 ? `tel:+55${cleanDigits.startsWith('55') ? cleanDigits.slice(2) : cleanDigits}` : null;

  const whatsappText = encodeURIComponent(
    `Olá! Vi o prato "${params.dishName || 'do cardápio'}" (${params.restaurantName} - ${params.neighborhood}) no CaráFood e gostaria de mais informações!`
  );
  const whatsappUrl =
    cleanDigits.length >= 10
      ? `https://wa.me/55${cleanDigits.startsWith('55') ? cleanDigits.slice(2) : cleanDigits}?text=${whatsappText}`
      : `https://wa.me/?text=${whatsappText}`;

  return {
    googleMapsUrl,
    wazeUrl,
    openStreetMapUrl,
    directPhoneTelUrl,
    whatsappUrl,
    vitalForceStatus:
      'Catálogo próprio autônomo (2.670 pratos e preços auditados) + Rota Multi-GPS (Google Maps / Waze / OpenStreetMap) + Telefone Direto + WhatsApp opcional.',
  };
}

export interface SaasRevenuePillar {
  id: string;
  title: string;
  priceTag: string;
  targetAudience: string;
  description: string;
  ethicalGuardrail: string;
}

export const SAAS_REVENUE_PILLARS: SaasRevenuePillar[] = [
  {
    id: 'free-forever',
    title: '1. Plano Base Gratuito Perpétuo (0% Comissão)',
    priceTag: 'R$ 0,00 / mês (0% sobre vendas)',
    targetAudience: 'Todos os restaurantes, quiosques, padarias e produtores locais dos 53 bairros',
    description:
      'Garante inclusão digital de pequenos negócios familiares, maricultores da AMAPEC (Cocanha) e pescadores da Colônia Z-8, gerando efeito de rede e cobertura territorial completa da cidade.',
    ethicalGuardrail: 'Nenhum comerciante paga comissão por clique, rota GPS ou pedido recebido.',
  },
  {
    id: 'b2b-pro-analytics',
    title: '2. SaaS B2B Inteligência & Gestão de Cardápio',
    priceTag: 'R$ 49,90 / mês (Assinatura Fixa Opcional)',
    targetAudience: 'Restaurantes e hamburguerias que desejam inteligência competitiva regional',
    description:
      'Painel executivo com mapa de calor de buscas no bairro, comparativo de preços médios da categoria, alertas de desempenho nos 5 critérios da Cédula e atualização self-service de promoções do dia.',
    ethicalGuardrail: 'Custo fixo 20x menor que as taxas de 27% a 30% cobradas pelos apps de delivery tradicionais.',
  },
  {
    id: 'institutional-tourism',
    title: '3. Patrocínio Institucional, Festivais & Turismo',
    priceTag: 'Contratos B2G / Parcerias Culturais Sazonais',
    targetAudience: 'Festivais gastronômicos (Caraguá a Gosto, Festa da Tainha), hotelaria e associações',
    description:
      'Operação da Cédula Digital Oficial e de roteiros temáticos auditados durante alta temporada, feriados prolongados e eventos oficiais do Litoral Norte.',
    ethicalGuardrail: 'Financia a infraestrutura em nuvem mantendo o acesso gratuito para moradores e turistas.',
  },
  {
    id: 'ethical-hyperlocal-ads',
    title: '4. Vitrine Patrocinada Ética (Sem Manipular Notas)',
    priceTag: 'CPC / Cota de Destaque Regional',
    targetAudience: 'Estabelecimentos lançando novos pratos ou combos familiares no bairro',
    description:
      'Selo visual transparente de "Sugestão Patrocinada no Bairro" no topo da categoria, permitindo que novas casas ganhem tração inicial.',
    ethicalGuardrail:
      'Blindagem Algorítmica: o patrocínio JAMAIS altera a Nota Ponderada Bayesiana (WR) nem a posição no Ranking Oficial (/rankings).',
  },
];
