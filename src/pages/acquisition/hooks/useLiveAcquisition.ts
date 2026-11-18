import { useEffect } from 'react';
import { getLive } from '../services';
import { useReport } from './useReport';

export const POLL_INTERVAL_MS = 15_000;

/** Live activity: reloads every 15 seconds while the tab is visible and pauses while it is hidden. */
export const useLiveAcquisition = (windowMinutes: number) => {
  // Changing the window keeps the panel (and the focus on its selector) while the new window loads.
  const resource = useReport((signal) => getLive({ windowMinutes }, signal), `live-${windowMinutes}`, true, 'live');
  const { refresh } = resource;

  useEffect(() => {
    let timer: number | undefined;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  return resource;
};
