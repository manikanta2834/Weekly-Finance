import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Download,
  Edit,
  FileText,
  MapPin,
  MessageSquare,
  Phone,
  RotateCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { formatDate, formatINR, getBorrowerProgress } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { generateBorrowerPDF } from '../../lib/pdfGenerator';
import { Borrower, PaymentStatus } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { WeeklyTimelineGrid } from './WeeklyTimelineGrid';

interface BorrowerDetailModalProps {
  borrower: Borrower;
  onClose: () => void;
  onUpdatePayment: (
    weekNumber: number,
    status: PaymentStatus,
    paidDate?: string | null,
    paidAmount?: number | null,
    notes?: string
  ) => void;
  onEditBorrower?: (borrower: Borrower) => void;
  onDeleteBorrower?: (borrowerId: string) => void;
}

export const BorrowerDetailModal: React.FC<BorrowerDetailModalProps> = ({
  borrower,
  onClose,
  onUpdatePayment,
  onEditBorrower,
  onDeleteBorrower,
}) => {
  const { t, language } = useI18n();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const progress = getBorrowerProgress(borrower);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Generate WhatsApp polite reminder message
  const handleWhatsAppShare = () => {
    const nextDueText = progress.nextDueDate
      ? `Next due date: ${formatDate(progress.nextDueDate, language)}`
      : 'All weeks caught up';

    const textEn = `*Vaddi Vault - Weekly Payment Reminder*\n\nHello *${borrower.name}*,\nThis is a friendly reminder for your weekly collection installment:\n- Weekly Due: *${formatINR(borrower.weekly_amount)}*\n- Status: ${progress.paidWeeksCount} of ${borrower.duration_weeks} weeks paid\n- Total Collected: ${formatINR(progress.collected)} / ${formatINR(borrower.total_amount)}\n- Remaining Balance: *${formatINR(progress.remaining)}*\n\nThank you!`;

    const textTe = `*వడ్డీ వాల్ట్ - వారపు వాయిదా సమాచారం*\n\nనమస్కారం *${borrower.name}* గారు,\nమీ వారపు వడ్డీ కిస్తీ వివరాలు:\n- వారపు వాయిదా: *${formatINR(borrower.weekly_amount)}*\n- ఇప్పటివరకు చెల్లించినవి: ${progress.paidWeeksCount} / ${borrower.duration_weeks} వారాలు\n- మొత్తం వసూలైనది: ${formatINR(progress.collected)} / ${formatINR(borrower.total_amount)}\n- మిగిలిన బాకీ: *${formatINR(progress.remaining)}*\n\nధన్యవాదాలు!`;

    const message = language === 'te' ? textTe : textEn;
    const cleanPhone = borrower.mobile_number.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Download Formatted PDF Statement
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      showToast(language === 'te' ? 'PDF డౌన్‌లోడ్ అవుతోంది...' : 'Downloading PDF statement...');
      generateBorrowerPDF(borrower, language);
      setTimeout(() => {
        showToast(language === 'te' ? 'PDF విజయవంతంగా డౌన్‌లోడ్ చేయబడింది!' : 'PDF downloaded successfully!');
      }, 1000);
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to browser print if needed
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#061d1a] border border-[#10332e] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#10332e] bg-[#041513]">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#0a2924] hover:bg-[#10332e] border border-[#10332e] text-xs font-bold text-amber-300 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180 text-emerald-400' : ''}`} />
              <span>{isFlipped ? t('modal.flipToDetails') : t('modal.flipToLedger')}</span>
            </button>

            <span className="text-xs text-[#8ba39e] hidden md:inline-block">
              {isFlipped ? '21-Week Payment Matrix' : 'Borrower Profile & Ledger'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 sm:p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Share Statement on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="p-1.5 sm:p-2 rounded-xl bg-[#0a2924] hover:bg-[#10332e] border border-[#10332e] text-amber-300 hover:text-amber-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download 21-Week PDF Statement"
            >
              <Download className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Exporting...' : 'PDF'}</span>
            </button>

            {onEditBorrower && (
              <button
                onClick={() => {
                  onEditBorrower(borrower);
                }}
                className="p-1.5 sm:p-2 rounded-xl bg-[#0a2924] hover:bg-[#10332e] border border-[#10332e] text-amber-300 hover:text-amber-200 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Edit Borrower Profile"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {onDeleteBorrower && (
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-1.5 sm:p-2 rounded-xl bg-[#061d1a] hover:bg-rose-950/60 border border-rose-950/60 text-rose-400 hover:text-rose-300 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Delete Loan & Borrower"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-[#0a2924] text-[#8ba39e] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Perspective Card Content Container */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
          {!isFlipped ? (
            /* FRONT: Borrower Profile & Financial Summary */
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              {/* Header Profile Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-[#041513] border border-[#10332e]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-lg sm:text-xl shrink-0">
                    {borrower.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-[#e0e7e6]">{borrower.name}</h3>
                      {progress.isFullyPaid ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {t('borrower.completed')}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {t('borrower.active')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-[#8ba39e]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {borrower.city_name}
                      </span>
                      <a
                        href={`tel:${borrower.mobile_number}`}
                        className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {borrower.mobile_number}
                      </a>
                      <span className="flex items-center gap-1 text-[#8ba39e]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8ba39e]" />
                        Surity: <strong className="text-slate-200 font-normal">{borrower.surity}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Loan Start Date */}
                <div className="text-left sm:text-right bg-[#061d1a] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-[#10332e] self-start sm:self-auto">
                  <span className="text-[9px] sm:text-[10px] text-[#8ba39e] block uppercase tracking-wider font-semibold">
                    {t('borrower.startDate')}
                  </span>
                  <span className="text-xs font-bold text-[#e0e7e6]">
                    {formatDate(borrower.date, language)}
                  </span>
                </div>
              </div>

              {/* 4 Financial Metric Cards (2x2 on Mobile, 4x1 on Tablet/Desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                <div className="bg-[#041513] border border-[#10332e] p-3 sm:p-4 rounded-2xl">
                  <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block font-medium mb-0.5 truncate">
                    {t('borrower.principal')}
                  </span>
                  <span className="text-base sm:text-xl font-black text-[#e0e7e6] font-mono truncate block">
                    {formatINR(borrower.amount)}
                  </span>
                </div>

                <div className="bg-[#041513] border border-amber-500/30 p-3 sm:p-4 rounded-2xl">
                  <span className="text-[10px] sm:text-[11px] text-amber-300 block font-medium mb-0.5 truncate">
                    {t('borrower.weeklyAmount')} ({borrower.duration_weeks} wks)
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-400 font-mono truncate block">
                    {formatINR(borrower.weekly_amount)}
                  </span>
                </div>

                <div className="bg-[#041513] border border-emerald-500/30 p-3 sm:p-4 rounded-2xl">
                  <span className="text-[10px] sm:text-[11px] text-emerald-300 block font-medium mb-0.5 truncate">
                    {t('borrower.totalAmount')}
                  </span>
                  <span className="text-base sm:text-xl font-black text-emerald-400 font-mono truncate block">
                    {formatINR(borrower.total_amount)}
                  </span>
                </div>

                <div className="bg-[#041513] border border-[#10332e] p-3 sm:p-4 rounded-2xl">
                  <span className="text-[10px] sm:text-[11px] text-[#8ba39e] block font-medium mb-0.5 truncate">
                    {t('borrower.interestAmount')}
                  </span>
                  <span className="text-base sm:text-xl font-black text-amber-300 font-mono truncate block">
                    +{formatINR(borrower.interest_amount)}
                  </span>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-[#041513] border border-[#10332e] rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-semibold text-[#e0e7e6]">
                    Collection: <strong className="text-emerald-400">{progress.paidWeeksCount} / {borrower.duration_weeks} Weeks Paid ({progress.percentage}%)</strong>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    Remaining: {formatINR(progress.remaining)}
                  </span>
                </div>

                <div className="w-full h-2.5 sm:h-3 bg-[#020d0c] rounded-full overflow-hidden p-0.5 border border-[#10332e]">
                  <div
                    style={{ width: `${progress.percentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300 transition-all duration-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center pt-1 text-[10px] sm:text-[11px]">
                  <div className="bg-[#061d1a] border border-[#10332e] p-1.5 sm:p-2 rounded-xl">
                    <span className="text-[#8ba39e] block text-[9px] sm:text-[10px]">Paid</span>
                    <strong className="text-emerald-400">{progress.paidWeeksCount} wks</strong>
                  </div>
                  <div className="bg-[#061d1a] border border-[#10332e] p-1.5 sm:p-2 rounded-xl">
                    <span className="text-[#8ba39e] block text-[9px] sm:text-[10px]">Pending</span>
                    <strong className="text-[#e0e7e6]">{progress.pendingWeeksCount} wks</strong>
                  </div>
                  <div className="bg-[#061d1a] border border-[#10332e] p-1.5 sm:p-2 rounded-xl">
                    <span className="text-[#8ba39e] block text-[9px] sm:text-[10px]">Partial</span>
                    <strong className="text-amber-400">{progress.partialWeeksCount} wks</strong>
                  </div>
                  <div className="bg-[#061d1a] border border-[#10332e] p-1.5 sm:p-2 rounded-xl">
                    <span className="text-[#8ba39e] block text-[9px] sm:text-[10px]">Defaulted</span>
                    <strong className="text-rose-400">{progress.defaultedWeeksCount} wks</strong>
                  </div>
                </div>
              </div>

              {/* Shortcut CTA to flip to 21-Week timeline */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-slate-950" />
                  <span>Open {borrower.duration_weeks}-Week Interactive Payment Matrix</span>
                  <RotateCw className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          ) : (
            /* BACK: 21-Week Timeline Matrix */
            <div className="animate-fade-in space-y-4">
              <WeeklyTimelineGrid
                borrower={borrower}
                onUpdatePayment={onUpdatePayment}
                interactive={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation In-App Dialog */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Borrower & Ledger"
        message={`Are you sure you want to delete ${borrower.name}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          if (onDeleteBorrower) {
            onDeleteBorrower(borrower.id);
            onClose();
          }
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
