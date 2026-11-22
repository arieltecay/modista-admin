export type InvoiceStatusFilter = '' | 'pending' | 'authorized' | 'failed';

export interface InvoicesQuery {
  page: number;
  limit: number;
  status?: 'pending' | 'authorized' | 'failed';
  q?: string;
}

export interface InvoiceListItem {
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

export type InvoicesLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: InvoiceListItem[]; total: number };
