const NO_VALUE = '—';

const integer = new Intl.NumberFormat('es-AR');
const percent = new Intl.NumberFormat('es-AR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const isNumber = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value);

export const formatInteger = (value: number | null | undefined): string => (isNumber(value) ? integer.format(value) : NO_VALUE);
export const formatPercent = (value: number | null | undefined): string => (isNumber(value) ? percent.format(value) : NO_VALUE);
export const formatCurrency = (value: number | null | undefined): string => (isNumber(value) ? currency.format(value) : NO_VALUE);

export const SHORT_ID_LENGTH = 8;
export const shortId = (id: string): string => id.slice(0, SHORT_ID_LENGTH);

const parts = (iso: string, timezone: string, options: Intl.DateTimeFormatOptions): Record<string, string> | null => {
  if (!Number.isFinite(Date.parse(iso))) return null;
  const formatted = new Intl.DateTimeFormat('es-AR', { timeZone: timezone, hourCycle: 'h23', ...options }).formatToParts(new Date(iso));
  return Object.fromEntries(formatted.map((part) => [part.type, part.value]));
};

/** `dd/mm hh:mm` in the report's timezone. */
export const formatDateTime = (iso: string, timezone: string): string => {
  const p = parts(iso, timezone, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return p ? `${p.day}/${p.month} ${p.hour}:${p.minute}` : NO_VALUE;
};

export const formatMinute = (iso: string, timezone: string): string => {
  const p = parts(iso, timezone, { hour: '2-digit', minute: '2-digit' });
  return p ? `${p.hour}:${p.minute}` : NO_VALUE;
};
