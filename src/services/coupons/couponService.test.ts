import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('../config/apiClient', () => ({ apiClient: api }));

import { createCoupon, getCoupon, getCouponSummary, listCoupons, updateCoupon } from './couponService';

describe('couponService', () => {
  beforeEach(() => {
    api.get.mockReset().mockResolvedValue({});
    api.post.mockReset().mockResolvedValue({});
    api.patch.mockReset().mockResolvedValue({});
  });

  it('lists with only the filters that are set', async () => {
    await listCoupons({ page: 2, limit: 10, status: 'active', courseId: 'c1' });

    expect(api.get).toHaveBeenCalledWith('/coupons', { params: { page: 2, limit: 10, status: 'active', courseId: 'c1' } });
  });

  it('leaves out empty filters instead of sending blanks the API would reject', async () => {
    await listCoupons({ page: 1, limit: 10, status: undefined, courseId: '' });

    expect(api.get).toHaveBeenCalledWith('/coupons', { params: { page: 1, limit: 10 } });
  });

  it('reads the summary and one coupon by id', async () => {
    await getCouponSummary();
    await getCoupon('abc');

    expect(api.get).toHaveBeenNthCalledWith(1, '/coupons/summary');
    expect(api.get).toHaveBeenNthCalledWith(2, '/coupons/abc');
  });

  it('creates a coupon with the body as the form built it', async () => {
    const data = { code: 'MODISTA20', type: 'percent' as const, value: 20, startsAt: 'a', endsAt: 'b', courseId: null, maxUses: null };

    await createCoupon(data);

    expect(api.post).toHaveBeenCalledWith('/coupons', data);
  });

  it('updates only the fields it is given', async () => {
    await updateCoupon('abc', { active: false });

    expect(api.patch).toHaveBeenCalledWith('/coupons/abc', { active: false });
  });
});
