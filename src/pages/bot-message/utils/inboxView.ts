import { getMessageKindLabel } from './messageKind';
import { channelLabel, formatTime, fullChatId, shortChatId } from './channels';

/** The fields of a conversation the list needs. */
interface ChatView {
  key: string;
  platform: string;
  platformId: string;
  lastMessage: string;
  unreadCount: number;
  lastTimestamp?: string;
}

/** The fields of a message the thread needs. */
interface MessageView {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
  kind?: 'comment' | 'private_reply';
  status?: string;
}

/** Channel filter + local search over the id and the last message. Never asks the server. */
export const matchesFilters = (chat: ChatView, filter: string, query: string) => {
  const text = query.trim().toLowerCase();
  if (filter !== 'all' && chat.platform !== filter) return false;
  return !text || `${fullChatId(chat.platform, chat.platformId)} ${chat.lastMessage}`.toLowerCase().includes(text);
};

export const toListEntries = (chats: ChatView[]) =>
  chats.map(chat => ({
    key: chat.key,
    channel: channelLabel(chat.platform),
    shortId: shortChatId(chat.platform, chat.platformId),
    lastMessage: chat.lastMessage,
    time: formatTime(chat.lastTimestamp),
    unreadCount: chat.unreadCount,
  }));

export const toThreadMessages = (messages: MessageView[]) =>
  messages.map(message => ({
    id: message.id,
    body: message.body,
    time: formatTime(message.timestamp),
    inbound: message.direction === 'inbound',
    kindLabel: getMessageKindLabel(message),
    failed: message.status === 'failed',
  }));
