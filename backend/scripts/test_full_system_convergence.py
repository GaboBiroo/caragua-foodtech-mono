"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — LIFECYCLE PASSO 2: FULL SYSTEM CONVERGENCE E2E
==============================================================================
Suíte Automatizada Ponta-a-Ponta validando os 5 Pilares:
1. Marketplace API (`GET /api/v1/restaurants`, `/neighborhoods/summary`, `/{slug}`):
   paginação, ordenação por `bayesian_rating` ($W_R$), 53 bairros, H3 e LGPD SHA-256.
2. Moderation & Telemetry API (`GET /api/v1/moderation/pending-promotions`,
   `/price-drops`, `/scraper/status`): fila de quarentena e histórico inflacionário.
3. Transição ACID + Triggers PostgreSQL 16 + Vetor 1536d Imediato:
   `POST /api/v1/moderation/dishes/{id}/approve` -> dispara trigger SQL, indexa
   `vector(1536)` e torna o prato imediatamente visível no Marketplace e no RAG!
4. Motor Híbrido SVL-RRF (`POST /api/v1/chat/query` e `POST /api/v1/chat/stream`):
   consulta `"opções sem lactose ou veganas"` retorna exclusivamente itens
   compatíveis com trava determinística de segurança alimentar em `< 350ms`.
5. Compilação Estrita Frontend Next.js (`npx tsc --noEmit` & `npm run build`):
   `EXIT CODE 0` sem erros de tipagem TypeScript ou sintaxe JSX.
