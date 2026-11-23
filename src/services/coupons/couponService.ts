import { apiClient } from '../config/apiClient';
import type {
  CouponDetail,
  CouponItem,
  CouponsPage,
  CouponSummary,
  CreateCouponData,
  ListCouponsParams,
  UpdateCouponData,
} from './types';

/** GET /api/coupons — historial paginado; solo viajan los filtros que tienen valor. */
export const listCoupons = ({ status, courseId, ...paging }: ListCouponsParams): Promise<CouponsPage> =>
  apiClient.get('/coupons', { params: { ...paging, ...(status ? { status } : {}), ...(courseId ? { courseId } : {}) } });

/** GET /api/coupons/summary — totales de todos los cupones. */
export const getCouponSummary = (): Promise<CouponSummary> => apiClient.get('/coupons/summary');

/** GET /api/coupons/:id — un cupón con sus estadísticas. */
export const getCoupon = (id: string): Promise<CouponDetail> => apiClient.get(`/coupons/${id}`);

/** POST /api/coupons */
export const createCoupon = (data: CreateCouponData): Promise<CouponItem> => apiClient.post('/coupons', data);

/** PATCH /api/coupons/:id — pausar/reanudar, mover fechas o tope; el código, tipo y valor no se editan. */
export const updateCoupon = (id: string, data: UpdateCouponData): Promise<CouponItem> => apiClient.patch(`/coupons/${id}`, data);
