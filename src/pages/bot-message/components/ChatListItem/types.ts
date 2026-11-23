export interface ChatListItemData {
  key: string;
  channel: string;
  /** Id shown in the list (long ids shortened). */
  shortId: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export interface ChatListItemProps {
  item: ChatListItemData;
  selected: boolean;
  onSelect: (key: string) => void;
}
