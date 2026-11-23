import { useCallback, useEffect, useState } from 'react';
import { getCoupon } from '@/services/coupons/couponService';
import type { CouponDetailState } from './types';

export const useCouponDetail = (id: string | undefined): { state: CouponDetailState; reload: () => void } => {
  const [state, setState] = useState<CouponDetailState>({ status: 'loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!id) {
      setState({ status: 'error', message: 'Cupón no encontrado' });
      return;
    }
    let cancelled = false;
    // Keep the data on screen while a refresh runs (after pausing); only a first load or a retry shows loading.
    setState((previous) => (previous.status === 'ready' ? previous : { status: 'loading' }));

    getCoupon(id)
      .then((coupon) => {
        if (!cancelled) setState({ status: 'ready', coupon });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: error instanceof Error ? error.message : 'Error al cargar el cupón.' });
      });

    return () => {
      cancelled = true;
    };
  }, [id, version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { state, reload };
};
