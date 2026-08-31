import { MetricScoreResult, UserLanguageInput } from '@/types/spec-check';
import { LANGUAGE_MASTER } from '../datasets/japan-stats';

/**
 * 語学力 (Language) Score の計算 V3.0
 * 複数言語レベル (日常会話 < ビジネス < ネイティブ) を加点。
 * ※日本語は母語登録であっても Score対象外 (0点)。
 */
export function calculateLanguageScore(userLanguages?: UserLanguageInput[]): MetricScoreResult {
  if (!userLanguages || userLanguages.length === 0) {
    return {
      metricCode: 'LANGUAGE',
      metricName: '語学能力',
      category: '能力・経験',
      rawValue: '未選択 (日本語のみ)',
      score: 50,
      percentile: null,
      topPercent: null,
      dataQuality: 'PROPRIETARY',
      datasetName: 'SPEC CHECK 語学能力評価マスター V3.0',
      sourceUrl: '',
      surveyYear: 2026,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      isOptionalUnentered: true,
      notes: '日本語以外の習得言語未入力。',
    };
  }

  let totalPoints = 50; // 基礎点
  const details: string[] = [];

  for (const item of userLanguages) {
    const langConfig = LANGUAGE_MASTER.find(l => l.code === item.languageCode);
    if (!langConfig || langConfig.isNativeDefaultTarget) {
      continue; // 日本語は母語のためScore対象外
    }

    let levelScore = 0;
    if (item.level === 'BASIC') levelScore = 6;
    if (item.level === 'DAILY') levelScore = 12;
    if (item.level === 'BUSINESS') levelScore = 22;
    if (item.level === 'NATIVE') levelScore = 30;

    totalPoints += levelScore;
    const levelText = item.level === 'NATIVE' ? 'ネイティブ' : item.level === 'BUSINESS' ? 'ビジネス' : item.level === 'DAILY' ? '日常会話' : '基礎・挨拶';
    details.push(`${langConfig.nameJa} (${levelText})`);
  }

  const finalScore = Math.max(10, Math.min(100, totalPoints));

  return {
    metricCode: 'LANGUAGE',
    metricName: '語学能力',
    category: '能力・経験',
    rawValue: details.length > 0 ? details.join(', ') : '日本語（母語対象外）',
    score: finalScore,
    percentile: null,
    topPercent: null,
    dataQuality: 'PROPRIETARY',
    datasetName: 'SPEC CHECK 語学能力評価マスター V3.0',
    sourceUrl: '',
    surveyYear: 2026,
    calculationMethod: 'WEIGHTED_PROPRIETARY',
    hasOfficialTopPercent: false,
    isOptionalUnentered: details.length === 0,
    notes: '独自評価（公的単体ランキング表記なし）。日本語は母語のため対象外、複数外国語のレベルに応じた加点。',
  };
}
