'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverallDiagnosisResultV3 } from '@/types/spec-check';
import { scoreToTopPercent } from '@/lib/score-engine/math-utils';
import {
  Lock,
  Unlock,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface PremiumReportSectionProps {
  result: OverallDiagnosisResultV3;
  diagnosisId: string;
  isLoveMode?: boolean;
  children?: React.ReactNode | ((props: { isUnlocked: boolean }) => React.ReactNode);
}

export default function PremiumReportSection({
  result,
  diagnosisId,
  isLoveMode = false,
  children,
}: PremiumReportSectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`spec_check_unlocked_${diagnosisId}`);
      const params = new URLSearchParams(window.location.search);
      const queryUnlocked = params.get('unlocked') === 'true';

      if (stored === 'true' || queryUnlocked || result.isPremiumUnlocked) {
        setIsUnlocked(true);
        try {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        } catch {}
      }
    }
  }, [diagnosisId, result.isPremiumUnlocked]);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : '',
        }),
      });

      const data = await res.json();
      if (data.mode === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      // シミュレーション決済モード（即時アンロック）
      setTimeout(() => {
        setIsUnlocked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsUnlocked(true);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const { loveOverallScore, gender, age } = {
    loveOverallScore: result.loveOverallScore || 70,
    gender: result.inputSummary?.gender || 'MALE',
    age: result.inputSummary?.age || 26,
  };

  const estimatedMatchCount = Math.min(
    985,
    Math.max(120, Math.round(1000 * Math.pow(loveOverallScore / 100, 1.25) * 0.95))
  );
  const matchRate = (estimatedMatchCount / 10).toFixed(1);

  const targetPartnerAgeRange =
    gender === 'MALE'
      ? `${Math.max(20, age - 5)}歳 〜 ${age + 1}歳`
      : `${age - 1}歳 〜 ${age + 6}歳`;

  return (
    <div className="relative mt-8 rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950/70 backdrop-blur-xl shadow-2xl transition-all duration-500">
      {/* プレミアムヘッダー */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                Deep Analytics Report
              </span>
              {!isUnlocked && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  ✨ プレミアム限定データ
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>プレミアム深層レポート & 詳細分析</span>
              {isUnlocked ? (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  アンロック完了
                </span>
              ) : (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ワンコイン ¥500
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 未アンロック時のヘッダー直通CTAボタン */}
          {!isUnlocked && (
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>¥500 で詳細データを完全アンロック</span>
            </button>
          )}

          {/* 開発・テスト用クイックトグル */}
          <button
            onClick={() => {
              const next = !isUnlocked;
              setIsUnlocked(next);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, String(next));
              }
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isUnlocked ? '🔒 ロック状態をプレビュー' : '⚡ テスト即時アンロック'}
          </button>
        </div>
      </div>

      {/* レポートコンテンツエリア */}
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        {/* 1. 内包された詳細コンポーネント（カテゴリ別カード、総評、強みTOP5・伸びしろ） */}
        {typeof children === 'function' ? children({ isUnlocked }) : children}

        {/* 2. プレミアム専用: 異性1,000人シミュレーション */}
        {(() => {
          const simContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 relative overflow-hidden transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>同世代異性 1,000人マッチング受容シミュレーション</span>
                    {!isUnlocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300">
                  母集団 1,000名
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {/* 推定マッチング可能人数 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">推定マッチング可能人数</span>
                  {isUnlocked ? (
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                      {estimatedMatchCount} <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 my-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-purple-300 filter blur-[4px] select-none font-mono">
                        {estimatedMatchCount}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                      <span className="text-xs text-amber-400 ml-1">🔒</span>
                    </div>
                  )}
                </div>

                {/* 市場受容率（モテ許容度） */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">市場受容率（モテ許容度）</span>
                  {isUnlocked ? (
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {matchRate}%
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 my-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400/80 filter blur-[4px] select-none font-mono">
                        {matchRate}%
                      </span>
                      <span className="text-xs text-amber-400 ml-1">🔒</span>
                    </div>
                  )}
                </div>

                {/* マッチング優位性ランク */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">マッチング優位性ランク</span>
                  {isUnlocked ? (
                    <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                      {loveOverallScore >= 90 ? 'S (超引く手あまた)' : loveOverallScore >= 80 ? 'A (強者ポジション)' : loveOverallScore >= 70 ? 'B+ (優勢)' : 'B (標準)'}
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 my-0.5">
                      <span className="text-xl sm:text-2xl font-black text-amber-300/80 filter blur-[4px] select-none font-mono">
                        {loveOverallScore >= 90 ? 'S (超引く手あまた)' : loveOverallScore >= 80 ? 'A (強者ポジション)' : 'B+ (優勢)'}
                      </span>
                      <span className="text-xs text-amber-400 ml-1">🔒</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>受容度ゲージ</span>
                  <span>上位 {isUnlocked ? `${scoreToTopPercent(loveOverallScore)}%` : '??% 🔒'}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  {isUnlocked ? (
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${matchRate}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full filter blur-[2px] opacity-70 animate-pulse"
                      style={{ width: '60%' }}
                    />
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして1,000人シミュレーションを開示">
                {simContent}
              </Link>
            );
          }
          return simContent;
        })()}

        {/* 3. プレミアム専用: 逆引き相性分布 */}
        {(() => {
          const matchContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>あなたを最も強く求める異性のスペック逆引き分布</span>
                    {!isUnlocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">支持率の高い年齢層</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">{targetPartnerAgeRange}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">{targetPartnerAgeRange}</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block">同世代・近似層からの需要が最多</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">相性の良い相手の年収層</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">
                      {gender === 'FEMALE' ? '年収 700万〜1,500万円' : '年収 400万〜700万円'}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">年収 700万〜1,500万円</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block">価値観の均衡度が極めて高いゾーン</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400">惹かれやすい相手のMBTI特性</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">INFP / ENFP / INFJ</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">INFP / ENFP / INFJ</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block">心理的補完関係・共感度最大化</span>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして逆引き相性分布を開示">
                {matchContent}
              </Link>
            );
          }
          return matchContent;
        })()}

        {/* 4. プレミアム専用: +10点スコアアップの逆引きアクション */}
        {(() => {
          const actionContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>恋愛スコアをあと +10pt 引き上げる具体的ロードマップ</span>
                    {!isUnlocked && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] shrink-0 border border-purple-500/30">
                    STEP 1
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-white block">体型・除脂肪の微調整 (+3〜5pt)</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 mt-0.5">
                        体脂肪率を理想基準（男性14% / 女性21%）へあと2〜3%近づけることで、身体スコアのZスコアが大幅に跳ね上がります。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-400 filter blur-[3px] select-none">体脂肪率を理想基準へ近づけることで身体スコアが大幅に跳ね上がります。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] shrink-0 border border-indigo-500/30">
                    STEP 2
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-white block">顔写真AI解析・清潔感ボーナスの満額獲得 (+5〜7pt)</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 mt-0.5">
                        顔写真を登録していない場合、または自然光・笑顔の清潔感ある写真を登録することで、Gemini AI解析による満額ボーナス（最大+10pt）が確定加算されます。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-400 filter blur-[3px] select-none">自然光・笑顔の清潔感ある写真を登録することで満額ボーナスが確定加算されます。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px] shrink-0 border border-emerald-500/30">
                    STEP 3
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-white block">出会いの主戦場・プラットフォームの最適化</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 mt-0.5">
                        あなたのスペック特性（上位層）を正当に評価してくれる審査制アプリや真剣婚活サービスを選択することで、無駄なマッチングロスを防ぎ成婚・交際発展率が最大化されます。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-slate-400 filter blur-[3px] select-none">あなたのスペック特性を正当に評価してくれるサービスを選択することで交際発展率が最大化されます。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして改善ロードマップを開示">
                {actionContent}
              </Link>
            );
          }
          return actionContent;
        })()}

        {/* 5. 未アンロック時のスタイリッシュなアンロックCTAカード */}
        {!isUnlocked && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900/95 to-indigo-950/80 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/50 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 mx-auto flex items-center justify-center shadow-xl shadow-purple-600/40">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-lg sm:text-xl font-black text-white">
                プレミアム深層レポート ＆ 完全データ開示
              </h4>
              <p className="text-xs text-slate-300">
                1回買い切り ¥500（月額課金・追加費用なし）で、あなたの強み・弱点・マッチングポテンシャルを完全開示
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left text-xs text-slate-300 py-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>カテゴリ別比較スコア (全6軸)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>強みTOP5 ＆ 伸びしろ改善</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>同世代1,000人マッチング受容</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+10pt改善ロードマップ全文</span>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Link
                href={`/purchase/${diagnosisId}`}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer"
              >
                <Unlock className="w-5 h-5" />
                <span>¥500 で詳細データをアンロック（特設LPへ）</span>
                <ChevronRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Apple Pay / Google Pay / カード対応
                </span>
                <span>•</span>
                <span>買い切り・即時反映</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
