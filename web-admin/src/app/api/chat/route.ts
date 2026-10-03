import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_RESTAURANTS } from '@/data/caraguaData';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const qLower = (query || '').toLowerCase();

    // RAG Simulado com os 5 Polos Oficiais de Caraguá
    let chosen = INITIAL_RESTAURANTS[0]; // Martim de Sá
    let reply = "";

    if (qLower.includes('centro') || qLower.includes('azul') || qLower.includes('vegano')) {
      chosen = INITIAL_RESTAURANTS[1];
      reply = `Fala meu consagrado! No Centro Histórico de Caraguá, você precisa conhecer a Cantina Caiçara Tradição! O Azul-Marinho é patrimônio caiçara com nota 4.92★ auditada pelo nosso algoritmo. Vai lá que é tompero autêntico! 🌊`;
    } else if (qLower.includes('indaiá') || qLower.includes('camarão') || qLower.includes('carne') || qLower.includes('romântico')) {
      chosen = INITIAL_RESTAURANTS[2];
      reply = `Olha aí meu patrão! No Indaiá, a pedida perfeita é o Mar & Terra Gourmet! O Risoto de Camarão Rosa na cachaça da serra é show de bola. Nota recente de 4.65★ com 96% de Food Safety! 🦐`;
    } else if (qLower.includes('massaguaçu') || qLower.includes('tainha') || qLower.includes('pescado')) {
      chosen = INITIAL_RESTAURANTS[3];
      reply = `Direto da brasa, parceiro! Em Massaguaçu, a Barraca da Tainha & Pescados serve a Tainha Espalmada na brasa com vinagrete de maracujá da restinga. Nota 4.78★ auditada! 🐟`;
    } else if (qLower.includes('porto novo') || qLower.includes('barato') || qLower.includes('família')) {
      chosen = INITIAL_RESTAURANTS[4];
      reply = `Fartura pura pro bolso, meu amigo! No Porto Novo, o Restaurante O Pescador do Sul tem uma Caldeirada Família por R$ 98 que serve 3 pessoas com peixe fresquinho dos barcos! ⛵`;
    } else {
      reply = `Ô parceiro! Consultei aqui o banco de dados híbrido de Caraguatatuba e a melhor recomendação agora é no Martim de Sá no Quiosque Canto Bravo. O Badejo frito na hora com molho tártaro caiçara tem nota 4.88★ sem inércia antiga! 👨‍🍳`;
    }

    return NextResponse.json({
      success: true,
      reply,
      restaurantCard: {
        id: chosen.id,
        name: chosen.name,
        neighborhood: chosen.neighborhood,
        dish: chosen.dishes[0]?.name || "Prato Destaque",
        price: chosen.dishes[0]?.price || 68.0,
        rating: chosen.decayedRatingAverage,
        foodSafety: chosen.foodSafetyScore
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
