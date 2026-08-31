import { NextResponse } from 'next/server';
import { COMMON_OCCUPATION_MASTER, INDUSTRY_MASTER, getOccupationsByIndustryId } from '@/lib/datasets/japan-stats';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industryId = searchParams.get('industryId');

  if (industryId) {
    const occupations = getOccupationsByIndustryId(industryId);
    return NextResponse.json({ occupations });
  }

  return NextResponse.json({
    industries: INDUSTRY_MASTER,
    occupations: COMMON_OCCUPATION_MASTER,
  });
}