"""

from __future__ import annotations

import asyncio
import json
import logging
import shutil
import subprocess
import sys
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from httpx import ASGITransport, AsyncClient
from sqlalchemy import select, text

from app.db.models.dish import Dish
from app.db.models.restaurant import Restaurant
from app.db.session import AsyncSessionLocal, async_engine
from app.main import app
from app.workers.scraper_redis import scraper_redis_coordinator

logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
logger = logging.getLogger("e2e_convergence")

FRONTEND_ROOT = Path(__file__).resolve().parent.parent.parent


async def run_backend_and_rag_e2e() -> Dict[str, Any]:
    await scraper_redis_coordinator.clear_stop_signal()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://e2e.carafood.local") as client:
        # Warm-up da pool assíncrona PostgreSQL 16 + Redis 7
        health_res = await client.get("/api/v1/moderation/scraper/status")
        assert health_res.status_code == 200, f"Falha em /scraper/status: {health_res.text}"
        status_json = health_res.json()
        logger.info(
            f"[Check 0] Cluster online -> Restaurantes={status_json['active_restaurants_db']}, "
            f"Vetores 1536d={status_json['indexed_vectors_1536_db']}, "
            f"Quarentena={status_json['quarantined_dishes_pending_db']}"
        )

        # ----------------------------------------------------------------------
        # TESTE 1: GET /api/v1/restaurants (Paginação, Ordenação Bayesiana W_R, 53 Bairros)
        # ----------------------------------------------------------------------
        logger.info("[1/5] Validando GET /api/v1/restaurants, /neighborhoods/summary e /{slug}...")
        rest_res = await client.get("/api/v1/restaurants?skip=0&limit=15&sort_by=bayesian")
        assert rest_res.status_code == 200, f"Status inesperado: {rest_res.status_code}"
        restaurants_page = rest_res.json()
        assert len(restaurants_page) >= 10, f"Esperado >= 10 restaurantes na página 1, obtido {len(restaurants_page)}"

        # Verifica ordenação não-crescente por bayesian_rating (W_R)
        ratings = [float(r["bayesian_rating"]) for r in restaurants_page]
        assert ratings == sorted(ratings, reverse=True), (
            f"Restaurantes fora de ordem bayesiana W_R: {ratings}"
        )
        assert any(len(r["dishes_preview"]) > 0 for r in restaurants_page), (
            "Nenhum restaurante retornou pratos aprovados em dishes_preview!"
        )

        # Verifica resumo dos 53 bairros oficiais
        neigh_res = await client.get("/api/v1/restaurants/neighborhoods/summary")
        assert neigh_res.status_code == 200
        neigh_data = neigh_res.json()
        assert neigh_data["total_official_neighborhoods"] == 53, (
            f"Esperado 53 bairros oficiais, obtido {neigh_data['total_official_neighborhoods']}"
        )

        # Verifica página detalhada de restaurante + reviews LGPD SHA-256
        sample_slug = restaurants_page[0]["slug"]
        detail_res = await client.get(f"/api/v1/restaurants/{sample_slug}")
        assert detail_res.status_code == 200
        detail_json = detail_res.json()
        assert detail_json["slug"] == sample_slug
        assert len(detail_json["menu_by_category"]) >= 1
        for rev in detail_json["reviews"]:
            assert len(rev["author_hash"]) == 64, f"Hash SHA-256 inválido: {rev['author_hash']}"
            assert rev["author_hash_short"].startswith("sha256:")
        logger.info(
            f"   -> OK: Vitrine retornou {len(restaurants_page)} estabelecimentos ordenados por W_R "
            f"(Top 1: {restaurants_page[0]['name']} W_R={ratings[0]:.2f})."
        )

        # ----------------------------------------------------------------------
        # TESTE 2: GET /api/v1/moderation/pending-promotions & /price-drops
        # ----------------------------------------------------------------------
        logger.info("[2/5] Validando Fila de Quarentena e Histórico de Preços...")
        pending_res = await client.get("/api/v1/moderation/pending-promotions")
        assert pending_res.status_code == 200
        pending_items = pending_res.json()
        assert len(pending_items) >= 10, (
            f"Esperado >= 10 pratos na fila de quarentena, obtido {len(pending_items)}"
        )

        drops_res = await client.get("/api/v1/moderation/price-drops")
        assert drops_res.status_code == 200
        price_mutations = drops_res.json()
        assert len(price_mutations) >= 10, (
            f"Esperado >= 10 pratos com histórico em dish_price_history, obtido {len(price_mutations)}"
        )
        logger.info(
            f"   -> OK: {len(pending_items)} pratos em quarentena e {len(price_mutations)} séries de preço auditadas."
        )

        # ----------------------------------------------------------------------
        # TESTE 3: POST /api/v1/moderation/dishes/{id}/approve -> Trigger SQL + Vetor 1536d + RAG/Marketplace
        # ----------------------------------------------------------------------
        logger.info("[3/5] Validando Aprovação em 1 Clique -> Trigger PostgreSQL -> Vetor 1536d -> Visibilidade Imediata...")
        candidate = pending_items[0]
        cand_id = candidate["id"]
        cand_name = candidate["dish_name"]
        cand_rest_slug = candidate["restaurant_slug"]
        cand_rest_id = uuid.UUID(candidate["restaurant_id"])

        async with AsyncSessionLocal() as session:
            before_rest = (
                await session.execute(select(Restaurant).where(Restaurant.id == cand_rest_id))
            ).scalar_one()
            before_active_cnt = int(before_rest.active_dishes_count or 0)

        approve_res = await client.post(f"/api/v1/moderation/dishes/{cand_id}/approve")
        assert approve_res.status_code == 200, f"Erro ao aprovar prato: {approve_res.text}"
        approve_json = approve_res.json()
        assert approve_json["status"] == "approved"
        assert approve_json["is_available"] is True
        assert approve_json["requires_moderation"] is False
        assert approve_json["vector_1536_indexed"] is True

        # Verifica no PostgreSQL que o trigger atualizou active_dishes_count e o vetor tem 1536 dimensões
        async with AsyncSessionLocal() as session:
            after_rest = (
                await session.execute(select(Restaurant).where(Restaurant.id == cand_rest_id))
            ).scalar_one()
            after_active_cnt = int(after_rest.active_dishes_count or 0)
            assert after_active_cnt == before_active_cnt + 1, (
                f"Trigger fn_update_restaurant_Counters não incrementou active_dishes_count "
                f"({before_active_cnt} -> {after_active_cnt})"
            )

            vec_dim_row = (
                await session.execute(
                    text(
                        "SELECT vector_dims(embedding) AS dims, needs_reindexing "
                        "FROM dishes WHERE id = :did"
                    ),
                    {"did": uuid.UUID(cand_id)},
                )
            ).mappings().one()
            assert int(vec_dim_row["dims"]) == 1536, f"Dimensão incorreta: {vec_dim_row['dims']}"
            assert vec_dim_row["needs_reindexing"] is False

        # Verifica visibilidade imediata no Marketplace
        rest_after_res = await client.get(f"/api/v1/restaurants/{cand_rest_slug}")
        assert rest_after_res.status_code == 200
        rest_after_dishes = [d["id"] for d in rest_after_res.json()["dishes"]]
        assert cand_id in rest_after_dishes, (
            f"Prato aprovado {cand_id} não apareceu imediatamente em /restaurants/{cand_rest_slug}!"
        )

        # Verifica visibilidade imediata no Motor RAG SVL-RRF buscando pelo nome exato do prato aprovado
        rag_probe_res = await client.post(
            "/api/v1/chat/query",
            json={"query": cand_name, "limit": 8},
        )
        assert rag_probe_res.status_code == 200
        rag_probe_ids = [r["dish_id"] for r in rag_probe_res.json()["recommendations"]]
        assert cand_id in rag_probe_ids, (
            f"Prato recém-aprovado '{cand_name}' ({cand_id}) não foi recuperado imediatamente pelo SVL-RRF!"
        )

        # Restaura o item de volta à quarentena se restarem < 11 itens para manter idempotência da demonstração UI
        if len(pending_items) <= 11:
            async with AsyncSessionLocal() as session:
                d_restore = (
                    await session.execute(select(Dish).where(Dish.id == uuid.UUID(cand_id)))
                ).scalar_one()
                d_restore.is_available = False
                d_restore.requires_moderation = True
                await session.commit()

        logger.info(
            f"   -> OK: Prato '{cand_name}' aprovado, trigger incrementou contador ({before_active_cnt}->{after_active_cnt}), "
            f"vetor 1536d indexado e recuperado imediatamente no Marketplace e no SVL-RRF!"
        )

        # ----------------------------------------------------------------------
        # TESTE 4: POST /api/v1/chat/query e /api/v1/chat/stream (< 350ms + Precisão Dietética 100%)
        # ----------------------------------------------------------------------
        logger.info("[4/5] Validando Motor Híbrido SVL-RRF (< 350ms) e Streaming SSE com Segurança Alimentar...")
        dietary_prompt = "Quais opções sem lactose ou veganas estão disponíveis hoje?"

        t0 = time.perf_counter()
        chat_sync_res = await client.post(
            "/api/v1/chat/query",
            json={
                "query": dietary_prompt,
                "user_lat": -23.6204,
                "user_lon": -45.4132,
                "limit": 8,
            },
        )
        elapsed_sync_ms = (time.perf_counter() - t0) * 1000.0
        assert chat_sync_res.status_code == 200, f"Erro em /chat/query: {chat_sync_res.text}"
        chat_sync_json = chat_sync_res.json()
        recs = chat_sync_json["recommendations"]

        assert len(recs) >= 3, f"Esperado >= 3 recomendações compatíveis, obtido {len(recs)}"
        assert elapsed_sync_ms < 350.0, (
            f"Violação de SLA SVL-RRF: {elapsed_sync_ms:.2f}ms excedeu o limite de 350ms!"
        )
        for item in recs:
            assert item["is_lactose_free"] is True or item["is_vegan"] is True, (
                f"VIOLAÇÃO FATAL DE SEGURANÇA ALIMENTAR: Prato incompatível retornado: {item}"
            )

        # Valida endpoint SSE (/api/v1/chat/stream)
        t_sse = time.perf_counter()
        sse_events: List[Dict[str, Any]] = []
        async with client.stream(
            "POST",
            "/api/v1/chat/stream",
            json={
                "query": dietary_prompt,
                "user_lat": -23.6204,
                "user_lon": -45.4132,
                "limit": 6,
            },
        ) as stream_res:
            assert stream_res.status_code == 200
            raw_body = (await stream_res.aread()).decode("utf-8")

        elapsed_sse_ms = (time.perf_counter() - t_sse) * 1000.0
        for block in raw_body.split("\n\n"):
            for line in block.splitlines():
                if line.startswith("data:"):
                    sse_events.append(json.loads(line[5:].strip()))

        event_types = [e["type"] for e in sse_events]
        assert "metadata" in event_types, f"Evento SSE 'metadata' ausente: {event_types}"
        assert "token" in event_types, f"Eventos SSE 'token' ausentes: {event_types}"
        assert event_types[-1] == "done", f"Evento final SSE não é 'done': {event_types}"

        meta_evt = next(e for e in sse_events if e["type"] == "metadata")
        assert float(meta_evt["latency_ms"]) < 350.0, (
            f"Latência retrieval SSE ({meta_evt['latency_ms']}ms) > 350ms!"
        )
        for item in meta_evt["recommendations"]:
            assert item["is_lactose_free"] is True or item["is_vegan"] is True, (
                f"Violação dietética no stream SSE: {item}"
            )

        logger.info(
            f"   -> OK: SVL-RRF retornou {len(recs)} pratos 100% compatíveis em {elapsed_sync_ms:.2f}ms "
            f"(SSE completo={elapsed_sse_ms:.2f}ms, {len(sse_events)} frames SSE)."
        )

    await scraper_redis_coordinator.close()
    await async_engine.dispose()
    return {
        "svl_rrf_sync_ms": round(elapsed_sync_ms, 2),
        "svl_rrf_sse_ms": round(elapsed_sse_ms, 2),
        "sse_frames": len(sse_events),
    }


def verify_nextjs_typescript_and_build() -> None:
    logger.info("[5/5] Validando Compilação Estrita TypeScript (`npx tsc --noEmit`) e Build Next.js (`npm run build`)...")
    npx_cmd = shutil.which("npx.cmd") or shutil.which("npx")
    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    assert npx_cmd and npm_cmd, "Node.js / npm / npx não encontrados no PATH!"

    tsc_proc = subprocess.run(
        [npx_cmd, "tsc", "--noEmit"],
        cwd=str(FRONTEND_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if tsc_proc.returncode != 0:
        logger.error(f"STDOUT tsc:\n{tsc_proc.stdout}\nSTDERR tsc:\n{tsc_proc.stderr}")
        raise AssertionError(f"npx tsc --noEmit falhou com código {tsc_proc.returncode}")
    logger.info("   -> OK: `npx tsc --noEmit` retornou EXIT CODE 0 (zero erros de tipagem).")

    build_proc = subprocess.run(
        [npm_cmd, "run", "build"],
        cwd=str(FRONTEND_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if build_proc.returncode != 0:
        logger.error(f"STDOUT build:\n{build_proc.stdout}\nSTDERR build:\n{build_proc.stderr}")
        raise AssertionError(f"npm run build falhou com código {build_proc.returncode}")
    logger.info("   -> OK: `npm run build` compilou todas as rotas Next.js com EXIT CODE 0!")


def main() -> None:
    metrics = asyncio.run(run_backend_and_rag_e2e())
    verify_nextjs_typescript_and_build()
    logger.info("======================================================================")
    logger.info(f"✅ CONVERGÊNCIA FULL-STACK E2E 100% APROVADA! Métricas: {metrics}")
    logger.info("======================================================================")


if __name__ == "__main__":
    main()
