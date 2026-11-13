/**
 * Shared date utilities & validations for Sweety
 */

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year, month) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Validates and normalizes date strings.
 * Supports ISO (YYYY-MM-DD, YYYY/MM/DD) and user-facing (DD-MM-YYYY, DD/MM/YYYY) formats.
 *
 * Strictly rejects impossible calendar dates:
 * - 30-02-2022 (February has only 28 days in 2022)
 * - 29-02-2023 (February has only 28 days in non-leap year 2023)
 * - 45-12-2025 (Day 45 does not exist)
 * - 31-04-2026 (April has only 30 days)
 * - Future dates ("Date cannot be in the future.")
 */
export function parseAndValidateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Please enter a date.' };
  }

  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  if (!clean) {
    return { valid: false, error: 'Please enter a date.' };
  }

  let year, month, day;

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (ymdMatch) {
    year = Number(ymdMatch[1]);
    month = Number(ymdMatch[2]);
    day = Number(ymdMatch[3]);
  } else if (dmyMatch) {
    day = Number(dmyMatch[1]);
    month = Number(dmyMatch[2]);
    year = Number(dmyMatch[3]);
  } else {
    return {
      valid: false,
      error: 'Please enter a valid calendar date in YYYY-MM-DD or DD/MM/YYYY format.'
    };
  }

  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Year must be between 1900 and 2100.' };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12.' };
  }

  const maxDays = getDaysInMonth(year, month);
  if (day < 1 || day > maxDays) {
    if (month === 2) {
      const leapText = isLeapYear(year) ? '29 days (leap year)' : '28 days';
      return {
        valid: false,
        error: `Invalid date: February ${year} only has ${leapText}.`
      };
    }
    return {
      valid: false,
      error: `Invalid date: ${MONTH_NAMES[month]} only has ${maxDays} days.`
    };
  }

  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = getTodayString();

  if (isoDate > today) {
    return { valid: false, error: 'Date cannot be in the future.' };
  }

  return { valid: true, isoDate };
}

export function isValidDateString(dateStr) {
  return parseAndValidateDate(dateStr).valid;
}

export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const res = parseAndValidateDate(dateStr);
  if (!res.valid) return false;
  return res.isoDate > getTodayString();
}

/**
 * Validates a date input before dispatching API requests
 */
export function validateDateInput(dateStr) {
  return parseAndValidateDate(dateStr);
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
