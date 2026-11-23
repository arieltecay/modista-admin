export type CouponKind = 'percent' | 'fixed';

export type CouponStatusValue = 'active' | 'paused' | 'scheduled' | 'expired' | 'exhausted';

export type CouponStatusFilter = '' | CouponStatusValue;

/** Course the admin can pick for a coupon; the page maps it from its own data. */
export interface CourseOption {
  id: string;
  title: string;
  price: number;
}

/** What the admin types; every field stays text until it is validated. */
export interface CouponFormValues {
  code: string;
  type: CouponKind;
  value: string;
  /** Empty = every course. */
  courseId: string;
  /** Local day, `YYYY-MM-DD`. */
  startsAt: string;
  endsAt: string;
  /** Empty = no cap. */
  maxUses: string;
}

export type CouponFormErrors = Partial<Record<keyof CouponFormValues, string>>;

export interface CreateCouponPayload {
  code: string;
  type: CouponKind;
  value: number;
  startsAt: string;
  endsAt: string;
  courseId: string | null;
  maxUses: number | null;
}

export interface CouponsQuery {
  page: number;
  limit: number;
  status?: CouponStatusValue;
  courseId?: string;
}

export interface CouponListItem {
  id: string;
  code: string;
  type: CouponKind;
  value: number;
  startsAt: string;
  endsAt: string;
  usedCount: number;
  active: boolean;
  status: CouponStatusValue;
  maxUses: number | null;
  courseTitle?: string;
  discountTotal?: number;
  netRevenue?: number;
}

export type CouponsLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: CouponListItem[]; total: number };

export interface CouponSummaryData {
  activeCoupons: number;
  uses: number;
  discountTotal: number;
  netRevenue: number;
}

export interface CouponStatsData {
  started: number;
  uses: number;
  discountTotal: number;
  netRevenue: number;
  daily: Array<{ day: string; uses: number }>;
  recent: Array<{ name: string; status: 'pending' | 'paid' | 'partial'; date: string; price: number }>;
}

export interface CouponDetailData extends CouponListItem {
  stats: CouponStatsData;
}

export type CouponDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; coupon: CouponDetailData };
