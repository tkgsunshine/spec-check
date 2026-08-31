import { NextResponse } from 'next/server';
import { COUNTRY_MASTER } from '@/lib/datasets/japan-stats';

export async function GET() {
  return NextResponse.json({ countries: COUNTRY_MASTER });
}
