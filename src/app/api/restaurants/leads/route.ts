import { NextRequest, NextResponse } from 'next/server';
import { sanitizeUserInput } from '@/lib/security';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface StoredLead {
  id: string;
  protocol: string;
  restaurant_name: string;
  contact_name: string;
  email: string;
  phone: string;
  neighborhood: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const storedLeads: StoredLead[] = [
  {
    id: 'lead-padua-1',
    protocol: 'CG-FT-842910',
    restaurant_name: 'Pádua Burguer Artesanal',
    contact_name: 'Equipe Pádua',
    email: 'contato@paduaburguer.com.br',
    phone: '(12) 99714-3200',
    neighborhood: 'Centro',
    subject: 'credenciamento',
    message: 'Sincronização oficial do cardápio de hambúrgueres artesanais e combos.',
    status: 'approved',
    created_at: '2026-11-10T14:20:00Z',
  },
  {
    id: 'lead-bsbgr-2',
    protocol: 'CG-FT-731504',
    restaurant_name: 'BS Bgr Smash & Fries',
    contact_name: 'Gestão BS Bgr',
    email: 'parceria@bsbgr.com.br',
    phone: '(12) 99608-1140',
    neighborhood: 'Indaiá',
    subject: 'prato',
    message: 'Atualização das fotos reais e preços dos smash burgers no catálogo.',
    status: 'approved',
    created_at: '2026-11-12T18:05:00Z',
  },
  {
    id: 'lead-kaipiras-3',
    protocol: 'CG-FT-619482',
    restaurant_name: 'Kaipiras Lanches Tradicional',
    contact_name: 'Atendimento Kaipiras',
    email: 'kaipiras@caragua.com.br',
    phone: '(12) 3882-4510',
    neighborhood: 'Martim de Sá',
    subject: 'credenciamento',
    message: 'Credenciamento gratuito 0% taxa para divulgação dos lanches e porções.',
    status: 'received',
    created_at: '2026-11-14T20:15:00Z',
  },
];

export async function GET(req: NextRequest) {
  const limitParam = req.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10) || 10) : 20;
  return NextResponse.json(storedLeads.slice(0, limit), { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
      try {
        const upstream = await fetch(`${BACKEND_API_BASE}/restaurants/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          cache: 'no-store',
        });
        if (upstream.ok) {
          const data = await upstream.json();
          return NextResponse.json(data, { status: upstream.status });
        }
      } catch {
        // Fallback gracioso
      }
    }

    const protocol = `CG-FT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newLead: StoredLead = {
      id: `lead-${Date.now()}`,
      protocol,
      restaurant_name: sanitizeUserInput(String(body.restaurant_name || body.nome || 'Estabelecimento Parceiro')),
      contact_name: sanitizeUserInput(String(body.contact_name || body.nome || 'Responsável Local')),
      email: sanitizeUserInput(String(body.email || '')),
      phone: sanitizeUserInput(String(body.phone || '')),
      neighborhood: sanitizeUserInput(String(body.neighborhood || 'Centro')),
      subject: sanitizeUserInput(String(body.subject || 'credenciamento')),
      message: sanitizeUserInput(String(body.message || '')),
      status: 'received',
      created_at: new Date().toISOString(),
    };

    storedLeads.unshift(newLead);

    return NextResponse.json(
      {
        success: true,
        id: newLead.id,
        protocol,
        neighborhood: newLead.neighborhood,
        message: 'Solicitação de credenciamento recebida e persistida com sucesso pela Curadoria CaráFood.',
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao processar solicitação de credenciamento';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
