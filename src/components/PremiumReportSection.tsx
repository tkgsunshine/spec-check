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
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Flame,
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
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedMarriage, setCopiedMarriage] = useState(false);

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

  const { loveOverallScore, gender, age, nickname, prefectureName, mbti } = {
    loveOverallScore: result.loveOverallScore || 70,
    gender: result.inputSummary?.gender || 'MALE',
    age: result.inputSummary?.age || 26,
    nickname: result.inputSummary?.nickname || 'あなた',
    prefectureName: result.inputSummary?.prefectureName || '東京都',
    mbti: result.inputSummary?.mbti || 'INFP',
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

  // 自己紹介文の生成
  const profileAppText = `はじめまして！${nickname}と申します。${prefectureName}在住の${age}歳です。
周りからは「落ち着いていて聞き上手」「頼りがいがある」と言われることが多いです（MBTI: ${mbti}）。
休日は美味しいお店の開拓やカフェ巡り、旅行やジムでリフレッシュしています。
お互いに自立しつつ、なんでも気兼ねなく話せて高め合えるような素敵な関係を築けたら嬉しいです。
まずは気軽にメッセージでお話ししましょう！よろしくお願いします✨`;

  const profileMarriageText = `プロフィールをご覧いただきありがとうございます。${nickname}と申します。
${prefectureName}で勤務しており、今年で${age}歳になります。将来を見据えて真剣にお付き合いできる方と出会いたく登録しました。
仕事には誠実に取り組みつつ、プライベートでは穏やかで笑顔の絶えない温かい家庭を築くことが理想です。
休日は映画鑑賞や料理、ドライブなどを楽しんでいます。
お互いの価値観やペースを尊重し合いながら、支え合えるパートナーに出会えたら幸いです。どうぞよろしくお願いいたします。`;

  const copyAppBio = () => {
    navigator.clipboard.writeText(profileAppText);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const copyMarriageBio = () => {
    navigator.clipboard.writeText(profileMarriageText);
    setCopiedMarriage(true);
    setTimeout(() => setCopiedMarriage(false), 2000);
  };

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
              {isUnlocked && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  アンロック完了
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

        {/* 2. プレミアム専用①: 1,000人シミュレーション ＆ スペック無双 主戦場ランキング */}
        {(() => {
          const simContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 relative overflow-hidden transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              {/* 1,000人マッチング受容シミュレーション */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                      <span>同世代異性 1,000人マッチング受容シミュレーション</span>
                      {!isUnlocked && (
                        <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          🔒 プレミアム
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    母集団 1,000名
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  {/* 推定マッチング可能人数 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">推定マッチング可能人数</span>
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
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">市場受容率（モテ許容度）</span>
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
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">マッチング優位性ランク</span>
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
              </div>

              {/* スペック無双 主戦場ランキング（市場別適合度 S/A/B & アフィリエイト直結） */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs sm:text-sm font-extrabold text-white">
                      あなたのスペックが最も無双できる「主戦場ランキング（市場別適合度）」
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">市場適合度分析</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* 1位: ハイスペ特化市場 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/40 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                        🥇 1位：ハイスペ審査制アプリ
                      </span>
                      <span className="text-xs font-black text-amber-300 font-mono">適合度 94% (Sランク)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      知性・経済力・職業ステータスが直接スコア化される市場。あなたのスペックが最もプレミアムとして評価され無双可能です。
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://www.bachelorapp.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-300 hover:text-amber-200 underline decoration-amber-400/60 underline-offset-2"
                      >
                        <span>おすすめ：バチェラーデート等の審査制サービスを見る</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* 2位: 知性・価値観重視の婚活市場 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/40 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/40">
                        🥈 2位：真剣婚活・ハイステータス相談所
                      </span>
                      <span className="text-xs font-black text-purple-300 font-mono">適合度 87% (Aランク)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      身元確実で将来設計を重視する層が集まるため、安定した生活基盤と誠実さが圧倒的な成婚アドバンテージを生み出します。
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://www.ibjapan.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-black text-purple-300 hover:text-purple-200 underline decoration-purple-400/60 underline-offset-2"
                      >
                        <span>おすすめ：IBJ系列・優良結婚相談所を比較する</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* 3位: リアル紹介・食事会 */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        🥉 3位：知人紹介・ハイエンド食事会
                      </span>
                      <span className="text-xs font-black text-indigo-300 font-mono">適合度 80% (B+ランク)</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      対話時の清潔感と知性のギャップが伝わりやすく、1対1や少人数での信頼構築に長けた領域です。
                    </p>
                  </div>

                  {/* 4位: 大衆向けライト恋活アプリ */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/60">
                        4位：大衆向けライト恋活アプリ
                      </span>
                      <span className="text-xs font-bold text-slate-400 font-mono">適合度 65% (Bランク)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      写真の瞬間判断やノリ重視の場では、スペックの深みが埋もれがち。主戦場を絞ることが効率化の鍵です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして主戦場ランキングを開示">
                {simContent}
              </Link>
            );
          }
          return simContent;
        })()}

        {/* 3. プレミアム専用②: あなたに最も惹かれやすい異性の特徴（7大ディメンション） */}
        {(() => {
          const matchContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたに最も惹かれやすい異性の特徴・相性データ（全7項目）</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. 年齢層 */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">① 支持率の高い年齢層</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">{targetPartnerAgeRange}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">{targetPartnerAgeRange}</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">同世代・近似層からの需要が最多</span>
                </div>

                {/* 2. 年収層 */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">② 相性の良い相手の年収層</span>
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
                  <span className="text-[10px] text-slate-400 block">価値観・生活水準の均衡ゾーン</span>
                </div>

                {/* 3. MBTI */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">③ 惹かれやすいMBTI特性</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">INFP / ENFP / INFJ / ISFJ</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">INFP / ENFP / INFJ</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">心理的補完関係・共感度最大化</span>
                </div>

                {/* 4. 職業・業界 */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">④ 相性の良い職業・業界</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">
                      {gender === 'FEMALE' ? '総合商社・外資系・医師/士業・IT大手' : '大手総合職・専門職・教育/士業・クリエイター'}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">大手総合職・士業・IT専門職</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">知的好奇心と生活リズムが合致</span>
                </div>

                {/* 5. 学歴・知性水準 */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">⑤ 相手の学歴・知性水準</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">大学卒以上（難関大・国公立・MARCH等）</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">大卒以上（知的対話を好む層）</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">会話のテンポ・論理感が噛み合う層</span>
                </div>

                {/* 6. 恋愛観・タイプ */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200 block">⑥ 惹かれやすい恋愛観タイプ</span>
                  {isUnlocked ? (
                    <p className="text-sm font-black text-white">相互自立型 ＆ 心を開くと甘え上手</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-300 filter blur-[3px] select-none">相互自立型 ＆ 誠実タイプ</p>
                      <span className="text-xs text-amber-400">🔒</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">過度な束縛を嫌い、尊敬で結ばれる</span>
                </div>

                {/* 7. 一番刺さる武器 */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-pink-500/30 sm:col-span-2 md:col-span-3 space-y-1">
                  <span className="text-xs sm:text-sm font-extrabold text-pink-300 block">⑦ あなたの一番刺さる武器・魅力</span>
                  {isUnlocked ? (
                    <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
                      「第一印象の清潔感・知性」と「2人きりになった時の安心感・包容力」のギャップ。相手が自然体でいられる居心地の良さが最大の決定打となります。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-slate-300 filter blur-[3px] select-none">第一印象の清潔感と知性のギャップによる安心感が最大の決定打となります。</p>
                      <span className="text-xs text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして惹かれやすい異性の特徴を開示">
                {matchContent}
              </Link>
            );
          }
          return matchContent;
        })()}

        {/* 4. プレミアム専用③: あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」（新設） */}
        {(() => {
          const landmineContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-rose-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-rose-300/80">時間を無駄にしないための防衛データ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                {/* ワースト1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 1
                    </span>
                    <span className="text-[10px] text-slate-400">テイカー気質</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">自己肯定感搾取・情緒不安定タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      あなたの気遣いやスペックを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。感謝の言葉が極端に少なく愚痴が多い場合は即座に距離を置くべきです。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">あなたの気遣いを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>

                {/* ワースト2 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 2
                    </span>
                    <span className="text-[10px] text-slate-400">経済観不一致</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">見栄消費・金銭感覚乖離タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      実力や収入に見合わない生活水準を誇示し、中長期の資産形成や自己投資に理解がない相手。初回デートでの過剰な高級志向が見極めサインです。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">実力に見合わない生活水準を誇示し、資産形成や自己投資に理解がない相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>

                {/* ワースト3 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 3
                    </span>
                    <span className="text-[10px] text-slate-400">成長阻害</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">過度な束縛・知性軽視タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      仕事や自己成長への熱意に理解を示さず、連絡頻度や行動を過度に制限しようとする相手。深い議論や相談を茶化す傾向があります。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">自己成長に理解を示さず、行動を過度に制限しようとする相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして地雷異性タイプを開示">
                {landmineContent}
              </Link>
            );
          }
          return landmineContent;
        })()}

        {/* 5. プレミアム専用④: スペック引き上げ具体的ロードマップ（全6カテゴリ改善インパクト視覚化） */}
        {(() => {
          const actionContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>スペック総合値をあと +10pt 以上引き上げる具体的ロードマップ</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">全6カテゴリ改善インパクト連動</span>
              </div>

              {/* 全6カテゴリの改善インパクト視覚化バー */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>多角比較 6カテゴリ別 改善余地インパクト</span>
                  <span className="text-[10px] text-emerald-400">最大 +25pt の総合上昇ポテンシャル</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">身体 (BODY)</span>
                      <span className="text-emerald-400 font-black">+5.0pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">年収・資産 (INCOME)</span>
                      <span className="text-amber-400 font-black">+6.5pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">キャリア (CAREER)</span>
                      <span className="text-indigo-400 font-black">+4.0pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">学歴・知性 (ACADEMIC)</span>
                      <span className="text-purple-400 font-black">+3.0pt 活用余地</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">SNS・影響力 (SOCIAL)</span>
                      <span className="text-pink-400 font-black">+5.0pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-pink-400 h-full rounded-full" style={{ width: '55%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">グローバル (GLOBAL)</span>
                      <span className="text-cyan-400 font-black">+4.5pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* タイムライン別 3ステップ アクション */}
              <div className="space-y-3 text-xs">
                {/* STEP 1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-black text-[10px] shrink-0 border border-purple-500/30">
                    短期（即日〜2週）
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs sm:text-sm">写真AI解析・清潔感ボーナスの満額獲得 (+3〜5pt)</span>
                      <span className="text-emerald-400 font-bold text-[11px]">即効性 ★★★</span>
                    </div>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        自然光・他撮り風の清潔感あるプロフィール写真（Gemini AI画像解析スコア90点以上）を配置することで、第一印象ボーナスが即時確定加算されます。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">自然光の清潔感ある写真を登録することで満額ボーナスが確定加算されます。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-black text-[10px] shrink-0 border border-indigo-500/30">
                    中期（1〜3ヶ月）
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs sm:text-sm">体型黄金比化 ＆ 習慣チューニング (+5〜8pt)</span>
                      <span className="text-indigo-400 font-bold text-[11px]">定着度 ★★★</span>
                    </div>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        体脂肪率を理想基準（男性14% / 女性21%）へあと2〜3%近づけ、睡眠・運動の生活習慣を最適化。身体スコアのZスコアが大幅に跳ね上がります。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">体脂肪率を理想基準へ近づけることで身体スコアが大幅に跳ね上がります。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black text-[10px] shrink-0 border border-emerald-500/30">
                    長期（半年〜1年）
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs sm:text-sm">不可変アセット・キャリア資産の底上げ (+10pt以上)</span>
                      <span className="text-purple-400 font-bold text-[11px]">永続価値 ★★★</span>
                    </div>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        年収アップ転職や役職昇進、語学（TOEIC800+）や難関資格の取得により、生涯にわたって崩れない同世代トップ1%クラスの強固なステータスを確立します。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">キャリアアップと知性アセットの獲得により生涯の独自ポジションを確立します。</p>
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

        {/* 6. プレミアム専用⑤: AIパーソナライズ「即コピペで使える最強自己PR文章」（新設） */}
        {(() => {
          const prContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>AIパーソナライズ「即コピペで使える最強プロフィール文章」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-indigo-300">マッチングアプリ・婚活特化AI生成</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* パターンA: 恋活・マッチングアプリ用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      パターンA: 恋活・マッチングアプリ用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyAppBio}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-bold text-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedApp ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono">
                      {profileAppText}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[3px] select-none">
                      {profileAppText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">誠実さ・知性・親しみやすさを黄金比率で両立</span>
                </div>

                {/* パターンB: 真剣婚活・結婚相談所用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      パターンB: 真剣婚活・結婚相談所用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyMarriageBio}
                        className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-[11px] font-bold text-pink-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedMarriage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMarriage ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono">
                      {profileMarriageText}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[3px] select-none">
                      {profileMarriageText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">生活基盤の安定感・将来像の信頼性を訴求</span>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックしてAIプロフィール文章を開示">
                {prContent}
              </Link>
            );
          }
          return prContent;
        })()}

        {/* 7. 未アンロック時の最下部総合CTAカード */}
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
                1回買い切り ¥500（月額課金・追加費用なし）で、あなたの強み・主戦場・相性・ロードマップを完全開示
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left text-xs text-slate-300 py-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>主戦場ランキング ＆ 1,000人受容</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>好かれやすい異性の特徴 (全7項目)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>相性最悪な地雷異性タイプ ワースト3</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>6カテゴリ改善ロードマップ ＆ AI自己PR</span>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Link
                href={`/purchase/${diagnosisId}`}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer"
              >
                <Unlock className="w-5 h-5" />
                <span>¥500 で詳細データを完全アンロック</span>
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
