/**
 * Shared date validation & normalization utilities for Sweety
 */

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year, month) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

function getTodayString() {
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
 * Supports both ISO (YYYY-MM-DD) and user-facing (DD-MM-YYYY, DD/MM/YYYY) formats.
 *
 * Strictly rejects impossible calendar dates:
 * - 30-02-2022 (February has only 28 days in 2022)
 * - 29-02-2023 (February has only 28 days in non-leap year 2023)
 * - 45-12-2025 (Day 45 does not exist)
 * - 31-04-2026 (April has only 30 days)
 * - Future dates ("Date cannot be in the future.")
 *
 * Returns:
 * {
 *   valid: boolean,
 *   isoDate?: string, // Canonical "YYYY-MM-DD"
 *   error?: string
 * }
 */
function parseAndValidateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Please provide a valid date.' };
  }

  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  if (!clean) {
    return { valid: false, error: 'Please provide a valid date.' };
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
      error: 'Please provide a valid date in YYYY-MM-DD or DD/MM/YYYY format.'
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

module.exports = {
  isLeapYear,
  getDaysInMonth,
  getTodayString,
  parseAndValidateDate
};
