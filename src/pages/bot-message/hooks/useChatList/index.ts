import { useCallback, useEffect, useRef, useState } from 'react';
import * as chatService from '../../../../services/chatService';
import { notify } from '../../../../components/shared/Toast';
import { readAllMessage, toChatSummaries } from './normalize';
import type { ChatListState, ChatSummary, ListStatus } from './types';

export const POLL_INTERVAL_MS = 10_000;

/**
 * Conversation list. While `active` and the browser tab is visible, refreshes every 10 s.
 * Only the latest request is applied, so a slow old poll cannot overwrite a newer list.
 * A failed refresh keeps the last list on screen; only a failed first load shows the error.
 */
export const useChatList = (active: boolean, onReadAll: () => void): ChatListState => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [status, setStatus] = useState<ListStatus>('loading');
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const lastRequest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++lastRequest.current;
    try {
      const data: unknown = await chatService.getChats();
      if (request !== lastRequest.current) return;
      setChats(toChatSummaries(data));
      setStatus('ready');
    } catch {
      if (request === lastRequest.current) setStatus(previous => (previous === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    let timer: number | undefined;
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      timer = window.setInterval(reload, POLL_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return stop();
      reload();
      start();
    };

    reload();
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [active, reload]);

  const markAllAsRead = useCallback(async () => {
    setMarkingAllRead(true);
    try {
      const result: unknown = await chatService.markAllAsRead();
      notify.success(readAllMessage(result));
      reload();
      onReadAll();
    } catch {
      notify.error('Error al marcar mensajes como leídos');
    } finally {
      setMarkingAllRead(false);
    }
  }, [onReadAll, reload]);

  return { chats, status, markingAllRead, reload, markAllAsRead };
};
