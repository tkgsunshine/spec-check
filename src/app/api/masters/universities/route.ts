import { NextResponse } from 'next/server';
import { INITIAL_UNIVERSITIES } from '@/lib/datasets/japan-stats';

function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60));
}
function toHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!rawQ) {
    return NextResponse.json({ universities: INITIAL_UNIVERSITIES.slice(0, 10) });
  }

  const qKata = toKatakana(rawQ);
  const qHira = toHiragana(rawQ);

  const checkString = (target: string) => {
    const t = target.toLowerCase();
    return t.includes(rawQ) || t.includes(qKata) || t.includes(qHira);
  };

  const filtered = INITIAL_UNIVERSITIES.filter(
    u => checkString(u.name) || u.aliases.some(a => checkString(a))
  );

  return NextResponse.json({ universities: filtered });
}
