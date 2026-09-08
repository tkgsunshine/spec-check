import { MetricScoreResult, AcademicScoreResult } from '@/types/spec-check';
import { calcHighPrecisionTopPercent } from './math-utils';
import { INITIAL_UNIVERSITIES } from '../datasets/japan-stats';

/**
 * 学歴ランク別基礎スコア（国勢調査・学校基本調査 大卒/院卒構成比率拠出）
 */
export const DEGREE_SCORES: Record<string, { label: string; score: number; topPercent: number }> = {
  DOCTOR: { label: '大学院博士課程修了', score: 96, topPercent: 0.5 },
  MASTER: { label: '大学院修士課程修了', score: 90, topPercent: 5.2 },
  BACHELOR: { label: '大学卒 (学士)', score: 75, topPercent: 38.5 },
  JUNIOR_COLLEGE: { label: '短期大学卒', score: 55, topPercent: 62.0 },
  VOCATIONAL: { label: '専門学校卒', score: 52, topPercent: 68.0 },
  HIGH_SCHOOL: { label: '高等学校卒', score: 40, topPercent: 88.0 },
  MIDDLE_SCHOOL: { label: '中学校卒', score: 25, topPercent: 98.0 },
};

/**
 * 文部科学省「学校基本調査」都道府県別大学進学率に基づく大卒・院卒の地域希少性ボーナス (pt)
 */
export const REGIONAL_UNIVERSITY_ADVANCEMENT_FACTORS: Record<string, number> = {
  '東京都': 0,
  '神奈川県': 0,
  '京都府': 0,
  '埼玉県': 1,
  '兵庫県': 1,
  '大阪府': 2,
  '愛知県': 2,
  '奈良県': 2,
  '千葉県': 2,
  '広島県': 3,
  '福岡県': 3,
  '滋賀県': 3,
  '石川県': 3,
  '茨城県': 4,
  '静岡県': 4,
  '岡山県': 4,
  '宮城県': 4,
  '三重県': 4,
  '岐阜県': 5,
  '栃木県': 5,
  '群馬県': 5,
  '長野県': 5,
  '香川県': 5,
  '北海道': 5,
  '福井県': 5,
  '富山県': 5,
  '山梨県': 5,
  '新潟県': 6,
  '和歌山県': 6,
  '山口県': 6,
  '徳島県': 6,
  '愛媛県': 6,
  '熊本県': 6,
  '佐賀県': 7,
  '長崎県': 7,
  '大分県': 7,
  '福島県': 7,
  '山形県': 7,
  '島根県': 7,
  '高知県': 7,
  '宮崎県': 8,
  '鹿児島県': 8,
  '岩手県': 8,
  '秋田県': 8,
  '青森県': 8,
  '鳥取県': 8,
  '沖縄県': 8,
  '全国': 0,
};

/**
 * 文部科学省「学校基本調査」年代別大学・大学院進学率推移に基づく年代別学歴稀少性ボーナス (pt)
 */
export function calculateAgeGenerationalAcademicBonus(
  age?: number | null,
  academicDegree?: string | null
): { bonusScore: number; adjustedTopPercentRatio: number; label: string } {
  if (!age || !academicDegree) {
    return { bonusScore: 0, adjustedTopPercentRatio: 1.0, label: '' };
  }

  const isGradSchool = academicDegree === 'MASTER' || academicDegree === 'DOCTOR';
  const isBachelor = academicDegree === 'BACHELOR';

  if (!isGradSchool && !isBachelor) {
    return { bonusScore: 0, adjustedTopPercentRatio: 1.0, label: '' };
  }

  if (age >= 75) {
    // 75歳以上 (昭和前期生まれ・大学進学率10%未満、院卒0.5%未満)
    const bonusScore = isGradSchool ? 8 : 6;
    const adjustedTopPercentRatio = isGradSchool ? 0.25 : 0.35;
    return {
      bonusScore,
      adjustedTopPercentRatio,
      label: `昭和前期世代(75歳以上)の${isGradSchool ? '大学院卒' : '大学卒'}希少価値ボーナス (+${bonusScore}pt)`,
    };
  } else if (age >= 65) {
    // 65歳〜74歳 (高度成長期世代・大学進学率15-20%、院卒1.5%)
    const bonusScore = isGradSchool ? 6 : 4;
    const adjustedTopPercentRatio = isGradSchool ? 0.45 : 0.55;
    return {
      bonusScore,
      adjustedTopPercentRatio,
      label: `シニア世代(65〜74歳)の${isGradSchool ? '大学院卒' : '大学卒'}希少価値ボーナス (+${bonusScore}pt)`,
    };
  } else if (age >= 55) {
    // 55歳〜64歳 (バブル期前後世代)
    const bonusScore = isGradSchool ? 3 : 2;
    const adjustedTopPercentRatio = isGradSchool ? 0.7 : 0.8;
    return {
      bonusScore,
      adjustedTopPercentRatio,
      label: `ミドルシニア世代(55〜64歳)の学歴希少価値ボーナス (+${bonusScore}pt)`,
    };
  }

  return { bonusScore: 0, adjustedTopPercentRatio: 1.0, label: '' };
}

