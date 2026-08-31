import { MetricScoreResult, CareerScoreResult } from '@/types/spec-check';
import { COMMON_OCCUPATION_MASTER, COMPANY_CATEGORY_SCORES, POSITION_MASTER } from '../datasets/japan-stats';
import { COMPANY_MASTER, CompanyMasterItem } from '../datasets/company-master';

// 経済産業省「経済センサス」都道府県別大企業・主要拠点比率に基づく地域稀少性ボーナス (pt)
export const REGIONAL_CORPORATE_HEADQUARTER_FACTORS: Record<string, number> = {
  '東京都': 0,
  '大阪府': 1,
  '愛知県': 1,
  '神奈川県': 2,
  '兵庫県': 2,
  '福岡県': 2,
  '埼玉県': 3,
  '千葉県': 3,
  '京都府': 3,
  '広島県': 4,
  '宮城県': 4,
  '静岡県': 4,
  '茨城県': 5,
  '栃木県': 5,
  '群馬県': 5,
  '岡山県': 5,
  '北海道': 5,
  '滋賀県': 5,
  '三重県': 6,
  '岐阜県': 6,
  '石川県': 6,
  '新潟県': 6,
  '長野県': 6,
  '香川県': 6,
  '山口県': 6,
  '熊本県': 6,
  '愛媛県': 7,
  '富山県': 7,
  '福井県': 7,
  '山梨県': 7,
  '福島県': 7,
  '長崎県': 7,
  '大分県': 7,
  '徳島県': 7,
  '高知県': 8,
  '島根県': 8,
  '鳥取県': 8,
  '宮崎県': 8,
  '鹿児島県': 8,
  '佐賀県': 8,
  '山形県': 8,
  '秋田県': 8,
  '岩手県': 8,
  '青森県': 8,
  '沖縄県': 8,
  '全国': 0,
};

/**
 * 職業・役職・会社 Score (CAREER_SCORE) の計算 V3.0
 */
