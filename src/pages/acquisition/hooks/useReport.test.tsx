import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useReport } from './useReport';

interface Deferred<T> { promise: Promise<T>; resolve: (value: T) => void; reject: (error: Error) => void }
const deferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

describe('useReport', () => {
  it('starts loading and then exposes the data', async () => {
    const { result } = renderHook(() => useReport(async () => 'ok', 'a'));
    expect(result.current).toMatchObject({ isLoading: true, data: null, hasError: false });
    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(result.current).toMatchObject({ isLoading: false, hasError: false });
  });

  it('tells a failure apart from an empty result', async () => {
    const { result } = renderHook(() => useReport(async () => { throw new Error('boom'); }, 'a'));
    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current).toMatchObject({ isLoading: false, data: null });
  });

  it('ignores a slow answer for old filters once newer filters were requested', async () => {
    const slow = deferred<string>();
    const fast = deferred<string>();
    const loads: Record<string, Deferred<string>> = { old: slow, current: fast };
    const { result, rerender } = renderHook(({ key }) => useReport(() => loads[key].promise, key), { initialProps: { key: 'old' } });
    rerender({ key: 'current' });
    await act(async () => { fast.resolve('current data'); });
    await waitFor(() => expect(result.current.data).toBe('current data'));
    await act(async () => { slow.resolve('old data'); });
    expect(result.current.data).toBe('current data');
  });

  it('keeps showing the data while it refreshes', async () => {
    const second = deferred<string>();
    const load = vi.fn().mockResolvedValueOnce('first').mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useReport(load, 'a'));
    await waitFor(() => expect(result.current.data).toBe('first'));
    act(() => result.current.refresh());
    expect(result.current).toMatchObject({ data: 'first', isRefreshing: true, isLoading: false });
    await act(async () => { second.resolve('second'); });
    await waitFor(() => expect(result.current.data).toBe('second'));
  });

  it('keeps the last good data, flagged as an error, when a refresh fails', async () => {
    const load = vi.fn().mockResolvedValueOnce('first').mockRejectedValueOnce(new Error('down'));
    const { result } = renderHook(() => useReport(load, 'a'));
    await waitFor(() => expect(result.current.data).toBe('first'));
    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.hasError).toBe(true));
    expect(result.current.data).toBe('first');
  });

  it('clears the previous data when the filters change, so results never mix', async () => {
    const pending = deferred<string>();
    const load = vi.fn().mockResolvedValueOnce('for a').mockReturnValueOnce(pending.promise);
    const { result, rerender } = renderHook(({ key }) => useReport(load, key), { initialProps: { key: 'a' } });
    await waitFor(() => expect(result.current.data).toBe('for a'));
    rerender({ key: 'b' });
    await waitFor(() => expect(result.current).toMatchObject({ data: null, isLoading: true }));
  });

  it('does not update after unmount', async () => {
    const pending = deferred<string>();
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = renderHook(() => useReport(() => pending.promise, 'a'));
    unmount();
    await act(async () => { pending.resolve('late'); });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('can be switched off until its input is known', () => {
    const load = vi.fn();
    renderHook(() => useReport(load, 'a', false));
    expect(load).not.toHaveBeenCalled();
  });

  it('retrying after a first failure shows loading, not a blank card', async () => {
    const second = deferred<string>();
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockReturnValueOnce(second.promise);
    const { result } = renderHook(() => useReport(load, 'a'));
    await waitFor(() => expect(result.current.hasError).toBe(true));
    act(() => result.current.refresh());
    expect(result.current).toMatchObject({ isLoading: true, hasError: false, data: null });
    await act(async () => { second.resolve('recovered'); });
    await waitFor(() => expect(result.current.data).toBe('recovered'));
  });

  it('aborts the request of the filters that were replaced', async () => {
    const signals: AbortSignal[] = [];
    const { rerender } = renderHook(({ key }) => useReport((signal) => { signals.push(signal); return new Promise<string>(() => {}); }, key), { initialProps: { key: 'a' } });
    rerender({ key: 'b' });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it('keeps the data while a new key of the same scope loads (pagination, live window)', async () => {
    const next = deferred<string>();
    const load = vi.fn().mockResolvedValueOnce('page 1').mockReturnValueOnce(next.promise);
    const { result, rerender } = renderHook(({ key }) => useReport(load, key, true, 'same-filters'), { initialProps: { key: 'page-1' } });
    await waitFor(() => expect(result.current.data).toBe('page 1'));
    rerender({ key: 'page-2' });
    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    expect(result.current).toMatchObject({ data: 'page 1', isLoading: false });
    await act(async () => { next.resolve('page 2'); });
    await waitFor(() => expect(result.current.data).toBe('page 2'));
  });
});
