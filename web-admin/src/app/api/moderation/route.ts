import { NextRequest, NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';
import { serverIdentityStore } from '@/lib/serverIdentityStore';

const approvedDishIds = new Set<string>();
const rejectedDishIds = new Set<string>();
let stopRequested = false;

export async function GET() {
  try {
    const base = realDataStore.getModerationDashboardData();
    const pendingFiltered = base.pending.filter(
      (item) => !approvedDishIds.has(item.id) && !rejectedDishIds.has(item.id)
    );
    const approvedDelta = approvedDishIds.size;

    return NextResponse.json(
      {
        status: {
          ...base.status,
          stop_requested: stopRequested,
          pending_approval_dishes_db: pendingFiltered.length,
          approved_dishes_db: base.status.approved_dishes_db + approvedDelta,
          searchable_dishes_db: base.status.searchable_dishes_db + approvedDelta,
          queried_at: new Date().toISOString(),
        },
        pending: pendingFiltered,
        price_changes: base.price_changes,
        neighborhoods: base.neighborhoods,
        copyright_claims: serverIdentityStore.getCopyrightClaims(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao consultar painel de curadoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || '';

    if (action === 'approve' && body.dish_id) {
      approvedDishIds.add(String(body.dish_id));
      return NextResponse.json({
        success: true,
        dish_id: body.dish_id,
        status: 'approved',
      });
    }

    if (action === 'reject' && body.dish_id) {
      rejectedDishIds.add(String(body.dish_id));
      return NextResponse.json({
        success: true,
        dish_id: body.dish_id,
        status: 'rejected',
      });
    }

    if (action === 'batch-approve' && Array.isArray(body.dish_ids)) {
      for (const id of body.dish_ids) {
        approvedDishIds.add(String(id));
      }
      return NextResponse.json({
        success: true,
        approved_count: body.dish_ids.length,
      });
    }

    if (action === 'scraper-stop') {
      stopRequested = true;
      return NextResponse.json({
        success: true,
        stop_requested: true,
      });
    }

    if (action === 'scraper-run') {
      stopRequested = false;
      // Restaura a fila caso todos tenham sido aprovados/rejeitados para permitir nova rodada de testes
      if (approvedDishIds.size > 0 || rejectedDishIds.size > 0) {
        approvedDishIds.clear();
        rejectedDishIds.clear();
      }
      return NextResponse.json({
        success: true,
        stop_requested: false,
        neighborhood: body.neighborhood || 'todos',
      });
    }

    if (action === 'reindex') {
      const base = realDataStore.getModerationDashboardData();
      return NextResponse.json({
        success: true,
        searchable_dishes_updated: base.status.approved_dishes_db + approvedDishIds.size,
      });
    }

    if (action === 'resolve-copyright-claim' && body.protocol) {
      const newStatus =
        body.new_status === 'Mídia Removida'
          ? 'Mídia Removida'
          : 'Aprovado e Atualizado';
      const updated = serverIdentityStore.resolveCopyrightClaim(
        String(body.protocol),
        newStatus
      );
      return NextResponse.json({
        success: Boolean(updated),
        claim: updated,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao executar ação de curadoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
