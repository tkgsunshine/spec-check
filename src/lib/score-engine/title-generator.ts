import { DiagnosisInputV3, EpithetResult, MetricScoreResult } from '@/types/spec-check';

/**
 * ユーザーのスペック診断結果に基づく「二つ名（称号・キャッチコピー）」動的生成エンジン (総合スペックモード)
 */
export function generateEpithetTitle(
  overallScore: number,
  input: DiagnosisInputV3,
  metrics: MetricScoreResult[]
): EpithetResult {
  // 各メトリクスのスコア抽出
  const incomeMetric = metrics.find(m => m.metricCode === 'INCOME' || m.metricCode === 'ANNUAL_INCOME');
  const assetMetric = metrics.find(m => m.metricCode === 'NET_WORTH');
  const academicMetric = metrics.find(m => m.metricCode === 'ACADEMIC_DEGREE' || m.metricCode === 'ACADEMIC_BACKGROUND');
  const companyMetric = metrics.find(m => m.metricCode === 'COMPANY' || m.metricCode === 'OCCUPATION');
  const iqMetric = metrics.find(m => m.metricCode === 'IQ_ESTIMATE');

  const incomeScore = incomeMetric ? incomeMetric.score : 0;
  const assetScore = assetMetric ? assetMetric.score : 0;
  const academicScore = academicMetric ? academicMetric.score : 0;
  const companyScore = companyMetric ? companyMetric.score : 0;
  const iqScore = iqMetric ? iqMetric.score : 0;

  const luxuryVal = input.luxuryAssets !== undefined && input.luxuryAssets !== null
    ? (input.luxuryAssets || 0)
    : ((input.carAssets || 0) + (input.watchAssets || 0));
  const totalAssets = (input.savingsAssets || 0) + (input.financialAssets || 0) + (input.realEstateAssets || 0) + luxuryVal;
  const totalDebts = (input.mortgageDebt || 0) + (input.carDebt || 0) + (input.scholarshipDebt || 0) + (input.otherDebt || 0);
  const netWorth = totalAssets - totalDebts;

  const languagesCount = input.languages ? input.languages.length : 1;
  const travelCount = input.travelCount || 0;
  const totalSnsFollowers = (input.instagramFollowers || 0) + (input.xFollowers || 0) + (input.tikTokFollowers || 0) + (input.youTubeFollowers || 0);
  const annualIncomeVal = Number(input.annualIncome) || 0;

  // 🏆 1. SS GOD TIER (総合スコア 85点以上)
  if (overallScore >= 85) {
    if (incomeScore >= 90 && assetScore >= 85) {
      return {
        title: '令和の資本主義モンスター',
        subtitle: `年収・純資産ともに全国上位水準。圧倒的な経済力で時代を牽引する絶対的富裕層`,
        rarityBadge: 'SS GOD TIER',
        rarityColor: 'from-amber-400 via-amber-200 to-yellow-500',
      };
    }
    if (academicScore >= 90 && (iqScore >= 85 || incomeScore >= 85)) {
      return {
        title: '天才的IQと財力を誇る現代の頭脳派チート',
        subtitle: `最高峰の学歴・IQと卓越したマーケット価値を併せ持つ至高の知性派エリート`,
        rarityBadge: 'SS GOD TIER',
        rarityColor: 'from-amber-400 via-yellow-200 to-amber-500',
      };
    }
    if (companyScore >= 90 || input.employmentType === 'EXECUTIVE') {
      return {
        title: '東証プライムを牽引する絶対的トップリーダー',
        subtitle: `超優良企業・経営組織の中核として圧倒的プレゼンスを放つ最高峰ビジネスリーダー`,
        rarityBadge: 'SS GOD TIER',
        rarityColor: 'from-amber-300 via-yellow-100 to-amber-400',
      };
    }
    return {
      title: '人類の上位1%に君臨する神スペック',
      subtitle: `全ステータスが高次元で結実。隙のない完璧なポテンシャルを誇る上位存在`,
      rarityBadge: 'SS GOD TIER',
      rarityColor: 'from-yellow-300 via-amber-200 to-amber-500',
    };
  }

  // 🥇 2. S ELITE TIER (総合スコア 75 〜 84点)
  if (overallScore >= 75) {
    if (totalSnsFollowers >= 10000) {
      return {
        title: '時代を動かすインフルエンス覇者',
        subtitle: `高いスペックと圧倒的発信力を兼ね備え、フォロワーを惹きつける現代のカリスマ`,
        rarityBadge: 'S ELITE',
        rarityColor: 'from-purple-400 via-fuchsia-300 to-pink-500',
      };
    }
    if (languagesCount >= 2 || travelCount >= 5) {
      return {
        title: '国境を溶かすグローバル・マルチリンガル',
        subtitle: `高度な語学力と豊富な渡航経験で、国籍を超えて世界で通用するグローバルプレイヤー`,
        rarityBadge: 'S ELITE',
        rarityColor: 'from-indigo-400 via-sky-300 to-blue-500',
      };
    }
    if (netWorth >= 3000 || assetScore >= 80) {
      return {
        title: '歩く高利回りアセット・マスター',
        subtitle: `堅実かつ強力な資産形成能力を誇り、揺るぎない財産を築き上げたマネーマスター`,
        rarityBadge: 'S ELITE',
        rarityColor: 'from-emerald-400 via-teal-300 to-green-500',
      };
    }
    if (academicScore >= 80 || companyScore >= 85) {
      return {
        title: '経済界を支える次世代ハイキャリア',
        subtitle: `名門学歴と高規格な職歴に支えられ、大企業の未来を担う正統派ハイキャリア`,
        rarityBadge: 'S ELITE',
        rarityColor: 'from-blue-400 via-indigo-300 to-violet-500',
      };
    }
    return {
      title: '全方位隙なしのスタイリッシュ・実力派',
      subtitle: `キャリア・身体・生活水準の全要素が高水準で調和した洗練の実力派`,
      rarityBadge: 'S ELITE',
      rarityColor: 'from-cyan-400 via-blue-300 to-indigo-500',
    };
  }

  // 🥈 3. A UPPER TIER (総合スコア 65 〜 74点)
  if (overallScore >= 65) {
    if (netWorth >= 1000 && totalDebts === 0) {
      return {
        title: '無傷の堅実型アセットビルダー',
        subtitle: `無駄な負債を一切抱えず、盤石なキャッシュフローと純資産を積み上げる知恵者`,
        rarityBadge: 'A UPPER',
        rarityColor: 'from-emerald-400 via-green-300 to-teal-500',
      };
    }
    if (iqScore >= 75 || academicScore >= 75) {
      return {
        title: '沈黙の隠れハイスペック',
        subtitle: `鋭い分析力と高いIQを秘め、表舞台で確実な成果を叩き出すインテリジェンス派`,
        rarityBadge: 'A UPPER',
        rarityColor: 'from-teal-400 via-cyan-300 to-blue-500',
      };
    }
    if (travelCount >= 3 || languagesCount >= 2) {
      return {
        title: '世界を視界に収めるアース・トラベラー',
        subtitle: `多様な文化と視野を自分の糧にし、柔軟な思考で人生を切り開く自由人`,
        rarityBadge: 'A UPPER',
        rarityColor: 'from-sky-400 via-indigo-300 to-purple-500',
      };
    }
    if (annualIncomeVal >= 600 && input.age <= 30) {
      return {
        title: '破竹の勢いで登り詰めるライジング・エース',
        subtitle: `若くして同世代平均を大きく凌駕する年収と実績を誇る若手のエース`,
        rarityBadge: 'A UPPER',
        rarityColor: 'from-amber-400 via-yellow-300 to-orange-400',
      };
    }
    return {
      title: '親しみやすさ全振りの信頼エリート',
      subtitle: `確かな実力と高い親和性を持ち、周囲からの信頼と愛される人間性を誇る実力者`,
      rarityBadge: 'A UPPER',
      rarityColor: 'from-violet-400 via-purple-300 to-indigo-500',
    };
  }

  // 🥉 4. B & GROWING TIER (総合スコア 65点未満・詳細パターン展開)
  if (input.age <= 24) {
    return {
      title: '覚醒を待つ未完のポテンシャル・ルーキー',
      subtitle: `若き情熱と無限の伸びしろを内に秘め、これからの跳躍が最も期待される新星`,
      rarityBadge: 'PROSPECT',
      rarityColor: 'from-rose-400 via-pink-300 to-purple-500',
    };
  }

  if (input.age <= 28) {
    return {
      title: '次世代を担うヤング・プレジデント候補',
      subtitle: `圧倒的なエネルギーと行動力を武器に、将来の成功に向けてひた走る若き精鋭`,
      rarityBadge: 'PROSPECT',
      rarityColor: 'from-indigo-400 via-purple-300 to-pink-400',
    };
  }

  if (netWorth >= 500) {
    return {
      title: '着実に芽吹くリッチ・パイオニア',
      subtitle: `自力で着実に試練を乗り越え、確かな足場と資産を形作りつつある成長株`,
      rarityBadge: 'GROWING',
      rarityColor: 'from-amber-400 via-orange-300 to-rose-500',
    };
  }

  if (totalDebts === 0) {
    return {
      title: '負債ゼロのクリーン＆スマート・サバイバー',
      subtitle: `無理な借入をせず身の丈に合った健全な経営・生活を維持するスマートな実質派`,
      rarityBadge: 'GROWING',
      rarityColor: 'from-emerald-400 via-teal-300 to-cyan-400',
    };
  }

  if (input.employmentType === 'SELF_EMPLOYED' || input.employmentType === 'FREELANCE') {
    return {
      title: '自由を切り開くインディペンデント・チャレンジャー',
      subtitle: `組織に縛られず自らの腕とスキルでマーケットを切り開く自立したチャレンジャー`,
      rarityBadge: 'CHALLENGER',
      rarityColor: 'from-cyan-400 via-sky-300 to-blue-400',
    };
  }

  if (input.employmentType === 'REGULAR') {
    return {
      title: '安定感バツグンのマイペース・プレイヤー',
      subtitle: `確実な職場環境と一定の基盤の上で、着実に自らの生活とスキルを充実させる安定派`,
      rarityBadge: 'GROWING',
      rarityColor: 'from-blue-400 via-indigo-300 to-slate-300',
    };
  }

  return {
    title: '可能性無限大の進化系イノベーター',
    subtitle: `独自の強みとポテンシャルを研ぎ澄まし、さらなる高みを目指して進化し続けるイノベーター`,
    rarityBadge: 'CHALLENGER',
    rarityColor: 'from-slate-400 via-indigo-300 to-slate-200',
  };
}

