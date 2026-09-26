"use client";

import { Header } from '@/components/Header';

interface Ranking {
  id: string;
  name: string;
  neighborhood: string;
  historical_rating: number;
  decayed_rating: number;
  total_reviews: number;
  fraud_rate: string;
  price_level: string;
}

const mockRankings: Ranking[] = [
  {
    id: "1",
    name: "Quiosque Canto Bravo",
    neighborhood: "Martin de Sá",
    historical_rating: 4.6,
    decayed_rating: 4.85,
    total_reviews: 412,
    fraud_rate: "2.1%",
    price_level: "$$"
  },
  {
    id: "2",
    name: "Cantina Caiçara",
    neighborhood: "Centro",
    historical_rating: 4.7,
    decayed_rating: 4.80,
    total_reviews: 320,
    fraud_rate: "1.5%",
    price_level: "$$"
  },
  {
    id: "3",
    name: "Mar & Terra Frutos do Mar",
    neighborhood: "Indaiá",
    historical_rating: 4.5,
    decayed_rating: 4.62,
    total_reviews: 198,
    fraud_rate: "4.0%",
    price_level: "$$$"
  },
  {
    id: "4",
    name: "Barraca Caiçara Tradição",
    neighborhood: "Porto Novo",
    historical_rating: 4.3,
    decayed_rating: 4.45,
    total_reviews: 87,
    fraud_rate: "0.8%",
    price_level: "$"
  }
];

export default function RankingsPage() {
  return (
    <main className="flex-1">
      <Header title="Rankings Gastronômicos e Algoritmo de Decaimento Temporal" />
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-1">
            Impacto do Decaimento Exponencial de Notas (Half-Life = 180 dias)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            O algoritmo penaliza avaliações antigas (e.g. trocas de chef ou nova gestão) e
            privilegia a consistência recente dos restaurantes de Caraguatatuba.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Posição</th>
                  <th className="px-4 py-3">Restaurante</th>
                  <th className="px-4 py-3">Bairro</th>
                  <th className="px-4 py-3">Faixa Preço</th>
                  <th className="px-4 py-3">Nota Histórica</th>
                  <th className="px-4 py-3 text-sky-400 font-bold">Nota Recente (Decaída)</th>
                  <th className="px-4 py-3">Total Avaliações</th>
                  <th className="px-4 py-3">Fraudes Purgadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {mockRankings.map((rest, index) => (
                  <tr key={rest.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-4 font-bold text-white">#{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-white">{rest.name}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {rest.neighborhood}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-emerald-400 font-mono">{rest.price_level}</td>
                    <td className="px-4 py-4 text-slate-400 font-mono">{rest.historical_rating.toFixed(2)}</td>
                    <td className="px-4 py-4 font-mono font-bold text-sky-400">
                      {rest.decayed_rating.toFixed(2)}
                      {rest.decayed_rating > rest.historical_rating && (
                        <span className="text-xs text-emerald-400 ml-1">▲</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{rest.total_reviews}</td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-400">{rest.fraud_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
