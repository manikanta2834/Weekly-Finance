import {
  AlertCircle,
  Calendar,
  Check,
  Coins,
  MessageSquare,
  Phone,
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import React from 'react';
import { formatDate, formatINR, getBorrowerProgress } from '../../lib/calculator';
import { useI18n } from '../../lib/i18nContext';
import { Borrower } from '../../types';

interface TodaysCollectionWidgetProps {
  borrowers: Borrower[];
  onQuickMarkPaid: (borrowerId: string, weekNumber: number) => void;
  onSelectBorrower: (borrower: Borrower) => void;
}

export const TodaysCollectionWidget: React.FC<TodaysCollectionWidgetProps> = ({
  borrowers,
  onQuickMarkPaid,
  onSelectBorrower,
}) => {
  const { t, language } = useI18n();

  // Find borrowers who have a payment due within the next 7 days or overdue
  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(next7Days.getDate() + 7);

  const dueItems: { borrower: Borrower; weekNumber: number; dueDate: string; amountDue: number }[] = [];

  borrowers.forEach((b) => {
    const payments = b.payments || [];
    const pendingPayment = payments.find((p) => {
      if (p.status === 'paid') return false;
      const due = new Date(p.due_date);
      return due <= next7Days;
    });

    if (pendingPayment) {
      dueItems.push({
        borrower: b,
        weekNumber: pendingPayment.week_number,
        dueDate: pendingPayment.due_date,
        amountDue: pendingPayment.amount_due - (pendingPayment.paid_amount || 0),
      });
    }
  });

  const sendWhatsApp = (b: Borrower, amountDue: number, weekNum: number) => {
    const textEn = `*Vaddi Vault Payment Due*\n\nHello *${b.name}*,\nYour Week #${weekNum} installment of *${formatINR(amountDue)}* is due for collection.\nKindly keep it ready.\nThank you!`;
    const textTe = `*వడ్డీ వాల్ట్ - వాయిదా సమయం*\n\nనమస్కారం *${b.name}* గారు,\nమీ ${weekNum}వ వారం కిస్తీ *${formatINR(amountDue)}* చెల్లించవలసి ఉంది.\nదయచేసి సిద్ధంగా ఉంచగలరు.\nధన్యవాదాలు!`;
    const message = language === 'te' ? textTe : textEn;
    const cleanPhone = b.mobile_number.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#061d1a]/95 border border-[#10332e] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#10332e] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#e0e7e6] flex items-center gap-2">
              <span>{t('dashboard.todaysCollectionWidget')}</span>
              {dueItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold font-mono">
                  {dueItems.length} Due
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8ba39e]">
              {t('dashboard.dueBorrowersCount', { count: dueItems.length })}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-amber-300 bg-[#041513] border border-amber-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Expected this round:{' '}
          <strong className="text-white font-mono">
            {formatINR(dueItems.reduce((acc, item) => acc + item.amountDue, 0))}
          </strong>
        </div>
      </div>

      {dueItems.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#e0e7e6]">
            {t('dashboard.noDueToday')}
          </p>
          <span className="text-xs text-[#8ba39e]">
            All active weekly loans are up to date!
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dueItems.map(({ borrower, weekNumber, dueDate, amountDue }) => {
            const progress = getBorrowerProgress(borrower);

            return (
              <div
                key={`${borrower.id}-due-${weekNumber}`}
                className="bg-[#041513] border border-[#10332e] hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onSelectBorrower(borrower)}
                    className="text-left group-hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <h4 className="text-sm font-bold text-[#e0e7e6] truncate max-w-[160px]">
                      {borrower.name}
                    </h4>
                    <span className="text-[11px] text-[#8ba39e] block">
                      {borrower.city_name} • Week #{weekNumber}
                    </span>
                  </button>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400 font-mono block">
                      {formatINR(amountDue)}
                    </span>
                    <span className="text-[10px] text-[#8ba39e] block">
                      Due: {formatDate(dueDate, language)}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-[#020d0c] h-1.5 rounded-full overflow-hidden border border-[#10332e]/60">
                  <div
                    style={{ width: `${progress.percentage}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#10332e]">
                  <button
                    onClick={() => onQuickMarkPaid(borrower.id, weekNumber)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('dashboard.markPaidQuick', { amount: amountDue })}</span>
                  </button>

                  <button
                    onClick={() => sendWhatsApp(borrower, amountDue, weekNumber)}
                    className="p-1.5 rounded-xl bg-[#061d1a] hover:bg-[#0a2924] border border-[#10332e] text-[#8ba39e] hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <a
                    href={`tel:${borrower.mobile_number}`}
                    className="p-1.5 rounded-xl bg-[#061d1a] hover:bg-[#0a2924] border border-[#10332e] text-[#8ba39e] hover:text-amber-400 transition-colors"
                    title="Call Borrower"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
