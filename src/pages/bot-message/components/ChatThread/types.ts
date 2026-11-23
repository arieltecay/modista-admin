export interface ThreadMessageView {
  id: string;
  body: string;
  time: string;
  inbound: boolean;
  kindLabel: string | null;
  failed: boolean;
}

export interface ChatThreadProps {
  /** Full id of the person (e.g. +549…); null when no conversation is open. */
  title: string | null;
  channel: string;
  messages: ThreadMessageView[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  draft: string;
  sending: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
  onClear: () => void;
  onDeleteMessage: (id: string) => void;
  onSaveAsFaq: (body: string) => void;
  /** Why the person cannot be answered by hand right now, if that is the case. */
  replyBlockedReason?: string;
}
