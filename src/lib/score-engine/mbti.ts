import { Gender } from '@/types/spec-check';

/**
 * Truity Psychometrics / 米パーソナリティ・キャリア統計に基づく
 * 16タイプ別 生涯年収・資産形成ポテンシャル特性マスタ
 */
export const MBTI_ECONOMIC_DATA: Record<
  string,
  {
    bonus: number;
    tier: 'S' | 'A' | 'B' | 'C';
    label: string;
    description: string;
  }
> = {
  ENTJ: {
    bonus: 2.5,
    tier: 'S',
    label: '最高峰の事業構築・リーダーシップ型',
    description:
      '全16タイプ中、平均生涯年収・経営層比率でトップを誇る圧倒的な実行力タイプ。高い目標設定と組織を牽引する統率力により、資本蓄積と事業拡大において最強のポテンシャルを有します。',
  },
  ESTJ: {
    bonus: 2.0,
    tier: 'S',
    label: '確実な管理実行・堅実蓄財型',
    description:
      '財務規律とタスク完遂能力に極めて優れ、組織内での出世スピードと確実な資産形成力で上位に君臨。無駄な支出を排し、安定したキャッシュフローを構築することに長けています。',
  },
  INTJ: {
    bonus: 1.5,
    tier: 'A',
    label: '長期的戦略・合理的複利投資型',
    description:
      '感情に流されない論理的思考と長期的な市場分析力に優れ、株式や不動産などの複利運用で大きな資産を築きやすい特性を持ちます。再現性の高い富の構築が得意です。',
  },
  ISTJ: {
    bonus: 1.5,
    tier: 'A',
    label: '高い貯蓄率・リスクヘッジ型',
    description:
      '高い責任感と計画性を持ち、全タイプ中トップクラスの貯蓄率と資産保全力を発揮。着実に生活防衛資金と資産ポートフォリオを拡大する堅実な資産家タイプです。',
  },
  ENTP: {
    bonus: 1.0,
    tier: 'A',
    label: '新規ビジネス創出・高レバレッジ型',
    description:
      '既存の枠組みにとらわれない発想力と商機を見抜く嗅覚で、新規事業や副業投資から大きなリターンを生み出すポテンシャルを持ちます。攻めの資産拡大に強みがあります。',
  },
  ESTP: {
    bonus: 1.0,
    tier: 'A',
    label: '機動力・現場交渉力型',
    description:
      '臨機応変な交渉力とスピード感のある意思決定で、営業や実業において即効性の高いキャッシュを生み出す力があります。リスクテイクを恐れないアグレッシブな投資傾向です。',
  },
  ENFJ: {
    bonus: 0.5,
    tier: 'B',
    label: '人脈構築・共感シナジー型',
    description:
      '豊かな人望とネットワーキング能力を武器に、人との信頼関係を通じて価値あるビジネスチャンスや共同プロジェクトを引き寄せる協調型資産形成スタイルです。',
  },
  ESFJ: {
    bonus: 0.5,
    tier: 'B',
    label: '安定志向・社会的信用型',
    description:
      '職場や地域コミュニティにおける高い信用度をベースに、安定した雇用と堅実な家計管理で着実に基盤を固めていくバランス型です。',
  },
  ISTP: {
    bonus: 0.5,
    tier: 'B',
    label: '専門スキル・実利追求型',
    description:
      '高度な専門スキルや技術の習得に優れ、自身の技術力を換金する実利的なアプローチで独立した収入源を確保することに向いています。',
  },
  INFJ: {
    bonus: 0.5,
    tier: 'B',
    label: '独自ビジョン・知的価値型',
    description:
      '深い洞察力と倫理観を持ち、社会的意義の高い事業や知的コンテンツの創造を通じて、持続可能で独自性の高い価値と資産を構築します。',
  },
  ISFJ: {
    bonus: 0.0,
    tier: 'C',
    label: '着実支援・堅実保全型',
    description:
      '投機的なハイリスク投資を避け、家族や生活の安全を第一に考えた堅実な家計防衛と手堅い資産管理を徹底する守りのエキスパートです。',
  },
  ESFP: {
    bonus: 0.0,
    tier: 'C',
    label: '体験重視・自己投資型',
    description:
      'お金を単なる蓄財のためではなく、今この瞬間の豊かな体験や対人関係への投資として活用する傾向があります。人脈を収益化する発想が鍵となります。',
  },
  INTP: {
    bonus: 0.0,
    tier: 'C',
    label: '知的好奇心・イノベーション型',
    description:
      '金銭的動機よりも知的好奇心や理論の探求を優先する傾向があります。自身の深い専門知見を特許や技術ビジネスと結びつけることで爆発的な資産を築く隠れた才覚を持ちます。',
  },
  ISFP: {
    bonus: 0.0,
    tier: 'C',
    label: '美的感性・ライフワーク重視型',
    description:
      '自分の美学や心地よさを最優先にするため、物質的な富の競い合いには無関心なマイペース派。自分のクリエイティブな強みを活かしたニッチ市場での蓄財が適しています。',
  },
  ENFP: {
    bonus: 0.0,
    tier: 'C',
    label: 'パッション駆動・自由追求型',
    description:
      '枠にはまった資産管理よりも、熱中できる情熱や自由な生き方を追求するタイプ。多面的な才能をコンテンツビジネスやコミュニティに昇華させることで富を成します。',
  },
  INFP: {
    bonus: 0.0,
    tier: 'C',
    label: '理念重視・独自世界観型',
    description:
      '金銭や数字の多寡よりも、自身の内なる価値観や誠実さを何よりも重んじるタイプ。共感を呼ぶ独自の世界観やクリエイティブな作品を通じて唯一無二の価値を生み出します。',
  },
};

