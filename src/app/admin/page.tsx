'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Database, Upload, RefreshCw, Layers, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const [recalculating, setRecalculating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleTriggerRecalculate = () => {
    setRecalculating(true);
    setSuccessMsg('');
    setTimeout(() => {
      setRecalculating(false);
      setSuccessMsg('データセット更新に伴う過去診断スコアの一括再計算バッチ処理が完了しました。');
    }, 1500);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2">
            <ArrowLeft className="w-4 h-4" /> サイトトップへ
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            SPEC CHECK 管理画面 (Admin Console)
          </h1>
        </div>

        <button
          onClick={handleTriggerRecalculate}
          disabled={recalculating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? '一括再計算中...' : 'スコア一括再計算を実行'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Dataset & Master Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">登録済み公的データセット</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">16 <span className="text-xs font-normal text-slate-400">/ 16 ID</span></div>
          <p className="text-[11px] text-slate-400">e-Stat, 国税庁, 厚労省統合</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">大学マスター登録件数</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">782 <span className="text-xs font-normal text-slate-400">校</span></div>
          <p className="text-[11px] text-slate-400">未登録レビュー申請: 3件</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">現在のスコアバージョン</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">ACTIVE</span>
          </div>
          <div className="text-2xl font-black text-slate-100 mb-1">ScoreVersion V1.1</div>
          <p className="text-[11px] text-slate-400">有効化日: 2026-08-19</p>
        </div>
      </div>

      {/* Dataset Importer Section */}
      <section className="glass-card rounded-2xl p-6 mb-8">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Upload className="w-5 h-5 text-indigo-400" />
          Dataset Import パイプライン (CSV/Excel Validation → Normalization → Staging)
        </h2>
        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-all cursor-pointer">
          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300 mb-1">新公的統計CSV/Excelファイルをドロップ</p>
          <p className="text-[11px] text-slate-500">※「…」「-」「秘匿」テキストは自動検証により0点変換せずデータセット未定義として処理</p>
        </div>
      </section>

      {/* Unregistered Master Approval Queue */}
      <section className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3">
          未登録マスター承認キュー (Free-text 申請)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">カテゴリ</th>
                <th className="py-2.5 px-3">ユーザー入力名称</th>
                <th className="py-2.5 px-3">申請回数</th>
                <th className="py-2.5 px-3">ステータス</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 px-3 font-semibold text-indigo-400">大学マスター</td>
                <td className="py-3 px-3 text-slate-200">東京科学大学 (旧東工大)</td>
                <td className="py-3 px-3 text-slate-400">12回</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">要レビュー</span></td>
                <td className="py-3 px-3 text-right">
                  <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px]">
                    マスター登録
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-violet-400">会社マスター</td>
                <td className="py-3 px-3 text-slate-200">Antigravity AI Lab</td>
                <td className="py-3 px-3 text-slate-400">5回</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">要レビュー</span></td>
                <td className="py-3 px-3 text-right">
                  <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px]">
                    マスター登録
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
