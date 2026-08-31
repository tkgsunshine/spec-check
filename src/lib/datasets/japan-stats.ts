import { Gender } from '@/types/spec-check';

export interface BodyStatGroup {
  ageMin: number;
  ageMax: number;
  heightMean: number;
  heightSd: number;
  weightMean: number;
  weightSd: number;
  bmiMean: number;
  bmiSd: number;
}

export const HEIGHT_WEIGHT_STATS: Record<Gender | 'OTHER', BodyStatGroup[]> = {
  MALE: [
    { ageMin: 20, ageMax: 29, heightMean: 171.5, heightSd: 5.6, weightMean: 67.6, weightSd: 11.8, bmiMean: 22.9, bmiSd: 3.7 },
    { ageMin: 30, ageMax: 39, heightMean: 171.8, heightSd: 5.8, weightMean: 70.2, weightSd: 12.3, bmiMean: 23.8, bmiSd: 3.9 },
    { ageMin: 40, ageMax: 49, heightMean: 171.5, heightSd: 5.7, weightMean: 71.5, weightSd: 12.1, bmiMean: 24.3, bmiSd: 3.8 },
    { ageMin: 50, ageMax: 59, heightMean: 169.9, heightSd: 5.9, weightMean: 70.1, weightSd: 11.5, bmiMean: 24.3, bmiSd: 3.7 },
    { ageMin: 60, ageMax: 69, heightMean: 167.3, heightSd: 5.9, weightMean: 66.8, weightSd: 10.2, bmiMean: 23.9, bmiSd: 3.4 },
  ],
  FEMALE: [
    { ageMin: 20, ageMax: 29, heightMean: 157.8, heightSd: 5.4, weightMean: 52.3, weightSd: 8.9, bmiMean: 21.0, bmiSd: 3.3 },
    { ageMin: 30, ageMax: 39, heightMean: 158.4, heightSd: 5.3, weightMean: 53.8, weightSd: 9.5, bmiMean: 21.4, bmiSd: 3.6 },
    { ageMin: 40, ageMax: 49, heightMean: 158.0, heightSd: 5.3, weightMean: 55.4, weightSd: 9.8, bmiMean: 22.2, bmiSd: 3.7 },
    { ageMin: 50, ageMax: 59, heightMean: 156.8, heightSd: 5.4, weightMean: 55.1, weightSd: 9.2, bmiMean: 22.4, bmiSd: 3.5 },
    { ageMin: 60, ageMax: 69, heightMean: 153.9, heightSd: 5.4, weightMean: 53.6, weightSd: 8.6, bmiMean: 22.6, bmiSd: 3.4 },
  ],
  OTHER: [
    { ageMin: 20, ageMax: 29, heightMean: 164.6, heightSd: 5.5, weightMean: 60.0, weightSd: 10.0, bmiMean: 22.0, bmiSd: 3.5 },
    { ageMin: 30, ageMax: 69, heightMean: 165.0, heightSd: 5.5, weightMean: 62.0, weightSd: 10.0, bmiMean: 22.5, bmiSd: 3.5 },
  ]
};

export interface IncomeBracket {
  limitMax: number;
  label: string;
  maleCumulativeBelow: number;
  femaleCumulativeBelow: number;
  overallCumulativeBelow: number;
}

export const INCOME_BRACKETS: IncomeBracket[] = [
  { limitMax: 100, label: '100万円以下', maleCumulativeBelow: 4.8, femaleCumulativeBelow: 21.5, overallCumulativeBelow: 11.9 },
  { limitMax: 200, label: '100万円超 200万円以下', maleCumulativeBelow: 11.3, femaleCumulativeBelow: 44.9, overallCumulativeBelow: 25.6 },
  { limitMax: 300, label: '200万円超 300万円以下', maleCumulativeBelow: 21.6, femaleCumulativeBelow: 64.7, overallCumulativeBelow: 40.0 },
  { limitMax: 400, label: '300万円超 400万円以下', maleCumulativeBelow: 37.8, femaleCumulativeBelow: 79.8, overallCumulativeBelow: 55.7 },
  { limitMax: 500, label: '400万円超 500万円以下', maleCumulativeBelow: 55.3, femaleCumulativeBelow: 88.6, overallCumulativeBelow: 69.5 },
  { limitMax: 600, label: '500万円超 600万円以下', maleCumulativeBelow: 68.7, femaleCumulativeBelow: 93.1, overallCumulativeBelow: 79.1 },
  { limitMax: 700, label: '600万円超 700万円以下', maleCumulativeBelow: 77.7, femaleCumulativeBelow: 95.5, overallCumulativeBelow: 85.3 },
  { limitMax: 800, label: '700万円超 800万円以下', maleCumulativeBelow: 83.8, femaleCumulativeBelow: 96.9, overallCumulativeBelow: 89.4 },
  { limitMax: 900, label: '800万円超 900万円以下', maleCumulativeBelow: 88.0, femaleCumulativeBelow: 97.8, overallCumulativeBelow: 92.2 },
  { limitMax: 1000, label: '900万円超 1000万円以下', maleCumulativeBelow: 91.1, femaleCumulativeBelow: 98.4, overallCumulativeBelow: 94.2 },
  { limitMax: 1500, label: '1000万円超 1500万円以下', maleCumulativeBelow: 96.7, femaleCumulativeBelow: 99.5, overallCumulativeBelow: 97.9 },
  { limitMax: 2000, label: '1500万円超 2000万円以下', maleCumulativeBelow: 98.5, femaleCumulativeBelow: 99.8, overallCumulativeBelow: 99.0 },
  { limitMax: Infinity, label: '2000万円超', maleCumulativeBelow: 100.0, femaleCumulativeBelow: 100.0, overallCumulativeBelow: 100.0 },
];

