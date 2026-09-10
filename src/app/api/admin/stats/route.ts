import { NextResponse } from 'next/server';
import { getAllDiagnosesForAdmin, getDiagnosisStatsSummary, getDiagnosisCollectionName } from '@/lib/storage/diagnosis-store';

export async function GET() {
  try {
    const summary = await getDiagnosisStatsSummary();
    const records = await getAllDiagnosesForAdmin(200);
    const collectionName = getDiagnosisCollectionName();
    const isProduction = process.env.VERCEL_ENV === 'production' || process.env.APP_ENV === 'production';

    return NextResponse.json({
      success: true,
      environment: isProduction ? 'production' : 'development',
      collectionName,
      summary,
      recordsCount: records.length,
      records,
    });
  } catch (error: unknown) {
    console.error('Admin stats API error:', error);
    return NextResponse.json(
      { error: '管理者データの取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
