import { NextResponse } from 'next/server';
import { POSITION_MASTER } from '@/lib/datasets/japan-stats';

export async function GET() {
  return NextResponse.json({ positions: POSITION_MASTER });
}
