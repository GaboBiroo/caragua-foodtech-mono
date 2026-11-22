'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, SlidersHorizontal, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LgpdConsentBanner: React.FC = () => {
  const { lgpdConsent, saveLgpdConsent } = useAuth();
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [geolocation, setGeolocation] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('carafood_lgpd_consent_v2');
    if (!stored && !lgpdConsent) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [lgpdConsent]);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveLgpdConsent({
      essential: true,
      analytics: true,
      geolocation: true,
    });
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    saveLgpdConsent({
      essential: true,
      analytics: false,
      geolocation: false,
    });
    setVisible(false);
  };

  const handleSaveCustom = () => {
    saveLgpdConsent({
      essential: true,
      analytics,
      geolocation,
    });
    setVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label="Central de Privacidade e Consentimento LGPD"
      className="fixed bottom-16 lg:bottom-4 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-lg z-50 bg-white border-2 border-[#0F382C]/20 rounded-3xl shadow-2xl p-4 sm:p-5 text-stone-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#135136]" />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-stone-900">
              Privacidade, Inclusão &amp; Conformidade LGPD
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              Lei nº 13.709/2018 • Transparência nos 53 Bairros de Caraguá
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleEssentialOnly}
          aria-label="Manter apenas cookies essenciais e fechar"
          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed mt-2.5">
        Respeitamos seu Nome Social, Pronome Social e sua privacidade. Usamos armazenamento local apenas para salvar seu roteiro gastronômico e calcular a distância até os restaurantes da cidade.
      </p>

      {customizing && (
        <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
          <label className="flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-stone-900 block">
                1. Funcionamento Essencial &amp; Segurança
              </span>
              <span className="text-[11px] text-stone-500">
                Sessão, proteção contra fraudes e leitura do catálogo (Obrigatório).
              </span>
            </div>
            <input
              type="checkbox"
              checked
              disabled
              aria-label="Cookies essenciais obrigatórios"
              className="w-4 h-4 accent-[#135136]"
            />
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">
                2. Geolocalização por Bairro
              </span>
              <span className="text-[11px] text-stone-500">
                Ordenar pratos mais próximos do bairro onde você está.
              </span>
            </div>
            <input
              type="checkbox"
              checked={geolocation}
              onChange={(e) => setGeolocation(e.target.checked)}
              aria-label="Permitir geolocalização por bairro"
              className="w-4 h-4 accent-[#135136]"
            />
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">
                3. Estatísticas Anônimas de Descoberta
              </span>
              <span className="text-[11px] text-stone-500">
                Ajudar pequenos restaurantes locais a saberem os pratos mais buscados.
              </span>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              aria-label="Permitir estatísticas anônimas"
              className="w-4 h-4 accent-[#135136]"
            />
          </label>
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {!customizing ? (
          <>
            <button
              type="button"
              onClick={handleAcceptAll}
              data-testid="lgpd-accept-all"
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFB703]" />
              <span>Aceitar e Continuar</span>
            </button>
            <button
              type="button"
              onClick={handleEssentialOnly}
              data-testid="lgpd-essential-only"
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
            >
              Apenas Essenciais
            </button>
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              aria-label="Personalizar preferências de privacidade"
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSaveCustom}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#135136] hover:bg-[#0D3825] text-white font-bold text-xs transition-colors"
            >
              Salvar Minhas Preferências
            </button>
            <button
              type="button"
              onClick={() => setCustomizing(false)}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
