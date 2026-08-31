import { Gender, MaritalStatus, MetricScoreResult } from '@/types/spec-check';
import { renormalizeWeights } from './math-utils';

/**
 * 恋愛スペック (LOVE_SCORE V4.0 男女別市場需要傾斜モデル)
 * 
 * 男性査定 (女性視点): INCOME 25%, BODY 20%, CAREER 15%, AGE 15%, FACE 15%, FAMILY 10%
 * 女性査定 (男性視点): AGE 30%, FACE 30%, BODY 20%, FAMILY 10%, INCOME 5%, CAREER 5%
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

  // 1. 恋愛Age Score (男女別の初婚年齢・婚活市場需要曲線モデル)
  let ageLoveScore = 80;
  if (gender === 'FEMALE') {
    // 女性: 20-27歳がピーク(100pt), 28-30歳(93pt), 31-35歳(82pt), 36-40歳(68pt), 41歳以上(55pt)
    if (age >= 20 && age <= 27) ageLoveScore = 100;
    else if (age > 27 && age <= 30) ageLoveScore = 93 - (age - 27) * 2;
    else if (age > 30 && age <= 35) ageLoveScore = 87 - (age - 30) * 2.5;
    else if (age > 35 && age <= 40) ageLoveScore = 74 - (age - 35) * 3;
    else if (age > 40) ageLoveScore = Math.max(25, 59 - (age - 40) * 2.5);
    else ageLoveScore = 85; // 20歳未満
  } else {
    // 男性: 28-34歳がピーク(100pt), 25-27歳(90pt), 35-39歳(88pt), 40-45歳(75pt), 46歳以上(60pt)
    if (age >= 28 && age <= 34) ageLoveScore = 100;
    else if (age >= 25 && age < 28) ageLoveScore = 90 + (age - 25) * 3;
    else if (age > 34 && age <= 39) ageLoveScore = 98 - (age - 34) * 2;
    else if (age > 39 && age <= 45) ageLoveScore = 88 - (age - 39) * 2.5;
    else if (age > 45) ageLoveScore = Math.max(25, 73 - (age - 45) * 2.5);
    else ageLoveScore = 80; // 25歳未満
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
    datasetName: 'IBJ / リクルートブライダル総研 / 厚労省 人口動態統計 婚姻需要モデル V4.0',
    sourceUrl: 'https://www.mhlw.go.jp/toukei/list/81-1a.html',
    surveyYear: 2024,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: false,
    notes: gender === 'FEMALE'
      ? '女性市場需要曲線適用（20代中盤ピークモデル）。'
      : '男性市場需要曲線適用（30代前半経済力・成熟度ピークモデル）。',
  };

  // 2. Family Score (未婚・婚姻歴・子ども) V4.0
  let familyScore = 90;
  if (maritalStatus === 'MARRIED') familyScore = 40;
  if (maritalStatus === 'DIVORCED') familyScore = 75;
  if (maritalStatus === 'BEREAVED') familyScore = 80;
  if (childrenCount && childrenCount > 0) familyScore -= childrenCount * 10;
  familyScore = Math.max(10, Math.min(100, familyScore));

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

  // 3. 男女別市場需要傾斜ウェイト設定
  // 女性査定(男性需要): AGE 30%, FACE 30%, BODY 20%, FAMILY 10%, INCOME 5%, CAREER 5%
  // 男性査定(女性需要): INCOME 25%, BODY 20%, CAREER 15%, AGE 15%, FACE 15%, FAMILY 10%
  const availableMetrics = gender === 'FEMALE'
    ? [
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.30 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.30 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.20 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.10 },
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.05 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.05 },
      ]
    : [
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.25 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.20 },
        { code: 'CAREER', score: careerScore, defaultWeight: 0.15 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.15 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.15 },
        { code: 'FAMILY', score: familyScore, defaultWeight: 0.10 },
      ];

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
