export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Cluster PostgreSQL Híbrido Ativo
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
          AD
        </div>
      </div>
    </header>
  );
}
