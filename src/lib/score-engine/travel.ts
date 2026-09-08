import { MetricScoreResult } from '@/types/spec-check';

/**
 * 海外渡航経験 Score の計算 V3.1
 * 訪問国/地域数 (travelCount) で対数曲線評価
 * 0カ国: 45pt
 * 1カ国: 52pt, 3カ国: 63pt, 5カ国: 74pt, 10カ国: 87pt, 20カ国: 95.7pt, 25カ国以上: 100pt カンスト
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
  let score = 45;

  if (count === 0) {
    score = 45;
  } else if (count <= 5) {
    // 1〜5カ国: 52点〜74点 (1カ国につき +5.5点)
    score = 52 + (count - 1) * 5.5;
  } else if (count <= 10) {
    // 6〜10カ国: 76.6点〜87点 (1カ国につき +2.6点)
    score = 74 + (count - 5) * 2.6;
  } else if (count <= 25) {
    // 11〜25カ国: 87.8点〜100点 (1カ国につき +0.866点)
    score = 87 + (count - 10) * 0.866;
  } else {
    score = 100;
  }

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
    datasetName: '日本政府観光局 (JNTO) 国別渡航統計モデル V3.1',
    sourceUrl: 'https://www.jnto.go.jp/',
    surveyYear: 2024,
    calculationMethod: 'WEIGHTED_PROPRIETARY',
    hasOfficialTopPercent: false,
    isOptionalUnentered: false,
    notes: count === 0
      ? 'ユーザーによる「渡航歴なし(0か国)」の明示選択。'
      : `訪問国数(${count}カ国)による曲線モデル評価（25カ国で満点100pt）。`,
  };
}
