import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../config/apiClient', () => ({ apiClient: api }));

import { listInvoices, resendInvoice, retryInvoice } from './invoiceService';

describe('invoiceService', () => {
  beforeEach(() => {
    api.get.mockReset().mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 });
    api.post.mockReset().mockResolvedValue({});
  });

  it('lists with only the filters that are set', async () => {
    await listInvoices({ page: 2, limit: 20, status: 'failed', q: 'ana' });

    expect(api.get).toHaveBeenCalledWith('/invoices', { params: { page: 2, limit: 20, status: 'failed', q: 'ana' } });
  });

  it('leaves out empty filters instead of sending blanks the API would reject', async () => {
    await listInvoices({ page: 1, limit: 10, status: undefined, q: '' });

    expect(api.get).toHaveBeenCalledWith('/invoices', { params: { page: 1, limit: 10 } });
  });

  it('returns the page as the API sent it', async () => {
    const page = { items: [{ id: 'i1' }], page: 1, limit: 20, total: 1 };
    api.get.mockResolvedValue(page);

    expect(await listInvoices({ page: 1, limit: 20 })).toBe(page);
  });

  it('retries and resends by invoice id', async () => {
    await retryInvoice('abc');
    await resendInvoice('abc');

    expect(api.post).toHaveBeenNthCalledWith(1, '/invoices/abc/retry');
    expect(api.post).toHaveBeenNthCalledWith(2, '/invoices/abc/resend');
  });
});