/**
 * ユーザーの恋愛スペック診断結果に基づく「恋愛二つ名（称号・キャッチコピー）」動的生成エンジン (恋愛モード)
 */
export function generateLoveEpithetTitle(
  loveScore: number,
  input: DiagnosisInputV3,
  metrics: MetricScoreResult[]
): EpithetResult {
  const isMale = input.gender !== 'FEMALE';
  const faceMetric = metrics.find(m => m.metricCode === 'APPEARANCE');
  const faceScore = faceMetric ? faceMetric.score : 50;
  const incomeMetric = metrics.find(m => m.metricCode === 'ANNUAL_INCOME');
  const incomeScore = incomeMetric ? incomeMetric.score : 50;
  const companyMetric = metrics.find(m => m.metricCode === 'COMPANY');
  const companyScore = companyMetric ? companyMetric.score : 50;
  const academicMetric = metrics.find(m => m.metricCode === 'ACADEMIC_BACKGROUND');
  const academicScore = academicMetric ? academicMetric.score : 50;
  const iqMetric = metrics.find(m => m.metricCode === 'IQ_ESTIMATE');
  const iqScore = iqMetric ? iqMetric.score : 50;

  const luxuryVal = input.luxuryAssets !== undefined && input.luxuryAssets !== null
    ? (input.luxuryAssets || 0)
    : ((input.carAssets || 0) + (input.watchAssets || 0));
  const totalAssets = (input.savingsAssets || 0) + (input.financialAssets || 0) + (input.realEstateAssets || 0) + luxuryVal;
  const totalDebts = (input.mortgageDebt || 0) + (input.carDebt || 0) + (input.scholarshipDebt || 0) + (input.otherDebt || 0);
  const heightVal = Number(input.height) || 0;

  // 💖 1. SS GOD TIER (恋愛スコア 85点以上)
  if (loveScore >= 85) {
    if (faceScore >= 80 && (incomeScore >= 75 || companyScore >= 75)) {
      return {
        title: isMale ? '港区を狂わせるパーフェクト・パートナー' : '街を彩るビジュアル・モテクイーン',
        subtitle: '圧倒的なビジュアルと洗練されたステータスを誇る、恋愛市場の最高峰ブランド',
        rarityBadge: 'SS LOVE GOD',
        rarityColor: 'from-rose-400 via-pink-200 to-amber-300',
      };
    }
    if (incomeScore >= 80) {
      return {
        title: isMale ? '包容力溢れるハイスペ本命彼氏' : '全方位から愛される憧れの理想パートナー',
        subtitle: '極めて高い経済力と生活水準を誇り、安心感と理想を兼ね備えた本命中の本命',
        rarityBadge: 'SS LOVE GOD',
        rarityColor: 'from-pink-400 via-rose-300 to-yellow-400',
      };
    }
    if (faceScore >= 85) {
      return {
        title: '一瞬で恋に落とすルックス・カリスマ',
        subtitle: '第一印象だけで周囲を魅了し、圧倒的な存在感と美意識で視線を独占するカリスマ',
        rarityBadge: 'SS LOVE GOD',
        rarityColor: 'from-fuchsia-400 via-rose-200 to-pink-500',
      };
    }
    return {
      title: isMale ? '令和の全方位モテキング' : '圧倒的美意識の全方位モテクイーン',
      subtitle: 'ルックス・キャリア・ステータスの全てが高次元で噛み合った絶対的アイコン',
      rarityBadge: 'SS LOVE GOD',
      rarityColor: 'from-fuchsia-400 via-rose-300 to-amber-400',
    };
  }

  // 🌸 2. S ELITE TIER (恋愛スコア 75 〜 84点)
  if (loveScore >= 75) {
    if (faceScore >= 75) {
      return {
        title: isMale ? '一目惚れを誘発するビジュアルスター' : '透明感溢れる恋のヒロイン',
        subtitle: '第一印象で相手を惹きつける強い視線と清潔感を持ち、一瞬で魅了する華やかさ',
        rarityBadge: 'S LOVE ELITE',
        rarityColor: 'from-rose-400 via-pink-300 to-indigo-400',
      };
    }
    if (incomeScore >= 70 || companyScore >= 70) {
      return {
        title: '結婚したい人気No.1の本命パートナー',
        subtitle: '堅実なキャリアと安心できる生活基盤を備え、将来を共に歩みたくなる大本命',
        rarityBadge: 'S LOVE ELITE',
        rarityColor: 'from-pink-400 via-rose-300 to-purple-400',
      };
    }
    if (heightVal >= 178) {
      return {
        title: 'スタイル抜群のスタイリッシュ・パートナー',
        subtitle: '高身長・優れた体型バランスで服を着こなし、立ち姿だけで好印象を与える人気株',
        rarityBadge: 'S LOVE ELITE',
        rarityColor: 'from-purple-400 via-indigo-300 to-pink-400',
      };
    }
    if (input.age >= 32) {
      return {
        title: '洗練された大人のモテ・アイコン',
        subtitle: 'スマートな佇まいと確かなステータスで、大人の余裕を感じさせる上品なパートナー',
        rarityBadge: 'S LOVE ELITE',
        rarityColor: 'from-purple-400 via-pink-300 to-rose-400',
      };
    }
    return {
      title: '隙のないモテオーラを纏う実力派',
      subtitle: 'ルックス・対話力・雰囲気の全てが好水準で調和した洗練のモテ・プレイヤー',
      rarityBadge: 'S LOVE ELITE',
      rarityColor: 'from-cyan-400 via-pink-300 to-purple-400',
    };
  }

  // 🌿 3. A UPPER TIER (恋愛スコア 65 〜 74点)
  if (loveScore >= 65) {
    if (input.maritalStatus === 'SINGLE') {
      return {
        title: 'ギャップで落とす沼らせマスター',
        subtitle: '知れば知るほど味わい深い個性と魅力を秘め、相手を夢中にさせる恋愛の玄人',
        rarityBadge: 'A LOVE UPPER',
        rarityColor: 'from-fuchsia-400 via-pink-400 to-purple-500',
      };
    }
    if (input.maritalStatus === 'MARRIED' || input.maritalStatus === 'DIVORCED') {
      return {
        title: '落ち着きと癒やしのプレミアム・パートナー',
        subtitle: '相手を包み込む優しさと安定した日常生活を提供できる、心強い良きパートナー',
        rarityBadge: 'A LOVE UPPER',
        rarityColor: 'from-rose-400 via-pink-300 to-violet-400',
      };
    }
    if (academicScore >= 75 || iqScore >= 75) {
      return {
        title: '知的な色気が香る大人デートのプロ',
        subtitle: '豊富な話題と深い知性で会話を楽しませ、デートの満足度を最高まで引き上げる知性派',
        rarityBadge: 'A LOVE UPPER',
        rarityColor: 'from-teal-400 via-indigo-300 to-purple-400',
      };
    }
    if (faceScore >= 65) {
      return {
        title: '清潔感あふれる好感度モンスター',
        subtitle: '整った身だしなみと爽やかな笑顔で、初対面から誰にでも愛される万能な好印象型',
        rarityBadge: 'A LOVE UPPER',
        rarityColor: 'from-sky-400 via-pink-300 to-indigo-400',
      };
    }
    return {
      title: '一緒にいて安心する癒やし系ハイスペック',
      subtitle: '安定感のある生活能力と飾らない人柄で、長続きする関係を築ける愛されキャラ',
      rarityBadge: 'A LOVE UPPER',
      rarityColor: 'from-rose-400 via-pink-300 to-violet-400',
    };
  }

  // 🌱 4. B & LOVE GROWING TIER (恋愛スコア 65点未満・詳細パターン展開)
  if (input.age <= 24) {
    return {
      title: '磨けば光る恋のダイヤモンド原石',
      subtitle: 'これからのスタイルアップと経験値で、劇的なモテ化を秘めたピュアな原石',
      rarityBadge: 'LOVE PROSPECT',
      rarityColor: 'from-pink-400 via-rose-300 to-slate-200',
    };
  }

  if (input.age <= 28) {
    return {
      title: '伸びしろたっぷりの恋のピュア・ストライカー',
      subtitle: '素直な心と若々しい情熱を持ち、これからの出会いで大きく花開く注目株',
      rarityBadge: 'LOVE PROSPECT',
      rarityColor: 'from-rose-400 via-pink-300 to-indigo-300',
    };
  }

  if (totalDebts === 0) {
    return {
      title: '浮気リスク0%の超安心系パートナー',
      subtitle: '相手を裏切らず、無理のない生活環境と揺るぎない誠実さで愛を育む純情派',
      rarityBadge: 'LOVE GROWING',
      rarityColor: 'from-emerald-400 via-teal-300 to-slate-200',
    };
  }

  if ((input.mbti || '').includes('I')) {
    return {
      title: 'ディープな世界観を持つこだわり愛好家',
      subtitle: '自分の趣味やこだわりを大切にし、波長の合うパートナーと深い絆を築くタイプ',
      rarityBadge: 'LOVE GROWING',
      rarityColor: 'from-purple-400 via-pink-300 to-slate-300',
    };
  }

  if (faceScore <= 55) {
    return {
      title: '一途な愛を注ぎ続ける純情ロマンチスト',
      subtitle: '見た目以上に誠実な内面と相手を思いやる気持ちに溢れた、深みのある愛されキャラ',
      rarityBadge: 'LOVE CHALLENGER',
      rarityColor: 'from-pink-300 via-rose-300 to-slate-300',
    };
  }

  return {
    title: 'ゆっくり愛を育む隠れ本命候補',
    subtitle: '時間をかけてお互いを知ることで、かけがえのない絆と信頼を深めていく本命タイプ',
    rarityBadge: 'LOVE CHALLENGER',
    rarityColor: 'from-slate-400 via-pink-300 to-slate-200',
  };
}
