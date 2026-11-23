import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateCoupon } from '@/services/coupons/couponService';

/** Pause or resume a coupon; `busyId` is the coupon with a request running, `onDone` reloads what the page shows. */
export const useToggleCoupon = (onDone: () => void): { busyId: string | null; toggle: (id: string, active: boolean) => Promise<void> } => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (id: string, active: boolean) => {
    setBusyId(id);
    try {
      await updateCoupon(id, { active });
      toast.success(active ? 'Cupón reanudado' : 'Cupón pausado');
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el cupón');
    } finally {
      setBusyId(null);
    }
  };

  return { busyId, toggle };
};
