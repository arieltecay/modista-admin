export interface InvoiceRow {
  id: string;
  status: 'pending' | 'authorized' | 'failed';
  environment: 'homologation' | 'production';
  pointOfSale: number;
  total: number;
  receiver: { name: string; email: string };
  /** Instante de creación (ISO). */
  createdAt: string;
  number?: number;
  courseTitle?: string;
  emailSentAt?: string;
  lastError?: string;
  publicUrl?: string;
  /** Nota de crédito que anula la factura, si se emitió o se intentó. */
  creditNote?: {
    status: 'pending' | 'authorized' | 'failed';
    pointOfSale: number;
    number?: number;
    reason?: string;
    emailSentAt?: string;
    lastError?: string;
    publicUrl?: string;
  };
}

export interface InvoicesTableProps {
  rows: InvoiceRow[];
  /** Id de la factura con una acción en curso: sus botones se deshabilitan. */
  busyId: string | null;
  onResend: (id: string) => void;
  onRetry: (id: string) => void;
  /** Pide emitir la nota de crédito (abre la confirmación). */
  onCreditNote: (id: string) => void;
  onRetryCreditNote: (id: string) => void;
  onResendCreditNote: (id: string) => void;
}
