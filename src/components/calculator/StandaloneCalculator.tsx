import {
  ArrowRight,
  Calculator as CalcIcon,
  CheckCircle,
  Coins,
  Copy,
  Download,
  Info,
  Layers,
  RotateCcw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';
import { calculateLoan, formatINR } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';

interface StandaloneCalculatorProps {
  onAddLoanFromCalc?: (data: {
    amount: number;
    weeklyAmount: number;
    durationWeeks: number;
  }) => void;
}

export const StandaloneCalculator: React.FC<StandaloneCalculatorProps> = ({
  onAddLoanFromCalc,
}) => {
  const { t, language } = useI18n();

  const [amount, setAmount] = useState<number>(10000);
  const [weeklyAmount, setWeeklyAmount] = useState<number>(600);
  const [durationWeeks, setDurationWeeks] = useState<number>(21);
  const [copied, setCopied] = useState(false);

  const calc = calculateLoan(amount, weeklyAmount, durationWeeks);

  const handleCopySummary = () => {
    const text = `Vaddi Vault Calculation Summary:\n- Principal Lent: ${formatINR(amount)}\n- Weekly Installment: ${formatINR(weeklyAmount)}\n- Duration: ${durationWeeks} Weeks\n- Total Collection: ${formatINR(calc.totalAmount)}\n- Interest Profit: ${formatINR(calc.interestAmount)} (${calc.roiPercentage.toFixed(1)}% ROI)\n- Weekly Profit Gain: ${formatINR(calc.weeklyInterestGain)} / week`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in px-1 sm:px-0">
      <div className="bg-[#061d1a]/95 border border-[#10332e] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#10332e] pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <CalcIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-[#e0e7e6] font-['Plus_Jakarta_Sans']">
                {language === 'te' ? 'వడ్డీ కాలిక్యులేటర్ & వారపు ప్రణాళిక' : 'Weekly Interest Calculator & Growth Engine'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8ba39e]">
                Formula: Total = Weekly × Weeks • Interest = Total − Principal
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl bg-[#041513] hover:bg-[#0a2924] border border-[#10332e] text-xs font-semibold text-[#8ba39e] hover:text-[#e0e7e6] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>{copied ? 'Copied Summary!' : 'Copy Summary'}</span>
          </button>
        </div>

        {/* Input Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {/* Principal */}
          <div className="space-y-2 bg-[#041513] p-3.5 sm:p-4 rounded-2xl border border-[#10332e]">
            <label className="text-xs font-semibold text-[#8ba39e] flex justify-between">
              <span>{t('borrower.principal')}</span>
              <span className="text-amber-300 font-mono font-bold">{formatINR(amount)}</span>
            </label>
            <input
              type="number"
              step="500"
              min="1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-[#061d1a] border border-[#10332e] rounded-xl px-3 py-2 text-sm text-[#e0e7e6] font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <input
              type="range"
              min="5000"
              max="100000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-[#020d0c] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Weekly Cash */}
          <div className="space-y-2 bg-[#041513] p-3.5 sm:p-4 rounded-2xl border border-[#10332e]">
            <label className="text-xs font-semibold text-[#8ba39e] flex justify-between">
              <span>{t('borrower.weeklyAmount')}</span>
              <span className="text-amber-300 font-mono font-bold">{formatINR(weeklyAmount)}</span>
            </label>
            
            {/* Quick 600, 800, 1000 Selector Pills */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {[600, 800, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setWeeklyAmount(val);
                    if (val === 600) setAmount(10000);
                    else if (val === 800) setAmount(13000);
                    else if (val === 1000) setAmount(16000);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    weeklyAmount === val
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-[#061d1a] text-[#8ba39e] border border-[#10332e] hover:text-[#e0e7e6]'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="number"
                step="100"
                min="100"
                value={weeklyAmount}
                onChange={(e) => setWeeklyAmount(Number(e.target.value))}
                className="w-full bg-[#061d1a] border border-[#10332e] rounded-xl px-3 py-1.5 text-xs text-[#e0e7e6] font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Weeks Duration */}
          <div className="space-y-2 bg-[#041513] p-3.5 sm:p-4 rounded-2xl border border-[#10332e]">
            <label className="text-xs font-semibold text-[#8ba39e] flex justify-between">
              <span>{t('borrower.duration')}</span>
              <span className="text-amber-300 font-mono font-bold">{durationWeeks} Weeks</span>
            </label>
            <div className="flex gap-2 pt-1">
              {[20, 21, 24].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setDurationWeeks(w)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    durationWeeks === w
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-[#061d1a] text-[#8ba39e] border-[#10332e] hover:bg-[#0a2924]'
                  }`}
                >
                  {w} Wks
                </button>
              ))}
            </div>
            <span className="text-[10px] text-[#8ba39e] block pt-1">
              Standard cycle is 21 or 20 weeks
            </span>
          </div>
        </div>

        {/* Big Calculation Projection Card */}
        <div className="bg-[#041513] border border-emerald-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-center">
            
            <div className="bg-[#061d1a] border border-[#10332e] p-3.5 sm:p-4 rounded-2xl">
              <span className="text-xs text-[#8ba39e] font-semibold block mb-1">
                Lent Principal (అసలు)
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#e0e7e6] font-mono">
                {formatINR(calc.principalAmount)}
              </span>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-500/40 p-3.5 sm:p-4 rounded-2xl">
              <span className="text-xs text-emerald-300 font-semibold block mb-1">
                Total Collection (మొత్తం)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                {formatINR(calc.totalAmount)}
              </span>
              <span className="text-[11px] text-[#8ba39e] block mt-0.5 font-mono">
                {formatINR(weeklyAmount)} × {durationWeeks} weeks
              </span>
            </div>

            <div className="bg-amber-950/60 border border-amber-500/40 p-3.5 sm:p-4 rounded-2xl">
              <span className="text-xs text-amber-300 font-semibold block mb-1">
                Net Interest Profit (వడ్డీ)
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                +{formatINR(calc.interestAmount)}
              </span>
              <span className="text-xs text-emerald-400 font-bold block mt-0.5">
                {calc.roiPercentage.toFixed(1)}% Return ({formatINR(calc.weeklyInterestGain)}/wk)
              </span>
            </div>

          </div>

          {/* Week-by-Week Amortization Preview Table */}
          <div className="border-t border-[#10332e] pt-4 sm:pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8ba39e] mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>{durationWeeks}-Week Cashflow Recovery Table</span>
              <span className="text-amber-400 font-normal normal-case text-[11px] sm:text-xs">
                Break-even at Week {Math.ceil(amount / weeklyAmount)}
              </span>
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: durationWeeks }).map((_, idx) => {
                const weekNum = idx + 1;
                const collectedSoFar = weekNum * weeklyAmount;
                const isBreakEvenOrProfit = collectedSoFar >= amount;

                return (
                  <div
                    key={weekNum}
                    className={`p-2 rounded-xl border text-center text-xs font-mono transition-all ${
                      isBreakEvenOrProfit
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#061d1a] border-[#10332e] text-[#8ba39e]'
                    }`}
                  >
                    <span className="text-[10px] text-[#8ba39e] block">Wk {weekNum}</span>
                    <strong className="text-[#e0e7e6] block text-[11px] sm:text-xs">{formatINR(collectedSoFar)}</strong>
                    {isBreakEvenOrProfit && (
                      <span className="text-[9px] text-amber-400 font-bold">
                        +{formatINR(collectedSoFar - amount)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct CTA to Add this loan to Dashboard */}
          {onAddLoanFromCalc && (
            <div className="pt-2 flex justify-center sm:justify-end">
              <button
                onClick={() =>
                  onAddLoanFromCalc({
                    amount,
                    weeklyAmount,
                    durationWeeks,
                  })
                }
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <span>Register Loan with These Terms</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
