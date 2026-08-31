'use client';

import { useState } from 'react';
import { Share2, Check, Copy, ExternalLink, X, Download } from 'lucide-react';

interface RadarAxis {
  labelJa: string;
  labelEn: string;
  score: number;
}

interface SnsShareCardProps {
  shareToken: string;
  score: number;
  topPercent?: number | null;
  gender: string;
  age: number;
  nickname?: string;
  prefectureName?: string;
  categoryScores: {
    body: number;
    economic: number;
    career: number;
    social: number;
    ability?: number;
  };
  radarAxes?: RadarAxis[];
}

export default function SnsShareCard({
  shareToken,
  score,
  topPercent,
  gender,
  age,
  nickname,
  prefectureName,
  categoryScores,
  radarAxes,
}: SnsShareCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // 6軸データの準備 (デフォルト補動)
  const defaultAxes: RadarAxis[] = radarAxes || [
    { labelJa: '身体', labelEn: 'BODY', score: categoryScores.body },
    { labelJa: '年収・純資産', labelEn: 'ECONOMIC', score: categoryScores.economic },
    { labelJa: 'キャリア', labelEn: 'CAREER', score: categoryScores.career },
    { labelJa: '学歴・知性', labelEn: 'ACADEMIC', score: 75 },
    { labelJa: 'SNS・影響力', labelEn: 'SOCIAL', score: categoryScores.social },
    { labelJa: 'グローバル力', labelEn: 'GLOBAL', score: categoryScores.ability || 65 },
  ];

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${shareToken}` : '';
  const genderTextJa = gender === 'MALE' ? '男性' : '女性';
  const displayNickname = nickname || 'あなた';
  const prefStr = prefectureName ? ` (${prefectureName})` : '';

  const rankShareStr = (topPercent !== undefined && topPercent !== null)
    ? `【上位 ${topPercent}%】`
    : '';

  const shareText = `【人間スペック診断 結果】
${displayNickname}（${age}歳・${genderTextJa}${prefStr}）
${rankShareStr} 総合評価 ${score.toFixed(1)} / 100 pt
あなたの同世代順位＆市場価値は？
#人間スペック診断 #スペック診断 #同世代順位 #市場価値`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineUrl, '_blank');
  };

  // SVG Geometry Parameters
  const cx = 160;
  const cy = 135;
  const radius = 70;
  const numAxes = defaultAxes.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (val / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon Points
  const polygonPoints = defaultAxes
    .map((axis, i) => {
      const { x, y } = getCoordinates(i, axis.score);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // High-Res Canvas Card Image Generation & Download
  const downloadCardImage = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 820;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#070a14');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Decorative Glow Circles
      const glowGrad = ctx.createRadialGradient(width / 2, 200, 20, width / 2, 200, 260);
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      glowGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Card Header Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('SPEC CHECK OFFICIAL RESULT', width / 2, 60);

      // User Profile Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${displayNickname} (${age}歳・${genderTextJa}${prefStr})`, width / 2, 100);

      // Score Display
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px sans-serif';
      ctx.fillText(score.toFixed(1), width / 2, 175);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('/ 100 POINT', width / 2, 205);

      // TOP % Pill
      if (topPercent !== undefined && topPercent !== null) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        const pillW = 180;
        const pillH = 40;
        const pillX = width / 2 - pillW / 2;
        const pillY = 222;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a5b4fc';
        ctx.font = '900 20px sans-serif';
        ctx.fillText(`上位 ${topPercent}%`, width / 2, 249);
      }

      // Draw Hexagon Radar Chart in Canvas
      const ccx = width / 2;
      const ccy = 510;
      const cradius = 145;

      // Hexagon Grids
      gridLevels.forEach(lvl => {
        ctx.beginPath();
        for (let i = 0; i < numAxes; i++) {
          const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
          const gx = ccx + cradius * lvl * Math.cos(angle);
          const gy = ccy + cradius * lvl * Math.sin(angle);
          if (i === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.closePath();
        ctx.strokeStyle = lvl === 1.0 ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Axis Lines
      defaultAxes.forEach((_, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const ax = ccx + cradius * Math.cos(angle);
        const ay = ccy + cradius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(ccx, ccy);
        ctx.lineTo(ax, ay);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.stroke();
      });

      // Data Polygon Fill
      ctx.beginPath();
      defaultAxes.forEach((axis, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const r = (axis.score / 100) * cradius;
        const px = ccx + r * Math.cos(angle);
        const py = ccy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();

      ctx.fillStyle = 'rgba(129, 140, 248, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Data Dots
      defaultAxes.forEach((axis, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const r = (axis.score / 100) * cradius;
        const px = ccx + r * Math.cos(angle);
        const py = ccy + r * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#c084fc';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Labels + Scores
      defaultAxes.forEach((axis, i) => {
        const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
        const isTop = i === 0;
        const isBottom = i === 3;
        const isRight = i === 1 || i === 2;

        const rDist = isTop ? cradius + 35 : isBottom ? cradius + 35 : cradius + 45;
        const lx = ccx + rDist * Math.cos(angle);
        const ly = ccy + rDist * Math.sin(angle);

        ctx.textAlign = isTop || isBottom ? 'center' : isRight ? 'left' : 'right';

        // 項目名
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 15px sans-serif';
        const dyLabel = isTop ? -10 : isBottom ? 5 : -5;
        ctx.fillText(axis.labelJa, lx, ly + dyLabel);

        // スコア pt
        ctx.fillStyle = '#a5b4fc';
        ctx.font = '900 14px sans-serif';
        const dyScore = isTop ? 12 : isBottom ? 26 : 15;
        ctx.fillText(`${axis.score.toFixed(0)} pt`, lx, ly + dyScore);
      });

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText('SPEC CHECK OFFICIAL DIAGNOSIS CARD', width / 2, height - 30);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `spec-check-result-${shareToken.substring(0, 8)}.png`;
      a.click();
    } catch (e) {
      console.error('Failed to download card image', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 text-white font-black text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <Share2 className="w-5 h-5" /> 診断結果をSNSで共有する
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="glass-surface glass-surface-glow rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full relative text-center my-6 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* OGP Card Graphic Container (十分な上部余白と完全レイアウト) */}
            <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-2xl pt-6 pb-5 px-3 border border-slate-800 shadow-2xl mb-4 text-center relative overflow-hidden shrink-0">
              <div className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-1">
                SPEC CHECK OFFICIAL OGP
              </div>

              {/* ユーザープロフィール & ニックネーム */}
              <div className="text-xs font-black text-slate-200 mb-2">
                {displayNickname}（{age}歳・{genderTextJa}{prefStr}）
              </div>

              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {score.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mb-2">/ 100 POINT</div>

              {topPercent !== undefined && topPercent !== null && (
                <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black mb-3">
                  上位 {topPercent}%
                </div>
              )}

              {/* 6-Axis Hexagon Radar Chart SVG (各軸の点数付き) */}
              <div className="w-full flex justify-center items-center my-1 overflow-visible">
                <svg width="320" height="270" viewBox="0 0 320 270" className="overflow-visible">
                  {/* Grid Hexagons */}
                  {gridLevels.map((lvl, idx) => (
                    <polygon
                      key={idx}
                      points={defaultAxes
                        .map((_, i) => {
                          const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                          const r = radius * lvl;
                          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke={lvl === 1.0 ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.15)'}
                      strokeWidth="1"
                    />
                  ))}

                  {/* Radial Axis Lines */}
                  {defaultAxes.map((_, i) => {
                    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                    const ax = cx + radius * Math.cos(angle);
                    const ay = cy + radius * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={ax}
                        y2={ay}
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Data Polygon */}
                  <polygon
                    points={polygonPoints}
                    fill="rgba(129, 140, 248, 0.35)"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />

                  {/* Data Vertex Dots */}
                  {defaultAxes.map((axis, i) => {
                    const { x, y } = getCoordinates(i, axis.score);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#c084fc"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Axis Labels AND Individual Point Scores */}
                  {defaultAxes.map((axis, i) => {
                    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                    const isTop = i === 0;
                    const isBottom = i === 3;
                    const isRight = i === 1 || i === 2;
                    const isLeft = i === 4 || i === 5;

                    const rDist = isTop ? radius + 24 : isBottom ? radius + 24 : radius + 28;
                    const lx = cx + rDist * Math.cos(angle);
                    const ly = cy + rDist * Math.sin(angle);

                    const textAnchor = isTop || isBottom ? 'middle' : isLeft ? 'end' : 'start';
                    const dx = isLeft ? -4 : isRight ? 4 : 0;

                    return (
                      <g key={i} transform={`translate(${dx}, 0)`}>
                        {/* 項目名 (日本語) */}
                        <text
                          x={lx}
                          y={isTop ? ly - 8 : isBottom ? ly : ly - 6}
                          fill="#f8fafc"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                        >
                          {axis.labelJa}
                        </text>

                        {/* 各軸のスコア pt */}
                        <text
                          x={lx}
                          y={isTop ? ly + 6 : isBottom ? ly + 14 : ly + 8}
                          fill="#a5b4fc"
                          fontSize="10"
                          fontWeight="900"
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                        >
                          {axis.score.toFixed(0)} pt
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="text-[9px] text-slate-500 font-mono tracking-widest mt-3">
                SPEC CHECK OFFICIAL DIAGNOSIS CARD
              </div>
            </div>

            {/* Action & Share Buttons */}
            <div className="space-y-2.5 shrink-0">
              {/* 画像で保存 (ダウンロード) ボタン */}
              <button
                onClick={downloadCardImage}
                disabled={downloading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'カード画像を生成中...' : '診断カード画像として保存'}
              </button>

              <button
                onClick={shareX}
                className="w-full py-3 rounded-xl bg-black hover:bg-slate-900 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" /> X (旧Twitter) でシェア
              </button>

              <button
                onClick={shareLine}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <ExternalLink className="w-4 h-4" /> LINE でシェア
              </button>

              <button
                onClick={copyLink}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'URLをコピーしました！' : '共有URLをコピー'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
