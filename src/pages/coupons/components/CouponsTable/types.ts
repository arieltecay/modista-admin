export interface CouponRow {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  startsAt: string;
  endsAt: string;
  usedCount: number;
  active: boolean;
  status: 'active' | 'paused' | 'scheduled' | 'expired' | 'exhausted';
  maxUses: number | null;
  courseTitle?: string;
  netRevenue?: number;
}

export interface CouponsTableProps {
  rows: CouponRow[];
  /** Id del cupón con una acción en curso: su botón se deshabilita. */
  busyId: string | null;
  /** `active` es el estado al que se quiere llevar el cupón. */
  onToggle: (id: string, active: boolean) => void;
}
