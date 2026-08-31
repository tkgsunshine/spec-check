import { Gender, MetricScoreResult, BodyScoreResult } from '@/types/spec-check';
import { HEIGHT_WEIGHT_STATS } from '../datasets/japan-stats';
import { zToPercentile, renormalizeWeights } from './math-utils';

/**
 * FFMI (Fat-Free Mass Index: 除脂肪体重指数) の算出および男女別筋肉量推計スコア
 * LBM (kg) = 体重 * (1 - 体脂肪率/100)
 * FFMI = LBM / (身長/100)^2
 * 身長 180cm 補正 FFMI = FFMI + 6.1 * (1.8 - 身長/100)
 */
function calculateMuscleMassScore(height: number, weight: number, bodyFat: number, gender: Gender): { ffmi: number; muscleScore: number; bodyTypeLabel: string } {
  const lbm = weight * (1 - bodyFat / 100);
  const heightM = height / 100;
  const rawFfmi = lbm / (heightM * heightM);
  const normalizedFfmi = rawFfmi + 6.1 * (1.8 - heightM);
  const ffmi = Math.round(normalizedFfmi * 10) / 10;

  let muscleScore = 70;
  let bodyTypeLabel = '標準的な体組成';

  if (gender === 'MALE') {
    // 【男性専用 FFMI 判定基準】
    if (ffmi >= 22.0) {
      muscleScore = 98;
      bodyTypeLabel = '最高峰のアスリート・高筋量細マッチョ体型';
    } else if (ffmi >= 20.5) {
      muscleScore = 90;
      bodyTypeLabel = 'しっかりとした筋肉質・トレーニング体型';
    } else if (ffmi >= 19.0) {
      muscleScore = 80;
      bodyTypeLabel = '平均以上の良好な筋肉量';
    } else if (ffmi >= 17.5) {
      muscleScore = 68;
      bodyTypeLabel = '標準的な筋肉量';
    } else {
      muscleScore = 55;
      bodyTypeLabel = '筋肉量少なめ・華奢';
    }
  } else {
    // 【女性専用 FFMI 判定基準】
    if (ffmi >= 17.5) {
      muscleScore = 98;
      bodyTypeLabel = '引き締まったアスリート・美ボディ体型';
    } else if (ffmi >= 16.0) {
      muscleScore = 90;
      bodyTypeLabel = '筋肉量の豊富な健康体型';
    } else if (ffmi >= 14.8) {
      muscleScore = 80;
      bodyTypeLabel = 'バランスの良い標準筋量';
    } else if (ffmi >= 13.5) {
      muscleScore = 68;
      bodyTypeLabel = '標準的な筋肉量';
    } else {
      muscleScore = 55;
      bodyTypeLabel = '筋肉量少なめ・細身';
    }
  }

  return { ffmi, muscleScore, bodyTypeLabel };
}

