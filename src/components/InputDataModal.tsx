'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiagnosisInputV3, Gender, MaritalStatus, FaceRating } from '@/types/spec-check';
import {
  PREFECTURES,
  COMMON_OCCUPATION_MASTER,
  INDUSTRY_MASTER,
  POSITION_MASTER_BY_EMPLOYMENT,
  MBTI_MASTER,
  getOccupationsByIndustryId,
} from '@/lib/datasets/japan-stats';
import { sanitizeNumericInput } from '@/lib/score-engine/math-utils';
import { X, FileText, User, Landmark, GraduationCap, Globe, Sparkles, ChevronRight } from 'lucide-react';
import UniversityAutocomplete from '@/components/UniversityAutocomplete';
import CompanyAutocomplete from '@/components/CompanyAutocomplete';

interface InputDataModalProps {
  input: DiagnosisInputV3;
}

export default function InputDataModal({ input }: InputDataModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 編集用ローカルステート (文字列型で全消去・先頭ゼロ問題に対応)
  const [nickname, setNickname] = useState<string>(input.nickname || 'あなた');
  const [gender, setGender] = useState<Gender>(input.gender || 'MALE');
  const [age, setAge] = useState<string>(input.age ? String(input.age) : '25');
  const [prefectureId, setPrefectureId] = useState<number>(input.prefectureId || 13);
  const [height, setHeight] = useState<string>(input.height ? String(input.height) : '170');
  const [weight, setWeight] = useState<string>(input.weight ? String(input.weight) : '60');
  const [bodyFat, setBodyFat] = useState<string>(input.bodyFat !== null && input.bodyFat !== undefined ? String(input.bodyFat) : '');
  const [faceRating, setFaceRating] = useState<FaceRating | ''>(input.faceRating || '');
  
  const [annualIncome, setAnnualIncome] = useState<string>(input.annualIncome ? String(input.annualIncome) : '400');
  const [financialAssets, setFinancialAssets] = useState<string>(input.financialAssets !== null && input.financialAssets !== undefined ? String(input.financialAssets) : '0');
  const [otherAssets, setOtherAssets] = useState<string>(
    String((input.realEstateAssets || 0) + (input.carAssets || 0) + (input.watchAssets || 0) + (input.otherAssets || 0))
  );
  const [otherDebt, setOtherDebt] = useState<string>(
    String((input.mortgageDebt || 0) + (input.carDebt || 0) + (input.scholarshipDebt || 0) + (input.otherDebt || 0))
  );

  const [academicDegree, setAcademicDegree] = useState<string>(input.academicDegree || '');
  const [universityName, setUniversityName] = useState<string>(input.universityName || '');
  const [customUniversityHensachi, setCustomUniversityHensachi] = useState<number | null>(input.customUniversityHensachi || null);
  const [iqScore, setIqScore] = useState<string>(input.iqScore ? String(input.iqScore) : '');
  const [industryCode, setIndustryCode] = useState<string>(input.industryCode || '');
  const [occupationCode, setOccupationCode] = useState<string>(input.occupationCode || '');
  const [employmentType, setEmploymentType] = useState<string>(input.employmentType || '');
  const [positionCode, setPositionCode] = useState<string>(input.positionCode || '');
  const [companyName, setCompanyName] = useState<string>(input.companyName || '');
  const [companyCategory, setCompanyCategory] = useState<DiagnosisInputV3['companyCategory'] | ''>(input.companyCategory || '');

  const [snsFollowers, setSnsFollowers] = useState<string>(
    String((input.instagramFollowers || 0) + (input.xFollowers || 0) + (input.tikTokFollowers || 0) + (input.youTubeFollowers || 0))
  );
  const [travelCount, setTravelCount] = useState<string>(input.travelCount ? String(input.travelCount) : '0');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>(input.maritalStatus || '');
  const [childrenCount, setChildrenCount] = useState<string>(input.childrenCount ? String(input.childrenCount) : '0');
  const [mbti, setMbti] = useState<string>(input.mbti || '');

  const availableOccupations = industryCode ? getOccupationsByIndustryId(industryCode) : COMMON_OCCUPATION_MASTER;
  const availablePositions = employmentType ? (POSITION_MASTER_BY_EMPLOYMENT[employmentType] || []) : [];

  const handleRecalculate = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const selectedPref = PREFECTURES[prefectureId - 1] || '東京都';
      const parsedFinancial = financialAssets !== '' ? Number(financialAssets) : 0;
      const parsedOtherAssets = otherAssets !== '' ? Number(otherAssets) : 0;
      const parsedDebt = otherDebt !== '' ? Number(otherDebt) : 0;

      const payload: DiagnosisInputV3 = {
        ...input,
        nickname: nickname.trim() || 'あなた',
        gender,
        age: Number(age),
        prefectureId: Number(prefectureId),
        prefectureName: selectedPref,
        height: Number(height),
        weight: Number(weight),
        bodyFat: bodyFat !== '' ? Number(bodyFat) : null,
        faceRating: faceRating ? (faceRating as FaceRating) : null,
        annualIncome: Number(annualIncome),
        financialAssets: parsedFinancial,
        realEstateAssets: 0,
        carAssets: 0,
        watchAssets: 0,
        otherAssets: parsedOtherAssets,
        mortgageDebt: 0,
        carDebt: 0,
        scholarshipDebt: 0,
        otherDebt: parsedDebt,
        academicDegree: academicDegree ? (academicDegree as DiagnosisInputV3['academicDegree']) : null,
        universityName: universityName.trim() || null,
        customUniversityHensachi,
        iqScore: iqScore !== '' ? Number(iqScore) : null,
        industryCode: industryCode || null,
        occupationCode: occupationCode || '01',
        employmentType: employmentType ? (employmentType as DiagnosisInputV3['employmentType']) : 'REGULAR',
        positionCode: positionCode || null,
        companyName: companyName.trim() || null,
        companyCategory: companyCategory !== '' ? (companyCategory as any) : null,
        instagramFollowers: snsFollowers !== '' ? Number(snsFollowers) : 0,
        xFollowers: 0,
        tikTokFollowers: 0,
        youTubeFollowers: 0,
        travelCount: travelCount !== '' ? Number(travelCount) : 0,
        maritalStatus: maritalStatus ? (maritalStatus as MaritalStatus) : null,
        childrenCount: childrenCount !== '' ? Number(childrenCount) : 0,
        mbti: mbti !== '' ? mbti : null,
      };

      const res = await fetch('/api/diagnosis/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '再計算に失敗しました');
      }

      // キャッシュ更新＆ドラフト同期＆遷移
      try {
        localStorage.setItem(`spec_check_result_${data.result.diagnosisId}`, JSON.stringify(data.result));
        localStorage.setItem('spec_check_latest_result', JSON.stringify(data.result));

        const draft = {
          nickname, gender, age, prefectureId, height, weight, bodyFat, faceRating,
          annualIncome, financialAssets: parsedFinancial, otherAssets: parsedOtherAssets, otherDebt: parsedDebt,
          academicDegree, universityName, customUniversityHensachi, iqScore,
          industryCode, occupationCode, employmentType, positionCode, companyName, companyCategory,
          instagramFollowers: snsFollowers, travelCount, maritalStatus, childrenCount, mbti,
        };
        localStorage.setItem('spec_check_draft_v3', JSON.stringify(draft));
      } catch {}

      setIsOpen(false);
      setLoading(false);

      // 現在のURLパラメータ(?tab=love 等)を維持して更新遷移
      const currentTab = new URLSearchParams(window.location.search).get('tab') || 'japan';
      router.push(`/result/${data.result.diagnosisId}?tab=${currentTab}`);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setErrorMsg(err.message || '再計算中にエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <>
      {/* トリガーボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 decoration-indigo-500/40 hover:decoration-indigo-400 transition-all bg-indigo-950/40 hover:bg-indigo-900/60 px-3.5 py-1.5 rounded-full border border-indigo-800/50 shadow-sm cursor-pointer"
      >
        <FileText className="w-4 h-4 text-indigo-400" />
        <span>入力データを見る・修正する</span>
        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
      </button>

      {/* モーダルオーバーレイ (完全不透明バックドロップで背後の文字透過・重なりバグを完全防止) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/98 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            {/* モーダルヘッダー */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100">診断データのインライン修正</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    EDIT INPUT PARAMETERS & RECALCULATE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* エラーメッセージ */}
            {errorMsg && (
              <div className="px-5 py-2.5 bg-rose-500/20 border-b border-rose-500/30 text-rose-300 text-xs font-bold shrink-0">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* モーダルコンテンツ (インラインフォームスクロール) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs bg-slate-900">
              {/* 基本情報 */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4" /> 基本情報・身体データ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">ニックネーム</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">性別</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="MALE">男性</option>
                      <option value="FEMALE">女性</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">年齢 (歳)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">居住都道府県</label>
                    <select
                      value={prefectureId}
                      onChange={(e) => setPrefectureId(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      {PREFECTURES.map((pref, idx) => (
                        <option key={idx + 1} value={idx + 1}>{pref}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">身長 (cm) / 体重 (kg)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={height}
                        onChange={(e) => setHeight(sanitizeNumericInput(e.target.value))}
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                        placeholder="身長"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={weight}
                        onChange={(e) => setWeight(sanitizeNumericInput(e.target.value))}
                        className="w-1/2 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                        placeholder="体重"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">体脂肪率 (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                      placeholder="任意 (例: 15.5)"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">雰囲気・第一印象の自己評価</label>
                    <select
                      value={faceRating || ''}
                      onChange={(e) => setFaceRating(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="MODEL_LEVEL">モデル・インフルエンサー級 (美形・圧倒的ルックス)</option>
                      <option value="ABOVE_AVERAGE">上位クラス (整った容姿・清潔感があり良く褒められる)</option>
                      <option value="AVERAGE">平均的 (一般的ルックス・親しみやすい印象)</option>
                      <option value="BELOW_AVERAGE">改善の余地あり (あまり自信がない)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 年収・資産 */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Landmark className="w-4 h-4" /> 年収・純資産データ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">額面年収 (万円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-black focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">金融資産 [預貯金・株] (万円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={financialAssets}
                      onChange={(e) => setFinancialAssets(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">その他動産・不動産資産合計 (万円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otherAssets}
                      onChange={(e) => setOtherAssets(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">各種負債合計 [ローン・奨学金等] (万円)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otherDebt}
                      onChange={(e) => setOtherDebt(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 学歴・キャリア */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <GraduationCap className="w-4 h-4" /> 学歴・知的指標・キャリア
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">最終学歴</label>
                    <select
                      value={academicDegree || ''}
                      onChange={(e) => setAcademicDegree(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="BACHELOR">大学卒 (学士)</option>
                      <option value="MASTER">大学院修士課程修了</option>
                      <option value="DOCTOR">大学院博士課程修了</option>
                      <option value="JUNIOR_COLLEGE">短期大学卒</option>
                      <option value="VOCATIONAL">専門学校卒</option>
                      <option value="HIGH_SCHOOL">高等学校卒</option>
                      <option value="MIDDLE_SCHOOL">中学校卒</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">出身大学・大学院名 (マスタ自動判定)</label>
                    <UniversityAutocomplete
                      value={universityName}
                      customHensachi={customUniversityHensachi}
                      onChange={(val, _isMatched, customH) => {
                        setUniversityName(val);
                        setCustomUniversityHensachi(customH || null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">推定IQ・知能指数</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={iqScore}
                      onChange={(e) => setIqScore(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                      placeholder="空欄で自動推計"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">業種分類</label>
                    <select
                      value={industryCode}
                      onChange={(e) => {
                        setIndustryCode(e.target.value);
                        setOccupationCode('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {INDUSTRY_MASTER.map((ind) => (
                        <option key={ind.id} value={ind.id}>{ind.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">職種分類</label>
                    <select
                      value={occupationCode}
                      onChange={(e) => setOccupationCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {availableOccupations.map((occ) => (
                        <option key={occ.id} value={occ.id}>{occ.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">雇用形態</label>
                    <select
                      value={employmentType || ''}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください ※必須</option>
                      <option value="EXECUTIVE">役員・経営者</option>
                      <option value="REGULAR">正社員・常勤</option>
                      <option value="CONTRACT">契約社員・派遣・パート</option>
                      <option value="FREELANCE">フリーランス・個人事業</option>
                      <option value="UNEMPLOYED">無職・家事手伝い・求職中・学生</option>
                    </select>
                  </div>
                  {availablePositions.length > 0 && (
                    <div>
                      <label className="text-slate-400 text-[10px] font-bold block mb-1">役職</label>
                      <select
                        value={positionCode}
                        onChange={(e) => setPositionCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                      >
                        <option value="">選択してください</option>
                        {availablePositions.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">勤務先・企業名 (上場・外資マスタ自動判定)</label>
                    <CompanyAutocomplete
                      value={companyName}
                      companyCategory={companyCategory}
                      onChange={(name, category) => {
                        setCompanyName(name);
                        if (category) {
                          setCompanyCategory(category as any);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">勤務先企業規模 (任意区分)</label>
                    <select
                      value={companyCategory || ''}
                      onChange={(e) => setCompanyCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">選択してください (未選択/指定なし)</option>
                      <option value="LARGE_PRIME">プライム上場・外資トップ・大手グローバル企業</option>
                      <option value="LARGE">大手企業・上場企業・有名子会社</option>
                      <option value="MEDIUM">中堅企業・メガベンチャー</option>
                      <option value="SMALL">中小企業・スタートアップ</option>
                      <option value="OTHER">その他・個人事業所</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SNS・語学・恋愛観・MBTI */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Globe className="w-4 h-4" /> SNS・グローバル・パートナーシップ・MBTI
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">SNS総フォロワー数 (人)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={snsFollowers}
                      onChange={(e) => setSnsFollowers(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">海外渡航歴 (か国)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={travelCount}
                      onChange={(e) => setTravelCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">配偶関係</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      <option value="SINGLE">未婚</option>
                      <option value="MARRIED">既婚</option>
                      <option value="DIVORCED">離婚歴あり</option>
                      <option value="BEREAVED">死別</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">子どもの有無 (人)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(sanitizeNumericInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-bold block mb-1">MBTI</label>
                    <select
                      value={mbti}
                      onChange={(e) => setMbti(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">選択してください (わからない/未測定)</option>
                      {MBTI_MASTER.map((m) => (
                        <option key={m.code} value={m.code}>{m.nameJa}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* モーダルフッター */}
            <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                キャンセル
              </button>
              <button
                onClick={handleRecalculate}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>再計算・AI解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>修正した内容で即時再診断</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
