import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime, formatInteger, formatMinute, formatPercent, shortId } from './format';

describe('format helpers', () => {
  it('formats counts, money and shares in es-AR', () => {
    expect(formatInteger(1234)).toBe('1.234');
    expect(formatCurrency(190000)).toMatch(/190\.000/);
    expect(formatPercent(2 / 3)).toMatch(/66,7\s?%/);
  });

  it('shows an em dash instead of NaN, null or infinity', () => {
    for (const value of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatPercent(value)).toBe('—');
      expect(formatCurrency(value)).toBe('—');
    }
  });

  it('shortens identifiers to 8 characters', () => {
    expect(shortId('12345678-aaaa-bbbb-cccc-dddddddddddd')).toBe('12345678');
    expect(shortId('abc')).toBe('abc');
  });

  it('formats instants in the requested timezone', () => {
    expect(formatDateTime('2026-11-18T15:30:00.000Z', 'America/Argentina/Tucuman')).toBe('18/11 12:30');
    expect(formatDateTime('2026-11-18T15:30:00.000Z', 'UTC')).toBe('18/11 15:30');
    expect(formatMinute('2026-11-18T15:30:00.000Z', 'America/Argentina/Tucuman')).toBe('12:30');
    expect(formatDateTime('not a date', 'UTC')).toBe('—');
  });
});
