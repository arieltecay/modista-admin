import { statusLabel } from '../../utils/format';
import type { InvoiceStatusBadgeProps } from './types';

const STATUS_STYLES = {
  authorized: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
} as const;

export const InvoiceStatusBadge = ({ status, isTest = false }: InvoiceStatusBadgeProps) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>{statusLabel(status)}</span>
    {isTest && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">Prueba</span>}
  </span>
);

export default InvoiceStatusBadge;