/**
 * 恋愛・婚活アプリ動態データ / パーソナリティ人気調査に基づく
 * 16タイプ別 男女別モテ度・恋愛市場需要マスタ
 */
export const MBTI_LOVE_DATA: Record<
  string,
  {
    male: { bonus: number; tier: string; label: string; appeal: string; bestMatch: string };
    female: { bonus: number; tier: string; label: string; appeal: string; bestMatch: string };
  }
> = {
  ENTJ: {
    male: {
      bonus: 3.0,
      tier: 'S',
      label: '圧倒的リード力・カリスマ彼氏',
      appeal: '自信に満ちた決断力と頼もしさで女性を引っ張る男らしさ。デートのエスコートから将来設計まで安心感抜群。',
      bestMatch: 'INFP / ISFP',
    },
    female: {
      bonus: 0.5,
      tier: 'B',
      label: '自立したハイスペック・クイーン',
      appeal: '知性的で芯が強く、仕事もプライベートも自立したかっこいい大人の女性。パートナーと対等に高め合える魅力。',
      bestMatch: 'INTP / INFP',
    },
  },
  ESTP: {
    male: {
      bonus: 3.0,
      tier: 'S',
      label: '陽キャ全開・会話上手なモテ男',
      appeal: '抜群のトーク力と行動力で常に女性を楽しませるムードメーカー。初対面から心の距離を縮める恋愛強者。',
      bestMatch: 'ISFJ / ISTJ',
    },
    female: {
      bonus: 1.0,
      tier: 'B',
      label: 'ノリ抜群・アクティブガール',
      appeal: '裏表がなくサバサバとした明るさで男性が気負わず自然体でいられる存在。一緒にいて退屈しない最高のパートナー。',
      bestMatch: 'ISFJ / ISTJ',
    },
  },
  ENTP: {
    male: {
      bonus: 2.5,
      tier: 'S',
      label: '知的で刺激的なモテクリエイター',
      appeal: 'ユーモア溢れる知的なトークと型にはまらないサプライズで、女性を惹きつけて飽きさせない魅力の持ち主。',
      bestMatch: 'INFJ / INTJ',
    },
    female: {
      bonus: 1.0,
      tier: 'B',
      label: '機知に富んだチャーミング女子',
      appeal: '頭の回転が速く会話が弾むため、知的好奇心旺盛な男性から熱烈に好意を寄せられるユニークな魅力。',
      bestMatch: 'INFJ / INTJ',
    },
  },
  ENFJ: {
    male: {
      bonus: 2.5,
      tier: 'A',
      label: '圧倒的包容力・紳士的ジェントルマン',
      appeal: '相手の感情に寄り添う深い共感力と気遣いで、婚活市場・本命彼氏需要においてトップクラスの人気。',
      bestMatch: 'INFP / ISFP',
    },
    female: {
      bonus: 2.0,
      tier: 'A',
      label: '明るく寄り添う太陽系ヒロイン',
      appeal: 'ポジティブな包容力でパートナーの自己肯定感を高め、癒やしと元気を与える誰もが愛したくなる性格。',
      bestMatch: 'INFP / INTP',
    },
  },
  ESFJ: {
    male: {
      bonus: 2.0,
      tier: 'A',
      label: '誠実で家庭的・理想の旦那候補',
      appeal: '家族や恋人を何よりも大切にし、細やかな気遣いと安定した愛情を注ぎ続ける結婚相手人気No.1。',
      bestMatch: 'ISFP / ISTP',
    },
    female: {
      bonus: 2.5,
      tier: 'A',
      label: '気配り上手・結婚したい女性トップ',
      appeal: '家庭的で世話好き、相手の好みを把握して尽くす姿勢が男性の本命心を強く掴む王道のお嫁さん候補。',
      bestMatch: 'ISFP / ISTP',
    },
  },
  ENFP: {
    male: {
      bonus: 1.0,
      tier: 'B',
      label: '人懐っこい愛され男子',
      appeal: '少年のような無邪気さと人懐っこさで母性本能をくすぐり、女性に心を開かせる不思議な愛されキャラ。',
      bestMatch: 'INTJ / INFJ',
    },
    female: {
      bonus: 3.0,
      tier: 'S',
      label: '天真爛漫・愛嬌最強ヒロイン',
      appeal: '素直な感情表現と抜群のリアクションで男性を一瞬で虜にする、全16タイプ中モテ度トップの圧倒的愛され力。',
      bestMatch: 'INTJ / INFJ',
    },
  },
  ESFP: {
    male: {
      bonus: 1.5,
      tier: 'B',
      label: '華やかで楽しいエンターテイナー',
      appeal: 'おしゃれでフットワークが軽く、デートスポットや美味しいお店に精通。一緒にいるだけで非日常を味わえる相手。',
      bestMatch: 'ISFJ / ISTJ',
    },
    female: {
      bonus: 3.0,
      tier: 'S',
      label: '親しみやすさ抜群の華やか女子',
      appeal: '明るい笑顔と親しみやすい距離感で男性の緊張をほぐし、ファーストデートから好印象を独占するモテの王道。',
      bestMatch: 'ISFJ / ISTJ',
    },
  },
  ISFJ: {
    male: {
      bonus: 1.5,
      tier: 'A',
      label: '一途で優しい守護者パートナー',
      appeal: '浮気リスク皆無の誠実さと献身的な優しさ。派手さよりも確実な幸せと穏やかな時間を約束する本命タイプ。',
      bestMatch: 'ESTP / ESFP',
    },
    female: {
      bonus: 3.0,
      tier: 'S',
      label: '清楚・献身的・理想のパートナー',
      appeal: '控えめで上品な気遣いと深い母性。男性が「一生大切にしたい」と心底感じる最強の良妻賢母タイプ。',
      bestMatch: 'ESTP / ESFP',
    },
  },
  INTJ: {
    male: {
      bonus: 1.5,
      tier: 'A',
      label: '知性的でミステリアスな実力派',
      appeal: '落ち着いた知性とブレない信念が大人の色気を放ち、中身重視の女性から深く一途に惚れ込まれるタイプ。',
      bestMatch: 'ENFP / ENTP',
    },
    female: {
      bonus: 0.5,
      tier: 'B',
      label: 'クールで思慮深いミステリアス美女',
      appeal: '媚びない凛とした美しさと高い知性。心を開いた相手にだけ見せるギャップが熱烈なファンを生む魅力。',
      bestMatch: 'ENFP / ENTP',
    },
  },
  ISTP: {
    male: {
      bonus: 1.5,
      tier: 'A',
      label: 'クールで頼れる職人系男子',
      appeal: '無口ながらいざという時に頼りになる実力派。程よい距離感と男らしいサバイバル力が女性の心をくすぐります。',
      bestMatch: 'ESFJ / ESTJ',
    },
    female: {
      bonus: 0.5,
      tier: 'B',
      label: 'サバサバ系・自立したクール女子',
      appeal: '束縛を嫌いサバサバした付き合いができるため、べたべたした関係が苦手な大人の男性にとって最高の居心地を提供。',
      bestMatch: 'ESFJ / ESTJ',
    },
  },
  ESTJ: {
    male: {
      bonus: 1.5,
      tier: 'A',
      label: '頼れる大黒柱・決断力パートナー',
      appeal: '責任感が強く生活基盤をしっかりと築き上げる頼もしさ。結婚後の家庭運営において絶大な安心感を誇ります。',
      bestMatch: 'ISFP / ISTP',
    },
    female: {
      bonus: 0.5,
      tier: 'B',
      label: 'しっかり者・頼れる姉御肌',
      appeal: '段取り上手で決断力があり、パートナーの生活やキャリアを力強くサポートできる頼もしい存在。',
      bestMatch: 'ISFP / ISTP',
    },
  },
  ISTJ: {
    male: {
      bonus: 1.0,
      tier: 'B',
      label: '真面目で誠実・浮気知らずの安心派',
      appeal: '約束を厳守しルールを守る誠実さ。派手なアプローチは苦手でも、時間とともに信頼度が右肩上がりに高まるタイプ。',
      bestMatch: 'ESFP / ESTP',
    },
    female: {
      bonus: 0.5,
      tier: 'B',
      label: '礼儀正しく落ち着いた大和撫子',
      appeal: '規律正しく礼儀正しい立ち振る舞いと堅実な価値観で、誠実な男性から長期的なパートナーとして高く評価されます。',
      bestMatch: 'ESFP / ESTP',
    },
  },
  INFP: {
    male: {
      bonus: 0.5,
      tier: 'B',
      label: '優しく繊細なロマンチスト',
      appeal: '純粋な優しさと相手を否定しない安心感。奥手になりがちですが、心を通わせた相手には深い愛情を捧げます。',
      bestMatch: 'ENFJ / ENTJ',
    },
    female: {
      bonus: 2.0,
      tier: 'A',
      label: '守ってあげたい癒やし系清楚女子',
      appeal: '儚げでピュアな雰囲気と豊かな感受性。男性の庇護欲を強く刺激し、「守ってあげたい」と思わせるモテの天性。',
      bestMatch: 'ENFJ / ENTJ',
    },
  },
  ISFP: {
    male: {
      bonus: 0.5,
      tier: 'B',
      label: '穏やかで自然体な癒やし彼氏',
      appeal: '穏やかで争いを好まない柔らかな雰囲気。押し付けがましさが一切なく、一緒にいて心が落ち着く癒やし系。',
      bestMatch: 'ESFJ / ESTJ',
    },
    female: {
      bonus: 2.0,
      tier: 'A',
      label: '柔らかいオーラのナチュラル美人',
      appeal: 'おしゃれでセンスが良く、親しみやすい柔らかな空気感。男性が構えずに話しかけやすい圧倒的間口の広さ。',
      bestMatch: 'ESFJ / ESTJ',
    },
  },
  INFJ: {
    male: {
      bonus: 0.5,
      tier: 'B',
      label: 'ミステリアスな包容力・共感派',
      appeal: '相手の深層心理を見抜く洞察力と静かな優しさ。一度信頼されると唯一無二の相談相手・理解者として手放せない存在に。',
      bestMatch: 'ENTP / ENFP',
    },
    female: {
      bonus: 1.0,
      tier: 'B',
      label: '深みのある大人のミステリアス女子',
      appeal: '知性と包容力を兼ね備えた静かな存在感。表面的な恋愛ではなく、魂のつながりを求める知的な男性から深く愛されます。',
      bestMatch: 'ENTP / ENFP',
    },
  },
  INTP: {
    male: {
      bonus: 0.0,
      tier: 'C',
      label: '知的好奇心・マイペース探求型',
      appeal: '感情論ではなく論理的でサバサバした関係を好む。自分の趣味や研究に熱中する姿が知的な女性に魅力として映ります。',
      bestMatch: 'ENTJ / ENFJ',
    },
    female: {
      bonus: 0.0,
      tier: 'C',
      label: '理系・サバサバ系マニアック女子',
      appeal: '恋愛の駆け引きを嫌うストレートさと独特のオタク的こだわり。同じ波長を持つパートナーと唯一無二のオアシスを築きます。',
      bestMatch: 'ENTJ / ENFJ',
    },
  },
};

