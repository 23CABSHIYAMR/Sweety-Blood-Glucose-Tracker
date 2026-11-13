/**
 * Shared date utilities & validations for Sweety
 */

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const [year, month, day] = trimmed.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() + 1 === month && d.getDate() === day;
}

export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  return dateStr.trim() > getTodayString();
}

/**
 * Validates a date input before dispatching API requests
 */
export function validateDateInput(dateStr) {
  if (!dateStr || !dateStr.trim()) {
    return { valid: false, error: 'Please enter a date.' };
  }
  if (!isValidDateString(dateStr)) {
    return { valid: false, error: 'Please enter a valid calendar date in YYYY-MM-DD format.' };
  }
  if (isFutureDate(dateStr)) {
    return { valid: false, error: 'Date cannot be in the future.' };
  }
  return { valid: true };
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
