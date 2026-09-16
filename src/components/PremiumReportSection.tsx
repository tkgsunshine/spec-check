'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverallDiagnosisResultV3 } from '@/types/spec-check';
import { scoreToTopPercent } from '@/lib/score-engine/math-utils';
import {
  Lock,
  Unlock,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface PremiumReportSectionProps {
  result: OverallDiagnosisResultV3;
  diagnosisId: string;
  isLoveMode?: boolean;
  children?: React.ReactNode | ((props: { isUnlocked: boolean }) => React.ReactNode);
}

export default function PremiumReportSection({
  result,
  diagnosisId,
  isLoveMode = false,
  children,
}: PremiumReportSectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedMarriage, setCopiedMarriage] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`spec_check_unlocked_${diagnosisId}`);
      const params = new URLSearchParams(window.location.search);
      const queryUnlocked = params.get('unlocked') === 'true';

      if (stored === 'true' || queryUnlocked || result.isPremiumUnlocked) {
        setIsUnlocked(true);
        try {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        } catch {}
      }
    }
  }, [diagnosisId, result.isPremiumUnlocked]);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : '',
        }),
      });

      const data = await res.json();
      if (data.mode === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      // シミュレーション決済モード（即時アンロック）
      setTimeout(() => {
        setIsUnlocked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsUnlocked(true);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const { loveOverallScore, gender, age, nickname, prefectureName, mbti } = {
    loveOverallScore: result.loveOverallScore || 70,
    gender: result.inputSummary?.gender || 'MALE',
    age: result.inputSummary?.age || 26,
    nickname: result.inputSummary?.nickname || 'あなた',
    prefectureName: result.inputSummary?.prefectureName || '東京都',
    mbti: result.inputSummary?.mbti || 'INFP',
  };

  const estimatedMatchCount = Math.min(
    985,
    Math.max(120, Math.round(1000 * Math.pow(loveOverallScore / 100, 1.25) * 0.95))
  );
  const matchRate = (estimatedMatchCount / 10).toFixed(1);

  const targetPartnerAgeRange =
    gender === 'MALE'
      ? `${Math.max(20, age - 5)}歳 〜 ${age + 1}歳`
      : `${age - 1}歳 〜 ${age + 6}歳`;

  // 自己紹介文の生成（2倍の分量・構成化）
  const profileAppText = `はじめまして！プロフィールをご覧いただきありがとうございます✨
${prefectureName}で働いている${age}歳の${nickname}です。

【仕事について】
現在は専門職として日々の仕事にやりがいを持って誠実に取り組んでいます。オンとオフのメリハリを大切にしており、休日はしっかりとプライベートの時間でリフレッシュしています。

【性格・周りからの印象】
周りの友人や同僚からは「落ち着いていて聞き上手」「穏やかで一緒にいて安心する」と言われることが多いです（MBTI: ${mbti}）。人の話をじっくり聞くのが好きなので、どんな話題でも気軽に話してもらえると嬉しいです。

【休日の過ごし方・好きなこと】
・美味しいご飯屋さんや隠れ家カフェの開拓（お肉やお寿司、珈琲が好きです）
・旅行やドライブ、温泉巡りで非日常を楽しむこと
・映画鑑賞、読書、たまにジムで軽く身体を動かすこと

【理想の関係】
お互いの仕事や一人の時間も尊重しつつ、美味しいものを一緒に食べたり、他愛もないことで笑い合える自然体な関係が理想です。

まずはメッセージで気軽に色々お話しできたら嬉しいです！どうぞよろしくお願いします✨`;

  const profileMarriageText = `はじめまして。プロフィールをご覧いただき誠にありがとうございます。
${nickname}と申します。${prefectureName}在住の${age}歳です。

将来を見据えて、お互いを深く信頼し支え合える誠実なパートナーと出会いたいと思い登録いたしました。

【仕事と生活基盤】
仕事には誇りと責任感を持って誠実に取り組んでおり、日々の生活リズムや健康管理も大切にしています。お互いに自立しつつ、何かあったときには何でも相談し合って助け合える関係を築いていきたいと考えております。

【性格と価値観】
性格は穏やかで思いやりを大切にするタイプです。相手の意見やペースを尊重し、感情的にならず落ち着いて対話することを常に心がけています。

【休日の過ごし方】
休日は料理や家事をこなしたり、映画鑑賞、散歩、ドライブなどを楽しんでいます。季節のイベントや美味しいものを一緒に共有できると嬉しいです。

【結婚観・理想の家庭像】
些細なことでも「ありがとう」と「ごめんね」を素直に伝え合える、温かく笑顔の絶えない家庭が理想です。お互いの価値観や個性を尊重しながら、一緒に人生を歩んでいけたら幸いです。

最後までお読みいただきありがとうございました。素敵なご縁があれば嬉しく思います。どうぞよろしくお願いいたします。`;

  const copyAppBio = () => {
    navigator.clipboard.writeText(profileAppText);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const copyMarriageBio = () => {
    navigator.clipboard.writeText(profileMarriageText);
    setCopiedMarriage(true);
    setTimeout(() => setCopiedMarriage(false), 2000);
  };

  // ユーザーの属性（年齢、経済/キャリアスコア、MBTI、総合スコア）に応じたマッチングアプリ・結婚相談所ランキング（1位〜4位）
  const getBattlefieldRanking = () => {
    const ecoScore = result.categoryScores?.economic || 60;
    const carScore = result.categoryScores?.career || 60;
    const isHighSpec = ecoScore >= 72 || carScore >= 72 || loveOverallScore >= 78;
    const cleanMbti = (mbti || '').toUpperCase();
    const isIntrovert = cleanMbti.includes('I');
    const isFeeling = cleanMbti.includes('F');
    const isOver32 = age >= 32;
    const isUnder26 = age <= 25;

    // 各サービスの適合度スコア算出
    const allServices = [
      {
        id: 'bachelor',
        name: 'バチェラーデート',
        category: '審査制ハイスペ特化アプリ',
        url: 'https://www.bachelorapp.net/',
        linkText: 'おすすめ：バチェラーデート公式を見る',
        baseFit: isHighSpec ? 95 : isUnder26 ? 81 : 86,
        description: isHighSpec
          ? '知性・ステータスが直接評価される完全審査制。AIが週1回のデートを自動セッティングするため、忙しい高スペック層に最適です。'
          : 'いいねやメッセージのやり取り不要で即カフェデート。スペックと第一印象の魅力を初回から発揮できる効率特化市場です。',
        color: 'border-amber-500/40 text-amber-300 bg-amber-500/20',
      },
      {
        id: 'ibj',
        name: 'IBJ系列 優良結婚相談所',
        category: '業界最大手・成婚特化相談所',
        url: 'https://www.ibjapan.com/',
        linkText: 'おすすめ：IBJ系列・優良結婚相談所を比較する',
        baseFit: isOver32 ? (isHighSpec ? 96 : 92) : isHighSpec ? 90 : 84,
        description:
          '東証プライム上場グループの業界最大手。独身証明・身元確実な真剣層が集まるため、安定した生活基盤と誠実さが圧倒的な成婚アドバンテージを生みます。',
        color: 'border-purple-500/40 text-purple-300 bg-purple-500/20',
      },
      {
        id: 'with',
        name: 'with（ウィズ）',
        category: '心理学・MBTI相性特化アプリ',
        url: 'https://with.is/',
        linkText: 'おすすめ：with（ウィズ）公式を見る',
        baseFit: isIntrovert || isFeeling || isUnder26 ? 94 : age <= 29 ? 89 : 81,
        description:
          '心理テストやMBTI性格診断に基づき、内面・価値観が本当に一致する異性とマッチング。誠実さや共感力を武器に深い関係を構築できます。',
        color: 'border-pink-500/40 text-pink-300 bg-pink-500/20',
      },
      {
        id: 'pairs',
        name: 'Pairs（ペアーズ）',
        category: '国内会員数No.1王道アプリ',
        url: 'https://pairs.lv/',
        linkText: 'おすすめ：Pairs（ペアーズ）公式を見る',
        baseFit: isUnder26 ? 91 : age <= 33 ? 88 : 83,
        description:
          '累計会員数2,000万人突破の国内最大級母集団。豊富なコミュニティ機能により、あなたの趣味やライフスタイルに合致する層を網羅的に開拓可能。',
        color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/20',
      },
      {
        id: 'zexy',
        name: 'ゼクシィ縁結び',
        category: 'リクルート運営・真剣婚活アプリ',
        url: 'https://zexy-enmusubi.net/',
        linkText: 'おすすめ：ゼクシィ縁結び公式を見る',
        baseFit: isOver32 ? 90 : age >= 27 ? 86 : 78,
        description:
          'リクルート運営で男女同額の真剣婚活アプリ。結婚を具体的に見据えた誠実な異性が多く、生活力や信頼性を重視する層から熱い支持を集めます。',
        color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/20',
      },
      {
        id: 'marrish',
        name: 'marrish（マリッシュ）',
        category: '大人の真剣婚活・再婚特化',
        url: 'https://marrish.com/',
        linkText: 'おすすめ：marrish（マリッシュ）公式を見る',
        baseFit: age >= 38 ? 93 : age >= 33 ? 85 : 72,
        description:
          '30代〜40代以降の落ち着いた大人の真剣婚活。再婚やシングル理解者も多く、人柄と包容力で勝負できる安心市場です。',
        color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/20',
      },
    ];

    // 適合度スコア順に降順ソートし、上位4件を抽出
    const sorted = [...allServices].sort((a, b) => b.baseFit - a.baseFit).slice(0, 4);

    const ranks = ['Sランク', 'Aランク', 'A-ランク', 'B+ランク'];
    const medals = ['🥇 1位', '🥈 2位', '🥉 3位', '🎖️ 4位'];
    const borderColors = [
      'border-amber-500/50 bg-amber-500/5',
      'border-purple-500/40 bg-purple-500/5',
      'border-pink-500/30 bg-pink-500/5',
      'border-slate-800 bg-slate-950/70',
    ];

    return sorted.map((item, index) => ({
      ...item,
      medal: medals[index],
      rank: ranks[index],
      fitScore: Math.min(97, Math.max(75, item.baseFit - index * 2 + Math.round((loveOverallScore % 5) - 2))),
      cardClass: borderColors[index],
    }));
  };

  const battlefieldRanking = getBattlefieldRanking();

  return (
    <div className="relative mt-8 rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950/70 backdrop-blur-xl shadow-2xl transition-all duration-500">
      {/* プレミアムヘッダー */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                Deep Analytics Report
              </span>
              {!isUnlocked && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  ✨ プレミアム限定データ
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>プレミアム深層レポート & 詳細分析</span>
              {isUnlocked && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  アンロック完了
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 未アンロック時のヘッダー直通CTAボタン */}
          {!isUnlocked && (
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>¥500 で詳細データを完全アンロック</span>
            </button>
          )}

          {/* 開発・テスト用クイックトグル */}
          <button
            onClick={() => {
              const next = !isUnlocked;
              setIsUnlocked(next);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, String(next));
              }
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isUnlocked ? '🔒 ロック状態をプレビュー' : '⚡ テスト即時アンロック'}
          </button>
        </div>
      </div>

      {/* レポートコンテンツエリア */}
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        {/* 1. 内包された詳細コンポーネント（カテゴリ別カード、総評、強みTOP5・伸びしろ） */}
        {typeof children === 'function' ? children({ isUnlocked }) : children}

        {/* 2. プレミアム専用①: 1,000人シミュレーション ＆ スペック無双 主戦場ランキング */}
        {(() => {
          const simContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 relative overflow-hidden transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              {/* 1,000人マッチング受容シミュレーション */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                      <span>同世代異性 1,000人マッチング受容シミュレーション</span>
                      {!isUnlocked && (
                        <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          🔒 プレミアム
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    母集団 1,000名
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  {/* 推定マッチング可能人数 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">推定マッチング可能人数</span>
                    {isUnlocked ? (
                      <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                        {estimatedMatchCount} <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-purple-300 filter blur-[4px] select-none font-mono">
                          {estimatedMatchCount}
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                        <span className="text-xs text-amber-400 ml-1">🔒</span>
                      </div>
                    )}
                  </div>

                  {/* 市場受容率（モテ許容度） */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">市場受容率（モテ許容度）</span>
                    {isUnlocked ? (
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {matchRate}%
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-400/80 filter blur-[4px] select-none font-mono">
                          {matchRate}%
                        </span>
                        <span className="text-xs text-amber-400 ml-1">🔒</span>
                      </div>
                    )}
                  </div>

                  {/* マッチング優位性ランク */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">マッチング優位性ランク</span>
                    {isUnlocked ? (
                      <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                        {loveOverallScore >= 90 ? 'S (超引く手あまた)' : loveOverallScore >= 80 ? 'A (強者ポジション)' : loveOverallScore >= 70 ? 'B+ (優勢)' : 'B (標準)'}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-xl sm:text-2xl font-black text-amber-300/80 filter blur-[4px] select-none font-mono">
                          {loveOverallScore >= 90 ? 'S (超引く手あまた)' : loveOverallScore >= 80 ? 'A (強者ポジション)' : 'B+ (優勢)'}
                        </span>
                        <span className="text-xs text-amber-400 ml-1">🔒</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* スペック無双 主戦場ランキング（市場別適合度 S/A/B & アフィリエイト直結） */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs sm:text-sm font-extrabold text-white">
                      あなたのスペックが最も無双できる「主戦場ランキング（市場別適合度）」
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">市場適合度分析</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {battlefieldRanking.map((service) => (
                    <div
                      key={service.id}
                      className={`p-3.5 rounded-xl border space-y-2 relative overflow-hidden transition-all duration-300 ${service.cardClass}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${service.color}`}>
                          {service.medal}：{service.name}
                        </span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          適合度 {service.fitScore}% ({service.rank})
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        【{service.category}】
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {service.description}
                      </p>
                      <div className="pt-1">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-300 hover:text-amber-200 underline decoration-amber-400/60 underline-offset-2"
                        >
                          <span>{service.linkText}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして主戦場ランキングを開示">
                {simContent}
              </Link>
            );
          }
          return simContent;
        })()}

        {/* 3. プレミアム専用②: あなたに最も惹かれやすい異性の特徴（7大ディメンション） */}
        {(() => {
          const matchContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたに最も惹かれやすい異性の特徴・相性データ（全7項目）</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* 1. 年齢層 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      1
                    </span>
                    <span>支持率の高い年齢層</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-base sm:text-lg font-black text-white tracking-tight font-mono">{targetPartnerAgeRange}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-base sm:text-lg font-black text-slate-300 filter blur-[3px] select-none font-mono">{targetPartnerAgeRange}</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">同世代・近似層からの需要が最多</p>
                </div>

                {/* 2. 年収層 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      2
                    </span>
                    <span>相性の良い相手の年収層</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-base sm:text-lg font-black text-emerald-400 tracking-tight font-mono">
                        {gender === 'FEMALE' ? '年収 700万〜1,500万円' : '年収 400万〜700万円'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-base sm:text-lg font-black text-emerald-400/80 filter blur-[3px] select-none font-mono">年収 700万〜1,500万円</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">価値観・生活水準の均衡ゾーン</p>
                </div>

                {/* 3. MBTI */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      3
                    </span>
                    <span>惹かれやすいMBTI特性</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 tracking-tight font-mono">
                        INFP / ENFP / INFJ / ISFJ
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-black text-pink-300 filter blur-[3px] select-none font-mono">INFP / ENFP / INFJ</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">心理的補完関係・共感度最大化</p>
                </div>

                {/* 4. 職業・業界 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      4
                    </span>
                    <span>相性の良い職業・業界</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        {gender === 'FEMALE' ? '総合商社・外資系・医師/士業・IT大手' : '大手総合職・専門職・教育/士業・クリエイター'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[3px] select-none">大手総合職・士業・IT専門職</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">知的好奇心と生活リズムが合致</p>
                </div>

                {/* 5. 学歴・知性水準 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      5
                    </span>
                    <span>相手の学歴・知性水準</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        大学卒以上（難関大・国公立・MARCH等）
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[3px] select-none">大卒以上（知的対話を好む層）</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">会話のテンポ・論理感が噛み合う層</p>
                </div>

                {/* 6. 恋愛観・タイプ */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      6
                    </span>
                    <span>惹かれやすい恋愛観タイプ</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        相互自立型 ＆ 心を開くと甘え上手
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[3px] select-none">相互自立型 ＆ 誠実タイプ</p>
                        <span className="text-xs text-amber-400">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">過度な束縛を嫌い、尊敬で結ばれる</p>
                </div>

                {/* 7. 一番刺さる武器 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-950/80 border border-pink-500/40 sm:col-span-2 md:col-span-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-pink-300">
                    <span className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-200 flex items-center justify-center text-[10px] font-black shrink-0">
                      7
                    </span>
                    <span>あなたの一番刺さる武器・魅力（決定打）</span>
                  </div>
                  {isUnlocked ? (
                    <p className="text-xs sm:text-sm text-white font-bold leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-pink-500/20">
                      「第一印象の清潔感・知性」と「2人きりになった時の安心感・包容力」のギャップ。相手が自然体でいられる居心地の良さが最大の決定打となります。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs sm:text-sm text-slate-300 filter blur-[3px] select-none">第一印象の清潔感と知性のギャップによる安心感が最大の決定打となります。</p>
                      <span className="text-xs text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして惹かれやすい異性の特徴を開示">
                {matchContent}
              </Link>
            );
          }
          return matchContent;
        })()}

        {/* 4. プレミアム専用③: あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」（新設） */}
        {(() => {
          const landmineContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-rose-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-rose-300/80">時間を無駄にしないための防衛データ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                {/* ワースト1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 1
                    </span>
                    <span className="text-[10px] text-slate-400">テイカー気質</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">自己肯定感搾取・情緒不安定タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      あなたの気遣いやスペックを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。感謝の言葉が極端に少なく愚痴が多い場合は即座に距離を置くべきです。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">あなたの気遣いを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>

                {/* ワースト2 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 2
                    </span>
                    <span className="text-[10px] text-slate-400">経済観不一致</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">見栄消費・金銭感覚乖離タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      実力や収入に見合わない生活水準を誇示し、中長期の資産形成や自己投資に理解がない相手。初回デートでの過剰な高級志向が見極めサインです。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">実力に見合わない生活水準を誇示し、資産形成や自己投資に理解がない相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>

                {/* ワースト3 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      ⚠️ ワースト 3
                    </span>
                    <span className="text-[10px] text-slate-400">成長阻害</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white block">過度な束縛・知性軽視タイプ</span>
                  {isUnlocked ? (
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      仕事や自己成長への熱意に理解を示さず、連絡頻度や行動を過度に制限しようとする相手。深い議論や相談を茶化す傾向があります。
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-slate-400 text-[11px] filter blur-[3px] select-none">自己成長に理解を示さず、行動を過度に制限しようとする相手。</p>
                      <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして地雷異性タイプを開示">
                {landmineContent}
              </Link>
            );
          }
          return landmineContent;
        })()}

        {/* 5. プレミアム専用④: スペック引き上げ具体的ロードマップ（全6カテゴリ改善インパクト視覚化） */}
        {(() => {
          // 各カテゴリの改善ポテンシャルを現在のスコアから動的算出
          const bodyScoreVal = result.categoryScores?.body || 60;
          const ecoScoreVal = result.categoryScores?.economic || 60;
          const carScoreVal = result.categoryScores?.career || 60;
          const acaScoreVal = result.categoryScores?.academic || 60;
          const socScoreVal = result.categoryScores?.social || 50;
          const gloScoreVal = result.categoryScores?.ability || 50;

          const bodyPotential = Math.max(1.5, Math.min(8.0, Math.round(((100 - bodyScoreVal) * 0.12) * 10) / 10));
          const ecoPotential = Math.max(2.0, Math.min(9.0, Math.round(((100 - ecoScoreVal) * 0.14) * 10) / 10));
          const carPotential = Math.max(1.5, Math.min(6.5, Math.round(((100 - carScoreVal) * 0.10) * 10) / 10));
          const acaPotential = Math.max(1.0, Math.min(5.0, Math.round(((100 - acaScoreVal) * 0.08) * 10) / 10));
          const socPotential = Math.max(1.5, Math.min(7.0, Math.round(((100 - socScoreVal) * 0.12) * 10) / 10));
          const gloPotential = Math.max(1.5, Math.min(6.0, Math.round(((100 - gloScoreVal) * 0.10) * 10) / 10));

          const totalPotentialPt = (
            bodyPotential +
            ecoPotential +
            carPotential +
            acaPotential +
            socPotential +
            gloPotential
          ).toFixed(1);

          const actionContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>スペック総合値をあと 最大 +{totalPotentialPt}pt 引き上げる具体的ロードマップ</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">全6カテゴリ改善インパクト連動</span>
              </div>

              {/* 全6カテゴリの改善インパクト視覚化バー */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>多角比較 6カテゴリ別 改善余地インパクト</span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">最大 +{totalPotentialPt}pt の総合上昇ポテンシャル</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">身体 (BODY)</span>
                      <span className="text-emerald-400 font-black font-mono">+{bodyPotential.toFixed(1)}pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((bodyPotential / 8.0) * 100)))}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">年収・資産 (INCOME)</span>
                      <span className="text-amber-400 font-black font-mono">+{ecoPotential.toFixed(1)}pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((ecoPotential / 9.0) * 100)))}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">キャリア (CAREER)</span>
                      <span className="text-indigo-400 font-black font-mono">+{carPotential.toFixed(1)}pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((carPotential / 6.5) * 100)))}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">学歴・知性 (ACADEMIC)</span>
                      <span className="text-purple-400 font-black font-mono">+{acaPotential.toFixed(1)}pt 活用余地</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((acaPotential / 5.0) * 100)))}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">SNS・影響力 (SOCIAL)</span>
                      <span className="text-pink-400 font-black font-mono">+{socPotential.toFixed(1)}pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-pink-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((socPotential / 7.0) * 100)))}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-300">グローバル (GLOBAL)</span>
                      <span className="text-cyan-400 font-black font-mono">+{gloPotential.toFixed(1)}pt 伸びしろ</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(95, Math.max(25, Math.round((gloPotential / 6.0) * 100)))}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* タイムライン別 3ステップ アクション */}
              <div className="space-y-3 text-xs">
                {/* STEP 1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-black text-[10px] shrink-0 border border-purple-500/30">
                    短期（即日〜2週）
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="font-extrabold text-white text-xs sm:text-sm block">清潔感・写真クオリティの最適化 (+3〜5pt)</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        自然光・他撮り風の清潔感あるプロフィール写真を設定することで、第一印象と清潔感の評価が即時確定加算されます。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">自然光の清潔感ある写真を設定することで即座にスコアが加算されます。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-black text-[10px] shrink-0 border border-indigo-500/30">
                    中期（1〜3ヶ月）
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="font-extrabold text-white text-xs sm:text-sm block">体型黄金比化 ＆ 習慣チューニング (+5〜8pt)</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        体脂肪率を理想基準（男性14% / 女性21%）へあと2〜3%近づけ、睡眠・運動の生活習慣を最適化。身体スコアと第一印象の評価が大幅に跳ね上がります。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">体脂肪率を理想基準へ近づけることで身体スコアが大幅に跳ね上がります。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black text-[10px] shrink-0 border border-emerald-500/30">
                    長期（半年〜1年）
                  </span>
                  <div className="flex-1 space-y-1">
                    <span className="font-extrabold text-white text-xs sm:text-sm block">不可変アセット・キャリア資産の底上げ (+10pt以上)</span>
                    {isUnlocked ? (
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        年収アップ転職や役職昇進、語学（TOEIC800+）や難関資格の取得により、生涯にわたって崩れない同世代トップ1%クラスの強固なステータスを確立します。
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 filter blur-[3px] select-none text-[11px]">キャリアアップと知性アセットの獲得により生涯の独自ポジションを確立します。</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0">🔒 開示</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして改善ロードマップを開示">
                {actionContent}
              </Link>
            );
          }
          return actionContent;
        })()}

        {/* 6. プレミアム専用⑤: パーソナライズ「即コピペで使える最強自己PR文章」（新設） */}
        {(() => {
          const prContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>パーソナライズ「即コピペで使える最強プロフィール文章」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        🔒 プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-indigo-300">マッチングアプリ・婚活特化フォーマット</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* パターンA: 恋活・マッチングアプリ用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      パターンA: 恋活・マッチングアプリ用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyAppBio}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-bold text-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedApp ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono select-all">
                      {profileAppText}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[3px] select-none">
                      {profileAppText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">誠実さ・知性・親しみやすさを黄金比率で両立</span>
                </div>

                {/* パターンB: 真剣婚活・結婚相談所用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      パターンB: 真剣婚活・結婚相談所用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyMarriageBio}
                        className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-[11px] font-bold text-pink-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedMarriage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMarriage ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono select-all">
                      {profileMarriageText}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[3px] select-none">
                      {profileMarriageText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">生活基盤の安定感・将来像の信頼性を訴求</span>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックしてプロフィール文章を開示">
                {prContent}
              </Link>
            );
          }
          return prContent;
        })()}

        {/* 7. 未アンロック時の最下部総合CTAカード */}
        {!isUnlocked && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900/95 to-indigo-950/80 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/50 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 mx-auto flex items-center justify-center shadow-xl shadow-purple-600/40">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-lg sm:text-xl font-black text-white">
                プレミアム深層レポート ＆ 完全データ開示
              </h4>
              <p className="text-xs text-slate-300">
                1回買い切り ¥500（月額課金・追加費用なし）で、あなたの強み・主戦場・相性・ロードマップを完全開示
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left text-xs text-slate-300 py-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>主戦場ランキング ＆ 1,000人受容</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>好かれやすい異性の特徴 (全7項目)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>相性最悪な地雷異性タイプ ワースト3</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>6カテゴリ改善ロードマップ ＆ 自己PR文章</span>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Link
                href={`/purchase/${diagnosisId}`}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer"
              >
                <Unlock className="w-5 h-5" />
                <span>¥500 で詳細データを完全アンロック</span>
                <ChevronRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Apple Pay / Google Pay / カード対応
                </span>
                <span>•</span>
                <span>買い切り・即時反映</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
