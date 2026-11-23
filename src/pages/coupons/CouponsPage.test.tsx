import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ listCoupons: vi.fn(), getCouponSummary: vi.fn(), createCoupon: vi.fn(), updateCoupon: vi.fn() }));
vi.mock('@/services/coupons/couponService', () => service);
const coursesService = vi.hoisted(() => ({ getCourses: vi.fn() }));
vi.mock('@/services/courses/coursesService', () => coursesService);
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));
// Headless UI animations never settle in jsdom: the modal is replaced by a plain container.
vi.mock('@/components/shared/GlobalModal', () => ({
  default: ({ isOpen, title, children }: { isOpen: boolean; title: string; children: React.ReactNode }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
}));

import CouponsPage from './CouponsPage';

const coupon = (overrides: Record<string, unknown> = {}) => ({
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
  discountTotal: 12540,
  netRevenue: 50160,
  ...overrides,
});
const page = (items: unknown[], total = items.length) => ({ items, page: 1, limit: 10, total });

const renderPage = () =>
  render(
    <MemoryRouter>
      <CouponsPage />
    </MemoryRouter>
  );
/** The table row of a coupon, given its code or the element that holds it. */
const row = (codeOrCell: string | HTMLElement) =>
  (typeof codeOrCell === 'string' ? screen.getByText(codeOrCell) : codeOrCell).closest('tr') as HTMLElement;

describe('CouponsPage', () => {
  beforeEach(() => {
    service.listCoupons.mockReset().mockResolvedValue(page([coupon()]));
    service.getCouponSummary.mockReset().mockResolvedValue({ activeCoupons: 2, uses: 7, discountTotal: 30000, netRevenue: 120000 });
    service.createCoupon.mockReset().mockResolvedValue(coupon());
    service.updateCoupon.mockReset().mockResolvedValue(coupon());
    coursesService.getCourses.mockReset().mockResolvedValue([{ id: 'c1', title: 'Curso Online de Modista', price: 20900 }]);
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it('lists each coupon with its discount, course, validity, uses and status', async () => {
    renderPage();

    const shown = row(await screen.findByText('MODISTA20'));
    expect(within(shown).getByText('20 %')).toBeInTheDocument();
    expect(within(shown).getByText('Curso Online de Modista')).toBeInTheDocument();
    expect(within(shown).getByText(/01\/11\/2026/)).toBeInTheDocument();
    expect(within(shown).getByText('3 / 50')).toBeInTheDocument();
    expect(within(shown).getByText('Activo')).toBeInTheDocument();
    expect(within(shown).getByRole('link', { name: /ver detalle/i })).toHaveAttribute('href', '/admin/coupons/k1');
  });

  it('says "todos los cursos" for a coupon without course', async () => {
    service.listCoupons.mockResolvedValue(page([coupon({ courseId: null, courseTitle: undefined })]));
    renderPage();

    expect(within(row(await screen.findByText('MODISTA20'))).getByText('Todos los cursos')).toBeInTheDocument();
  });

  it('shows the totals of all coupons', async () => {
    renderPage();

    const kpis = await screen.findByRole('region', { name: /resumen/i });
    await waitFor(() => expect(within(kpis).getByText('7')).toBeInTheDocument());
    expect(within(kpis).getByText('Cupones activos')).toBeInTheDocument();
    expect(within(kpis).getByText('2')).toBeInTheDocument();
    expect(within(kpis).getByText(/30\.000,00/)).toBeInTheDocument();
    expect(within(kpis).getByText(/120\.000,00/)).toBeInTheDocument();
  });

  it('asks the API for the chosen status and goes back to the first page', async () => {
    renderPage();
    await screen.findByText('MODISTA20');

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'paused');

    await waitFor(() => expect(service.listCoupons).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, status: 'paused' })));
  });

  it('tells apart "no coupons yet" from "no coupons with those filters"', async () => {
    service.listCoupons.mockResolvedValue(page([]));
    renderPage();
    expect(await screen.findByText('Todavía no creaste cupones.')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'expired');

    expect(await screen.findByText('No hay cupones con esos filtros.')).toBeInTheDocument();
  });

  it('shows the error and reloads on retry', async () => {
    service.listCoupons.mockRejectedValueOnce(new Error('Sin conexión'));
    renderPage();

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('MODISTA20')).toBeInTheDocument();
  });

  it('pauses an active coupon and resumes a paused one', async () => {
    service.listCoupons.mockResolvedValue(page([coupon(), coupon({ id: 'k2', code: 'VIEJO10', active: false, status: 'paused' })]));
    renderPage();

    await userEvent.click(within(row(await screen.findByText('MODISTA20'))).getByRole('button', { name: /pausar/i }));
    await waitFor(() => expect(service.updateCoupon).toHaveBeenCalledWith('k1', { active: false }));
    await userEvent.click(within(row('VIEJO10')).getByRole('button', { name: /reanudar/i }));
    await waitFor(() => expect(service.updateCoupon).toHaveBeenCalledWith('k2', { active: true }));
    expect(toastMock.success).toHaveBeenCalledTimes(2);
  });

  it('reports when pausing fails and keeps the list', async () => {
    service.updateCoupon.mockRejectedValue(new Error('No se pudo guardar'));
    renderPage();

    await userEvent.click(within(row(await screen.findByText('MODISTA20'))).getByRole('button', { name: /pausar/i }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('No se pudo guardar'));
    expect(screen.getByText('MODISTA20')).toBeInTheDocument();
  });

  describe('new coupon', () => {
    const open = async () => {
      renderPage();
      await screen.findByText('MODISTA20');
      await userEvent.click(screen.getByRole('button', { name: /nuevo cupón/i }));
      return screen.getByRole('dialog', { name: /nuevo cupón/i });
    };

    const fill = async (dialog: HTMLElement) => {
      await userEvent.type(within(dialog).getByLabelText('Código'), 'verano15');
      await userEvent.type(within(dialog).getByLabelText('Valor'), '15');
      await userEvent.selectOptions(within(dialog).getByLabelText('Curso'), 'c1');
      fireEvent.change(within(dialog).getByLabelText('Desde'), { target: { value: '2026-12-01' } });
      fireEvent.change(within(dialog).getByLabelText('Hasta'), { target: { value: '2026-12-31' } });
    };

    it('creates the coupon, closes the form and reloads the history', async () => {
      const dialog = await open();
      await fill(dialog);

      await userEvent.click(within(dialog).getByRole('button', { name: /crear cupón/i }));

      await waitFor(() => expect(service.createCoupon).toHaveBeenCalledTimes(1));
      expect(service.createCoupon).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'VERANO15', type: 'percent', value: 15, courseId: 'c1', maxUses: null })
      );
      expect(toastMock.success).toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(service.listCoupons).toHaveBeenCalledTimes(2);
    });

    it('does not send an incomplete form and says what is wrong', async () => {
      const dialog = await open();

      await userEvent.click(within(dialog).getByRole('button', { name: /crear cupón/i }));

      expect(service.createCoupon).not.toHaveBeenCalled();
      expect(within(dialog).getAllByRole('alert').length).toBeGreaterThanOrEqual(3);
    });

    it('keeps the form open and shows the server message when the code already exists', async () => {
      service.createCoupon.mockRejectedValue(new Error('Ya existe un cupón con ese código'));
      const dialog = await open();
      await fill(dialog);

      await userEvent.click(within(dialog).getByRole('button', { name: /crear cupón/i }));

      expect(await within(dialog).findByText('Ya existe un cupón con ese código')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(within(dialog).getByLabelText('Código')).toHaveValue('verano15');
    });

    it('does not send twice while the first request is running', async () => {
      let resolve: (value: unknown) => void = () => undefined;
      service.createCoupon.mockReturnValue(new Promise((done) => (resolve = done)));
      const dialog = await open();
      await fill(dialog);

      const submit = within(dialog).getByRole('button', { name: /crear cupón|creando/i });
      await userEvent.click(submit);
      await userEvent.click(submit);

      expect(service.createCoupon).toHaveBeenCalledTimes(1);
      resolve(coupon());
    });

    it('fills a ready-to-use code with the generate button', async () => {
      const dialog = await open();

      await userEvent.click(within(dialog).getByRole('button', { name: /generar/i }));

      expect((within(dialog).getByLabelText('Código') as HTMLInputElement).value).toMatch(/^MODISTA[A-Z0-9]{4}$/);
    });
  });
});
