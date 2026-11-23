import { describe, expect, it } from 'vitest';
import { toChatSummaries } from '../hooks/useChatList/normalize';
import { canReplyTo, toChatMessages } from '../hooks/useChatThread/normalize';
import { toTemplates, toTestPhone } from './templates';

describe('API normalizers of the Messages section', () => {
  it('keeps well-formed chats once, accepts numeric ids and drops broken rows', () => {
    const chats = toChatSummaries([
      null,
      { _id: { platform: 'telegram', platform_id: 'x' } },
      { _id: { platform: 'whatsapp', platform_id: 5491100000001 }, lastMessage: 'hola', unreadCount: 1, lastTimestamp: 'nope' },
      { _id: { platform: 'whatsapp', platform_id: '5491100000001' }, lastMessage: 'duplicado' },
    ]);

    expect(chats).toEqual([
      { key: 'whatsapp:5491100000001', platform: 'whatsapp', platformId: '5491100000001', lastMessage: 'hola', unreadCount: 1, lastTimestamp: undefined },
    ]);
  });

  it('keeps messages with an id and only the known kinds', () => {
    expect(toChatMessages([{ body: 'sin id' }, { _id: 'm1', kind: 'story', direction: 'outbound', status: 'read' }])).toEqual([
      { id: 'm1', direction: 'outbound', body: '', timestamp: '', kind: undefined, status: 'read' },
    ]);
  });

  it('lets Instagram reply only after a real inbound DM is loaded', () => {
    const ig = { key: 'instagram:1', platform: 'instagram', platformId: '1' };
    const comment = { id: 'c', direction: 'inbound' as const, body: '', timestamp: '', kind: 'comment' as const };
    const dm = { id: 'd', direction: 'inbound' as const, body: '', timestamp: '' };

    expect(canReplyTo(ig, [], 'loading')).toBe(false);
    expect(canReplyTo(ig, [comment], 'ready')).toBe(false);
    expect(canReplyTo(ig, [comment, dm], 'ready')).toBe(true);
    expect(canReplyTo({ ...ig, platform: 'whatsapp' }, [], 'loading')).toBe(true);
  });

  it('keys templates by id, falling back to name and language', () => {
    expect(toTemplates([{ name: 'a', language: 'es_AR', status: 'APPROVED', components: [{ type: 'BODY', text: 'hola' }] }, { id: 7 }])).toEqual([
      { id: 'a-es_AR', name: 'a', category: '', language: 'es_AR', status: 'APPROVED', body: 'hola' },
    ]);
  });

  it('accepts test numbers of 10 to 15 digits, ignoring spaces, dashes and +', () => {
    expect(toTestPhone('+54 9 11 0000-0000')).toBe('5491100000000');
    expect(toTestPhone('54 9 11')).toBeNull();
    expect(toTestPhone('54911abc0000')).toBeNull();
  });
});
