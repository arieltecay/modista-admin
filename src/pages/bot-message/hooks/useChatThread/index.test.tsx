import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chat = vi.hoisted(() => ({
  getMessages: vi.fn(),
  deleteMessage: vi.fn(),
  clearChat: vi.fn(),
}));
vi.mock('../../../../services/chatService', () => chat);

const notify = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../../../../components/shared/Toast', () => ({ notify }));

import { useChatThread } from './index';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};

const whatsapp = { key: 'whatsapp:customer-a', platform: 'whatsapp', platformId: 'customer-a' };
const instagram = { key: 'instagram:customer-b', platform: 'instagram', platformId: 'customer-b' };
const message = (id: string) => ({ _id: id, direction: 'inbound', body: id, timestamp: '2026-11-22T12:00:00.000Z' });

describe('useChatThread', () => {
  beforeEach(() => {
    chat.getMessages.mockReset();
    chat.deleteMessage.mockReset().mockResolvedValue({});
    chat.clearChat.mockReset().mockResolvedValue({});
    notify.success.mockReset();
    notify.error.mockReset();
  });

  it('reloads a reopened conversation after a pending delete completes', async () => {
    const deleting = deferred<unknown>();
    const reopenedLoad = deferred<unknown>();
    chat.getMessages
      .mockResolvedValueOnce([message('a1'), message('a2')])
      .mockResolvedValueOnce([message('b1')])
      .mockReturnValueOnce(reopenedLoad.promise)
      .mockResolvedValueOnce([message('a2')]);
    chat.deleteMessage.mockReturnValueOnce(deleting.promise);
    const { result } = renderHook(() => useChatThread(vi.fn()));

    act(() => result.current.select(whatsapp));
    await waitFor(() => expect(result.current.messages.map(item => item.id)).toEqual(['a1', 'a2']));

    let deletion!: Promise<boolean>;
    act(() => { deletion = result.current.removeMessage('a1'); });
    act(() => result.current.select(instagram));
    await waitFor(() => expect(result.current.messages.map(item => item.id)).toEqual(['b1']));
    act(() => result.current.select(whatsapp));
    expect(result.current.messagesStatus).toBe('loading');

    await act(async () => {
      deleting.resolve({});
      expect(await deletion).toBe(true);
    });
    await waitFor(() => expect(result.current.messages.map(item => item.id)).toEqual(['a2']));

    await act(async () => reopenedLoad.resolve([message('a1'), message('a2')]));
    expect(result.current.messages.map(item => item.id)).toEqual(['a2']);
    expect(result.current.messagesStatus).toBe('ready');
  });
});