/**
 * 偏差値 H から 100pt スコアへの換算式 (東大 75.0 = 100pt 基準)
 */
export function hensachiToPoint(hensachi: number): number {
  return Math.min(100, Math.max(30, Math.round((hensachi - 35) * 2.5 * 10) / 10));
}

/**
 * IQ (知能指数) Score V3.0 (日本平均 106.5, SD 15 正規分布モデル)
 */
export function calculateIqMetric(
  iqInput?: number | null,
  universityHensachi?: number | null,
  academicDegree?: string | null
): MetricScoreResult {
  let finalIq = 106.5;
  let isEstimated = true;

  if (iqInput && iqInput >= 60 && iqInput <= 200) {
    finalIq = iqInput;
    isEstimated = false;
  } else if (universityHensachi && universityHensachi >= 30) {
    finalIq = Math.round((100 + (universityHensachi - 50) * 1.05) * 10) / 10;
  } else if (academicDegree === 'DOCTOR' || academicDegree === 'MASTER') {
    finalIq = 118;
  } else if (academicDegree === 'BACHELOR') {
    finalIq = 108;
  } else {
    finalIq = 102;
  }

  // 日本人平均 106.5, SD 15 正規分布 z-score
  const z = (finalIq - 106.5) / 15;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const tail = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  const rawTopPct = z >= 0 ? tail * 100 : (1 - tail) * 100;
  const topPercent = calcHighPrecisionTopPercent(rawTopPct);

  const score = Math.max(20, Math.min(100, Math.round((100 - topPercent) * 10) / 10));

  return {
    metricCode: 'IQ',
    metricName: '推定IQ・知能指数',
    category: '学歴・知性',
    rawValue: isEstimated ? `推定 IQ ${finalIq} (学歴推計)` : `IQ ${finalIq}`,
    score,
    percentile: score,
    topPercent,
    dataQuality: isEstimated ? 'OFFICIAL_ESTIMATED' : 'USER_INPUT',
    datasetName: 'Ulster Institute / Lynn & Becker 世界IQ統計調査 (日本平均 106.5)',
    sourceUrl: 'https://worldpopulationreview.com/country-rankings/iq-by-country',
    surveyYear: 2024,
    calculationMethod: 'NORMAL_APPROXIMATION',
    hasOfficialTopPercent: true,
    isOptionalUnentered: isEstimated,
    notes: isEstimated
      ? `学歴・出身大学偏差値に基づくIQ統計モデル推定。日本平均IQ 106.5を基準に算出。`
      : `自己申告IQ値に基づく日本人口統計正規分布(平均106.5/標準偏差15)算出。`,
  };
}

/**
 * 学歴・知性・大学・IQ Score (ACADEMIC_SCORE) の計算 V3.1
 * 年齢世代別進学率 × 都道府県別大学進学率のダブル希少性補正モデル
 */
