import { OverallDiagnosisResultV3, PublicShareResult } from '@/types/spec-check';

const diagnosisMap = new Map<string, OverallDiagnosisResultV3>();
const shareTokenMap = new Map<string, string>();

export function saveDiagnosis(result: OverallDiagnosisResultV3): void {
  diagnosisMap.set(result.diagnosisId, result);
  shareTokenMap.set(result.shareToken, result.diagnosisId);
}

export function getDiagnosisById(id: string): OverallDiagnosisResultV3 | null {
  return diagnosisMap.get(id) || null;
}

export function getPublicShareResult(shareToken: string): PublicShareResult | null {
  const diagnosisId = shareTokenMap.get(shareToken);
  if (!diagnosisId) return null;

  const full = diagnosisMap.get(diagnosisId);
  if (!full) return null;

  return {
    shareToken: full.shareToken,
    createdAt: full.createdAt,
    gender: full.inputSummary.gender === 'OTHER' ? 'MALE' : full.inputSummary.gender,
    age: full.inputSummary.age,
    prefectureName: full.inputSummary.prefectureName,
    japanOverallScore: full.japanOverallScore,
    loveOverallScore: full.loveOverallScore,
    epithet: full.epithet,
    loveEpithet: full.loveEpithet,
    categoryScores: {
      body: full.categoryScores.body,
      economic: full.categoryScores.economic,
      career: full.categoryScores.career,
      academic: full.categoryScores.academic,
      social: full.categoryScores.social,
      ability: full.categoryScores.ability,
    },
    loveCategoryScores: full.loveCategoryScores,
    metricSummary: full.metrics.map(m => ({
      metricCode: m.metricCode,
      metricName: m.metricName,
      score: m.score,
      topPercent: m.topPercent,
      hasOfficialTopPercent: m.hasOfficialTopPercent,
      dataQuality: m.dataQuality,
      surveyYear: m.surveyYear,
      datasetName: m.datasetName,
    })),
  };
}
