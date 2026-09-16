'use client';

import { useEffect, useRef, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedScores, setAnimatedScores] = useState<number[]>(axes.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);

  const size = 460;
  const center = size / 2;
  const radius = 148;
  const count = axes.length;

  useEffect(() => {
    // 画面スクロールに合わせて交差（ビューポート進入）したタイミングで中心から拡張スタート
    const element = containerRef.current;
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

  // 交差開始時またはaxes変更時に requestAnimationFrame で 0 -> targetScore へ極上の滑らかさでアニメーション
  useEffect(() => {
    if (!hasAnimated) return;

    let startTimestamp: number | null = null;
    const duration = 1300; // 1.3秒間の極めて滑らかな拡張アニメーション
    const targetScores = axes.map(a => a.score);

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart: 終端にかけて滑らかにソフトランディング減速
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      // 浮動小数点のまま高精度計算（Math.roundの丸めによるカクつき・量子化ステップを完全排除）
      const currentScores = targetScores.map(score => score * easedProgress);
      setAnimatedScores(currentScores);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [axes, hasAnimated]);

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
    const rDist = index === 0 ? radius + 32 : index === 3 ? radius + 36 : radius + 38;
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
  const fillColor = colorTheme === 'rose' ? 'rgba(244, 63, 94, 0.28)' : 'rgba(139, 92, 246, 0.28)';

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center p-2 w-full">
      <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
        <svg viewBox="-85 -50 630 560" className="w-full h-full overflow-visible">
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

          {/* Score Polygon Fill & Stroke (画面スクロール交差時に中心から美しくアニメーション伸長) */}
          <polygon
            points={userPolygonPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="3.5"
          />

          {/* Score Nodes (洗練されたクリーンな元デザイン) */}
          {animatedScores.map((scoreVal, i) => {
            const { x, y } = getCoordinates(scoreVal, i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="6"
                fill={strokeColor}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}

          {/* Axis Labels & Values (1.5倍フォント拡大 ＆ ノード円との重なり防止の完全位置制御) */}
          {axes.map((axis, i) => {
            const { x, y } = getLabelCoordinates(i);
            const isTop = i === 0;
            const isBottom = i === 3;
            const isRight = i === 1 || i === 2;
            const isLeft = i === 4 || i === 5;

            const anchor = isTop || isBottom ? 'middle' : isLeft ? 'end' : 'start';
            const dxOffset = isLeft ? -16 : isRight ? 16 : 0;

            // 頂点(100pt)ノード円と拡大テキストの縦方向オフセット最適化
            const dyLabel = isTop ? -34 : isBottom ? 22 : -18;
            const dyScore = isTop ? -10 : isBottom ? 48 : 6;
            const dySub = isTop ? 10 : isBottom ? 70 : 26;

            return (
              <g key={i} transform={`translate(${x + dxOffset}, ${y})`}>
                {/* 1. 日本語メインラベル (14px -> 21px 1.5倍) */}
                <text
                  textAnchor={anchor}
                  dy={dyLabel}
                  className="fill-slate-100 text-[21px] font-black tracking-wide"
                >
                  {axis.labelJa}
                </text>

                {/* 2. スコア pt (13px -> 19.5px 1.5倍) */}
                <text
                  textAnchor={anchor}
                  dy={dyScore}
                  className={`${colorTheme === 'rose' ? 'fill-rose-300' : 'fill-indigo-300'} text-[19.5px] font-black tracking-tight`}
                >
                  {axis.score} pt
                </text>

                {/* 3. 英語サブキー (10px -> 15px 1.5倍) */}
                <text
                  textAnchor={anchor}
                  dy={dySub}
                  className="fill-slate-400 text-[15px] font-extrabold uppercase tracking-widest opacity-85"
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
