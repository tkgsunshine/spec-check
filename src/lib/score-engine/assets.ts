import { Gender, MetricScoreResult } from '@/types/spec-check';
import { NET_WORTH_BRACKETS, getAgeGenderNetWorthDistribution } from '../datasets/japan-stats';

/**
 * 純資産 (Net Worth) Score の計算 V3.0
 * 総資産 ＝ 金融資産 ＋ 不動産 ＋ 車 ＋ 時計 ＋ その他
 * 純資産 ＝ 総資産 − 負債 (住宅ローン ＋ 自動車ローン ＋ 奨学金 ＋ その他借入)
 * ※負債を別Scoreとして二重減点せず、『純資産』を1つの経済Metricとして評価。
 * ※性別・世代(年齢階層)を加味した家計調査統計マトリックスを参照
 */
export function calculateNetWorthScore(params: {
  gender?: Gender;
  age?: number;
  financialAssets?: number | null;
  realEstateAssets?: number | null;
  carAssets?: number | null;
  watchAssets?: number | null;
  otherAssets?: number | null;
  mortgageDebt?: number | null;
  carDebt?: number | null;
  scholarshipDebt?: number | null;
  otherDebt?: number | null;
}): MetricScoreResult | null {
  const {
    gender,
    age,
    financialAssets = 0,
    realEstateAssets = 0,
    carAssets = 0,
    watchAssets = 0,
    otherAssets = 0,
    mortgageDebt = 0,
    carDebt = 0,
    scholarshipDebt = 0,
    otherDebt = 0,
  } = params;

  const hasInput =
    financialAssets ||
    realEstateAssets ||
    carAssets ||
    watchAssets ||
    otherAssets ||
    mortgageDebt ||
    carDebt ||
    scholarshipDebt ||
    otherDebt;

  if (!hasInput) {
    return null;
  }

  const totalAssets = (financialAssets || 0) + (realEstateAssets || 0) + (carAssets || 0) + (watchAssets || 0) + (otherAssets || 0);
  const totalDebt = (mortgageDebt || 0) + (carDebt || 0) + (scholarshipDebt || 0) + (otherDebt || 0);
  const netWorth = totalAssets - totalDebt;

  const ageGroupStats = getAgeGenderNetWorthDistribution(age);

  const isMale = gender === 'MALE';
  const isFemale = gender === 'FEMALE';
  const cumulativeArray = isMale
    ? ageGroupStats.maleCumulative
    : isFemale
    ? ageGroupStats.femaleCumulative
    : ageGroupStats.overallCumulative;

  let cumulativePct = 0;
  for (let i = 0; i < NET_WORTH_BRACKETS.length; i++) {
    const bracket = NET_WORTH_BRACKETS[i];
    const prevLimit = i === 0 ? -Infinity : NET_WORTH_BRACKETS[i - 1].limitMax;
    const cumulativeBelow = cumulativeArray[i];
    const prevCumulative = i === 0 ? 0 : cumulativeArray[i - 1];

    if (netWorth <= bracket.limitMax) {
      if (netWorth <= 0) {
        cumulativePct = Math.max(1, (cumulativeBelow || 15) + netWorth / 100);
      } else {
        const range = bracket.limitMax - (prevLimit === -Infinity ? 0 : prevLimit);
        const progress = (netWorth - (prevLimit === -Infinity ? 0 : prevLimit)) / range;
        cumulativePct = prevCumulative + (cumulativeBelow - prevCumulative) * progress;
      }
      break;
    }
  }

  const percentile = Math.round(Math.max(0.1, Math.min(99.9, cumulativePct)) * 10) / 10;
  const topPercent = Math.round((100 - percentile) * 10) / 10;

  const genderLabel = isMale ? '男性' : isFemale ? '女性' : '全体';

  return {
    metricCode: 'NET_WORTH',
    metricName: '純資産 (総資産 - 負債)',
    category: '経済',
    rawValue: `${netWorth.toLocaleString()} 万円 (資産${totalAssets.toLocaleString()}万 / 負債${totalDebt.toLocaleString()}万)`,
    score: percentile,
    percentile,
    topPercent,
    dataQuality: 'OFFICIAL',
    datasetName: `総務省 家計調査（${ageGroupStats.label}・${genderLabel}統計）`,
    sourceUrl: 'https://www.e-stat.go.jp/',
    surveyYear: 2023,
    calculationMethod: 'SALARY_BRACKET_CUMULATIVE',
    hasOfficialTopPercent: true,
    notes: `『純資産＝総資産−負債』として1項目評価。${ageGroupStats.label}・${genderLabel}の家計調査統計に基づく上位 ${topPercent}%`,
  };
}
