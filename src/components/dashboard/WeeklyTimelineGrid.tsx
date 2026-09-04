import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  HelpCircle,
  Sparkles,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { formatDate, formatINR, getBorrowerProgress } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { Borrower, PaymentStatus, WeeklyPayment } from '../../types';

interface WeeklyTimelineGridProps {
  borrower: Borrower;
  onUpdatePayment: (
    weekNumber: number,
    status: PaymentStatus,
    paidDate?: string | null,
    paidAmount?: number | null,
    notes?: string
  ) => void;
  interactive?: boolean;
}

export const WeeklyTimelineGrid: React.FC<WeeklyTimelineGridProps> = ({
  borrower,
  onUpdatePayment,
  interactive = true,
}) => {
  const { t, language } = useI18n();
  const progress = getBorrowerProgress(borrower);

  // Selected week for editing status
  const [selectedWeek, setSelectedWeek] = useState<WeeklyPayment | null>(null);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('paid');
  const [editDate, setEditDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const payments = borrower.payments || [];
  const duration = borrower.duration_weeks || 21;

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#fbbf24', '#ffffff'],
    });
  };

  const handleOpenPicker = (payment: WeeklyPayment) => {
    if (!interactive) return;
    setSelectedWeek(payment);
    setEditStatus(payment.status === 'pending' ? 'paid' : payment.status);
    setEditDate(payment.paid_date || new Date().toISOString().split('T')[0]);
    setEditAmount(payment.paid_amount ? String(payment.paid_amount) : String(payment.amount_due));
    setEditNotes(payment.notes || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeek) return;

    const numAmount = editStatus === 'paid'
      ? selectedWeek.amount_due
      : editStatus === 'partial'
        ? Number(editAmount) || (selectedWeek.amount_due / 2)
        : null;

    const prevProgress = getBorrowerProgress(borrower);
    onUpdatePayment(
      selectedWeek.week_number,
      editStatus,
      editDate,
      numAmount,
      editNotes
    );

    // If this payment completes the loan, trigger confetti
    if (!prevProgress.isFullyPaid && (prevProgress.paidWeeksCount + 1 >= duration)) {
      triggerConfetti();
    }

    setSelectedWeek(null);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          dot: 'bg-emerald-400',
          label: t('status.paid'),
        };
      case 'partial':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          label: t('status.partial'),
        };
      case 'defaulted':
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          dot: 'bg-rose-400',
          label: t('status.defaulted'),
        };
      case 'pending':
      default:
        return {
          bg: 'bg-slate-800/60 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          label: t('status.pending'),
        };
    }
  };

  return (
    <div className="space-y-6" id="weekly-timeline-container">
      {/* Top Header & Progress Radial Bar */}
      <div className="bg-[#041513] border border-[#10332e] rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-[#e0e7e6] flex items-center gap-2">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>{duration}-Week Collection Grid</span>
            </h4>
            {progress.isFullyPaid && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {t('borrower.completed')}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8ba39e]">
            {formatINR(borrower.weekly_amount)} / week • Target: <strong className="text-amber-300">{formatINR(borrower.total_amount)}</strong>
          </p>
        </div>

        {/* Live Progress Ring & Metrics */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 bg-[#061d1a] border border-[#10332e] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            {/* SVG Circular Progress */}
            <svg className="w-10 h-10 sm:w-12 sm:h-12 -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="18"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-[#020d0c]"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="18"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={113.1}
                strokeDashoffset={113.1 - (113.1 * progress.percentage) / 100}
                className="text-emerald-400 transition-all duration-700 ease-out"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[10px] sm:text-[11px] font-extrabold text-emerald-300 font-mono">
              {progress.percentage}%
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block">
              {progress.paidWeeksCount} of {duration} Wks Paid
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              {formatINR(progress.collected)} <span className="text-[#8ba39e] font-normal">/ {formatINR(borrower.total_amount)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 21 / 20 Week Grid Nodes (2-col on small mobile, 3-col on large mobile/tablet, 7-col on laptop/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 sm:gap-3">
        {payments.map((payment) => {
          const badge = getStatusBadge(payment.status);
          const isSelected = selectedWeek?.week_number === payment.week_number;
          const isProfitWeek = (payment.week_number * borrower.weekly_amount) > borrower.amount;

          return (
            <button
              key={payment.week_number}
              type="button"
              disabled={!interactive}
              onClick={() => handleOpenPicker(payment)}
              className={`relative p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer min-h-[85px] active:scale-[0.98] ${
                isSelected
                  ? 'ring-2 ring-amber-400 border-amber-400 bg-[#0a2924]'
                  : payment.status === 'paid'
                    ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/60'
                    : payment.status === 'partial'
                      ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/60'
                      : payment.status === 'defaulted'
                        ? 'bg-rose-950/40 border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/60'
                        : 'bg-[#041513] border-[#10332e] hover:border-[#1b433c] hover:bg-[#061d1a]'
              }`}
            >
              {/* Top Row: Week badge & Status dot */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8ba39e] font-mono flex items-center gap-1">
                  Wk {payment.week_number}
                  {isProfitWeek && (
                    <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold" title="Profit zone week">
                      +₹
                    </span>
                  )}
                </span>
                
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              </div>

              {/* Middle Row: Amount */}
              <div className="my-0.5">
                <span className="text-xs sm:text-sm font-black font-mono text-[#e0e7e6] block truncate">
                  {payment.status === 'partial' && payment.paid_amount
                    ? `${formatINR(payment.paid_amount)}`
                    : formatINR(payment.amount_due)}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#8ba39e] block truncate">
                  {formatDate(payment.due_date, language)}
                </span>
              </div>

              {/* Bottom Row: Status Tag */}
              <div className="mt-1 pt-1 border-t border-[#10332e] flex items-center justify-between text-[9px] sm:text-[10px]">
                <span className={`font-semibold truncate ${
                  payment.status === 'paid'
                    ? 'text-emerald-400'
                    : payment.status === 'partial'
                      ? 'text-amber-300'
                      : payment.status === 'defaulted'
                        ? 'text-rose-400'
                        : 'text-[#8ba39e]'
                }`}>
                  {badge.label}
                </span>

                {interactive && (
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity text-[9px] text-amber-300 font-semibold">
                    Edit
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Week Status Modal Picker */}
      {selectedWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#061d1a] border border-[#10332e] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#10332e] pb-4">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  {borrower.name}
                </span>
                <h3 className="text-lg font-bold text-[#e0e7e6]">
                  {t('modal.statusModalTitle', { week: selectedWeek.week_number })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWeek(null)}
                className="p-1.5 rounded-full hover:bg-[#0a2924] text-[#8ba39e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              {/* Status Radio Pills */}
              <div>
                <label className="text-xs font-semibold text-[#8ba39e] block mb-2">
                  {t('modal.selectStatus')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['paid', 'partial', 'pending', 'defaulted'] as PaymentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        editStatus === st
                          ? st === 'paid'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : st === 'partial'
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : st === 'defaulted'
                                ? 'bg-rose-500 text-white border-rose-400'
                                : 'bg-[#1b433c] text-white border-emerald-400'
                          : 'bg-[#041513] text-[#8ba39e] border-[#10332e] hover:bg-[#0a2924]'
                      }`}
                    >
                      {editStatus === st && <Check className="w-3.5 h-3.5" />}
                      <span>{t(`status.${st}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial Amount input if status is 'partial' */}
              {editStatus === 'partial' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-semibold text-amber-300">
                    {t('modal.partialAmount')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedWeek.amount_due}
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder={`e.g. ${selectedWeek.amount_due / 2}`}
                    required
                    className="w-full bg-[#041513] border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[11px] text-[#8ba39e] block">
                    Full installment is {formatINR(selectedWeek.amount_due)}. Remaining balance stays due.
                  </span>
                </div>
              )}

              {/* Paid Date Input if status is paid or partial */}
              {(editStatus === 'paid' || editStatus === 'partial') && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#8ba39e]">
                    {t('modal.paidDate')}
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#041513] border border-[#10332e] rounded-xl px-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              )}

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8ba39e]">
                  {t('modal.notes')}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Paid via PhonePe, Promised remaining on Friday..."
                  className="w-full bg-[#041513] border border-[#10332e] rounded-xl px-3.5 py-2.5 text-sm text-[#e0e7e6] focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWeek(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#041513] hover:bg-[#0a2924] text-[#8ba39e] hover:text-white border border-[#10332e] text-xs font-bold transition-all cursor-pointer"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  {t('modal.updatePayment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
