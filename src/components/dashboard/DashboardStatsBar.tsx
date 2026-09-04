import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  DollarSign,
  Landmark,
  Percent,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import React from 'react';
import { formatINR } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { DashboardStats } from '../../types';

interface DashboardStatsBarProps {
  stats: DashboardStats;
}

export const DashboardStatsBar: React.FC<DashboardStatsBarProps> = ({ stats }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* 4 Primary Highlight Cards (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Total Principal Lent */}
        <div className="bg-[#061d1a]/95 border border-[#10332e] hover:border-[#1b433c] p-3 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-[#8ba39e] leading-snug">
                {t('dashboard.totalPrincipal')}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#0a2924] border border-[#10332e] flex items-center justify-center text-emerald-400 shrink-0">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-2xl font-black text-[#e0e7e6] font-mono tracking-tight">
              {formatINR(stats.totalPrincipalDisbursed)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] text-[#8ba39e]">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="truncate"><strong className="text-slate-200">{stats.totalActiveLoans + stats.totalCompletedLoans}</strong> borrowers</span>
          </div>
        </div>

        {/* Card 2: Total Expected Return */}
        <div className="bg-[#061d1a]/95 border border-emerald-500/30 hover:border-emerald-500/50 p-3 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 leading-snug">
                {t('dashboard.totalExpected')}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Landmark className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-2xl font-black text-emerald-300 font-mono tracking-tight">
              {formatINR(stats.totalExpectedCollection)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] text-emerald-400/80">
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">21/20-wk target</span>
          </div>
        </div>

        {/* Card 3: Total Pure Interest Profit */}
        <div className="bg-[#061d1a]/95 border border-amber-500/30 hover:border-amber-500/50 p-3 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-amber-300 leading-snug">
                {t('dashboard.totalInterest')}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
              +{formatINR(stats.totalInterestEarned)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] text-amber-400/80">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Pure yield profit</span>
          </div>
        </div>

        {/* Card 4: Collected Cash & Rate */}
        <div className="bg-[#061d1a]/95 border border-[#10332e] hover:border-[#1b433c] p-3 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all shadow-xl group flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-[#8ba39e] leading-snug">
                {t('dashboard.totalCollected')}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#0a2924] border border-[#10332e] flex items-center justify-center text-emerald-400 shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-base sm:text-2xl font-black text-[#e0e7e6] font-mono tracking-tight">
              {formatINR(stats.totalCollectedSoFar)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] sm:text-[11px]">
            <span className="text-[#8ba39e] truncate">Progress:</span>
            <span className="font-mono text-emerald-400 font-bold truncate">
              {stats.collectionRatePercentage}%
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bar of Master Vault Book */}
      <div className="bg-[#061d1a]/90 border border-[#10332e] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-[#e0e7e6] block truncate">
              Master Ledger Cashflow Progress
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#8ba39e] font-mono block truncate">
              Collected {formatINR(stats.totalCollectedSoFar)} of {formatINR(stats.totalExpectedCollection)} • Remaining {formatINR(stats.totalPendingBalance)}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-72 space-y-1">
          <div className="w-full bg-[#020d0c] h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-[#10332e]">
            <div
              style={{ width: `${stats.collectionRatePercentage}%` }}
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#8ba39e] font-mono">
            <span>₹0</span>
            <span className="text-amber-300 font-bold">{stats.collectionRatePercentage}%</span>
            <span>{formatINR(stats.totalExpectedCollection)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

