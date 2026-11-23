import { beforeEach, describe, expect, it, vi } from 'vitest';

// HTTP contract of the Messages section: route, method and body of every call.
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), delete: vi.fn() }));
vi.mock('./config/apiClient', () => ({ apiClient: api }));

import * as chat from './chatService';

describe('chatService contract', () => {
  beforeEach(() => {
    Object.values(api).forEach(fn => fn.mockReset().mockResolvedValue({}));
  });

  it.each([
    ['getChats', () => chat.getChats(), 'get', ['/chat']],
    ['getMessages', () => chat.getMessages('instagram', 'ig1'), 'get', ['/chat/instagram/ig1']],
    ['sendMessage', () => chat.sendMessage('whatsapp', '549', 'hola'), 'post', ['/chat/whatsapp/549/messages', { body: 'hola' }]],
    ['markAllAsRead', () => chat.markAllAsRead(), 'post', ['/chat/read-all']],
    ['deleteMessage', () => chat.deleteMessage('m1'), 'delete', ['/chat/messages/m1']],
    ['clearChat', () => chat.clearChat('whatsapp', '549'), 'delete', ['/chat/whatsapp/549/clear']],
    ['getTemplates', () => chat.getTemplates(), 'get', ['/notifications/whatsapp/templates']],
    [
      'createTemplate',
      () => chat.createTemplate({ name: 'a', category: 'UTILITY', language: 'es_AR', components: [{ type: 'BODY', text: 'Hola' }] }),
      'post',
      ['/notifications/whatsapp/templates', { name: 'a', category: 'UTILITY', language: 'es_AR', components: [{ type: 'BODY', text: 'Hola' }] }],
    ],
    ['deleteTemplate', () => chat.deleteTemplate('aviso'), 'delete', ['/notifications/whatsapp/templates/aviso']],
    [
      'sendTestTemplate',
      () => chat.sendTestTemplate({ to: '549', templateName: 'aviso', components: [] }),
      'post',
      ['/notifications/whatsapp/templates/test', { to: '549', templateName: 'aviso', components: [] }],
    ],
  ] as const)('%s', async (_name, call, method, args) => {
    await call();

    expect(api[method]).toHaveBeenCalledTimes(1);
    expect(api[method]).toHaveBeenCalledWith(...args);
  });
});
