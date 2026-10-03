import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-sky-500/30">
            CF
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Caraguá FoodTech</h1>
            <span className="text-xs text-sky-400 font-medium tracking-wide">Painel de Moderação</span>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            📊 Visão Geral
          </Link>
          <Link
            href="/moderation"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            🛡️ Moderação Noturna
          </Link>
          <Link
            href="/rankings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            ⭐ Rankings & Decaimento
          </Link>
          <Link
            href="/rag-test"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            🤖 Playground RAG 5-Estágios
          </Link>
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
        <p>Centro Universitário Módulo</p>
        <p className="mt-1">TCC - Gastronomia Hiperlocal</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[10px]">
          v1.0.0 (PostGIS + pgvector)
        </span>
      </div>
    </aside>
  );
}
