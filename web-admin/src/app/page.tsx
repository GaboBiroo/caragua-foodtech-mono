import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';

export default function DashboardPage() {
  return (
    <main className="flex-1">
      <Header title="Visão Geral do Ecossistema Gastronômico" />
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Restaurantes em Caraguá"
            value="48"
            subtitle="Mapeados com índices PostGIS e Uber H3"
            icon="📍"
            badge="100% Georref"
          />
          <MetricCard
            title="Itens de Cardápio"
            value="1.240"
            subtitle="Vetorizados com pgvector (Vector 1536)"
            icon="🍲"
            badge="Semântica Ativa"
          />
          <MetricCard
            title="Avaliações Auditadas"
            value="3.890"
            subtitle="Higienizadas conforme LGPD (Art. 5º e 6º)"
            icon="💬"
            badge="Anonimizado"
          />
          <MetricCard
            title="Fraudes Detectadas (SMOTE)"
            value="7.8%"
            subtitle="Expurgadas das médias via Random Forest"
            icon="🛡️"
            badge="Mackenzie 2024"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">
              Arquitetura RAG de 5 Estágios em Produção
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Pipeline híbrido determinístico prevenindo alucinações e garantindo Food Safety.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Extração de Intenção Estruturada</h4>
                  <p className="text-xs text-slate-400">Pydantic V2 isola culinária, orçamento e alérgenos proibidos.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Enriquecimento Dinâmico</h4>
                  <p className="text-xs text-slate-400">Acopla coordenadas GPS reais em Caraguatatuba e histórico situacional.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Busca Híbrida: PostGIS + pgvector</h4>
                  <p className="text-xs text-slate-400">ST_DWithin delimita raio métrico cartesiano e cosseno (&lt;-&gt;) ordena itens.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Injeção de Contexto Factual</h4>
                  <p className="text-xs text-slate-400">Âncora rígida de pratos auditados sem risco de alucinação dietética.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">5</span>
                <div>
                  <h4 className="text-sm font-medium text-white">Streaming Gerativo SSE</h4>
                  <p className="text-xs text-slate-400">LLM Manager sintetiza a narrativa caiçara entregando tokens via HTTP Stream.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-white mb-2">
                Bairros Monitorados em Caraguatatuba
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Discretização espacial de malhas territoriais com suporte a H3.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-sky-400 block">Martin de Sá</span>
                  <span className="text-slate-300 font-medium">14 Estabelecimentos</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-sky-400 block">Centro</span>
                  <span className="text-slate-300 font-medium">18 Estabelecimentos</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-sky-400 block">Indaiá</span>
                  <span className="text-slate-300 font-medium">9 Estabelecimentos</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-xs font-semibold text-sky-400 block">Porto Novo</span>
                  <span className="text-slate-300 font-medium">7 Estabelecimentos</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-sky-950/40 border border-sky-800/40 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-sky-300 font-medium">Lote da Madrugada (Nightly ETL)</p>
                <p className="text-[11px] text-slate-400">Última execução: Hoje às 03:00 (100% de integridade)</p>
              </div>
              <span className="text-xs font-bold text-sky-400 bg-sky-900/60 px-2 py-1 rounded">OK</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
