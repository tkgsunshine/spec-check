'use client';

import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  label?: string;
  subLabel?: string;
  colorTheme?: 'violet' | 'rose';
}

export default function ScoreRing({
  score,
  maxScore = 100,
  label = 'YOUR SPEC',
  subLabel = '/ 100 POINT',
  colorTheme = 'violet',
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1800; // 1.8s count up animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // EaseOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easedProgress * score * 10) / 10;
      setDisplayScore(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [score]);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (displayScore / maxScore) * circumference;

  const isRose = colorTheme === 'rose';
  const strokeGradientId = isRose ? 'roseGradient' : 'violetGradient';
  const glowClass = isRose ? 'glow-text-rose' : 'glow-text-violet';

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        {/* SVG Conic Progress Circle */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="violetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
          </defs>

          {/* Track Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="12"
            fill="none"
          />

          {/* Animated Progress Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            stroke={`url(#${strokeGradientId})`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Label & Number Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">
            {label}
          </span>
          <div className="flex items-baseline justify-center gap-1.5 my-0.5">
            <span className={`text-5xl md:text-7xl font-black tracking-tight text-white ${glowClass}`}>
              {displayScore.toFixed(1)}
            </span>
            <span className="text-xs md:text-sm font-black text-indigo-300/90 tracking-wider">
              POINT
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400/90">{subLabel}</span>
        </div>
      </div>
    </div>
  );
}
