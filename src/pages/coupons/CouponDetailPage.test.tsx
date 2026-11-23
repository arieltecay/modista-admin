import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ getCoupon: vi.fn(), updateCoupon: vi.fn() }));
vi.mock('@/services/coupons/couponService', () => service);
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import CouponDetailPage from './CouponDetailPage';

const detail = (overrides: Record<string, unknown> = {}) => ({
  id: 'k1',
  code: 'MODISTA20',
  type: 'percent',
  value: 20,
  startsAt: '2026-11-01T12:00:00.000Z',
  endsAt: '2026-11-30T23:59:59.000Z',
  usedCount: 3,
  active: true,
  status: 'active',
  maxUses: 50,
  courseId: 'c1',
  courseTitle: 'Curso Online de Modista',
  stats: {
    started: 4,
    uses: 3,
    discountTotal: 12540,
    netRevenue: 50160,
    daily: [
      { day: '2026-11-10', uses: 2 },
      { day: '2026-11-12', uses: 1 },
    ],
    recent: [
      { name: 'Beatriz M', status: 'paid', date: '2026-11-12T15:00:00.000Z', price: 16720 },
      { name: 'Ana P', status: 'pending', date: '2026-11-13T15:00:00.000Z', price: 16720 },
    ],
  },
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/admin/coupons/k1']}>
      <Routes>
        <Route path="/admin/coupons/:id" element={<CouponDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CouponDetailPage', () => {
  beforeEach(() => {
    service.getCoupon.mockReset().mockResolvedValue(detail());
    service.updateCoupon.mockReset().mockResolvedValue({});
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it('shows the coupon, its rules and its totals', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'MODISTA20' })).toBeInTheDocument();
    expect(screen.getByText('Curso Online de Modista')).toBeInTheDocument();
    const totals = screen.getByRole('region', { name: /estadísticas/i });
    expect(within(totals).getByText('4')).toBeInTheDocument(); // started
    expect(within(totals).getByText('3 / 50')).toBeInTheDocument(); // uses over the cap
    expect(within(totals).getByText(/12\.540,00/)).toBeInTheDocument();
    expect(within(totals).getByText(/50\.160,00/)).toBeInTheDocument();
    expect(within(totals).getByText('75 %')).toBeInTheDocument(); // 3 paid of 4 started
  });

  it('lists the uses of each day in order', async () => {
    renderPage();

    const days = await screen.findAllByTestId('usage-day');
    expect(days).toHaveLength(2);
    expect(days[0].textContent).toContain('10/11/2026');
    expect(days[1].textContent).toContain('12/11/2026');
    expect(within(days[0]).getByText('2')).toBeInTheDocument();
  });

  it('lists the latest inscriptions with their state and never an email', async () => {
    renderPage();

    const recent = await screen.findByRole('region', { name: /últimas inscripciones/i });
    expect(within(recent).getByText('Beatriz M')).toBeInTheDocument();
    expect(within(recent).getByText('Pagada')).toBeInTheDocument();
    expect(within(recent).getByText('Pendiente de pago')).toBeInTheDocument();
    expect(recent.textContent).not.toMatch(/@/);
  });

  it('explains a coupon without uses yet and shows no conversion rate', async () => {
    service.getCoupon.mockResolvedValue(detail({ stats: { started: 0, uses: 0, discountTotal: 0, netRevenue: 0, daily: [], recent: [] } }));
    renderPage();

    expect(await screen.findByText('Todavía no se usó este cupón.')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: /estadísticas/i })).getByText('—')).toBeInTheDocument();
  });

  it('pauses the coupon and reloads', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /pausar cupón/i }));

    await waitFor(() => expect(service.updateCoupon).toHaveBeenCalledWith('k1', { active: false }));
    await waitFor(() => expect(service.getCoupon).toHaveBeenCalledTimes(2));
  });

  it('shows the error with a retry when the coupon cannot be loaded', async () => {
    service.getCoupon.mockRejectedValueOnce(new Error('No encontrado'));
    renderPage();

    expect(await screen.findByText('No encontrado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByRole('heading', { name: 'MODISTA20' })).toBeInTheDocument();
  });
});
