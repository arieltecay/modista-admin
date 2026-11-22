import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const service = vi.hoisted(() => ({ listInvoices: vi.fn(), retryInvoice: vi.fn(), resendInvoice: vi.fn() }));
vi.mock('@/services/invoices/invoiceService', () => service);
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

import InvoicesListPage from './InvoicesListPage';

const invoice = (overrides: Record<string, unknown> = {}) => ({
  id: 'inv1',
  status: 'authorized',
  environment: 'production',
  pointOfSale: 3,
  number: 12,
  total: 20900,
  cae: '86471092959722',
  courseTitle: 'Curso Online de Modista',
  receiver: { name: 'BEATRIZ MENDOZA', email: 'beatriz@example.com' },
  issuedAt: '2026-11-21T18:00:00.000Z',
  createdAt: '2026-11-21T18:00:00.000Z',
  emailSentAt: '2026-11-21T18:01:00.000Z',
  attempts: 1,
  publicUrl: 'https://modista-app.com/factura/' + 'a'.repeat(64),
  ...overrides,
});

const page = (items: unknown[], total = items.length) => ({ items, page: 1, limit: 10, total });

/** The table row of a receiver, given the receiver's name or the element that holds it. */
const row = (nameOrCell: string | HTMLElement) =>
  (typeof nameOrCell === 'string' ? screen.getByText(nameOrCell) : nameOrCell).closest('tr') as HTMLElement;

