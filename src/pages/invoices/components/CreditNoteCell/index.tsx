import { creditNoteLabel, formatInvoiceNumber } from '../../utils/format';
import type { CreditNoteCellProps } from './types';

const ACTION = 'rounded-md border px-2 py-0.5 text-xs font-medium disabled:opacity-50';

/** Estado de la nota de crédito de una factura y sus acciones. */
export const CreditNoteCell = ({ note, isBusy, onResend, onRetry }: CreditNoteCellProps) => (
  <div className="mt-2 space-y-1 text-xs text-gray-600">
    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-semibold text-white">{creditNoteLabel(note.status)}</span>
    {note.status === 'authorized' && (
      <p>
        NC {formatInvoiceNumber(note.pointOfSale, note.number)} · {note.emailSentAt ? 'Mail de nota enviado' : 'Mail de nota sin enviar'}
      </p>
    )}
    {note.reason && <p className="max-w-xs whitespace-normal break-words">Motivo: {note.reason}</p>}
    {note.status !== 'authorized' && note.lastError && <p className="max-w-xs">{note.lastError}</p>}
    <div className="flex gap-2">
      {note.publicUrl && (
        <a href={note.publicUrl} target="_blank" rel="noopener noreferrer" className={`${ACTION} border-indigo-200 text-indigo-700`}>
          Ver nota
        </a>
      )}
      <button type="button" disabled={isBusy} onClick={note.status === 'authorized' ? onResend : onRetry} className={ACTION}>
        {note.status === 'authorized' ? 'Reenviar nota' : 'Reintentar nota'}
      </button>
    </div>
  </div>
);

export default CreditNoteCell;
