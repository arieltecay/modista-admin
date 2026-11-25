export type InvoiceStatus = 'pending' | 'authorized' | 'failed';

export interface InvoiceItem {
  id: string;
  status: InvoiceStatus;
  /** `homologation` = comprobante de prueba, sin validez fiscal. */
  environment: 'homologation' | 'production';
  pointOfSale: number;
  total: number;
  receiver: { name: string; email: string };
  attempts: number;
  /** Instante de creación (ISO). */
  createdAt: string;
  /** Todavía sin número mientras ARCA no lo asignó. */
  number?: number;
  cae?: string;
  courseTitle?: string;
  issuedAt?: string;
  emailSentAt?: string;
  lastError?: string;
  /** Solo en facturas autorizadas: página pública con el formato oficial. */
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

export interface InvoicesPage {
  items: InvoiceItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ListInvoicesParams {
  page: number;
  limit: number;
  status?: InvoiceStatus;
  q?: string;
}

export interface RetryInvoiceResult {
  status: InvoiceStatus;
  issued: boolean;
}
