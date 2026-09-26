"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';

interface Promo {
  id: string;
  restaurant_name: string;
  neighborhood: string;
  dish_name: string;
  description: string;
  price: number;
  category: string;
  is_vegan: boolean;
  is_gluten_free: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

const mockPromos: Promo[] = [
  {
    id: "p1",
    restaurant_name: "Quiosque Canto Bravo",
    neighborhood: "Martin de Sá",
    dish_name: "Isca de Badejo com Molho Tártaro Caiçara",
    description: "Porção de 500g de peixe fresco capturado artesanalmente em Caraguatatuba.",
    price: 68.0,
    category: "Frutos do Mar",
    is_vegan: false,
    is_gluten_free: true,
    status: 'pending'
  },
  {
    id: "p2",
    restaurant_name: "Cantina Caiçara",
    neighborhood: "Centro",
    dish_name: "Moqueca Vegana de Banana da Terra com Palmito Pupunha",
    description: "Prato 100% sem glúten e sem ingredientes de origem animal, azeite de dendê e leite de coco.",
    price: 54.0,
    category: "Vegano",
    is_vegan: true,
    is_gluten_free: true,
    status: 'pending'
  },
  {
    id: "p3",
    restaurant_name: "Mar & Terra",
    neighborhood: "Indaiá",
    dish_name: "Combo Burger Costela + Batata Rústica",
    description: "Hambúrguer artesanal 180g defumado na lenha de macieira.",
    price: 39.9,
    category: "Lanches",
    is_vegan: false,
    is_gluten_free: false,
    status: 'pending'
  }
];

export default function ModerationPage() {
  const [promos, setPromos] = useState<Promo[]>(mockPromos);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setPromos(prev =>
      prev.map(p => (p.id === id ? { ...p, status: action } : p))
    );
  };

  const pendingCount = promos.filter(p => p.status === 'pending').length;

  return (
    <main className="flex-1">
      <Header title="Validação de Promoções e Cardápios Noturnos" />
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Pratos e Ofertas Capturados via Playwright (XHR Ingestion)
            </h3>
            <p className="text-xs text-slate-400">
              {pendingCount} itens aguardando aprovação humana antes da indexação no catálogo público.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map(promo => (
            <div
              key={promo.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition ${
                promo.status === 'approved'
                  ? 'border-emerald-800/60 opacity-60'
                  : promo.status === 'rejected'
                  ? 'border-rose-900/60 opacity-40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
                    {promo.neighborhood}
                  </span>
                  <span className="text-base font-bold text-white">
                    R$ {promo.price.toFixed(2)}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-base leading-snug">
                  {promo.dish_name}
                </h4>
                <p className="text-xs text-sky-300 font-medium mt-0.5 mb-3">
                  {promo.restaurant_name}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {promo.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {promo.is_vegan && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      VEGANO
                    </span>
                  )}
                  {promo.is_gluten_free && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                      SEM GLÚTEN
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {promo.category}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
                {promo.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(promo.id, 'approved')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                    >
                      ✓ Aprovar Prato
                    </button>
                    <button
                      onClick={() => handleAction(promo.id, 'rejected')}
                      className="py-2 px-3 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 rounded-lg text-xs font-semibold transition"
                    >
                      ✕ Rejeitar
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic">
                    Status: {promo.status === 'approved' ? 'Aprovado ✓' : 'Rejeitado ✕'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