export interface NetWorthBracket {
  limitMax: number;
  cumulativePercent: number;
}

export const NET_WORTH_BRACKETS: NetWorthBracket[] = [
  { limitMax: 0, cumulativePercent: 12.5 },
  { limitMax: 100, cumulativePercent: 24.0 },
  { limitMax: 300, cumulativePercent: 38.5 },
  { limitMax: 500, cumulativePercent: 49.0 },
  { limitMax: 1000, cumulativePercent: 64.5 },
  { limitMax: 2000, cumulativePercent: 81.0 },
  { limitMax: 3000, cumulativePercent: 88.5 },
  { limitMax: 5000, cumulativePercent: 94.2 },
  { limitMax: 10000, cumulativePercent: 97.8 },
  { limitMax: 50000, cumulativePercent: 99.5 },
  { limitMax: Infinity, cumulativePercent: 100.0 },
];

export interface SnsFollowerBracketItem {
  value: number;
  label: string;
}

export const SNS_FOLLOWER_BRACKETS: SnsFollowerBracketItem[] = [
  { value: 0, label: '0人 (アカウントなし/未運用)' },
  { value: 300, label: '〜 300人' },
  { value: 1000, label: '301人 〜 1,000人' },
  { value: 3000, label: '1,001人 〜 3,000人' },
  { value: 10000, label: '3,001人 〜 10,000人' },
  { value: 50000, label: '10,001人 〜 50,000人' },
  { value: 100000, label: '50,001人 〜 100,000人' },
  { value: 500000, label: '100,001人以上' },
];

export const COMPANY_CATEGORY_SCORES: Record<string, { label: string; score: number }> = {
  LARGE_PRIME: { label: 'プライム上場・大手グローバル企業', score: 95 },
  LARGE: { label: '大手企業・上場企業', score: 85 },
  MEDIUM: { label: '中堅企業・メガベンチャー', score: 72 },
  SMALL: { label: '中小企業・スタートアップ', score: 60 },
  OTHER: { label: 'その他・個人事業所', score: 50 },
};

export interface PositionMasterItem {
  code: string;
  name: string;
  bonusScore: number;
}

export const POSITION_MASTER_BY_EMPLOYMENT: Record<string, PositionMasterItem[]> = {
  EXECUTIVE: [
    { code: 'CEO', name: '代表取締役・最高経営責任者 (CEO)', bonusScore: 18 },
    { code: 'BOARD', name: '取締役・役員', bonusScore: 14 },
  ],
  REGULAR: [
    { code: 'EXEC_OFFICER', name: '執行役員・CXO', bonusScore: 12 },
    { code: 'GENERAL_MANAGER', name: '本部長・事業部長', bonusScore: 10 },
    { code: 'DIRECTOR', name: '部長', bonusScore: 8 },
    { code: 'MANAGER', name: '課長・マネージャー', bonusScore: 6 },
    { code: 'CHIEF', name: '主任・係長・チームリーダー', bonusScore: 3 },
    { code: 'STAFF', name: '一般社員・メンバー', bonusScore: 0 },
  ],
  CONTRACT: [
    { code: 'CONTRACT_STAFF', name: '契約社員', bonusScore: 0 },
    { code: 'DISPATCH', name: '派遣社員', bonusScore: 0 },
    { code: 'PART_TIME', name: 'パート・アルバイト', bonusScore: -2 },
  ],
  FREELANCE: [],
  UNEMPLOYED: [
    { code: 'UNEMPLOYED_STAFF', name: '無職・求職中・家事従事・学生', bonusScore: -15 },
  ],
};

