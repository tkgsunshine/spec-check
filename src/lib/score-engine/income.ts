import { Gender, MetricScoreResult, IncomeScoreResult } from '@/types/spec-check';
import { calcHighPrecisionTopPercent } from './math-utils';
import { INCOME_BRACKETS, getAgeIncomeDistribution } from '../datasets/japan-stats';

// 厚生労働省「賃金構造基本統計調査」に基づく都道府県別賃金調整係数 (全国 = 1.0)
export const PREFECTURE_SALARY_FACTORS: Record<string, number> = {
  '全国': 1.00,
  '東京都': 1.25,
  '神奈川県': 1.12,
  '大阪府': 1.08,
  '愛知県': 1.10,
  '兵庫県': 1.03,
  '京都府': 1.02,
  '埼玉県': 1.04,
  '千葉県': 1.03,
  '茨城県': 1.02,
  '栃木県': 1.00,
  '群馬県': 0.98,
  '静岡県': 1.01,
  '三重県': 0.99,
  '滋賀県': 0.99,
  '広島県': 0.98,
  '福岡県': 0.97,
  '宮城県': 0.96,
  '北海道': 0.93,
  '岡山県': 0.95,
  '石川県': 0.94,
  '富山県': 0.94,
  '福井県': 0.93,
  '長野県': 0.94,
  '岐阜県': 0.95,
  '山口県': 0.93,
  '香川県': 0.92,
  '徳島県': 0.91,
  '愛媛県': 0.90,
  '高知県': 0.88,
  '佐賀県': 0.88,
  '長崎県': 0.87,
  '熊本県': 0.89,
  '大分県': 0.88,
  '宮崎県': 0.86,
  '鹿児島県': 0.87,
  '沖縄県': 0.83,
  '青森県': 0.84,
  '岩手県': 0.85,
  '秋田県': 0.84,
  '山形県': 0.85,
  '福島県': 0.88,
  '新潟県': 0.90,
  '山梨県': 0.92,
  '鳥取県': 0.86,
  '島根県': 0.86,
};

export function calculateIncomeScore(
  gender: Gender,
  age: number | undefined,
  annualIncome: number, // 万円
  prefectureName?: string
): IncomeScoreResult {
  const prefFactor = (prefectureName && PREFECTURE_SALARY_FACTORS[prefectureName]) || 1.00;
  // 地域物価・平均賃金水準で実質年収比較額を調整
  const adjustedIncome = annualIncome / prefFactor;

  const userAge = age || 35;
  const ageGroupStats = getAgeIncomeDistribution(userAge);

  let cumulativePct = 0;

  const isMale = gender === 'MALE';
  const isFemale = gender === 'FEMALE';
  const cumulativeArray = isMale
    ? ageGroupStats.maleCumulative
    : isFemale
    ? ageGroupStats.femaleCumulative
    : ageGroupStats.overallCumulative;

  for (let i = 0; i < INCOME_BRACKETS.length; i++) {
    const bracket = INCOME_BRACKETS[i];
    const prevLimit = i === 0 ? 0 : INCOME_BRACKETS[i - 1].limitMax;
    const cumulativeBelow = cumulativeArray[i];
    const prevCumulative = i === 0 ? 0 : cumulativeArray[i - 1];

    if (adjustedIncome <= bracket.limitMax) {
      if (bracket.limitMax === Infinity) {
        cumulativePct = 99.5 + Math.min(0.4, (adjustedIncome - 2000) / 10000);
      } else {
        const bracketRange = bracket.limitMax - prevLimit;
        const progressInBracket = Math.max(0, (adjustedIncome - prevLimit) / bracketRange);
        cumulativePct = prevCumulative + (cumulativeBelow - prevCumulative) * progressInBracket;
      }
      break;
    }
  }

  const percentile = Math.round(cumulativePct * 10) / 10;
  const topPercent = calcHighPrecisionTopPercent(100 - cumulativePct);
  const score = percentile;

  const prefLabel = prefectureName && prefectureName !== '全国' ? `${prefectureName}` : '全国';
  const genderLabel = isMale ? '同性' : isFemale ? '同性' : '全体';

  const incomeScoreResult: MetricScoreResult = {
    metricCode: 'INCOME',
    metricName: '年収',
    category: '経済',
    rawValue: `${annualIncome} 万円`,
    score,
    percentile,
    topPercent,
    dataQuality: 'OFFICIAL',
    datasetName: `国税庁・厚労省（${ageGroupStats.label}・${genderLabel}・${prefLabel}基準）`,
    sourceUrl: 'https://www.nta.go.jp/publication/statistics/kokuaitokei/minkan2023/minkan.htm',
    surveyYear: 2023,
    calculationMethod: 'SALARY_BRACKET_CUMULATIVE',
    hasOfficialTopPercent: true,
    notes: `国税庁民間給与実態統計調査の${ageGroupStats.label}・${genderLabel}統計に基づき比較算出。上位 ${topPercent}%`,
  };

  return {
    incomeScore: incomeScoreResult,
    totalEconomicScore: score,
  };
}
