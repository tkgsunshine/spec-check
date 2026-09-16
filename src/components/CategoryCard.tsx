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
  const isElite = score >= 90;
  const isHigh = score >= 70 && score < 90;
  const isLow = score < 40;

  // Stroke color for ring
  const strokeColor = isElite
    ? '#f59e0b' // Gold / Amber for Elite Score (90+)
    : isHigh
    ? '#10b981' // Emerald Green for High Score (70-89)
    : isLow
    ? '#f43f5e' // Rose Red for Low Score (<40)
    : colorTheme === 'rose'
    ? '#fb7185' // Rose Pink for Love Normal
    : '#8b5cf6'; // Violet for Japan Normal

  // Dynamic glow drop shadow filter
  const ringGlowClass = isElite
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

  // Hover border glow & Card shadow
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
    <div
      ref={cardRef}
      className={`glass-surface rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 ${borderHoverStyle} ${
        isLocked ? 'cursor-pointer hover:border-purple-500/80 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]' : ''
      }`}
    >
      <div className="flex flex-col items-center mb-2">
        <span className="text-xs font-black text-slate-100 group-hover:text-white transition-colors">{labelJa}</span>
        <span className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">{labelEn}</span>
      </div>

      {/* Mini Donut Circle with Dynamic Glow: Shows actual score */}
      <div className="relative w-16 h-16 flex items-center justify-center mb-2">
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
        <span className={`absolute text-sm sm:text-base ${scoreTextColor} tracking-tight font-black`}>
          {Math.round(displayScore * 10) / 10}
        </span>
      </div>

      {/* Top Percent Badge (Locked vs Unlocked) */}
      {isLocked ? (
        <div className="w-full mt-1.5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-purple-950/95 via-indigo-950/90 to-pink-950/95 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.35)] flex flex-col items-center justify-center group-hover:border-pink-400/80 group-hover:shadow-[0_0_18px_rgba(236,72,153,0.5)] group-hover:from-purple-900 group-hover:to-pink-900 transition-all">
          <div className="flex items-center justify-center gap-1 leading-none">
            <span className="text-[10px] font-black text-slate-300">上位</span>
            <span className="text-xs sm:text-sm font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-amber-300 tracking-tight">
              ??%
            </span>
            <span className="text-xs text-amber-300 animate-pulse ml-0.5">🔒</span>
          </div>
          <span className="text-[9px] font-extrabold text-purple-300 group-hover:text-amber-300 transition-colors tracking-tight mt-0.5">
            タップで順位開示
          </span>
        </div>
      ) : (
        <div className={`w-full mt-1.5 py-1 px-2 rounded-xl border flex flex-col items-center justify-center ${badgeStyle}`}>
          <span className="text-[8px] font-extrabold uppercase tracking-tight opacity-75">同世代順位</span>
          <span className="text-xs font-black tracking-tight">上位 {topPercent ?? 50}%</span>
        </div>
      )}
    </div>
  );

  if (isLocked && diagnosisId) {
    return (
      <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして同世代順位（上位%）をアンロック">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
