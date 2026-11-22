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

export const formatMoney = (value: number): string => money.format(value);

export const formatDateTime = (iso: string | undefined): string => (iso ? dateTime.format(new Date(iso)) : EMPTY);
