"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';

export default function RAGTestPage() {
  const [query, setQuery] = useState("Quero um peixe fresco caiçara ou frutos do mar perto da praia Martin de Sá");
  const [isCeliac, setIsCeliac] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTestRAG = async () => {
    setLoading(true);
    setOutput("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.100.67:8000/api/v1";
      const response = await fetch(`${apiUrl}/search/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          latitude: -23.6226,
          longitude: -45.4124,
          is_celiac: isCeliac,
          is_vegan: isVegan,
          banned_allergens: []
        })
      });

      if (!response.body) {
        setOutput("Erro: resposta sem corpo de streaming.");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && !line.includes("[DONE]")) {
              setOutput(prev => prev + line.replace("data: ", ""));
            }
          }
        }
      }
    } catch (e: any) {
      setOutput(`Erro ao conectar com a API FastAPI (certifique-se de que uvicorn está rodando na porta 8000): ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <Header title="Playground Interativo do Pipeline RAG de 5 Estágios" />
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <label className="text-sm font-semibold text-white block">
            Consulta em Linguagem Natural do Usuário:
          </label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500 transition"
          />

          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isCeliac}
                onChange={e => setIsCeliac(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
              />
              Restrição a Glúten (Celíaco)
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isVegan}
                onChange={e => setIsVegan(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-0"
              />
              Exigência Vegana
            </label>

            <button
              onClick={handleTestRAG}
              disabled={loading}
              className="ml-auto py-2 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-500/20 disabled:opacity-50 transition"
            >
              {loading ? "Processando RAG..." : "🚀 Executar 5 Estágios do RAG"}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Resposta Sintetizada via Streaming SSE:</h4>
            {loading && <span className="text-xs text-sky-400 animate-pulse">Recebendo tokens...</span>}
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg min-h-[160px] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {output || "Aguardando execução da busca..."}
          </div>
        </div>
      </div>
    </main>
  );
}
