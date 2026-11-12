import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Calendar, Clock, Activity, Check, Sunrise, Sun, Utensils, Moon } from 'lucide-react';

const SLOTS = [
  { id: 'Morning (fasting)', label: 'Morning (fasting)', desc: 'Fasting glucose before breakfast', icon: Sunrise, color: 'text-amber-600 bg-amber-50 border-amber-200 peer-checked:border-amber-500 peer-checked:ring-amber-500' },
  { id: 'After breakfast', label: 'After breakfast', desc: 'Post-breakfast check', icon: Sun, color: 'text-orange-600 bg-orange-50 border-orange-200 peer-checked:border-orange-500 peer-checked:ring-orange-500' },
  { id: 'After lunch', label: 'After lunch', desc: 'Post-lunch check', icon: Utensils, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 peer-checked:border-emerald-500 peer-checked:ring-emerald-500' },
  { id: 'After dinner', label: 'After dinner', desc: 'Post-dinner/bedtime check', icon: Moon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 peer-checked:border-indigo-500 peer-checked:ring-indigo-500' }
];

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

    if (date > today) {
      setError('Date cannot be in the future.');
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
    if (num < 70) return { text: 'Low (<70 mg/dl)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (num <= 140) return { text: 'Normal (70–140 mg/dl)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (num <= 180) return { text: 'Elevated (141–180 mg/dl)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { text: 'High (>180 mg/dl)', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const status = getGlucoseStatus(value);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {readingToEdit ? 'Edit Reading' : 'Record Glucose Reading'}
              </h3>
              <p className="text-xs text-slate-500">Record blood sugar level in mg/dl</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 sm:mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="reading-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="reading-date"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                required
              />
            </div>
          </div>

          {/* Time Slot - Enhanced Visual Cards */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reading-slot" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Time Slot
              </label>
              <span className="text-[11px] text-slate-400">
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
                        ? 'border-pink-500 bg-pink-50/70 ring-2 ring-pink-500 shadow-xs'
                        : isAlreadyLogged
                        ? 'border-slate-200 bg-slate-50/80 opacity-70 hover:opacity-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{s.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                      </div>
                    </div>
                    {isAlreadyLogged && !isSelected && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 whitespace-nowrap ml-1">
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
            <label htmlFor="reading-value" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition placeholder:font-normal"
                required
              />
              <span className="absolute right-4 top-3 text-xs font-medium text-slate-400">mg/dl</span>
            </div>

            {status && (
              <div className={`mt-2 px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-between ${status.color}`}>
                <span>Category</span>
                <span className="font-semibold">{status.text}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Acceptable range: 40 to 600 mg/dl.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition text-center"
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
