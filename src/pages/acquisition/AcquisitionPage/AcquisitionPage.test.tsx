import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  VISIT_ID, channelsResponse, funnelResponse, journeyDetailResponse, journeysResponse, liveResponse, overviewResponse, qualityResponse, unknownRule,
} from '../testing/fixtures';

const services = vi.hoisted(() => ({
  getOverview: vi.fn(), getChannels: vi.fn(), getFunnel: vi.fn(), getQuality: vi.fn(), getLive: vi.fn(), getJourneys: vi.fn(), getJourney: vi.fn(),
}));
vi.mock('../services', () => services);

import AcquisitionPage from '.';

const renderPage = (query = '') =>
  render(
    <MemoryRouter initialEntries={[`/admin/acquisition${query}`]}>
      <AcquisitionPage />
    </MemoryRouter>,
  );

const section = (name: RegExp) => screen.getByRole('heading', { name }).closest('section') as HTMLElement;

describe('AcquisitionPage', () => {
  beforeEach(() => {
    services.getOverview.mockReset().mockResolvedValue(overviewResponse());
    services.getChannels.mockReset().mockResolvedValue(channelsResponse());
    services.getFunnel.mockReset().mockResolvedValue(funnelResponse());
    services.getQuality.mockReset().mockResolvedValue(qualityResponse([unknownRule]));
    services.getLive.mockReset().mockResolvedValue(liveResponse());
    services.getJourneys.mockReset().mockResolvedValue(journeysResponse());
    services.getJourney.mockReset().mockResolvedValue(journeyDetailResponse());
  });

  it('renders every section with its data', async () => {
    renderPage();
    await screen.findByRole('table', { name: /canales de adquisición/i });
    for (const heading of [/resumen/i, /canales/i, /embudo/i, /actividad reciente/i, /calidad de datos/i, /recorridos/i]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(await screen.findByText('Muchas visitas sin clasificar')).toBeInTheDocument();
    expect(await screen.findByText('12345678')).toBeInTheDocument();
    expect(screen.queryByText(/tráfico total/i)).not.toBeInTheDocument();
  });

  it('turns the URL filters into API params for every report, and the window only for cohorts', async () => {
    renderPage('?from=2026-11-01&to=2026-11-10&campaign=black&perspective=first_touch&outcomeWindowDays=7');
    await waitFor(() => expect(services.getChannels).toHaveBeenCalled());
    const expected = { from: '2026-11-01', to: '2026-11-10', campaign: 'black', perspective: 'first_touch', outcomeWindowDays: 7, reportingMode: 'acquisition_cohort' };
    for (const getter of [services.getOverview, services.getChannels, services.getFunnel]) {
      expect(getter.mock.calls[0][0]).toMatchObject(expected);
    }
    expect(services.getQuality.mock.calls[0][0]).toEqual({ from: '2026-11-01', to: '2026-11-10', timezone: 'America/Argentina/Tucuman' });
    expect(services.getJourneys.mock.calls[0][0]).toMatchObject({ from: '2026-11-01', to: '2026-11-10', campaign: 'black', page: 1, limit: 20 });
  });

  it('shows a failing report as an error while the others keep working', async () => {
    services.getFunnel.mockRejectedValue(new Error('down'));
    renderPage();
    await screen.findByRole('table', { name: /canales de adquisición/i });
    expect(await within(section(/embudo/i)).findByRole('alert')).toHaveTextContent(/no se pudo cargar/i);
    expect(within(section(/canales/i)).queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tells an empty period apart from a failure', async () => {
    services.getOverview.mockResolvedValue(overviewResponse({ visits: 0, visitors: 0, attributableVisits: 0, leads: 0, purchases: 0, revenue: 0, leadRate: null, purchaseRate: null, averageTicket: null }));
    services.getChannels.mockResolvedValue(channelsResponse({ channels: [] }));
    renderPage();
    expect(await within(section(/resumen/i)).findByText(/no hay visitas/i)).toBeInTheDocument();
    expect(await within(section(/canales/i)).findByText(/no hay canales/i)).toBeInTheDocument();
    expect(screen.queryByText(/no se pudo cargar/i)).not.toBeInTheDocument();
  });

  it('keeps the previous results out of view while new filters load, and refetches on a filter change', async () => {
    renderPage();
    await screen.findByRole('table', { name: /canales de adquisición/i });
    const campaign = screen.getByLabelText('Campaña');
    await userEvent.type(campaign, 'cyber');
    await userEvent.tab();
    await waitFor(() => expect(services.getChannels).toHaveBeenCalledTimes(2));
    expect(services.getChannels.mock.calls[1][0]).toMatchObject({ campaign: 'cyber' });
  });

  it('opens one journey with its full id and shows its timeline', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /ver recorrido 12345678/i }));
    await waitFor(() => expect(services.getJourney).toHaveBeenCalledWith(VISIT_ID, expect.anything()));
    expect(await screen.findByText('Lead registrado')).toBeInTheDocument();
  });

  it('asks the live report for the default window', async () => {
    renderPage();
    await waitFor(() => expect(services.getLive).toHaveBeenCalled());
    expect(services.getLive.mock.calls[0][0]).toEqual({ windowMinutes: 15 });
  });
});