/**
 * 総合スペック用：MBTIによる資産形成・キャリア形成力ボーナス取得
 */
export function getMbtiEconomicBonus(mbti?: string | null): {
  bonus: number;
  tier: string;
  label: string;
  notes: string;
} {
  if (!mbti) return { bonus: 0, tier: '', label: '', notes: '' };
  const cleanMbti = mbti.trim().toUpperCase();
  const data = MBTI_ECONOMIC_DATA[cleanMbti];
  if (!data) return { bonus: 0, tier: '', label: '', notes: '' };

  return {
    bonus: data.bonus,
    tier: data.tier,
    label: data.label,
    notes: data.bonus > 0 ? `MBTI特性（${cleanMbti}: ${data.label}）による生涯資産形成ポテンシャル加点 (+${data.bonus}pt)` : '',
  };
}

/**
 * 恋愛スペック用：MBTIによる男女別モテ度ボーナス取得
 */
export function getMbtiLoveBonus(
  mbti?: string | null,
  gender?: Gender
): {
  bonus: number;
  tier: string;
  label: string;
  notes: string;
} {
  if (!mbti) return { bonus: 0, tier: '', label: '', notes: '' };
  const cleanMbti = mbti.trim().toUpperCase();
  const data = MBTI_LOVE_DATA[cleanMbti];
  if (!data) return { bonus: 0, tier: '', label: '', notes: '' };

  const isFemale = gender === 'FEMALE';
  const roleData = isFemale ? data.female : data.male;

  return {
    bonus: roleData.bonus,
    tier: roleData.tier,
    label: roleData.label,
    notes: roleData.bonus > 0 ? `MBTI特性（${cleanMbti}: ${roleData.label}）による恋愛市場需要・モテ度加点 (+${roleData.bonus}pt)` : '',
  };
}

