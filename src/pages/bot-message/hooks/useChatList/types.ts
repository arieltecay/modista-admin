export type Platform = 'whatsapp' | 'instagram';

/** One conversation of `GET /api/chat`, normalized. Only the fields the API really sends. */
export interface ChatSummary {
  /** `platform:platformId`, unique across channels. */
  key: string;
  platform: Platform;
  platformId: string;
  lastMessage: string;
  unreadCount: number;
  /** ISO date; missing or invalid dates are dropped. */
  lastTimestamp?: string;
}

export type ListStatus = 'loading' | 'ready' | 'error';

export interface ChatListState {
  chats: ChatSummary[];
  status: ListStatus;
  markingAllRead: boolean;
  reload: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
