export type CouponType = 'percent' | 'fixed';

export type CouponStatus = 'active' | 'paused' | 'scheduled' | 'expired' | 'exhausted';

export interface CouponItem {
  id: string;
  code: string;
  type: CouponType;
  /** Porcentaje (1-99) o pesos enteros, según `type`. */
  value: number;
  /** Instantes ISO. */
  startsAt: string;
  endsAt: string;
  /** Usos confirmados por un pago aprobado. */
  usedCount: number;
  active: boolean;
  status: CouponStatus;
  /** Null = sin tope de usos. */
  maxUses: number | null;
  /** Uuid del curso; null = todos los cursos. */
  courseId: string | null;
  createdAt?: string;
  courseTitle?: string;
  createdBy?: string;
  /** Solo en el listado. */
  discountTotal?: number;
  netRevenue?: number;
}

export interface CouponStats {
  /** Inscripciones creadas con el cupón, pagas o no. */
  started: number;
  /** Inscripciones pagas. */
  uses: number;
  discountTotal: number;
  netRevenue: number;
  /** Usos pagos por día local `YYYY-MM-DD`, de menor a mayor. */
  daily: Array<{ day: string; uses: number }>;
  /** Últimas inscripciones con el cupón; nombre abreviado, nunca el mail. */
  recent: Array<{ name: string; status: 'pending' | 'paid' | 'partial'; date: string; price: number }>;
}

export interface CouponDetail extends CouponItem {
  stats: CouponStats;
}

export interface CouponsPage {
  items: CouponItem[];
  page: number;
  limit: number;
  total: number;
}

export interface CouponSummary {
  activeCoupons: number;
  uses: number;
  discountTotal: number;
  netRevenue: number;
}

export interface ListCouponsParams {
  page: number;
  limit: number;
  status?: CouponStatus;
  courseId?: string;
}

export interface CreateCouponData {
  code: string;
  type: CouponType;
  value: number;
  startsAt: string;
  endsAt: string;
  courseId: string | null;
  maxUses: number | null;
}

export interface UpdateCouponData {
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
  maxUses?: number | null;
}
