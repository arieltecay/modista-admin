import GlobalModal from '../../../../components/shared/GlobalModal';
import type { ConfirmDialogProps } from './types';

/** Confirmation for destructive actions, accessible and consistent across the Messages tabs. */
export const ConfirmDialog = ({ isOpen, title, message, confirmLabel, busy, onConfirm, onClose }: ConfirmDialogProps) => (
  <GlobalModal
    isOpen={isOpen}
    onClose={() => !busy && onClose()}
    title={title}
    footer={
      <>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="inline-flex w-full justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 sm:w-auto"
        >
          {busy ? 'Procesando…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="mt-3 disabled:opacity-50 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto"
        >
          Cancelar
        </button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
  </GlobalModal>
);
