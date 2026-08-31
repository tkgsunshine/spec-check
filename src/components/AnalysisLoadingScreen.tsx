'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Heart, Cpu, Activity, CheckCircle2 } from 'lucide-react';

interface AnalysisLoadingScreenProps {
  gender: string;
  age: string | number;
  prefectureName: string;
  isLoveMode: boolean;
}

const ANALYSIS_STEPS = [
  '厚生労働省・総務省オープンデータ参照中...',
  '同世代属性モデル＆6軸多変量正規分布 解析中...',
  '学歴・有名企業・SNS・語学の地域希少性分析中...',
  '総合偏差値・同世代順位＆市場価値 算定完了...',
];

export default function AnalysisLoadingScreen({ gender, age, prefectureName, isLoveMode }: AnalysisLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2 秒間の極上アニメーション演出

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(99, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct > 75) setStepIdx(3);
      else if (pct > 50) setStepIdx(2);
      else if (pct > 25) setStepIdx(1);
      else setStepIdx(0);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const genderText = gender === 'FEMALE' ? '女性' : '男性';

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-indigo-600/30 via-violet-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-md w-full glass-surface glass-surface-glow rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800 shadow-2xl flex flex-col items-center">
        {/* User Info Capsule Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-black text-slate-200 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{age}歳 {genderText} （{prefectureName}）</span>
          <span className="text-slate-500">|</span>
          <span className={isLoveMode ? 'text-pink-400 font-bold' : 'text-indigo-400 font-bold'}>
            {isLoveMode ? '恋愛スペック解析' : '総合スペック解析'}
          </span>
        </div>

        {/* Central Animated Pulse Spinner & Progress Counter */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
          {/* Outer Rotating Glowing Gradient Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 animate-spin p-1 opacity-80 blur-sm" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 animate-spin p-1" />
          
          {/* Inner Dark Mask */}
          <div className="absolute inset-2 rounded-full bg-slate-950 flex flex-col items-center justify-center">
            {isLoveMode ? (
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-pink-400 animate-bounce mb-1 fill-pink-500/30" />
            ) : (
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400 animate-pulse mb-1" />
            )}
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tighter">
              {progress}%
            </div>
          </div>
        </div>

        {/* Step Title */}
        <h3 className="text-base sm:text-lg font-black text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
          {isLoveMode ? '同世代 恋愛市場価値をAI解析中' : '同世代 人間スペックをAI解析中'}
        </h3>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mb-6 relative">
          <div
            className={`h-full transition-all duration-100 rounded-full ${
              isLoveMode
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400'
                : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Ticking Status Steps List */}
        <div className="w-full space-y-2.5 text-left text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
          {ANALYSIS_STEPS.map((stepText, idx) => {
            const isDone = idx < stepIdx;
            const isCurrent = idx === stepIdx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 transition-all duration-300 ${
                  isDone
                    ? 'text-emerald-400 font-bold opacity-90'
                    : isCurrent
                    ? 'text-white font-black scale-[1.01]'
                    : 'text-slate-600 font-normal opacity-50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Cpu className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{stepText}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-500 font-medium mt-5">
          ※公的オープンデータおよび数理統計モデルによる自動試算を実施中
        </p>
      </div>
    </div>
  );
}
