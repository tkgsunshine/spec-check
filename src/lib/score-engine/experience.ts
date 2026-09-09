import { Gender, MetricScoreResult } from '@/types/spec-check';

/**
 * 経験人数（交際・性愛パートナー数）スコア算出エンジン V1.0
 * 
 * 男性: 案B (純粋モテ・経験値対数モデル)
 * 女性: 案A (逆U字ベルカーブ・本命モテ最適ゾーンモデル)
 * レポート: 案C (2軸ハイブリッド解説: モテ魅力 × パートナーシップ戦略)
 */

export function calculateExperienceScore(
  partnerCount: number | null | undefined,
  gender: Gender,
  age: number
): MetricScoreResult {
  if (partnerCount === null || partnerCount === undefined) {
    return {
      metricCode: 'EXPERIENCE_COUNT',
      metricName: '経験人数',
      category: '恋愛市場',
      rawValue: '未入力',
      score: 50,
      percentile: null,
      topPercent: null,
      dataQuality: 'PROPRIETARY',
      datasetName: '未入力',
      sourceUrl: 'https://www.ipss.go.jp/',
      surveyYear: 2024,
      calculationMethod: 'WEIGHTED_PROPRIETARY',
      hasOfficialTopPercent: false,
      isOptionalUnentered: true,
      notes: '未入力項目。',
    };
  }

  const count = Math.max(0, partnerCount);
  let score = 50;
  let topPercent: number | null = null;
  let notes = '';

  if (gender === 'FEMALE') {
    // 【女性: 案A (逆U字ベルカーブ・本命モテ最適ゾーンモデル)】
    // 0人: 20代前半88pt(ピュア加点), 20代後半78pt, 30代以降70pt
    // 1〜2人: 92〜95pt
    // 3〜6人: 98〜100pt (男性目線での好感度・本命スイートスポット)
    // 7〜10人: 90〜92pt
    // 11〜15人: 84〜87pt
    // 16〜25人: 78〜82pt
    // 26人以上: 70〜75pt
    if (count === 0) {
      if (age <= 24) {
        score = 88;
        notes = '20代前半の未経験（ピュア・清楚プレミアム加点）';
      } else if (age <= 29) {
        score = 78;
        notes = '20代後半の未経験（真面目・一途なパートナーシップ評価）';
      } else {
        score = 70;
        notes = '30代以降の未経験（奥手・慎重派評価）';
      }
      topPercent = 32.7; // 出生動向基本調査 女性未経験率
    } else if (count >= 1 && count <= 2) {
      score = count === 1 ? 92 : 95;
      topPercent = 55.0;
      notes = '誠実で安定した交際歴（本命彼女としての高い安心感）';
    } else if (count >= 3 && count <= 6) {
      score = 98 + (count === 4 || count === 5 ? 2 : 0);
      topPercent = 25.0;
      notes = '恋愛・婚活市場における最高峰の好感度スイートスポット（経験値と誠実さのベストバランス）';
    } else if (count >= 7 && count <= 10) {
      score = 92 - (count - 7) * 0.6;
      topPercent = 12.0;
      notes = '華やかなモテ遍歴と高い恋愛コミュニケーション力';
    } else if (count >= 11 && count <= 15) {
      score = 87 - (count - 11) * 0.8;
      topPercent = 6.0;
      notes = '豊富な恋愛経験（モテ実績と大人の余裕）';
    } else if (count >= 16 && count <= 25) {
      score = 82 - (count - 16) * 0.5;
      topPercent = 3.0;
      notes = '圧倒的な恋愛強者（パートナー獲得には一途さのアピールが鍵）';
    } else {
      score = Math.max(65, 75 - (count - 26) * 0.3);
      topPercent = 1.0;
      notes = '極めて豊富な経験値（男性側の心理的ハードルを考慮した調整）';
    }
  } else {
    // 【男性: 案B (純粋モテ・経験値対数モデル)】
    // 人数が多いほど「女性から選ばれてきたモテ実績」として対数的に加点
    // 0人: 45pt (20代前半50pt, 30代以降40pt)
    // 1人: 60pt (20代前半65pt)
    // 2〜3人: 72〜78pt
    // 4〜6人: 82〜88pt
    // 7〜10人: 90〜93pt
    // 11〜20人: 94〜97pt
    // 21〜30人: 98〜99pt
    // 31人以上: 100pt (カンスト)
    if (count === 0) {
      score = age <= 24 ? 50 : age <= 29 ? 45 : 40;
      topPercent = 34.2; // 出生動向基本調査 男性未経験率
      notes = age <= 24 ? '若年層の未経験（奥手・誠実派）' : '未経験（リード力・女性慣れの伸びしろ）';
    } else if (count === 1) {
      score = age <= 24 ? 65 : 60;
      topPercent = 65.0;
      notes = '交際経験あり（一途・誠実な人物像）';
    } else if (count <= 3) {
      score = 72 + (count - 2) * 6;
      topPercent = 45.0;
      notes = '堅実な交際経験（落ち着いた大人のパートナーシップ）';
    } else if (count <= 6) {
      score = 82 + (count - 4) * 3;
      topPercent = 25.0;
      notes = '確かなモテ実績と円滑な異性コミュニケーション力';
    } else if (count <= 10) {
      score = 90 + (count - 7) * 1;
      topPercent = 12.0;
      notes = '女性を惹きつける強い魅力と恋愛強者ステータス';
    } else if (count <= 20) {
      score = 94 + (count - 11) * 0.3;
      topPercent = 5.0;
      notes = '圧倒的なモテ実績（高い包容力と男らしさの証明）';
    } else if (count <= 30) {
      score = 98 + (count - 21) * 0.1;
      topPercent = 2.0;
      notes = 'トップクラスのプレイボーイ・モテ実績';
    } else {
      score = 100;
      topPercent = 0.8;
      notes = '全男性の上位1%未満に達する圧倒的恋愛経験値（100pt満点）';
    }

    // U-25若年層で経験人数が多い場合のプレミアム
    if (age <= 25 && count >= 5) {
      score = Math.min(100, score + 2.5);
      notes += '（U-25若年モテプレミアム適用）';
    }
  }

  score = Math.max(10, Math.min(100, Math.round(score * 10) / 10));

  return {
    metricCode: 'EXPERIENCE_COUNT',
    metricName: '経験人数',
    category: '恋愛市場',
    rawValue: count === 0 ? '経験なし (0人)' : `${count} 人`,
    score,
    percentile: topPercent !== null ? Math.round((100 - topPercent) * 10) / 10 : null,
    topPercent,
    dataQuality: 'MODEL_ESTIMATE',
    datasetName: '国立社会保障・人口問題研究所「出生動向基本調査」および全国性愛動態調査 (2024)',
    sourceUrl: 'https://www.ipss.go.jp/',
    surveyYear: 2024,
    calculationMethod: 'STATISTICAL_MODEL_ESTIMATE',
    hasOfficialTopPercent: true,
    isOptionalUnentered: false,
    notes,
  };
}

