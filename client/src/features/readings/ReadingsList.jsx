import React from 'react';
import { Plus, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, Droplet, Sunrise, Sun, Utensils, Moon } from 'lucide-react';

export const SLOT_CONFIG = {
  'Morning (fasting)': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: <Sunrise className="w-3.5 h-3.5 text-amber-600" />
  },
  'After breakfast': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: <Sun className="w-3.5 h-3.5 text-orange-600" />
  },
  'After lunch': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: <Utensils className="w-3.5 h-3.5 text-emerald-600" />
  },
  'After dinner': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: <Moon className="w-3.5 h-3.5 text-indigo-600" />
  }
};

function getValueBadge(val) {
  if (val < 70) return { label: 'Low', class: 'bg-blue-100 text-blue-700' };
  if (val <= 140) return { label: 'Normal', class: 'bg-emerald-100 text-emerald-700' };
  if (val <= 180) return { label: 'Elevated', class: 'bg-amber-100 text-amber-700' };
  return { label: 'High', class: 'bg-rose-100 text-rose-700' };
}

export default function ReadingsList({
  readings = [],
  pagination,
  currentPage,
  onPageChange,
  dateFilter,
  onDateFilterChange,
  onAddClick,
  onEditClick,
  onDeleteClick,
  isLoading
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Blood Glucose Logs</h2>
          <p className="text-xs text-slate-500 mt-0.5">Record up to 4 readings per day across daily slots</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Date Filter */}
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-slate-700"
              title="Filter by specific date"
            />
            {dateFilter && (
              <button
                onClick={() => onDateFilterChange('')}
                className="ml-1.5 px-2 py-1 text-xs text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {/* Add Reading Button */}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs font-semibold shadow-xs shadow-pink-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reading</span>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-3"></div>
            <p>Loading glucose logs...</p>
          </div>
        ) : readings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-3">
              <Droplet className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No readings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
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
            <div className="sm:hidden divide-y divide-slate-100">
              {readings.map((reading) => {
                const slotConfig = SLOT_CONFIG[reading.slot] || {
                  bg: 'bg-slate-100 text-slate-700 border-slate-200',
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
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">
                          {reading.value}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">mg/dl</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {reading.date}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-50 flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditClick(reading)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteClick(reading)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
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
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Slot</th>
                    <th className="py-3.5 px-6">Value (mg/dl)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readings.map((reading) => {
                    const slotConfig = SLOT_CONFIG[reading.slot] || {
                      bg: 'bg-slate-100 text-slate-700 border-slate-200',
                      icon: null
                    };
                    const statusConfig = getValueBadge(reading.value);

                    return (
                      <tr key={reading.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-6 font-medium text-slate-900 whitespace-nowrap">
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
                          <span className="text-base font-bold text-slate-900 tracking-tight">
                            {reading.value}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">mg/dl</span>
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
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title="Edit reading"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteClick(reading)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
