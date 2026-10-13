'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, TrendingUp, ShieldAlert, Award, Star, 
  MapPin, Clock, ArrowRight, ChevronRight, Sparkles 
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';

interface Ranking {
  id: string;
  name: string;
  neighborhood: string;
  dishName: string;
  postId: string;
  historical_rating: number;
  decayed_rating: number;
  total_reviews: number;
  fraud_rate: string;
  award: string;
  price_level: string;
}

const mockRankings: Ranking[] = [
  {
    id: "1",
    name: "Quiosque Canto Bravo",
    neighborhood: "Martim de Sá",
    dishName: "Badejo à Dorê Caiçara",
    postId: "post-1",
    historical_rating: 4.65,
    decayed_rating: 4.92,
    total_reviews: 412,
    fraud_rate: "0.2% purgado",
    award: "Campeão Categoria Quiosque • Caraguá a Gosto",
    price_level: "R$ 119,90"
  },
  {
    id: "2",
    name: "Cantinetta Zanfredo",
    neighborhood: "Centro",
    dishName: "Risotto de Mexilhões da Cocanha",
    postId: "post-zanfredo-risotto",
    historical_rating: 4.70,
    decayed_rating: 4.90,
    total_reviews: 320,
    fraud_rate: "0.4% purgado",
    award: "Melhor Prato Principal • Insumo AMAPEC",
    price_level: "R$ 84,00"
  },
  {
    id: "3",
    name: "Quiosque Marujo",
    neighborhood: "Praia das Palmeiras",
    dishName: "Sororoca Grelhada com Banana Nanica",
    postId: "post-marujo-sororoca",
    historical_rating: 4.58,
    decayed_rating: 4.88,
    total_reviews: 198,
    fraud_rate: "0.1% purgado",
    award: "Destaque Culinária Tradicional Caiçara",
    price_level: "R$ 89,90"
  },
  {
    id: "4",
    name: "Cantina Caiçara Tradição",
    neighborhood: "Centro Histórico",
    dishName: "Azul-Marinho Tradicional na Panela de Ferro",
    postId: "post-centro-azul-marinho",
    historical_rating: 4.75,
    decayed_rating: 4.85,
    total_reviews: 284,
    fraud_rate: "0.3% purgado",
    award: "Patrimônio Gastronômico Imaterial",
    price_level: "R$ 98,00"
  },
  {
    id: "5",
    name: "Aloha Bistrô da Praia",
    neighborhood: "Centro",
    dishName: "Polvo Grelhado Aloha",
    postId: "post-aloha-polvo",
    historical_rating: 4.62,
    decayed_rating: 4.82,
    total_reviews: 156,
    fraud_rate: "0.5% purgado",
    award: "Pódio Consecutivo • Frutos do Mar",
    price_level: "R$ 138,00"
  }
];

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] selection:bg-[#FFB703]/30 selection:text-[#135136]">
      {/* NAVBAR GLOBAL INTEGRADA */}
      <Navbar />

      {/* HEADER DA PÁGINA */}
      <header className="relative bg-[#135136] text-white pt-16 pb-16 px-6 overflow-hidden border-b-4 border-[#FFB703]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB703_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-[#FFB703] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Auditoria Algorítmica • Meia-Vida de 30 Dias</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white leading-tight">
            Rankings Oficiais & <span className="text-[#FFB703]">Decaimento Temporal</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl leading-relaxed">
            Classificação viva baseada no algoritmo de decaimento temporal exponencial de notas (half-life = 30 dias). Avaliações recentes têm maior peso, neutralizando distorções da sazonalidade de verão e isolando avaliações fraudulentas.
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* CARDS DE DESTAQUE METODOLÓGICO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-[#FFB703]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-stone-900">Decaimento Exponencial</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Notas recentes têm ~90% de peso decisório no cálculo, refletindo a gestão atual e a safra presente dos pescados.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#135136] flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-[#135136]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-stone-900">Filtro Anti-Fraude (Z-Score)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Detecção de rajadas suspeitas de 5 estrelas ou notas maliciosas coordenadas por bots em períodos de feriados.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#023E8A] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-[#023E8A]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-stone-900">Cédula Caraguá a Gosto</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Integração dos 5 critérios oficiais auditados: Sabor (35%), Apresentação (20%), Originalidade (15%), Atendimento (15%) e Ambiente (15%).
            </p>
          </div>
        </div>

        {/* TABELA DE RANKING AUDITADO */}
        <section className="bg-white rounded-[28px] border border-stone-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-black text-xl text-stone-900">
                Pódio Gastronômico Geral de Caraguatatuba
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Atualizado em tempo real com base nos 53 bairros municipais
              </p>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-[#135136] border border-emerald-200 text-xs font-bold">
              ✓ Auditoria Ativa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="text-[11px] font-black uppercase tracking-wider bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5">Posição</th>
                  <th className="px-4 py-3.5">Restaurante & Prato</th>
                  <th className="px-4 py-3.5">Bairro</th>
                  <th className="px-4 py-3.5 text-center">Nota Histórica</th>
                  <th className="px-4 py-3.5 text-center font-bold text-[#135136]">Super Nota Decaída</th>
                  <th className="px-4 py-3.5">Fraudes Purgadas</th>
                  <th className="px-4 py-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {mockRankings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-4 font-heading font-black text-base text-stone-900">
                      <div className="flex items-center gap-1.5">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                    </td>

                    <td className="px-4 py-4 space-y-0.5">
                      <div className="font-heading font-bold text-stone-900 text-sm">
                        {item.name}
                      </div>
                      <div className="text-xs text-[#135136] font-medium flex items-center gap-1">
                        <span>{item.dishName}</span>
                        <span className="text-stone-400 font-normal">• {item.price_level}</span>
                      </div>
                      <div className="text-[10px] text-amber-800 font-semibold">
                        {item.award}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                        <MapPin className="w-3 h-3 text-[#FFB703]" />
                        <span>{item.neighborhood}</span>
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-stone-500">
                      {item.historical_rating.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center gap-1 font-heading font-black text-sm text-[#135136] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Star className="w-3.5 h-3.5 text-[#FFB703] fill-[#FFB703]" />
                        <span>{item.decayed_rating.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">▲</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {item.fraud_rate}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/prato/${item.postId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs shadow-sm transition-transform hover:scale-105"
                      >
                        <span>Ver Prato</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#FFB703]" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-[#135136] text-white py-8 px-4 text-center border-t-2 border-[#FFB703]/80">
        <p className="text-xs text-emerald-200">
          Caraguá FoodTech • Auditoria Científica de Reputação Gastronômica Caiçara.
        </p>
      </footer>
    </div>
  );
}
