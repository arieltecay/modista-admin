import { useCallback, useEffect, useRef, useState } from 'react';

export interface Resource<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  refresh: () => void;
}

interface State<T> {
  data: T | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
}

/**
 * Loads one report. A new `scope` (what the data is about: the filters) discards the old data and
 * loads from scratch; a refresh, or a new `key` inside the same scope (next page, another live
 * window), keeps showing the data while it reloads and, if that fails, keeps it flagged as an error
 * (stale) instead of blanking the panel. Answers to superseded requests are ignored and aborted.
 */
export const useReport = <T,>(load: (signal: AbortSignal) => Promise<T>, key: string, enabled = true, scope = key): Resource<T> => {
  const [state, setState] = useState<State<T>>({ data: null, isLoading: enabled, isRefreshing: false, hasError: false });
  const latestRequest = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const lastScope = useRef<string | undefined>(undefined);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback(async (keepData: boolean) => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;

    setState((previous) =>
      // Nothing to keep (a first load, or a retry after a first failure) is a full load, not a blank card.
      keepData && previous.data !== null ? { ...previous, isRefreshing: true, hasError: false } : { data: null, isLoading: true, isRefreshing: false, hasError: false },
    );
    try {
      const data = await loadRef.current(current.signal);
      if (requestId === latestRequest.current) setState({ data, isLoading: false, isRefreshing: false, hasError: false });
    } catch {
      if (requestId === latestRequest.current) {
        setState((previous) => ({ data: keepData ? previous.data : null, isLoading: false, isRefreshing: false, hasError: true }));
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void run(lastScope.current === scope);
      lastScope.current = scope;
    } else setState({ data: null, isLoading: false, isRefreshing: false, hasError: false });
    return () => {
      latestRequest.current += 1;
      controller.current?.abort();
    };
  }, [key, scope, enabled, run]);

  const refresh = useCallback(() => void run(true), [run]);
  return { ...state, refresh };
};
