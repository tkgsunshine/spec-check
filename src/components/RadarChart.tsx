'use client';

import { useEffect, useState } from 'react';

interface RadarAxis {
  labelJa: string;
  labelEn: string;
  score: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  colorTheme?: 'violet' | 'rose';
}

export default function RadarChart({ axes, colorTheme = 'violet' }: RadarChartProps) {
  const size = 460;
  const center = size / 2;
  const radius = 148;
  const count = axes.length;

  const [animatedScores, setAnimatedScores] = useState<number[]>(axes.map(() => 0));

  useEffect(() => {
    // コンポーネントマウント時・スコア変更時に中心から滑らかにアニメーション伸長
    const timer = setTimeout(() => {
      setAnimatedScores(axes.map(a => a.score));
    }, 50);
    return () => clearTimeout(timer);
  }, [axes]);

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    // 上下左右でノード円と被らないよう適切な距離(r)を保つ
    const rDist = index === 0 ? radius + 32 : index === 3 ? radius + 34 : radius + 38;
    const x = center + rDist * Math.cos(angle);
    const y = center + rDist * Math.sin(angle);
    return { x, y };
  };

  const webLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const userPolygonPoints = animatedScores
    .map((scoreVal, i) => {
      const { x, y } = getCoordinates(scoreVal, i);
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = colorTheme === 'rose' ? '#f43f5e' : '#8b5cf6';
  const fillColor = colorTheme === 'rose' ? 'rgba(244, 63, 94, 0.32)' : 'rgba(139, 92, 246, 0.32)';

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full">
      <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
        <svg viewBox="-60 -35 580 530" className="w-full h-full overflow-visible">
          {/* Concentric Grid Webs */}
          {webLevels.map(level => {
            const points = Array.from({ length: count })
              .map((_, i) => {
                const { x, y } = getCoordinates(level * 100, i);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Axis Spoke Lines */}
          {axes.map((_, i) => {
            const { x, y } = getCoordinates(100, i);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Score Polygon Fill & Stroke (中心からの拡張アニメーション) */}
          <polygon
            points={userPolygonPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="3"
            className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]"
          />

          {/* Score Nodes with Pulsing Glow Animation */}
          {animatedScores.map((scoreVal, i) => {
            const { x, y } = getCoordinates(scoreVal, i);
            return (
              <g key={i} className="transition-all duration-1000 ease-out">
                {/* 脈動する背後のグローリング */}
                <circle
                  cx={x}
                  cy={y}
                  r="9"
                  fill={strokeColor}
                  className="opacity-40 animate-ping"
                />
                {/* メインノード */}
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill={strokeColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] cursor-pointer hover:scale-125 transition-transform"
                />
              </g>
            );
          })}

          {/* Axis Labels & Values (ノード円との重なり防止の完全位置制御) */}
          {axes.map((axis, i) => {
            const { x, y } = getLabelCoordinates(i);
            const isTop = i === 0;
            const isBottom = i === 3;
            const isRight = i === 1 || i === 2;
            const isLeft = i === 4 || i === 5;

            const anchor = isTop || isBottom ? 'middle' : isLeft ? 'end' : 'start';
            const dxOffset = isLeft ? -14 : isRight ? 14 : 0;

            // 頂点(100pt)ノード円とテキストの縦方向オフセット最適化
            const dyLabel = isTop ? -28 : isBottom ? 18 : -14;
            const dyScore = isTop ? -10 : isBottom ? 36 : 4;
            const dySub = isTop ? 6 : isBottom ? 50 : 18;

            return (
              <g key={i} transform={`translate(${x + dxOffset}, ${y})`}>
                {/* 1. 日本語メインラベル */}
                <text
                  textAnchor={anchor}
                  dy={dyLabel}
                  className="fill-slate-100 text-[14px] font-black tracking-wide"
                >
                  {axis.labelJa}
                </text>

                {/* 2. スコア pt */}
                <text
                  textAnchor={anchor}
                  dy={dyScore}
                  className={`${colorTheme === 'rose' ? 'fill-rose-300' : 'fill-indigo-300'} text-[13px] font-extrabold`}
                >
                  {axis.score} pt
                </text>

                {/* 3. 英語サブキー */}
                <text
                  textAnchor={anchor}
                  dy={dySub}
                  className="fill-slate-400 text-[10px] font-extrabold uppercase tracking-widest opacity-90"
                >
                  {axis.labelEn}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
