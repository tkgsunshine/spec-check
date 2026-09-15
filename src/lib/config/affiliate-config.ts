/**
 * アフィリエイト案件設定マスター
 * 各ASP（A8.net、アクセストレード、afb、Felmat等）で発行された広告主URL・計測タグをここで一元管理します。
 * ※本番URLは各ASPと提携完了後に随時差し替え可能です。
 */

export interface AffiliateItem {
  id: string;
  category: 'LOVE_APP' | 'LOVE_AGENT' | 'CAREER' | 'LUXURY';
  name: string;
  badgeText: string;
  headline: string;
  description: string;
  targetCriteria: {
    genders?: ('MALE' | 'FEMALE')[];
    minAge?: number;
    maxAge?: number;
    minLoveScore?: number;
    maxLoveScore?: number;
    minAnnualIncome?: number;
    minEconomicScore?: number;
    maritalStatusWhiteList?: string[];
  };
  rewardTypeLabel: string; // ユーザー安心表示用「無料登録のみ」「無料相談」等
  ctaButtonText: string;
  affiliateUrl: string; // ASPの計測タグ付きアフィリエイトURL
  accentGradient: string;
  iconName: 'heart' | 'sparkles' | 'briefcase' | 'shield' | 'trending-up';
}

export const AFFILIATE_MASTER: AffiliateItem[] = [
  // 1. マッチングアプリ (Pairs)
  {
    id: 'pairs',
    category: 'LOVE_APP',
    name: 'Pairs (ペアーズ)',
    badgeText: '国内最大級・王道マッチング',
    headline: 'あなたの恋愛スペック（上位層）が最も活きる本命アプリ',
    description: '会員数2,000万人突破。同世代の真剣な恋活・婚活ユーザーが最も多く、スペックの一致率が極めて高いマッチングプラットフォームです。',
    targetCriteria: {
      minAge: 18,
      maxAge: 38,
      minLoveScore: 50,
    },
    rewardTypeLabel: '男女とも無料登録＆年齢確認からスタート可能',
    ctaButtonText: 'Pairs を無料で見てみる',
    affiliateUrl: 'https://pairs.lv/?utm_source=speccheck', // ASP提携URL
    accentGradient: 'from-cyan-500 to-blue-600',
    iconName: 'heart',
  },

  // 2. マッチングアプリ (with)
  {
    id: 'with',
    category: 'LOVE_APP',
    name: 'with (ウィズ)',
    badgeText: '相性・心理テスト×高マッチング',
    headline: 'MBTI・性格価値観が一致する運命のパートナーを発見',
    description: '心理学と統計学に基づく性格診断で内面の一致を重視。外見スペックと性格相性の両軸で高評価なマッチングが実現します。',
    targetCriteria: {
      minAge: 18,
      maxAge: 32,
      minLoveScore: 55,
    },
    rewardTypeLabel: '女性完全無料 / 男性無料診断＆登録可能',
    ctaButtonText: 'with で相性診断を試す',
    affiliateUrl: 'https://with.is/?utm_source=speccheck',
    accentGradient: 'from-pink-500 to-rose-600',
    iconName: 'sparkles',
  },

  // 3. ハイスペック審査制マッチング (東カレデート)
  {
    id: 'tokyo-calendar',
    category: 'LOVE_APP',
    name: '東カレデート',
    badgeText: 'アッパー層限定・審査制',
    headline: '高年収・ハイステータスなあなたに選ばれる最高峰の出会い',
    description: '厳しい入会審査を通過したハイスペック男女のみが参加。洗練された価値観を持つ相手との質の高い出会いが保証されます。',
    targetCriteria: {
      minAge: 24,
      minAnnualIncome: 800, // 年収800万円以上
      minLoveScore: 70,
    },
    rewardTypeLabel: '入会審査・会員登録無料',
    ctaButtonText: '東カレデートの審査を受ける',
    affiliateUrl: 'https://tokyo-calendar-date.jp/?utm_source=speccheck',
    accentGradient: 'from-amber-400 via-amber-500 to-yellow-600',
    iconName: 'trending-up',
  },

  // 4. 結婚相談所 (ゼクシィ縁結びエージェント)
  {
    id: 'zexy-agent',
    category: 'LOVE_AGENT',
    name: 'ゼクシィ縁結びエージェント',
    badgeText: 'オリコン顧客満足度No.1',
    headline: '1年以内の成婚へ。プロのマッチングコーディネーターが伴走',
    description: 'リクルート運営の安心感。マッチングアプリの気軽さと専任アドバイザーの手厚いサポートを両立した次世代の結婚相談所。',
    targetCriteria: {
      minAge: 26,
      maxAge: 49,
      maritalStatusWhiteList: ['SINGLE_FREE', 'SINGLE_DATING', 'DIVORCED', 'SINGLE'],
    },
    rewardTypeLabel: 'オンライン無料カウンセリング実施中',
    ctaButtonText: '無料カウンセリングを予約する',
    affiliateUrl: 'https://zexy-en-agent.net/?utm_source=speccheck',
    accentGradient: 'from-emerald-500 to-teal-600',
    iconName: 'shield',
  },

  // 5. ハイクラス転職 (ビズリーチ)
  {
    id: 'bizreach',
    category: 'CAREER',
    name: 'ビズリーチ (BIZREACH)',
    badgeText: '即戦力・ハイクラス転職スカウト',
    headline: 'あなたのキャリア偏差値に、国内外の優良企業から直接スカウト',
    description: '年収800万円以上のポジションが全体の1/3以上。職歴・学歴スペックを登録しておくだけで、一流企業やヘッドハンターから直接オファーが届きます。',
    targetCriteria: {
      minAge: 24,
      minEconomicScore: 65,
    },
    rewardTypeLabel: '無料会員登録・経歴書登録ですぐにスカウト受信',
    ctaButtonText: 'ビズリーチに無料登録する',
    affiliateUrl: 'https://www.bizreach.jp/?utm_source=speccheck',
    accentGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    iconName: 'briefcase',
  },

  // 6. 若手ハイクラススカウト (AMBI)
  {
    id: 'ambi',
    category: 'CAREER',
    name: 'AMBI (アンビ)',
    badgeText: '20代〜30代前半特化',
    headline: '市場価値の高い若手のためのスカウト転職プラットフォーム',
    description: '優良メガベンチャー・外資系・大手企業のポテンシャル・リーダー採用求人が多数。自身の市場評価をダイレクトに確認できます。',
    targetCriteria: {
      minAge: 20,
      maxAge: 35,
    },
    rewardTypeLabel: '無料会員登録でオファー機能が利用可能',
    ctaButtonText: 'AMBI で市場価値を測る',
    affiliateUrl: 'https://en-ambi.com/?utm_source=speccheck',
    accentGradient: 'from-purple-500 to-indigo-600',
    iconName: 'trending-up',
  },
];
