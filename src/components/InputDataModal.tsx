'use client';

import { useState } from 'react';
import { DiagnosisInputV3 } from '@/types/spec-check';
import { X, FileText, User, Heart, Landmark, GraduationCap, Briefcase, Share2, Globe, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface InputDataModalProps {
  input: DiagnosisInputV3;
}

export default function InputDataModal({ input }: InputDataModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const genderText = input.gender === 'MALE' ? '男性' : input.gender === 'FEMALE' ? '女性' : 'その他';

  const maritalStatusText = (status?: string | null) => {
    if (status === 'SINGLE') return '未婚';
    if (status === 'MARRIED') return '既婚';
    if (status === 'DIVORCED') return '離婚歴あり';
    if (status === 'BEREAVED') return '死別';
    return '未入力';
  };

  const faceRatingText = (rating?: string | null) => {
    if (rating === 'MODEL_LEVEL') return 'モデル・芸能人級 (S)';
    if (rating === 'ABOVE_AVERAGE') return '中の上・爽やか・美人 (A)';
    if (rating === 'AVERAGE') return '標準・普通 (B)';
    if (rating === 'BELOW_AVERAGE') return '控えめ・個性派 (C)';
    return '未判定';
  };

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return '入力なし';
    if (val === 0) return '0万円';
    if (val >= 10000) {
      const oku = Math.floor(val / 10000);
      const man = val % 10000;
      return man > 0 ? `${oku}億${man}万円` : `${oku}億円`;
    }
    return `${val}万円`;
  };

  return (
    <>
      {/* トリガーリンク / ボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-400 transition-all bg-indigo-950/40 hover:bg-indigo-900/60 px-3.5 py-1.5 rounded-full border border-indigo-800/50 shadow-sm"
      >
        <FileText className="w-4 h-4 text-indigo-400" />
        <span>入力データを見る</span>
        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
      </button>

      {/* モーダルオーバーレイ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">診断入力データ一覧</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    INPUT PARAMETERS SUMMARY
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* モーダルコンテンツ (スクロールエリア) */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* 基本プロフィール */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4" /> 基本情報
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">ニックネーム</span>
                    <span className="font-bold text-slate-200">{input.nickname || 'あなた'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">性別 / 年齢</span>
                    <span className="font-bold text-slate-200">{genderText} / {input.age}歳</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">居住都道府県</span>
                    <span className="font-bold text-slate-200">{input.prefectureName}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">身長 / 体重</span>
                    <span className="font-bold text-slate-200">{input.height} cm / {input.weight} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">体脂肪率</span>
                    <span className="font-bold text-slate-200">{input.bodyFat ? `${input.bodyFat}%` : '未入力'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">外見・容姿自己評価</span>
                    <span className="font-bold text-slate-200">{faceRatingText(input.faceRating)}</span>
                  </div>
                </div>
              </div>

              {/* 経済・資産 */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Landmark className="w-4 h-4" /> 年収・純資産データ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">額面年収</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(input.annualIncome)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">金融資産 (預貯金・株)</span>
                    <span className="font-bold text-slate-200">{formatCurrency(input.financialAssets)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">不動産・マイカー・腕時計</span>
                    <span className="font-bold text-slate-200">
                      {formatCurrency((input.realEstateAssets || 0) + (input.carAssets || 0) + (input.watchAssets || 0) + (input.otherAssets || 0))}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-3">
                    <span className="text-slate-500 block text-[10px]">各種負債 (住宅・マイカー・奨学金等)</span>
                    <span className="font-bold text-rose-300">
                      {formatCurrency((input.mortgageDebt || 0) + (input.carDebt || 0) + (input.scholarshipDebt || 0) + (input.otherDebt || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* 学歴・キャリア */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <GraduationCap className="w-4 h-4" /> 学歴・知性・キャリア
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">最終学歴 / 出身大学名</span>
                    <span className="font-bold text-slate-200">
                      {input.universityName ? `${input.universityName}` : input.academicDegree || '未入力'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">IQ (智力指標)</span>
                    <span className="font-bold text-slate-200">{input.iqScore ? `IQ ${input.iqScore}` : '自動推計'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-1 sm:col-span-2">
                    <span className="text-slate-500 block text-[10px]">勤務先・職種・役職</span>
                    <span className="font-bold text-slate-200">
                      {input.companyName ? `${input.companyName} / ` : ''}{input.occupationCode || '未指定'} ({input.positionCode || '一般職'})
                    </span>
                  </div>
                </div>
              </div>

              {/* SNS・グローバル・パートナーシップ */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Globe className="w-4 h-4" /> SNS・語学・恋愛観
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">SNS 総フォロワー数</span>
                    <span className="font-bold text-slate-200">
                      {((input.instagramFollowers || 0) + (input.xFollowers || 0) + (input.tikTokFollowers || 0) + (input.youTubeFollowers || 0)).toLocaleString()} 人
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">海外渡航歴</span>
                    <span className="font-bold text-slate-200">{input.travelCount ? `${input.travelCount} か国` : '渡航歴なし'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">婚姻状況 / 子ども</span>
                    <span className="font-bold text-slate-200">
                      {maritalStatusText(input.maritalStatus)} {input.childrenCount ? `(子${input.childrenCount}人)` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
              <span className="text-slate-400 text-xs font-medium hidden sm:inline">
                ※ 入力内容を修正したい場合は再診断へお進みください。
              </span>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4" /> データを修正して再診断
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
