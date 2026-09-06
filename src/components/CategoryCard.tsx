'use client';

import { useEffect, useRef, useState } from 'react';

interface CategoryCardProps {
  labelJa: string;
  labelEn: string;
  score: number;
  topPercent?: number | null;
  colorTheme?: 'violet' | 'rose';
}

export default function CategoryCard({ labelJa, labelEn, score, topPercent, colorTheme }: CategoryCardProps) {
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
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s count up animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // EaseOutCubic
      const current = Math.round(easedProgress * score * 10) / 10;
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

  // 3-Tier Dynamic Color System (High >= 70 / Normal 40-69 / Low < 40)
  const isHigh = score >= 70;
  const isLow = score < 40;

  // Stroke color for ring
  const strokeColor = isHigh
    ? '#10b981' // Emerald Green for High Score (70+)
    : isLow
    ? '#f43f5e' // Rose Red for Low Score (<40)
    : colorTheme === 'rose'
    ? '#fb7185' // Rose Pink for Love Normal
    : '#8b5cf6'; // Violet for Japan Normal

  // Text color for score value
  const scoreTextColor = isHigh
    ? 'text-emerald-400'
    : isLow
    ? 'text-rose-400'
    : colorTheme === 'rose'
    ? 'text-rose-300'
    : 'text-indigo-300';

  // Badge style for TOP %
  const badgeStyle = isHigh
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    : isLow
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : colorTheme === 'rose'
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

  // Hover border glow & Card shadow
  const borderHoverStyle = isHigh
    ? 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
    : isLow
    ? 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]'
    : colorTheme === 'rose'
    ? 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(251,113,133,0.25)]'
    : 'hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]';

  return (
    <div ref={cardRef} className={`glass-surface rounded-2xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 ${borderHoverStyle}`}>
      <div className="flex flex-col items-center mb-2">
        <span className="text-xs font-black text-slate-100 group-hover:text-white transition-colors">{labelJa}</span>
        <span className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">{labelEn}</span>
      </div>

      {/* Mini Donut Circle with Dynamic Glow */}
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
            className="transition-all duration-700 ease-out filter drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          />
        </svg>
        <span className={`absolute text-base font-black ${scoreTextColor} tracking-tight`}>
          {displayScore}
        </span>
      </div>

      {/* Top Percent Badge */}
      {topPercent !== undefined && topPercent !== null && topPercent <= 50 ? (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${badgeStyle}`}>
          上位 {topPercent}%
        </span>
      ) : (
        <div className="h-5" />
      )}
    </div>
  );
}
