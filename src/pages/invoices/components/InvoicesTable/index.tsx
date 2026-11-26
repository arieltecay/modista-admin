import CreditNoteCell from '../CreditNoteCell';
import InvoiceStatusBadge from '../InvoiceStatusBadge';
import { formatDateTime, formatInvoiceNumber, formatMoney } from '../../utils/format';
import type { InvoiceRow, InvoicesTableProps } from './types';

const HEADERS = ['Fecha', 'Comprobante', 'Alumna', 'Curso', 'Total', 'Estado', 'Mail', 'Acciones'];
const CELL = 'px-3 py-3';
/** Texto libre del servidor (mail, curso, errores): corta palabras largas; el `min-w` de la celda lo mantiene legible en tablet. */
const WRAP = '[overflow-wrap:anywhere]';
const ACTION = 'whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50';

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
  <div className="relative overflow-x-auto">
    <table role="table" className="stacked-table min-w-full divide-y divide-gray-200 text-sm">
      <thead role="rowgroup" className="bg-gray-50">
        <tr role="row">
          {HEADERS.map((header) => (
            <th role="columnheader" key={header} scope="col" className={`${CELL} text-left font-semibold text-gray-600`}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className="divide-y divide-gray-100 bg-white">
        {rows.map((row) => (
          <tr role="row" key={row.id}>
            <td role="cell" data-label="Fecha" className={CELL}>{formatDateTime(row.createdAt)}</td>
            <td role="cell" data-label="Comprobante" className={`${CELL} whitespace-nowrap`}>{formatInvoiceNumber(row.pointOfSale, row.number)}</td>
            <td role="cell" data-label="Alumna" className={`${CELL} md:min-w-32 ${WRAP}`}>
              <div className="min-w-0">
                <div className="font-medium text-gray-900">{row.receiver.name}</div>
                <div className="text-gray-500">{row.receiver.email}</div>
              </div>
            </td>
            <td role="cell" data-label="Curso" className={`${CELL} md:min-w-32 ${WRAP}`}>{row.courseTitle ?? '—'}</td>
            <td role="cell" data-label="Total" className={`${CELL} whitespace-nowrap`}>{formatMoney(row.total)}</td>
            <td role="cell" data-label="Estado" className={`${CELL} md:min-w-40 ${WRAP}`}>
              <div className="min-w-0">
                <InvoiceStatusBadge status={row.status} isTest={row.environment === 'homologation'} />
                {row.status !== 'authorized' && row.lastError && <p className="mt-1 text-xs text-gray-500">{row.lastError}</p>}
                {row.creditNote && (
                  <CreditNoteCell
                    note={row.creditNote}
                    isBusy={busyId === row.id}
                    onResend={() => onResendCreditNote(row.id)}
                    onRetry={() => onRetryCreditNote(row.id)}
                  />
                )}
              </div>
            </td>
            <td role="cell" data-label="Mail" className={`${CELL} whitespace-nowrap`}>{mailCell(row)}</td>
            <td role="cell" data-label="Acciones" className={CELL}>
              <div className="flex flex-wrap justify-end gap-2 md:max-w-52 md:justify-start">
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
