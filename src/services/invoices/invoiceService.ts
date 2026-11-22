import { apiClient } from '../config/apiClient';
import type { InvoicesPage, ListInvoicesParams, RetryInvoiceResult } from './types';

/** GET /api/invoices — listado paginado; solo viajan los filtros que tienen valor. */
export const listInvoices = ({ q, status, ...paging }: ListInvoicesParams): Promise<InvoicesPage> =>
  apiClient.get('/invoices', { params: { ...paging, ...(status ? { status } : {}), ...(q ? { q } : {}) } });

/** POST /api/invoices/:id/retry — reabre una factura rechazada o pendiente y la emite. */
export const retryInvoice = (id: string): Promise<RetryInvoiceResult> => apiClient.post(`/invoices/${id}/retry`);

/** POST /api/invoices/:id/resend — vuelve a mandar el mail con el link a la factura. */
export const resendInvoice = (id: string): Promise<{ sent: boolean }> => apiClient.post(`/invoices/${id}/resend`);
