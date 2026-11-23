import { asId, asText, isRecord } from '../../utils/guards';
import type { ChatMessage, MessagesStatus, ThreadTarget } from './types';

export const toChatMessages = (data: unknown): ChatMessage[] => {
  if (!Array.isArray(data)) return [];
  return data.flatMap(row => {
    const id = isRecord(row) ? asId(row._id) : null;
    if (!isRecord(row) || !id) return [];
    const kind = row.kind === 'comment' || row.kind === 'private_reply' ? row.kind : undefined;
    return [{
      id,
      direction: row.direction === 'outbound' ? 'outbound' : 'inbound',
      body: asText(row.body),
      timestamp: asText(row.timestamp),
      kind,
      status: typeof row.status === 'string' ? row.status : undefined,
    }];
  });
};

/**
 * A comment does not open the messaging window: on Instagram a real inbound DM is required first.
 * While the messages load we cannot know yet, so Instagram stays blocked; a failed load leaves it to Meta.
 */
export const canReplyTo = (target: ThreadTarget | null, messages: ChatMessage[], status: MessagesStatus) => {
  if (!target || target.platform !== 'instagram' || status === 'error') return true;
  return status === 'ready' && messages.some(m => m.direction === 'inbound' && !m.kind);
};
