'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  labelJa: string;
  labelEn: string;
  score: number;
  topPercent?: number | null;
  colorTheme?: 'violet' | 'rose';
  isLocked?: boolean;
  diagnosisId?: string;
}

export default function CategoryCard({ labelJa, labelEn, score, topPercent, colorTheme, isLocked = false, diagnosisId }: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.35, rootMargin: '0px 0px -80px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTimestamp: number | null = null;
    const duration = 1300; // 1.3s smooth count up animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const current = easedProgress * score;
      setDisplayScore(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score, hasAnimated]);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (displayScore / 100) * circumference;

  // 4-Tier Dynamic Color System (Elite >= 90 / High 70-89 / Normal 40-69 / Low < 40)
  const isElite = !isLocked && score >= 90;
  const isHigh = !isLocked && score >= 70 && score < 90;
  const isLow = !isLocked && score < 40;

  // Stroke color for ring (When locked, use unified mystery gradient glow to prevent score leakage)
  const strokeColor = isLocked
    ? '#a855f7' // Unified Purple/Violet for mystery locked state
    : isElite
    ? '#f59e0b' // Gold / Amber for Elite Score (90+)
    : isHigh
    ? '#10b981' // Emerald Green for High Score (70-89)
    : isLow
    ? '#f43f5e' // Rose Red for Low Score (<40)
    : colorTheme === 'rose'
    ? '#fb7185' // Rose Pink for Love Normal
    : '#8b5cf6'; // Violet for Japan Normal

  // Dynamic glow drop shadow filter
  const ringGlowClass = isLocked
    ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]'
    : isElite
    ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    : isHigh
    ? 'drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
    : isLow
    ? 'drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]'
    : colorTheme === 'rose'
    ? 'drop-shadow-[0_0_6px_rgba(251,113,133,0.3)]'
    : 'drop-shadow-[0_0_6px_rgba(139,92,246,0.3)]';

  // Text color for score value
  const scoreTextColor = isElite
    ? 'text-amber-300 font-black'
    : isHigh
    ? 'text-emerald-400 font-black'
    : isLow
    ? 'text-rose-400 font-black'
    : colorTheme === 'rose'
    ? 'text-rose-300 font-black'
    : 'text-indigo-300 font-black';

  // Badge style for TOP %
  const badgeStyle = isElite
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
    : isHigh
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    : isLow
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : colorTheme === 'rose'
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

  // Hover border glow & Card shadow (Unified when locked)
  const borderHoverStyle = isLocked
    ? 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]'
    : isElite
    ? 'hover:border-amber-500/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)] border-amber-500/30'
    : isHigh
    ? 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
    : isLow
    ? 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]'
    : colorTheme === 'rose'
    ? 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(251,113,133,0.25)]'
    : 'hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]';

  const cardContent = (
    <div ref={cardRef} className={`glass-surface rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 ${borderHoverStyle} ${isLocked ? 'cursor-pointer hover:border-purple-500/80 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]' : ''}`}>
      <div className="flex flex-col items-center mb-2">
        <span className="text-xs font-black text-slate-100 group-hover:text-white transition-colors">{labelJa}</span>
        <span className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">{labelEn}</span>
      </div>

      {/* Mini Donut Circle with Dynamic Glow & Obfuscation */}
      <div className="relative w-16 h-16 flex items-center justify-center mb-2">
        {isLocked ? (
          /* ロック時: ゲージの長さ・色からの点数推測を完全防止するシマーサークル */
          <div className="relative w-full h-full flex items-center justify-center">
            <svg className="w-full h-full animate-spin [animation-duration:8s] overflow-visible filter blur-[2px]" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="url(#lockedGradient)"
                strokeWidth="5"
                strokeDasharray={`${circumference * 0.4} ${circumference * 0.1}`}
                strokeLinecap="round"
                fill="none"
                className="filter drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]"
              />
              <defs>
                <linearGradient id="lockedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* 中央のすりガラス＆ロックアイコン */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-md border border-purple-500/40 flex flex-col items-center justify-center shadow-inner group-hover:border-purple-400/70 transition-colors">
                <div className="flex items-baseline gap-0.5 -mt-0.5">
                  <span className="text-[11px] font-black text-purple-200 font-mono tracking-tight">??.?</span>
                  <span className="text-[8px] font-extrabold text-purple-400">pt</span>
                </div>
                <span className="text-[9px] text-amber-400 leading-none mt-0.5">🔒</span>
              </div>
            </div>
          </div>
        ) : (
          /* アンロック時: 正確なスコアゲージと数値を表示 */
          <>
            <svg className="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="30"
                cy="30"
                r={radius}
                stroke={strokeColor}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                fill="none"
                className={`filter ${ringGlowClass}`}
              />
            </svg>
            <span className={`absolute text-sm sm:text-base ${scoreTextColor} tracking-tight font-black flex items-baseline gap-0.5`}>
              {Math.round(displayScore * 10) / 10}
              <span className="text-[9px] font-bold text-slate-400">pt</span>
            </span>
          </>
        )}
      </div>

      {/* Top Percent Badge */}
      {isLocked ? (
        <span className="shrink-0 whitespace-nowrap text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1 shadow-sm group-hover:bg-purple-900/80 group-hover:border-purple-400/60 transition-colors">
          <span>上位</span>
          <span className="font-mono font-black text-purple-200">??%</span>
          <span className="text-[8px] text-amber-400">🔒</span>
        </span>
      ) : topPercent !== undefined && topPercent !== null && topPercent <= 50 ? (
        <span className={`shrink-0 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${badgeStyle}`}>
          上位 {topPercent}%
        </span>
      ) : (
        <div className="h-5" />
      )}
    </div>
  );

  if (isLocked && diagnosisId) {
    return (
      <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして詳細データをアンロック">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
