import { MetricScoreResult } from '@/types/spec-check';

/**
 * 海外渡航経験 Score の計算 V3.0
 * 訪問国/地域数 (travelCount) で評価
 */
export function calculateTravelScore(travelCount?: number | null): MetricScoreResult {
  if (travelCount === null || travelCount === undefined) {
    return {
      metricCode: 'TRAVEL',
      metricName: '海外渡航経験',
      category: '能力・経験',
      rawValue: '未選択',
      score: 45,
      percentile: null,
      topPercent: null,
      dataQuality: 'PROPRIETARY',
      datasetName: '未入力',
      sourceUrl: 'https://www.jnto.go.jp/',
      surveyYear: 2024,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      isOptionalUnentered: true,
      notes: '未入力項目。',
    };
  }

  const count = Math.max(0, travelCount);
  let score = count === 0 ? 45 : 50 + count * 6.5;
  score = Math.max(10, Math.min(100, Math.round(score * 10) / 10));

  return {
    metricCode: 'TRAVEL',
    metricName: '海外渡航経験',
    category: '能力・経験',
    rawValue: count === 0 ? '渡航歴なし (0か国)' : `${count} か国訪問`,
    score,
    percentile: null,
    topPercent: null,
    dataQuality: 'PROPRIETARY',
    datasetName: '日本政府観光局 (JNTO) 国別渡航統計モデル',
    sourceUrl: 'https://www.jnto.go.jp/',
    surveyYear: 2024,
    calculationMethod: 'WEIGHTED_PROPRIETARY',
    hasOfficialTopPercent: false,
    isOptionalUnentered: false,
    notes: count === 0 ? 'ユーザーによる「渡航歴なし(0か国)」の明示選択。' : '訪問国数による評価。',
  };
}
