import { useCallback, useEffect, useState } from 'react';
import { listInvoices } from '@/services/invoices/invoiceService';
import type { InvoicesLoadState, InvoicesQuery } from './types';

/** Loads one page of invoices for the query; `reload` fetches it again (after an action or an error). */
export const useInvoices = ({ page, limit, status, q }: InvoicesQuery): { state: InvoicesLoadState; reload: () => void } => {
  const [state, setState] = useState<InvoicesLoadState>({ status: 'loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Keep the rows on screen while a refresh runs; only a first load or a retry shows the loading state.
    setState((previous) => (previous.status === 'ready' ? previous : { status: 'loading' }));

    listInvoices({ page, limit, status, q })
      .then((result) => {
        if (!cancelled) setState({ status: 'ready', items: result.items, total: result.total });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : 'Error al cargar las facturas.' });
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, status, q, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { state, reload };
};
