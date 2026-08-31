import { NextResponse } from 'next/server';
import { getPublicShareResult } from '@/lib/storage/diagnosis-store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;
  const shareResult = getPublicShareResult(shareToken);

  if (!shareResult) {
    return NextResponse.json({ error: '共有データが見つかりません。' }, { status: 404 });
  }

  return NextResponse.json({ success: true, shareResult });
}
