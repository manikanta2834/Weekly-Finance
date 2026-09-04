import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDangerous = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#061d1a] border border-[#10332e] rounded-3xl p-6 shadow-2xl space-y-5 border-t-4 border-t-rose-500">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDangerous ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {isDangerous ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#e0e7e6]">{title}</h3>
              <p className="text-xs text-[#8ba39e] mt-0.5">{message}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[#8ba39e] hover:text-white hover:bg-[#0a2924] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#041513] hover:bg-[#0a2924] text-[#8ba39e] hover:text-white border border-[#10332e] text-xs font-semibold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5 ${
              isDangerous
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-950/50'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
            }`}
          >
            {isDangerous && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
