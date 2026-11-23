import { statusLabel } from '../../utils/format';
import type { CouponStatusBadgeProps } from './types';

const STYLES: Record<CouponStatusBadgeProps['status'], string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-gray-200 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
  exhausted: 'bg-amber-100 text-amber-800',
};

export const CouponStatusBadge = ({ status }: CouponStatusBadgeProps) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>{statusLabel(status)}</span>
);

export default CouponStatusBadge;
