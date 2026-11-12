import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = {
            success: {
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            },
            error: {
              bg: 'bg-rose-50 border-rose-200 text-rose-800',
              icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            },
            info: {
              bg: 'bg-slate-900 border-slate-800 text-white',
              icon: <Info className="w-5 h-5 text-pink-400 flex-shrink-0" />
            }
          }[toast.type] || {
            bg: 'bg-slate-900 border-slate-800 text-white',
            icon: <Info className="w-5 h-5 text-pink-400 flex-shrink-0" />
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all animate-in slide-in-from-top-3 duration-200 ${config.bg}`}
            >
              {config.icon}
              <p className="text-xs sm:text-sm font-medium flex-1 pt-0.5">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 rounded-lg transition"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
