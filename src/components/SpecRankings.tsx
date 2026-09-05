'use client';

import { MetricScoreResult, DiagnosisInputV3 } from '@/types/spec-check';
import { scoreToTopPercent, calcHighPrecisionTopPercent } from '@/lib/score-engine/math-utils';
import { Trophy, AlertCircle, TrendingUp } from 'lucide-react';
import InputDataModal from '@/components/InputDataModal';

interface SpecRankingsProps {
  metrics: MetricScoreResult[];
  isLoveMode?: boolean;
  rawInput?: DiagnosisInputV3 | null;
}

export default function SpecRankings({ metrics, isLoveMode = false, rawInput }: SpecRankingsProps) {
  // 恋愛関連項目の判定
  const isRomanceMetric = (m: MetricScoreResult) => {
    if (m.metricCode === 'LOVE_AGE' || m.metricCode === 'FAMILY') return true;
    if (m.category === '恋愛' || m.category === '恋愛市場') return true;
    if (m.metricName.includes('恋愛') || m.metricName.includes('婚姻') || m.metricName.includes('家庭')) return true;
    return false;
  };

  // ユーザーが明示的に自分で入力した確定指標のみを対象に強み・伸びしろをランキング算出
  const validMetrics = metrics.filter(m => {
    // 1. isOptionalUnentered (未入力のオプション項目) フラグのあるものは完全除外
    if (m.isOptionalUnentered) return false;

    // 2. rawValue が null / undefined のもの、単なる素データ項目(WEIGHT等)は除外
    if (m.rawValue === null || m.rawValue === undefined) return false;
    if (m.datasetName === '未入力') return false;
    if (m.metricCode === 'WEIGHT') return false; // 体重単体は「体型(BMI/FFMI)」に内包されるため独立ランキング除外

    const rawStr = String(m.rawValue);
    if (rawStr.startsWith('未入力') || rawStr.startsWith('未選択')) return false;

    // 3. 総合スペック診断モード(isLoveMode = false)の場合、恋愛関連項目を完全除外
    if (!isLoveMode && isRomanceMetric(m)) {
      return false;
    }

    // 4. 念のためのテキスト補完除外
    if (m.metricCode === 'BODY_FAT' && (rawStr.includes('未入力') || rawStr.includes('重み再正規化'))) return false;
    if (m.metricCode === 'IQ' && (rawStr.includes('学歴推計') || rawStr.includes('自動推計'))) return false;
    if (m.metricCode === 'SNS' && (rawStr.includes('未運用') || rawStr.includes('なし'))) return false;
    if (m.metricCode === 'LANGUAGE' && (rawStr.includes('日本語のみ') || rawStr.includes('対象外'))) return false;
    if (m.metricCode === 'TRAVEL' && (rawStr.includes('0か国') || rawStr.includes('渡航歴なし'))) return false;

    return true;
  });

  const sortedByScore = [...validMetrics].sort((a, b) => b.score - a.score);

  const topStrengths = sortedByScore.slice(0, 5);

  // 後から努力や工夫で変更・改善できない項目（身長・学歴・年齢・性別など）は伸びしろ・改善エリアから完全除外
  const UNCHANGEABLE_METRIC_CODES = new Set([
    'HEIGHT',
    'ACADEMIC',
    'ACADEMIC_DEGREE',
    'ACADEMIC_BACKGROUND',
    'UNIVERSITY',
    'AGE',
    'LOVE_AGE',
  ]);

  const improvableMetrics = sortedByScore.filter(m => 
    !UNCHANGEABLE_METRIC_CODES.has(m.metricCode) && 
    !m.metricName.includes('学歴') && 
    !m.metricName.includes('大学') &&
    !m.metricName.includes('身長') &&
    !m.metricName.includes('年齢')
  );
  const weakPoints = (improvableMetrics.length > 0 ? improvableMetrics : sortedByScore.filter(m => !UNCHANGEABLE_METRIC_CODES.has(m.metricCode)))
    .slice(-3)
    .reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* 強みのあるスペック TOP 5 */}
      <div className="glass-surface glass-surface-glow rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-100">
                強みのあるスペック TOP 5
              </h3>
              <p className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                YOUR STRONGEST SPECS
              </p>
            </div>
          </div>
          {rawInput && (
            <InputDataModal input={rawInput} />
          )}
        </div>

        <div className="space-y-3">
          {topStrengths.map((item, idx) => (
            <div
              key={item.metricCode}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition-all space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-black text-amber-400 shrink-0 w-5">0{idx + 1}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-100 leading-snug break-words">
                  {item.metricName}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 pl-7 sm:pl-0 shrink-0">
                {(() => {
                  const rawTop = (item.topPercent !== null && item.topPercent !== undefined && item.topPercent > 0)
                    ? item.topPercent
                    : scoreToTopPercent(item.score);
                  const topPct = calcHighPrecisionTopPercent(rawTop);
                  return (
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 whitespace-nowrap">
                      上位 {topPct}%
                    </span>
                  );
                })()}
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-300 border border-slate-700/80 whitespace-nowrap">
                  {item.score} POINT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 伸びしろ・改善エリア */}
      <div className="glass-surface rounded-3xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-slate-100">
              伸びしろ・改善エリア
            </h3>
            <p className="text-[10px] font-bold tracking-wider uppercase text-rose-400">
              YOUR WEAK POINTS
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {weakPoints.map((item, idx) => (
            <div
              key={item.metricCode}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 transition-all space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-200 leading-snug break-words">
                  {item.metricName}
                </span>
              </div>
              <div className="flex items-center justify-end pl-6 sm:pl-0 shrink-0">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                  {item.score} POINT
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