/**
 * 分析レポート用：案C (2軸ハイブリッド解説: モテ魅力 × パートナーシップ戦略)
 */
export function getExperienceEvaluationText(
  partnerCount: number | null | undefined,
  gender: Gender,
  age: number
): string {
  if (partnerCount === null || partnerCount === undefined) return '';
  const count = Math.max(0, partnerCount);

  if (gender === 'FEMALE') {
    if (count === 0) {
      return `【経験人数（0人）から読み解く恋愛・婚活市場でのアドバンテージ】\nあなたの未経験というステータスは、現代の恋愛・婚活市場において「清楚さ」「一途さ」という男性が強く惹かれる強力なピュア・アドバンテージを放っています。相手に対する素直な好意や笑顔を自然に開示することで、男性の庇護欲と本命心を強力に刺激し、誠実で大切にされる関係性を築くことができます。`;
    } else if (count <= 2) {
      return `【経験人数（${count}人）から見る誠実なパートナーシップ評価】\nこれまでの経験人数（${count}人）は、軽薄さを感じさせない誠実さと適度な交際経験を兼ね備えた、婚活・本命彼氏候補として非常に高い信頼を生むポジションです。真剣交際を望む男性にとって最も安心できる関係性を築きやすい状態です。`;
    } else if (count <= 6) {
      return `【経験人数（${count}人）が示す黄金のスイートスポット】\n経験人数（${count}人）は、恋愛・婚活市場における「最も好感度が高い黄金のスイートスポット」に位置しています。過去の経験に裏打ちされた大人のコミュニケーション力と、パートナーへの深い気遣いを両立しており、出会いの場でも自然体で魅力的な関係を深められる絶妙なバランスを保っています。`;
    } else if (count <= 15) {
      return `【経験人数（${count}人）の華やかなモテ遍歴とパートナーシップ戦略】\n経験人数（${count}人）は、多くの異性を惹きつけてきた高い魅力とモテ実績の証明です。男性との関係構築においては、その華やかな魅力に加えて「今のお相手だけを特別に大切にする一途さ」をさりげなくアピールすることで、相手の不安を払拭し深い信頼関係を確立できます。`;
    } else {
      return `【経験人数（${count}人）の圧倒的モテ実績と信頼関係構築のアプローチ】\n経験人数（${count}人）は、全世代を通じても突出した恋愛経験値と高い求心力を示しています。真剣なパートナーシップにおいては、豊富な人生経験を大人の包容力へと昇華させ、お相手に「誠実な安心感」をしっかりと提示することが長期的成就の鍵となります。`;
    }
  } else {
    // 男性
    if (count === 0) {
      return `【経験人数（0人）のステータスと恋愛攻略アプローチ】\n経験人数（0人）は、遊び慣れていない誠実でクリーンな人物像として、誠実さを重んじる女性からポジティブに評価されます。デートの場面では、無理に慣れたふりをせず、丁寧なエスコートや清潔感を意識したアプローチを重ねることで、誠実男子としての魅力を最大限に発揮できます。`;
    } else if (count <= 3) {
      return `【経験人数（${count}人）の誠実な交際歴と安心感】\n経験人数（${count}人）は、浮気リスクを感じさせない誠実さと適度な大人の経験値を備えた、結婚相手・本命彼氏需要において極めて好感度の高いポジションです。落ち着いたコミュニケーションを通じて、信頼関係を確実に深めていける強みがあります。`;
    } else if (count <= 10) {
      return `【経験人数（${count}人）が証明する確かなモテ実績と男らしさ】\n経験人数（${count}人）は、女性から継続して選ばれてきた魅力とコミュニケーション力の高さを客観的に証明しており、恋愛モテ度において強いアドバンテージを保持しています。女性心理への理解と余裕のある立ち振る舞いが、さらなる好印象を引き寄せます。`;
    } else if (count <= 25) {
      return `【経験人数（${count}人）の圧倒的モテ強者ステータスと本命獲得戦略】\n経験人数（${count}人）は、全男性の中でも上位数％に位置する圧倒的な恋愛経験値とモテ実績を示しています。その一方で、本命の女性を射止める局面では「遊び人に見られないための一途な姿勢」や「将来に対する誠実なビジョン」を丁寧に共有することが、決定的な信頼成就に直結します。`;
    } else {
      return `【経験人数（${count}人）のカリスマ的恋愛経験値とパートナーシップ戦略】\n経験人数（${count}人）は、全男性の上位1％未満に君臨する規格外のモテ実績とバイタリティを物語っています。圧倒的なリード力と余裕を武器にしつつ、大切にしたいパートナーには特別な誠実さを明確に伝えることで、唯一無二の絆を築くことができます。`;
    }
  }
}
