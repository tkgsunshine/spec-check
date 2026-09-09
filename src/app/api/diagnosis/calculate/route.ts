import { NextResponse } from 'next/server';
import { DiagnosisInputV3 } from '@/types/spec-check';
import { runDiagnosisV3, runDiagnosisV3Async } from '@/lib/score-engine';
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

    if (body.employmentType !== 'UNEMPLOYED') {
      const hasCompanyName = Boolean(body.companyName && body.companyName.trim() !== '');
      const hasCompanyCategory = Boolean(body.companyCategory && String(body.companyCategory).trim() !== '');
      if (!hasCompanyName && !hasCompanyCategory) {
        return NextResponse.json(
          { error: '「勤務先・企業名」または「勤務先企業規模」のどちらか一方を必ず入力・選択してください。' },
          { status: 400 }
        );
      }
    }

    // 1. スコア計算の実行 (Gemini AI非同期試行 ➔ 失敗時は安全な同期エンジンへフォールバック)
    let result;
    try {
      result = await runDiagnosisV3Async(body);
    } catch (calcError) {
      console.error('Async diagnosis engine failed, falling back to sync engine:', calcError);
      result = runDiagnosisV3(body);
    }

    // 2. DB保存処理 (完全非同期化・絶対エラー無視)
    // 保存処理の失敗がユーザーへの結果返却を妨害しないよう独立保護
    saveDiagnosis(result).catch(saveError => {
      console.error('Background saveDiagnosis error (non-fatal):', saveError);
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Diagnosis calculation error:', error);
    return NextResponse.json(
      { error: error?.message || '診断スコアの計算中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
