"""
Gate Automatizado de Verificação E2E:
1. Dados Reais de Caraguatatuba (OpenStreetMap + Playwright + Enriquecimento Coerente) no PostgreSQL 16 + pgvector
2. Varredura Estrita Zero-Jargão nas Telas do Consumidor e da Equipe (Next.js TSX)
3. Auditoria das Respostas ao Vivo da API e do Chef CaráFood (Zero siglas robóticas / Zero colchetes [..._REMOVIDO])
4. Compilação Limpa TypeScript + Artefato de Build Next.js
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple

BACKEND_ROOT = Path(__file__).resolve().parents[1]
MONOREPO_ROOT = BACKEND_ROOT.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from httpx import ASGITransport, AsyncClient
from sqlalchemy import and_, func, or_, select

from app.db.models.dish import Dish
from app.db.models.restaurant import Restaurant
from app.db.session import AsyncSessionLocal, async_engine
from app.main import app

# Telas principais auditadas quanto à Regra de Ouro Human-First (Zero-Jargon)
FRONTEND_TARGET_FILES: List[Path] = [
    MONOREPO_ROOT / "src" / "components" / "CaraguaAIChatDrawer.tsx",
    MONOREPO_ROOT / "src" / "components" / "Navbar.tsx",
    MONOREPO_ROOT / "src" / "app" / "layout.tsx",
    MONOREPO_ROOT / "src" / "app" / "page.tsx",
    MONOREPO_ROOT / "src" / "app" / "restaurants" / "[slug]" / "page.tsx",
    MONOREPO_ROOT / "src" / "app" / "moderation" / "page.tsx",
    MONOREPO_ROOT / "src" / "app" / "rankings" / "page.tsx",
]

# Lista negra estrita de jargões técnicos proibidos na interface e no chat
FORBIDDEN_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    ("SVL-RRF", re.compile(r"SVL-RRF", re.IGNORECASE)),
    ("RRF", re.compile(r"\bRRF\b")),
    ("pgvector", re.compile(r"pgvector", re.IGNORECASE)),
    ("1536d", re.compile(r"1536d?", re.IGNORECASE)),
    ("PostGIS", re.compile(r"PostGIS", re.IGNORECASE)),
    ("Trava SQL", re.compile(r"Trava\s+SQL", re.IGNORECASE)),
    ("HNSW", re.compile(r"\bHNSW\b", re.IGNORECASE)),
    ("Assistente IA Hiperlocal", re.compile(r"Assistente\s+IA\s+Hiperlocal", re.IGNORECASE)),
    ("Marketplace Hiperlocal", re.compile(r"Marketplace\s+Hiperlocal", re.IGNORECASE)),
    ("Catálogo Canônico", re.compile(r"Cat[aá]logo\s+Can[oô]nico", re.IGNORECASE)),
    ("Entidade Canônica", re.compile(r"Entidade\s+Can[oô]nica", re.IGNORECASE)),
    ("Bayesian / Bayesiano", re.compile(r"bayesian[oa]?", re.IGNORECASE)),
    ("Score W_R / W_R", re.compile(r"\bW_R\b")),
    ("H(R,C)", re.compile(r"H\s*\(\s*R\s*,\s*C\s*\)")),
    ("Trigram / pg_trgm", re.compile(r"(pg_trgm|Trigram\s+Similarity)", re.IGNORECASE)),
    ("Uber H3 / h3_res", re.compile(r"(\bH3\b|h3_res\d*|\bUber\s+H3\b)")),
    ("Geohash", re.compile(r"geohash", re.IGNORECASE)),
    ("SRID", re.compile(r"\bSRID\b", re.IGNORECASE)),
    ("POINT(", re.compile(r"POINT\s*\(")),
    ("ST_DWithin", re.compile(r"ST_DWithin", re.IGNORECASE)),
    ("SHA-256 / sha256", re.compile(r"sha-?256", re.IGNORECASE)),
    ("PII_SANITIZED", re.compile(r"PII_SANITIZED", re.IGNORECASE)),
    ("Tokens [..._REMOVIDO]", re.compile(r"[A-Z0-9_]+_REMOVIDO")),
    ("Quarentena", re.compile(r"quarentena", re.IGNORECASE)),
    ("ACID", re.compile(r"\bACID\b")),
    ("Upsert", re.compile(r"\bupsert\b", re.IGNORECASE)),
    ("Token Bucket", re.compile(r"Token\s+Bucket", re.IGNORECASE)),
    ("Checkpoints", re.compile(r"checkpoint", re.IGNORECASE)),
    ("HINCRBY", re.compile(r"HINCRBY", re.IGNORECASE)),
    ("dish_price_history", re.compile(r"dish_price_history", re.IGNORECASE)),
    ("Command Center", re.compile(r"Command\s+Center", re.IGNORECASE)),
    ("Decaimento Exponencial", re.compile(r"Decaimento\s+Exponencial", re.IGNORECASE)),
    ("Z-Score", re.compile(r"Z-Score", re.IGNORECASE)),
]


def scan_text_for_jargon(text: str) -> List[Tuple[str, str]]:
    violations: List[Tuple[str, str]] = []
    for label, pattern in FORBIDDEN_PATTERNS:
        match = pattern.search(text)
        if match:
            snippet_start = max(0, match.start() - 25)
            snippet_end = min(len(text), match.end() + 25)
            snippet = text[snippet_start:snippet_end].replace("\n", " ")
            violations.append((label, snippet))
    return violations


async def gate_1_verify_real_osm_caragua_data() -> Dict[str, object]:
    raw_dir = BACKEND_ROOT / "data" / "raw"
    snapshot_file = raw_dir / "osm_caragua_live_snapshot.json"
    osm_payload_files = sorted(raw_dir.glob("payload_osm_real_*.json"))

    assert snapshot_file.exists(), f"Snapshot OSM ausente: {snapshot_file}"
    assert len(osm_payload_files) >= 10, (
        f"Esperados >= 10 arquivos payload_osm_real_*.json, encontrados {len(osm_payload_files)}"
    )

    async with AsyncSessionLocal() as session:
        osm_rest_stmt = select(Restaurant).where(
            and_(
                Restaurant.is_active.is_(True),
                or_(
                    Restaurant.source_platform.ilike("osm%"),
                    Restaurant.slug.ilike("osm-%"),
                ),
            )
        )
        osm_restaurants = list((await session.execute(osm_rest_stmt)).scalars().all())

        osm_ids = [r.id for r in osm_restaurants]
        assert len(osm_restaurants) >= 20, (
            f"Esperados >= 20 estabelecimentos reais OpenStreetMap em Caraguatatuba, encontrados {len(osm_restaurants)}"
        )

        osm_dishes_stmt = select(func.count(Dish.id)).where(
            and_(
                Dish.restaurant_id.in_(osm_ids),
                Dish.is_available.is_(True),
                Dish.requires_moderation.is_(False),
                Dish.embedding.is_not(None),
            )
        )
        osm_indexed_dishes = int((await session.execute(osm_dishes_stmt)).scalar() or 0)
        assert osm_indexed_dishes >= 40, (
            f"Esperados >= 40 pratos ativos indexados em estabelecimentos reais OSM, encontrados {osm_indexed_dishes}"
        )

        total_active_rest = int(
            (
                await session.execute(
                    select(func.count(Restaurant.id)).where(Restaurant.is_active.is_(True))
                )
            ).scalar()
            or 0
        )
        total_indexed_dishes = int(
            (
                await session.execute(
                    select(func.count(Dish.id)).where(
                        and_(
                            Dish.is_available.is_(True),
                            Dish.requires_moderation.is_(False),
                            Dish.embedding.is_not(None),
                        )
                    )
                )
            ).scalar()
            or 0
        )

    sample_places = [
        f"{r.name} ({r.neighborhood})" for r in sorted(osm_restaurants, key=lambda x: x.name)[:10]
    ]
    return {
        "real_osm_establishments_active": len(osm_restaurants),
        "real_osm_indexed_dishes": osm_indexed_dishes,
        "osm_raw_payload_files": len(osm_payload_files),
        "total_active_establishments": total_active_rest,
        "total_indexed_dishes": total_indexed_dishes,
        "sample_real_places": sample_places,
    }


def gate_2_scan_frontend_zero_jargon() -> Dict[str, object]:
    scanned_files: List[str] = []
    all_violations: Dict[str, List[Tuple[str, str]]] = {}

    for fpath in FRONTEND_TARGET_FILES:
        assert fpath.exists(), f"Arquivo frontend obrigatório não encontrado: {fpath}"
        content = fpath.read_text(encoding="utf-8")
        rel_name = str(fpath.relative_to(MONOREPO_ROOT)).replace("\\", "/")
        scanned_files.append(rel_name)
        violations = scan_text_for_jargon(content)
        if violations:
            all_violations[rel_name] = violations

    if all_violations:
        formatted = json.dumps(all_violations, indent=2, ensure_ascii=False)
        raise AssertionError(f"Jargões proibidos detectados nas telas:\n{formatted}")

    return {
        "scanned_files_count": len(scanned_files),
        "scanned_files": scanned_files,
        "violations_found": 0,
    }


async def gate_3_verify_live_api_and_chef_chat() -> Dict[str, object]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Vitrine principal deve trazer estabelecimentos reais do OpenStreetMap
        list_res = await client.get("/api/v1/restaurants?limit=50")
        assert list_res.status_code == 200, f"GET /restaurants falhou: {list_res.status_code}"
        restaurants = list_res.json()
        assert len(restaurants) >= 20, "Lista de restaurantes retornou menos de 20 locais"

        real_osm_in_api = [r for r in restaurants if r.get("is_real_osm")]
        assert len(real_osm_in_api) >= 5, "Estabelecimentos reais OSM não apareceram na vitrine"

        # 2. Detalhe do restaurante e limpeza pública de avaliações (sem [..._REMOVIDO])
        checked_reviews = 0
        for candidate in restaurants[:15]:
            det_res = await client.get(f"/api/v1/restaurants/{candidate['slug']}")
            assert det_res.status_code == 200
            det = det_res.json()
            for rev in det.get("reviews", []):
                checked_reviews += 1
                assert rev.get("author_label") == "Cliente verificado • Morador/Visitante"
                pub_txt = rev.get("public_comment") or rev.get("comment_text") or ""
                assert "_REMOVIDO" not in pub_txt, f"Token bruto vazou na review: {pub_txt}"
                assert "[" not in pub_txt and "]" not in pub_txt, (
                    f"Colchete residual detectado na review pública: {pub_txt}"
                )

        # 3. Resposta do Chef CaráFood (síncrona e streaming) 100% humana e acolhedora
        test_prompts = [
            "Quero comer porção de camarão ou peixe perto da praia em Caraguá",
            "Tem opção vegana ou sem lactose gostosa até R$ 55?",
        ]
        assistant_replies: List[str] = []
        for prompt_text in test_prompts:
            chat_res = await client.post(
                "/api/v1/chat/query",
                json={
                    "query": prompt_text,
                    "user_lat": -23.6226,
                    "user_lon": -45.4124,
                    "limit": 5,
                },
            )
            assert chat_res.status_code == 200, f"POST /chat/query falhou: {chat_res.text}"
            payload = chat_res.json()
            answer = payload.get("answer") or payload.get("reply") or ""
            assert len(answer) > 30, "Resposta do Chef CaráFood veio vazia ou curta demais"

            jargon_hits = scan_text_for_jargon(answer)
            assert not jargon_hits, (
                f"Jargão técnico vazou na resposta do Chef CaráFood: {jargon_hits}\nTexto: {answer}"
            )

            recs = payload.get("recommendations", [])
            assert len(recs) >= 1, f"Nenhuma sugestão retornada para: {prompt_text}"
            assert "friendly_match_label" in recs[0], "friendly_match_label ausente na recomendação"
            assert "distance_label" in recs[0], "distance_label ausente na recomendação"
            assistant_replies.append(answer.splitlines()[0])

        # 4. Verifica status do LLM local Ollama e streaming real token-a-token por restaurante específico
        llm_status_res = await client.get("/api/v1/chat/llm-status")
        assert llm_status_res.status_code == 200
        llm_status = llm_status_res.json()
        assert llm_status.get("ollama_online") is True, (
            f"Ollama local não está online em 127.0.0.1:11434: {llm_status}"
        )

        stream_res = await client.post(
            "/api/v1/chat/stream",
            json={
                "query": "O que você me recomenda pedir hoje no Quiosque Baleia Branca em Martim de Sá?",
                "user_lat": -23.6226,
                "user_lon": -45.4124,
                "limit": 5,
            },
        )
        assert stream_res.status_code == 200
        tokens_joined = ""
        stream_recs = []
        done_mode = ""
        for raw_line in stream_res.text.splitlines():
            if raw_line.startswith("data:"):
                evt = json.loads(raw_line[5:].strip())
                if evt.get("type") == "metadata":
                    stream_recs = evt.get("recommendations", [])
                elif evt.get("type") == "token":
                    tokens_joined += evt.get("content", "")
                elif evt.get("type") == "done":
                    done_mode = evt.get("llm_mode", "")

        assert done_mode == "local_pc", f"Stream não rodou no LLM local Ollama (done_mode={done_mode})"
        assert len(stream_recs) >= 2, "Restaurante específico não retornou pratos do cardápio"
        assert all(
            "baleia branca" in r["restaurant_name"].lower() for r in stream_recs
        ), f"Escopo vazou pratos de outros lugares: {[r['restaurant_name'] for r in stream_recs]}"
        stream_jargon = scan_text_for_jargon(tokens_joined)
        assert not stream_jargon, f"Jargão detectado no streaming do Chef: {stream_jargon}"

    return {
        "api_real_osm_visible_top50": len(real_osm_in_api),
        "public_reviews_verified_clean": checked_reviews,
        "local_ollama_model": llm_status.get("active_model"),
        "single_place_ollama_reply": tokens_joined,
        "chef_sample_openings": assistant_replies,
    }


def gate_4_verify_frontend_typescript_and_build() -> Dict[str, object]:
    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    tsc_proc = subprocess.run(
        [npx_cmd, "tsc", "--noEmit"],
        cwd=str(MONOREPO_ROOT),
        capture_output=True,
        text=True,
        check=False,
    )
    if tsc_proc.returncode != 0:
        raise AssertionError(
            f"Falha em npx tsc --noEmit (exit {tsc_proc.returncode}):\n"
            f"{tsc_proc.stdout}\n{tsc_proc.stderr}"
        )

    build_id_file = MONOREPO_ROOT / ".next" / "BUILD_ID"
    assert build_id_file.exists(), (
        f"Build de produção Next.js (.next/BUILD_ID) não encontrado em {build_id_file}"
    )

    return {
        "tsc_exit_code": 0,
        "nextjs_build_id": build_id_file.read_text(encoding="utf-8").strip(),
    }


async def main() -> None:
    print("=" * 88)
    print("CARÁFOOD — VERIFICAÇÃO AUTOMATIZADA DE DADOS REAIS OSM & UX ZERO-JARGÃO")
    print("=" * 88)

    g1 = await gate_1_verify_real_osm_caragua_data()
    print(f"[PASS] GATE 1 (OpenStreetMap Real Caraguá Data): {json.dumps(g1, ensure_ascii=False)}")

    g2 = gate_2_scan_frontend_zero_jargon()
    print(f"[PASS] GATE 2 (Zero-Jargon TSX Scanner): {json.dumps(g2, ensure_ascii=False)}")

    g3 = await gate_3_verify_live_api_and_chef_chat()
    print(f"[PASS] GATE 3 (Live API & Chef CaráFood Audit): {json.dumps(g3, ensure_ascii=False)}")

    g4 = gate_4_verify_frontend_typescript_and_build()
    print(f"[PASS] GATE 4 (TypeScript & Next.js Production Build): {json.dumps(g4, ensure_ascii=False)}")

    await async_engine.dispose()

    print("=" * 88)
    print("TODOS OS 4 GATES DE DADOS REAIS E HUMAN-FIRST UX APROVADOS COM EXIT CODE 0!")
    print("=" * 88)


if __name__ == "__main__":
    asyncio.run(main())
