import { NextResponse } from 'next/server';
import { searchCompanies } from '@/lib/datasets/company-master';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  const companies = searchCompanies(q, 12);
  return NextResponse.json({ companies });
}