export const POSITION_MASTER: PositionMasterItem[] = [
  ...POSITION_MASTER_BY_EMPLOYMENT.EXECUTIVE,
  ...POSITION_MASTER_BY_EMPLOYMENT.REGULAR,
  ...POSITION_MASTER_BY_EMPLOYMENT.CONTRACT,
  ...POSITION_MASTER_BY_EMPLOYMENT.FREELANCE,
  ...POSITION_MASTER_BY_EMPLOYMENT.UNEMPLOYED,
];

export interface MbtiMasterItem {
  code: string;
  nameJa: string;
  category: '分析家' | '外交官' | '番人' | '探検家';
}

export const MBTI_MASTER: MbtiMasterItem[] = [
  { code: 'INTJ', nameJa: 'INTJ (建築家)', category: '分析家' },
  { code: 'INTP', nameJa: 'INTP (論理学者)', category: '分析家' },
  { code: 'ENTJ', nameJa: 'ENTJ (指揮官)', category: '分析家' },
  { code: 'ENTP', nameJa: 'ENTP (討論者)', category: '分析家' },
  { code: 'INFJ', nameJa: 'INFJ (提唱者)', category: '外交官' },
  { code: 'INFP', nameJa: 'INFP (仲介者)', category: '外交官' },
  { code: 'ENFJ', nameJa: 'ENFJ (主人公)', category: '外交官' },
  { code: 'ENFP', nameJa: 'ENFP (運動家)', category: '外交官' },
  { code: 'ISTJ', nameJa: 'ISTJ (管理者)', category: '番人' },
  { code: 'ISFJ', nameJa: 'ISFJ (擁護者)', category: '番人' },
  { code: 'ESTJ', nameJa: 'ESTJ (幹部)', category: '番人' },
  { code: 'ESFJ', nameJa: 'ESFJ (領事)', category: '番人' },
  { code: 'ISTP', nameJa: 'ISTP (巨匠)', category: '探検家' },
  { code: 'ISFP', nameJa: 'ISFP (冒険家)', category: '探検家' },
  { code: 'ESTP', nameJa: 'ESTP (起業家)', category: '探検家' },
  { code: 'ESFP', nameJa: 'ESFP (エンターテイナー)', category: '探検家' },
];

export interface IndustryMasterItem {
  id: string;
  name: string;
}

export const INDUSTRY_MASTER: IndustryMasterItem[] = [
  { id: '01', name: 'IT・インターネット・通信' },
  { id: '02', name: 'メーカー・製造業' },
  { id: '03', name: '建設・不動産' },
  { id: '04', name: '商社・卸売' },
  { id: '05', name: '小売・EC' },
  { id: '06', name: '金融・保険' },
  { id: '07', name: '広告・メディア・出版' },
  { id: '08', name: '人材・HR' },
  { id: '09', name: 'コンサルティング' },
  { id: '10', name: '物流・運輸' },
  { id: '11', name: '飲食・外食' },
  { id: '12', name: 'ホテル・旅行・レジャー' },
  { id: '13', name: '医療' },
  { id: '14', name: '介護・福祉' },
  { id: '15', name: '教育' },
  { id: '16', name: '士業・専門サービス' },
  { id: '17', name: '官公庁・公社・団体' },
  { id: '18', name: '農林水産' },
  { id: '19', name: 'エンターテインメント・ゲーム' },
  { id: '20', name: '美容・生活サービス' },
  { id: '21', name: 'エネルギー・インフラ' },
  { id: '22', name: 'その他' },
];

export interface CommonOccupationItem {
  id: string;
  name: string;
  baseScore: number;
}

