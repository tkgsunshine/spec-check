import { Gender, MaritalStatus, MetricScoreResult } from '@/types/spec-check';
import { renormalizeWeights } from './math-utils';

/**
 * 恋愛・モテ度スペック (LOVE_SCORE V5.0 恋愛人気・年齢動的ウェイトモデル)
 * 
 * 男性評価 (年齢別動的ウェイト):
 * - 25歳未満: FACE 35%, BODY 30%, AGE 20%, INCOME 5%, CAREER 5%, FAMILY 5%
 * - 25~29歳:  FACE 25%, BODY 25%, INCOME 20%, AGE 15%, CAREER 10%, FAMILY 5%
 * - 30~44歳:  INCOME 25%, FACE 20%, BODY 20%, CAREER 15%, AGE 10%, FAMILY 10%
 * - 45歳以上: INCOME 30%, CAREER 20%, FACE 15%, BODY 15%, FAMILY 10%, AGE 10%
 * 
 * 女性評価 (洗練美・ルックス重視):
 * - FACE 35%, BODY 30%, AGE 25%, FAMILY 5%, INCOME 2.5%, CAREER 2.5%
 */
export function calculateLoveScore(params: {
  gender: Gender;
  age: number;
  faceScore: number;
  bodyScore: number;
  incomeScore: number;
  careerScore: number;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number | null;
  prefectureId: number;
}): {
  loveOverallScore: number;
  loveCategoryScores: {
    age: number;
    face: number;
    body: number;
    income: number;
    career: number;
    family: number;
  };
  loveMetrics: MetricScoreResult[];
} {
  const { gender, age, faceScore, bodyScore, incomeScore, careerScore, maritalStatus, childrenCount, prefectureId } = params;

  // 1. 恋愛Age Score (モテ度・人気度年齢曲線モデル V5.0)
  let ageLoveScore = 80;
  if (gender === 'FEMALE') {
    // 女性: 18-25歳(100pt Peak), 26-29歳(96-90pt), 30-34歳(88-80pt), 35-39歳(78-70pt), 40-44歳(68-60pt), 45歳以上(35pt最低保証)
    if (age >= 18 && age <= 25) ageLoveScore = 100;
    else if (age > 25 && age <= 29) ageLoveScore = 96 - (age - 26) * 2;
    else if (age > 29 && age <= 34) ageLoveScore = 88 - (age - 30) * 2;
    else if (age > 34 && age <= 39) ageLoveScore = 78 - (age - 35) * 2;
    else if (age > 39 && age <= 44) ageLoveScore = 68 - (age - 40) * 2;
    else if (age > 44) ageLoveScore = Math.max(35, 58 - (age - 45) * 1.5);
    else ageLoveScore = 90; // 18歳未満
  } else {
    // 男性: 18-26歳(100pt Peak), 27-30歳(96-90pt), 31-35歳(87-75pt), 36-40歳(72-56pt), 41歳以上(25pt最低保証)
    if (age >= 18 && age <= 26) ageLoveScore = 100;
    else if (age > 26 && age <= 30) ageLoveScore = 96 - (age - 27) * 2;
    else if (age > 30 && age <= 35) ageLoveScore = 87 - (age - 31) * 3;
    else if (age > 35 && age <= 40) ageLoveScore = 72 - (age - 36) * 4;
    else if (age > 40) ageLoveScore = Math.max(25, 52 - (age - 41) * 2.5);
    else ageLoveScore = 85; // 18歳未満
  }
  ageLoveScore = Math.max(15, Math.min(100, Math.round(ageLoveScore * 10) / 10));

  const ageMetric: MetricScoreResult = {
    metricCode: 'LOVE_AGE',
    metricName: '恋愛市場年齢',
    category: '恋愛市場',
    rawValue: `${age} 歳 (${gender === 'MALE' ? '男性' : gender === 'FEMALE' ? '女性' : 'その他'})`,
    score: ageLoveScore,
    percentile: null,
    topPercent: null,
    dataQuality: 'MODEL_ESTIMATE',
    datasetName: '全国恋愛・モテ度トレンド統計モデル V5.0 (ルックス・年齢需要動的モデル)',
    sourceUrl: '',
    surveyYear: 2024,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: false,
    notes: gender === 'FEMALE'
      ? '女性モテ度需要曲線適用（20代前半ピーク〜30代大人美高得点維持モデル）。'
      : '男性年代別動的モテ度モデル適用（20代前半ルックス・年齢重視 ➔ 30代以降大人の余裕・経済力融合型）。',
  };

  // 2. Family Score (未婚・婚姻歴・子ども) V5.0
  let familyScore = 90;
  if (maritalStatus === 'MARRIED') familyScore = 45;
  if (maritalStatus === 'DIVORCED') familyScore = 80;
  if (maritalStatus === 'BEREAVED') familyScore = 85;
  if (childrenCount && childrenCount > 0) familyScore -= childrenCount * 8;
  familyScore = Math.max(15, Math.min(100, familyScore));

  const familyMetric: MetricScoreResult = {
    metricCode: 'FAMILY',
    metricName: '家庭・婚姻状況',
    category: '恋愛',
    rawValue: maritalStatus ? `${maritalStatus === 'SINGLE' ? '未婚' : maritalStatus === 'MARRIED' ? '既婚' : maritalStatus === 'DIVORCED' ? '離婚歴あり' : '死別'}${childrenCount ? ` / 子${childrenCount}人` : ''}` : '未入力',
    score: familyScore,
    percentile: null,
    topPercent: null,
    dataQuality: 'MODEL_ESTIMATE',
    datasetName: '国勢調査 配偶関係統計',
    sourceUrl: '',
    surveyYear: 2020,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: false,
    notes: '「統計モデルによる推定」',
  };

  // 3. 男女別・年齢動的市場需要傾斜ウェイト設定
  let availableMetrics;
  if (gender === 'FEMALE') {
    // 女性評価（男性視点）
    availableMetrics = [
      { code: 'FACE', score: faceScore, defaultWeight: 0.35 },
      { code: 'BODY', score: bodyScore, defaultWeight: 0.30 },
      { code: 'AGE', score: ageLoveScore, defaultWeight: 0.25 },
      { code: 'FAMILY', score: familyScore, defaultWeight: 0.05 },
      { code: 'INCOME', score: incomeScore, defaultWeight: 0.025 },
      { code: 'CAREER', score: careerScore, defaultWeight: 0.025 },
    ];
  } else {
    // 男性評価（女性視点: 年代別動的ウェイト）
    if (age < 25) {
      // 20代前半: 見た目・身長・若さが9割
      availableMetrics = [
        { code: 'FACE', score: faceScore, defaultWeight: 0.35 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.30 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.20 },
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.05 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.05 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.05 },
      ];
    } else if (age < 30) {
      // 20代後半: ルックス×社会人キャリア・経済力バランス型 (CAREER 20%へ増額)
      availableMetrics = [
        { code: 'FACE', score: faceScore, defaultWeight: 0.20 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.20 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.20 },
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.20 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.15 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.05 },
      ];
    } else if (age < 45) {
      // 30代〜40代前半: 大人の余裕×経済力・清潔感
      availableMetrics = [
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.25 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.20 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.20 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.15 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.10 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.10 },
      ];
    } else {
      // 45歳以上: ステータス×ダンディさ
      availableMetrics = [
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.30 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.20 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.15 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.15 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.10 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.10 },
      ];
    }
  }

  const { categoryScore: loveOverallScore } = renormalizeWeights(availableMetrics);

  return {
    loveOverallScore,
    loveCategoryScores: {
      age: ageLoveScore,
      face: faceScore,
      body: bodyScore,
      income: incomeScore,
      career: careerScore,
      family: familyScore,
    },
    loveMetrics: [ageMetric, familyMetric],
  };
}
