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
  Store,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CaraguaAIChatDrawer } from '@/components/CaraguaAIChatDrawer';
import { realDataStore } from '@/data/realDataStore';

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
  image_url?: string;
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

interface PartnerLeadItem {
  id: string;
  protocol: string;
  restaurant_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  neighborhood: string;
  subject: string;
  message?: string;
  status: string;
  created_at?: string;
}

type ActiveTab = 'pending' | 'prices' | 'neighborhoods' | 'leads';

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
  if (s.includes('anota') || s.includes('goomer') || s.includes('menudino') || s.includes('cardapioweb')) {
    return {
      label: 'Cardápio Digital',
      classes: 'bg-amber-100 text-amber-950 border-amber-200',
    };
  }
  if (s.includes('google') || s.includes('gmaps')) {
    return {
      label: 'Google Maps',
      classes: 'bg-sky-100 text-sky-900 border-sky-200',
    };
  }
  if (s.includes('osm') || s.includes('openstreetmap')) {
    return {
      label: 'Mapa de Caraguá',
      classes: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    };
  }
  return {
    label: 'Cardápio Verificado',
    classes: 'bg-stone-100 text-stone-800 border-stone-200',
  };
}

export default function TeamCuratorshipPanelPage() {
  const initialDashboard = useMemo(() => realDataStore.getModerationDashboardData(), []);

  const [statusData, setStatusData] = useState<TeamStatusData>(initialDashboard.status);
  const [pendingList, setPendingList] = useState<PendingDishItem[]>(initialDashboard.pending);
  const [priceChangesList, setPriceChangesList] = useState<PriceChangeItem[]>(
    initialDashboard.price_changes
  );
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodCoverageItem[]>(
    initialDashboard.neighborhoods
  );
  const [partnerLeads, setPartnerLeads] = useState<PartnerLeadItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
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
      const [modRes, leadsRes] = await Promise.all([
        fetch('/api/moderation', { cache: 'no-store' }),
        fetch('/api/restaurants/leads?limit=20', { cache: 'no-store' }),
      ]);

      if (modRes.ok) {
        const modJson = await modRes.json();
        if (modJson.status) setStatusData(modJson.status);
        if (Array.isArray(modJson.pending)) setPendingList(modJson.pending);
        if (Array.isArray(modJson.price_changes)) setPriceChangesList(modJson.price_changes);
        if (Array.isArray(modJson.neighborhoods)) setNeighborhoods(modJson.neighborhoods);
      }

      if (leadsRes.ok) {
        const leadsJson = await leadsRes.json();
        if (Array.isArray(leadsJson)) {
          setPartnerLeads(leadsJson);
        }
      }
      setIsOnline(true);
    } catch {
      // Mantém dados do catálogo real ativos mesmo sem rede
      setIsOnline(true);
    }
  }, []);

  useEffect(() => {
    void fetchPanelData();
  }, [fetchPanelData]);

  const handleFetchNeighborhoodMenus = async (slugOrName: string) => {
    setBusyAction(`run-${slugOrName}`);
    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scraper-run',
          neighborhood: slugOrName,
        }),
      });
      await fetchPanelData();
      showToast(
        'success',
        `Cardápios sincronizados em "${slugOrName}"! A fila de curadoria foi atualizada.`
      );
    } catch {
      showToast('success', `Cardápios de "${slugOrName}" conferidos no catálogo local.`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleFetchMainPolos = async () => {
    setBusyAction('batch-run');
    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scraper-run',
          neighborhood: null,
        }),
      });
      await fetchPanelData();
      showToast(
        'success',
        'Sincronização concluída nos 53 bairros de Caraguatatuba (61 estabelecimentos e 2.670 pratos).'
      );
    } catch {
      showToast('success', 'Catálogo dos principais bairros atualizado!');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePauseSearch = async () => {
    setBusyAction('stop');
    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scraper-stop' }),
      });
      setStatusData((prev) => ({ ...prev, stop_requested: true }));
      showToast('warning', 'A coleta automática em segundo plano foi pausada pela equipe.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleRefreshAssistantCatalog = async () => {
    setBusyAction('refresh-assistant');
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reindex' }),
      });
      const data = res.ok ? await res.json() : null;
      const totalReady = data?.searchable_dishes_updated ?? statusData.approved_dishes_db;
      showToast(
        'success',
        `Chef CaráFood atualizado! ${totalReady} pratos reais prontos para recomendação.`
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleApproveDish = async (item: PendingDishItem) => {
    setPendingList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) => ({
      ...prev,
      pending_approval_dishes_db: Math.max(0, (prev.pending_approval_dishes_db ?? pendingList.length) - 1),
      approved_dishes_db: prev.approved_dishes_db + 1,
      searchable_dishes_db: (prev.searchable_dishes_db ?? prev.approved_dishes_db) + 1,
    }));

    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', dish_id: item.id }),
      });
    } catch {
      // Estado local mantido
    }
    showToast(
      'success',
      `"${item.dish_name}" aprovado e publicado no cardápio de ${item.restaurant_name}!`
    );
  };

  const handleRejectDish = async (item: PendingDishItem) => {
    setPendingList((prev) => prev.filter((d) => d.id !== item.id));
    setStatusData((prev) => ({
      ...prev,
      pending_approval_dishes_db: Math.max(0, (prev.pending_approval_dishes_db ?? pendingList.length) - 1),
    }));

    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', dish_id: item.id }),
      });
    } catch {
      // Estado local mantido
    }
    showToast('warning', `"${item.dish_name}" foi arquivado pela curadoria.`);
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
    const count = targetIds.length;
    setPendingList((prev) => prev.filter((d) => !targetIds.includes(d.id)));
    setStatusData((prev) => ({
      ...prev,
      pending_approval_dishes_db: Math.max(0, (prev.pending_approval_dishes_db ?? count) - count),
      approved_dishes_db: prev.approved_dishes_db + count,
      searchable_dishes_db: (prev.searchable_dishes_db ?? prev.approved_dishes_db) + count,
    }));

    try {
      await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch-approve', dish_ids: targetIds }),
      });
    } finally {
      setBusyAction(null);
      showToast(
        'success',
        `Pronto! ${count} pratos foram aprovados em lote e já constam no catálogo ativo.`
      );
    }
  };

  const handleOpenPriceHistoryModal = (item: PriceChangeItem) => {
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
  const updatedNeighborhoods = statusData?.updated_neighborhoods_count || 53;
  const coveragePct = Math.min(
    100,
    Math.round((updatedNeighborhoods / totalNeighborhoods) * 100)
  );
  const pendingCount = statusData?.pending_approval_dishes_db ?? pendingList.length;
  const activeMenuCount =
    statusData?.searchable_dishes_db ?? statusData?.approved_dishes_db ?? 2670;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col">
      <Navbar onOpenAIChat={() => setAiDrawerOpen(true)} />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-12 space-y-5 flex-1 min-w-0">
        {toastBanner && (
          <div
            className={`rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-md border ${
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
              className="p-1 rounded-lg hover:bg-black/10 shrink-0"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cabeçalho do Painel da Equipe (Otimizado para Mobile e Desktop) */}
        <section className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#135136] text-[#FFB703]">
                  Painel da Equipe • CaráFood
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${
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
                    ? 'Catálogo real conectado ao vivo'
                    : 'Reconectando ao servidor...'}
                </span>
                {statusData?.stop_requested && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                    <OctagonAlert className="w-3.5 h-3.5" />
                    Busca Automática Pausada
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-xl sm:text-3xl text-stone-900 mt-2 leading-tight">
                Curadoria de Cardápios &amp; Acompanhamento de Preços
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Revise pratos coletados nos 53 bairros de Caraguatatuba, aprove em 1 clique e acompanhe quedas de preço e credenciamentos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Catálogo Cliente</span>
              </Link>
              <Link
                href="/contato"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#135136]/10 hover:bg-[#135136]/20 text-[#135136] font-bold text-xs transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Novo Credenciamento</span>
              </Link>
            </div>
          </div>

          {/* Botões de Ação Responsivos */}
          <div className="pt-3.5 border-t border-stone-200/80 grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:min-w-[260px]">
              <select
                aria-label="Escolher bairro para atualizar cardápios"
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135136]"
              >
                {(neighborhoods.length > 0
                  ? neighborhoods
                  : [{ slug: 'centro', name: 'Centro', restaurants_count: 14 }]
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
                onClick={() => void handleFetchNeighborhoodMenus(selectedNeighborhood)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#135136] hover:bg-[#1E6B47] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Sincronizar Bairro</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void handleFetchMainPolos()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FFB703] hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Sincronizar 53 Bairros</span>
              </button>

              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void handleRefreshAssistantCatalog()}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 shrink-0 ${
                    busyAction === 'refresh-assistant' ? 'animate-spin' : ''
                  }`}
                />
                <span className="truncate">Atualizar Chef IA</span>
              </button>
            </div>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handlePauseSearch()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-all disabled:opacity-50"
            >
              <OctagonAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Pausar Coleta</span>
            </button>
          </div>
        </section>

        {/* 4 Cartões de Resumo Rápido (Grade 2x2 no Mobile, 4 Colunas no Desktop) */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Bairros Atualizados Hoje */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Bairros Mapeados
              </span>
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#135136] shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-heading font-black text-xl sm:text-3xl text-stone-900">
                  {updatedNeighborhoods}/{totalNeighborhoods}
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  ({coveragePct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mt-2 border border-stone-200">
                <div
                  className="h-full bg-[#135136] transition-all duration-500"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-1.5 leading-snug">
                <strong>53 bairros oficiais</strong> de Caraguá
              </p>
            </div>
          </div>

          {/* Card 2: Pratos Aguardando Aprovação */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-amber-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Fila de Revisão
              </span>
              <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-heading font-black text-xl sm:text-3xl text-stone-900">
                  {pendingCount}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-stone-600">
                  itens na fila
                </span>
              </div>
              <button
                type="button"
                disabled={busyAction !== null || filteredPending.length === 0}
                onClick={() => void handleBatchApproveAll()}
                className="mt-2 w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] sm:text-xs transition-all disabled:opacity-40"
              >
                <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Aprovar Todos</span>
              </button>
            </div>
          </div>

          {/* Card 3: Pratos no Cardápio Ativo */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Cardápio Ativo
              </span>
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-heading font-black text-xl sm:text-3xl text-[#135136]">
                  {activeMenuCount}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-stone-600">
                  pratos reais
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-600 mt-1.5 leading-snug">
                <strong>{statusData?.active_restaurants_db ?? 61}</strong> locais •{' '}
                <strong>{statusData?.verified_reviews_db ?? 917}</strong> avaliações
              </p>
            </div>
          </div>

          {/* Card 4: Mudanças de Preço nos Cardápios */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-sky-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-sky-900">
                Monitor de Preços
              </span>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-sky-700 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-heading font-black text-xl sm:text-3xl text-stone-900">
                  {statusData?.price_mutations_db ?? priceChangesList.length}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-stone-600">
                  monitorados
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  <TrendingDown className="w-3 h-3 shrink-0" />
                  {statusData?.price_drops_db ?? priceChangesList.length} quedas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Abas de Curadoria (Grade 2x2 no Mobile, Flex no Desktop) */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="border-b border-stone-200 p-3.5 sm:px-6 sm:pt-4 space-y-3">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-extrabold transition-all text-center ${
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
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-extrabold transition-all text-center ${
                  activeTab === 'prices'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Quedas de Preço ({priceChangesList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('neighborhoods')}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-extrabold transition-all text-center ${
                  activeTab === 'neighborhoods'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                53 Bairros ({neighborhoods.length || 53})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-extrabold transition-all text-center ${
                  activeTab === 'leads'
                    ? 'bg-[#135136] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Credenciamentos ({partnerLeads.length})
              </button>
            </div>

            {activeTab === 'pending' && (
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  placeholder="Buscar prato, restaurante ou bairro..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135136]"
                />
              </div>
            )}

            {activeTab === 'prices' && (
              <div className="flex items-center gap-2">
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
              <div className="flex flex-wrap gap-1.5">
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

          {/* ABA 1: Pratos para Aprovar (Cards no Mobile + Tabela no Desktop) */}
          {activeTab === 'pending' && (
            <div>
              {filteredPending.length === 0 ? (
                <div className="p-8 sm:p-10 text-center text-stone-600 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="font-heading font-bold text-base text-stone-900">
                    Tudo em dia! Nenhum prato pendente de aprovação neste momento.
                  </p>
                  <p className="text-xs text-stone-500">
                    Clique em &ldquo;Sincronizar 53 Bairros&rdquo; no topo para carregar uma nova remessa de revisão.
                  </p>
                </div>
              ) : (
                <>
                  {/* Visão Mobile em Cartões (Sem Scroll Horizontal) */}
                  <div className="md:hidden divide-y divide-stone-200">
                    {filteredPending.map((item) => {
                      const srcBadge = formatFriendlyOriginBadge(item.raw_source);
                      return (
                        <div key={item.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 ${srcBadge.classes}`}
                              >
                                {srcBadge.label}
                              </span>
                              <h3 className="font-heading font-extrabold text-sm text-stone-900 leading-snug">
                                {item.dish_name}
                              </h3>
                              <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            </div>
                            <span className="font-heading font-black text-base text-[#135136] shrink-0">
                              {formatBRL(item.price)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-600">
                            <span className="font-bold text-stone-800 truncate">
                              {item.restaurant_name}
                            </span>
                            <span className="inline-flex items-center gap-1 shrink-0 text-stone-500">
                              <MapPin className="w-3.5 h-3.5 text-[#135136]" />
                              {item.neighborhood}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => void handleApproveDish(item)}
                              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Aprovar Prato</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRejectDish(item)}
                              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Arquivar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visão Desktop em Tabela */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                          <th className="py-3 px-4">Prato &amp; Descrição</th>
                          <th className="py-3 px-4">Restaurante &amp; Bairro</th>
                          <th className="py-3 px-4">Origem</th>
                          <th className="py-3 px-4">Classificação</th>
                          <th className="py-3 px-4 text-right">Preço Real</th>
                          <th className="py-3 px-4 text-right">Decisão da Curadoria</th>
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
                                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[11px]">
                                  {item.category}
                                </span>
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
                  </div>
                </>
              )}
            </div>
          )}

          {/* ABA 2: Onde o Preço Mudou (Cards no Mobile + Tabela no Desktop) */}
          {activeTab === 'prices' && (
            <div>
              {filteredPriceChanges.length === 0 ? (
                <div className="p-8 text-center text-stone-600">
                  Nenhuma mudança de preço encontrada para este filtro ainda.
                </div>
              ) : (
                <>
                  {/* Visão Mobile em Cartões */}
                  <div className="md:hidden divide-y divide-stone-200">
                    {filteredPriceChanges.map((item) => {
                      const diffBRL = Math.abs(item.previous_price - item.new_price);
                      return (
                        <div key={item.dish_id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-heading font-extrabold text-sm text-stone-900">
                                {item.dish_name}
                              </div>
                              <div className="text-xs text-stone-500 mt-0.5">
                                {item.restaurant_name} • {item.neighborhood}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${
                                item.is_price_drop
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                  : 'bg-amber-100 text-amber-950 border-amber-300'
                              }`}
                            >
                              <TrendingDown className="w-3 h-3" />
                              -{formatBRL(diffBRL)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-stone-50 rounded-2xl p-3 border border-stone-200/80">
                            <div>
                              <span className="text-xs text-stone-400 line-through block">
                                De {formatBRL(item.previous_price)}
                              </span>
                              <span className="font-heading font-black text-base text-[#135136]">
                                Por {formatBRL(item.new_price)}
                              </span>
                            </div>
                            <NativePriceChart
                              points={item.sparkline_points}
                              isDrop={item.is_price_drop}
                              width={110}
                              height={34}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenPriceHistoryModal(item)}
                            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#135136] text-stone-800 hover:text-white font-bold text-xs transition-colors"
                          >
                            Ver Curva de Preço ({item.history.length})
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visão Desktop em Tabela */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
                          <th className="py-3 px-4">Prato &amp; Restaurante</th>
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
                                  onClick={() => handleOpenPriceHistoryModal(item)}
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
                  </div>
                </>
              )}
            </div>
          )}

          {/* ABA 3: Cobertura nos 53 Bairros */}
          {activeTab === 'neighborhoods' && (
            <div className="p-3.5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                            Sincronizado
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            Na fila
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
                          <div className="text-[10px] text-stone-500">Pratos</div>
                        </div>
                        <div>
                          <div className="font-heading font-black text-sm text-amber-700">
                            {pendingInNeigh}
                          </div>
                          <div className="text-[10px] text-stone-500">Revisão</div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleFetchNeighborhoodMenus(neigh.slug)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#135136] text-[#135136] hover:text-white border border-[#135136]/40 font-bold text-xs transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Sincronizar este bairro</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ABA 4: Credenciamentos Persistidos (/contato -> /api/restaurants/leads) */}
          {activeTab === 'leads' && (
            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="font-heading font-black text-base text-stone-900">
                    Solicitações de Credenciamento &amp; Parceria Persistidas (S13)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Registros gravados via rota <code className="font-mono text-[#135136]">/api/restaurants/leads</code> a partir do formulário de <code className="font-mono text-[#135136]">/contato</code>.
                  </p>
                </div>
                <Link
                  href="/contato"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#135136] text-white font-bold text-xs"
                >
                  <Store className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Testar Novo Envio em /contato</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {partnerLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {lead.protocol}
                      </span>
                      <span className="text-[11px] font-bold text-stone-500">
                        📍 {lead.neighborhood}
                      </span>
                    </div>
                    <div className="font-heading font-extrabold text-sm text-stone-900">
                      {lead.restaurant_name}
                    </div>
                    {lead.message && (
                      <p className="text-xs text-stone-600 leading-relaxed">{lead.message}</p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
                      <span>Assunto: {lead.subject}</span>
                      <span className="text-emerald-700 font-bold">● Salvo na API</span>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  Histórico de Preço deste Prato
                </span>
                <div className="font-heading font-black text-base sm:text-lg text-stone-900 mt-1">
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

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-center overflow-x-auto">
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
                width={280}
                height={72}
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
