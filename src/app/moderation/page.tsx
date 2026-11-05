'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  OctagonAlert,
  RefreshCw,
  Database,
  Server,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  MapPin,
  Layers,
  CheckCheck,
  Search,
  Clock,
  ExternalLink,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CaraguaAIChatDrawer } from '@/components/CaraguaAIChatDrawer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ClusterHealth {
  postgres_postgis_pgvector: string;
  redis_7_broker: string;
  embedding_engine: string;
}

interface ScraperStatusPayload {
  backend_mode: string;
  stop_requested: boolean;
  queue_depth: number;
  queued_neighborhoods_preview: string[];
  valid_checkpoints_count: number;
  valid_checkpoints: Record<string, { ttl_seconds: number }>;
  latest_stats?: Record<string, unknown> | null;
  cluster_health: ClusterHealth;
  total_official_neighborhoods: number;
  quarantined_dishes_pending_db: number;
  active_restaurants_db: number;
  approved_dishes_db: number;
  indexed_vectors_1536_db: number;
  price_mutations_db: number;
  price_drops_db: number;
  sanitized_reviews_db: number;
  queried_at: string;
}

interface QuarantineDishItem {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_slug: string;
  neighborhood: string;
  dish_name: string;
  description: string;
  price: number;
  last_price_delta_pct: number;
  category: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_available: boolean;
  requires_moderation: boolean;
  raw_source: string | null;
  created_at: string | null;
}

interface PriceHistoryPoint {
  id?: string;
  previous_price: number;
  new_price: number;
  delta_percentage: number;
  detected_at: string | null;
}

interface PriceMutationRadarItem {
  dish_id: string;
  dish_name: string;
  category: string;
  is_available: boolean;
  restaurant_name: string;
  restaurant_slug: string;
  neighborhood: string;
  previous_price: number;
  new_price: number;
  current_price: number;
  delta_percentage: number;
  is_price_drop: boolean;
  detected_at: string | null;
  sparkline_points: number[];
  history: PriceHistoryPoint[];
}

interface NeighborhoodTopologyItem {
  slug: string;
  name: string;
  region: string;
  macro: string;
  latitude: number;
  longitude: number;
  restaurants_count: number;
  active_dishes_count: number;
  quarantined_dishes_count: number;
  checkpoint_active: boolean;
  checkpoint_ttl_seconds: number;
}

type ActiveTab = 'quarantine' | 'prices' | 'topology';

