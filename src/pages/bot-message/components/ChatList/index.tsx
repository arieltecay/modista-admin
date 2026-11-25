import { FaCheckDouble, FaSearch } from 'react-icons/fa';
import { ChatListItem } from '../ChatListItem';
import { LoadState } from '../LoadState';
import type { ChannelFilter, ChatListProps } from './types';

const FILTERS: { id: ChannelFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
];

/** Left column of the inbox: local search, channel filter, "mark all read" and the conversations. */
export const ChatList = ({
  items,
  status,
  selectedKey,
  filter,
  query,
  markingAllRead,
  filtered,
  onFilterChange,
  onQueryChange,
  onSelect,
  onRetry,
  onMarkAllRead,
}: ChatListProps) => (
  <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="space-y-3 border-b border-slate-100 p-3">
      <label className="relative block">
        <span className="sr-only">Buscar conversación</span>
        <FaSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Buscar por número, id o texto"
          className="w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Filtrar por canal" className="flex flex-wrap gap-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => onFilterChange(id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${filter === id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={markingAllRead}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
        >
          <FaCheckDouble aria-hidden="true" /> Marcar todo como leído
        </button>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto p-2">
      <LoadState
        status={status}
        loadingLabel="Cargando conversaciones…"
        errorMessage="No se pudieron cargar las conversaciones."
        isEmpty={items.length === 0}
        emptyMessage={filtered ? 'No hay conversaciones con este filtro.' : 'Todavía no hay conversaciones.'}
        onRetry={onRetry}
      >
        <ul aria-label="Conversaciones" className="-m-2">
          {items.map(item => <ChatListItem key={item.key} item={item} selected={item.key === selectedKey} onSelect={onSelect} />)}
        </ul>
      </LoadState>
    </div>
  </div>
);
