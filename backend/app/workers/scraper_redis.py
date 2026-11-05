"""
==============================================================================
CARÁFOOD (Caraguá FoodTech) — MÓDULO 4: COORDENAÇÃO TOPOLÓGICA NO REDIS
==============================================================================
Implementa `ScraperRedisCoordinator`:
1. Fila Distribuída dos 53 Bairros (`caragua:scraper:queue:neighborhoods`) com priorização
   de zonas de alta densidade gastronômica.
2. Checkpointing com TTL de 24h (`caragua:scraper:checkpoint:{neighborhood_slug}`).
3. Rate-Limiting por Domínio via Token Bucket Atômico em Lua (`caragua:scraper:ratelimit:{domain}`).
4. Telemetria Atômica em Tempo Real (`caragua:scraper:stats:latest` via HINCRBY) e
   Sinalização de Parada Graciosa (`caragua:scraper:control:stop`).
5. Circuit Breaker Resiliente: Opera nativamente no Redis 7 (`caragua_foodtech_redis:6379`)
   com réplica de estado local compatível caso o broker esteja temporariamente inacessível.
"""

from __future__ import annotations

import asyncio
import fnmatch
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import urlparse

import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("scraper_redis")
logger.setLevel(logging.INFO)

# Chaves canônicas no Redis
KEY_QUEUE_LIST = "caragua:scraper:queue:neighborhoods"
KEY_QUEUE_SET = "caragua:scraper:queue:members"
KEY_CHECKPOINT_PREFIX = "caragua:scraper:checkpoint:"
KEY_RATELIMIT_PREFIX = "caragua:scraper:ratelimit:"
KEY_STATS_HASH = "caragua:scraper:stats:latest"
KEY_CONTROL_STOP = "caragua:scraper:control:stop"

DEFAULT_CHECKPOINT_TTL_SECONDS = 86400  # 24 horas

# Prioridade de varredura: polos gastronômicos de alta densidade em Caraguatatuba
HIGH_DENSITY_PRIORITY_SLUGS: List[str] = [
    "centro",
    "martim-de-sa",
    "indaia",
    "massaguacu",
    "cocanha",
    "praia-das-palmeiras",
    "porto-novo",
    "prainha",
    "camaroeiro",
    "tabatinga",
    "sumare",
    "pereque-mirim",
    "tinga",
    "mococa",
]

# Script Lua atômico para Token Bucket Distribuído no Redis 7
TOKEN_BUCKET_LUA = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill_ms')
local tokens = tonumber(bucket[1])
local last_refill_ms = tonumber(bucket[2])

if tokens == nil or last_refill_ms == nil then
    tokens = capacity
    last_refill_ms = now_ms
else
    local elapsed_sec = math.max(0, (now_ms - last_refill_ms) / 1000.0)
    tokens = math.min(capacity, tokens + (elapsed_sec * refill_rate))
    last_refill_ms = now_ms
end

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_refill_ms', tostring(last_refill_ms))
    redis.call('EXPIRE', key, 3600)
    return {1, 0}
else
    local deficit = requested - tokens
    local wait_ms = math.ceil((deficit / math.max(0.01, refill_rate)) * 1000.0)
    redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_refill_ms', tostring(last_refill_ms))
    redis.call('EXPIRE', key, 3600)
    return {0, wait_ms}
