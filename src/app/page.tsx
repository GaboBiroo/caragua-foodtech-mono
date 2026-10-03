'use client';

import React, { useState, useEffect } from 'react';
import { ConsumerApp } from '@/components/consumer/ConsumerApp';
import { IPhoneMockup } from '@/components/IPhoneMockup';
import { AdminView } from '@/components/admin/AdminView';
import { RAGArchitectureView } from '@/components/admin/RAGArchitectureView';
import { Smartphone, ShieldCheck, Brain, Maximize2, Minimize2 } from 'lucide-react';

export default function MasterPage() {
  const [activeMode, setActiveMode] = useState<'mobile' | 'admin' | 'rag'>('mobile');
  const [isFullScreenMobile, setIsFullScreenMobile] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Detecta se está acessando diretamente de um smartphone (Safari iOS / Chrome Android)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Se o usuário estiver acessando de um smartphone real, renderiza 100% tela cheia
  if (isMobileScreen || isFullScreenMobile) {
    return (
      <div className="fixed inset-0 w-full h-full bg-slate-950 overflow-hidden">
        {isFullScreenMobile && !isMobileScreen && (
          <button
            onClick={() => setIsFullScreenMobile(false)}
            className="fixed top-3 right-3 z-50 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white"
            title="Voltar ao Mockup"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
        <ConsumerApp />
      </div>
    );
  }

  // Visualização Desktop: Mockup iPhone Pro Centralizado com Barra de Troca de Modos
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] text-slate-100 flex flex-col">
      
      {/* Barra Superior em Vidro Flutuante */}
      <header className="sticky top-0 z-50 px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-sky-500/20">
            CF
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight">
              Caraguá FoodTech <span className="text-sky-400 font-normal">| Plataforma Integrada</span>
            </h1>
            <p className="text-[11px] text-slate-400">TCC ADS • Centro Universitário Módulo</p>
          </div>
        </div>

        {/* Switcher de Modos */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMode === 'mobile'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> App do Usuário (Simulador iPhone)
          </button>

          <button
            onClick={() => setActiveMode('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMode === 'admin'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Painel Admin & Moderação
          </button>

          <button
            onClick={() => setActiveMode('rag')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeMode === 'rag'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Arquitetura RAG & LLMs Regionais
          </button>
        </div>

        {/* Botão de Expandir Mobile */}
        <div className="flex items-center gap-2">
          {activeMode === 'mobile' && (
            <button
              onClick={() => setIsFullScreenMobile(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
              title="Expandir para tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
        {activeMode === 'mobile' && (
          <div className="py-4">
            <IPhoneMockup>
              <ConsumerApp />
            </IPhoneMockup>
          </div>
        )}

        {activeMode === 'admin' && (
          <div className="w-full">
            <AdminView />
          </div>
        )}

        {activeMode === 'rag' && (
          <div className="w-full">
            <RAGArchitectureView />
          </div>
        )}
      </main>
    </div>
  );
}
