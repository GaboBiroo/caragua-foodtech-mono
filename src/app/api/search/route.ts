import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_RESTAURANTS } from '@/data/caraguaData';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const polo = searchParams.get('polo');

  let results = INITIAL_RESTAURANTS;
  if (polo) {
    results = results.filter(r => r.neighborhood.toLowerCase().includes(polo.toLowerCase()));
  }

  if (q) {
    results = results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.neighborhood.toLowerCase().includes(q) ||
      r.dishes.some(d => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({ success: true, count: results.length, results });
}
