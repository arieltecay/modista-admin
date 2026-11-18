import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POLL_INTERVAL_MS, useLiveAcquisition } from './useLiveAcquisition';

const getLive = vi.fn();
vi.mock('../services', () => ({ getLive: (...args: unknown[]) => getLive(...args) }));

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useLiveAcquisition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getLive.mockReset().mockResolvedValue({ windowMinutes: 15, data: {} });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });
  afterEach(() => vi.useRealTimers());

  it('loads once and then polls every 15 seconds while the tab is visible', async () => {
    renderHook(() => useLiveAcquisition(15));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getLive).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS); });
    expect(getLive).toHaveBeenCalledTimes(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2); });
    expect(getLive).toHaveBeenCalledTimes(4);
  });

  it('pauses while the tab is hidden and refreshes right away when it comes back', async () => {
    renderHook(() => useLiveAcquisition(15));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    act(() => setVisibility('hidden'));
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 10); });
    expect(getLive).toHaveBeenCalledTimes(1);

    act(() => setVisibility('visible'));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getLive).toHaveBeenCalledTimes(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS); });
    expect(getLive).toHaveBeenCalledTimes(3);
  });

  it('stops polling on unmount', async () => {
    const { unmount } = renderHook(() => useLiveAcquisition(15));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 5); });
    expect(getLive).toHaveBeenCalledTimes(1);
  });

  it('asks the server for the selected window', async () => {
    renderHook(() => useLiveAcquisition(60));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(getLive.mock.calls[0][0]).toEqual({ windowMinutes: 60 });
  });
});
