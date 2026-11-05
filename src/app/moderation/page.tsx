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
  Utensils,
  ClipboardCheck,
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

interface TeamStatusData {
  stop_requested: boolean;
  queue_depth: number;
  updated_neighborhoods_count?: number;
  total_official_neighborhoods: number;
  pending_approval_dishes_db?: number;
  active_restaurants_db: number;
  approved_dishes_db: number;
  searchable_dishes_db?: number;
  price_mutations_db: number;
  price_drops_db: number;
  verified_reviews_db?: number;
  system_online?: boolean;
  queried_at: string;
}

interface PendingDishItem {
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

interface PriceChangeItem {
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

interface NeighborhoodCoverageItem {
  slug: string;
  name: string;
  region: string;
  macro: string;
  latitude: number;
  longitude: number;
  restaurants_count: number;
  active_dishes_count: number;
  pending_dishes_count?: number;
  updated_today?: boolean;
}

type ActiveTab = 'pending' | 'prices' | 'neighborhoods';

function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

const NativePriceChart: React.FC<{
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
      aria-label="Evolução recente do preço do prato"
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

function formatFriendlyOriginBadge(source: string | null): { label: string; classes: string } {
  const s = (source || '').toLowerCase();
  if (s.includes('osm') || s.includes('openstreetmap')) {
    return {
      label: 'Mapa de Caraguá',
      classes: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    };
  }
  if (s.includes('ifood')) {
    return {
      label: 'Delivery Local',
      classes: 'bg-rose-100 text-rose-900 border-rose-200',
    };
  }
  if (s.includes('goomer') || s.includes('menudino') || s.includes('cardapioweb')) {
    return {
      label: 'Cardápio Digital',
      classes: 'bg-amber-100 text-amber-950 border-amber-200',
    };
  }
  if (s.includes('google') || s.includes('gmaps')) {
    return {
      label: 'Guia da Cidade',
      classes: 'bg-sky-100 text-sky-900 border-sky-200',
    };
  }
  return {
    label: 'Cardápio Verificado',
    classes: 'bg-stone-100 text-stone-800 border-stone-200',
  };
}

export default function TeamCuratorshipPanelPage() {
  const [statusData, setStatusData] = useState<TeamStatusData | null>(null);
  const [pendingList, setPendingList] = useState<PendingDishItem[]>([]);
  const [priceChangesList, setPriceChangesList] = useState<PriceChangeItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodCoverageItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pending');

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('centro');
  const [pendingSearch, setPendingSearch] = useState<string>('');
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

  const fetchPanelData = useCallback(async () => {
    try {
      const [statusRes, pendRes, priceRes, neighRes] = await Promise.all([
        fetch(`${API_BASE}/moderation/scraper/status`, { cache: 'no-store' }),
        fetch(`${API_BASE}/moderation/pending-promotions?limit=200`, { cache: 'no-store' }),
        fetch(`${API_BASE}/moderation/price-drops?limit=150`, { cache: 'no-store' }),
        fetch(`${API_BASE}/restaurants/neighborhoods/summary`, { cache: 'no-store' }),
      ]);

      if (!statusRes.ok) {
        throw new Error(`Status ${statusRes.status}`);
      }

      const [statusJson, pendJson, priceJson, neighJson] = await Promise.all([
        statusRes.json(),
        pendRes.ok ? pendRes.json() : [],
        priceRes.ok ? priceRes.json() : [],
        neighRes.ok ? neighRes.json() : { neighborhoods: [] },
      ]);

      setStatusData(statusJson);
      setPendingList(Array.isArray(pendJson) ? pendJson : []);
      setPriceChangesList(Array.isArray(priceJson) ? priceJson : []);
      setNeighborhoods(
        Array.isArray(neighJson?.neighborhoods) ? neighJson.neighborhoods : []
      );
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    void fetchPanelData();
    const timer = setInterval(() => {
      void fetchPanelData();
    }, 3000);
    return () => clearInterval(timer);
  }, [fetchPanelData]);

  const handleFetchNeighborhoodMenus = async (slugOrName: string, forceRun = true) => {
    setBusyAction(`run-${slugOrName}`);
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: slugOrName,
          force: forceRun,
          batch_count: 1,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast(
        'success',
        `Buscando cardápios atualizados em "${slugOrName}"! A lista será atualizada em instantes.`
      );
      setTimeout(() => void fetchPanelData(), 900);
    } catch {
      showToast('error', `Não foi possível buscar cardápios em "${slugOrName}" agora.`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleFetchMainPolos = async () => {
    setBusyAction('batch-run');
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood: null,
          force: true,
          batch_count: 8,
          auto_approve_trusted: true,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast(
        'success',
        'Busca automática iniciada nos principais bairros de Caraguá!'
      );
      setTimeout(() => void fetchPanelData(), 1200);
    } catch {
      showToast('error', 'Não foi possível iniciar a busca nos bairros agora.');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePauseSearch = async () => {
    setBusyAction('stop');
    try {
      const res = await fetch(`${API_BASE}/moderation/scraper/stop`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast(
        'warning',
        'A busca automática de cardápios foi pausada pela equipe.'
      );
      await fetchPanelData();
    } catch {
      showToast('error', 'Não foi possível pausar a busca neste momento.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRefreshAssistantCatalog = async () => {
    setBusyAction('refresh-assistant');
    try {
      const res = await fetch(`${API_BASE}/chat/reindex`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_size: 400 }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const totalReady = data.searchable_dishes_updated ?? data.approved_dishes ?? 0;
      showToast(
        'success',
        `Chef CaráFood atualizado com sucesso! ${totalReady} pratos prontos para recomendar.`
      );
      await fetchPanelData();
    } catch {
      showToast('error', 'Não foi possível atualizar as sugestões do Chef CaráFood agora.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleApproveDish = async (item: PendingDishItem) => {
    const snapshot = pendingList;
    setPendingList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) =>
      prev
        ? {
            ...prev,
            pending_approval_dishes_db: Math.max(
              0,
              (prev.pending_approval_dishes_db ?? snapshot.length) - 1
            ),
            approved_dishes_db: prev.approved_dishes_db + 1,
            searchable_dishes_db: (prev.searchable_dishes_db ?? prev.approved_dishes_db) + 1,
          }
        : prev
    );

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/${item.id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast(
        'success',
        `"${item.dish_name}" aprovado e publicado no cardápio de ${item.restaurant_name}!`
      );
    } catch {
      setPendingList(snapshot);
      showToast('error', `Não conseguimos aprovar "${item.dish_name}" agora.`);
    }
  };

  const handleRejectDish = async (item: PendingDishItem) => {
    const snapshot = pendingList;
    setPendingList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) =>
      prev
        ? {
            ...prev,
            pending_approval_dishes_db: Math.max(
              0,
              (prev.pending_approval_dishes_db ?? snapshot.length) - 1
            ),
          }
        : prev
    );

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/${item.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Recusado pela curadoria da equipe CaráFood.',
          archive_permanently: false,
        }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showToast('warning', `"${item.dish_name}" foi recusado e retirado da lista.`);
    } catch {
      setPendingList(snapshot);
      showToast('error', `Não conseguimos recusar "${item.dish_name}" agora.`);
    }
  };

  const filteredPending = useMemo(() => {
    const q = pendingSearch.trim().toLowerCase();
    if (!q) return pendingList;
    return pendingList.filter(
      (item) =>
        item.dish_name.toLowerCase().includes(q) ||
        item.restaurant_name.toLowerCase().includes(q) ||
        item.neighborhood.toLowerCase().includes(q)
    );
  }, [pendingList, pendingSearch]);

  const handleBatchApproveAll = async () => {
    if (filteredPending.length === 0) return;
    setBusyAction('batch-approve');
    const targetIds = filteredPending.map((d) => d.id);
    const snapshot = pendingList;
    setPendingList((prev) => prev.filter((d) => !targetIds.includes(d.id)));

    try {
      const res = await fetch(`${API_BASE}/moderation/dishes/batch-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish_ids: targetIds }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      showToast(
        'success',
        `Pronto! ${data.approved_count} pratos foram aprovados e já aparecem nos cardápios!`
      );
      await fetchPanelData();
    } catch {
      setPendingList(snapshot);
      showToast('error', 'Não foi possível aprovar todos os pratos de uma vez.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleOpenPriceHistoryModal = async (item: PriceChangeItem) => {
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
      // Usa os dados já carregados na tela
    }
    setHistoryModalItem({
      dishName: item.dish_name,
      restaurantName: `${item.restaurant_name} (${item.neighborhood})`,
      points: item.history,
    });
  };

  const filteredPriceChanges = useMemo(() => {
    if (!dropsOnlyFilter) return priceChangesList;
    return priceChangesList.filter((item) => item.delta_percentage < 0);
  }, [priceChangesList, dropsOnlyFilter]);

  const filteredNeighborhoods = useMemo(() => {
    if (regionFilter === 'todas') return neighborhoods;
    return neighborhoods.filter((n) => n.region === regionFilter);
  }, [neighborhoods, regionFilter]);

  const totalNeighborhoods = statusData?.total_official_neighborhoods || 53;
  const updatedNeighborhoods = statusData?.updated_neighborhoods_count || 0;
  const coveragePct = Math.min(
    100,
    Math.round((updatedNeighborhoods / totalNeighborhoods) * 100)
  );
  const pendingCount = statusData?.pending_approval_dishes_db ?? pendingList.length;
  const activeMenuCount =
    statusData?.searchable_dishes_db ?? statusData?.approved_dishes_db ?? 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar onOpenAIChat={() => setAiDrawerOpen(true)} />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
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
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cabeçalho do Painel da Equipe */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]">
                  Painel da Equipe • CaráFood
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
                  {isOnline
                    ? 'Cardápios conectados ao vivo'
                    : 'Reconectando ao servidor...'}
                </span>
                {statusData?.stop_requested && (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                    <OctagonAlert className="w-3.5 h-3.5" />
                    Busca Automática Pausada
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 mt-2">
                Curadoria de Cardápios & Acompanhamento de Preços
              </h1>
              <p className="text-sm text-stone-600 mt-0.5">
                Confira os pratos recém-chegados dos restaurantes de Caraguá, publique no cardápio com um clique e veja onde o preço baixou.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Cardápios como Cliente</span>
              </Link>
            </div>
          </div>

          {/* Botões de Ação Simples e Diretos */}
          <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <select
                aria-label="Escolher bairro para atualizar cardápios"
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135136]"
              >
                {(neighborhoods.length > 0
                  ? neighborhoods
                  : [{ slug: 'centro', name: 'Centro', restaurants_count: 4 }]
                ).map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name} ({n.restaurants_count}{' '}
                    {n.restaurants_count === 1 ? 'local' : 'locais'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void handleFetchNeighborhoodMenus(selectedNeighborhood, true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Buscar Cardápios do Bairro</span>
              </button>
            </div>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleFetchMainPolos()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#FFB703] hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Buscar Novos Cardápios (Principais Bairros)</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleRefreshAssistantCatalog()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  busyAction === 'refresh-assistant' ? 'animate-spin' : ''
                }`}
              />
              <span>Atualizar Sugestões do Chef</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handlePauseSearch()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <OctagonAlert className="w-3.5 h-3.5" />
              <span>Pausar Busca</span>
            </button>
          </div>
        </section>

        {/* 4 Cartões de Resumo Rápido */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Bairros Atualizados Hoje */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Bairros Atualizados Hoje
              </span>
              <MapPin className="w-5 h-5 text-[#135136]" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {updatedNeighborhoods} de {totalNeighborhoods}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  ({coveragePct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mt-2.5 border border-stone-200">
                <div
                  className="h-full bg-[#135136] transition-all duration-500"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Cobertura completa nos <strong>53 bairros oficiais</strong> de Caraguatatuba
              </p>
            </div>
          </div>

          {/* Card 2: Pratos Aguardando Aprovação */}
          <div className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Pratos para Aprovar
              </span>
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {pendingCount}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  aguardando sua revisão
                </span>
              </div>
              <button
                type="button"
                disabled={busyAction !== null || filteredPending.length === 0}
                onClick={() => void handleBatchApproveAll()}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all disabled:opacity-40"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Aprovar Todos da Lista</span>
              </button>
            </div>
          </div>

          {/* Card 3: Pratos no Cardápio Ativo */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Pratos no Cardápio Ativo
              </span>
              <Utensils className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-[#135136]">
                  {activeMenuCount}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  pratos abertos para clientes
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-2">
                <strong>{statusData?.active_restaurants_db ?? 0}</strong> locais abertos •{' '}
                <strong>{statusData?.verified_reviews_db ?? 0}</strong> opiniões de clientes
              </p>
            </div>
          </div>

          {/* Card 4: Mudanças de Preço nos Cardápios */}
          <div className="bg-white rounded-3xl border border-sky-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
                Mudanças de Preço
              </span>
              <Activity className="w-5 h-5 text-sky-700" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-3xl text-stone-900">
                  {statusData?.price_mutations_db ?? priceChangesList.length}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  alterações conferidas
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {statusData?.price_drops_db ?? 0} pratos baixaram de preço
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Abas de Curadoria */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="border-b border-stone-200 px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Pratos para Aprovar ({pendingList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prices')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'prices'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Onde o Preço Mudou ({priceChangesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('neighborhoods')}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  activeTab === 'neighborhoods'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Cobertura nos 53 Bairros ({neighborhoods.length || 53})
              </button>
            </div>

            {activeTab === 'pending' && (
              <div className="relative pb-3 w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  placeholder="Buscar prato, restaurante ou bairro..."
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
                  📉 Mostrar Apenas Onde Baixou
                </button>
              </div>
            )}

            {activeTab === 'neighborhoods' && (
              <div className="pb-3 flex flex-wrap gap-1.5">
                {[
                  { id: 'todas', label: 'Todos (53)' },
                  { id: 'central_comercial', label: 'Centro & Comércio (16)' },
                  { id: 'norte_orla_turistica', label: 'Norte & Praias (16)' },
                  { id: 'sul_expansao_familiar', label: 'Sul & Residencial (21)' },
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

          {/* ABA 1: Pratos para Aprovar */}
          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              {filteredPending.length === 0 ? (
                <div className="p-10 text-center text-stone-600 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-heading font-bold text-base text-stone-900">
                    Tudo em dia! Nenhum prato pendente de aprovação neste momento.
                  </p>
                  <p className="text-xs text-stone-500">
                    Escolha um bairro lá em cima e clique em &ldquo;Buscar Cardápios do Bairro&rdquo; sempre que quiser conferir novidades.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                      <th className="py-3 px-4">Prato & Descrição</th>
                      <th className="py-3 px-4">Restaurante & Bairro</th>
                      <th className="py-3 px-4">Onde Encontramos</th>
                      <th className="py-3 px-4">Restrições Alimentares</th>
                      <th className="py-3 px-4 text-right">Preço</th>
                      <th className="py-3 px-4 text-right">Sua Decisão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {filteredPending.map((item) => {
                      const srcBadge = formatFriendlyOriginBadge(item.raw_source);
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
                              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${srcBadge.classes}`}
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
                                  🥛 Sem Lactose
                                </span>
                              )}
                              {!item.is_vegan &&
                                !item.is_vegetarian &&
                                !item.is_gluten_free &&
                                !item.is_lactose_free && (
                                  <span className="text-stone-400 text-[11px]">
                                    Tradicional
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-heading font-extrabold text-sm text-stone-900">
                            {formatBRL(item.price)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleApproveDish(item)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar no Cardápio</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRejectDish(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Recusar</span>
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

          {/* ABA 2: Onde o Preço Mudou */}
          {activeTab === 'prices' && (
            <div className="overflow-x-auto">
              {filteredPriceChanges.length === 0 ? (
                <div className="p-10 text-center text-stone-600">
                  Nenhuma mudança de preço encontrada para este filtro ainda.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                      <th className="py-3 px-4">Prato & Restaurante</th>
                      <th className="py-3 px-4 text-right">Preço Anterior</th>
                      <th className="py-3 px-4 text-right">Preço Atual</th>
                      <th className="py-3 px-4 text-center">Diferença</th>
                      <th className="py-3 px-4 text-center">Evolução do Preço</th>
                      <th className="py-3 px-4 text-right">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {filteredPriceChanges.map((item) => {
                      const diffBRL = Math.abs(item.previous_price - item.new_price);
                      return (
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
                          <td className="py-3.5 px-4 text-right text-stone-500 line-through">
                            {formatBRL(item.previous_price)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-heading font-extrabold text-sm text-stone-900">
                            {formatBRL(item.new_price)}
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
                              {item.is_price_drop
                                ? `Baixou ${formatBRL(diffBRL)}`
                                : `Subiu ${formatBRL(diffBRL)}`}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex justify-center">
                              <NativePriceChart
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
                              Ver Histórico ({item.history.length})
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ABA 3: Cobertura nos 53 Bairros */}
          {activeTab === 'neighborhoods' && (
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredNeighborhoods.map((neigh) => {
                const updated = Boolean(neigh.updated_today);
                const pendingInNeigh = neigh.pending_dishes_count ?? 0;
                return (
                  <div
                    key={neigh.slug}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      updated
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-stone-50/70 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-heading font-extrabold text-sm text-stone-900">
                            {neigh.name}
                          </div>
                          <span className="text-[10px] font-semibold text-stone-500 uppercase">
                            {neigh.macro}
                          </span>
                        </div>
                        {updated ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Clock className="w-3 h-3" />
                            Atualizado hoje
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            Aguardando busca
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-center bg-white rounded-xl p-2 border border-stone-200/80">
                        <div>
                          <div className="font-heading font-black text-sm text-stone-900">
                            {neigh.restaurants_count}
                          </div>
                          <div className="text-[10px] text-stone-500">Locais</div>
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-[#135136]">
                            {neigh.active_dishes_count}
                          </div>
                          <div className="text-[10px] text-stone-500">No Cardápio</div>
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-amber-700">
                            {pendingInNeigh}
                          </div>
                          <div className="text-[10px] text-stone-500">Pendentes</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleFetchNeighborhoodMenus(neigh.slug, true)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#135136] text-[#135136] hover:text-white border border-[#135136]/40 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Atualizar este bairro</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Janela de Histórico de Preço do Prato */}
      {historyModalItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  Histórico de Preço deste Prato
                </span>
                <div className="font-heading font-black text-lg text-stone-900 mt-1">
                  {historyModalItem.dishName}
                </div>
                <p className="text-xs text-stone-500">
                  {historyModalItem.restaurantName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
                aria-label="Fechar histórico de preço"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-center">
              <NativePriceChart
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
              {historyModalItem.points.map((pt, idx) => {
                const diff = Math.abs(pt.previous_price - pt.new_price);
                return (
                  <div
                    key={`${pt.detected_at}-${idx}`}
                    className="px-4 py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-stone-500 line-through mr-2">
                        {formatBRL(pt.previous_price)}
                      </span>
                      <span className="font-bold text-stone-900">
                        → {formatBRL(pt.new_price)}
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
                        {pt.delta_percentage < 0
                          ? `Baixou ${formatBRL(diff)}`
                          : `Subiu ${formatBRL(diff)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
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
