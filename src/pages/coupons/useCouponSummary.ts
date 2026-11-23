import { useCallback, useEffect, useState } from 'react';
import { getCouponSummary } from '@/services/coupons/couponService';
import type { CouponSummaryData } from './types';

/** Totals of every coupon; if they cannot be loaded the cards show a dash instead of blocking the page. */
export const useCouponSummary = (): { summary: CouponSummaryData | null; reload: () => void } => {
  const [summary, setSummary] = useState<CouponSummaryData | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCouponSummary()
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  return { summary, reload };
};
