import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { formatDate, formatINR, getBorrowerProgress } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { Borrower } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface BorrowersTableProps {
  borrowers: Borrower[];
  onSelectBorrower: (borrower: Borrower) => void;
  onEditBorrower?: (borrower: Borrower) => void;
  onDeleteBorrower: (borrowerId: string) => void;
  onAddNewLoan: () => void;
  onLoadSampleData?: () => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'overdue';

export const BorrowersTable: React.FC<BorrowersTableProps> = ({
  borrowers,
  onSelectBorrower,
  onEditBorrower,
  onDeleteBorrower,
  onAddNewLoan,
  onLoadSampleData,
}) => {
  const { t, language } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [borrowerToDelete, setBorrowerToDelete] = useState<Borrower | null>(null);

  // Filter & Search Logic
  const filteredList = useMemo(() => {
    return borrowers
      .filter((b) => {
        const progress = getBorrowerProgress(b);

        if (filterType === 'active' && progress.isFullyPaid) return false;
        if (filterType === 'completed' && !progress.isFullyPaid) return false;
        if (filterType === 'overdue' && progress.defaultedWeeksCount === 0) return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.mobile_number.includes(q) ||
          b.city_name.toLowerCase().includes(q) ||
          b.surity.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'name') return a.name.localeCompare(b.name) * factor;
        if (sortBy === 'amount') return (a.amount - b.amount) * factor;
        if (sortBy === 'progress') {
          const progA = getBorrowerProgress(a).percentage;
          const progB = getBorrowerProgress(b).percentage;
          return (progA - progB) * factor;
        }
        return (new Date(b.date).getTime() - new Date(a.date).getTime()) * factor;
      });
  }, [borrowers, filterType, searchTerm, sortBy, sortOrder]);

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'Borrower Name',
      'Start Date',
      'Mobile Number',
      'City / Village',
      'Guarantor (Surity)',
      'Principal Amount (INR)',
      'Weekly Collection (INR)',
      'Duration (Weeks)',
      'Total Target (INR)',
      'Interest Gain (INR)',
      'Collected So Far (INR)',
      'Remaining Balance (INR)',
      'Paid Weeks Count',
      'Status',
    ];

    const rows = filteredList.map((b) => {
      const p = getBorrowerProgress(b);
      return [
        `"${b.name}"`,
        b.date,
        `"${b.mobile_number}"`,
        `"${b.city_name}"`,
        `"${b.surity}"`,
        b.amount,
        b.weekly_amount,
        b.duration_weeks,
        b.total_amount,
        b.interest_amount,
        p.collected,
        p.remaining,
        p.paidWeeksCount,
        p.isFullyPaid ? 'Completed' : 'Active',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vaddi_Vault_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#061d1a]/95 border border-[#10332e] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8ba39e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('dashboard.searchPlaceholder')}
            className="w-full bg-[#041513] border border-[#10332e] rounded-xl sm:rounded-2xl pl-10 pr-4 py-2 sm:py-2.5 text-xs text-[#e0e7e6] placeholder:text-[#8ba39e] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8ba39e] hover:text-[#e0e7e6] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#041513] p-1 rounded-xl sm:rounded-2xl border border-[#10332e] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6]'
              }`}
            >
              {t('dashboard.filterAll')} ({borrowers.length})
            </button>

            <button
              onClick={() => setFilterType('active')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'active'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6]'
              }`}
            >
              {t('dashboard.filterActive')}
            </button>

            <button
              onClick={() => setFilterType('completed')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
                filterType === 'completed'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-[#8ba39e] hover:text-[#e0e7e6]'
              }`}
            >
              {t('dashboard.filterCompleted')}
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#0a2924] hover:bg-[#10332e] border border-[#10332e] text-xs font-semibold text-[#e0e7e6] flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download CSV Report"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Add Loan Button */}
          <button
            onClick={onAddNewLoan}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>{t('nav.addLoan')}</span>
          </button>
        </div>
      </div>

      {/* Responsive View: Mobile Borrower Cards (<md) & Desktop Table (>=md) */}
      
      {/* Mobile Card List View (<md) */}
      <div className="block md:hidden space-y-3">
        {filteredList.length === 0 ? (
          <div className="py-8 text-center text-[#8ba39e] bg-[#041513] rounded-2xl border border-[#10332e] p-5 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#e0e7e6] mb-1">
                {borrowers.length === 0 ? 'Your Personal Ledger is Ready' : t('dashboard.emptyBorrowers')}
              </p>
              <p className="text-[11px] text-[#8ba39e] max-w-xs mx-auto">
                {borrowers.length === 0
                  ? 'No borrower loans recorded in this account yet. Add a loan to begin tracking 21-week collections.'
                  : 'No borrowers match your search or filter.'}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={onAddNewLoan}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ {t('dashboard.addFirstBorrower')}</span>
              </button>
              {borrowers.length === 0 && onLoadSampleData && (
                <button
                  onClick={onLoadSampleData}
                  className="w-full py-2 rounded-xl bg-[#0a2924] hover:bg-[#10332e] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Load Sample Records</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredList.map((borrower) => {
            const progress = getBorrowerProgress(borrower);

            return (
              <div
                key={borrower.id}
                onClick={() => onSelectBorrower(borrower)}
                className="bg-[#041513] border border-[#10332e] hover:border-emerald-500/40 rounded-2xl p-4 space-y-3 transition-all cursor-pointer group active:scale-[0.99]"
              >
                {/* Card Top: Name, Status & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#e0e7e6] group-hover:text-amber-300 transition-colors">
                        {borrower.name}
                      </span>
                      {progress.isFullyPaid ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Completed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8ba39e] mt-0.5">
                      {borrower.city_name} • <span className="font-mono">{borrower.mobile_number}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-amber-300 font-mono block">
                      {formatINR(borrower.weekly_amount)}<span className="text-[10px] text-[#8ba39e]">/wk</span>
                    </span>
                    <span className="text-[10px] text-[#8ba39e] block font-mono">
                      Principal: {formatINR(borrower.amount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Weeks */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8ba39e] font-mono">
                    <span>{progress.paidWeeksCount} of {borrower.duration_weeks} Weeks Paid</span>
                    <span className="text-emerald-400 font-bold">{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#020d0c] h-2 rounded-full overflow-hidden border border-[#10332e]">
                    <div
                      style={{ width: `${progress.percentage}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.isFullyPaid
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#8ba39e] pt-0.5">
                    <span>Collected: <strong className="text-[#e0e7e6]">{formatINR(progress.collected)}</strong></span>
                    <span>Remaining: <strong className="text-amber-300">{formatINR(progress.remaining)}</strong></span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#10332e] gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectBorrower(borrower)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#0a2924] hover:bg-[#10332e] text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-[#10332e] cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>21-Wk Ledger</span>
                  </button>

                  {onEditBorrower && (
                    <button
                      onClick={() => onEditBorrower(borrower)}
                      className="p-2 rounded-xl bg-[#061d1a] border border-[#10332e] text-amber-300 hover:text-amber-200 hover:bg-[#0a2924] transition-colors cursor-pointer"
                      title="Edit Borrower Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <a
                    href={`tel:${borrower.mobile_number}`}
                    className="p-2 rounded-xl bg-[#061d1a] border border-[#10332e] text-emerald-400 hover:bg-[#0a2924] text-xs transition-colors"
                    title="Call"
                  >
                    Call
                  </a>

                  <button
                    onClick={() => setBorrowerToDelete(borrower)}
                    className="p-2 rounded-xl bg-[#061d1a] border border-rose-950/60 text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="Delete Borrower"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table View (>=md) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#10332e]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#041513] text-[#8ba39e] border-b border-[#10332e]">
              <th className="py-3 px-4 font-semibold">{t('borrower.name')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.city')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.principal')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.weeklyAmount')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.duration')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.totalAmount')}</th>
              <th className="py-3 px-4 font-semibold">{t('borrower.interestAmount')}</th>
              <th className="py-3 px-4 font-semibold min-w-[140px]">{t('borrower.progress')}</th>
              <th className="py-3 px-4 font-semibold text-right">{t('borrower.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#10332e]/80 bg-[#061d1a]/60">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#8ba39e]">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-[#e0e7e6] mb-1">
                        {borrowers.length === 0 ? 'Your Personal Ledger is Ready' : t('dashboard.emptyBorrowers')}
                      </p>
                      <p className="text-xs text-[#8ba39e]">
                        {borrowers.length === 0
                          ? 'No borrower loans recorded in this account yet. Click Add Loan to create your first record, or load sample records to test the 21-week calculator.'
                          : 'No borrowers match your search/filter query.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={onAddNewLoan}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ {t('dashboard.addFirstBorrower')}</span>
                      </button>
                      {borrowers.length === 0 && onLoadSampleData && (
                        <button
                          onClick={onLoadSampleData}
                          className="px-3.5 py-2 rounded-xl bg-[#0a2924] hover:bg-[#10332e] border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Load Sample Records</span>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.map((borrower) => {
                const progress = getBorrowerProgress(borrower);

                return (
                  <tr
                    key={borrower.id}
                    onClick={() => onSelectBorrower(borrower)}
                    className="hover:bg-[#0a2924]/80 transition-colors cursor-pointer group"
                  >
                    {/* Name & Mobile */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#e0e7e6] group-hover:text-amber-300 transition-colors">
                        {borrower.name}
                      </div>
                      <div className="text-[11px] text-[#8ba39e] font-mono">
                        {borrower.mobile_number}
                      </div>
                    </td>

                    {/* City & Surity */}
                    <td className="py-3.5 px-4 text-[#e0e7e6]">
                      <div>{borrower.city_name}</div>
                      <div className="text-[10px] text-[#8ba39e]">
                        Surity: {borrower.surity}
                      </div>
                    </td>

                    {/* Principal Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#e0e7e6]">
                      {formatINR(borrower.amount)}
                    </td>

                    {/* Weekly Amount */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">
                      {formatINR(borrower.weekly_amount)}
                    </td>

                    {/* Duration Weeks */}
                    <td className="py-3.5 px-4 font-mono text-[#8ba39e]">
                      {borrower.duration_weeks} wks
                    </td>

                    {/* Total Target */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {formatINR(borrower.total_amount)}
                    </td>

                    {/* Interest Gain */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      +{formatINR(borrower.interest_amount)}
                    </td>

                    {/* Collection Progress */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#8ba39e] font-mono">
                          <span>{progress.paidWeeksCount}/{borrower.duration_weeks} Wks</span>
                          <span className="text-emerald-400 font-bold">{progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-[#020d0c] h-2 rounded-full overflow-hidden border border-[#10332e]">
                          <div
                            style={{ width: `${progress.percentage}%` }}
                            className={`h-full rounded-full ${
                              progress.isFullyPaid
                                ? 'bg-emerald-400'
                                : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                            }`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectBorrower(borrower)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0a2924] hover:bg-[#10332e] text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 border border-[#10332e] cursor-pointer"
                          title="Open 21-Week Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ledger</span>
                        </button>

                        {onEditBorrower && (
                          <button
                            onClick={() => onEditBorrower(borrower)}
                            className="p-1.5 rounded-lg bg-[#061d1a] border border-[#10332e] hover:bg-[#0a2924] text-[#8ba39e] hover:text-amber-300 transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setBorrowerToDelete(borrower)}
                          className="p-1.5 rounded-lg bg-[#061d1a] border border-rose-950/60 hover:bg-rose-950/70 text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* In-App Delete Confirmation Modal (Guaranteed to work in all iframe environments) */}
      <ConfirmModal
        isOpen={!!borrowerToDelete}
        title="Delete Borrower / Loan"
        message={
          borrowerToDelete
            ? `Are you sure you want to delete ${borrowerToDelete.name}? This will permanently remove their entire ${borrowerToDelete.duration_weeks}-week ledger (${formatINR(borrowerToDelete.total_amount)} total target) and payment history.`
            : ''
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (borrowerToDelete) {
            onDeleteBorrower(borrowerToDelete.id);
            setBorrowerToDelete(null);
          }
        }}
        onCancel={() => setBorrowerToDelete(null)}
      />
    </div>
  );
};
