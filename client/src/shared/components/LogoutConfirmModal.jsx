import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, isLoggingOut = false }) {
  // Lock background body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-200/50 dark:border-rose-900/50">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Out of Sweety?</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Are you sure you want to end your session? You will need to sign in again to access and record your blood glucose readings.
        </p>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-rose-200 dark:shadow-rose-950/40 transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

