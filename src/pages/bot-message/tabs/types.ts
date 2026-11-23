export type LoadStatus = 'loading' | 'ready' | 'error';

export type ChannelFilter = 'all' | 'whatsapp' | 'instagram';

export interface ConversationsTabProps {
  /** Polling only runs while the inbox is the visible tab. */
  active: boolean;
}

/** Which inbox dialog is open; only one at a time. */
export type InboxDialog = { type: 'clear' } | { type: 'delete'; id: string } | { type: 'faq'; question: string } | null;
