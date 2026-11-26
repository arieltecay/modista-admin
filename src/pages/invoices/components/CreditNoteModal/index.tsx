import { useState } from 'react';
import GlobalModal from '@/components/shared/GlobalModal';
import { formatInvoiceNumber, formatMoney, isPastCreditNoteTerm } from '../../utils/format';
import type { CreditNoteModalProps } from './types';

const MIN_REASON = 3;
const MAX_REASON = 300;
const BUTTON = 'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50';

/** Confirmación de una acción fiscal irreversible: exige un motivo. */
export const CreditNoteModal = ({ invoice, isBusy, onClose, onConfirm }: CreditNoteModalProps) => {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const close = () => {
    if (!isBusy) onClose();
  };

  return (
    <GlobalModal
      isOpen
      onClose={close}
      title="Emitir nota de crédito"
      footer={
        <>
          <button
            type="button"
            disabled={isBusy || trimmed.length < MIN_REASON}
            onClick={() => onConfirm(trimmed)}
            className={`${BUTTON} bg-red-700 text-white`}
          >
            {isBusy ? 'Emitiendo…' : 'Emitir nota de crédito'}
          </button>
          <button type="button" disabled={isBusy} onClick={close} className={`${BUTTON} border`}>
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          Anula completa la factura <b>{formatInvoiceNumber(invoice.pointOfSale, invoice.number)}</b> de <b>{invoice.receiver.name}</b> por{' '}
          <b>{formatMoney(invoice.total)}</b> y le envía la nota por mail.
        </p>
        <p className="font-medium text-red-700">No se puede deshacer. No devuelve el dinero ni quita el acceso al curso.</p>
        {isPastCreditNoteTerm(invoice.issuedAt) && (
          <p role="note" className="rounded-md bg-amber-100 p-2 text-amber-900">
            La factura tiene más de 15 días. El plazo corre desde el hecho que origina la nota: consultá con tu contador.
          </p>
        )}
        <label className="flex flex-col gap-1 font-medium">
          Motivo (interno)
          <textarea
            value={reason}
            maxLength={MAX_REASON}
            rows={3}
            disabled={isBusy}
            onChange={(event) => setReason(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 font-normal"
          />
        </label>
      </div>
    </GlobalModal>
  );
};

export default CreditNoteModal;
