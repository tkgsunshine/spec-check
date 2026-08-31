'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicShareResult } from '@/types/spec-check';
import { Sparkles, Heart, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function SharePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = use(params);
  const [data, setData] = useState<PublicShareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/share/${shareToken}`);
        const json = await res.json();
        if (json.success) {
          setData(json.shareResult);
        }
      } catch (e) {
        console.error('Failed to load share data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchShare();
  }, [shareToken]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (data) {
      const genderTextJa = data.gender === 'FEMALE' ? '女性' : '男性';
      document.title = `${data.age}歳${genderTextJa}（${data.prefectureName}）の人間スペック＆恋愛偏差値診断結果共有カード | 人間スペック診断`;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-semibold">共有カード読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-200 mb-2">共有カードが見つかりません</h2>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm inline-block">
            自分で診断してみる
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Header Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-extrabold mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          人間スペック診断 公式共有カード
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 leading-tight">
          {data.age}歳 {data.gender === 'MALE' ? '男性' : '女性'} ({data.prefectureName}) の同世代人間スペック＆恋愛偏差値結果
        </h1>
      </div>

      {/* 獲得二つ名 (Epithet Card - カセットの上に配置) */}
      {(data.epithet || data.loveEpithet) && (
        <div className="mb-6 p-5 rounded-3xl bg-slate-950/90 border border-amber-500/50 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-3">
          {data.epithet && (
            <div>
              <div className={`text-2xl md:text-3xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${data.epithet.rarityColor} drop-shadow-sm pt-1`}>
                『 {data.epithet.title} 』
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed max-w-lg mx-auto">
                {data.epithet.subtitle}
              </p>
            </div>
          )}
          {data.loveEpithet && (
            <div className={data.epithet ? 'border-t border-slate-800/80 pt-3' : ''}>
              <div className="text-[10px] font-bold text-rose-400 mb-0.5">💖 恋愛二つ名</div>
              <div className={`text-xl md:text-2xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${data.loveEpithet.rarityColor} drop-shadow-sm`}>
                『 {data.loveEpithet.title} 』
              </div>
              <p className="text-[11px] text-rose-200/80 font-medium mt-1 leading-relaxed max-w-lg mx-auto">
                {data.loveEpithet.subtitle}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Scores Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Spec Card */}
        <div className="glass-card rounded-3xl p-6 text-center border-indigo-500/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-400 mb-2">
            <Sparkles className="w-4 h-4" /> 総合スペック
          </div>
          <div className="text-5xl md:text-6xl font-black gradient-text-indigo mb-2">
            {data.japanOverallScore} <span className="text-lg text-slate-400 font-normal">/100</span>
          </div>
          <p className="text-xs text-slate-400">同世代公的統計データ比較</p>
        </div>

        {/* Love Spec Card */}
        <div className="glass-card rounded-3xl p-6 text-center border-rose-500/30">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
            <Heart className="w-4 h-4 fill-rose-400" /> 恋愛スペック
          </div>
          <div className="text-5xl md:text-6xl font-black gradient-text-pink mb-2">
            {data.loveOverallScore} <span className="text-lg text-slate-400 font-normal">/100</span>
          </div>
          <p className="text-xs text-slate-400">統計モデルによる推定</p>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
          比較要素サマリー
        </h3>
        <div className="space-y-3">
          {data.metricSummary.map((m: any) => (
            <div key={m.metricCode} className="flex items-center justify-between py-2 border-b border-slate-800/40 text-xs">
              <span className="font-semibold text-slate-300">{m.metricName}</span>
              <div className="flex items-center gap-3">
                {m.hasOfficialTopPercent && m.topPercent !== null && (
                  <span className="text-indigo-400 font-bold">
                    上位 {m.topPercent}%
                  </span>
                )}
                <span className="font-mono font-bold text-slate-100">{m.score}点</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
        >
          あなたも 人間スペック診断 で自分の位置を測定する <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
