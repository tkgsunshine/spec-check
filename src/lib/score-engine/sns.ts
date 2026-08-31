import { MetricScoreResult, SnsScoreResult } from '@/types/spec-check';
import { calcHighPrecisionTopPercent } from './math-utils';

/**
 * SNS フォロワー数の log10 スケーリングカーブ (0〜100点)
 * 300人 -> 41.3点
 * 1,000人 -> 50.0点
 * 10,000人 -> 66.7点
 * 100,000人 -> 83.3点
 * 300,000人 -> 91.3点
 * 1,000,000人 -> 100.0点
 */
function calculatePlatformScore(followers: number): number {
  if (followers <= 0) return 0;
  const logVal = Math.log10(followers);
  let score = (logVal / 6.0) * 100;
  score = Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  return score;
}

export function calculateSnsScore(followers?: {
  instagram?: number | null;
  x?: number | null;
  tikTok?: number | null;
  youTube?: number | null;
}): SnsScoreResult {
  const activePlatforms: { name: string; followers: number; score: number }[] = [];

  if (followers?.instagram && followers.instagram > 0) {
    activePlatforms.push({
      name: `Instagram: ${followers.instagram.toLocaleString()}人`,
      followers: followers.instagram,
      score: calculatePlatformScore(followers.instagram),
    });
  }
  if (followers?.x && followers.x > 0) {
    activePlatforms.push({
      name: `X: ${followers.x.toLocaleString()}人`,
      followers: followers.x,
      score: calculatePlatformScore(followers.x),
    });
  }
  if (followers?.tikTok && followers.tikTok > 0) {
    activePlatforms.push({
      name: `TikTok: ${followers.tikTok.toLocaleString()}人`,
      followers: followers.tikTok,
      score: calculatePlatformScore(followers.tikTok),
    });
  }
  if (followers?.youTube && followers.youTube > 0) {
    activePlatforms.push({
      name: `YouTube: ${followers.youTube.toLocaleString()}人`,
      followers: followers.youTube,
      score: calculatePlatformScore(followers.youTube),
    });
  }

  let finalSnsScore = 50.0; // デフォルト：SNS未運用・全0フォロワーは日本人平均 50.0点

  if (activePlatforms.length > 0) {
    // 降順ソート
    activePlatforms.sort((a, b) => b.score - a.score);
    
    // 最多フォロワーSNSのスコアをメインアンカーに採用
    const maxScore = activePlatforms[0].score;

    // 他のサブSNSがあればマルチプラットフォーム効果として15%シナジー加点
    let synergyAdd = 0;
    for (let i = 1; i < activePlatforms.length; i++) {
      synergyAdd += activePlatforms[i].score * 0.15;
    }

    finalSnsScore = Math.min(100, Math.round((maxScore + synergyAdd) * 10) / 10);
  }

  const rawSummary = activePlatforms.length > 0
    ? activePlatforms.map(p => p.name).join(' / ')
    : 'SNS未運用・アカウントなし';

  const snsMetric: MetricScoreResult = {
    metricCode: 'SNS',
    metricName: 'SNS影響力・ファン数',
    category: 'SNS',
    rawValue: rawSummary,
    score: finalSnsScore,
    percentile: null,
    topPercent: calcHighPrecisionTopPercent(Math.max(0.001, 100 - finalSnsScore)),
    dataQuality: 'PROPRIETARY',
    datasetName: 'SPEC CHECK インフルエンサー影響力推計モデル',
    sourceUrl: '',
    surveyYear: 2024,
    calculationMethod: 'MAX_PLATFORM_ANCHOR_WITH_SYNERGY',
    hasOfficialTopPercent: false,
    isOptionalUnentered: activePlatforms.length === 0,
    notes: '未運用SNS(0フォロワー)は分母除外。最多フォロワーSNSの実績をメイン評価軸としマルチ展開をシナジー加点。',
  };

  return {
    snsScore: snsMetric,
    platformsUsed: activePlatforms.map(p => p.name),
  };
}