export const COMMON_OCCUPATION_MASTER: CommonOccupationItem[] = [
  { id: '01', name: '経営・経営企画', baseScore: 88 },
  { id: '02', name: '事業企画・事業開発', baseScore: 85 },
  { id: '03', name: '営業', baseScore: 70 },
  { id: '04', name: '営業企画・営業推進', baseScore: 75 },
  { id: '05', name: 'マーケティング', baseScore: 78 },
  { id: '06', name: '広報・PR', baseScore: 72 },
  { id: '07', name: '人事', baseScore: 72 },
  { id: '08', name: '総務', baseScore: 65 },
  { id: '09', name: '法務・コンプライアンス', baseScore: 82 },
  { id: '10', name: '経理・財務', baseScore: 75 },
  { id: '11', name: '経営管理・FP&A', baseScore: 82 },
  { id: '12', name: '購買・調達', baseScore: 70 },
  { id: '13', name: '物流・SCM', baseScore: 68 },
  { id: '14', name: '一般事務・営業事務', baseScore: 55 },
  { id: '15', name: 'カスタマーサクセス', baseScore: 72 },
  { id: '16', name: 'カスタマーサポート', baseScore: 60 },
  { id: '17', name: 'コンサルタント', baseScore: 88 },
  { id: '18', name: 'エンジニア', baseScore: 82 },
  { id: '19', name: 'IT・システム', baseScore: 78 },
  { id: '20', name: 'データ・AI', baseScore: 90 },
  { id: '21', name: '研究開発', baseScore: 85 },
  { id: '22', name: '技術・設計', baseScore: 80 },
  { id: '23', name: '生産・製造', baseScore: 65 },
  { id: '24', name: '品質管理・品質保証', baseScore: 72 },
  { id: '25', name: '施工管理', baseScore: 78 },
  { id: '26', name: '専門職', baseScore: 85 },
  { id: '27', name: '医療', baseScore: 92 },
  { id: '28', name: '介護・福祉', baseScore: 62 },
  { id: '29', name: '教育・講師', baseScore: 70 },
  { id: '30', name: '店舗・サービス', baseScore: 58 },
  { id: '31', name: 'クリエイティブ・デザイン', baseScore: 75 },
  { id: '32', name: '編集・ライター', baseScore: 68 },
  { id: '33', name: 'ゲーム・エンタメ', baseScore: 78 },
  { id: '34', name: '研究・アナリスト', baseScore: 85 },
  { id: '35', name: '保守・メンテナンス', baseScore: 62 },
  { id: '36', name: 'オペレーション・運用', baseScore: 65 },
  { id: '37', name: 'その他', baseScore: 50 },
];

export const INDUSTRY_OCCUPATION_MAP: Record<string, string[]> = {
  '01': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '14', '15', '16', '17', '18', '19', '20', '21', '31', '32', '34', '36', '37'],
  '02': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '21', '22', '23', '24', '18', '19', '20', '31', '35', '36', '37'],
  '03': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '14', '17', '22', '25', '26', '19', '35', '36', '37'],
  '04': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '16', '17', '19', '36', '37'],
  '05': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '12', '13', '14', '15', '16', '19', '20', '30', '31', '36', '37'],
  '06': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '14', '16', '17', '18', '19', '20', '26', '34', '36', '37'],
  '07': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '14', '16', '31', '32', '33', '34', '36', '37'],
  '08': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '14', '15', '16', '17', '19', '20', '29', '36', '37'],
  '09': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '14', '17', '18', '19', '20', '34', '37'],
  '10': ['01', '02', '03', '04', '05', '07', '08', '09', '10', '12', '13', '14', '16', '19', '22', '35', '36', '37'],
  '11': ['01', '02', '03', '05', '06', '07', '08', '10', '12', '13', '14', '16', '30', '31', '36', '37'],
  '12': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '12', '14', '16', '30', '31', '36', '37'],
  '13': ['01', '02', '03', '05', '06', '07', '08', '09', '10', '12', '14', '16', '27', '21', '19', '26', '35', '36', '37'],
  '14': ['01', '02', '03', '05', '06', '07', '08', '09', '10', '12', '14', '16', '27', '28', '29', '19', '26', '36', '37'],
  '15': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '14', '15', '16', '17', '19', '20', '29', '31', '32', '36', '37'],
  '16': ['01', '02', '03', '05', '06', '07', '08', '09', '10', '14', '15', '16', '17', '19', '26', '34', '37'],
  '17': ['01', '02', '03', '06', '07', '08', '09', '10', '14', '17', '19', '20', '21', '22', '26', '29', '36', '37'],
  '18': ['01', '02', '03', '05', '07', '08', '10', '12', '13', '14', '21', '22', '23', '24', '35', '36', '37'],
  '19': ['01', '02', '03', '05', '06', '07', '08', '09', '10', '14', '16', '18', '19', '31', '32', '33', '36', '37'],
  '20': ['01', '02', '03', '05', '06', '07', '08', '10', '12', '14', '16', '30', '31', '35', '36', '37'],
  '21': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '21', '22', '23', '24', '25', '18', '19', '35', '36', '37'],
  '22': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37'],
};

export function getOccupationsByIndustryId(industryId: string): CommonOccupationItem[] {
  const occupationIds = INDUSTRY_OCCUPATION_MAP[industryId] || INDUSTRY_OCCUPATION_MAP['22'];
  return occupationIds
    .map(id => COMMON_OCCUPATION_MASTER.find(occ => occ.id === id))
    .filter((occ): occ is CommonOccupationItem => occ !== undefined);
}

