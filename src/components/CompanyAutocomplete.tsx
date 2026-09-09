'use client';

import { useState, useEffect, useRef } from 'react';
import { CompanyMasterItem } from '@/lib/datasets/company-master';
import { Check, Search, Building2, TrendingUp, Sparkles } from 'lucide-react';

interface CompanyAutocompleteProps {
  value: string;
  companyCategory?: string | null;
  onChange: (companyName: string, matchedCategory?: string | null) => void;
}

export default function CompanyAutocomplete({ value, companyCategory, onChange }: CompanyAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<CompanyMasterItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CompanyMasterItem | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/masters/companies?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.companies) {
          setSuggestions(data.companies);
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Failed to fetch company suggestions', e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMaster = (item: CompanyMasterItem) => {
    setSelectedItem(item);
    setQuery(item.name);

    let categoryKey = 'LARGE';
    if (item.marketCategory === 'GLOBAL_TOP') categoryKey = 'LARGE_PRIME';
    else if (item.marketCategory === 'PRIME') categoryKey = 'LARGE_PRIME';
    else if (item.marketCategory === 'GROWTH') categoryKey = 'MEDIUM';
    else if (item.marketCategory === 'STANDARD') categoryKey = 'LARGE';
    else if (item.marketCategory === 'UNLISTED_FAMOUS') categoryKey = 'LARGE';

    onChange(item.name, categoryKey);
    setIsOpen(false);
  };

  const handleSelectFreeText = () => {
    setSelectedItem(null);
    onChange(query.trim(), companyCategory || null);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedItem(null);
    onChange(val, companyCategory || null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-2">
      <div className="relative flex items-center">
        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="勤務先・企業名を入力 (例: トヨタ自動車, キーエンス, Google)"
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-base sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 pointer-events-none" />
      </div>

      {/* Selected Master Status Badge */}
      {selectedItem && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              {selectedItem.name} ({selectedItem.industry})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px]">
              {selectedItem.marketCategoryLabel}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              平均年収 {selectedItem.averageAnnualSalary.toLocaleString()}万円
            </span>
          </div>
        </div>
      )}

      {/* Glassmorphic Autocomplete Dropdown List (完全ソリッド遮蔽背景) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl z-[100] max-h-72 overflow-y-auto divide-y divide-slate-800/60">
          {suggestions.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectMaster(item)}
              className="w-full px-4 py-3 text-left hover:bg-indigo-600/20 transition-all flex items-center justify-between group gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 truncate">
                    {item.name}
                  </span>
                  {item.stockCode && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                      {item.stockCode}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                  {item.industry} ・ {item.location || '日本'}
                </span>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] border border-indigo-500/30">
                  {item.marketCategoryLabel}
                </span>
                <div className="text-[11px] font-bold text-amber-300 flex items-center justify-end gap-0.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  年収 {item.averageAnnualSalary.toLocaleString()}万
                </div>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={handleSelectFreeText}
            className="w-full px-4 py-3 text-left hover:bg-indigo-600/20 transition-all flex items-center justify-between text-indigo-300 font-bold text-xs"
          >
            <span>一覧に該当がない場合「{query}」を直接入力</span>
            <span className="text-[10px] font-semibold underline text-indigo-400">決定</span>
          </button>
        </div>
      )}
    </div>
  );
}