end
"""

TELEMETRY_COUNTER_FIELDS = (
    "restaurants_discovered",
    "restaurants_updated",
    "dishes_quarantined",
    "prices_mutated",
    "errors_count",
)


class _EmbeddedPipeline:
    """Pipeline transacional em memória espelhando a semântica de `redis.asyncio.Pipeline`."""

    def __init__(self, store: "_EmbeddedRedisReplica") -> None:
        self._store = store
        self._ops: List[Tuple[str, Tuple[Any, ...], Dict[str, Any]]] = []

    async def __aenter__(self) -> "_EmbeddedPipeline":
        return self

    async def __aexit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        self._ops.clear()

    def delete(self, *keys: str) -> "_EmbeddedPipeline":
        self._ops.append(("delete", keys, {}))
        return self

    def rpush(self, key: str, *values: str) -> "_EmbeddedPipeline":
        self._ops.append(("rpush", (key, *values), {}))
        return self

    def lpush(self, key: str, *values: str) -> "_EmbeddedPipeline":
        self._ops.append(("lpush", (key, *values), {}))
        return self

    def sadd(self, key: str, *values: str) -> "_EmbeddedPipeline":
        self._ops.append(("sadd", (key, *values), {}))
        return self

    def hset(
        self,
        key: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        mapping: Optional[Dict[str, Any]] = None,
    ) -> "_EmbeddedPipeline":
        self._ops.append(("hset", (key, field, value), {"mapping": mapping}))
        return self

    def hsetnx(self, key: str, field: str, value: Any) -> "_EmbeddedPipeline":
        self._ops.append(("hsetnx", (key, field, value), {}))
        return self

    def hincrby(self, key: str, field: str, amount: int = 1) -> "_EmbeddedPipeline":
        self._ops.append(("hincrby", (key, field, amount), {}))
        return self

    def setex(self, key: str, ttl_seconds: int, value: str) -> "_EmbeddedPipeline":
        self._ops.append(("setex", (key, ttl_seconds, value), {}))
        return self

    async def execute(self) -> List[Any]:
        results: List[Any] = []
        for method_name, args, kwargs in self._ops:
            fn = getattr(self._store, method_name)
            results.append(await fn(*args, **kwargs))
        self._ops.clear()
        return results


class _EmbeddedRedisReplica:
    """
    Réplica de estado em memória de alta fidelidade acionada exclusivamente via Circuit Breaker
    quando o container `caragua_foodtech_redis:6379` encontra-se inacessível.
    """

    def __init__(self) -> None:
        self._lists: Dict[str, List[str]] = {}
        self._sets: Dict[str, Set[str]] = {}
        self._hashes: Dict[str, Dict[str, str]] = {}
        self._strings: Dict[str, str] = {}
        self._expirations: Dict[str, float] = {}

    def _purge_if_expired(self, key: str) -> None:
        exp = self._expirations.get(key)
        if exp is not None and time.monotonic() >= exp:
            self._expirations.pop(key, None)
            self._strings.pop(key, None)
            self._hashes.pop(key, None)
            self._lists.pop(key, None)
            self._sets.pop(key, None)

    def pipeline(self, transaction: bool = True) -> _EmbeddedPipeline:
        return _EmbeddedPipeline(self)

    async def ping(self) -> bool:
        return True

    async def aclose(self) -> None:
        return None

    async def delete(self, *keys: str) -> int:
        removed = 0
        for k in keys:
            self._expirations.pop(k, None)
            if k in self._lists or k in self._sets or k in self._hashes or k in self._strings:
                removed += 1
            self._lists.pop(k, None)
            self._sets.pop(k, None)
            self._hashes.pop(k, None)
            self._strings.pop(k, None)
        return removed

    async def llen(self, key: str) -> int:
        self._purge_if_expired(key)
        return len(self._lists.get(key, []))

    async def lrange(self, key: str, start: int, end: int) -> List[str]:
        self._purge_if_expired(key)
        lst = self._lists.get(key, [])
        if end == -1:
            return list(lst[start:])
        return list(lst[start : end + 1])

    async def rpush(self, key: str, *values: str) -> int:
        self._purge_if_expired(key)
        bucket = self._lists.setdefault(key, [])
        bucket.extend(str(v) for v in values)
        return len(bucket)

    async def lpush(self, key: str, *values: str) -> int:
        self._purge_if_expired(key)
        bucket = self._lists.setdefault(key, [])
        for v in values:
            bucket.insert(0, str(v))
        return len(bucket)

    async def lpop(self, key: str) -> Optional[str]:
        self._purge_if_expired(key)
        bucket = self._lists.get(key)
        if not bucket:
            return None
        return bucket.pop(0)

    async def lrem(self, key: str, count: int, value: str) -> int:
        self._purge_if_expired(key)
        bucket = self._lists.get(key, [])
        before = len(bucket)
        self._lists[key] = [item for item in bucket if item != value]
        return before - len(self._lists[key])

    async def sadd(self, key: str, *values: str) -> int:
        self._purge_if_expired(key)
        s = self._sets.setdefault(key, set())
        before = len(s)
        for v in values:
            s.add(str(v))
        return len(s) - before

    async def srem(self, key: str, *values: str) -> int:
        self._purge_if_expired(key)
        s = self._sets.get(key, set())
        removed = 0
        for v in values:
            if str(v) in s:
                s.remove(str(v))
                removed += 1
        return removed

    async def sismember(self, key: str, value: str) -> bool:
        self._purge_if_expired(key)
        return str(value) in self._sets.get(key, set())

    async def setex(self, key: str, ttl_seconds: int, value: str) -> bool:
        self._strings[key] = str(value)
        self._expirations[key] = time.monotonic() + float(ttl_seconds)
        return True

    async def get(self, key: str) -> Optional[str]:
        self._purge_if_expired(key)
        return self._strings.get(key)

    async def ttl(self, key: str) -> int:
        self._purge_if_expired(key)
        if key not in self._strings and key not in self._hashes:
            return -2
        exp = self._expirations.get(key)
        if exp is None:
            return -1
        return max(0, int(round(exp - time.monotonic())))

    async def scan(self, cursor: int = 0, match: str = "*", count: int = 100) -> Tuple[int, List[str]]:
        for k in list(self._expirations.keys()):
            self._purge_if_expired(k)
        all_keys = set(self._strings.keys()) | set(self._hashes.keys()) | set(self._lists.keys())
        matched = sorted(k for k in all_keys if fnmatch.fnmatch(k, match))
        return 0, matched

    async def hset(
        self,
        key: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        mapping: Optional[Dict[str, Any]] = None,
    ) -> int:
        self._purge_if_expired(key)
        h = self._hashes.setdefault(key, {})
        added = 0
        if field is not None:
            if field not in h:
                added += 1
            h[str(field)] = str(value)
        if mapping:
            for mk, mv in mapping.items():
                if mk not in h:
                    added += 1
                h[str(mk)] = str(mv)
        return added

    async def hsetnx(self, key: str, field: str, value: Any) -> int:
        self._purge_if_expired(key)
        h = self._hashes.setdefault(key, {})
        if str(field) not in h:
            h[str(field)] = str(value)
            return 1
        return 0

    async def hincrby(self, key: str, field: str, amount: int = 1) -> int:
        self._purge_if_expired(key)
        h = self._hashes.setdefault(key, {})
        curr = int(h.get(str(field), "0"))
        updated = curr + int(amount)
        h[str(field)] = str(updated)
        return updated

    async def hgetall(self, key: str) -> Dict[str, str]:
        self._purge_if_expired(key)
        return dict(self._hashes.get(key, {}))

    async def eval(
        self,
        script: str,
        numkeys: int,
        key: str,
        capacity_str: str,
        refill_rate_str: str,
        now_ms_str: str,
        requested_str: str,
    ) -> List[int]:
        """Execução fiel do algoritmo Token Bucket equivalente ao Lua script."""
        self._purge_if_expired(key)
        capacity = float(capacity_str)
        refill_rate = float(refill_rate_str)
        now_ms = float(now_ms_str)
        requested = float(requested_str)

        bucket = self._hashes.setdefault(key, {})
        tokens_raw = bucket.get("tokens")
        last_ms_raw = bucket.get("last_refill_ms")

        if tokens_raw is None or last_ms_raw is None:
            tokens = capacity
            last_ms = now_ms
        else:
            elapsed_sec = max(0.0, (now_ms - float(last_ms_raw)) / 1000.0)
            tokens = min(capacity, float(tokens_raw) + (elapsed_sec * refill_rate))
            last_ms = now_ms

        self._expirations[key] = time.monotonic() + 3600.0
        if tokens >= requested:
            tokens -= requested
            bucket["tokens"] = str(tokens)
            bucket["last_refill_ms"] = str(last_ms)
            return [1, 0]

        deficit = requested - tokens
        wait_ms = int(round((deficit / max(0.01, refill_rate)) * 1000.0))
        bucket["tokens"] = str(tokens)
        bucket["last_refill_ms"] = str(last_ms)
        return [0, max(1, wait_ms)]


_GLOBAL_EMBEDDED_REPLICA = _EmbeddedRedisReplica()


class ScraperRedisCoordinator:
    """
    Máquina de Estados Topológica e Coordenador Distribuído em Redis 7
    para varredura autônoma dos 53 bairros de Caraguatatuba.
    """

    def __init__(self, redis_url: Optional[str] = None, allow_embedded_fallback: bool = True) -> None:
        self.redis_url = redis_url or settings.REDIS_URL
        self.allow_embedded_fallback = allow_embedded_fallback
        self._client: Optional[Any] = None
        self._client_loop_id: Optional[int] = None
        self._using_embedded: bool = False
        self._last_probe_monotonic: float = 0.0

    async def get_client(self) -> Any:
        """
        Retorna cliente Redis 7 conectado ao broker. Se o broker estiver offline e
        `allow_embedded_fallback=True`, comuta via Circuit Breaker para a réplica local,
        re-testando reconexão automática a cada 15 segundos.
        """
        current_loop_id = id(asyncio.get_running_loop())
        now_mono = time.monotonic()

        if (
            self._client is not None
            and self._client_loop_id == current_loop_id
            and (not self._using_embedded or (now_mono - self._last_probe_monotonic) < 15.0)
        ):
            return self._client

        self._last_probe_monotonic = now_mono
        try:
            candidate = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=0.35,
                socket_timeout=2.0,
            )
            await candidate.ping()
            self._client = candidate
            self._client_loop_id = current_loop_id
            self._using_embedded = False
            return self._client
        except Exception as exc:
            if not self.allow_embedded_fallback:
                raise
            if not self._using_embedded:
                logger.warning(
                    f"[RedisCoordinator] Broker Redis indisponível ({exc}). "
                    f"Circuit Breaker ativado em réplica de memória local."
                )
            self._client = _GLOBAL_EMBEDDED_REPLICA
            self._client_loop_id = current_loop_id
            self._using_embedded = True
            return self._client

    @property
    def backend_mode(self) -> str:
        return "embedded_replica" if self._using_embedded else "redis_7_distributed"

    async def close(self) -> None:
        """Encerra graciosamente o pool de conexões Redis."""
        if self._client is not None and not self._using_embedded:
            await self._client.aclose()
        self._client = None
        self._client_loop_id = None

    # ==========================================================================
    # 1. GESTÃO DA FILA DISTRIBUÍDA DOS 53 BAIRROS
    # ==========================================================================

    @staticmethod
    def build_prioritized_order(all_slugs: List[str]) -> List[str]:
        """Ordena os 53 bairros priorizando zonas de alta densidade gastronômica."""
        ordered: List[str] = []
        seen = set()
        for priority_slug in HIGH_DENSITY_PRIORITY_SLUGS:
            if priority_slug in all_slugs and priority_slug not in seen:
                ordered.append(priority_slug)
                seen.add(priority_slug)
        for slug in all_slugs:
            if slug not in seen:
                ordered.append(slug)
                seen.add(slug)
        return ordered

    async def ensure_queue_populated(
        self,
        all_neighborhood_slugs: List[str],
        force_reset: bool = False,
    ) -> int:
        """
        Se a fila estiver vazia (ou force_reset=True), popula com os 53 bairros de
        Caraguatatuba priorizando áreas de alta densidade gastronômica.
        """
        r = await self.get_client()
        if force_reset:
            await r.delete(KEY_QUEUE_LIST, KEY_QUEUE_SET)

        current_len = await r.llen(KEY_QUEUE_LIST)
        if current_len > 0:
            return int(current_len)

        prioritized = self.build_prioritized_order(all_neighborhood_slugs)
        if not prioritized:
            return 0

        async with r.pipeline(transaction=True) as pipe:
            pipe.delete(KEY_QUEUE_SET)
            pipe.rpush(KEY_QUEUE_LIST, *prioritized)
            pipe.sadd(KEY_QUEUE_SET, *prioritized)
            await pipe.execute()

        logger.info(
            f"[RedisCoordinator:{self.backend_mode}] Fila topológica inicializada com "
            f"{len(prioritized)} bairros (Top 5: {prioritized[:5]})."
        )
        return len(prioritized)

    async def enqueue_priority_neighborhood(self, neighborhood_slug: str) -> None:
        """Insere um bairro específico no topo (head) da fila sem duplicar entradas."""
        r = await self.get_client()
        is_member = await r.sismember(KEY_QUEUE_SET, neighborhood_slug)
        if is_member:
            await r.lrem(KEY_QUEUE_LIST, 0, neighborhood_slug)
        async with r.pipeline(transaction=True) as pipe:
            pipe.lpush(KEY_QUEUE_LIST, neighborhood_slug)
            pipe.sadd(KEY_QUEUE_SET, neighborhood_slug)
            await pipe.execute()

    async def pop_next_eligible_neighborhood(self, force: bool = False) -> Optional[str]:
        """
        Retira o próximo bairro elegível da fila.
        Se o bairro já possuir checkpoint válido (< 24h) e `force=False`, é descartado
        deste ciclo sem bloquear os demais bairros da fila.
        """
        r = await self.get_client()
        max_scans = await r.llen(KEY_QUEUE_LIST)
        for _ in range(max(1, int(max_scans))):
            slug = await r.lpop(KEY_QUEUE_LIST)
            if slug is None:
                return None
            await r.srem(KEY_QUEUE_SET, slug)

            if not force and await self.is_checkpoint_valid(slug):
                logger.info(f"[RedisCoordinator] Bairro '{slug}' possui checkpoint ativo (<24h). Pulando.")
                continue
            return str(slug)
        return None

    async def requeue_at_tail(self, neighborhood_slug: str) -> None:
        """
        Protocolo de Falha de Conectividade (Lifecycle Rule 1):
        Realoca o bairro corrente no fim da fila sem gravar checkpoint.
        """
        r = await self.get_client()
        is_member = await r.sismember(KEY_QUEUE_SET, neighborhood_slug)
        if not is_member:
            async with r.pipeline(transaction=True) as pipe:
                pipe.rpush(KEY_QUEUE_LIST, neighborhood_slug)
                pipe.sadd(KEY_QUEUE_SET, neighborhood_slug)
                await pipe.execute()
            logger.warning(f"[RedisCoordinator] Bairro '{neighborhood_slug}' realocado no fim da fila após falha.")

    # ==========================================================================
    # 2. CHECKPOINTING COM TTL DE 24 HORAS (86400s)
    # ==========================================================================

    @staticmethod
    def _checkpoint_key(neighborhood_slug: str) -> str:
        return f"{KEY_CHECKPOINT_PREFIX}{neighborhood_slug}"

    async def is_checkpoint_valid(self, neighborhood_slug: str) -> bool:
        """Retorna True se o bairro já foi coletado dentro da janela vigente de 24h."""
        r = await self.get_client()
        ttl = await r.ttl(self._checkpoint_key(neighborhood_slug))
        return int(ttl) > 0

    async def mark_checkpoint(
        self,
        neighborhood_slug: str,
        metadata: Optional[Dict[str, Any]] = None,
        ttl_seconds: int = DEFAULT_CHECKPOINT_TTL_SECONDS,
    ) -> None:
        """Grava checkpoint atômico com TTL estrito de 86400s (24 horas)."""
        r = await self.get_client()
        payload = {
            "neighborhood_slug": neighborhood_slug,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            **(metadata or {}),
        }
        await r.setex(
            self._checkpoint_key(neighborhood_slug),
            ttl_seconds,
            json.dumps(payload, ensure_ascii=False),
        )

    async def clear_checkpoint(self, neighborhood_slug: str) -> None:
        """Remove o checkpoint de um bairro (utilizado em trigger forçado)."""
        r = await self.get_client()
        await r.delete(self._checkpoint_key(neighborhood_slug))

    async def list_valid_checkpoints(self) -> Dict[str, Dict[str, Any]]:
        """Varre de forma não-bloqueante (SCAN) todos os checkpoints ativos e seus TTLs."""
        r = await self.get_client()
        checkpoints: Dict[str, Dict[str, Any]] = {}
        cursor: int = 0
        pattern = f"{KEY_CHECKPOINT_PREFIX}*"

        while True:
            cursor, keys = await r.scan(cursor=cursor, match=pattern, count=100)
            for key in keys:
                slug = key.replace(KEY_CHECKPOINT_PREFIX, "", 1)
                ttl = await r.ttl(key)
                if int(ttl) > 0:
                    raw_val = await r.get(key)
                    parsed: Dict[str, Any] = {}
                    if raw_val:
                        try:
                            parsed = json.loads(raw_val)
                        except json.JSONDecodeError:
                            parsed = {"raw": raw_val}
                    checkpoints[slug] = {
                        "ttl_seconds": int(ttl),
                        **parsed,
                    }
            if cursor == 0:
                break

        return checkpoints

    # ==========================================================================
    # 3. RATE LIMITING VIA TOKEN BUCKET DISTRIBUÍDO
    # ==========================================================================

    @staticmethod
    def extract_domain(url_or_domain: str) -> str:
        if "://" in url_or_domain:
            parsed = urlparse(url_or_domain)
            return (parsed.netloc or "default").lower().replace(":", "_")
        return (url_or_domain or "default").lower().replace(":", "_")

    async def acquire_rate_limit(
        self,
        url_or_domain: str,
        capacity: int = 4,
        refill_per_second: float = 0.5,
    ) -> float:
        """
        Aplica Token Bucket distribuído para o domínio alvo.
        Se o bucket estiver esgotado, aguarda assincronamente o tempo de recarga.
        """
        r = await self.get_client()
        domain = self.extract_domain(url_or_domain)
        key = f"{KEY_RATELIMIT_PREFIX}{domain}"
        total_waited = 0.0

        while True:
            now_ms = int(time.time() * 1000)
            result = await r.eval(
                TOKEN_BUCKET_LUA,
                1,
                key,
                str(capacity),
                str(refill_per_second),
                str(now_ms),
                "1",
            )
            allowed = int(result[0])
            wait_ms = int(result[1])
            if allowed == 1:
                return round(total_waited, 3)

            sleep_sec = min(10.0, max(0.05, wait_ms / 1000.0))
            total_waited += sleep_sec
            await asyncio.sleep(sleep_sec)

    # ==========================================================================
    # 4. TELEMETRIA EM TEMPO REAL & CONTROLE DE CICLO DE VIDA (START / STOP)
    # ==========================================================================

    async def initialize_telemetry(self, job_id: str, reset_counters: bool = False) -> None:
        """Inicializa os campos da hash `caragua:scraper:stats:latest`."""
        r = await self.get_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        async with r.pipeline(transaction=True) as pipe:
            pipe.delete(KEY_CONTROL_STOP)
            if reset_counters:
                for field in TELEMETRY_COUNTER_FIELDS:
                    pipe.hset(KEY_STATS_HASH, field, 0)
            else:
                for field in TELEMETRY_COUNTER_FIELDS:
                    pipe.hsetnx(KEY_STATS_HASH, field, 0)
            pipe.hset(
                KEY_STATS_HASH,
                mapping={
                    "status": "running",
                    "active_job_id": job_id,
                    "started_at": now_iso,
                    "last_heartbeat": now_iso,
                },
            )
            await pipe.execute()

    async def increment_metric(self, metric_name: str, delta: int = 1) -> int:
        """Incrementa atomicamente via HINCRBY uma métrica operacional e atualiza heartbeat."""
        if metric_name not in TELEMETRY_COUNTER_FIELDS:
            raise ValueError(f"Métrica inválida para telemetria do scraper: {metric_name}")
        r = await self.get_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        async with r.pipeline(transaction=True) as pipe:
            pipe.hincrby(KEY_STATS_HASH, metric_name, delta)
            pipe.hset(KEY_STATS_HASH, "last_heartbeat", now_iso)
            res = await pipe.execute()
        return int(res[0])

    async def update_runtime_state(
        self,
        status: Optional[str] = None,
        current_neighborhood: Optional[str] = None,
    ) -> None:
        """Atualiza o bairro em processamento e o carimbo `last_heartbeat`."""
        r = await self.get_client()
        mapping: Dict[str, str] = {
            "last_heartbeat": datetime.now(timezone.utc).isoformat(),
        }
        if status is not None:
            mapping["status"] = status
        if current_neighborhood is not None:
            mapping["current_neighborhood"] = current_neighborhood
        await r.hset(KEY_STATS_HASH, mapping=mapping)

    async def request_stop(self) -> None:
        """Sinaliza parada cooperativa imediata para qualquer worker ativo."""
        r = await self.get_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        async with r.pipeline(transaction=True) as pipe:
            pipe.setex(KEY_CONTROL_STOP, 3600, "1")
            pipe.hset(
                KEY_STATS_HASH,
                mapping={
                    "status": "stopping",
                    "last_heartbeat": now_iso,
                },
            )
            await pipe.execute()

    async def clear_stop_signal(self) -> None:
        """Remove o sinal de parada cooperativa no Redis e restaura estado idle."""
        r = await self.get_client()
        now_iso = datetime.now(timezone.utc).isoformat()
        async with r.pipeline(transaction=True) as pipe:
            pipe.delete(KEY_CONTROL_STOP)
            pipe.hset(
                KEY_STATS_HASH,
                mapping={
                    "status": "idle",
                    "last_heartbeat": now_iso,
                },
            )
            await pipe.execute()

    async def is_stop_requested(self) -> bool:
        """Verifica se o operador solicitou interrupção via REST API."""
        r = await self.get_client()
        val = await r.get(KEY_CONTROL_STOP)
        return val == "1"

    async def get_full_status(self) -> Dict[str, Any]:
        """Consolida fila, checkpoints ativos e telemetria para `GET /moderation/scraper/status`."""
        r = await self.get_client()
        queue_len = int(await r.llen(KEY_QUEUE_LIST))
        queue_preview = await r.lrange(KEY_QUEUE_LIST, 0, 14)
        raw_stats = await r.hgetall(KEY_STATS_HASH)
        checkpoints = await self.list_valid_checkpoints()
        stop_flag = await self.is_stop_requested()

        telemetry = {
            "restaurants_discovered": int(raw_stats.get("restaurants_discovered", 0)),
            "restaurants_updated": int(raw_stats.get("restaurants_updated", 0)),
            "dishes_quarantined": int(raw_stats.get("dishes_quarantined", 0)),
            "prices_mutated": int(raw_stats.get("prices_mutated", 0)),
            "errors_count": int(raw_stats.get("errors_count", 0)),
            "last_heartbeat": raw_stats.get("last_heartbeat"),
            "started_at": raw_stats.get("started_at"),
        }

        return {
            "backend_mode": self.backend_mode,
            "status": raw_stats.get("status", "idle"),
            "stop_requested": stop_flag,
            "active_job_id": raw_stats.get("active_job_id"),
            "current_neighborhood": raw_stats.get("current_neighborhood") or None,
            "queue_length": queue_len,
            "queue_depth": queue_len,
            "queued_neighborhoods_preview": queue_preview,
            "valid_checkpoints_count": len(checkpoints),
            "valid_checkpoints": checkpoints,
            "telemetry": telemetry,
        }


scraper_redis_coordinator = ScraperRedisCoordinator()
