import { Gender, MaritalStatus, MetricScoreResult } from '@/types/spec-check';
import { renormalizeWeights } from './math-utils';
import { getMbtiLoveBonus } from './mbti';
import { calculateExperienceScore } from './experience';

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
  snsScore?: number;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number | null;
  partnerCount?: number | null;
  prefectureId: number;
  mbti?: string | null;
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
  const { gender, age, faceScore, bodyScore, incomeScore, careerScore, snsScore, maritalStatus, childrenCount, partnerCount, prefectureId, mbti } = params;

  // キャリア・影響力 (職歴・年収ステータス + SNS影響力/フォロワー数の合成スコア)
  const combinedCareerScore = (snsScore !== undefined && snsScore !== null && snsScore > 0)
    ? Math.max(careerScore, Math.round((careerScore * 0.7 + snsScore * 0.3) * 10) / 10)
    : careerScore;

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
    // 男性: 24-32歳(100pt Peak モテ黄金期), 20-23歳(85-95.5pt フレッシュ期), 18-19歳(75-80pt 学生期), 33-37歳(96-86pt 大人モテ期), 38-42歳(83-71pt), 43歳以上(30pt最低保証)
    if (age >= 24 && age <= 32) ageLoveScore = 100;
    else if (age >= 20 && age < 24) ageLoveScore = 85 + (age - 20) * 3.5;
    else if (age >= 18 && age < 20) ageLoveScore = 75 + (age - 18) * 5;
    else if (age > 32 && age <= 37) ageLoveScore = 96 - (age - 33) * 2.5;
    else if (age > 37 && age <= 42) ageLoveScore = 83 - (age - 38) * 3;
    else if (age > 42) ageLoveScore = Math.max(30, 68 - (age - 43) * 2.5);
    else ageLoveScore = 70; // 18歳未満
  }
  ageLoveScore = Math.max(15, Math.min(100, Math.round(ageLoveScore * 10) / 10));

  // 年齢モテ需要における相対上位パーセント
  const ageTopPercent = ageLoveScore >= 60 ? Math.round((100 - ageLoveScore * 0.7) * 10) / 10 : null;

  const ageMetric: MetricScoreResult = {
    metricCode: 'LOVE_AGE',
    metricName: '恋愛市場年齢',
    category: '恋愛市場',
    rawValue: `${age} 歳 (${gender === 'MALE' ? '男性' : gender === 'FEMALE' ? '女性' : 'その他'})`,
    score: ageLoveScore,
    percentile: ageTopPercent !== null ? 100 - ageTopPercent : null,
    topPercent: ageTopPercent,
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

  // 国勢調査 (2020年) 年代別未婚率統計データに基づいた実態上位％
  let unmarriedRate = 40.0;
  if (gender === 'FEMALE') {
    if (age < 25) unmarriedRate = 91.4;
    else if (age < 30) unmarriedRate = 62.4;
    else if (age < 35) unmarriedRate = 35.2;
    else if (age < 40) unmarriedRate = 26.2;
    else if (age < 45) unmarriedRate = 21.3;
    else if (age < 50) unmarriedRate = 19.2;
    else unmarriedRate = 17.8;
  } else {
    if (age < 25) unmarriedRate = 95.1;
    else if (age < 30) unmarriedRate = 72.7;
    else if (age < 35) unmarriedRate = 47.1;
    else if (age < 40) unmarriedRate = 38.5;
    else if (age < 45) unmarriedRate = 32.5;
    else if (age < 50) unmarriedRate = 29.9;
    else unmarriedRate = 28.3;
  }

  const familyTopPercent = (maritalStatus === 'SINGLE' || !maritalStatus) && (!childrenCount || childrenCount === 0)
    ? unmarriedRate
    : null;

  const familyMetric: MetricScoreResult = {
    metricCode: 'FAMILY',
    metricName: '家庭・婚姻状況',
    category: '恋愛',
    rawValue: maritalStatus ? `${maritalStatus === 'SINGLE' ? '未婚' : maritalStatus === 'MARRIED' ? '既婚' : maritalStatus === 'DIVORCED' ? '離婚歴あり' : '死別'}${childrenCount ? ` / 子${childrenCount}人` : ''}` : '未入力',
    score: familyScore,
    percentile: familyTopPercent !== null ? 100 - familyTopPercent : null,
    topPercent: familyTopPercent,
    dataQuality: 'OFFICIAL',
    datasetName: '総務省 国勢調査 配偶関係統計',
    sourceUrl: 'https://www.stat.go.jp/data/kokusei/2020/',
    surveyYear: 2020,
    calculationMethod: 'EXACT_PERCENTILE',
    hasOfficialTopPercent: true,
    notes: '総務省国勢調査による年代別未婚率実態データ',
  };

  // 3. 経験人数スコア算出 (男性: 案B 対数モテモデル / 女性: 案A 逆U字ベルカーブモデル)
  const experienceMetric = calculateExperienceScore(partnerCount, gender, age);
  const finalFamilyScore = (partnerCount !== null && partnerCount !== undefined)
    ? Math.round((familyScore * 0.65 + experienceMetric.score * 0.35) * 10) / 10
    : familyScore;

  // 4. 男女別・年齢動的市場需要傾斜ウェイト設定
  let availableMetrics;
  if (gender === 'FEMALE') {
    // 女性評価（男性視点）
    availableMetrics = [
      { code: 'FACE', score: faceScore, defaultWeight: 0.35 },
      { code: 'BODY', score: bodyScore, defaultWeight: 0.30 },
      { code: 'AGE', score: ageLoveScore, defaultWeight: 0.25 },
      { code: 'FAMILY', score: finalFamilyScore, defaultWeight: 0.05 },
      { code: 'INCOME', score: incomeScore, defaultWeight: 0.025 },
      { code: 'CAREER', score: combinedCareerScore, defaultWeight: 0.025 },
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
        { code: 'CAREER', score: combinedCareerScore, defaultWeight: 0.05 },
        { code: 'FAMILY', score: finalFamilyScore, defaultWeight: 0.05 },
      ];
    } else if (age < 30) {
      // 20代後半: ルックス×プレ経済力 (CAREER 10%)
      availableMetrics = [
        { code: 'FACE', score: faceScore, defaultWeight: 0.25 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.25 },
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.20 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.15 },
        { code: 'CAREER', score: combinedCareerScore, defaultWeight: 0.10 },
        { code: 'FAMILY', score: finalFamilyScore, defaultWeight: 0.05 },
      ];
    } else if (age < 45) {
      // 30代〜40代前半: 大人の余裕×経済力・清潔感
      availableMetrics = [
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.25 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.20 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.20 },
        { code: 'CAREER', score: combinedCareerScore, defaultWeight: 0.15 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.10 },
        { code: 'FAMILY', score: finalFamilyScore, defaultWeight: 0.10 },
      ];
    } else {
      // 45歳以上: ステータス×ダンディさ
      availableMetrics = [
        { code: 'INCOME', score: incomeScore, defaultWeight: 0.30 },
        { code: 'CAREER', score: combinedCareerScore, defaultWeight: 0.20 },
        { code: 'FACE', score: faceScore, defaultWeight: 0.15 },
        { code: 'BODY', score: bodyScore, defaultWeight: 0.15 },
        { code: 'FAMILY', score: finalFamilyScore, defaultWeight: 0.10 },
        { code: 'AGE', score: ageLoveScore, defaultWeight: 0.10 },
      ];
    }
  }

  const { categoryScore: baseLoveOverallScore } = renormalizeWeights(availableMetrics);

  // 5. MBTI性格特性・恋愛モテ度ボーナス (+0〜3.0pt)
  const mbtiLove = getMbtiLoveBonus(mbti, gender);
  const loveOverallScore = Math.min(100, Math.round((baseLoveOverallScore + mbtiLove.bonus) * 10) / 10);

  const mbtiMetric: MetricScoreResult | null = mbti && mbti.trim() !== '' ? {
    metricCode: 'MBTI_LOVE',
    metricName: 'MBTI恋愛傾向・モテ度',
    category: '恋愛市場',
    rawValue: `${mbti.trim().toUpperCase()}（${mbtiLove.label || '標準'}）`,
    score: Math.min(100, Math.round((50 + mbtiLove.bonus * 12) * 10) / 10),
    percentile: mbtiLove.bonus > 0 ? Math.min(95, Math.round(50 + mbtiLove.bonus * 13)) : 50,
    topPercent: mbtiLove.bonus > 0 ? Math.max(5, Math.round(50 - mbtiLove.bonus * 13)) : 50,
    dataQuality: 'MODEL_ESTIMATE',
    datasetName: '恋愛市場パーソナリティ動態統計・MBTIモテ傾向調査 (2024)',
    sourceUrl: '',
    surveyYear: 2024,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: false,
    notes: mbtiLove.notes || `MBTI特性（${mbti.trim().toUpperCase()}）による恋愛モテ傾向`,
  } : null;

  return {
    loveOverallScore,
    loveCategoryScores: {
      age: ageLoveScore,
      face: faceScore,
      body: bodyScore,
      income: incomeScore,
      career: combinedCareerScore,
      family: finalFamilyScore,
    },
    loveMetrics: [
      ageMetric,
      familyMetric,
      ...(partnerCount !== null && partnerCount !== undefined ? [experienceMetric] : []),
      ...(mbtiMetric ? [mbtiMetric] : []),
    ],
  };
}
