import { NextResponse } from 'next/server';
import { realDataStore } from '@/data/realDataStore';

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (BACKEND_API_BASE && !BACKEND_API_BASE.includes('localhost') && !BACKEND_API_BASE.includes('127.0.0.1')) {
    try {
      const response = await fetch(`${BACKEND_API_BASE}/restaurants/neighborhoods/summary`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Segue para fallback
    }
  }

  const summary = realDataStore.getNeighborhoodsSummary();
  return NextResponse.json(summary);
}
