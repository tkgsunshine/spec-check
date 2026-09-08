import { OverallDiagnosisResultV3, PublicShareResult } from '@/types/spec-check';
import { getAdminFirestore } from './firebase-admin';

const diagnosisMap = new Map<string, OverallDiagnosisResultV3>();
const shareTokenMap = new Map<string, string>();

/**
 * 診断結果（生入力データ・全スコア結果）の完全保存
 */
export async function saveDiagnosis(result: OverallDiagnosisResultV3): Promise<void> {
  // メモリマップに即時保存
  diagnosisMap.set(result.diagnosisId, result);
  shareTokenMap.set(result.shareToken, result.diagnosisId);

  // Firestore DB が接続されていれば永続ドキュメントとして保存
  try {
    const db = getAdminFirestore();
    if (db) {
      const sanitizedDoc = JSON.parse(JSON.stringify({
        ...result,
        shareToken: result.shareToken,
        createdAt: result.createdAt || new Date().toISOString(),
      }));
      await db.collection('diagnoses').doc(result.diagnosisId).set(sanitizedDoc);
    }
  } catch (error) {
    console.error('Firestore saveDiagnosis error:', error);
  }
}

/**
 * 診断IDでデータ取得
 */
export async function getDiagnosisById(id: string): Promise<OverallDiagnosisResultV3 | null> {
  const cached = diagnosisMap.get(id);
  if (cached) return cached;

  const db = getAdminFirestore();
  if (db) {
    try {
      const doc = await db.collection('diagnoses').doc(id).get();
      if (doc.exists) {
        const data = doc.data() as OverallDiagnosisResultV3;
        diagnosisMap.set(data.diagnosisId, data);
        shareTokenMap.set(data.shareToken, data.diagnosisId);
        return data;
      }
    } catch (error) {
      console.error('Firestore getDiagnosisById error:', error);
    }
  }

  return null;
}

/**
 * シェア用パブリックデータ取得
 */
export async function getPublicShareResult(shareToken: string): Promise<PublicShareResult | null> {
  let diagnosisId = shareTokenMap.get(shareToken);
  let full: OverallDiagnosisResultV3 | null = null;

  if (diagnosisId) {
    full = diagnosisMap.get(diagnosisId) || null;
  }

  if (!full) {
    const db = getAdminFirestore();
    if (db) {
      try {
        const snapshot = await db.collection('diagnoses').where('shareToken', '==', shareToken).limit(1).get();
        if (!snapshot.empty) {
          full = snapshot.docs[0].data() as OverallDiagnosisResultV3;
          diagnosisMap.set(full.diagnosisId, full);
          shareTokenMap.set(full.shareToken, full.diagnosisId);
        }
      } catch (error) {
        console.error('Firestore getPublicShareResult error:', error);
      }
    }
  }

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

/**
 * 管理者・統計ダッシュボード用：全個別診断レコードの取得
 */
export async function getAllDiagnosesForAdmin(limitCount = 100): Promise<OverallDiagnosisResultV3[]> {
  const db = getAdminFirestore();
  if (db) {
    try {
      const snapshot = await db.collection('diagnoses')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map(doc => doc.data() as OverallDiagnosisResultV3);
    } catch (error) {
      console.error('Firestore getAllDiagnosesForAdmin error:', error);
    }
  }

  // メモリ内のキャッシュデータを新しい順で返却
  return Array.from(diagnosisMap.values()).reverse().slice(0, limitCount);
}

/**
 * 管理者ダッシュボード用：全体の統計サマリー算出
 */
export async function getDiagnosisStatsSummary() {
  const records = await getAllDiagnosesForAdmin(500);

  const totalCount = records.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      todayCount: 0,
      avgJapanScore: 0,
      avgLoveScore: 0,
      genderRatio: { MALE: 0, FEMALE: 0, OTHER: 0 },
      ageDistribution: {},
      topPrefectures: [],
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = records.filter(r => r.createdAt && r.createdAt.startsWith(todayStr)).length;

  const totalJapanScore = records.reduce((sum, r) => sum + r.japanOverallScore, 0);
  const totalLoveScore = records.reduce((sum, r) => sum + r.loveOverallScore, 0);

  const genderCounts: Record<string, number> = { MALE: 0, FEMALE: 0, OTHER: 0 };
  const ageCounts: Record<string, number> = {};
  const prefCounts: Record<string, number> = {};

  records.forEach(r => {
    const gender = r.inputSummary.gender || 'OTHER';
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;

    const age = r.inputSummary.age || 0;
    const ageGroup = age > 0 ? `${Math.floor(age / 10) * 10}代` : '不明';
    ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;

    const pref = r.inputSummary.prefectureName || '未指定';
    prefCounts[pref] = (prefCounts[pref] || 0) + 1;
  });

  const sortedPrefectures = Object.entries(prefCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pref, count]) => ({ pref, count }));

  return {
    totalCount,
    todayCount,
    avgJapanScore: Math.round((totalJapanScore / totalCount) * 10) / 10,
    avgLoveScore: Math.round((totalLoveScore / totalCount) * 10) / 10,
    genderRatio: genderCounts,
    ageDistribution: ageCounts,
    topPrefectures: sortedPrefectures,
  };
}
