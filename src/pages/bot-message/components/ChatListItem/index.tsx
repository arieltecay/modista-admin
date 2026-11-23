import type { ReactElement } from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import type { ChatListItemProps } from './types';

const CHANNEL_ICON: Record<string, ReactElement> = {
  WhatsApp: <FaWhatsapp className="text-green-600" />,
  Instagram: <FaInstagram className="text-pink-600" />,
};

/** What a screen reader announces: channel, id, unread count, time and preview, separated. */
const accessibleName = ({ channel, shortId, unreadCount, time, lastMessage }: ChatListItemProps['item']) =>
  [`${channel} ${shortId}`, unreadCount > 0 ? `${unreadCount} sin leer` : '', time, lastMessage].filter(Boolean).join(', ');

export const ChatListItem = ({ item, selected, onSelect }: ChatListItemProps) => (
  <li>
    <button
      type="button"
      aria-label={accessibleName(item)}
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(item.key)}
      className={`flex w-full flex-col gap-1 border-b border-l-4 border-b-slate-100 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
        selected ? 'border-l-indigo-600 bg-indigo-50' : 'border-l-transparent hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true">{CHANNEL_ICON[item.channel]}</span>
          <span className={`truncate text-sm ${item.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{item.shortId}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {item.unreadCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
              {item.unreadCount}
            </span>
          )}
          <span className="text-xs text-slate-400">{item.time}</span>
        </span>
      </span>
      <span className="truncate pl-6 text-sm text-slate-500">{item.lastMessage}</span>
    </button>
  </li>
);
