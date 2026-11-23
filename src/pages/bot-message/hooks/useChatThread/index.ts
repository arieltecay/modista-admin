import { useCallback, useRef, useState } from 'react';
import * as chatService from '../../../../services/chatService';
import { notify } from '../../../../components/shared/Toast';
import { canReplyTo, toChatMessages } from './normalize';
import type { ChatMessage, ChatThreadState, MessagesStatus, ThreadTarget } from './types';

/**
 * The open conversation. Each conversation keeps its own draft, so text never moves to another person.
 * Responses that arrive after switching to another conversation are ignored.
 */
export const useChatThread = (onHistoryChanged: () => void): ChatThreadState => {
  const [selected, setSelected] = useState<ThreadTarget | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesStatus, setMessagesStatus] = useState<MessagesStatus>('idle');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const currentKey = useRef<string | null>(null);
  const latestLoad = useRef(0);
  const sendingRef = useRef(false);

  const load = useCallback(async (target: ThreadTarget) => {
    const requestId = ++latestLoad.current;
    try {
      const data: unknown = await chatService.getMessages(target.platform, target.platformId);
      if (requestId !== latestLoad.current || currentKey.current !== target.key) return;
      setMessages(toChatMessages(data));
      setMessagesStatus('ready');
    } catch {
      if (requestId === latestLoad.current && currentKey.current === target.key) setMessagesStatus('error');
    }
  }, []);

  const select = useCallback((target: ThreadTarget) => {
    currentKey.current = target.key;
    setSelected(target);
    setMessages([]);
    setMessagesStatus('loading');
    load(target);
  }, [load]);

  const close = useCallback(() => {
    currentKey.current = null;
    setSelected(null);
    setMessages([]);
    setMessagesStatus('idle');
  }, []);

  const draft = selected ? drafts[selected.key] ?? '' : '';
  const setDraft = useCallback((value: string) => {
    if (!selected) return;
    setDrafts(previous => ({ ...previous, [selected.key]: value }));
  }, [selected]);

  const send = useCallback(async () => {
    if (!selected || !draft.trim() || sendingRef.current) return;
    const target = selected;
    sendingRef.current = true;
    setSending(true);
    try {
      await chatService.sendMessage(target.platform, target.platformId, draft);
      setDrafts(previous => ({ ...previous, [target.key]: '' }));
      if (currentKey.current === target.key) await load(target);
    } catch {
      notify.error('No se pudo enviar el mensaje');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [draft, load, selected]);

  const removeMessage = useCallback(async (id: string) => {
    const target = selected;
    const loadGenerationAtStart = latestLoad.current;
    try {
      await chatService.deleteMessage(id);
      if (target && currentKey.current === target.key) {
        if (latestLoad.current !== loadGenerationAtStart) {
          await load(target);
        } else {
          latestLoad.current += 1;
          setMessages(previous => previous.filter(message => message.id !== id));
          setMessagesStatus('ready');
        }
      }
      notify.success('Mensaje eliminado');
      return true;
    } catch {
      notify.error('Error al eliminar el mensaje');
      return false;
    }
  }, [load, selected]);

  const clearHistory = useCallback(async () => {
    if (!selected) return false;
    const target = selected;
    try {
      await chatService.clearChat(target.platform, target.platformId);
      if (currentKey.current === target.key) {
        latestLoad.current += 1;
        setMessages([]);
        setMessagesStatus('ready');
      }
      onHistoryChanged();
      notify.success('Historial limpiado correctamente');
      return true;
    } catch {
      notify.error('Error al limpiar el historial');
      return false;
    }
  }, [onHistoryChanged, selected]);

  return {
    selected,
    messages,
    messagesStatus,
    draft,
    sending,
    canReply: canReplyTo(selected, messages, messagesStatus),
    setDraft,
    select,
    close,
    send,
    removeMessage,
    clearHistory,
  };
};
