import { describe, expect, it } from 'vitest';
import { formatDateTime, formatInvoiceNumber, formatMoney, statusLabel, isPastCreditNoteTerm } from './format';

describe('invoice list formatting', () => {
  it('labels every status in Spanish', () => {
    expect(statusLabel('authorized')).toBe('Autorizada');
    expect(statusLabel('pending')).toBe('Pendiente');
    expect(statusLabel('failed')).toBe('Con error');
  });

  it('shows the number as ARCA prints it, or a dash while it has none', () => {
    expect(formatInvoiceNumber(1, 3)).toBe('00001-00000003');
    expect(formatInvoiceNumber(1, undefined)).toBe('—');
  });

  it('formats money in Argentine pesos', () => {
    expect(formatMoney(20900)).toMatch(/20\.900,00/);
  });

  it('formats the date in the Argentine time zone, and a dash when missing', () => {
    // 02:30 UTC is still the evening of the 21st in Argentina.
    expect(formatDateTime('2026-11-22T02:30:00Z')).toMatch(/21\/11\/2026/);
    expect(formatDateTime(undefined)).toBe('—');
  });
});

describe('isPastCreditNoteTerm', () => {
  const issued = '2026-11-01T00:00:00Z';
  const limit = new Date('2026-11-16T00:00:00Z').getTime();

  it('warns only once 15 days have passed', () => {
    expect(isPastCreditNoteTerm(issued, limit)).toBe(false);
    expect(isPastCreditNoteTerm(issued, limit + 1)).toBe(true);
    expect(isPastCreditNoteTerm(undefined, limit)).toBe(false);
  });
});
