import { NextResponse } from 'next/server';
import { INITIAL_RESTAURANTS } from '@/data/caraguaData';

export async function GET() {
  return NextResponse.json({
    success: true,
    poloCount: 5,
    restaurants: INITIAL_RESTAURANTS
  });
}