export function calculateCareerScore(
  occupationCode: string,
  employmentType: string,
  positionCode?: string | null,
  companyName?: string | null,
  companyCategory?: string | null,
  prefectureName?: string | null
): CareerScoreResult {
  // 1. 職種 & 役職Score (共通職種マスタより検索)
  const occ = COMMON_OCCUPATION_MASTER.find(o => o.id === occupationCode) 
    || COMMON_OCCUPATION_MASTER.find(o => o.name === occupationCode) 
    || COMMON_OCCUPATION_MASTER[COMMON_OCCUPATION_MASTER.length - 1];
  
  // 雇用形態補正
  let empBonus = 0;
  if (employmentType === 'EXECUTIVE') empBonus = 5;
  if (employmentType === 'REGULAR') empBonus = 2;
  if (employmentType === 'CONTRACT') empBonus = -5;
  if (employmentType === 'UNEMPLOYED') empBonus = -20;

  // 役職補正 V3.0
  const posItem = POSITION_MASTER.find(p => p.code === positionCode) || POSITION_MASTER[POSITION_MASTER.length - 1];
  const posBonus = posItem ? posItem.bonusScore : 0;

  const occupationScore = Math.max(10, Math.min(100, occ.baseScore + empBonus + posBonus));

  const occupationMetric: MetricScoreResult = {
    metricCode: 'OCCUPATION',
    metricName: '職種・役職',
    category: '仕事',
    rawValue: posItem ? `${occ.name} / ${posItem.name}` : occ.name,
    score: occupationScore,
    percentile: null,
    topPercent: null,
    dataQuality: 'PROPRIETARY',
    datasetName: '厚生労働省 賃金構造基本統計調査 & SPEC CHECK 共通職種マスター V3.0',
    sourceUrl: 'https://www.mhlw.go.jp/toukei/list/45-1.html',
    surveyYear: 2023,
    calculationMethod: 'WEIGHTED_PROPRIETARY',
    hasOfficialTopPercent: false,
    notes: `独自共通職種評価 (基本スコア ${occ.baseScore} + 雇用形態・役職加点)`,
  };

  // 2. 会社Score (マスタ検索 ＋ 任意入力カテゴリ)
  let companyMetric: MetricScoreResult | null = null;

  if ((companyName && companyName.trim() !== '') || companyCategory) {
    const trimmedCompName = companyName ? companyName.trim() : '';

    // マスタ完全一致・部分一致・エイリアス一致を探索
    const qLower = trimmedCompName.toLowerCase();
    const matchedMaster = trimmedCompName
      ? COMPANY_MASTER.find(
          c =>
            c.name.toLowerCase().includes(qLower) ||
            qLower.includes(c.name.toLowerCase()) ||
            c.aliases.some(a => a.toLowerCase().includes(qLower) || qLower.includes(a.toLowerCase()))
        )
      : null;

    let baseCompScore = 70;
    let datasetLabel = 'SPEC CHECK 企業格付けマスター V3.0';
    let rawCompanyValue = companyName || '指定企業';

    if (matchedMaster) {
      // 平均年収ボーナス算定 (2000万以上 +10, 1500万以上 +8, 1200万以上 +6, 1000万以上 +4, 800万以上 +2)
      let salaryBonus = 0;
      if (matchedMaster.averageAnnualSalary >= 2000) salaryBonus = 10;
      else if (matchedMaster.averageAnnualSalary >= 1500) salaryBonus = 8;
      else if (matchedMaster.averageAnnualSalary >= 1200) salaryBonus = 6;
      else if (matchedMaster.averageAnnualSalary >= 1000) salaryBonus = 4;
      else if (matchedMaster.averageAnnualSalary >= 800) salaryBonus = 2;

      baseCompScore = Math.min(100, matchedMaster.baseScore + salaryBonus);
      datasetLabel = `EDINET有価証券報告書・東証適時開示 (${matchedMaster.marketCategoryLabel} / 平均年収 ${matchedMaster.averageAnnualSalary}万円)`;
      rawCompanyValue = `${matchedMaster.name} [${matchedMaster.marketCategoryLabel} / 平均年収${matchedMaster.averageAnnualSalary}万円]`;
    } else {
      const categoryKey = companyCategory || 'LARGE';
      const compConfig = COMPANY_CATEGORY_SCORES[categoryKey] || COMPANY_CATEGORY_SCORES.OTHER;
      baseCompScore = compConfig.score;
      datasetLabel = '経済産業省 経済センサス & 企業規模区分マスター';
      rawCompanyValue = companyName ? `${companyName} (${compConfig.label})` : compConfig.label;
    }

    // 大企業（プライム上場・大手）勤務または役員に対する地域稀少性ボーナス
    const isLargeCompanyOrExec = matchedMaster
      ? matchedMaster.marketCategory === 'PRIME' || matchedMaster.marketCategory === 'GLOBAL_TOP'
      : (companyCategory === 'LARGE_PRIME' || companyCategory === 'LARGE');

    const regCorporateBonus = (isLargeCompanyOrExec && prefectureName && REGIONAL_CORPORATE_HEADQUARTER_FACTORS[prefectureName])
      ? REGIONAL_CORPORATE_HEADQUARTER_FACTORS[prefectureName]
      : 0;

    // 雇用形態に応じた勤務先企業スコア補正 (正社員・役員＝満額、契約＝-20、派遣パート＝-30)
    let compEmpDiscount = 0;
    if (employmentType === 'CONTRACT') compEmpDiscount = -20;
    if (employmentType === 'DISPATCH' || employmentType === 'PART_TIME') compEmpDiscount = -30;
    if (employmentType === 'UNEMPLOYED') compEmpDiscount = -50;

    const adjustedCompanyScore = Math.max(10, Math.min(100, baseCompScore + compEmpDiscount + regCorporateBonus));

    companyMetric = {
      metricCode: 'COMPANY',
      metricName: '勤務先企業',
      category: '仕事',
      rawValue: rawCompanyValue,
      score: adjustedCompanyScore,
      percentile: null,
      topPercent: null,
      dataQuality: matchedMaster ? 'OFFICIAL' : 'PROPRIETARY',
      datasetName: datasetLabel,
      sourceUrl: '',
      surveyYear: 2024,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      notes: matchedMaster
        ? `企業マスタ照合 (${matchedMaster.marketCategoryLabel}・平均年収${matchedMaster.averageAnnualSalary}万円拠出) ＋ 雇用形態補正`
        : `企業規模区分マスター拠出 ＋ 雇用形態補正`,
    };
  }

  // 総合仕事スコア
  const totalCareerScore = companyMetric
    ? Math.round((occupationMetric.score * 0.5 + companyMetric.score * 0.5) * 10) / 10
    : occupationMetric.score;

  return {
    companyScore: companyMetric,
    occupationScore: occupationMetric,
    totalCareerScore,
  };
}
