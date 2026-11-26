import { apiClient } from '../config/apiClient';
import type { InvoicesPage, ListInvoicesParams, RetryInvoiceResult } from './types';

/** GET /api/invoices — listado paginado; solo viajan los filtros que tienen valor. */
export const listInvoices = ({ q, status, ...paging }: ListInvoicesParams): Promise<InvoicesPage> =>
  apiClient.get('/invoices', { params: { ...paging, ...(status ? { status } : {}), ...(q ? { q } : {}) } });

/** POST /api/invoices/:id/retry — reabre una factura rechazada o pendiente y la emite. */
export const retryInvoice = (id: string): Promise<RetryInvoiceResult> => apiClient.post(`/invoices/${id}/retry`);

/** POST /api/invoices/:id/resend — vuelve a mandar el mail con el link a la factura. */
export const resendInvoice = (id: string): Promise<{ sent: boolean }> => apiClient.post(`/invoices/${id}/resend`);

/** POST /api/invoices/:id/credit-note — anula la factura completa con una nota de crédito; no devuelve el dinero. */
export const issueCreditNote = (id: string, reason: string): Promise<RetryInvoiceResult> =>
  apiClient.post(`/invoices/${id}/credit-note`, { reason });

/** POST /api/invoices/:id/credit-note/retry — reabre una nota rechazada o pendiente y la emite. */
export const retryCreditNote = (id: string): Promise<RetryInvoiceResult> => apiClient.post(`/invoices/${id}/credit-note/retry`);

/** POST /api/invoices/:id/credit-note/resend — vuelve a mandar el mail con el link a la nota. */
export const resendCreditNote = (id: string): Promise<{ sent: boolean }> => apiClient.post(`/invoices/${id}/credit-note/resend`);
