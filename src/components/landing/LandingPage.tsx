import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  Landmark,
  Layers,
  PhoneCall,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import { calculateLoan, formatINR } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { LiquidMetalLogo } from '../brand/LiquidMetalLogo';
import { Hero3DScene } from './Hero3DScene';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenAddLoan: () => void;
  onOpenLogin?: () => void;
  onOpenCalculator?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenAddLoan,
  onOpenLogin,
  onOpenCalculator,
}) => {
  const { language, toggleLanguage, t } = useI18n();

  // Mini calculator state
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [calcWeekly, setCalcWeekly] = useState<number>(600);
  const [calcWeeks, setCalcWeeks] = useState<number>(21);

  const preview = calculateLoan(calcAmount, calcWeekly, calcWeeks);

  return (
    <div className="min-h-screen bg-[#020d0c] text-[#e0e7e6] flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Floating Glow Ambient Light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-12 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{t('landing.heroBadge')}</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#e0e7e6] font-['Plus_Jakarta_Sans'] leading-[1.2] break-words">
                {t('landing.heroTitle1')}{' '}
                <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent inline-block">
                  {t('landing.heroTitle2')}
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-[#8ba39e] leading-relaxed max-w-xl">
              {t('landing.heroDesc')}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="bg-[#061d1a] border border-[#10332e] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block truncate">{t('landing.statPrincipal')}</span>
                <span className="text-base sm:text-lg font-bold text-[#e0e7e6] block truncate">₹10,000</span>
              </div>
              <div className="bg-[#061d1a] border border-[#10332e] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block truncate">{t('landing.statReturn')}</span>
                <span className="text-base sm:text-lg font-bold text-amber-300 block truncate">₹12,600</span>
              </div>
              <div className="bg-[#061d1a] border border-[#10332e] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block truncate">{t('landing.statProfit')}</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 block truncate">+₹2,600</span>
              </div>
              <div className="bg-[#061d1a] border border-[#10332e] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl min-w-0">
                <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block truncate">{t('landing.statWeeks')}</span>
                <span className="text-base sm:text-lg font-bold text-amber-200 block truncate">21 Wks (26%)</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 pt-2 sm:pt-4">
              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
                <span>{t('landing.exploreDashboard')}</span>
                <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>

              <button
                onClick={onOpenAddLoan}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#041513] hover:bg-[#0a2924] border border-[#10332e] text-[#e0e7e6] font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('nav.addLoan')}</span>
              </button>
            </div>
          </div>

          {/* Right 3D Interactive Stack Scene */}
          <div className="lg:col-span-6 w-full min-w-0">
            <Hero3DScene />
          </div>

        </div>

        {/* Section: The Exact Business Formula (Source of Truth) */}
        <section className="mt-14 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3 mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('landing.formulaHeading')}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#e0e7e6]">
              Mathematical Precision Guaranteed
            </h2>
            <p className="text-[#8ba39e] text-xs sm:text-base">
              {t('landing.formulaDesc')}
            </p>
          </div>

          <div className="bg-[#061d1a]/95 border border-[#10332e] rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 items-center">
              
              {/* Box 1: Principal */}
              <div className="bg-[#041513] border border-[#10332e] rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center min-w-0">
                <span className="text-[11px] sm:text-xs text-[#8ba39e] font-medium block mb-1">
                  {t('landing.formulaPrincipal')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#e0e7e6] font-mono">
                  {formatINR(calcAmount)}
                </span>
              </div>

              {/* Symbol + */}
              <div className="text-center text-[#8ba39e] font-bold text-lg sm:text-xl hidden md:block">
                ×
              </div>

              {/* Box 2: Weekly x Weeks */}
              <div className="bg-[#041513] border border-amber-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center min-w-0">
                <span className="text-[11px] sm:text-xs text-amber-300 font-medium block mb-1">
                  {t('landing.formulaWeekly')} × {t('landing.formulaWeeks')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {formatINR(calcWeekly)} × {calcWeeks}
                </span>
              </div>

              {/* Symbol = */}
              <div className="text-center text-[#8ba39e] font-bold text-lg sm:text-xl hidden md:block">
                =
              </div>

              {/* Box 3: Total & Profit */}
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center min-w-0">
                <span className="text-[11px] sm:text-xs text-emerald-300 font-medium block mb-1">
                  {t('landing.formulaTotal')} & {t('landing.formulaInterest')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
                  {formatINR(preview.totalAmount)}
                </span>
                <span className="text-[11px] sm:text-xs text-amber-300 font-semibold block mt-0.5">
                  (+{formatINR(preview.interestAmount)} / {preview.roiPercentage.toFixed(1)}% ROI)
                </span>
              </div>

            </div>

            {/* Interactive Sliders to test formula */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#10332e] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="text-xs font-semibold text-[#8ba39e] flex justify-between mb-2">
                  <span>{t('borrower.principal')}</span>
                  <span className="text-amber-300 font-bold font-mono">{formatINR(calcAmount)}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-[#020d0c] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8ba39e] flex justify-between mb-2">
                  <span>{t('borrower.weeklyAmount')}</span>
                  <span className="text-amber-300 font-bold font-mono">{formatINR(calcWeekly)}</span>
                </label>
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  value={calcWeekly}
                  onChange={(e) => setCalcWeekly(Number(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-[#020d0c] rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8ba39e] flex justify-between mb-2">
                  <span>{t('borrower.duration')}</span>
                  <span className="text-amber-300 font-bold font-mono">{calcWeeks} Weeks</span>
                </label>
                <div className="flex gap-2">
                  {[20, 21, 24].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setCalcWeeks(w)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        calcWeeks === w
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-[#041513] text-[#8ba39e] border-[#10332e] hover:bg-[#0a2924]'
                      }`}
                    >
                      {w} Wks
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: 4 Core Features */}
        <section className="mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e0e7e6]">
              Engineered for Real-World Field Collectors
            </h2>
            <p className="text-[#8ba39e] text-sm sm:text-base">
              Everything you need to manage collections on the go without notebook math.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/40 p-6 rounded-3xl transition-all hover:-translate-y-1 backdrop-blur-md group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#e0e7e6] mb-2">{t('landing.feature1Title')}</h3>
              <p className="text-sm text-[#8ba39e] leading-relaxed">{t('landing.feature1Desc')}</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/40 p-6 rounded-3xl transition-all hover:-translate-y-1 backdrop-blur-md group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#e0e7e6] mb-2">{t('landing.feature2Title')}</h3>
              <p className="text-sm text-[#8ba39e] leading-relaxed">{t('landing.feature2Desc')}</p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/40 p-6 rounded-3xl transition-all hover:-translate-y-1 backdrop-blur-md group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#e0e7e6] mb-2">{t('landing.feature3Title')}</h3>
              <p className="text-sm text-[#8ba39e] leading-relaxed">{t('landing.feature3Desc')}</p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#061d1a] border border-[#10332e] hover:border-emerald-500/40 p-6 rounded-3xl transition-all hover:-translate-y-1 backdrop-blur-md group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#e0e7e6] mb-2">{t('landing.feature4Title')}</h3>
              <p className="text-sm text-[#8ba39e] leading-relaxed">{t('landing.feature4Desc')}</p>
            </div>

          </div>
        </section>

        {/* Section: 21-Week Visual Growth Bar Chart */}
        <section className="mt-14 sm:mt-28 bg-[#061d1a] border border-[#10332e] rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                {t('landing.timelineHeading')}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-[#e0e7e6]">
                ₹600 / Week Cashflow Acceleration
              </h3>
            </div>
            <p className="text-[#8ba39e] text-xs sm:text-sm max-w-md">
              {t('landing.timelineDesc')}
            </p>
          </div>

          {/* 21 Bars visualization with smooth horizontal scroll for small phones */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[480px] sm:min-w-0 grid grid-cols-21 gap-1 sm:gap-2 items-end h-48 sm:h-56 pt-6 pb-2 border-b border-[#10332e]">
              {Array.from({ length: 21 }).map((_, idx) => {
                const weekNum = idx + 1;
                const accumulated = weekNum * 600;
                const heightPct = Math.round((accumulated / 12600) * 100);
                const isProfitZone = accumulated > 10000;

                return (
                  <div key={weekNum} className="flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#041513] border border-amber-500/40 px-2 py-1 rounded text-[10px] whitespace-nowrap z-20 pointer-events-none shadow-lg">
                      <span className="text-amber-300 font-bold font-mono">{formatINR(accumulated)}</span>
                      <span className="block text-[#8ba39e]">Week {weekNum}</span>
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-125 ${
                        isProfitZone
                          ? 'bg-gradient-to-t from-emerald-600 via-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : 'bg-gradient-to-t from-[#10332e] to-[#1e584f]'
                      }`}
                    />
                    <span className="text-[8px] sm:text-[9px] text-[#8ba39e] mt-1 font-mono">{weekNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#8ba39e] mt-4 gap-2 sm:gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#1e584f] inline-block shrink-0" />
                <span>Principal Recovery (Weeks 1-16)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block shrink-0" />
                <span className="text-amber-300 font-semibold">Pure Interest Profit (Weeks 17-21)</span>
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-xs">
              Break-Even: Wk 17 (+₹200) → Final ₹12,600
            </span>
          </div>
        </section>

        {/* Bottom Giant CTA Banner */}
        <section className="mt-20 sm:mt-28 relative overflow-hidden rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-emerald-950 via-[#061d1a] to-amber-950/70 border border-emerald-500/40 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-[#e0e7e6]">
              Ready to Upgrade Your Weekly Collection Ledger?
            </h2>
            <p className="text-[#8ba39e] text-base sm:text-lg">
              Start recording weekly collections, tracking overdue payments, and seeing real-time interest returns now.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onOpenDashboard}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-400 text-slate-950 font-extrabold text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
              >
                <Landmark className="w-5 h-5 text-slate-950" />
                <span>{t('landing.exploreDashboard')}</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#10332e] bg-[#041513] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <LiquidMetalLogo size="sm" showText={true} />
          
          <div className="text-xs text-[#8ba39e] text-center sm:text-right">
            <span>© {new Date().getFullYear()} Vaddi Vault (వడ్డీ Vault). Built for Weekly Micro-Finance & Lenders.</span>
            <div className="mt-1 text-[#607d77]">
              ₹10,000 → ₹12,600 in 21 Weeks • Supabase PostgreSQL RLS • Next.js & Vercel Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
