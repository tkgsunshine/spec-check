'use client';

import { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { OverallDiagnosisResultV3 } from '@/types/spec-check';
import ScoreRing from '@/components/ScoreRing';
import RadarChart from '@/components/RadarChart';
import CategoryCard from '@/components/CategoryCard';
import SpecRankings from '@/components/SpecRankings';
import SnsShareCard from '@/components/SnsShareCard';
import InputDataModal from '@/components/InputDataModal';
import { Sparkles, Heart, ShieldCheck, ArrowLeft, AlertCircle, RotateCcw, FileText } from 'lucide-react';
import { runDiagnosisV3 } from '@/lib/score-engine';
import { scoreToTopPercent } from '@/lib/score-engine/math-utils';

function generateOverallEvaluationText(params: {
  isLoveMode: boolean;
  overallScore: number;
  topPercent: number;
  gender: 'MALE' | 'FEMALE';
  age: number;
  prefectureName: string;
  categoryScores: { label: string; score: number }[];
}): string {
  const { isLoveMode, topPercent, gender, age, prefectureName, categoryScores } = params;
  const genderText = gender === 'MALE' ? '男性' : '女性';

  const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
  const bestCategory = sorted[0];
  const secondBest = sorted[1];
  const worstCategory = sorted[sorted.length - 1];

  let evalTier = '';
  const percentText = `上位${topPercent}%`;
  if (topPercent <= 3.0) {
    evalTier = `同世代（${age}歳・${prefectureName}）の${genderText}の中で${percentText}に入る極めて優秀なハイスペック結果です。`;
  } else if (topPercent <= 15.0) {
    evalTier = `同世代（${age}歳・${prefectureName}）の${genderText}の中で${percentText}と、ハイレベルなポジションを維持されています。`;
  } else if (topPercent <= 50.0) {
    evalTier = `同世代（${age}歳・${prefectureName}）の${genderText}の中で${percentText}に位置しており、バランスの取れたステータスです。`;
  } else {
    evalTier = `同世代（${age}歳・${prefectureName}）の${genderText}の中で${percentText}に位置しており、大きな伸びしろを残した状態です。`;
  }

  const strengthProse = `特に【${bestCategory.label}】(${bestCategory.score}pt)や【${secondBest.label}】(${secondBest.score}pt)において非常に高い数値を記録しており、個人の大きな強みとして全体スコアを強力に牽引しています。`;

  // 後から変更不可能な項目（学歴・知性、学歴、年齢、恋愛市場年齢）を改善アドバイスの対象から除外
  const UNCHANGEABLE_LABELS = new Set([
    '学歴・知性',
    '学歴',
    '年齢',
    '恋愛市場年齢',
  ]);

  const improvableCategories = sorted.filter(c => !UNCHANGEABLE_LABELS.has(c.label));
  const worstImprovable = improvableCategories.length > 0
    ? improvableCategories[improvableCategories.length - 1]
    : null;

  let improvementProse = '';
  if (worstImprovable && worstImprovable.score < 60) {
    improvementProse = `一方で【${worstImprovable.label}】(${worstImprovable.score}pt)に改善の余地が残されており、このエリアの強化・最適化を進めることで、さらなるステップアップが十分に期待できます。`;
  } else {
    improvementProse = `各可変カテゴリ（年収・キャリア・容姿・身だしなみ・SNS影響力等）が高水準で安定しており、今後の努力項目にも隙のない優れたバランスを達成されています。`;
  }

  const conclusion = isLoveMode
    ? `パートナーシップ市場においても自身の強力なアピールポイントを前面に押し出す戦略が非常に有効です。`
    : `今後も自身の強みを活かしつつ、伸びしろ領域を意識的にカバーしていくことで理想的なキャリアと個人の充実を目指せます。`;

  return `${evalTier}${strengthProse}${improvementProse}${conclusion}`;
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<OverallDiagnosisResultV3 | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'JAPAN' | 'LOVE'>('JAPAN');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam === 'love') {
        setActiveTab('LOVE');
      }
    }
  }, []);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/diagnosis/${id}`);
        const json = await res.json();
        if (json.success && json.result) {
          setData(json.result);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load result from API', e);
      }

      // Fallback: Serverless / Refresh LocalStorage cache recovery
      try {
        const cached = localStorage.getItem(`spec_check_result_${id}`) || localStorage.getItem('spec_check_latest_result');
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(parsed);
        }
      } catch (e) {
        console.error('Failed to load result from localStorage', e);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  // Set dynamic document title for SEO & Social Sharing and scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    if (data) {
      const isLove = activeTab === 'LOVE';
      const score = isLove ? data.loveOverallScore : data.japanOverallScore;
      const percent = scoreToTopPercent(score);
      const genderTextJa = data.inputSummary.gender === 'FEMALE' ? '女性' : '男性';
      const modeText = isLove ? '恋愛スペック' : '総合スペック';
      document.title = `${data.inputSummary.age}歳${genderTextJa}（${data.inputSummary.prefectureName}）の${modeText}診断結果【上位${percent}%】 | 人間スペック診断`;
    }
  }, [data, activeTab]);

  // 全国平均との比較シミュレーション (居住地を全国にした場合の同条件診断)
  const nationwideDiagnosis = useMemo(() => {
    if (!data || !data.rawInput) return null;
    try {
      return runDiagnosisV3({
        ...data.rawInput,
        prefectureId: 0,
        prefectureName: '全国',
      });
    } catch {
      return null;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">統計母集団解析中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-surface rounded-3xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-200 mb-2">診断結果が見つかりません</h2>
          <p className="text-slate-400 text-xs mb-6">URLが正しくないか有効期限が切れています。</p>
          <Link href="/" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm inline-block">
            トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  const isLoveMode = activeTab === 'LOVE';
  const overallScore = isLoveMode ? data.loveOverallScore : data.japanOverallScore;
  const topOverallPercent = scoreToTopPercent(overallScore);
  const genderTextJa = data.inputSummary.gender === 'MALE' ? '男性' : '女性';
  const genderLabelEn = data.inputSummary.gender === 'MALE' ? 'men' : 'women';

  // 全国比較併記用データ
  const nationwideScore = nationwideDiagnosis
    ? isLoveMode
      ? nationwideDiagnosis.loveOverallScore
      : nationwideDiagnosis.japanOverallScore
    : null;
  const nationwideTopPercent = nationwideScore !== null
    ? scoreToTopPercent(nationwideScore)
    : null;

  const japanRadarAxes = [
    { labelJa: '身体', labelEn: 'BODY', score: data.categoryScores.body },
    { labelJa: '年収・純資産', labelEn: 'ECONOMIC', score: data.categoryScores.economic },
    { labelJa: 'キャリア', labelEn: 'CAREER', score: data.categoryScores.career },
    { labelJa: '学歴・知性', labelEn: 'ACADEMIC', score: data.categoryScores.academic || 50 },
    { labelJa: 'SNS・影響力', labelEn: 'SOCIAL', score: data.categoryScores.social },
    { labelJa: 'グローバル力', labelEn: 'GLOBAL', score: data.categoryScores.ability },
  ];

  const loveRadarAxes = [
    { labelJa: '年齢', labelEn: 'AGE', score: data.loveCategoryScores.age },
    { labelJa: '容姿・写真', labelEn: 'FACE', score: data.loveCategoryScores.face },
    { labelJa: '体型・身長', labelEn: 'BODY', score: data.loveCategoryScores.body },
    { labelJa: '年収・純資産', labelEn: 'INCOME', score: data.loveCategoryScores.income },
    { labelJa: 'キャリア', labelEn: 'CAREER', score: data.loveCategoryScores.career },
    { labelJa: '家庭・結婚', labelEn: 'FAMILY', score: data.loveCategoryScores.family },
  ];

  const currentCategoryScores = !isLoveMode
    ? [
        { label: '身体データ', score: data.categoryScores.body },
        { label: '年収・純資産', score: data.categoryScores.economic },
        { label: 'キャリア', score: data.categoryScores.career },
        { label: '学歴・知性', score: data.categoryScores.academic || 50 },
        { label: 'SNS・影響力', score: data.categoryScores.social },
        { label: 'グローバル力', score: data.categoryScores.ability },
      ]
    : [
        { label: '恋愛市場年齢', score: data.loveCategoryScores.age },
        { label: '容姿・第一印象', score: data.loveCategoryScores.face },
        { label: '体型・身長', score: data.loveCategoryScores.body },
        { label: '年収・純資産', score: data.loveCategoryScores.income },
        { label: 'キャリア', score: data.loveCategoryScores.career },
        { label: '家庭・結婚観', score: data.loveCategoryScores.family },
      ];

  const overallEvaluationText = generateOverallEvaluationText({
    isLoveMode,
    overallScore,
    topPercent: topOverallPercent,
    gender: data.inputSummary.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
    age: data.inputSummary.age,
    prefectureName: data.inputSummary.prefectureName,
    categoryScores: currentCategoryScores,
  });

  const currentEpithet = isLoveMode ? (data.loveEpithet || data.epithet) : data.epithet;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* 戻るボタン ＆ 入力データを見る */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> 再診断・入力画面へ
        </Link>

        {data.rawInput && (
          <InputDataModal input={data.rawInput} />
        )}
      </div>

      {/* モード切替タブ ＆ アニメーションテキスト誘導 */}
      <div className="flex flex-col items-center mb-8 relative">
        {/* CSSアニメーション(animate-bounce)付き・背景枠なしの文字だけガイド */}
        <div
          onClick={() => setActiveTab(isLoveMode ? 'JAPAN' : 'LOVE')}
          className="mb-2.5 animate-bounce cursor-pointer group"
        >
          <span className={`text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
            isLoveMode ? 'text-indigo-300 group-hover:text-indigo-200' : 'text-pink-300 group-hover:text-pink-200'
          }`}>
            <span>👉</span>
            <span className="underline underline-offset-4 decoration-current">{isLoveMode ? '総合スペックを確認する' : '恋愛スペックを確認する'}</span>
          </span>
        </div>

        {/* タブ切り替えボタン */}
        <div className="glass-surface p-1.5 rounded-full inline-flex border border-slate-800 shadow-2xl relative">
          <button
            onClick={() => setActiveTab('JAPAN')}
            className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              !isLoveMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white ring-1 ring-indigo-500/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300" /> 総合スペック診断
          </button>
          <button
            onClick={() => setActiveTab('LOVE')}
            className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
              isLoveMode
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-300 hover:text-white ring-2 ring-rose-500/50 animate-pulse'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> 恋愛スペック診断
          </button>
        </div>
      </div>

      {/* 獲得二つ名 (Epithet Title Banner - カセットの上に配置) */}
      {currentEpithet && (
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-slate-950/90 border border-amber-500/50 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center group">
          {/* Tier Label Badge */}
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black tracking-wider uppercase mb-3 shadow-md">
            <span>
              {(() => {
                const b = currentEpithet.rarityBadge || '';
                if (b.startsWith('SS')) return 'SS Tier';
                if (b.startsWith('S ')) return 'S Tier';
                if (b.startsWith('A ')) return 'A Tier';
                if (overallScore >= 85) return 'SS Tier';
                if (overallScore >= 75) return 'S Tier';
                if (overallScore >= 65) return 'A Tier';
                if (overallScore >= 50) return 'B Tier';
                return 'C Tier';
              })()}
            </span>
          </div>

          <div className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${currentEpithet.rarityColor} drop-shadow-md py-1`}>
            『 {currentEpithet.title} 』
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed max-w-2xl mx-auto">
            {currentEpithet.subtitle}
          </p>
        </div>
      )}

      {/* ① メインスコアリング表示 */}
      <section className="glass-surface glass-surface-glow rounded-3xl p-6 md:p-10 mb-8 border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            {/* 上部小バッジ (左寄せ) */}
            <div className="text-left mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {data.inputSummary.nickname || 'あなた'} {data.inputSummary.age}歳 {genderTextJa} ({data.inputSummary.prefectureName}) 査定結果
              </div>
            </div>

            {/* タカシ 26歳男性（東京都） 恋愛スペック診断結果 (左寄せ) */}
            <div className="text-left mb-4">
              <h2 className="text-white text-base sm:text-lg md:text-xl font-black tracking-wide leading-snug">
                <span className="inline-block mr-1.5">{data.inputSummary.nickname || 'あなた'} {data.inputSummary.age}歳{genderTextJa}（{data.inputSummary.prefectureName}）</span>
                <span className="inline-block">{isLoveMode ? '恋愛スペック診断結果' : '人間スペック診断結果'}</span>
              </h2>
            </div>

            {/* 恋愛市場価値： 上位 0.001% (中央寄せ) */}
            <div className="text-center my-6 py-2">
              <div className="text-slate-200 text-base sm:text-xl font-extrabold mb-1">
                {isLoveMode ? '恋愛市場価値' : '総合評価'} :
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                <span className="whitespace-nowrap">
                  上位 <span className={isLoveMode ? 'gradient-text-pink text-4xl sm:text-5xl md:text-6xl font-black' : 'gradient-text-indigo text-4xl sm:text-5xl md:text-6xl font-black'}>{topOverallPercent}%</span>
                </span>
              </h1>

              {/* 全国比較併記バッジ (中央寄せ) */}
              {nationwideTopPercent !== null && (
                <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-bold text-slate-300 shadow-inner">
                  <span className="text-slate-400">🇯🇵 全国の同世代ベース:</span>
                  <span className="text-emerald-400 font-black">
                    上位 {nationwideTopPercent}%
                  </span>
                  <span className="text-slate-500 text-[10px]">({nationwideScore} POINT)</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            <ScoreRing
              score={overallScore}
              label={isLoveMode ? '恋愛スペック' : '総合スペック'}
              subLabel="/ 100 POINT"
              colorTheme={isLoveMode ? 'rose' : 'violet'}
            />
          </div>
        </div>
      </section>

      {/* ② Radar Chart Visualization */}
      <section className="glass-surface rounded-3xl p-6 md:p-8 mb-8 border border-slate-800">
        <div className="text-center mb-6">
          <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-slate-100 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap tracking-tight">
            {isLoveMode ? <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 fill-rose-400 shrink-0" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />}
            <span>全6カテゴリ 多角比較バランス分析</span>
          </h2>
          <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase mt-1">
            6-AXIS SPEC RADAR CHART ({data.inputSummary.prefectureName})
          </p>
        </div>

        <RadarChart axes={isLoveMode ? loveRadarAxes : japanRadarAxes} colorTheme={isLoveMode ? 'rose' : 'violet'} />
      </section>

      {/* ③ Category Scores Grid & Overall Evaluation Summary */}
      <section className="glass-surface rounded-3xl p-6 md:p-8 mb-8 border border-slate-800">
        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            同世代・政府統計データに基づくカテゴリ別比較スコア
          </h2>
          <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase mt-0.5">
            CATEGORY SCORES
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {!isLoveMode ? (
            <>
              <CategoryCard labelJa="身体" labelEn="BODY" score={data.categoryScores.body} topPercent={scoreToTopPercent(data.categoryScores.body)} />
              <CategoryCard labelJa="年収・純資産" labelEn="ECONOMIC" score={data.categoryScores.economic} topPercent={scoreToTopPercent(data.categoryScores.economic)} />
              <CategoryCard labelJa="キャリア" labelEn="CAREER" score={data.categoryScores.career} topPercent={scoreToTopPercent(data.categoryScores.career)} />
              <CategoryCard labelJa="学歴・知性" labelEn="ACADEMIC" score={data.categoryScores.academic || 50} topPercent={scoreToTopPercent(data.categoryScores.academic || 50)} />
              <CategoryCard labelJa="SNS・影響力" labelEn="SOCIAL" score={data.categoryScores.social} topPercent={scoreToTopPercent(data.categoryScores.social)} />
              <CategoryCard labelJa="グローバル力" labelEn="GLOBAL" score={data.categoryScores.ability} topPercent={scoreToTopPercent(data.categoryScores.ability)} />
            </>
          ) : (
            <>
              <CategoryCard labelJa="年齢" labelEn="AGE" score={data.loveCategoryScores.age} colorTheme="rose" />
              <CategoryCard labelJa="容姿" labelEn="FACE" score={data.loveCategoryScores.face} colorTheme="rose" />
              <CategoryCard labelJa="体型" labelEn="BODY" score={data.loveCategoryScores.body} colorTheme="rose" />
              <CategoryCard labelJa="年収・純資産" labelEn="INCOME" score={data.loveCategoryScores.income} colorTheme="rose" />
              <CategoryCard labelJa="キャリア" labelEn="CAREER" score={data.loveCategoryScores.career} colorTheme="rose" />
              <CategoryCard labelJa="家庭" labelEn="FAMILY" score={data.loveCategoryScores.family} colorTheme="rose" />
            </>
          )}
        </div>

        {/* 総評テキスト分析ブロック (300〜400文字) */}
        <div className="mt-6 p-5 md:p-6 rounded-2xl glass-surface border border-indigo-500/30 bg-slate-900/60 shadow-xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {isLoveMode ? '恋愛スペック診断 総評' : '総合スペック診断 総評'}
              </h3>
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium tracking-wide">
            {overallEvaluationText}
          </p>
        </div>
      </section>

      {/* ④ Detailed Spec Ranking Table */}
      <SpecRankings metrics={data.metrics} isLoveMode={isLoveMode} />

      {/* ⑤ Mode Switcher Tabs & SNS Share Button */}
      <div className="mt-10">
        {/* SNSで共有の直前にも配置するモード切替タブ */}
        <div className="flex flex-col items-center mb-6 relative">
          <div
            onClick={() => setActiveTab(isLoveMode ? 'JAPAN' : 'LOVE')}
            className="mb-2.5 animate-bounce cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
              isLoveMode ? 'text-indigo-300 group-hover:text-indigo-200' : 'text-pink-300 group-hover:text-pink-200'
            }`}>
              <span>👉</span>
              <span className="underline underline-offset-4 decoration-current">{isLoveMode ? '総合スペックを確認する' : '恋愛スペックを確認する'}</span>
            </span>
          </div>

          <div className="glass-surface p-1.5 rounded-full inline-flex gap-1.5 sm:gap-2 border border-slate-800 shadow-2xl relative bg-slate-950/80">
            <button
              onClick={() => setActiveTab('JAPAN')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                !isLoveMode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" /> 総合スペック診断
            </button>
            <button
              onClick={() => setActiveTab('LOVE')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                isLoveMode
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> 恋愛スペック診断
            </button>
          </div>
        </div>

        <SnsShareCard
          shareToken={data.shareToken}
          score={isLoveMode ? data.loveOverallScore : data.japanOverallScore}
          topPercent={topOverallPercent}
          gender={data.inputSummary.gender}
          age={data.inputSummary.age}
          nickname={data.inputSummary.nickname}
          prefectureName={data.inputSummary.prefectureName}
          categoryScores={data.categoryScores}
          radarAxes={isLoveMode ? loveRadarAxes : japanRadarAxes}
        />
      </div>

      {/* ⑥ 再診断するボタン */}
      <div className="mt-4 mb-8">
        <Link
          href="/"
          className="w-full py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/60 text-slate-200 hover:text-white font-bold text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
        >
          <RotateCcw className="w-4 h-4 text-indigo-400 group-hover:rotate-[-180deg] transition-transform duration-500" />
          もう一度診断する
        </Link>
      </div>
    </div>
  );
}
