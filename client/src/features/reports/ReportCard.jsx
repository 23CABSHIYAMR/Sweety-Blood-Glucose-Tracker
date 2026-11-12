import React from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';

export default function ReportCard({ title, subtitle, stats, icon: Icon, colorTheme = 'pink' }) {
  const { count, highest, lowest, average } = stats || { count: 0 };

  const themeColors = {
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-950/60',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-100 dark:border-pink-900/50',
      pill: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-pink-800/50'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/50',
      pill: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      pill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
    }
  }[colorTheme] || themeColors.pink;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col justify-between transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${themeColors.bg} ${themeColors.text} flex items-center justify-center flex-shrink-0 border ${themeColors.border}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">{title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{subtitle}</p>
            </div>
          </div>
          <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${themeColors.pill}`}>
            {count} {count === 1 ? 'Reading' : 'Readings'}
          </span>
        </div>

        {count === 0 ? (
          <div className="mt-4 sm:mt-5 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
            <AlertCircle className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-500 mb-1.5" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No readings recorded</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">There is no data available for this date range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5">
            {/* Highest */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-rose-500 dark:text-rose-400 text-[10px] sm:text-xs font-semibold mb-1">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">High</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{highest}</span>
                <span className="text-[10px] sm:text-xs font-normal text-slate-400 dark:text-slate-500 block sm:inline sm:ml-1">mg/dl</span>
              </div>
            </div>

            {/* Lowest */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400 text-[10px] sm:text-xs font-semibold mb-1">
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">Low</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{lowest}</span>
                <span className="text-[10px] sm:text-xs font-normal text-slate-400 dark:text-slate-500 block sm:inline sm:ml-1">mg/dl</span>
              </div>
            </div>

            {/* Average */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold mb-1">
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">Avg</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{average}</span>
                <span className="text-[10px] sm:text-xs font-normal text-slate-400 dark:text-slate-500 block sm:inline sm:ml-1">mg/dl</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
