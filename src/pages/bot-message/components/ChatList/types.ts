export type ChannelFilter = 'all' | 'whatsapp' | 'instagram';

/** Same shape as ChatListItem's data; declared here so the list owns its contract. */
export interface ChatListEntry {
  key: string;
  channel: string;
  shortId: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface ChatListProps {
  items: ChatListEntry[];
  status: 'loading' | 'ready' | 'error';
  selectedKey: string | null;
  filter: ChannelFilter;
  query: string;
  markingAllRead: boolean;
  /** True when the server has conversations but the filters hide them all. */
  filtered: boolean;
  onFilterChange: (filter: ChannelFilter) => void;
  onQueryChange: (query: string) => void;
  onSelect: (key: string) => void;
  onRetry: () => void;
  onMarkAllRead: () => void;
}