describe('InvoicesListPage', () => {
  beforeEach(() => {
    service.listInvoices.mockReset().mockResolvedValue(page([invoice()]));
    service.retryInvoice.mockReset().mockResolvedValue({ status: 'authorized', issued: true });
    service.resendInvoice.mockReset().mockResolvedValue({ sent: true });
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it('lists each invoice with its number, receiver, course, total and status', async () => {
    render(<InvoicesListPage />);

    const authorized = row(await screen.findByText('BEATRIZ MENDOZA'));
    expect(within(authorized).getByText('00003-00000012')).toBeInTheDocument();
    expect(within(authorized).getByText('beatriz@example.com')).toBeInTheDocument();
    expect(within(authorized).getByText('Curso Online de Modista')).toBeInTheDocument();
    expect(within(authorized).getByText(/20\.900,00/)).toBeInTheDocument();
    expect(within(authorized).getByText('Autorizada')).toBeInTheDocument();
    expect(within(authorized).getByText('Enviado')).toBeInTheDocument();
  });

  it('opens the public invoice page in a new tab, safely', async () => {
    render(<InvoicesListPage />);

    const link = within(row(await screen.findByText('BEATRIZ MENDOZA'))).getByRole('link', { name: /ver \/ imprimir/i });

    expect(link).toHaveAttribute('href', 'https://modista-app.com/factura/' + 'a'.repeat(64));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
    expect(link.getAttribute('rel')).toMatch(/noreferrer/);
  });

  it('marks test invoices so nobody mistakes them for real ones', async () => {
    service.listInvoices.mockResolvedValue(page([invoice({ environment: 'homologation' })]));
    render(<InvoicesListPage />);

    expect(within(row(await screen.findByText('BEATRIZ MENDOZA'))).getByText('Prueba')).toBeInTheDocument();
  });

  it('resends the email of an authorized invoice and confirms it', async () => {
    render(<InvoicesListPage />);

    await userEvent.click(within(row(await screen.findByText('BEATRIZ MENDOZA'))).getByRole('button', { name: /reenviar mail/i }));

    await waitFor(() => expect(service.resendInvoice).toHaveBeenCalledWith('inv1'));
    expect(toastMock.success).toHaveBeenCalled();
  });

  it('shows pending and failed invoices with their error and a retry, never a view link', async () => {
    service.listInvoices.mockResolvedValue(
      page([
        invoice({ id: 'p1', status: 'pending', number: undefined, cae: undefined, publicUrl: undefined, emailSentAt: undefined, receiver: { name: 'ANA PEREZ', email: 'ana@example.com' }, lastError: 'ARCA no respondió' }),
        invoice({ id: 'f1', status: 'failed', publicUrl: undefined, emailSentAt: undefined, receiver: { name: 'LUCIA GOMEZ', email: 'lucia@example.com' }, lastError: '10015: algo' }),
      ]),
    );
    render(<InvoicesListPage />);

    const pending = row(await screen.findByText('ANA PEREZ'));
    expect(within(pending).getByText('Pendiente')).toBeInTheDocument();
    expect(within(pending).getByText('ARCA no respondió')).toBeInTheDocument();
    // No number yet and no email to show.
    expect(within(pending).getAllByText('—')).toHaveLength(2);
    expect(within(pending).queryByRole('link')).not.toBeInTheDocument();
    expect(within(pending).queryByRole('button', { name: /reenviar mail/i })).not.toBeInTheDocument();
    expect(within(row('LUCIA GOMEZ')).getByText('Con error')).toBeInTheDocument();
    expect(within(row('LUCIA GOMEZ')).getByText('10015: algo')).toBeInTheDocument();
  });

  it('retries an invoice, reports the outcome and reloads the list', async () => {
    service.listInvoices.mockResolvedValue(
      page([invoice({ id: 'f1', status: 'failed', publicUrl: undefined, emailSentAt: undefined, lastError: 'x' })]),
    );
    render(<InvoicesListPage />);
    await screen.findByText('BEATRIZ MENDOZA');
    const callsBefore = service.listInvoices.mock.calls.length;

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => expect(service.retryInvoice).toHaveBeenCalledWith('f1'));
    await waitFor(() => expect(service.listInvoices.mock.calls.length).toBeGreaterThan(callsBefore));
    expect(toastMock.success).toHaveBeenCalled();
  });

  it.each([
    ['failed', true, 'error', /rechaz/i],
    ['pending', true, 'error', /sigue pendiente/i],
    ['authorized', false, 'success', /ya estaba autorizada/i],
  ] as const)('tells apart what a retry that ended %s (issued: %s) really did', async (status, issued, tone, message) => {
    service.listInvoices.mockResolvedValue(
      page([invoice({ id: 'f1', status: 'failed', publicUrl: undefined, emailSentAt: undefined, lastError: 'x' })]),
    );
    service.retryInvoice.mockResolvedValue({ status, issued });
    render(<InvoicesListPage />);

    await userEvent.click(await screen.findByRole('button', { name: /reintentar/i }));

    await waitFor(() => expect(toastMock[tone]).toHaveBeenCalledWith(expect.stringMatching(message)));
    expect(toastMock[tone === 'error' ? 'success' : 'error']).not.toHaveBeenCalled();
  });

  it('shows a failed action as an error toast and keeps the list', async () => {
    service.resendInvoice.mockRejectedValue(new Error('No se pudo enviar el mail'));
    render(<InvoicesListPage />);

    await userEvent.click(within(row(await screen.findByText('BEATRIZ MENDOZA'))).getByRole('button', { name: /reenviar mail/i }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith('No se pudo enviar el mail'));
    expect(screen.getByText('BEATRIZ MENDOZA')).toBeInTheDocument();
  });

  it('filters by status from the first page', async () => {
    render(<InvoicesListPage />);
    await screen.findByText('BEATRIZ MENDOZA');

    await userEvent.selectOptions(screen.getByLabelText(/estado/i), 'failed');

    await waitFor(() => expect(service.listInvoices).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed', page: 1 })));
  });

  it('searches by name or email once the typing pauses', async () => {
    render(<InvoicesListPage />);
    await screen.findByText('BEATRIZ MENDOZA');

    await userEvent.type(screen.getByLabelText(/buscar/i), 'ana');

    await waitFor(() => expect(service.listInvoices).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'ana', page: 1 })));
  });

  it('renders server text as text, never as HTML', async () => {
    service.listInvoices.mockResolvedValue(
      page([invoice({ status: 'failed', publicUrl: undefined, lastError: '<img src=x onerror=alert(1)>', receiver: { name: '<b>MALA</b>', email: 'm@example.com' } })]),
    );
    const { container } = render(<InvoicesListPage />);

    expect(await screen.findByText('<b>MALA</b>')).toBeInTheDocument();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('says so when there are no invoices, and offers a retry when loading fails', async () => {
    service.listInvoices.mockResolvedValueOnce(page([]));
    const { unmount } = render(<InvoicesListPage />);
    expect(await screen.findByText(/todavía no hay facturas/i)).toBeInTheDocument();
    unmount();

    service.listInvoices.mockRejectedValueOnce(new Error('Error de red'));
    render(<InvoicesListPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Error de red');
    await userEvent.click(screen.getByRole('button', { name: /reintentar carga/i }));
    expect(await screen.findByText('BEATRIZ MENDOZA')).toBeInTheDocument();
  });
});
