import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
vi.mock('../../../services/config/apiClient', () => ({ apiClient: { get: (...args: unknown[]) => get(...args) } }));

import { getChannels, getFunnel, getJourney, getJourneys, getLive, getOverview, getQuality } from '.';

describe('acquisition services', () => {
  beforeEach(() => get.mockReset().mockResolvedValue({ ok: true }));

  it('call the admin acquisition endpoints with the given params and abort signal', async () => {
    const signal = new AbortController().signal;
    await getOverview({ from: '2026-11-01', to: '2026-11-02' }, signal);
    await getChannels({ from: '2026-11-01', to: '2026-11-02' });
    await getFunnel({ from: '2026-11-01', to: '2026-11-02' });
    await getQuality({ from: '2026-11-01', to: '2026-11-02' });
    await getJourneys({ from: '2026-11-01', to: '2026-11-02', page: 2, limit: 20 });
    await getLive({ windowMinutes: 60 });
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      '/admin/acquisition/overview', '/admin/acquisition/channels', '/admin/acquisition/funnel',
      '/admin/acquisition/quality', '/admin/acquisition/journeys', '/admin/acquisition/live',
    ]);
    expect(get.mock.calls[0][1]).toEqual({ params: { from: '2026-11-01', to: '2026-11-02' }, signal });
    expect(get.mock.calls[4][1].params).toEqual({ from: '2026-11-01', to: '2026-11-02', page: 2, limit: 20 });
    expect(get.mock.calls[5][1].params).toEqual({ windowMinutes: 60 });
  });

  it('never sends undefined or empty parameters', async () => {
    await getOverview({ from: '2026-11-01', to: '2026-11-02', campaign: undefined, landing: '' });
    expect(get.mock.calls[0][1].params).toEqual({ from: '2026-11-01', to: '2026-11-02' });
  });

  it('fetches one journey by its full id, encoded', async () => {
    await getJourney('12345678-aaaa-4bbb-8ccc-dddddddddddd');
    expect(get.mock.calls[0][0]).toBe('/admin/acquisition/journeys/12345678-aaaa-4bbb-8ccc-dddddddddddd');
    await getJourney('a/b');
    expect(get.mock.calls[1][0]).toBe('/admin/acquisition/journeys/a%2Fb');
  });
});
