export type DataQuality = 
  | 'OFFICIAL' 
  | 'OFFICIAL_ESTIMATED' 
  | 'PROPRIETARY' 
  | 'AI' 
  | 'MODEL_ESTIMATE' 
  | 'USER_INPUT';

export type CalculationMethod = 
  | 'EXACT_PERCENTILE' 
  | 'NORMAL_APPROXIMATION' 
  | 'SALARY_BRACKET_CUMULATIVE' 
  | 'LOG10_CURVE' 
  | 'WEIGHTED_PROPRIETARY' 
  | 'STATISTICAL_MODEL_ESTIMATE'
  | 'MAX_PLATFORM_ANCHOR_WITH_SYNERGY';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'BEREAVED';
export type LanguageLevel = 'BASIC' | 'DAILY' | 'BUSINESS' | 'NATIVE';

export interface MetricScoreResult {
  metricCode: string;
  metricName: string;
  category: string;
  rawValue: string | number | boolean | null;
  score: number;
  percentile: number | null;
  topPercent: number | null;
  dataQuality: DataQuality;
  datasetName: string;
  sourceUrl: string;
  surveyYear: number;
  calculationMethod: CalculationMethod;
  hasOfficialTopPercent: boolean;
  isOptionalUnentered?: boolean;
  notes?: string;
}

export interface BodyScoreResult {
  heightScore: MetricScoreResult;
  bmiScore: MetricScoreResult;
  bodyFatScore: MetricScoreResult;
  weightScore: MetricScoreResult;
  totalBodyScore: number;
}

export interface IncomeScoreResult {
  incomeScore: MetricScoreResult;
  totalEconomicScore: number;
}

export interface AcademicScoreResult {
  academicDegreeScore: MetricScoreResult;
  universityScore: MetricScoreResult | null;
  iqScore: MetricScoreResult | null;
  totalAcademicScore: number;
}

export interface CareerScoreResult {
  companyScore: MetricScoreResult | null;
  occupationScore: MetricScoreResult;
  totalCareerScore: number;
}

export interface SnsScoreResult {
  snsScore: MetricScoreResult;
  platformsUsed: string[];
}

export interface FaceScoreResult {
  appearanceScore: MetricScoreResult;
}

export interface UserLanguageInput {
  languageCode: string;
  level: LanguageLevel;
}

export type FaceRating = 'MODEL_LEVEL' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE';

export interface DiagnosisInputV3 {
  nickname?: string | null;
  gender: Gender;
  age: number;
  prefectureId: number;
  prefectureName: string;
  height: number;
  weight: number;
  bodyFat?: number | null;
  faceRating?: FaceRating | null;
  annualIncome: number;
  financialAssets?: number | null;
  realEstateAssets?: number | null;
  carAssets?: number | null;
  watchAssets?: number | null;
  otherAssets?: number | null;
  mortgageDebt?: number | null;
  carDebt?: number | null;
  scholarshipDebt?: number | null;
  otherDebt?: number | null;
  academicDegree?: ('MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'VOCATIONAL' | 'JUNIOR_COLLEGE' | 'BACHELOR' | 'MASTER' | 'DOCTOR') | null;
  universityName?: string | null;
  customUniversityHensachi?: number | null;
  iqScore?: number | null;
  industryCode?: string | null;
  occupationCode: string;
  employmentType: string;
  positionCode?: string | null;
  companyName?: string | null;
  companyCategory?: 'LARGE_PRIME' | 'LARGE' | 'MEDIUM' | 'SMALL' | 'OTHER' | null;
  languages?: UserLanguageInput[];
  travelCount?: number | null;
  maritalStatus?: MaritalStatus | null;
  childrenCount?: number | null;
  mbti?: string | null;
  instagramFollowers?: number | null;
  xFollowers?: number | null;
  tikTokFollowers?: number | null;
  youTubeFollowers?: number | null;
  faceImageUrl?: string | null;
}

export type DiagnosisInput = DiagnosisInputV3;

export interface EpithetResult {
  title: string;
  subtitle: string;
  rarityBadge: string;
  rarityColor: string;
}

export interface OverallDiagnosisResultV3 {
  diagnosisId: string;
  createdAt: string;
  inputSummary: {
    nickname?: string;
    gender: Gender;
    age: number;
    prefectureName: string;
  };
  japanOverallScore: number;
  loveOverallScore: number;
  epithet?: EpithetResult;
  loveEpithet?: EpithetResult;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    academic: number;
    social: number;
    ability: number;
  };
  loveCategoryScores: {
    age: number;
    face: number;
    body: number;
    income: number;
    career: number;
    family: number;
  };
  metrics: MetricScoreResult[];
  missingMetrics: {
    metricCode: string;
    reason: string;
    status: 'DATASET_IMPORT_WAITING' | 'OPTIONAL_NOT_ENTERED';
  }[];
  appliedWeights: Record<string, number>;
  shareToken: string;
  rawInput?: DiagnosisInputV3;
}

export type OverallDiagnosisResult = OverallDiagnosisResultV3;

export interface PublicShareResult {
  shareToken: string;
  createdAt: string;
  gender: Gender;
  age: number;
  prefectureName: string;
  japanOverallScore: number;
  loveOverallScore: number;
  epithet?: EpithetResult;
  loveEpithet?: EpithetResult;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    academic: number;
    social: number;
    ability: number;
  };
  loveCategoryScores: OverallDiagnosisResultV3['loveCategoryScores'];
  metricSummary: {
    metricCode: string;
    metricName: string;
    score: number;
    topPercent: number | null;
    hasOfficialTopPercent: boolean;
    dataQuality: DataQuality;
    surveyYear: number;
    datasetName: string;
  }[];
}
