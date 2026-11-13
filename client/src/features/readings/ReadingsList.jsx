import React from 'react';
import { Plus, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, Droplet, Sunrise, Sun, Utensils, Moon } from 'lucide-react';
import { getTodayString, validateDateInput } from '../../shared/utils/date';

export const SLOT_CONFIG = {
  'Morning (fasting)': {
    bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
    icon: <Sunrise className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
  },
  'After breakfast': {
    bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
    dot: 'bg-orange-500',
    icon: <Sun className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
  },
  'After lunch': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
    icon: <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
  },
  'After dinner': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
    dot: 'bg-indigo-500',
    icon: <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
  }
};

function getValueBadge(val) {
  if (val < 70) return { label: 'Low', class: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50' };
  if (val <= 140) return { label: 'Normal', class: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50' };
  if (val <= 180) return { label: 'Elevated', class: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50' };
  return { label: 'High', class: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50' };
}

export default function ReadingsList({
  readings = [],
  pagination,
  currentPage,
  onPageChange,
  limit = 15,
  dateFilter,
  onDateFilterChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading
}) {
  const today = getTodayString();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Blood Glucose Logs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Record up to 4 readings per day across daily slots</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Date Filter (Future dates disabled) */}
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="date"
              max={today}
              value={dateFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const check = validateDateInput(val);
                  if (!check.valid) {
                    return; // Strictly prevent invalid or future dates
                  }
                }
                onDateFilterChange(val);
              }}
              className="w-full sm:w-auto pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-slate-700 dark:text-slate-200"
              title="Filter by specific date (future dates disabled)"
            />
            {dateFilter && (
              <button
                onClick={() => onDateFilterChange('')}
                className="ml-1.5 px-2 py-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Reading Button */}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs font-semibold shadow-xs shadow-pink-200 dark:shadow-pink-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
        {isLoading ? (
          /* SKELETON LOADER FOR DASHBOARD TABLE & MOBILE CARDS */
          <>
            {/* Mobile Skeleton Cards */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  </div>
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-end gap-2">
                    <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Skeleton Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Slot</th>
                    <th className="py-3.5 px-6">Value (mg/dl)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {[...Array(15)].map((_, n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                          <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : readings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 dark:text-pink-400 flex items-center justify-center mb-3">
              <Droplet className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">No readings found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
              {dateFilter
                ? `No readings recorded for ${dateFilter}. Record a reading or clear the date filter.`
                : 'You have not recorded any glucose readings yet. Start tracking your levels today!'}
            </p>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Reading</span>
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Touch-friendly Card List */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {readings.map((reading) => {
                const slotConfig = SLOT_CONFIG[reading.slot] || {
                  bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                  icon: null
                };
                const statusConfig = getValueBadge(reading.value);

                return (
                  <div key={reading.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${slotConfig.bg}`}
                      >
                        {slotConfig.icon}
                        <span>{reading.slot}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusConfig.class}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {reading.value}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">mg/dl</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {reading.date}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditClick(reading)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(reading)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP/TABLET VIEW: Structured Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Slot</th>
                    <th className="py-3.5 px-6">Value (mg/dl)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {readings.map((reading) => {
                    const slotConfig = SLOT_CONFIG[reading.slot] || {
                      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                      icon: null
                    };
                    const statusConfig = getValueBadge(reading.value);

                    return (
                      <tr key={reading.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {reading.date}
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${slotConfig.bg}`}
                          >
                            {slotConfig.icon}
                            <span>{reading.slot}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {reading.value}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">mg/dl</span>
                        </td>

                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusConfig.class}`}>
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onEditClick(reading)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Edit reading"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteClick(reading)}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete reading"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {pagination && readings.length !== 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Page <span className="font-semibold text-slate-800 dark:text-slate-200">{pagination.page}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{pagination.totalPages || 1}</span> ({pagination.total} total)
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                15 per page
              </span>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
