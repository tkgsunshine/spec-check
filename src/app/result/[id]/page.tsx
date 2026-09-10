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
import { getMbtiEconomicEvaluationText, getMbtiLoveEvaluationText } from '@/lib/score-engine/mbti';
import { getExperienceEvaluationText } from '@/lib/score-engine/experience';

function generateOverallEvaluationText(params: {
  isLoveMode: boolean;
  overallScore: number;
  topPercent: number;
  gender: 'MALE' | 'FEMALE';
  age: number;
  prefectureName: string;
  categoryScores: { label: string; score: number }[];
  socialScore?: number;
  mbti?: string | null;
  partnerCount?: number | null;
}): string {
  const { isLoveMode, overallScore, topPercent, gender, age, prefectureName, categoryScores, socialScore, mbti, partnerCount } = params;
  const genderText = gender === 'MALE' ? '男性' : '女性';

  const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
  const bestCategory = sorted[0];
  const secondBest = sorted[1];
  const thirdBest = sorted[2] || sorted[1];
  const worstCategory = sorted[sorted.length - 1];

  // 後から変更不可能な項目を改善アドバイスの対象から除外
  const UNCHANGEABLE_LABELS = new Set([
    '学歴・知性',
    '学歴',
    '年齢',
    '恋愛市場年齢',
  ]);

  const improvableCategories = sorted.filter(c => !UNCHANGEABLE_LABELS.has(c.label));
  const worstImprovable = improvableCategories.length > 0
    ? improvableCategories[improvableCategories.length - 1]
    : worstCategory;

  // 1. 統計的母集団におけるポジション解析 (約200文字)
  let section1 = '';
  if (topPercent <= 3.0) {
    section1 = `【統計的ポジションと全体像】\n同世代（${age}歳・${prefectureName}）の${genderText}母集団データにおいて、あなたの総合スコア（${overallScore}pt）は「上位 ${topPercent}%」という極めて突出したハイスペック・エリート領域に位置しています。全国および地域統計と比較しても全人口のわずか数パーセント未満しか到達できない卓越した水準であり、客観的なステータス評価において周囲から頭一つ抜けた存在感を放っています。`;
  } else if (topPercent <= 15.0) {
    section1 = `【統計的ポジションと全体像】\n同世代（${age}歳・${prefectureName}）の${genderText}母集団データにおいて、あなたの総合スコア（${overallScore}pt）は「上位 ${topPercent}%」というハイレベルな上位層に位置しています。公的統計における同世代平均値を大幅に上回っており、日頃の努力や自己研鑽の成果が各評価軸に明確な数値となって表れている優れたステータス状態です。`;
  } else if (topPercent <= 50.0) {
    section1 = `【統計的ポジションと全体像】\n同世代（${age}歳・${prefectureName}）の${genderText}母集団データにおいて、あなたの総合スコア（${overallScore}pt）は「上位 ${topPercent}%」という平均以上の安定した中央〜上位ゾーンに位置しています。極端な欠点がなくバランスの取れた能力バランスを保持しており、今後のアプローチ次第でさらなるハイスペック層へのステップアップが十分に狙える強固なベースを備えています。`;
  } else {
    section1 = `【統計的ポジションと全体像】\n同世代（${age}歳・${prefectureName}）の${genderText}母集団データにおいて、あなたの総合スコア（${overallScore}pt）は「上位 ${topPercent}%」に位置しています。現在の数値は伸びしろを多く残した状態ですが、重点的な改善ポイントを意識してピンポイントでアプローチすることで、今後のスコア引き上げと急速なランクアップが最も期待できる発展途上の状態と言えます。`;
  }

  // 2. コア強みカテゴリのシナジーとアドバンテージ分析 (約300文字)
  let section2 = '';
  if (!isLoveMode) {
    section2 = `【主軸となる強みと相乗効果分析】\n特に【${bestCategory.label}】(${bestCategory.score}pt)および【${secondBest.label}】(${secondBest.score}pt)の2分野において極めて高いパフォーマンスを記録しており、全体スコアを強力に牽引しています。${bestCategory.label}における高い数値は、社会的な信用力や個人の能力の高さを客観的に証明する大きなアドバンテージです。さらに【${thirdBest.label}】(${thirdBest.score}pt)も高水準で安定しているため、これらの強みが相互に補完し合うことで、ビジネスシーンや日常の人間関係において強い説得力と高い評価を生み出す源泉となっています。`;
  } else {
    let snsParagraph = '';
    if (socialScore !== undefined && socialScore !== null) {
      if (socialScore >= 70) {
        snsParagraph = `\nまた、SNSフォロワー数・発信力（SNS影響力スコア: ${socialScore}pt）の高さは、現代の恋愛・婚活市場において現代的知名度や優れたトレンド感という独自の強力な魅力を形作っています。感度の高いパートナーとの出会いにおいて、一目を置かれる大きなアピール要素となります。`;
      } else if (socialScore >= 50) {
        snsParagraph = `\nさらに、バランスの取れたSNS活用・ネットワーク領域（SNS影響力スコア: ${socialScore}pt）も、オープンな人柄や交友関係の広さをさりげなく演出する補足的なアピール材料となります。`;
      } else {
        snsParagraph = `\nなお、SNS発信領域（SNS影響力スコア: ${socialScore}pt）は控えめな数値ですが、これはプライベートのプライバシーを大切にする誠実で落ち着いた人物像としてポジティブに作用します。`;
      }
    }

    section2 = `【パートナーシップ市場における強力な武器】\n恋愛・婚活市場における評価軸では、特に【${bestCategory.label}】(${bestCategory.score}pt)と【${secondBest.label}】(${secondBest.score}pt)があなたの最大の魅力として光っています。${bestCategory.label}の高さはパートナーに対する強い安心感や魅力を与える要素であり、マッチングアプリや出会いの場においてもファーストインパクトで大きな好印象を残すことができます。また【${thirdBest.label}】(${thirdBest.score}pt)のバランスも良く、安定した関係性を構築する上での強力なアピールポイントとなります。${snsParagraph}`;
  }

  // 3. ボトルネック・改善ポイントの精密分析と攻略法 (約300文字)
  let section3 = '';
  if (!isLoveMode) {
    if (worstImprovable.score < 60) {
      section3 = `【伸びしろ領域の特定と最適化戦略】\n一方で、今後のさらなる進化に向けたボトルネックとして【${worstImprovable.label}】(${worstImprovable.score}pt)に改善の余地が残されています。この項目は習慣の見直しや適切な自己投資、戦略的な目標設定によって比較的短期間での向上が見込める可変領域です。現状の強みである${bestCategory.label}を活かしつつ、${worstImprovable.label}の数値を底上げしていくことで、スキのない洗練された全方位型ハイスペックへと飛躍的に向上させることが可能です。`;
    } else {
      section3 = `【バランスの評価と微調整のアドバイス】\n全体的に各カテゴリ（年収・キャリア・身体・SNS影響力・グローバル力）が総じて高水準でまとまっており、目立った弱点が見当たらない非常に完成度の高いステータス構造です。現状維持にとどまらず、【${worstImprovable.label}】(${worstImprovable.score}pt)などの更なるブラッシュアップを図ることで、競合の少ない圧倒的な独自ポジションを確立できます。`;
    }
  } else {
    if (worstImprovable.score < 60) {
      section3 = `【婚活・パートナーシップでの注意点と対策】\n恋愛・結婚市場において、さらなる満足度を高めるポイントとして【${worstImprovable.label}】(${worstImprovable.score}pt)のケアが挙げられます。お相手選びやマッチングの場面では、ご自身の得意領域である${bestCategory.label}を前面に押し出しつつも、${worstImprovable.label}における懸念を丁寧なコミュニケーションや身だしなみ・生活像の共有によって補う姿勢が大切です。ここを意識的にカバーすることで、交際・結婚への発展率が大幅に向上します。`;
    } else {
      section3 = `【パートナーシップでの総合的完成度】\n恋愛市場における各評価項目（年齢・容姿・体型・経済力・家庭観）が極めてバランス良く整っており、理想的な出会いを引き寄せる準備が十分に整っています。自信を持ってご自身の魅力を開示しつつ、【${worstImprovable.label}】(${worstImprovable.score}pt)の細かなニュアンスや相手への寄り添いを意識することで、より深い信頼関係を築くことができます。`;
    }
  }

  // 4. 経験人数・パートナーシップ分析 (恋愛モード時)
  const expSection = isLoveMode
    ? getExperienceEvaluationText(partnerCount, gender, age)
    : '';

  // 5. MBTIパーソナリティ特性・資産/恋愛ポテンシャル分析
  const mbtiSection = isLoveMode
    ? getMbtiLoveEvaluationText(mbti, gender)
    : getMbtiEconomicEvaluationText(mbti);

  // 6. 居住地域および同世代層特有の傾向考察 (約200文字)
  const section4 = `【${prefectureName}・同世代（${age}歳）における市場環境】\n${prefectureName}における${age}歳${genderText}の母集団データと照らし合わせると、年齢に応じた経験値や社会的責任が増す中で、あなたのステータス構成は地域内でも優位なポジションを確立しています。${prefectureName}特有の生活環境や物価水準、同世代の平均的な傾向を意識した上で、ご自身の強みをローカライズして発揮することが、プライベートや仕事での満足度向上に直結します。`;

  // 7. 中長期的な戦略ロードマップと総括 (約200文字)
  let section5 = '';
  if (!isLoveMode) {
    section5 = `【今後の総括とアクションプラン】\n総合的に見て、あなたはすでに優れた基盤を有しており、自身の強みである【${bestCategory.label}】を軸に主導権を握れるポテンシャルを持っています。自己成長のロードマップとして、定期的な数値チェックを行いながらボトルネック領域の改善に取り組むことで、人生のあらゆる局面で望む成果を引き寄せる持続可能なハイスペック・ライフを実現できるでしょう。`;
  } else {
    section5 = `【今後の総括とパートナーシップ戦略】\n総じて、あなたの恋愛市場におけるポテンシャルは非常に高く、自信を持ってパートナーシップに臨める好条件が揃っています。ご自身の強みである【${bestCategory.label}】をアピール軸として確立し、お相手との価値観のすり合わせを丁寧に行っていくことで、相思相愛の理想的なパートナーとの出逢いと関係成就を確実に手に入れることができるでしょう。`;
  }

  const sections = [section1, section2, section3];
  if (expSection) {
    sections.push(expSection);
  }
  if (mbtiSection) {
    sections.push(mbtiSection);
  }
  sections.push(section4, section5);

  return sections.join('\n\n');
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

  const handleTabChange = (newTab: 'JAPAN' | 'LOVE') => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab.toLowerCase());
      window.history.replaceState(null, '', url.toString());
    }
  };

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/diagnosis/${id}`);
        const json = await res.json();
        if (json.success && json.result && json.result.diagnosisId && json.result.inputSummary) {
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
          if (parsed && parsed.diagnosisId && parsed.inputSummary) {
            setData(parsed);
          }
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
    { labelJa: 'キャリア・影響力', labelEn: 'CAREER', score: data.loveCategoryScores.career },
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
        { label: 'キャリア・影響力', score: data.loveCategoryScores.career },
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
    socialScore: data.categoryScores.social,
    mbti: data.rawInput?.mbti,
    partnerCount: data.rawInput?.partnerCount,
  });

  const currentEpithet = isLoveMode ? (data.loveEpithet || data.epithet) : data.epithet;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* 戻るボタン */}
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> 再診断・入力画面へ
        </Link>
      </div>

      {/* モード切替タブ ＆ アニメーションテキスト誘導 */}
      <div className="flex flex-col items-center mb-8 relative">
        {/* CSSアニメーション(animate-bounce)付き・背景枠なしの文字だけガイド */}
        <div
          onClick={() => handleTabChange(isLoveMode ? 'JAPAN' : 'LOVE')}
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
        <div className="glass-surface p-1.5 rounded-full inline-flex gap-2.5 sm:gap-3.5 border border-slate-800 shadow-2xl relative bg-slate-950/80">
          <button
            onClick={() => handleTabChange('JAPAN')}
            className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
              !isLoveMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white ring-1 ring-indigo-500/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-300" /> 総合スペック診断
          </button>
          <button
            onClick={() => handleTabChange('LOVE')}
            className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
              isLoveMode
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-300 hover:text-white ring-1 ring-rose-500/50'
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
            {/* メイン見出し */}
            <div className="mb-4">
              <h2 className="text-white text-base sm:text-lg md:text-xl font-black tracking-wide leading-snug">
                <span className="inline-block mr-1.5">{data.inputSummary.nickname || 'あなた'} / {data.inputSummary.age}歳 / {genderTextJa} / {data.inputSummary.prefectureName} の</span>
                <span className="inline-block">{isLoveMode ? '恋愛スペック診断結果' : '人間スペック診断結果'}</span>
              </h2>
            </div>

            {/* 恋愛市場価値： 上位 XX% (中央寄せ - 常時上位%表示) */}
            <div className="text-center my-6 py-2">
              <div className="text-slate-200 text-base sm:text-xl font-extrabold mb-1">
                {isLoveMode ? '恋愛市場価値' : '総合評価'} :
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                <span className="whitespace-nowrap">
                  上位 <span className={isLoveMode ? 'gradient-text-pink text-4xl sm:text-5xl md:text-6xl font-black' : 'gradient-text-indigo text-4xl sm:text-5xl md:text-6xl font-black'}>{topOverallPercent}%</span>
                </span>
              </h1>

              {/* 全国比較併記バッジ (常時上位%表示) */}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-black text-slate-100 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 whitespace-nowrap tracking-tight">
              {isLoveMode ? <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 fill-rose-400 shrink-0" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />}
              <span>全6カテゴリ 多角比較バランス分析</span>
            </h2>
            <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase mt-1">
              6-AXIS SPEC RADAR CHART ({data.inputSummary.prefectureName})
            </p>
          </div>
          {data.rawInput && (
            <div className="shrink-0">
              <InputDataModal input={data.rawInput} activeTab={activeTab} />
            </div>
          )}
        </div>

        <RadarChart axes={isLoveMode ? loveRadarAxes : japanRadarAxes} colorTheme={isLoveMode ? 'rose' : 'violet'} />
      </section>

      {/* ③ Category Scores Grid & Overall Evaluation Summary */}
      <section className="glass-surface rounded-3xl p-6 md:p-8 mb-8 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              同世代・政府統計データに基づくカテゴリ別比較スコア
            </h2>
            <p className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase mt-0.5">
              CATEGORY SCORES
            </p>
          </div>
          {data.rawInput && (
            <div className="shrink-0">
              <InputDataModal input={data.rawInput} activeTab={activeTab} />
            </div>
          )}
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
              <CategoryCard labelJa="年齢" labelEn="AGE" score={data.loveCategoryScores.age} topPercent={scoreToTopPercent(data.loveCategoryScores.age)} colorTheme="rose" />
              <CategoryCard labelJa="容姿" labelEn="FACE" score={data.loveCategoryScores.face} topPercent={scoreToTopPercent(data.loveCategoryScores.face)} colorTheme="rose" />
              <CategoryCard labelJa="体型" labelEn="BODY" score={data.loveCategoryScores.body} topPercent={scoreToTopPercent(data.loveCategoryScores.body)} colorTheme="rose" />
              <CategoryCard labelJa="年収・純資産" labelEn="INCOME" score={data.loveCategoryScores.income} topPercent={scoreToTopPercent(data.loveCategoryScores.income)} colorTheme="rose" />
              <CategoryCard labelJa="キャリア・影響力" labelEn="CAREER" score={data.loveCategoryScores.career} topPercent={scoreToTopPercent(data.loveCategoryScores.career)} colorTheme="rose" />
              <CategoryCard labelJa="家庭" labelEn="FAMILY" score={data.loveCategoryScores.family} topPercent={scoreToTopPercent(data.loveCategoryScores.family)} colorTheme="rose" />
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
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium tracking-wide whitespace-pre-line space-y-3">
            {overallEvaluationText}
          </div>
        </div>
      </section>

      {/* ④ Detailed Spec Ranking Table */}
      <SpecRankings metrics={data.metrics} isLoveMode={isLoveMode} rawInput={data.rawInput} />

      {/* ⑤ Mode Switcher Tabs & SNS Share Button */}
      <div className="mt-10">
        {/* SNSで共有の直前にも配置するモード切替タブ */}
        <div className="flex flex-col items-center mb-6 relative">
          <div
            onClick={() => handleTabChange(isLoveMode ? 'JAPAN' : 'LOVE')}
            className="mb-2.5 animate-bounce cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all ${
              isLoveMode ? 'text-indigo-300 group-hover:text-indigo-200' : 'text-pink-300 group-hover:text-pink-200'
            }`}>
              <span>👉</span>
              <span className="underline underline-offset-4 decoration-current">{isLoveMode ? '総合スペックを確認する' : '恋愛スペックを確認する'}</span>
            </span>
          </div>

          <div className="glass-surface p-1.5 rounded-full inline-flex gap-2.5 sm:gap-3.5 border border-slate-800 shadow-2xl relative bg-slate-950/80">
            <button
              onClick={() => handleTabChange('JAPAN')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                !isLoveMode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-300" /> 総合スペック診断
            </button>
            <button
              onClick={() => handleTabChange('LOVE')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
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
          isLoveMode={isLoveMode}
          categoryScores={data.categoryScores}
          radarAxes={isLoveMode ? loveRadarAxes : japanRadarAxes}
          epithet={currentEpithet}
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
