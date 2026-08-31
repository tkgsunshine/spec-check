import { NextResponse } from 'next/server';
import { LANGUAGE_MASTER } from '@/lib/datasets/japan-stats';

export async function GET() {
  return NextResponse.json({ languages: LANGUAGE_MASTER });
}
