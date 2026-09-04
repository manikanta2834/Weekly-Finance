import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Coins,
  DollarSign,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { calculateLoan, formatINR } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { Borrower } from '../../types';

interface AddLoanModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    date: string;
    mobile_number: string;
    city_name: string;
    surity: string;
    amount: number;
    weekly_amount: number;
    duration_weeks: number;
  }) => void;
  editingBorrower?: Borrower | null;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  onClose,
  onSubmit,
  editingBorrower,
}) => {
  const { t } = useI18n();

  const [name, setName] = useState(editingBorrower?.name || '');
  const [date, setDate] = useState(
    editingBorrower?.date || new Date().toISOString().split('T')[0]
  );
  const [mobileNumber, setMobileNumber] = useState(editingBorrower?.mobile_number || '');
  const [cityName, setCityName] = useState(editingBorrower?.city_name || '');
  const [surity, setSurity] = useState(editingBorrower?.surity || '');

  // Supported weekly collection values
  const ALLOWED_WEEKLY_VALUES = [600, 800, 1000] as const;

  const [amount, setAmount] = useState<number>(() => {
    if (editingBorrower?.amount) return editingBorrower.amount;
    return 10000;
  });
  const [weeklyAmount, setWeeklyAmount] = useState<number>(() => {
    if (editingBorrower?.weekly_amount && [600, 800, 1000].includes(editingBorrower.weekly_amount)) {
      return editingBorrower.weekly_amount;
    }
    return 600;
  });
  const [durationWeeks, setDurationWeeks] = useState<number>(editingBorrower?.duration_weeks || 21);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Live Auto-Calculation using the Single Source of Truth
  const calculation = calculateLoan(amount, weeklyAmount, durationWeeks);

  // Preset Handlers aligned with 600, 800, 1000 weekly amounts
  const applyPreset = (pAmount: number, pWeekly: number, pWeeks: number) => {
    setAmount(pAmount);
    setWeeklyAmount(pWeekly);
    setDurationWeeks(pWeeks);
  };

  // When changing weekly amount directly
  const handleWeeklySelect = (val: number) => {
    setWeeklyAmount(val);
    // Suggest standard matching principal if current principal is matching default tiers
    if (val === 600 && (amount === 13000 || amount === 16000)) {
      setAmount(10000);
    } else if (val === 800 && (amount === 10000 || amount === 16000)) {
      setAmount(13000);
    } else if (val === 1000 && (amount === 10000 || amount === 13000)) {
      setAmount(16000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobileNumber.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit({
        name,
        date,
        mobile_number: mobileNumber,
        city_name: cityName || 'General',
        surity: surity || 'Self',
        amount,
        weekly_amount: weeklyAmount,
        duration_weeks: durationWeeks,
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col bg-[#061d1a] border border-[#10332e] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#10332e] bg-[#041513] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#e0e7e6]">
                {editingBorrower ? t('modal.editLoanTitle') : t('modal.addLoanTitle')}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#8ba39e]">
                Auto-generates {durationWeeks}-week payment ledger with zero math errors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#0a2924] text-[#8ba39e] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Quick Preset Selector Chips */}
          <div>
            <label className="text-xs font-semibold text-[#8ba39e] block mb-1.5">
              Common 21-Week Ledger Presets (₹600, ₹800, ₹1,000 Weekly)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => applyPreset(10000, 600, 21)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  amount === 10000 && weeklyAmount === 600 && durationWeeks === 21
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-[#041513] border-[#10332e] text-[#8ba39e] hover:bg-[#0a2924]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="text-[#e0e7e6] text-xs">Standard Tier</strong>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">₹600/wk</span>
                </div>
                <div className="text-[11px] font-mono text-[#e0e7e6]">₹10,000 Principal</div>
                <span className="text-[10px] text-[#8ba39e] block mt-0.5">₹600 × 21 wks → ₹12,600 (+₹2.6k)</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(13000, 800, 21)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  amount === 13000 && weeklyAmount === 800 && durationWeeks === 21
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-[#041513] border-[#10332e] text-[#8ba39e] hover:bg-[#0a2924]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="text-[#e0e7e6] text-xs">Medium Tier</strong>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">₹800/wk</span>
                </div>
                <div className="text-[11px] font-mono text-[#e0e7e6]">₹13,000 Principal</div>
                <span className="text-[10px] text-[#8ba39e] block mt-0.5">₹800 × 21 wks → ₹16,800 (+₹3.8k)</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(16000, 1000, 21)}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                  amount === 16000 && weeklyAmount === 1000 && durationWeeks === 21
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-[#041513] border-[#10332e] text-[#8ba39e] hover:bg-[#0a2924]'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <strong className="text-[#e0e7e6] text-xs">High Tier</strong>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400">₹1,000/wk</span>
                </div>
                <div className="text-[11px] font-mono text-[#e0e7e6]">₹16,000 Principal</div>
                <span className="text-[10px] text-[#8ba39e] block mt-0.5">₹1,000 × 21 wks → ₹21,000 (+₹5.0k)</span>
              </button>
            </div>
          </div>

          {/* Section 1: Borrower Personal & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                {t('borrower.name')} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy (రమేష్)"
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                {t('borrower.mobile')} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9848012345"
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                {t('borrower.city')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Guntur / Vijayawada"
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                {t('borrower.surity')} (Guarantor)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#8ba39e] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={surity}
                  onChange={(e) => setSurity(e.target.value)}
                  placeholder="e.g. K. Srinivas Rao"
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Loan Financial Terms */}
          <div className="pt-3 sm:pt-4 border-t border-[#10332e]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 sm:mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Loan Financial Terms & Auto-Calculation</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-3.5 items-start">
              {/* Start Date */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                  {t('borrower.startDate')}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl px-3 py-2 text-xs text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Principal Amount */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                  {t('borrower.principal')} (₹)
                </label>
                <input
                  type="number"
                  step="500"
                  min="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl px-3 py-2 text-sm font-mono text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Weekly Collection (600, 800, 1000 ONLY) */}
              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-[#8ba39e] flex items-center justify-between mb-1">
                  <span>{t('borrower.weeklyAmount')} (₹)</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">₹{weeklyAmount}/wk</span>
                </label>
                
                {/* Dedicated 600, 800, 1000 Buttons */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#041513] border border-[#10332e]">
                  {ALLOWED_WEEKLY_VALUES.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleWeeklySelect(val)}
                      className={`py-2 px-1 text-center rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        weeklyAmount === val
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 shadow-md scale-[1.02]'
                          : 'text-[#8ba39e] hover:text-[#e0e7e6] hover:bg-[#0a2924]'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Weeks */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#8ba39e] block mb-1">
                  {t('borrower.duration')}
                </label>
                <div className="flex gap-1">
                  {[20, 21, 24].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDurationWeeks(w)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        durationWeeks === w
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#041513] text-[#8ba39e] border-[#10332e] hover:bg-[#0a2924]'
                      }`}
                    >
                      {w}w
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Dynamic Result Calculation Summary Box */}
          <div className="bg-[#041513] border border-emerald-500/40 rounded-2xl p-3 sm:p-4.5 space-y-2.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#10332e]/60 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('modal.liveSummary')}</span>
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold bg-[#061d1a] px-2.5 py-1 rounded-lg border border-[#10332e]">
                {formatINR(weeklyAmount)} × {durationWeeks} wks = {formatINR(calculation.totalAmount)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="bg-[#061d1a] p-2 sm:p-2.5 rounded-xl border border-[#10332e]">
                <span className="text-[9px] sm:text-[10px] text-[#8ba39e] block mb-0.5 truncate">Principal Out</span>
                <span className="text-xs sm:text-base font-black text-[#e0e7e6] font-mono block truncate">
                  {formatINR(calculation.principalAmount)}
                </span>
              </div>

              <div className="bg-emerald-950/40 p-2 sm:p-2.5 rounded-xl border border-emerald-500/30">
                <span className="text-[9px] sm:text-[10px] text-emerald-300 block mb-0.5 truncate">{t('modal.projectedReturn')}</span>
                <span className="text-xs sm:text-base font-black text-emerald-300 font-mono block truncate">
                  {formatINR(calculation.totalAmount)}
                </span>
              </div>

              <div className="bg-amber-950/40 p-2 sm:p-2.5 rounded-xl border border-amber-500/30">
                <span className="text-[9px] sm:text-[10px] text-amber-300 block mb-0.5 truncate">{t('modal.pureProfit')}</span>
                <span className="text-xs sm:text-base font-black text-amber-300 font-mono block truncate">
                  +{formatINR(calculation.interestAmount)}
                </span>
                <span className="text-[8px] sm:text-[9px] text-amber-400/90 block mt-0.5 font-semibold truncate">
                  +{formatINR(calculation.weeklyInterestGain)}/wk
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-[#041513] hover:bg-[#0a2924] text-[#8ba39e] hover:text-white border border-[#10332e] text-xs font-bold transition-all cursor-pointer"
            >
              {t('modal.cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitted}
              className="flex-2 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-bounce" />
                  <span>Creating Schedule...</span>
                </>
              ) : (
                <>
                  <span>{editingBorrower ? t('modal.submitEdit') : t('modal.submitAdd')}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