export const COUNTRY_MASTER = [
  { code: 'US', nameJa: 'アメリカ' },
  { code: 'GB', nameJa: 'イギリス' },
  { code: 'CN', nameJa: '中国' },
  { code: 'KR', nameJa: '韓国' },
  { code: 'FR', nameJa: 'フランス' },
  { code: 'DE', nameJa: 'ドイツ' },
  { code: 'IT', nameJa: 'イタリア' },
  { code: 'CA', nameJa: 'カナダ' },
  { code: 'AU', nameJa: 'オーストラリア' },
  { code: 'TH', nameJa: 'タイ' },
  { code: 'SG', nameJa: 'シンガポール' },
  { code: 'TW', nameJa: '台湾' },
  { code: 'HK', nameJa: '香港' },
  { code: 'VN', nameJa: 'ベトナム' },
  { code: 'PH', nameJa: 'フィリピン' },
  { code: 'ID', nameJa: 'インドネシア' },
  { code: 'MY', nameJa: 'マレーシア' },
  { code: 'OTHER', nameJa: 'その他諸国・地域' },
];

export interface UniversityMasterItem {
  id: string;
  name: string;
  aliases: string[];
  location: string;
  establishmentType: 'NATIONAL' | 'PUBLIC' | 'PRIVATE';
  isMedicalSchool?: boolean;
  hensachi: number;
  totalScore: number;
}

