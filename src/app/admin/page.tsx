'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Database, RefreshCw, CheckCircle2, ArrowLeft, BarChart3,
  Users, Calendar, Search, Eye, Download, FileText, Globe
} from 'lucide-react';
import { OverallDiagnosisResultV3 } from '@/types/spec-check';

interface AdminStatsSummary {
  totalCount: number;
  todayCount: number;
  avgJapanScore: number;
  avgLoveScore: number;
  genderRatio: { MALE: number; FEMALE: number; OTHER: number };
  ageDistribution: Record<string, number>;
  topPrefectures: { pref: string; count: number }[];
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStatsSummary | null>(null);
  const [records, setRecords] = useState<OverallDiagnosisResultV3[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<OverallDiagnosisResultV3 | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.summary);
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      '診断ID', '日時', 'ニックネーム', '性別', '年齢', '都道府県',
      '最終学歴', '大学名', '職種コード', '企業名', '年収(万円)', '金融資産(万円)',
      '日本人総合Score', '恋愛総合Score', '獲得称号'
    ];

    const rows = records.map(r => [
      r.diagnosisId,
      r.createdAt || '',
      `"${r.inputSummary?.nickname || ''}"`,
      r.inputSummary?.gender || '',
      r.inputSummary?.age || '',
      r.inputSummary?.prefectureName || '',
      r.rawInput?.academicDegree || '',
      `"${r.rawInput?.universityName || ''}"`,
      r.rawInput?.occupationCode || '',
      `"${r.rawInput?.companyName || ''}"`,
      r.rawInput?.annualIncome ?? '',
      r.rawInput?.financialAssets ?? '',
      r.japanOverallScore,
      r.loveOverallScore,
      `"${getEpithetStr(r.epithet)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spec_check_diagnoses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEpithetStr = (ep: any): string => {
    if (!ep) return '';
    if (typeof ep === 'string') return ep;
    if (typeof ep === 'object' && ep.fullTitle) return ep.fullTitle;
    return '';
  };

  // フィルタリング処理
  const filteredRecords = records.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const epStr = getEpithetStr(r.epithet).toLowerCase();
    return (
      (r.inputSummary?.nickname || '').toLowerCase().includes(q) ||
      (r.inputSummary?.prefectureName || '').toLowerCase().includes(q) ||
      (r.rawInput?.companyName || '').toLowerCase().includes(q) ||
      (r.rawInput?.universityName || '').toLowerCase().includes(q) ||
      epStr.includes(q)
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2">
            <ArrowLeft className="w-4 h-4" /> サイトトップへ
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            SPEC CHECK 本番データ管理ダッシュボード
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            最新データに更新
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            全ログCSV出力
          </button>
        </div>
      </div>

      {/* Realtime KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">本日の診断数</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.todayCount ?? 0)} <span className="text-xs font-normal text-slate-400">件</span>
          </div>
          <p className="text-[11px] text-slate-400">本日アクセス・診断実行</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">累積診断レコード数</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.totalCount ?? 0)} <span className="text-xs font-normal text-slate-400">件</span>
          </div>
          <p className="text-[11px] text-slate-400">個別全入力ログ保持数</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">平均日本人スペック</span>
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.avgJapanScore ?? 0)} <span className="text-xs font-normal text-slate-400">Pt</span>
          </div>
          <p className="text-[11px] text-slate-400">全診断の総合平均得点</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400">平均恋愛スペック</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">LOVE</span>
          </div>
          <div className="text-3xl font-black text-slate-100 mb-1">
            {loading ? '...' : (stats?.avgLoveScore ?? 0)} <span className="text-xs font-normal text-slate-400">Pt</span>
          </div>
          <p className="text-[11px] text-slate-400">恋愛市場における平均評価</p>
        </div>
      </div>

      {/* Aggregate Statistics Overview */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 性別比率 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> 性別比率
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">男性 (MALE)</span>
                <span className="font-bold text-white">{stats.genderRatio.MALE || 0} 件</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">女性 (FEMALE)</span>
                <span className="font-bold text-white">{stats.genderRatio.FEMALE || 0} 件</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">その他 (OTHER)</span>
                <span className="font-bold text-white">{stats.genderRatio.OTHER || 0} 件</span>
              </div>
            </div>
          </div>

          {/* 年代分布 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-violet-400" /> 年代別割合
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.ageDistribution).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex justify-between text-xs">
                  <span className="text-slate-300">{ageGroup}</span>
                  <span className="font-bold text-white">{count} 件</span>
                </div>
              ))}
            </div>
          </div>

          {/* 人気都道府県 */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> 地域上位
            </h3>
            <div className="space-y-2">
              {stats.topPrefectures.map(({ pref, count }) => (
                <div key={pref} className="flex justify-between text-xs">
                  <span className="text-slate-300">{pref}</span>
                  <span className="font-bold text-white">{count} 件</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual Diagnosis Record Viewer Table */}
      <section className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              個別の全診断入力データ一覧 ({filteredRecords.length}件)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ユーザーが入力した全項目（生データ・スコア・称号）を個別に閲覧・検証できます。
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="名前、大学、企業、都道府県で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Record Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3 px-3">日時</th>
                <th className="py-3 px-3">ニックネーム / 属性</th>
                <th className="py-3 px-3">地域</th>
                <th className="py-3 px-3">学歴 / 大学名</th>
                <th className="py-3 px-3">勤務先 / 年収</th>
                <th className="py-3 px-3 text-right">日本人Score</th>
                <th className="py-3 px-3 text-right">恋愛Score</th>
                <th className="py-3 px-3 text-center">全データ詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    該当する診断データが見つかりませんでした。
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.diagnosisId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{r.inputSummary?.nickname || 'あなた'}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.inputSummary?.gender === 'MALE' ? '男性' : r.inputSummary?.gender === 'FEMALE' ? '女性' : 'その他'} / {r.inputSummary?.age}歳
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{r.inputSummary?.prefectureName || '-'}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{r.rawInput?.academicDegree || '-'}</div>
                      {r.rawInput?.universityName && (
                        <div className="text-[10px] text-indigo-400">{r.rawInput.universityName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{r.rawInput?.companyName || r.rawInput?.companyCategory || '-'}</div>
                      <div className="text-[10px] text-emerald-400">年収 {r.rawInput?.annualIncome ?? '-'} 万円</div>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-indigo-300 text-sm">
                      {r.japanOverallScore} <span className="text-[10px] text-slate-500 font-normal">Pt</span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-300 text-sm">
                      {r.loveOverallScore} <span className="text-[10px] text-slate-500 font-normal">Pt</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold rounded-lg text-[11px] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        全項目表示
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Individual Raw Input & Score Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="text-xs text-indigo-400 font-mono">ID: {selectedRecord.diagnosisId}</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedRecord.inputSummary?.nickname} 様の個別の生データ・スコア詳細
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                閉じる (ESC)
              </button>
            </div>

            {/* Modal Body: Raw Inputs */}
            <div className="space-y-6 text-xs">
              <div>
                <h4 className="font-extrabold text-indigo-300 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
                  1. 個別入力された全データ (rawInput)
                </h4>
                <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedRecord.rawInput, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-extrabold text-indigo-300 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
                  2. 算出されたカテゴリ別スコア
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">身体 (BODY)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.body} Pt</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">経済 (ECONOMIC)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.economic} Pt</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">キャリア (CAREER)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.career} Pt</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">学歴 (ACADEMIC)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.academic} Pt</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">SNS (SOCIAL)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.social} Pt</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">能力 (GLOBAL)</span>
                    <div className="text-lg font-bold text-white">{selectedRecord.categoryScores.ability} Pt</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-indigo-300 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
                  3. 獲得称号
                </h4>
                <div className="bg-slate-950 p-3 rounded-xl text-amber-300 font-bold space-y-1">
                  <div>【日本人称号】: {getEpithetStr(selectedRecord.epithet) || '称号なし'}</div>
                  <div>【恋愛称号】: {getEpithetStr(selectedRecord.loveEpithet) || '称号なし'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
