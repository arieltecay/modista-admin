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
}

export interface InvoicesTableProps {
  rows: InvoiceRow[];
  /** Id de la factura con una acción en curso: sus botones se deshabilitan. */
  busyId: string | null;
  onResend: (id: string) => void;
  onRetry: (id: string) => void;
}
