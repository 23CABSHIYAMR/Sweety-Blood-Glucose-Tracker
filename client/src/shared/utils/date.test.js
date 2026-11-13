import { describe, it, expect } from 'vitest';
import {
  parseAndValidateDate,
  isValidDateString,
  isLeapYear,
  getDaysInMonth,
  formatDDMMYYYY,
  formatRangeDDMMYYYY
} from './date';

describe('Date Utilities & Calendar Validations', () => {
  describe('isLeapYear', () => {
    it('correctly identifies leap years and non-leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2022)).toBe(false);
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 29 for February in leap year and 28 in non-leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2022, 2)).toBe(28);
      expect(getDaysInMonth(2023, 2)).toBe(28);
    });

    it('returns 30 for 30-day months (Apr, Jun, Sep, Nov)', () => {
      expect(getDaysInMonth(2026, 4)).toBe(30);
      expect(getDaysInMonth(2026, 6)).toBe(30);
      expect(getDaysInMonth(2026, 9)).toBe(30);
      expect(getDaysInMonth(2026, 11)).toBe(30);
    });

    it('returns 31 for 31-day months (Jan, Mar, May, Jul, Aug, Oct, Dec)', () => {
      expect(getDaysInMonth(2026, 1)).toBe(31);
      expect(getDaysInMonth(2026, 3)).toBe(31);
      expect(getDaysInMonth(2026, 10)).toBe(31);
      expect(getDaysInMonth(2026, 12)).toBe(31);
    });
  });

  describe('parseAndValidateDate & isValidDateString', () => {
    it('rejects impossible calendar date 30-02-2022 (February has only 28 days)', () => {
      const res = parseAndValidateDate('30-02-2022');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/February 2022 only has 28 days/i);
      expect(isValidDateString('30-02-2022')).toBe(false);
    });

    it('rejects impossible calendar date 45-12-2025 (December only has 31 days)', () => {
      const res = parseAndValidateDate('45-12-2025');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/December only has 31 days/i);
      expect(isValidDateString('45-12-2025')).toBe(false);
    });

    it('rejects impossible calendar date 31-04-2026 (April only has 30 days)', () => {
      const res = parseAndValidateDate('31-04-2026');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/April only has 30 days/i);
    });

    it('rejects 29-02-2023 in non-leap year', () => {
      const res = parseAndValidateDate('29-02-2023');
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/February 2023 only has 28 days/i);
    });

    it('accepts and normalizes valid DD-MM-YYYY format', () => {
      const res = parseAndValidateDate('15-01-2024');
      expect(res.valid).toBe(true);
      expect(res.isoDate).toBe('2024-01-15');
    });

    it('accepts and normalizes valid DD/MM/YYYY format', () => {
      const res = parseAndValidateDate('29/02/2024'); // 2024 is leap year
      expect(res.valid).toBe(true);
      expect(res.isoDate).toBe('2024-02-29');
    });

    it('rejects future dates', () => {
      const res = parseAndValidateDate('2099-01-01');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Date cannot be in the future.');
    });

    it('rejects empty or whitespace strings', () => {
      expect(parseAndValidateDate('').valid).toBe(false);
      expect(parseAndValidateDate('   ').valid).toBe(false);
      expect(parseAndValidateDate(null).valid).toBe(false);
    });
  });

  describe('formatDDMMYYYY & formatRangeDDMMYYYY', () => {
    it('formats ISO YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(formatDDMMYYYY('2026-10-15')).toBe('15/10/2026');
      expect(formatDDMMYYYY('2024-02-29')).toBe('29/02/2024');
    });

    it('formats date ranges correctly', () => {
      expect(formatRangeDDMMYYYY('2026-10-01', '2026-10-15')).toBe('01/10/2026 – 15/10/2026');
    });
  });
});

