import { describe, expect, it } from 'vitest';
import { discountLabel, formatDate, formatMoney, generateCode, statusLabel, toEndOfDayIso, toStartOfDayIso, usageLabel } from './format';

describe('coupon format helpers', () => {
  it('labels a percent coupon as a percentage and a fixed one as pesos', () => {
    expect(discountLabel('percent', 20)).toBe('20 %');
    expect(discountLabel('fixed', 500)).toMatch(/500/);
    expect(discountLabel('fixed', 500)).toContain('$');
  });

  it('shows money in Argentine pesos', () => {
    expect(formatMoney(20900)).toMatch(/20\.900,00/);
  });

  it('shows a date as day, month and year in the Argentine zone and a dash when there is none', () => {
    expect(formatDate('2026-11-23T15:00:00.000Z')).toBe('23/11/2026');
    expect(formatDate(undefined)).toBe('—');
  });

  it('turns a local day into the first and last instant of that day', () => {
    const start = new Date(toStartOfDayIso('2026-11-23'));
    const end = new Date(toEndOfDayIso('2026-11-23'));

    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()]).toEqual([2026, 10, 23, 0, 0]);
    expect([end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes(), end.getSeconds()]).toEqual([2026, 10, 23, 23, 59, 59]);
  });

  it('explains each status in Spanish', () => {
    expect(statusLabel('active')).toBe('Activo');
    expect(statusLabel('paused')).toBe('Pausado');
    expect(statusLabel('scheduled')).toBe('Programado');
    expect(statusLabel('expired')).toBe('Vencido');
    expect(statusLabel('exhausted')).toBe('Agotado');
  });

  it('shows uses against the cap, or just the uses when there is no cap', () => {
    expect(usageLabel(3, 50)).toBe('3 / 50');
    expect(usageLabel(3, null)).toBe('3');
  });

  it('generates codes the API accepts, different each time', () => {
    const codes = new Set(Array.from({ length: 30 }, () => generateCode()));

    expect(codes.size).toBeGreaterThan(25);
    for (const code of codes) expect(code).toMatch(/^[A-Z0-9]{3,32}$/);
  });
});
