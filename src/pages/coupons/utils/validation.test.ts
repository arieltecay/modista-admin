import { describe, expect, it } from 'vitest';
import { toCreateData, validateCouponForm } from './validation';
import type { CouponFormValues } from '../types';

const values = (overrides: Partial<CouponFormValues> = {}): CouponFormValues => ({
  code: 'modista20',
  type: 'percent',
  value: '20',
  courseId: 'c1',
  startsAt: '2026-11-23',
  endsAt: '2026-11-30',
  maxUses: '',
  ...overrides,
});
const courses = [{ id: 'c1', title: 'Curso Online', price: 20900 }];

describe('validateCouponForm', () => {
  it('accepts a complete coupon', () => {
    expect(validateCouponForm(values(), courses)).toEqual({});
  });

  it('asks for the code and rejects characters the API does not accept', () => {
    expect(validateCouponForm(values({ code: '' }), courses).code).toBeDefined();
    expect(validateCouponForm(values({ code: 'ab' }), courses).code).toBeDefined();
    expect(validateCouponForm(values({ code: 'con espacio' }), courses).code).toBeDefined();
    expect(validateCouponForm(values({ code: 'x'.repeat(33) }), courses).code).toBeDefined();
    expect(validateCouponForm(values({ code: ' ok-20_x ' }), courses).code).toBeUndefined();
  });

  it('requires a whole positive value, and a percent of 99 at most', () => {
    for (const value of ['', '0', '-3', '10.5', 'abc']) {
      expect(validateCouponForm(values({ value }), courses).value, value).toBeDefined();
    }
    expect(validateCouponForm(values({ value: '100' }), courses).value).toMatch(/99/);
    expect(validateCouponForm(values({ value: '99' }), courses).value).toBeUndefined();
  });

  it('refuses a fixed discount that leaves the chosen course free', () => {
    const fixed = (value: string) => validateCouponForm(values({ type: 'fixed', value }), courses).value;

    expect(fixed('20900')).toBeDefined();
    expect(fixed('30000')).toBeDefined();
    expect(fixed('500')).toBeUndefined();
  });

  it('cannot check a fixed discount against a price when it applies to every course', () => {
    expect(validateCouponForm(values({ type: 'fixed', value: '99999', courseId: '' }), courses).value).toBeUndefined();
  });

  it('requires both dates and an end that is not before the start', () => {
    expect(validateCouponForm(values({ startsAt: '' }), courses).startsAt).toBeDefined();
    expect(validateCouponForm(values({ endsAt: '' }), courses).endsAt).toBeDefined();
    expect(validateCouponForm(values({ startsAt: '2026-12-01', endsAt: '2026-11-01' }), courses).endsAt).toBeDefined();
    expect(validateCouponForm(values({ startsAt: '2026-11-01', endsAt: '2026-11-01' }), courses).endsAt).toBeUndefined();
  });

  it('allows an empty cap but not a zero, negative or fractional one', () => {
    expect(validateCouponForm(values({ maxUses: '' }), courses).maxUses).toBeUndefined();
    for (const maxUses of ['0', '-1', '2.5', 'x']) {
      expect(validateCouponForm(values({ maxUses }), courses).maxUses, maxUses).toBeDefined();
    }
    expect(validateCouponForm(values({ maxUses: '50' }), courses).maxUses).toBeUndefined();
  });

  it('caps the number of uses at 10000, like the API', () => {
    expect(validateCouponForm(values({ maxUses: '10000' }), courses).maxUses).toBeUndefined();
    expect(validateCouponForm(values({ maxUses: '10001' }), courses).maxUses).toMatch(/10\.?000/);
  });
});

describe('toCreateData', () => {
  it('builds the API body: uppercase code, numbers, null for "all courses" and for no cap, whole-day window', () => {
    const data = toCreateData(values({ code: ' modista20 ', courseId: '', maxUses: '50' }));

    expect(data).toMatchObject({ code: 'MODISTA20', type: 'percent', value: 20, courseId: null, maxUses: 50 });
    expect(new Date(data.startsAt).getHours()).toBe(0);
    expect(new Date(data.endsAt).getHours()).toBe(23);
  });

  it('sends null when the cap is empty', () => {
    expect(toCreateData(values({ maxUses: '' })).maxUses).toBeNull();
  });
});
