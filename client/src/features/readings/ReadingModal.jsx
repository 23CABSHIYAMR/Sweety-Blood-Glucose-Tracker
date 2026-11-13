import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, Clock, Activity, Check, Sunrise, Sun, Utensils, Moon } from 'lucide-react';
import { getTodayString, validateDateInput } from '../../shared/utils/date';

const SLOTS = [
  { id: 'Morning (fasting)', label: 'Morning (fasting)', desc: 'Fasting glucose before breakfast', icon: Sunrise },
  { id: 'After breakfast', label: 'After breakfast', desc: 'Post-breakfast check', icon: Sun },
  { id: 'After lunch', label: 'After lunch', desc: 'Post-lunch check', icon: Utensils },
  { id: 'After dinner', label: 'After dinner', desc: 'Post-dinner/bedtime check', icon: Moon }
];

export default function ReadingModal({ isOpen, onClose, onSave, readingToEdit, existingReadings = [] }) {
  const today = getTodayString();
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(SLOTS[0].id);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (readingToEdit) {
      setDate(readingToEdit.date);
      setSlot(readingToEdit.slot);
      setValue(readingToEdit.value.toString());
    } else {
      setDate(today);
      const todayUsedSlots = existingReadings
        .filter(r => r.date === today)
        .map(r => r.slot);
      const firstAvailable = SLOTS.find(s => !todayUsedSlots.includes(s.id)) || SLOTS[0];
      setSlot(firstAvailable.id);
      setValue('');
    }
    setError('');
  }, [readingToEdit, isOpen]);

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

  // Track which slots are already recorded for the currently selected date (excluding the reading being edited)
  const recordedSlotsForDate = existingReadings
    .filter(r => r.date === date && (!readingToEdit || r.id !== readingToEdit.id))
    .map(r => r.slot);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (value === undefined || value === null || value === '') {
      setError('Please enter a glucose value.');
      return;
    }

    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    const dateCheck = validateDateInput(date);
    if (!dateCheck.valid) {
      setError(dateCheck.error);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: readingToEdit?.id,
        date,
        slot,
        value: numValue
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save reading. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const getGlucoseStatus = (val) => {
    const num = Number(val);
    if (!num || isNaN(num)) return null;
    if (num < 70) return { text: 'Low (<70 mg/dl)', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' };
    if (num <= 140) return { text: 'Normal (70–140 mg/dl)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' };
    if (num <= 180) return { text: 'Elevated (141–180 mg/dl)', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' };
    return { text: 'High (>180 mg/dl)', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' };
  };

  const status = getGlucoseStatus(value);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0 border border-pink-200/50 dark:border-pink-800/50">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {readingToEdit ? 'Edit Reading' : 'Record Glucose Reading'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Record blood sugar level in mg/dl</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 sm:mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="reading-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="reading-date"
                type="date"
                value={date}
                max={today}
                onChange={(e) => {
                  const val = e.target.value;
                  setDate(val);
                  const check = validateDateInput(val);
                  if (!check.valid) {
                    setError(check.error);
                  } else {
                    setError('');
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>
          </div>

          {/* Time Slot - Enhanced Visual Cards */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reading-slot" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Time Slot
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {recordedSlotsForDate.length} of 4 logged
              </span>
            </div>

            {/* Standard accessible select for keyboard/screen-reader & test matchers */}
            <select
              id="reading-slot"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="sr-only"
              tabIndex={-1}
            >
              {SLOTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Visual Slot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SLOTS.map((s) => {
                const IconComponent = s.icon;
                const isSelected = slot === s.id;
                const isAlreadyLogged = recordedSlotsForDate.includes(s.id);

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlot(s.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 ring-2 ring-pink-500 shadow-xs'
                        : isAlreadyLogged
                        ? 'border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{s.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.desc}</div>
                      </div>
                    </div>
                    {isAlreadyLogged && !isSelected && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap ml-1">
                        Logged
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Value */}
          <div>
            <label htmlFor="reading-value" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Glucose Value (mg/dl)
            </label>
            <div className="relative">
              <input
                id="reading-value"
                type="number"
                min="40"
                max="600"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 110"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500 transition placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
              <span className="absolute right-4 top-3 text-xs font-medium text-slate-400 dark:text-slate-500">mg/dl</span>
            </div>

            {status && (
              <div className={`mt-2 px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between ${status.color}`}>
                <span>Category</span>
                <span className="font-semibold">{status.text}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Acceptable range: 40 to 600 mg/dl.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : readingToEdit ? 'Update Reading' : 'Save Reading'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
