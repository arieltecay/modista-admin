const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const EMPTY = '—';

const STATUS_LABELS = { authorized: 'Autorizada', pending: 'Pendiente', failed: 'Con error' } as const;

const dateTime = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export const statusLabel = (status: keyof typeof STATUS_LABELS): string => STATUS_LABELS[status];

/** Punto de venta (5 dígitos) y número (8) como los imprime ARCA; sin número todavía, un guion. */
export const formatInvoiceNumber = (pointOfSale: number, number: number | undefined): string =>
  number === undefined ? EMPTY : `${String(pointOfSale).padStart(5, '0')}-${String(number).padStart(8, '0')}`;

const CREDIT_NOTE_LABELS = { authorized: 'Anulada', pending: 'Nota de crédito pendiente', failed: 'Nota de crédito con error' } as const;

export const creditNoteLabel = (status: keyof typeof CREDIT_NOTE_LABELS): string => CREDIT_NOTE_LABELS[status];

const CREDIT_NOTE_TERM_MS = 15 * 24 * 3_600_000;

/** Más de 15 días desde la factura: solo para avisar, nunca para bloquear. */
export const isPastCreditNoteTerm = (issuedAt: string | undefined, now = Date.now()): boolean =>
  issuedAt !== undefined && now - new Date(issuedAt).getTime() > CREDIT_NOTE_TERM_MS;

export const formatMoney = (value: number): string => money.format(value);

export const formatDateTime = (iso: string | undefined): string => (iso ? dateTime.format(new Date(iso)) : EMPTY);
