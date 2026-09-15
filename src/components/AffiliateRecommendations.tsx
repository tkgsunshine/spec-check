'use client';

import React from 'react';
import { AFFILIATE_MASTER, AffiliateItem } from '@/lib/config/affiliate-config';
import { Heart, Sparkles, Briefcase, Shield, TrendingUp, ExternalLink, Award } from 'lucide-react';

interface AffiliateRecommendationsProps {
  activeTab: 'JAPAN' | 'LOVE';
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  loveOverallScore: number;
  annualIncome?: number;
  economicScore?: number;
  maritalStatus?: string | null;
}

export default function AffiliateRecommendations({
  activeTab,
  gender,
  age,
  loveOverallScore,
  annualIncome = 0,
  economicScore = 50,
  maritalStatus,
}: AffiliateRecommendationsProps) {
  // ユーザーのスペックに合致する案件をフィルタリング & 最適順にソート
  const filteredItems = AFFILIATE_MASTER.filter((item) => {
    const { targetCriteria } = item;

    // タブの親和性フィルタ
    if (activeTab === 'LOVE' && item.category === 'CAREER') return false;
    if (activeTab === 'JAPAN' && (item.category === 'LOVE_APP' || item.category === 'LOVE_AGENT')) return false;

    // 性別
    if (targetCriteria.genders && gender !== 'OTHER' && !targetCriteria.genders.includes(gender as any)) {
      return false;
    }
    // 年齢
    if (targetCriteria.minAge && age < targetCriteria.minAge) return false;
    if (targetCriteria.maxAge && age > targetCriteria.maxAge) return false;
    // 恋愛スコア
    if (targetCriteria.minLoveScore && loveOverallScore < targetCriteria.minLoveScore) return false;
    if (targetCriteria.maxLoveScore && loveOverallScore > targetCriteria.maxLoveScore) return false;
    // 年収
    if (targetCriteria.minAnnualIncome && annualIncome < targetCriteria.minAnnualIncome) return false;
    // 経済スコア
    if (targetCriteria.minEconomicScore && economicScore < targetCriteria.minEconomicScore) return false;
    // 婚姻ステータス
    if (targetCriteria.maritalStatusWhiteList && maritalStatus && !targetCriteria.maritalStatusWhiteList.includes(maritalStatus)) {
      return false;
    }

    return true;
  }).slice(0, 3); // 最大3件を厳選表示

  if (filteredItems.length === 0) {
    return null;
  }

  const renderIcon = (iconName: AffiliateItem['iconName']) => {
    switch (iconName) {
      case 'heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'briefcase': return <Briefcase className="w-5 h-5 text-cyan-400" />;
      case 'shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'trending-up': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      default: return <Award className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            {activeTab === 'LOVE' ? 'あなたの恋愛スペックが最も活きる推奨ステージ' : 'あなたの市場価値・キャリアに適合する推奨サービス'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            同世代の母集団データに基づき、あなたの強みやステータスが最も有利に評価される場を厳選提案
          </p>
        </div>
        <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 self-start sm:self-auto">
          パーソナライズ選定
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-sm"
          >
            {/* 上部バッジ */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  {renderIcon(item.iconName)}
                  {item.badgeText}
                </span>
                <span className="text-[10px] text-indigo-300/80 font-mono font-bold">MATCHED</span>
              </div>

              <h4 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors mb-1.5">
                {item.name}
              </h4>

              <p className="text-xs font-bold text-slate-200 leading-snug mb-2">
                {item.headline}
              </p>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            {/* 下部 CTA */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{item.rewardTypeLabel}</span>
              </div>

              <a
                href={item.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${item.accentGradient} text-white font-black text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-md hover:opacity-95 active:scale-[0.98] cursor-pointer`}
              >
                <span>{item.ctaButtonText}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right">
        <span className="text-[10px] text-slate-400">
          ※ 掲載サービスへの登録・初期相談は無料で行えます（提携先公式ページへ遷移します）
        </span>
      </div>
    </div>
  );
}
