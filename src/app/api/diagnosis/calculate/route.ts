import { NextResponse } from 'next/server';
import { DiagnosisInputV3 } from '@/types/spec-check';
import { runDiagnosisV3 } from '@/lib/score-engine';
import { saveDiagnosis } from '@/lib/storage/diagnosis-store';

export async function POST(request: Request) {
  try {
    const body: DiagnosisInputV3 = await request.json();

    if (!body.gender || !body.age || !body.height || !body.weight || body.annualIncome === undefined) {
      return NextResponse.json(
        { error: '必須項目（性別、年齢、身長、体重、年収）が不足しています。' },
        { status: 400 }
      );
    }

    const result = runDiagnosisV3(body);
    saveDiagnosis(result);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error('Diagnosis calculation error:', error);
    return NextResponse.json(
      { error: '診断スコアの計算中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
