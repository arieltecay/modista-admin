/** The conversation the thread works on: channel and id are all the API needs. */
export interface ThreadTarget {
  key: string;
  platform: string;
  platformId: string;
}

/** One message of `GET /api/chat/:platform/:id`, normalized. */
export interface ChatMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
  /** Absent means a direct message. */
  kind?: 'comment' | 'private_reply';
  /** Only `failed` is reliable (see docs/agent/traps.md). */
  status?: string;
}

export type MessagesStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ChatThreadState {
  selected: ThreadTarget | null;
  messages: ChatMessage[];
  messagesStatus: MessagesStatus;
  draft: string;
  sending: boolean;
  /** Instagram allows a manual reply only after the person wrote a direct message. */
  canReply: boolean;
  setDraft: (value: string) => void;
  select: (target: ThreadTarget) => void;
  close: () => void;
  send: () => Promise<void>;
  removeMessage: (id: string) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
}
