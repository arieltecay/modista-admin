import { useState } from 'react';
import toast from 'react-hot-toast';
import { createCoupon } from '@/services/coupons/couponService';
import type { CreateCouponPayload } from './types';

/** Creates a coupon; a failure (e.g. a repeated code) stays in `error` so the form can show it and stay open. */
export const useCreateCoupon = (onCreated: () => void) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const create = async (payload: CreateCouponPayload) => {
    setSubmitting(true);
    setError(undefined);
    try {
      await createCoupon(payload);
      toast.success('Cupón creado');
      onCreated();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo crear el cupón');
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, create, clearError: () => setError(undefined) };
};
