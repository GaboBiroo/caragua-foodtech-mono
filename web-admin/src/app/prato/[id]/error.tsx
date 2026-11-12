'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Utensils, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PratoDetailErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log silencioso de diagnóstico
    console.error('CaráFood — Erro ao carregar prato:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A202C] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#135136]/10 text-[#135136] flex items-center justify-center mx-auto shadow-inner">
          <Utensils className="w-8 h-8 text-[#135136]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading font-black text-2xl text-stone-900">
            Cardápio de Caraguá em Atualização
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Tivemos um pequeno contratempo ao carregar este prato específico, mas os cardápios de Caraguatatuba continuam disponíveis!
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-[#FFB703]" />
            <span>Tentar Novamente</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-stone-600" />
            <span>Ver Cardápios</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
