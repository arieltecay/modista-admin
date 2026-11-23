import { useCallback, useEffect, useState } from 'react';
import { listCoupons } from '@/services/coupons/couponService';
import type { CouponsLoadState, CouponsQuery } from './types';

/** Loads one page of coupons for the query; `reload` fetches it again (after an action or an error). */
export const useCoupons = ({ page, limit, status, courseId }: CouponsQuery): { state: CouponsLoadState; reload: () => void } => {
  const [state, setState] = useState<CouponsLoadState>({ status: 'loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Keep the rows on screen while a refresh runs; only a first load or a retry shows the loading state.
    setState((previous) => (previous.status === 'ready' ? previous : { status: 'loading' }));

    listCoupons({ page, limit, status, courseId })
      .then((result) => {
        if (!cancelled) setState({ status: 'ready', items: result.items, total: result.total });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : 'Error al cargar los cupones.' });
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, status, courseId, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { state, reload };
};
