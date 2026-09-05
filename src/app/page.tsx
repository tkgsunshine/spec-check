'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PREFECTURES,
  INDUSTRY_MASTER,
  COMMON_OCCUPATION_MASTER,
  getOccupationsByIndustryId,
  POSITION_MASTER_BY_EMPLOYMENT,
  MBTI_MASTER,
  LANGUAGE_MASTER,
  SNS_FOLLOWER_BRACKETS,
} from '@/lib/datasets/japan-stats';
import { Gender, MaritalStatus, DiagnosisInputV3, UserLanguageInput, FaceRating } from '@/types/spec-check';
import UniversityAutocomplete from '@/components/UniversityAutocomplete';
import CompanyAutocomplete from '@/components/CompanyAutocomplete';
import AnalysisLoadingScreen from '@/components/AnalysisLoadingScreen';
import { Sparkles, Heart, ShieldCheck, UserCheck, ArrowRight, ArrowLeft, Plus, Trash2, Check } from 'lucide-react';

// 全角数字 (０-９) ➔ 半角数字 (0-9) ＆ 全角ドット/記号正規化ヘルパー
export function toHalfWidthDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[^0-9.]/g, '');
}

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'JAPAN' | 'LOVE'>('JAPAN');
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stepParam = Number(params.get('step'));
      if (stepParam >= 1 && stepParam <= 6) {
        setCurrentStep(stepParam);
      }
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: 基本
  const [nickname, setNickname] = useState<string>('あなた');
  const [gender, setGender] = useState<Gender>('MALE');
  const [age, setAge] = useState<string>('');
  const [prefectureId, setPrefectureId] = useState<number>(13);

  // Step 2: 身体 ＆ 容姿
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [faceRating, setFaceRating] = useState<FaceRating | ''>('');
  const [faceImageUrl, setFaceImageUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleFacePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setFaceImageUrl(resultStr);
      setPhotoPreview(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const removeFacePhoto = () => {
    setFaceImageUrl(null);
    setPhotoPreview(null);
  };

  // Step 3: 経済・純資産
  const [annualIncome, setAnnualIncome] = useState<string>('');
  const [financialAssets, setFinancialAssets] = useState<string>('');
  const [realEstateAssets, setRealEstateAssets] = useState<string>('');
  const [carAssets, setCarAssets] = useState<string>('');
  const [watchAssets, setWatchAssets] = useState<string>('');
  
  // 負債の内訳
  const [mortgageDebt, setMortgageDebt] = useState<string>('');
  const [carDebt, setCarDebt] = useState<string>('');
  const [scholarshipDebt, setScholarshipDebt] = useState<string>('');
  const [otherDebt, setOtherDebt] = useState<string>('');

  // Step 4: 学歴 & 仕事
  const [academicDegree, setAcademicDegree] = useState<DiagnosisInputV3['academicDegree'] | ''>('');
  const [universityName, setUniversityName] = useState<string>('');
  const [customUniversityHensachi, setCustomUniversityHensachi] = useState<number | null>(null);
  const [iqScore, setIqScore] = useState<string>('');

  // 業種 ➔ 職種 2段階動的絞り込み (新マスタ仕様書準拠)
  const [industryCode, setIndustryCode] = useState<string>('');
  const availableOccupations = industryCode ? getOccupationsByIndustryId(industryCode) : [];
  const [occupationCode, setOccupationCode] = useState<string>('');

  const [employmentType, setEmploymentType] = useState<DiagnosisInputV3['employmentType'] | ''>('');
  const availablePositions = employmentType ? (POSITION_MASTER_BY_EMPLOYMENT[employmentType] || POSITION_MASTER_BY_EMPLOYMENT.REGULAR) : [];
  const [positionCode, setPositionCode] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyCategory, setCompanyCategory] = useState<DiagnosisInputV3['companyCategory'] | ''>('');

  // Step 5: 語学 & SNS
  const [userLanguages, setUserLanguages] = useState<UserLanguageInput[]>([
    { languageCode: 'JA', level: 'NATIVE' },
  ]);
  const [instagramFollowers, setInstagramFollowers] = useState<number>(0);
  const [xFollowers, setXFollowers] = useState<number>(0);
  const [tikTokFollowers, setTikTokFollowers] = useState<number>(0);
  const [youTubeFollowers, setYouTubeFollowers] = useState<number>(0);

  // Step 6: 恋愛 & 海外渡航国数 & MBTI
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | ''>('');
  const [childrenCount, setChildrenCount] = useState<string>('0');
  const [mbti, setMbti] = useState<string>('');
  const [travelCount, setTravelCount] = useState<string>('');

  const DRAFT_KEY = 'spec_check_draft_v3';

  // Restore draft form data from localStorage on mount (for browser back)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data.gender !== undefined) setGender(data.gender);
      if (data.age !== undefined) setAge(data.age);
      if (data.prefectureId !== undefined) setPrefectureId(data.prefectureId);
      if (data.height !== undefined) setHeight(data.height);
      if (data.weight !== undefined) setWeight(data.weight);
      if (data.bodyFat !== undefined) setBodyFat(data.bodyFat);
      if (data.faceRating !== undefined) setFaceRating(data.faceRating);
      if (data.faceImageUrl !== undefined) {
        setFaceImageUrl(data.faceImageUrl);
        setPhotoPreview(data.faceImageUrl);
      }
      if (data.annualIncome !== undefined) setAnnualIncome(data.annualIncome);
      if (data.financialAssets !== undefined) setFinancialAssets(data.financialAssets);
      if (data.realEstateAssets !== undefined) setRealEstateAssets(data.realEstateAssets);
      if (data.carAssets !== undefined) setCarAssets(data.carAssets);
      if (data.watchAssets !== undefined) setWatchAssets(data.watchAssets);
      if (data.mortgageDebt !== undefined) setMortgageDebt(data.mortgageDebt);
      if (data.carDebt !== undefined) setCarDebt(data.carDebt);
      if (data.scholarshipDebt !== undefined) setScholarshipDebt(data.scholarshipDebt);
      if (data.otherDebt !== undefined) setOtherDebt(data.otherDebt);
      if (data.academicDegree !== undefined) setAcademicDegree(data.academicDegree);
      if (data.universityName !== undefined) setUniversityName(data.universityName);
      if (data.customUniversityHensachi !== undefined) setCustomUniversityHensachi(data.customUniversityHensachi);
      if (data.iqScore !== undefined) setIqScore(data.iqScore);
      if (data.industryCode !== undefined) setIndustryCode(data.industryCode);
      if (data.occupationCode !== undefined) setOccupationCode(data.occupationCode);
      if (data.employmentType !== undefined) setEmploymentType(data.employmentType);
      if (data.positionCode !== undefined) setPositionCode(data.positionCode);
      if (data.companyName !== undefined) setCompanyName(data.companyName);
      if (data.companyCategory !== undefined) setCompanyCategory(data.companyCategory);
      if (data.userLanguages !== undefined) setUserLanguages(data.userLanguages);
      if (data.instagramFollowers !== undefined) setInstagramFollowers(data.instagramFollowers);
      if (data.xFollowers !== undefined) setXFollowers(data.xFollowers);
      if (data.tikTokFollowers !== undefined) setTikTokFollowers(data.tikTokFollowers);
      if (data.youTubeFollowers !== undefined) setYouTubeFollowers(data.youTubeFollowers);
      if (data.maritalStatus !== undefined) setMaritalStatus(data.maritalStatus);
      if (data.childrenCount !== undefined) setChildrenCount(data.childrenCount);
      if (data.mbti !== undefined) setMbti(data.mbti);
      if (data.travelCount !== undefined && data.travelCount !== '0' && data.travelCount !== 0) setTravelCount(String(data.travelCount));
    } catch (e) {
      console.error('Failed to load draft form data', e);
    }
  }, []);

  // Save draft form data on state changes
  useEffect(() => {
    try {
      const draft = {
        gender, age, prefectureId, height, weight, bodyFat, faceRating, faceImageUrl,
        annualIncome, financialAssets, realEstateAssets, carAssets, watchAssets,
        mortgageDebt, carDebt, scholarshipDebt, otherDebt,
        academicDegree, universityName, customUniversityHensachi, iqScore,
        industryCode, occupationCode, employmentType, positionCode, companyCategory,
        userLanguages, instagramFollowers, xFollowers, tikTokFollowers, youTubeFollowers,
        maritalStatus, childrenCount, mbti, travelCount,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft form data', e);
    }
  }, [
    gender, age, prefectureId, height, weight, bodyFat, faceRating, faceImageUrl,
    annualIncome, financialAssets, realEstateAssets, carAssets, watchAssets,
    mortgageDebt, carDebt, scholarshipDebt, otherDebt,
    academicDegree, universityName, customUniversityHensachi, iqScore,
    industryCode, occupationCode, employmentType, positionCode, companyName, companyCategory,
    userLanguages, instagramFollowers, xFollowers, tikTokFollowers, youTubeFollowers,
    maritalStatus, childrenCount, mbti, travelCount,
  ]);

  const handleResetForm = () => {
    if (!window.confirm('入力内容を全てリセットしてもよろしいですか？')) return;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setNickname('あなた');
    setGender('MALE');
    setAge('');
    setPrefectureId(13);
    setHeight('');
    setWeight('');
    setBodyFat('');
    setFaceRating('');
    setFaceImageUrl(null);
    setPhotoPreview(null);
    setAnnualIncome('');
    setFinancialAssets('');
    setRealEstateAssets('');
    setCarAssets('');
    setWatchAssets('');
    setMortgageDebt('');
    setCarDebt('');
    setScholarshipDebt('');
    setOtherDebt('');
    setAcademicDegree('');
    setUniversityName('');
    setCustomUniversityHensachi(null);
    setIqScore('');
    setIndustryCode('');
    setOccupationCode('');
    setEmploymentType('');
    setPositionCode('');
    setCompanyName('');
    setCompanyCategory('');
    setUserLanguages([{ languageCode: 'JA', level: 'NATIVE' }]);
    setInstagramFollowers(0);
    setXFollowers(0);
    setTikTokFollowers(0);
    setYouTubeFollowers(0);
    setMaritalStatus('');
    setChildrenCount('0');
    setMbti('');
    setTravelCount('0');
    setCurrentStep(1);
  };

  const handleIndustryChange = (newIndustry: string) => {
    setIndustryCode(newIndustry);
    setOccupationCode('');
  };

  const handleEmploymentTypeChange = (newType: string) => {
    setEmploymentType(newType as DiagnosisInputV3['employmentType']);
    setPositionCode('');
  };

  const addLanguage = () => {
    const existingCodes = new Set(userLanguages.map(l => l.languageCode));
    const nextLang = LANGUAGE_MASTER.find(l => !existingCodes.has(l.code)) || LANGUAGE_MASTER[0];
    setUserLanguages([
      ...userLanguages,
      { languageCode: nextLang.code, level: nextLang.code === 'EN' ? 'BUSINESS' : 'DAILY' },
    ]);
  };

  const removeLanguage = (idx: number) => {
    setUserLanguages(userLanguages.filter((_, i) => i !== idx));
  };

  const changeStep = (newStep: number, isPush = true) => {
    const targetStep = Math.max(1, Math.min(6, newStep));
    setCurrentStep(targetStep);
    if (isPush && typeof window !== 'undefined') {
      window.history.pushState({ step: targetStep }, '', `/?step=${targetStep}`);
    }
  };

  // Sync step with URL / history back button & scroll to top on step change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.step === 'number') {
        setCurrentStep(e.state.step);
      } else {
        const params = new URLSearchParams(window.location.search);
        const stepParam = Number(params.get('step')) || 1;
        setCurrentStep(stepParam);
      }
      window.scrollTo(0, 0);
    };

    const params = new URLSearchParams(window.location.search);
    const stepParam = Number(params.get('step'));
    if (stepParam >= 1 && stepParam <= 6) {
      setCurrentStep(stepParam);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNextStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      const cleanAge = toHalfWidthDigits(age);
      if (!cleanAge || Number(cleanAge) <= 0) {
        setErrorMsg('年齢を入力してください。');
        return;
      }
    }
    if (currentStep === 2) {
      const cleanHeight = toHalfWidthDigits(height);
      const cleanWeight = toHalfWidthDigits(weight);
      if (!cleanHeight || Number(cleanHeight) <= 0) {
        setErrorMsg('身長を入力してください。');
        return;
      }
      if (!cleanWeight || Number(cleanWeight) <= 0) {
        setErrorMsg('体重を入力してください。');
        return;
      }
      if (!faceRating) {
        setErrorMsg('雰囲気・第一印象の自己評価を選択してください。');
        return;
      }
    }
    if (currentStep === 3) {
      const cleanIncome = toHalfWidthDigits(annualIncome);
      if (!cleanIncome || Number(cleanIncome) < 0) {
        setErrorMsg('額面年収を入力してください。');
        return;
      }
      if (financialAssets === '' && realEstateAssets === '' && carAssets === '' && watchAssets === '') {
        setErrorMsg('総資産の内訳を入力してください（「資産なし (0万円)」ボタンもご利用いただけます）。');
        return;
      }
      if (mortgageDebt === '' && carDebt === '' && scholarshipDebt === '' && otherDebt === '') {
        setErrorMsg('負債の内訳を入力してください（「負債なし (0万円)」ボタンもご利用いただけます）。');
        return;
      }
    }
    if (currentStep === 4) {
      if (!academicDegree) {
        setErrorMsg('最終学歴を選択してください。');
        return;
      }
      if (!employmentType) {
        setErrorMsg('雇用形態を選択してください。');
        return;
      }
    }
    changeStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    const cleanAge = toHalfWidthDigits(age);
    const cleanHeight = toHalfWidthDigits(height);
    const cleanWeight = toHalfWidthDigits(weight);
    const cleanIncome = toHalfWidthDigits(annualIncome);

    if (!cleanAge || Number(cleanAge) <= 0) {
      setErrorMsg('年齢を入力してください。');
      setLoading(false);
      setCurrentStep(1);
      return;
    }
    if (!cleanHeight || Number(cleanHeight) <= 0) {
      setErrorMsg('身長を入力してください。');
      setLoading(false);
      setCurrentStep(2);
      return;
    }
    if (!cleanWeight || Number(cleanWeight) <= 0) {
      setErrorMsg('体重を入力してください。');
      setLoading(false);
      setCurrentStep(2);
      return;
    }
    if (!faceRating) {
      setErrorMsg('雰囲気・第一印象の自己評価を選択してください。');
      setLoading(false);
      setCurrentStep(2);
      return;
    }
    if (!cleanIncome || Number(cleanIncome) < 0) {
      setErrorMsg('額面年収を入力してください。');
      setLoading(false);
      setCurrentStep(3);
      return;
    }
    if (financialAssets === '' && realEstateAssets === '' && carAssets === '' && watchAssets === '') {
      setErrorMsg('総資産の内訳を入力してください（「資産なし (0万円)」ボタンもご利用いただけます）。');
      setLoading(false);
      setCurrentStep(3);
      return;
    }
    if (mortgageDebt === '' && carDebt === '' && scholarshipDebt === '' && otherDebt === '') {
      setErrorMsg('負債の内訳を入力してください（「負債なし (0万円)」ボタンもご利用いただけます）。');
      setLoading(false);
      setCurrentStep(3);
      return;
    }
    if (!academicDegree) {
      setErrorMsg('最終学歴を選択してください。');
      setLoading(false);
      setCurrentStep(4);
      return;
    }
    if (!employmentType) {
      setErrorMsg('雇用形態を選択してください。');
      setLoading(false);
      setCurrentStep(4);
      return;
    }

    try {
      const selectedPref = PREFECTURES[prefectureId - 1] || '東京都';

      const payload: DiagnosisInputV3 = {
        nickname: nickname.trim() !== '' ? nickname.trim() : 'あなた',
        gender,
        age: Number(cleanAge),
        prefectureId: Number(prefectureId),
        prefectureName: selectedPref,
        height: Number(cleanHeight),
        weight: Number(cleanWeight),
        bodyFat: bodyFat !== '' ? Number(toHalfWidthDigits(bodyFat)) : null,
        faceRating: faceRating ? faceRating : null,
        faceImageUrl: faceImageUrl || null,
        annualIncome: Number(cleanIncome),
        financialAssets: financialAssets !== '' ? Number(toHalfWidthDigits(financialAssets)) : null,
        realEstateAssets: realEstateAssets !== '' ? Number(toHalfWidthDigits(realEstateAssets)) : null,
        carAssets: carAssets !== '' ? Number(toHalfWidthDigits(carAssets)) : null,
        watchAssets: watchAssets !== '' ? Number(toHalfWidthDigits(watchAssets)) : null,
        mortgageDebt: mortgageDebt !== '' ? Number(toHalfWidthDigits(mortgageDebt)) : null,
        carDebt: carDebt !== '' ? Number(toHalfWidthDigits(carDebt)) : null,
        scholarshipDebt: scholarshipDebt !== '' ? Number(toHalfWidthDigits(scholarshipDebt)) : null,
        otherDebt: otherDebt !== '' ? Number(toHalfWidthDigits(otherDebt)) : null,
        academicDegree: academicDegree ? (academicDegree as DiagnosisInputV3['academicDegree']) : null,
        universityName: universityName.trim() !== '' ? universityName.trim() : null,
        customUniversityHensachi: customUniversityHensachi !== null ? Number(customUniversityHensachi) : null,
        iqScore: iqScore !== '' ? Number(toHalfWidthDigits(iqScore)) : null,
        industryCode,
        occupationCode,
        employmentType: employmentType || 'REGULAR',
        positionCode: positionCode !== '' ? positionCode : null,
        companyName: companyName.trim() !== '' ? companyName.trim() : null,
        companyCategory: companyCategory !== '' ? (companyCategory as any) : null,
        languages: userLanguages,
        travelCount: travelCount !== '' ? Number(toHalfWidthDigits(travelCount)) : null,
        maritalStatus: maritalStatus !== '' ? maritalStatus : null,
        childrenCount: childrenCount !== '' ? Number(toHalfWidthDigits(childrenCount)) : 0,
        mbti: mbti !== '' ? mbti : null,
        instagramFollowers: Number(instagramFollowers) || 0,
        xFollowers: Number(xFollowers) || 0,
        tikTokFollowers: Number(tikTokFollowers) || 0,
        youTubeFollowers: Number(youTubeFollowers) || 0,
      };

      setLoading(true);
      const minAnimationPromise = new Promise(r => setTimeout(r, 2200));

      const [res] = await Promise.all([
        fetch('/api/diagnosis/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        minAnimationPromise,
      ]);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '計算エラーが発生しました。');
      }

      try {
        localStorage.setItem(`spec_check_result_${data.result.diagnosisId}`, JSON.stringify(data.result));
        localStorage.setItem('spec_check_latest_result', JSON.stringify(data.result));
      } catch (e) {
        console.error('Failed to cache result to localStorage', e);
      }

      router.push(`/result/${data.result.diagnosisId}?tab=${activeTab.toLowerCase()}`);
    } catch (err: any) {
      setErrorMsg(err.message || '診断に失敗しました。');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      {/* 🚀 Dedicated Full-Screen High-Tech AI Analysis Loading Screen */}
      {loading && (
        <AnalysisLoadingScreen
          gender={gender}
          age={toHalfWidthDigits(age) || '25'}
          prefectureName={PREFECTURES[prefectureId - 1] || '東京都'}
          isLoveMode={activeTab === 'LOVE'}
        />
      )}
      {/* 1st View Hero Header & Mode Selector (Step 1 のみ表示) */}
      {currentStep === 1 && (
        <>
          {/* 1st View Hero Banner (スマホ画面最大・迫力ズーム表示) */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8 border border-pink-500/40 shadow-2xl shadow-pink-500/15 bg-slate-950 -mx-4 sm:-mx-6 md:-mx-16 lg:-mx-28 hover:border-pink-500/60 transition-all duration-300">
            <h1 className="sr-only">
              人間スペック診断 - あなたの総合＆恋愛スペック、全国でどのレベル？ (20代オタク男子 年収300万、30代バリキャリ女子 年収700万、10代ギャルJK パパのお小遣い、40代居酒屋店長 年収500万、50代金持ち風紳士 年収3000万、恋愛婚活価値)
            </h1>
            <img
              src="/hero_shibuya_annotated.jpg"
              alt="人間スペック診断 - あなたの総合＆恋愛スペック、全国でどのレベル？"
              className="w-full h-auto block rounded-2xl sm:rounded-3xl shadow-lg"
            />
          </div>

          {/* Catchphrase & Feature Highlights */}
          <div className="mb-8 text-center max-w-2xl mx-auto px-2">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2.5 tracking-wide drop-shadow-md">
              <span className="inline-block">同世代の日本人で比較！</span>
              <span className="inline-block">あなたのスペックは上位何％？</span>
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4 font-bold drop-shadow-sm">10代Z世代から50代ハイクラス層まで！年収・学歴・容姿・SNS影響力・恋愛婚活価値など多角的な評価軸と公的統計データに基づき、ギャル・オタク・バリキャリ・経営者といった多彩な日本人属性とあなたの「人間スペック・同世代偏差値」を即座に精密比較・分析します。</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <div className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-md whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" /> 全世代・多様属性モデル
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-md whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" /> 公的統計オープンデータ
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-950/80 border border-pink-500/40 text-pink-300 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-md whitespace-nowrap">
                <Heart className="w-3 h-3 text-pink-400 shrink-0" /> 総合＆恋愛スペック対応
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="max-w-md mx-auto mb-8 relative z-20">
            <div className="text-center mb-2.5">
              <span className="text-[11px] sm:text-xs font-extrabold text-slate-300 inline-flex items-center gap-1.5 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> タップして診断モードを切り替え
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950 p-1.5 border border-slate-800 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setActiveTab('JAPAN')}
                className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all duration-300 ${
                  activeTab === 'JAPAN'
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-400/50 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
                <span>総合スペック診断</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('LOVE')}
                className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all duration-300 ${
                  activeTab === 'LOVE'
                    ? 'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-400/50 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-300 fill-rose-300 shrink-0" />
                <span>恋愛スペック診断</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span>STEP {currentStep} OF 6</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${
              activeTab === 'LOVE'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
            }`}>
              {activeTab === 'LOVE' ? '❤️ 恋愛スペックモード' : '✨ 総合スペックモード'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {currentStep === 1 && '基本情報'}
              {currentStep === 2 && '身体・容姿'}
              {currentStep === 3 && '年収・純資産'}
              {currentStep === 4 && '学歴・キャリア'}
              {currentStep === 5 && '語学・SNS'}
              {currentStep === 6 && '恋愛・ライフスタイル'}
            </span>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-[10px] text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/50 rounded-lg px-2 py-0.5 transition-all"
            >
              リセット
            </button>
          </div>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500 transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Form Container */}
      <div className="glass-surface glass-surface-glow rounded-3xl p-6 md:p-8 mb-8">
        {/* Step 1: 基本情報 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-400" /> 1. 基本情報
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                ニックネーム <span className="px-1.5 py-0.5 ml-1.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">デフォルト: あなた</span>
              </label>
              <input
                type="text"
                placeholder="例: タカシ, あなた"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                性別 <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender('MALE')}
                  className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                    gender === 'MALE'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  男性
                </button>
                <button
                  type="button"
                  onClick={() => setGender('FEMALE')}
                  className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                    gender === 'FEMALE'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  女性
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  年齢 (歳) <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="例: 28"
                  value={age}
                  onChange={e => setAge(toHalfWidthDigits(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  居住地 <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <select
                  value={prefectureId}
                  onChange={e => setPrefectureId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {PREFECTURES.map((pref, idx) => (
                    <option key={pref} value={idx + 1}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 身体データ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 2. 身体データ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  身長 (cm) <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="例: 172"
                  value={height}
                  onChange={e => setHeight(toHalfWidthDigits(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  体重 (kg) <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="例: 65"
                  value={weight}
                  onChange={e => setWeight(toHalfWidthDigits(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  体脂肪率 (%) <span className="text-slate-500 text-[10px]">任意</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="例: 15.5"
                  value={bodyFat}
                  onChange={e => setBodyFat(toHalfWidthDigits(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* 容姿・第一印象 & 顔写真 (任意) */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h3 className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" /> 容姿・第一印象評価 <span className="text-slate-500 font-normal text-[10px]">（顔写真は任意）</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    雰囲気・第一印象の自己評価 <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                  </label>
                  <select
                    value={faceRating || ''}
                    onChange={e => setFaceRating(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">選択してください ※必須</option>
                    <option value="MODEL_LEVEL">モデル・インフルエンサー級 (美形・圧倒的ルックス)</option>
                    <option value="ABOVE_AVERAGE">上位クラス (整った容姿・清潔感があり良く褒められる)</option>
                    <option value="AVERAGE">平均的 (一般的ルックス・親しみやすい印象)</option>
                    <option value="BELOW_AVERAGE">改善の余地あり (あまり自信がない)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    2. 顔写真アップロード <span className="text-slate-500 font-normal">（任意・AI解析ボーナス +5〜10pt）</span>
                  </label>

                  {photoPreview ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-emerald-500/40">
                      <img src={photoPreview} alt="Face Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 顔写真AI解析適用中 (+ボーナスpt)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">登録完了 (プレビュー表示中)</div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFacePhoto}
                        className="px-2 py-1 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-bold transition-all"
                      >
                        削除
                      </button>
                    </div>
                  ) : (
                    <label className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all">
                      <Plus className="w-4 h-4 text-indigo-400" /> 顔写真を選択・カメラで撮影
                      <input type="file" accept="image/*" onChange={handleFacePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 経済 & 純資産 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 3. 経済 & 純資産 (総資産 - 負債)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                額面年収 (万円) <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="例: 500"
                value={annualIncome}
                onChange={e => setAnnualIncome(toHalfWidthDigits(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="border-t border-slate-800 pt-4">
              {(() => {
                const isNoAssets = financialAssets === '0' && realEstateAssets === '0' && carAssets === '0' && watchAssets === '0';
                return (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2">
                      総資産 内訳 (万円) <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                    </h3>
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isNoAssets) {
                            setFinancialAssets('');
                            setRealEstateAssets('');
                            setCarAssets('');
                            setWatchAssets('');
                          } else {
                            setFinancialAssets('0');
                            setRealEstateAssets('0');
                            setCarAssets('0');
                            setWatchAssets('0');
                          }
                        }}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center cursor-pointer shadow-sm border ${
                          isNoAssets
                            ? 'bg-slate-800/95 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50 shadow-indigo-950/50'
                            : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {isNoAssets ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                            資産なし (選択中)
                          </>
                        ) : (
                          '資産なし'
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">金融資産 (預金・株式)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 1000 または 0"
                    value={financialAssets}
                    onChange={e => setFinancialAssets(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">不動産評価額</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 3000 または 0"
                    value={realEstateAssets}
                    onChange={e => setRealEstateAssets(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">車</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 300 または 0"
                    value={carAssets}
                    onChange={e => setCarAssets(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">時計・その他</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 100 または 0"
                    value={watchAssets}
                    onChange={e => setWatchAssets(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 負債の内訳 */}
            <div className="border-t border-slate-800 pt-4">
              {(() => {
                const isNoDebts = mortgageDebt === '0' && carDebt === '0' && scholarshipDebt === '0' && otherDebt === '0';
                return (
                  <>
                    <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-2">
                      負債 内訳 (万円) <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                    </h3>
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isNoDebts) {
                            setMortgageDebt('');
                            setCarDebt('');
                            setScholarshipDebt('');
                            setOtherDebt('');
                          } else {
                            setMortgageDebt('0');
                            setCarDebt('0');
                            setScholarshipDebt('0');
                            setOtherDebt('0');
                          }
                        }}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center cursor-pointer shadow-sm border ${
                          isNoDebts
                            ? 'bg-slate-800/95 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50 shadow-indigo-950/50'
                            : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {isNoDebts ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                            負債なし (選択中)
                          </>
                        ) : (
                          '負債なし'
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">住宅ローン</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 2500"
                    value={mortgageDebt}
                    onChange={e => setMortgageDebt(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">自動車ローン</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 200"
                    value={carDebt}
                    onChange={e => setCarDebt(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">奨学金・教育ローン</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 150"
                    value={scholarshipDebt}
                    onChange={e => setScholarshipDebt(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">その他借入・カード等</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="例: 50"
                    value={otherDebt}
                    onChange={e => setOtherDebt(toHalfWidthDigits(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 学歴・業種・職種・雇用形態・役職 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> 4. 学歴・業種・職種
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  最終学歴 <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <select
                  value={academicDegree || ''}
                  onChange={e => {
                    const newDegree = e.target.value as any;
                    setAcademicDegree(newDegree);
                    if (!['BACHELOR', 'MASTER', 'DOCTOR'].includes(newDegree)) {
                      setUniversityName('');
                      setCustomUniversityHensachi(null);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
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

              {Boolean(academicDegree && ['BACHELOR', 'MASTER', 'DOCTOR'].includes(academicDegree)) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    出身大学・大学院名
                  </label>
                  <UniversityAutocomplete
                    value={universityName}
                    customHensachi={customUniversityHensachi}
                    onChange={(val, isMatched, customH) => {
                      setUniversityName(val);
                      setCustomUniversityHensachi(customH || null);
                    }}
                  />
                </div>
              )}
            </div>

            {/* 推定IQ・知能指数 (任意) */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                推定IQ・知能指数
                <span className="block text-[11px] text-slate-500 font-normal mt-0.5">（任意・未入力の場合は学歴から自動推計）</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="例: 115 (MENSA測定値や各種IQテスト数値)"
                value={iqScore}
                onChange={e => setIqScore(toHalfWidthDigits(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* 業種 ➔ 職種 2段階絞り込み */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-2">
                  1. 業種を選択
                </label>
                <select
                  value={industryCode}
                  onChange={e => handleIndustryChange(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="">選択してください</option>
                  {INDUSTRY_MASTER.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-2">
                  2. 職種を選択
                </label>
                <select
                  value={occupationCode}
                  onChange={e => setOccupationCode(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="">{industryCode ? '選択してください' : '業種を先に選択してください'}</option>
                  {availableOccupations.map(occ => (
                    <option key={occ.id} value={occ.id}>
                      {occ.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 雇用形態と連動する役職 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  雇用形態 <span className="px-1.5 py-0.5 ml-1.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">※必須</span>
                </label>
                <select
                  value={employmentType}
                  onChange={e => handleEmploymentTypeChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    役職
                  </label>
                  <select
                    value={positionCode}
                    onChange={e => setPositionCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  >
                    <option value="">{employmentType ? '選択してください' : '雇用形態を先に選択してください'}</option>
                    {availablePositions.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 勤務先・企業名 (オートコンプリート検索) */}
            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                勤務先・企業名
                <span className="block text-[11px] text-slate-500 font-normal mt-0.5">（任意・上場企業 / 有名外資マスタ自動判定）</span>
              </label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-2">勤務先企業規模 (任意区分)</label>
              <select
                value={companyCategory || ''}
                onChange={e => setCompanyCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
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
        )}

        {/* Step 5: 語学 & SNS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400" /> 5. 語学能力 & SNSフォロワー数
            </h2>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3">
                習得言語 (複数選択)
              </label>

              <div className="space-y-3">
                {userLanguages.map((lang, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 w-full overflow-hidden">
                    <div className="flex-1 min-w-0">
                      <select
                        value={lang.languageCode}
                        onChange={e => {
                          const updated = [...userLanguages];
                          updated[idx].languageCode = e.target.value;
                          setUserLanguages(updated);
                        }}
                        className="w-full bg-slate-800 text-xs text-white rounded-lg px-2.5 sm:px-3 py-2 border border-slate-700 focus:outline-none truncate"
                      >
                        {LANGUAGE_MASTER.map(l => (
                          <option key={l.code} value={l.code}>
                            {l.nameJa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-0">
                      <select
                        value={lang.level}
                        onChange={e => {
                          const updated = [...userLanguages];
                          updated[idx].level = e.target.value as any;
                          setUserLanguages(updated);
                        }}
                        className="w-full bg-slate-800 text-xs text-white rounded-lg px-2.5 sm:px-3 py-2 border border-slate-700 focus:outline-none truncate"
                      >
                        <option value="BASIC">基礎レベル・挨拶程度</option>
                        <option value="DAILY">日常会話</option>
                        <option value="BUSINESS">ビジネスレベル</option>
                        <option value="NATIVE">ネイティブ</option>
                      </select>
                    </div>

                    {userLanguages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(idx)}
                        className="p-1.5 sm:p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 下部に配置した言語追加ボタンタブ */}
              <button
                type="button"
                onClick={addLanguage}
                className="w-full py-3.5 mt-3 rounded-xl bg-slate-900/90 hover:bg-indigo-950/40 border border-dashed border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 text-indigo-400" /> 言語を追加 ＋
              </button>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3">
                SNS フォロワー数
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Instagram フォロワー</label>
                  <select
                    value={instagramFollowers}
                    onChange={e => setInstagramFollowers(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SNS_FOLLOWER_BRACKETS.map(b => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">X (Twitter) フォロワー</label>
                  <select
                    value={xFollowers}
                    onChange={e => setXFollowers(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SNS_FOLLOWER_BRACKETS.map(b => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">TikTok フォロワー</label>
                  <select
                    value={tikTokFollowers}
                    onChange={e => setTikTokFollowers(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SNS_FOLLOWER_BRACKETS.map(b => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">YouTube チャンネル登録者</label>
                  <select
                    value={youTubeFollowers}
                    onChange={e => setYouTubeFollowers(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {SNS_FOLLOWER_BRACKETS.map(b => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: 恋愛 & 渡航国数 & MBTI */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 6. 恋愛ステータス・渡航国数・MBTI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">配偶関係</label>
                <select
                  value={maritalStatus}
                  onChange={e => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value="">選択してください</option>
                  <option value="SINGLE">未婚</option>
                  <option value="MARRIED">既婚</option>
                  <option value="DIVORCED">離婚歴あり</option>
                  <option value="BEREAVED">死別</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">子どもの有無 (人)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="例: 0"
                  value={childrenCount}
                  onChange={e => setChildrenCount(toHalfWidthDigits(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  MBTI
                </label>
                <select
                  value={mbti}
                  onChange={e => setMbti(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white"
                >
                  <option value="">選択してください (わからない/未測定)</option>
                  {MBTI_MASTER.map(m => (
                    <option key={m.code} value={m.code}>
                      {m.nameJa}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                渡航・訪問したことのある国・地域の数 (か国)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="例: 3 (未入力可能)"
                value={travelCount}
                onChange={e => setTravelCount(toHalfWidthDigits(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                changeStep(currentStep - 1);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> 戻る
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
            >
              次へ <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? '解析中...' : 'スペック診断を実行する'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}
      </div>
    </main>
  );
}