export const INITIAL_UNIVERSITIES: UniversityMasterItem[] = [
  // 🩺【医学部・最高峰 (別格)】
  { id: 'med_ut', name: '東京大学 医学部 (理科三類)', aliases: ['東大医学部', '東大理三', '理三', 'UTokyo Med'], location: '東京都', establishmentType: 'NATIONAL', isMedicalSchool: true, hensachi: 78.0, totalScore: 100.0 },
  { id: 'med_ku', name: '京都大学 医学部 (医学科)', aliases: ['京大医学部', '京大医'], location: '京都府', establishmentType: 'NATIONAL', isMedicalSchool: true, hensachi: 76.5, totalScore: 100.0 },
  { id: 'med_keio', name: '慶應義塾大学 医学部', aliases: ['慶應医学部', '慶大医学部', '慶医'], location: '東京都', establishmentType: 'PRIVATE', isMedicalSchool: true, hensachi: 74.0, totalScore: 97.5 },
  { id: 'med_handai', name: '大阪大学 医学部', aliases: ['阪大医学部', '阪大医'], location: '大阪府', establishmentType: 'NATIONAL', isMedicalSchool: true, hensachi: 74.0, totalScore: 97.5 },
  { id: 'med_tmdu', name: '東京医科歯科大学 医学部', aliases: ['医科歯科大医学部', 'TMDU Med'], location: '東京都', establishmentType: 'NATIONAL', isMedicalSchool: true, hensachi: 73.5, totalScore: 96.3 },
  { id: 'med_juntendo', name: '順天堂大学 医学部', aliases: ['順天堂医学部'], location: '東京都', establishmentType: 'PRIVATE', isMedicalSchool: true, hensachi: 71.0, totalScore: 90.0 },
  { id: 'med_nms', name: '日本医科大学', aliases: ['日医大', '日本医大'], location: '東京都', establishmentType: 'PRIVATE', isMedicalSchool: true, hensachi: 70.5, totalScore: 88.8 },
  { id: 'med_jichi', name: '自治医科大学', aliases: ['自治医大'], location: '栃木県', establishmentType: 'PRIVATE', isMedicalSchool: true, hensachi: 70.0, totalScore: 87.5 },
  { id: 'med_national_general', name: '地方国公立大学 医学部', aliases: ['国公立医学部', '地方国立医学部'], location: '全国', establishmentType: 'NATIONAL', isMedicalSchool: true, hensachi: 71.5, totalScore: 91.3 },
  { id: 'med_private_general', name: '私立大学 医学部', aliases: ['私立医学部', '私大医学部'], location: '全国', establishmentType: 'PRIVATE', isMedicalSchool: true, hensachi: 68.5, totalScore: 83.8 },

  // 🏛【旧帝大・最難関国立・難関公立】
  { id: 'u1', name: '東京大学', aliases: ['東大', '東京大学大学院', '東大大学院', 'The University of Tokyo', 'UTokyo'], location: '東京都', establishmentType: 'NATIONAL', hensachi: 75.0, totalScore: 100.0 },
  { id: 'u2', name: '京都大学', aliases: ['京大', '京都大学大学院', '京大大学院', 'Kyoto University'], location: '京都府', establishmentType: 'NATIONAL', hensachi: 74.0, totalScore: 97.5 },
  { id: 'u3', name: '一橋大学', aliases: ['一橋', '一橋大', '一橋大学大学院', 'Hitotsubashi University'], location: '東京都', establishmentType: 'NATIONAL', hensachi: 72.0, totalScore: 92.5 },
  { id: 'u4', name: '東京工業大学 (東京科学大学)', aliases: ['東工大', '東京科学大', '東京工業大学大学院', 'Science Tokyo'], location: '東京都', establishmentType: 'NATIONAL', hensachi: 72.0, totalScore: 92.5 },
  { id: 'u5', name: '大阪大学', aliases: ['阪大', '大阪大学大学院', 'Osaka University'], location: '大阪府', establishmentType: 'NATIONAL', hensachi: 70.0, totalScore: 87.5 },
  { id: 'u6', name: '東北大学', aliases: ['東北大', '東北大学大学院', 'Tohoku University'], location: '宮城県', establishmentType: 'NATIONAL', hensachi: 68.0, totalScore: 82.5 },
  { id: 'u7', name: '名古屋大学', aliases: ['名大', '名古屋大学大学院', 'Nagoya University'], location: '愛知県', establishmentType: 'NATIONAL', hensachi: 68.0, totalScore: 82.5 },
  { id: 'u8', name: '九州大学', aliases: ['九大', '九州大学大学院', 'Kyushu University'], location: '福岡県', establishmentType: 'NATIONAL', hensachi: 67.0, totalScore: 80.0 },
  { id: 'u9', name: '北海道大学', aliases: ['北大', '北海道大学大学院', 'Hokkaido University'], location: '北海道', establishmentType: 'NATIONAL', hensachi: 67.0, totalScore: 80.0 },
  { id: 'u10', name: '筑波大学', aliases: ['筑波大', '筑波大学大学院', 'University of Tsukuba'], location: '茨城県', establishmentType: 'NATIONAL', hensachi: 66.0, totalScore: 77.5 },
  { id: 'u11', name: '神戸大学', aliases: ['神大', '神戸大', '神戸大学大学院', 'Kobe University'], location: '兵庫県', establishmentType: 'NATIONAL', hensachi: 66.5, totalScore: 78.8 },
  { id: 'u12', name: '横浜国立大学', aliases: ['横国', '横国大', '横浜国立大学大学院', 'YNU'], location: '神奈川県', establishmentType: 'NATIONAL', hensachi: 65.5, totalScore: 76.3 },
  { id: 'u13', name: '千葉大学', aliases: ['千葉大', '千葉大学大学院', 'Chiba University'], location: '千葉県', establishmentType: 'NATIONAL', hensachi: 65.0, totalScore: 75.0 },
  { id: 'u14', name: '広島大学', aliases: ['広大', '広島大', '広島大学大学院'], location: '広島県', establishmentType: 'NATIONAL', hensachi: 62.5, totalScore: 68.8 },
  { id: 'u15', name: '岡山大学', aliases: ['岡大', '岡山大'], location: '岡山県', establishmentType: 'NATIONAL', hensachi: 62.0, totalScore: 67.5 },
  { id: 'u16', name: '金沢大学', aliases: ['金大', '金沢大'], location: '石川県', establishmentType: 'NATIONAL', hensachi: 61.5, totalScore: 66.3 },

  // 私立・難関大
  { id: 'u20', name: '早稲田大学', aliases: ['早稲田', '早大', 'Waseda University'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 71.5, totalScore: 91.3 },
  { id: 'u21', name: '慶應義塾大学', aliases: ['慶應', '慶大', 'Keio University'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 71.5, totalScore: 91.3 },
  { id: 'u22', name: '上智大学', aliases: ['上智', 'Sophia University'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 68.0, totalScore: 82.5 },
  { id: 'u23', name: '東京理科大学', aliases: ['理科大', '東京理科大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 67.5, totalScore: 81.3 },
  { id: 'u24', name: '明治大学', aliases: ['明治', '明大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 65.0, totalScore: 75.0 },
  { id: 'u25', name: '青山学院大学', aliases: ['青学', '青学大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 65.5, totalScore: 76.3 },
  { id: 'u26', name: '立教大学', aliases: ['立教', '立大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 65.0, totalScore: 75.0 },
  { id: 'u27', name: '中央大学', aliases: ['中央', '中大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 64.0, totalScore: 72.5 },
  { id: 'u28', name: '法政大学', aliases: ['法政', '法大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 63.0, totalScore: 70.0 },
  { id: 'u29', name: '同志社大学', aliases: ['同志社'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 65.0, totalScore: 75.0 },
  { id: 'u30', name: '立命館大学', aliases: ['立命館', '立命'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 62.5, totalScore: 68.8 },
  { id: 'u31', name: '関西学院大学', aliases: ['関学', '関学大'], location: '兵庫県', establishmentType: 'PRIVATE', hensachi: 64.0, totalScore: 72.5 },
  { id: 'u32', name: '関西大学', aliases: ['関大', '関西大'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 62.5, totalScore: 68.8 },

  // 中堅・地域私立・大東亜帝国・摂神追桃
  { id: 'u40', name: '日本大学', aliases: ['日大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 56.0, totalScore: 52.5 },
  { id: 'u41', name: '東洋大学', aliases: ['東洋大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 57.0, totalScore: 55.0 },
  { id: 'u42', name: '駒澤大学', aliases: ['駒大', '駒沢'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 55.0, totalScore: 50.0 },
  { id: 'u43', name: '専修大学', aliases: ['専大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 55.5, totalScore: 51.3 },
  { id: 'u44', name: '近畿大学', aliases: ['近大'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 57.5, totalScore: 56.3 },
  { id: 'u_osaka_econ', name: '大阪経済大学', aliases: ['大経大', '阪経', '大経', '大阪経済大', 'OUE'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 52.5, totalScore: 47.5 },
  { id: 'u_setsunan', name: '摂南大学', aliases: ['摂南', '摂南大', 'Setsunan'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 50.0, totalScore: 42.5 },
  { id: 'u_kobe_gakuin', name: '神戸学院大学', aliases: ['神学院', '神戸学院大'], location: '兵庫県', establishmentType: 'PRIVATE', hensachi: 49.0, totalScore: 40.0 },
  { id: 'u_otemon', name: '追手門学院大学', aliases: ['追手門', '追手門大', 'Otemon'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 49.5, totalScore: 41.3 },
  { id: 'u_momoyama', name: '桃山学院大学', aliases: ['桃山', '桃山大', 'ピン大'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 48.5, totalScore: 38.8 },
  { id: 'u_osaka_shogyo', name: '大阪商業大学', aliases: ['大商大', '大商'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 47.5, totalScore: 37.5 },
  { id: 'u_osaka_kogyo', name: '大阪工業大学', aliases: ['大工大', 'OIT'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 52.5, totalScore: 47.5 },
  { id: 'u_kyoto_sangyo', name: '京都産業大学', aliases: ['京産大', '京産', 'KSU'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 56.0, totalScore: 53.8 },
  { id: 'u_ryukoku', name: '龍谷大学', aliases: ['龍大', '龍谷'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 56.5, totalScore: 55.0 },
  { id: 'u_bukkyo', name: '佛教大学', aliases: ['仏教大', '佛大', '仏大'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 51.0, totalScore: 45.0 },
  { id: 'u_kansai_gaidai', name: '関西外国語大学', aliases: ['関西外大', '外大'], location: '大阪府', establishmentType: 'PRIVATE', hensachi: 55.0, totalScore: 51.3 },
  { id: 'u_kyoto_gaidai', name: '京都外国語大学', aliases: ['京都外大'], location: '京都府', establishmentType: 'PRIVATE', hensachi: 51.0, totalScore: 45.0 },
  { id: 'u_daito', name: '大東文化大学', aliases: ['大東文化', '大東大', '大東'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 50.0, totalScore: 42.5 },
  { id: 'u_tokai', name: '東海大学', aliases: ['東海大', '東海'], location: '神奈川県', establishmentType: 'PRIVATE', hensachi: 51.0, totalScore: 45.0 },
  { id: 'u_asia', name: '亜細亜大学', aliases: ['亜細亜', '亜大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 48.0, totalScore: 38.0 },
  { id: 'u_teikyo', name: '帝京大学', aliases: ['帝京大', '帝京'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 50.0, totalScore: 42.5 },
  { id: 'u_kokushikan', name: '国士舘大学', aliases: ['国士舘', '国士大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 50.5, totalScore: 43.8 },
  { id: 'u_takushoku', name: '拓殖大学', aliases: ['拓大', '拓殖'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 48.0, totalScore: 38.0 },
  { id: 'u_kanto_gakuin', name: '関東学院大学', aliases: ['関東学院', '関東学院大'], location: '神奈川県', establishmentType: 'PRIVATE', hensachi: 47.0, totalScore: 36.3 },
  { id: 'u_rissho', name: '立正大学', aliases: ['立正大', '立正'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 51.0, totalScore: 45.0 },
  { id: 'u_shibaura', name: '芝浦工業大学', aliases: ['芝浦工大', '芝浦', 'SIT'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 58.5, totalScore: 60.0 },
  { id: 'u_tokyo_city', name: '東京都市大学', aliases: ['都市大', '武蔵工大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 56.0, totalScore: 53.8 },
  { id: 'u_tokyo_denki', name: '東京電機大学', aliases: ['電大', '電機大', 'TDU'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 54.0, totalScore: 50.0 },
  { id: 'u_seikei', name: '成蹊大学', aliases: ['成蹊大', '成蹊'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 59.0, totalScore: 61.3 },
  { id: 'u_seijo', name: '成城大学', aliases: ['成城大', '成城'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 58.0, totalScore: 58.8 },
  { id: 'u_meigaku', name: '明治学院大学', aliases: ['明学', '明学大', '明治学院'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 58.5, totalScore: 60.0 },
  { id: 'u_dokkyo', name: '獨協大学', aliases: ['獨協大', '独協'], location: '埼玉県', establishmentType: 'PRIVATE', hensachi: 55.0, totalScore: 51.3 },
  { id: 'u_kokugakuin', name: '國學院大學', aliases: ['國學院', '国学院大', '国学院'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 57.5, totalScore: 57.5 },
  { id: 'u_musashi', name: '武蔵大学', aliases: ['武蔵大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 58.0, totalScore: 58.8 },
  { id: 'u_tsuda', name: '津田塾大学', aliases: ['津田塾', '津田'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 59.0, totalScore: 61.3 },
  { id: 'u_gakushuin', name: '学習院大学', aliases: ['学習院', '学習院大'], location: '東京都', establishmentType: 'PRIVATE', hensachi: 61.5, totalScore: 66.3 },
  { id: 'u_osaka_metropolitan', name: '大阪公立大学', aliases: ['公立大', '大阪公大', '市大府大', 'OMU'], location: '大阪府', establishmentType: 'PUBLIC', hensachi: 65.0, totalScore: 75.0 },
  { id: 'u_tmu', name: '東京都立大学', aliases: ['都立大', '首都大', 'TMU'], location: '東京都', establishmentType: 'PUBLIC', hensachi: 64.5, totalScore: 73.8 },
  { id: 'u_nanzan', name: '南山大学', aliases: ['南山大', '南山'], location: '愛知県', establishmentType: 'PRIVATE', hensachi: 58.5, totalScore: 60.0 },
  { id: 'u_chukyo', name: '中京大学', aliases: ['中京大', '中京'], location: '愛知県', establishmentType: 'PRIVATE', hensachi: 56.5, totalScore: 55.0 },
  { id: 'u_meijo', name: '名城大学', aliases: ['名城大', '名城'], location: '愛知県', establishmentType: 'PRIVATE', hensachi: 55.0, totalScore: 51.3 },
  { id: 'u_seinan', name: '西南学院大学', aliases: ['西南', '西南大', '西南学院'], location: '福岡県', establishmentType: 'PRIVATE', hensachi: 57.0, totalScore: 55.0 },
  { id: 'u_fukuoka', name: '福岡大学', aliases: ['福大', '福岡大'], location: '福岡県', establishmentType: 'PRIVATE', hensachi: 53.0, totalScore: 48.8 },
  { id: 'u_hokkai', name: '北海学園大学', aliases: ['北海学園', '北海'], location: '北海道', establishmentType: 'PRIVATE', hensachi: 51.0, totalScore: 45.0 },
  { id: 'u_tohoku_gakuin', name: '東北学院大学', aliases: ['東北学院', '学院大'], location: '宮城県', establishmentType: 'PRIVATE', hensachi: 50.0, totalScore: 42.5 },

  // 一般大学デフォルト
  { id: 'u_general', name: '全国中堅私立・公立大学 (平均水準)', aliases: ['一般私大', '地方私大'], location: '全国', establishmentType: 'PRIVATE', hensachi: 50.0, totalScore: 37.5 },
];

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export const LANGUAGE_MASTER = [
  { code: 'JA', nameJa: '日本語', isNativeDefaultTarget: true },
  { code: 'EN', nameJa: '英語 (English)', isNativeDefaultTarget: false },
  { code: 'ZH', nameJa: '中国語 (中文)', isNativeDefaultTarget: false },
  { code: 'KO', nameJa: '韓国語 (한국어)', isNativeDefaultTarget: false },
  { code: 'ES', nameJa: 'スペイン語 (Español)', isNativeDefaultTarget: false },
  { code: 'FR', nameJa: 'フランス語 (Français)', isNativeDefaultTarget: false },
  { code: 'DE', nameJa: 'ドイツ語 (Deutsch)', isNativeDefaultTarget: false },
];