export function calculateAcademicScore(
  academicDegree?: keyof typeof DEGREE_SCORES | null,
  universityName?: string | null,
  customUniversityHensachi?: number | null,
  prefectureName?: string | null,
  iqScoreInput?: number | null,
  age?: number | null
): AcademicScoreResult {
  const isDegreeEntered = Boolean(academicDegree && DEGREE_SCORES[academicDegree]);
  const degreeConfig = isDegreeEntered ? DEGREE_SCORES[academicDegree!] : { label: '未選択 (標準値)', score: 50, topPercent: 50.0 };

  // 地域別大学進学率の希少性ボーナス (大卒/修士/博士対象)
  const isHigherDegree = academicDegree ? ['BACHELOR', 'MASTER', 'DOCTOR'].includes(academicDegree) : false;
  const regionalRarityBonus = (isHigherDegree && prefectureName && REGIONAL_UNIVERSITY_ADVANCEMENT_FACTORS[prefectureName])
    ? REGIONAL_UNIVERSITY_ADVANCEMENT_FACTORS[prefectureName]
    : 0;

  // 年代別学歴希少性ボーナス (75歳以上や65歳以上の大卒/院卒への年代補正)
  const generationalBonus = calculateAgeGenerationalAcademicBonus(age, academicDegree);

  const adjustedDegreeScore = isDegreeEntered
    ? Math.min(100, degreeConfig.score + regionalRarityBonus + generationalBonus.bonusScore)
    : 50;

  const calculatedTopPercent = isDegreeEntered
    ? calcHighPrecisionTopPercent(degreeConfig.topPercent * generationalBonus.adjustedTopPercentRatio)
    : 50.0;

  let notesText = !isDegreeEntered ? '未選択のため平均値 (50pt) で試算。' : '文部科学省「学校基本調査」および総務省国勢調査構成比に基づく算出。';
  if (isDegreeEntered) {
    const notesParts: string[] = [];
    if (generationalBonus.bonusScore > 0) {
      notesParts.push(generationalBonus.label);
    }
    if (regionalRarityBonus > 0) {
      notesParts.push(`${prefectureName}における進学率地域希少性ボーナス(+${regionalRarityBonus}pt)`);
    }
    if (notesParts.length > 0) {
      notesText = `【学歴希少性加算】: ${notesParts.join(' ＋ ')}を適用。`;
    }
  }

  const academicDegreeMetric: MetricScoreResult = {
    metricCode: 'ACADEMIC_DEGREE',
    metricName: '最終学歴',
    category: '学歴・知性',
    rawValue: degreeConfig.label,
    score: adjustedDegreeScore,
    percentile: adjustedDegreeScore,
    topPercent: calculatedTopPercent,
    dataQuality: isDegreeEntered ? 'OFFICIAL' : 'USER_INPUT',
    datasetName: '総務省 国勢調査 / 文部科学省 学校基本調査 (世代・地域補正モデル)',
    sourceUrl: 'https://www.e-stat.go.jp/',
    surveyYear: 2024,
    calculationMethod: 'EXACT_PERCENTILE',
    hasOfficialTopPercent: isDegreeEntered,
    notes: notesText,
  };

  let universityMetric: MetricScoreResult | null = null;
  let detectedHensachi: number | null = customUniversityHensachi || null;

  if (universityName && universityName.trim() !== '') {
    const trimmed = universityName.trim();
    const found = INITIAL_UNIVERSITIES.find(
      u => u.name === trimmed || u.aliases.some(alias => alias.toLowerCase() === trimmed.toLowerCase())
    );

    if (found) {
      detectedHensachi = found.hensachi;
      universityMetric = {
        metricCode: 'UNIVERSITY',
        metricName: '出身大学・大学院',
        category: '学歴・知性',
        rawValue: `${found.name} (偏差値 ${found.hensachi})`,
        score: found.totalScore,
        percentile: null,
        topPercent: null,
        dataQuality: 'PROPRIETARY',
        datasetName: '大学偏差値ランキング100pt換算マスター (東大=100pt基準)',
        sourceUrl: '',
        surveyYear: 2024,
        calculationMethod: 'WEIGHTED_PROPRIETARY',
        hasOfficialTopPercent: false,
        notes: `大学入試偏差値ランキング（東大 偏差値75.0 = 100点基準）による自動ポイント化。`,
      };
    } else if (customUniversityHensachi && customUniversityHensachi >= 30) {
      const customScore = hensachiToPoint(customUniversityHensachi);
      universityMetric = {
        metricCode: 'UNIVERSITY',
        metricName: '出身大学・大学院',
        category: '学歴・知性',
        rawValue: `${trimmed} (入力偏差値 ${customUniversityHensachi})`,
        score: customScore,
        percentile: null,
        topPercent: null,
        dataQuality: 'USER_INPUT',
        datasetName: '未登録マスター (フリー指定偏差値換算)',
        sourceUrl: '',
        surveyYear: 2024,
        calculationMethod: 'WEIGHTED_PROPRIETARY',
        hasOfficialTopPercent: false,
        notes: `指定された偏差値(${customUniversityHensachi})に基づく公式ポイント換算。`,
      };
    } else {
      universityMetric = {
        metricCode: 'UNIVERSITY',
        metricName: '出身大学・大学院',
        category: '学歴・知性',
        rawValue: `${trimmed} (未登録大学・平均偏差値55想定)`,
        score: 50,
        percentile: null,
        topPercent: null,
        dataQuality: 'USER_INPUT',
        datasetName: '未登録マスター (管理者レビューキュー保存)',
        sourceUrl: '',
        surveyYear: 2024,
        calculationMethod: 'WEIGHTED_PROPRIETARY',
        hasOfficialTopPercent: false,
        notes: `未登録大学のため中堅平均偏差値55想定スコア(50pt)を仮付。`,
      };
    }
  }

  // IQ Metric の計算（入力値 または 大学偏差値・最終学歴からの自動推計）
  const iqMetric = calculateIqMetric(iqScoreInput, detectedHensachi, academicDegree);

  const effectiveDegreeScore = universityMetric
    ? Math.max(academicDegreeMetric.score, universityMetric.score)
    : academicDegreeMetric.score;

  const totalAcademicScore = universityMetric
    ? Math.round((universityMetric.score * 0.50 + iqMetric.score * 0.30 + effectiveDegreeScore * 0.20) * 10) / 10
    : Math.round((effectiveDegreeScore * 0.60 + iqMetric.score * 0.40) * 10) / 10;

  return {
    academicDegreeScore: academicDegreeMetric,
    universityScore: universityMetric,
    iqScore: iqMetric,
    totalAcademicScore,
  };
}
