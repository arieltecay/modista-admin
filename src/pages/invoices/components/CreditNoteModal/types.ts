export interface CreditNoteModalProps {
  invoice: {
    pointOfSale: number;
    total: number;
    receiver: { name: string };
    number?: number;
    /** Instante de emisión (ISO). */
    issuedAt?: string;
  };
  /** La nota se está emitiendo: no se puede cerrar ni confirmar de nuevo. */
  isBusy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}
