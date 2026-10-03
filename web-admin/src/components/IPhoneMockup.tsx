import React from 'react';

interface IPhoneMockupProps {
  children: React.ReactNode;
}

export function IPhoneMockup({ children }: IPhoneMockupProps) {
  return (
    <div className="relative mx-auto w-[390px] h-[812px] bg-black rounded-[54px] p-3 shadow-[0_0_80px_rgba(14,165,233,0.25)] border-[5px] border-slate-700/80 ring-1 ring-white/10 select-none">
      
      {/* Botões Laterais do iPhone */}
      <div className="absolute -left-[9px] top-[115px] w-[4px] h-[30px] bg-slate-600 rounded-l-md" />
      <div className="absolute -left-[9px] top-[160px] w-[4px] h-[55px] bg-slate-600 rounded-l-md" />
      <div className="absolute -left-[9px] top-[225px] w-[4px] h-[55px] bg-slate-600 rounded-l-md" />
      <div className="absolute -right-[9px] top-[170px] w-[4px] h-[75px] bg-slate-600 rounded-r-md" />

      {/* Tela Interna */}
      <div className="relative w-full h-full bg-slate-950 rounded-[44px] overflow-hidden flex flex-col">
        
        {/* Dynamic Island / Ilha Dinâmica */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-full z-50 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Barra de Status iOS */}
        <div className="pt-2 px-7 flex items-center justify-between text-[11px] text-white font-semibold z-40">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2 rounded-[2px] border border-white flex items-center p-0.5">
              <div className="w-full h-full bg-white rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Conteúdo Renderizado (O App) */}
        <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Indicador de Barra Home iOS */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40 pointer-events-none" />
      </div>
    </div>
  );
}
