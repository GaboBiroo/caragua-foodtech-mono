# scripts/benchmark_sla_metrics.py
"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — SLA & PERFORMANCE BENCHMARK SUITE
Mede latências P50, P95, P99 e valida conformidade estrita com os SLAs:
- Routing & Intent Classification: P99 < 150ms
- Hybrid Vector-Spatial Retrieval: P99 < 300ms
- Full RAG Streaming TTFT: P99 < 800ms
==============================================================================
"""

import sys
from pathlib import Path
import time
import asyncio
import numpy as np

# Suporte a UTF-8 no Windows
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import text
from app.db.session import AsyncSessionLocal
from app.services.rag_pipeline import RAGPipelineService
from app.core.llm_manager import llm_manager

async def run_sla_benchmark(num_iterations: int = 10):
    print("==================================================================")
    print(" 🚀 CARÁFOOD — BENCHMARK DE DESEMPENHO E LATÊNCIA SUB-SEGUNDO")
    print(f"    Ambiente: Bare-Metal Local | Iterações: {num_iterations}")
    print("==================================================================")

    intent_latencies = []
    retrieval_latencies = []
    ttft_latencies = []
    total_latencies = []

    test_queries = [
        ("Gostaria de peixe fresco sem glúten em Martim de Sá", {"is_celiac": True}),
        ("Porção de camarão barata perto do Centro de Caraguá", {}),
        ("Opção vegana rápida perto de Indaiá", {"is_vegan": True}),
        ("Ostras frescas no Porto Novo", {}),
        ("Costela defumada tradicional no Tinga", {}),
    ]

    async with AsyncSessionLocal() as session:
        service = RAGPipelineService(session=session)

        # 1. Warm-up
        print("⏳ Aquecendo pipeline (warm-up cache & conexão db)...")
        _ = await service.session.execute(text("SELECT 1"))
        _ = await llm_manager.extract_intent("warmup query")
        print("✅ Warm-up concluído com sucesso.\n")

        for i in range(num_iterations):
            query, profile = test_queries[i % len(test_queries)]
            
            # --- Etapa 1: Routing & Intent ---
            t0 = time.perf_counter()
            intent = await llm_manager.extract_intent(query)
            t1 = time.perf_counter()
            intent_ms = (t1 - t0) * 1000.0
            intent_latencies.append(intent_ms)

            # --- Etapa 2 & 3: Hybrid Vector-Spatial Retrieval (PostGIS + pgvector) ---
            query_vector = await llm_manager.get_embedding(intent.semantic_query)
            t2 = time.perf_counter()
            results = await service.hybrid_search(
                intent=intent,
                query_vector=query_vector,
                user_lat=-23.6226,
                user_lng=-45.4124,
                limit=5
            )
            t3 = time.perf_counter()
            retrieval_ms = (t3 - t2) * 1000.0
            retrieval_latencies.append(retrieval_ms)

            # --- Etapa 4 & 5: Streaming SSE & TTFT ---
            factual_context = service._build_factual_context(results)
            t4 = time.perf_counter()
            first_token_time = None
            token_count = 0

            async for token in llm_manager.stream_generation(
                user_query=query,
                factual_context=factual_context,
                user_profile_context=str(profile)
            ):
                if first_token_time is None:
                    first_token_time = time.perf_counter()
                token_count += 1

            t5 = time.perf_counter()
            ttft_ms = ((first_token_time or t5) - t4) * 1000.0
            total_ms = (t5 - t0) * 1000.0

            ttft_latencies.append(ttft_ms)
            total_latencies.append(total_ms)

            print(f"[{i+1:02d}/{num_iterations}] Intent: {intent_ms:6.1f}ms | Retrieval: {retrieval_ms:6.1f}ms | TTFT: {ttft_ms:6.1f}ms | Total: {total_ms:6.1f}ms | Itens: {len(results)}")

    print("\n==================================================================")
    print(" 📊 RESULTADO CONSOLIDADO DOS SLAS DE DESEMPENHO (PERCENTIS)")
    print("==================================================================")

    def print_metric(name: str, values: list, sla_limit_p99: float):
        p50 = np.percentile(values, 50)
        p95 = np.percentile(values, 95)
        p99 = np.percentile(values, 99)
        passed = p99 <= sla_limit_p99
        status = "✅ CONFORME" if passed else "⚠️ ATENÇÃO"
        print(f"{name:<35} P50: {p50:5.1f}ms | P95: {p95:5.1f}ms | P99: {p99:5.1f}ms (SLA: <{sla_limit_p99:.0f}ms) -> {status}")

    print_metric("1. Routing & Intent Classification", intent_latencies, 150.0)
    print_metric("2. Hybrid Vector-Spatial Retrieval", retrieval_latencies, 300.0)
    print_metric("3. Full RAG Streaming TTFT", ttft_latencies, 800.0)
    print_metric("4. Tempo Total de Ponta a Ponta", total_latencies, 1200.0)
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(run_sla_benchmark(num_iterations=10))