/**
 * 総合スペック分析レポート用：MBTI資産・キャリア詳細解説パラグラフ
 */
export function getMbtiEconomicEvaluationText(mbti?: string | null): string {
  if (!mbti) return '';
  const cleanMbti = mbti.trim().toUpperCase();
  const data = MBTI_ECONOMIC_DATA[cleanMbti];
  if (!data) return '';

  return `【MBTI（${cleanMbti}）から読み解く生涯資産形成とキャリアの強み】\nあなたのパーソナリティタイプ（${cleanMbti}: ${data.label}）は、経済統計・組織分析の観点において「${data.description}」という特徴を示しています。この性格特性は、日々のキャリア選択や資金管理における意思決定パターンに直結しており、ご自身の強みである資質を意識的に活用することで、同世代の中でも突出した資産ポートフォリオと社会的地位の確立を加速させることが可能です。`;
}

/**
 * 恋愛スペック分析レポート用：MBTI恋愛モテ度・パートナー相性詳細解説パラグラフ
 */
export function getMbtiLoveEvaluationText(mbti?: string | null, gender?: Gender): string {
  if (!mbti) return '';
  const cleanMbti = mbti.trim().toUpperCase();
  const data = MBTI_LOVE_DATA[cleanMbti];
  if (!data) return '';

  const isFemale = gender === 'FEMALE';
  const roleData = isFemale ? data.female : data.male;
  const genderText = isFemale ? '女性' : '男性';

  return `【MBTI（${cleanMbti}）から見る${genderText}としての恋愛・モテ魅力とパートナー相性】\n恋愛市場におけるあなたのパーソナリティ（${cleanMbti}: ${roleData.label}）は、「${roleData.appeal}」という強烈なアドバンテージを放っています。出会いの場面ではこの自然体の魅力をアピール軸に据えることで、お相手に対して強い好印象と安心感を同時に与えることができます。\nなお、心理学的・パーソナリティ統計におけるベスト相性パートナーは【${roleData.bestMatch}】とされており、波長が合いやすく長期的に幸福度の高い関係を築きやすい組み合わせです。`;
}
