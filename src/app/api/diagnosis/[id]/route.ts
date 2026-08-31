import { NextResponse } from 'next/server';
import { getDiagnosisById } from '@/lib/storage/diagnosis-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = getDiagnosisById(id);

  if (!result) {
    return NextResponse.json({ error: '診断結果が見つかりません。' }, { status: 404 });
  }

  return NextResponse.json({ success: true, result });
}