const NativePriceSparkline: React.FC<{
  points: number[];
  isDrop: boolean;
  width?: number;
  height?: number;
}> = ({ points, isDrop, width = 136, height = 40 }) => {
  const validPoints = points.length >= 2 ? points : [points[0] || 0, points[0] || 0];
  const minVal = Math.min(...validPoints);
  const maxVal = Math.max(...validPoints);
  const span = maxVal - minVal || 1;
  const padX = 5;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = validPoints.map((val, idx) => {
    const x = padX + (idx / Math.max(1, validPoints.length - 1)) * innerW;
    const y = padY + innerH - ((val - minVal) / span) * innerH;
    return { x, y, val };
  });

  const polylineStr = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${coords[0].x.toFixed(1)} ${(height - 2).toFixed(1)} L ${coords
    .map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' L ')} L ${coords[coords.length - 1].x.toFixed(1)} ${(height - 2).toFixed(1)} Z`;

  const strokeColor = isDrop ? '#059669' : '#D97706';
  const fillColor = isDrop ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)';
  const lastPt = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-label="Curva de evolução histórica do preço em BRL"
    >
      <path d={areaPath} fill={fillColor} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylineStr}
      />
      <circle
        cx={lastPt.x}
        cy={lastPt.y}
        r="3.2"
        fill={strokeColor}
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />
    </svg>
  );
};

function formatSourceBadge(source: string | null): { label: string; classes: string } {
  const s = (source || 'verified_catalog').toLowerCase();
  if (s.includes('ifood')) {
    return { label: 'ifood_web', classes: 'bg-rose-100 text-rose-900 border-rose-200' };
  }
  if (s.includes('goomer')) {
    return { label: 'goomer', classes: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
  }
  if (s.includes('menudino') || s.includes('cardapioweb')) {
    return { label: 'menudino', classes: 'bg-amber-100 text-amber-950 border-amber-200' };
  }
  if (s.includes('google') || s.includes('gmaps')) {
    return { label: 'gmaps', classes: 'bg-sky-100 text-sky-900 border-sky-200' };
  }
  return { label: s, classes: 'bg-stone-100 text-stone-800 border-stone-200' };
}

export default function ModerationCommandCenterPage() {
  const [statusData, setStatusData] = useState<ScraperStatusPayload | null>(null);
  const [quarantineList, setQuarantineList] = useState<QuarantineDishItem[]>([]);
  const [priceRadarList, setPriceRadarList] = useState<PriceMutationRadarItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodTopologyItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('quarantine');

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('centro');
  const [quarantineSearch, setQuarantineSearch] = useState<string>('');
  const [dropsOnlyFilter, setDropsOnlyFilter] = useState<boolean>(false);
  const [regionFilter, setRegionFilter] = useState<string>('todas');

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<{
    kind: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const [historyModalItem, setHistoryModalItem] = useState<{
    dishName: string;
    restaurantName: string;
    points: PriceHistoryPoint[];
  } | null>(null);

  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);

  const showToast = useCallback(
    (kind: 'success' | 'warning' | 'error', text: string) => {
      setToastBanner({ kind, text });
      setTimeout(() => {
        setToastBanner((curr) => (curr?.text === text ? null : curr));
      }, 4500);
    },
    []
  );

  const fetchAllTelemetry = useCallback(async () => {
    try {
      const [statusRes, quarRes, priceRes, neighRes] = await Promise.all([
        fetch(`${API_BASE}/moderation/scraper/status`, { cache: 'no-store' }),
        fetch(`${API_BASE}/moderation/pending-promotions?limit=200`, { cache: 'no-store' }),
        fetch(`${API_BASE}/moderation/price-drops?limit=150`, { cache: 'no-store' }),
        fetch(`${API_BASE}/restaurants/neighborhoods/summary`, { cache: 'no-store' }),
      ]);

      if (!statusRes.ok) {
        throw new Error(`Status HTTP ${statusRes.status}`);
      }

      const [statusJson, quarJson, priceJson, neighJson] = await Promise.all([
        statusRes.json(),
        quarRes.ok ? quarRes.json() : [],
        priceRes.ok ? priceRes.json() : [],
        neighRes.ok ? neighRes.json() : { neighborhoods: [] },
      ]);

      setStatusData(statusJson);
      setQuarantineList(Array.isArray(quarJson) ? quarJson : []);
      setPriceRadarList(Array.isArray(priceJson) ? priceJson : []);
      setNeighborhoods(
        Array.isArray(neighJson?.neighborhoods) ? neighJson.neighborhoods : []
      );
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  // Polling de 3 segundos em tempo real (Redis 7 + PostgreSQL 16)
  useEffect(() => {
    void fetchAllTelemetry();
    const timer = setInterval(() => {
      void fetchAllTelemetry();
    }, 3000);
    return () => clearInterval(timer);
  }, [fetchAllTelemetry]);

  const handleTriggerNeighborhood = async (slugOrName: string, forceRun = true) => {
    setBusyAction(`trigger-${slugOrName}`);
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: slugOrName,
          force: forceRun,
          batch_count: 1,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(
        'success',
        `Coleta disparada para '${slugOrName}' (Job ${data.job_id}).`
      );
      setTimeout(() => void fetchAllTelemetry(), 900);
    } catch {
      showToast('error', `Falha ao disparar coleta em '${slugOrName}'.`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleTriggerBatchPolos = async () => {
    setBusyAction('batch-trigger');
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: null,
          force: true,
          batch_count: 8,
          auto_approve_trusted: true,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(
        'success',
        `Varredura em Lote iniciada em 8 polos (Job ${data.job_id}).`
      );
      setTimeout(() => void fetchAllTelemetry(), 1200);
    } catch {
      showToast('error', 'Falha ao iniciar varredura em lote.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleEmergencyStop = async () => {
    setBusyAction('stop');
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/stop`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(
        'warning',
        'Sinal de Parada Cooperativa gravado no Redis 7 com sucesso.'
      );
      await fetchAllTelemetry();
    } catch {
      showToast('error', 'Falha ao enviar sinal de parada ao Redis.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleReindexVectors = async () => {
    setBusyAction('reindex');
    try {
      const res = await fetch(`${API_BASE}/chat/reindex`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_size: 400 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(
        'success',
        `Vetores 1536d sincronizados (${data.marketplace_rag_ready_dishes} pratos prontos no pgvector em ${data.elapsed_ms} ms).`
      );
      await fetchAllTelemetry();
    } catch {
      showToast('error', 'Falha ao sincronizar vetores 1536d no pgvector.');
    } finally {
      setBusyAction(null);
    }
  };

  // Optimistic UI: Aprovação em 1 clique + Indexação 1536d imediata
  const handleApproveDish = async (item: QuarantineDishItem) => {
    const snapshot = quarantineList;
    setQuarantineList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) =>
      prev
        ? {
            ...prev,
            quarantined_dishes_pending_db: Math.max(
              0,
              prev.quarantined_dishes_pending_db - 1
            ),
            approved_dishes_db: prev.approved_dishes_db + 1,
            indexed_vectors_1536_db: prev.indexed_vectors_1536_db + 1,
          }
        : prev
    );

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/${item.id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(
        'success',
        `Prato "${item.dish_name}" aprovado e indexado em 1536d no RAG!`
      );
    } catch {
      setQuarantineList(snapshot);
      showToast('error', `Erro ao aprovar "${item.dish_name}". Estado restaurado.`);
    }
  };

  // Optimistic UI: Rejeição auditada em 1 clique
  const handleRejectDish = async (item: QuarantineDishItem) => {
    const snapshot = quarantineList;
    setQuarantineList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) =>
      prev
        ? {
            ...prev,
            quarantined_dishes_pending_db: Math.max(
              0,
              prev.quarantined_dishes_pending_db - 1
            ),
          }
        : prev
    );

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/${item.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Rejeitado na revisão humana de quarentena via Command Center.',
          archive_permanently: false,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast('warning', `Prato "${item.dish_name}" rejeitado e arquivado.`);
    } catch {
      setQuarantineList(snapshot);
      showToast('error', `Erro ao rejeitar "${item.dish_name}". Estado restaurado.`);
    }
  };

  // Batch Approve ACID
  const handleBatchApproveAll = async () => {
    if (quarantineList.length === 0) return;
    setBusyAction('batch-approve');
    const targetIds = filteredQuarantine.map((d) => d.id);
    const snapshot = quarantineList;
    setQuarantineList((prev) => prev.filter((d) => !targetIds.includes(d.id)));

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/batch-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish_ids: targetIds }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      showToast(
        'success',
        `Aprovação em Lote ACID concluída: ${data.approved_count} pratos publicados e indexados em 1536d!`
      );
      await fetchAllTelemetry();
    } catch {
      setQuarantineList(snapshot);
      showToast('error', 'Falha na aprovação em lote ACID.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleOpenPriceHistoryModal = async (item: PriceMutationRadarItem) => {
    try {
      const res = await fetch(
        `${API_BASE}/moderation/dishes/${item.dish_id}/price-history`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const points: PriceHistoryPoint[] = await res.json();
        setHistoryModalItem({
          dishName: item.dish_name,
          restaurantName: `${item.restaurant_name} (${item.neighborhood})`,
          points,
        });
        return;
      }
    } catch {
      // Fallback para o histórico já embarcado no item
    }
    setHistoryModalItem({
      dishName: item.dish_name,
      restaurantName: `${item.restaurant_name} (${item.neighborhood})`,
      points: item.history,
    });
  };

  const filteredQuarantine = useMemo(() => {
    const q = quarantineSearch.trim().toLowerCase();
    if (!q) return quarantineList;
    return quarantineList.filter(
      (item) =>
        item.dish_name.toLowerCase().includes(q) ||
        item.restaurant_name.toLowerCase().includes(q) ||
        item.neighborhood.toLowerCase().includes(q) ||
        (item.raw_source || '').toLowerCase().includes(q)
    );
  }, [quarantineList, quarantineSearch]);

  const filteredPriceRadar = useMemo(() => {
    if (!dropsOnlyFilter) return priceRadarList;
    return priceRadarList.filter((item) => item.delta_percentage < 0);
  }, [priceRadarList, dropsOnlyFilter]);

  const filteredTopology = useMemo(() => {
    if (regionFilter === 'todas') return neighborhoods;
    return neighborhoods.filter((n) => n.region === regionFilter);
  }, [neighborhoods, regionFilter]);

  const totalNeighborhoods = statusData?.total_official_neighborhoods || 53;
  const activeCheckpoints = statusData?.valid_checkpoints_count || 0;
  const checkpointPct = Math.min(
    100,
    Math.round((activeCheckpoints / totalNeighborhoods) * 100)
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar onOpenAIChat={() => setAiDrawerOpen(true)} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Notificação Operacional */}
        {toastBanner && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between shadow-md border ${
              toastBanner.kind === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastBanner.kind === 'warning'
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-rose-100 text-rose-950 border-rose-300'
            }`}
          >
            <span>{toastBanner.text}</span>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="p-1 rounded-lg hover:bg-black/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HEADER OPERACIONAL & STATUS DO CLUSTER */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]">
                  Command Center Executivo
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                    }`}
                  />
                  PostgreSQL 16 + PostGIS + pgvector:{' '}
                  {isOnline
                    ? statusData?.cluster_health?.postgres_postgis_pgvector || 'online'
                    : 'reconectando'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-200">
                  <Server className="w-3.5 h-3.5 text-sky-700" />
                  Redis 7: {statusData?.backend_mode || 'redis_7_distributed'}
                </span>
                {statusData?.stop_requested && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                    <OctagonAlert className="w-3.5 h-3.5" />
                    Parada Cooperativa Ativa
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                Orquestração de Scraping, Quarentena LGPD & Índices RAG 1536d
              </h1>
              <p className="text-sm text-stone-600 mt-0.5">
                Monitoramento em tempo real (polling 3s) dos 53 bairros oficiais de Caraguatatuba, resolução de entidades H(R,C) e auditoria de preços.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Vitrine Marketplace</span>
              </Link>
            </div>
          </div>

          {/* Barra de Ação Rápida */}
          <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <select
                aria-label="Selecionar bairro para disparo de coleta"
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135136]"
              >
                {(neighborhoods.length > 0
                  ? neighborhoods
                  : [{ slug: 'centro', name: 'Centro', restaurants_count: 4 }]
                ).map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name} ({n.restaurants_count} rest.)
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void handleTriggerNeighborhood(selectedNeighborhood, true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Disparar Coleta no Bairro</span>
              </button>
            </div>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleTriggerBatchPolos()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FFB703] hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Varredura em Lote (Top Polos)</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleReindexVectors()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  busyAction === 'reindex' ? 'animate-spin' : ''
                }`}
              />
              <span>Sincronizar Vetores RAG</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleEmergencyStop()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <OctagonAlert className="w-3.5 h-3.5" />
              <span>Parada de Emergência (Stop)</span>
            </button>
          </div>
        </section>

        {/* GRID DE TELEMETRIA EM TEMPO REAL (4 CARDS ANALÍTICOS) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Bairros Mapeados / Checkpoints 24h */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Checkpoints 24h (Redis)
              </span>
              <MapPin className="w-5 h-5 text-[#135136]" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {activeCheckpoints} / {totalNeighborhoods}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  ({checkpointPct}% ativos)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mt-2.5 border border-stone-200">
                <div
                  className="h-full bg-[#135136] transition-all duration-500"
                  style={{ width: `${checkpointPct}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Fila Redis pendente: <strong>{statusData?.queue_depth ?? 53}</strong> bairros oficiais
              </p>
            </div>
          </div>

          {/* Card 2: Fila de Quarentena */}
          <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Fila de Quarentena
              </span>
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {statusData?.quarantined_dishes_pending_db ?? quarantineList.length}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  pratos aguardando revisão
                </span>
              </div>
              <button
                type="button"
                disabled={busyAction !== null || filteredQuarantine.length === 0}
                onClick={() => void handleBatchApproveAll()}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all disabled:opacity-40"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Aprovar Todos da Fila (Batch Approve)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Catálogo Ativo & Indexado no RAG */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Catálogo Ativo & RAG 1536d
              </span>
              <Database className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-[#135136]">
                  {statusData?.indexed_vectors_1536_db ?? 0}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  vetores 1536d HNSW prontos
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-2">
                <strong>{statusData?.active_restaurants_db ?? 0}</strong> restaurantes deduplicados •{' '}
                <strong>{statusData?.sanitized_reviews_db ?? 0}</strong> reviews LGPD
              </p>
            </div>
          </div>

          {/* Card 4: Mutações de Preço Detectadas */}
          <div className="bg-white rounded-3xl border border-sky-200 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                Radar de Preços Auditados
              </span>
              <Activity className="w-5 h-5 text-sky-700" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {statusData?.price_mutations_db ?? priceRadarList.length}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  registros em dish_price_history
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {statusData?.price_drops_db ?? 0} quedas reais detectadas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ABAS DE TRABALHO */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="border-b border-stone-200 px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('quarantine')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'quarantine'
                    ? 'bg-[#135136] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Fila de Quarentena ({quarantineList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prices')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'prices'
                    ? 'bg-[#135136] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Radar de Preços & Inflação ({priceRadarList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('topology')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'topology'
                    ? 'bg-[#135136] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Topologia dos 53 Bairros ({neighborhoods.length || 53})
              </button>
            </div>

            {activeTab === 'quarantine' && (
              <div className="relative pb-3 w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={quarantineSearch}
                  onChange={(e) => setQuarantineSearch(e.target.value)}
                  placeholder="Filtrar prato, restaurante ou bairro"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>
            )}

            {activeTab === 'prices' && (
              <div className="pb-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDropsOnlyFilter(!dropsOnlyFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    dropsOnlyFilter
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                      : 'bg-stone-50 text-stone-700 border-stone-300'
                  }`}
                >
                  📉 Mostrar Apenas Quedas de Preço
                </button>
              </div>
            )}

            {activeTab === 'topology' && (
              <div className="pb-3 flex flex-wrap gap-1.5">
                {[
                  { id: 'todas', label: 'Todas (53)' },
                  { id: 'central_comercial', label: 'Central & Comercial (16)' },
                  { id: 'norte_orla_turistica', label: 'Norte / Orla (16)' },
                  { id: 'sul_expansao_familiar', label: 'Sul / Familiar (21)' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegionFilter(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      regionFilter === r.id
                        ? 'bg-[#FFB703] text-stone-950'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ABA 1: FILA DE QUARENTENA */}
          {activeTab === 'quarantine' && (
            <div className="overflow-x-auto">
              {filteredQuarantine.length === 0 ? (
                <div className="p-10 text-center text-stone-600 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-heading font-bold text-base text-stone-900">
                    Nenhum prato retido na fila de quarentena para este filtro.
                  </p>
                  <p className="text-xs text-stone-500">
                    Dispare uma nova raspagem por bairro acima para capturar novos itens em staging.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                      <th className="py-3 px-4">Prato & Descrição</th>
                      <th className="py-3 px-4">Estabelecimento & Bairro</th>
                      <th className="py-3 px-4">Origem</th>
                      <th className="py-3 px-4">Segurança Alimentar Inferida</th>
                      <th className="py-3 px-4 text-right">Preço (BRL)</th>
                      <th className="py-3 px-4 text-right">Curadoria 1-Click</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {filteredQuarantine.map((item) => {
                      const srcBadge = formatSourceBadge(item.raw_source);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50/90 transition-colors"
                        >
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-stone-900 text-sm">
                              {item.dish_name}
                            </div>
                            <div className="text-stone-500 line-clamp-2 mt-0.5">
                              {item.description}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-800">
                              {item.restaurant_name}
                            </div>
                            <div className="text-stone-500 inline-flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#135136]" />
                              {item.neighborhood}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${srcBadge.classes}`}
                            >
                              {srcBadge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {item.is_vegan && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                                  🌱 Vegano
                                </span>
                              )}
                              {item.is_vegetarian && !item.is_vegan && (
                                <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 font-bold text-[10px]">
                                  🥗 Vegetariano
                                </span>
                              )}
                              {item.is_gluten_free && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                                  🌾 Sem Glúten
                                </span>
                              )}
                              {item.is_lactose_free && (
                                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 font-bold text-[10px]">
                                  🥛 Zero Lactose
                                </span>
                              )}
                              {!item.is_vegan &&
                                !item.is_vegetarian &&
                                !item.is_gluten_free &&
                                !item.is_lactose_free && (
                                  <span className="text-stone-400 text-[11px]">
                                    Convencional
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-heading font-extrabold text-sm text-stone-900">
                            R$ {item.price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleApproveDish(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>✓ Aprovar e Indexar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRejectDish(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>✕ Rejeitar</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ABA 2: RADAR DE PREÇOS & INFLAÇÃO (SPARKLINE SVG NATIVO) */}
          {activeTab === 'prices' && (
            <div className="overflow-x-auto">
              {filteredPriceRadar.length === 0 ? (
                <div className="p-10 text-center text-stone-600">
                  Nenhuma mutação histórica de preço registrada para este filtro.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                      <th className="py-3 px-4">Prato & Estabelecimento</th>
                      <th className="py-3 px-4 text-right">Preço Anterior</th>
                      <th className="py-3 px-4 text-right">Preço Novo</th>
                      <th className="py-3 px-4 text-center">Variação (Δ%)</th>
                      <th className="py-3 px-4 text-center">Curva Sparkline SVG</th>
                      <th className="py-3 px-4 text-right">Série Temporal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {filteredPriceRadar.map((item) => (
                      <tr
                        key={item.dish_id}
                        className="hover:bg-stone-50/90 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-900 text-sm">
                            {item.dish_name}
                          </div>
                          <div className="text-stone-500 mt-0.5">
                            {item.restaurant_name} • {item.neighborhood}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-stone-500 line-through">
                          R$ {item.previous_price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-heading font-extrabold text-sm text-stone-900">
                          R$ {item.new_price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-xs border ${
                              item.is_price_drop
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-amber-100 text-amber-950 border-amber-300'
                            }`}
                          >
                            {item.is_price_drop ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {item.delta_percentage > 0 ? '+' : ''}
                            {item.delta_percentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex justify-center">
                            <NativePriceSparkline
                              points={item.sparkline_points}
                              isDrop={item.is_price_drop}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => void handleOpenPriceHistoryModal(item)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-[#135136] text-stone-800 hover:text-white font-bold text-xs transition-colors"
                          >
                            Auditar Série ({item.history.length})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ABA 3: TOPOLOGIA DOS 53 BAIRROS DE CARAGUATATUBA */}
          {activeTab === 'topology' && (
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTopology.map((neigh) => {
                const ttlHours = Math.max(
                  0,
                  Math.round(neigh.checkpoint_ttl_seconds / 3600)
                );
                return (
                  <div
                    key={neigh.slug}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      neigh.checkpoint_active
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading font-extrabold text-sm text-stone-900">
                            {neigh.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-stone-500 uppercase">
                            {neigh.macro}
                          </span>
                        </div>
                        {neigh.checkpoint_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Clock className="w-3 h-3" />
                            TTL {ttlHours}h
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            Pendente
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center bg-white rounded-xl p-2 border border-stone-200/80">
                        <div>
                          <div className="font-heading font-black text-sm text-stone-900">
                            {neigh.restaurants_count}
                          </div>
                          <div className="text-[10px] text-stone-500">Rest.</div>
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-[#135136]">
                            {neigh.active_dishes_count}
                          </div>
                          <div className="text-[10px] text-stone-500">Ativos</div>
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-amber-700">
                            {neigh.quarantined_dishes_count}
                          </div>
                          <div className="text-[10px] text-stone-500">Quarent.</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleTriggerNeighborhood(neigh.slug, true)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#135136] text-[#135136] hover:text-white border border-[#135136]/40 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Forçar Raspagem</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal de Série Temporal de Preços (`dish_price_history`) */}
      {historyModalItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  Auditoria Imutável • dish_price_history
                </span>
                <h3 className="font-heading font-black text-lg text-stone-900 mt-1">
                  {historyModalItem.dishName}
                </h3>
                <p className="text-xs text-stone-500">
                  {historyModalItem.restaurantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-center">
              <NativePriceSparkline
                points={
                  historyModalItem.points.length > 0
                    ? [
                        historyModalItem.points[0].previous_price,
                        ...historyModalItem.points.map((p) => p.new_price),
                      ]
                    : [0, 0]
                }
                isDrop={
                  (historyModalItem.points[historyModalItem.points.length - 1]
                    ?.delta_percentage ?? 0) < 0
                }
                width={320}
                height={76}
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-stone-200 border border-stone-200 rounded-2xl">
              {historyModalItem.points.map((pt, idx) => (
                <div
                  key={`${pt.detected_at}-${idx}`}
                  className="px-4 py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-stone-500 line-through mr-2">
                      R$ {pt.previous_price.toFixed(2)}
                    </span>
                    <span className="font-bold text-stone-900">
                      → R$ {pt.new_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded-full ${
                        pt.delta_percentage < 0
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {pt.delta_percentage > 0 ? '+' : ''}
                      {pt.delta_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CaraguaAIChatDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </div>
  );
}
