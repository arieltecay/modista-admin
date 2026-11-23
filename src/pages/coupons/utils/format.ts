import type { CouponKind, CouponStatusValue } from '../types';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const EMPTY = '—';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_SUFFIX_LENGTH = 4;

const STATUS_LABELS: Record<CouponStatusValue, string> = {
  active: 'Activo',
  paused: 'Pausado',
  scheduled: 'Programado',
  expired: 'Vencido',
  exhausted: 'Agotado',
};

const date = new Intl.DateTimeFormat('es-AR', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const wholeMoney = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export const formatMoney = (value: number): string => money.format(value);

export const formatDate = (iso: string | undefined): string => (iso ? date.format(new Date(iso)) : EMPTY);

export const statusLabel = (status: CouponStatusValue): string => STATUS_LABELS[status];

export const discountLabel = (type: CouponKind, value: number): string =>
  type === 'percent' ? `${value} %` : wholeMoney.format(value);

export const usageLabel = (used: number, maxUses: number | null): string => (maxUses === null ? String(used) : `${used} / ${maxUses}`);

const parseDay = (day: string): [number, number, number] => {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  return [year, month - 1, dayOfMonth];
};

/** First instant of a local `YYYY-MM-DD` day, as ISO. */
export const toStartOfDayIso = (day: string): string => new Date(...parseDay(day), 0, 0, 0, 0).toISOString();

/** Last instant of a local `YYYY-MM-DD` day, as ISO, so the coupon works the whole last day. */
export const toEndOfDayIso = (day: string): string => new Date(...parseDay(day), 23, 59, 59, 999).toISOString();

/** A readable code the API accepts, e.g. `MODISTAK7Q2`. */
export const generateCode = (): string => {
  const random = crypto.getRandomValues(new Uint8Array(CODE_SUFFIX_LENGTH));
  return `MODISTA${Array.from(random, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')}`;
};

/** Today as a local `YYYY-MM-DD` day, the default start of a new coupon. */
export const todayLocalDay = (now: Date = new Date()): string =>
  [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part) => String(part).padStart(2, '0')).join('-');
