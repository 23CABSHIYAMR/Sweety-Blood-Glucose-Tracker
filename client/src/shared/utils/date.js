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

/**
 * Consistently format date strings across the application to DD/MM/YYYY
 * e.g. "2026-10-15" -> "15/10/2026"
 */
export function formatDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr !== 'string') {
    if (dateStr instanceof Date) {
      const year = dateStr.getFullYear();
      const month = String(dateStr.getMonth() + 1).padStart(2, '0');
      const day = String(dateStr.getDate()).padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    return '';
  }

  // Already in DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }

  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const parts = clean.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  return dateStr;
}

/**
 * Format date range as "DD/MM/YYYY – DD/MM/YYYY"
 */
export function formatRangeDDMMYYYY(startDate, endDate) {
  if (!startDate || !endDate) return '';
  return `${formatDDMMYYYY(startDate)} – ${formatDDMMYYYY(endDate)}`;
}

/**
 * Alias for formatDDMMYYYY for backward-compatible call-sites
 */
export function formatDisplayDate(dateStr) {
  return formatDDMMYYYY(dateStr);
}
