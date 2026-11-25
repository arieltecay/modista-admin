import CreditNoteCell from '../CreditNoteCell';
import InvoiceStatusBadge from '../InvoiceStatusBadge';
import { formatDateTime, formatInvoiceNumber, formatMoney } from '../../utils/format';
import type { InvoiceRow, InvoicesTableProps } from './types';

const HEADERS = ['Fecha', 'Comprobante', 'Alumna', 'Curso', 'Total', 'Estado', 'Mail', 'Acciones'];
const ACTION = 'rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50';

const mailCell = (row: InvoiceRow): string => {
  if (row.status !== 'authorized') return '—';
  return row.emailSentAt ? 'Enviado' : 'Sin enviar';
};

/** Texto del servidor (nombre, mail, error): siempre como texto de React, nunca como HTML. */
export const InvoicesTable = ({
  rows,
  busyId,
  onResend,
  onRetry,
  onCreditNote,
  onRetryCreditNote,
  onResendCreditNote,
}: InvoicesTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {HEADERS.map((header) => (
            <th key={header} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-3">{formatDateTime(row.createdAt)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatInvoiceNumber(row.pointOfSale, row.number)}</td>
            <td className="px-4 py-3">
              <div className="font-medium text-gray-900">{row.receiver.name}</div>
              <div className="text-gray-500">{row.receiver.email}</div>
            </td>
            <td className="px-4 py-3">{row.courseTitle ?? '—'}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatMoney(row.total)}</td>
            <td className="px-4 py-3">
              <InvoiceStatusBadge status={row.status} isTest={row.environment === 'homologation'} />
              {row.status !== 'authorized' && row.lastError && <p className="mt-1 max-w-xs text-xs text-gray-500">{row.lastError}</p>}
              {row.creditNote && (
                <CreditNoteCell
                  note={row.creditNote}
                  isBusy={busyId === row.id}
                  onResend={() => onResendCreditNote(row.id)}
                  onRetry={() => onRetryCreditNote(row.id)}
                />
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3">{mailCell(row)}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <div className="flex gap-2">
                {row.publicUrl && (
                  <a href={row.publicUrl} target="_blank" rel="noopener noreferrer" className={`${ACTION} border-indigo-200 text-indigo-700`}>
                    Ver / Imprimir
                  </a>
                )}
                {row.status === 'authorized' && (
                  <button type="button" disabled={busyId === row.id} onClick={() => onResend(row.id)} className={ACTION}>
                    Reenviar mail
                  </button>
                )}
                {row.status === 'authorized' && !row.creditNote && (
                  <button type="button" disabled={busyId === row.id} onClick={() => onCreditNote(row.id)} className={`${ACTION} border-red-200 text-red-700`}>
                    Nota de crédito
                  </button>
                )}
                {row.status !== 'authorized' && (
                  <button type="button" disabled={busyId === row.id} onClick={() => onRetry(row.id)} className={ACTION}>
                    Reintentar
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default InvoicesTable;