export function calculateBodyScore(
  gender: Gender,
  age: number,
  height: number,
  weight: number,
  bodyFat?: number | null
): BodyScoreResult {
  const statsList = HEIGHT_WEIGHT_STATS[gender];
  const stat = statsList.find(s => age >= s.ageMin && age <= s.ageMax) || statsList[0];

  // 1. 身長Score (厚生労働省統計・男女年代別正規分布Zスコア)
  const heightZ = (height - stat.heightMean) / stat.heightSd;
  const heightPercentile = zToPercentile(heightZ);
  const heightTopPercent = Math.round((100 - heightPercentile) * 10) / 10;

  const heightScoreResult: MetricScoreResult = {
    metricCode: 'HEIGHT',
    metricName: '身長',
    category: '身体',
    rawValue: `${height} cm`,
    score: heightPercentile,
    percentile: heightPercentile,
    topPercent: heightTopPercent,
    dataQuality: 'OFFICIAL',
    datasetName: '厚生労働省 国民健康・栄養調査 (表14)',
    sourceUrl: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/r4-houkoku.html',
    surveyYear: 2022,
    calculationMethod: 'NORMAL_APPROXIMATION',
    hasOfficialTopPercent: true,
    notes: `同世代（${stat.ageMin}〜${stat.ageMax}歳${gender === 'MALE' ? '男性' : '女性'}）平均 ${stat.heightMean}cm (SD ${stat.heightSd})`,
  };

  // 2. BMI Calculation
  const bmiRaw = weight / Math.pow(height / 100, 2);
  const bmi = Math.round(bmiRaw * 10) / 10;
  const bmiZ = (bmi - stat.bmiMean) / stat.bmiSd;
  const bmiPercentile = zToPercentile(bmiZ);

  // 体脂肪率の有無によるBMI/体型スコアリングの分岐 (完全男女分離モデル)
  let bmiScore = 50;
  let bmiNotes = '';

  if (bodyFat !== undefined && bodyFat !== null && bodyFat > 0) {
    // 【体脂肪率あり】男女別FFMI筋肉量推計 ＋ 男女別体脂肪率優先評価
    const { ffmi, muscleScore, bodyTypeLabel } = calculateMuscleMassScore(height, weight, bodyFat, gender);

    // 男女別 体脂肪率による絞り込み評価
    let fatLeanScore = 75;
    if (gender === 'MALE') {
      if (bodyFat <= 12) fatLeanScore = 98; // 絞れている・シックスパック
      else if (bodyFat <= 16) fatLeanScore = 90;
      else if (bodyFat <= 20) fatLeanScore = 75;
      else if (bodyFat <= 24) fatLeanScore = 60;
      else fatLeanScore = 35; // 脂肪過多
    } else {
      if (bodyFat <= 20) fatLeanScore = 98; // モデル体型・くびれ
      else if (bodyFat <= 24) fatLeanScore = 90;
      else if (bodyFat <= 28) fatLeanScore = 75;
      else if (bodyFat <= 32) fatLeanScore = 60;
      else fatLeanScore = 35;
    }

    // 体脂肪率・筋肉量を組み合わせた体型総合スコア（筋肉量 60% + 絞り 40%）
    bmiScore = Math.round((muscleScore * 0.6 + fatLeanScore * 0.4) * 10) / 10;
    bmiNotes = `FFMI推定: ${ffmi} (${bodyTypeLabel})。体脂肪率 ${bodyFat}% に基づく性別適合体組成判定。`;
  } else {
    // 【体脂肪率未入力】男女別の理想BMI適正・スマート度グラデーション
    if (gender === 'MALE') {
      if (bmi >= 19.5 && bmi <= 22.0) bmiScore = 95; // 男性理想スマート
      else if (bmi >= 22.1 && bmi <= 24.0) bmiScore = 85; // 標準
      else if (bmi >= 18.5 && bmi < 19.5) bmiScore = 80; // 細身
      else if (bmi < 18.5) bmiScore = 70; // 痩せすぎ
      else if (bmi > 24.0 && bmi <= 27.0) bmiScore = 55; // ややぽっちゃり
      else bmiScore = 30; // 肥満傾向
    } else {
      if (bmi >= 18.5 && bmi <= 20.5) bmiScore = 95; // 女性理想モデル体型
      else if (bmi >= 20.6 && bmi <= 22.5) bmiScore = 88; // 健康美
      else if (bmi < 18.5) bmiScore = 85; // スリム
      else if (bmi > 22.5 && bmi <= 25.0) bmiScore = 70; // 標準ややふっくら
      else if (bmi > 25.0 && bmi <= 28.0) bmiScore = 50; // ぽっちゃり
      else bmiScore = 30; // 肥満傾向
    }
    bmiNotes = `同世代(${gender === 'MALE' ? '男性' : '女性'})平均BMI ${stat.bmiMean}。BMI推移に基づくスマート度評価。`;
  }

  const bmiScoreResult: MetricScoreResult = {
    metricCode: 'BMI',
    metricName: '体型・筋肉量 (BMI/FFMI)',
    category: '身体',
    rawValue: `BMI ${bmi} (体重${weight}kg / 身長${height}cm)`,
    score: bmiScore,
    percentile: bmiPercentile,
    topPercent: null,
    dataQuality: 'PROPRIETARY',
    datasetName: 'SPEC CHECK FFMI筋肉量＆男女別体組成評価モデル',
    sourceUrl: '',
    surveyYear: 2024,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: false,
    notes: bmiNotes,
  };

  // 3. 体重 Score (男女年代別平均比較)
  const weightZ = (weight - stat.weightMean) / stat.weightSd;
  let weightScore = 100 - Math.abs(weightZ) * 20;
  weightScore = Math.max(10, Math.min(100, Math.round(weightScore * 10) / 10));

  const weightScoreResult: MetricScoreResult = {
    metricCode: 'WEIGHT',
    metricName: '体重',
    category: '身体',
    rawValue: `${weight} kg`,
    score: weightScore,
    percentile: zToPercentile(weightZ),
    topPercent: null,
    dataQuality: 'OFFICIAL',
    datasetName: '厚生労働省 国民健康・栄養調査 (表14)',
    sourceUrl: '',
    surveyYear: 2022,
    calculationMethod: 'NORMAL_APPROXIMATION',
    hasOfficialTopPercent: false,
    notes: `同世代（${gender === 'MALE' ? '男性' : '女性'}）平均体重 ${stat.weightMean}kg 比較`,
  };

  // 4. 体脂肪率 Score (男女別理想基準)
  let bodyFatScoreResult: MetricScoreResult;
  if (bodyFat !== undefined && bodyFat !== null && bodyFat > 0) {
    const idealFat = gender === 'MALE' ? 14 : 21;
    let fatScore = 100 - Math.abs(bodyFat - idealFat) * 3.5;
    fatScore = Math.max(10, Math.min(100, Math.round(fatScore * 10) / 10));

    bodyFatScoreResult = {
      metricCode: 'BODY_FAT',
      metricName: '体脂肪率',
      category: '身体',
      rawValue: `${bodyFat} %`,
      score: fatScore,
      percentile: null,
      topPercent: null,
      dataQuality: 'PROPRIETARY',
      datasetName: 'SPEC CHECK 男女別体脂肪評価モデル',
      sourceUrl: '',
      surveyYear: 2024,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      notes: `体脂肪率 ${bodyFat}% に基づく性別適合評価 (男性理想14%, 女性理想21%)`,
    };
  } else {
    bodyFatScoreResult = {
      metricCode: 'BODY_FAT',
      metricName: '体脂肪率',
      category: '身体',
      rawValue: null,
      score: 50,
      percentile: null,
      topPercent: null,
      dataQuality: 'PROPRIETARY',
      datasetName: '未入力',
      sourceUrl: '',
      surveyYear: 2024,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      isOptionalUnentered: true,
      notes: '未入力のため重み再正規化対象',
    };
  }

  // 重み再正規化
  const availableMetrics = [
    { code: 'HEIGHT', score: heightScoreResult.score, defaultWeight: 0.35 },
    { code: 'BMI', score: bmiScoreResult.score, defaultWeight: 0.40 },
    { code: 'WEIGHT', score: weightScoreResult.score, defaultWeight: 0.05 },
  ];

  if (bodyFat !== undefined && bodyFat !== null && bodyFat > 0) {
    availableMetrics.push({ code: 'BODY_FAT', score: bodyFatScoreResult.score, defaultWeight: 0.20 });
  }

  const { categoryScore: totalBodyScore } = renormalizeWeights(availableMetrics);

  return {
    heightScore: heightScoreResult,
    bmiScore: bmiScoreResult,
    bodyFatScore: bodyFatScoreResult,
    weightScore: weightScoreResult,
    totalBodyScore,
  };
}
