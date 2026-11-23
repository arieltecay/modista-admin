import { useEffect, useRef } from 'react';
import { FaArrowLeft, FaRobot, FaTrash } from 'react-icons/fa';
import { Composer } from '../Composer';
import { MessageBubble } from '../MessageBubble';
import type { ChatThreadProps } from './types';

const ThreadBody = ({ messages, status, onDeleteMessage, onSaveAsFaq }: ChatThreadProps) => {
  if (status === 'loading') return <p role="status" className="p-6 text-center text-sm text-slate-500">Cargando mensajes…</p>;
  if (status === 'error') return <p role="alert" className="p-6 text-center text-sm text-red-700">No se pudieron cargar los mensajes. Volvé a abrir la conversación.</p>;
  if (messages.length === 0) return <p className="p-6 text-center text-sm text-slate-500">Esta conversación no tiene mensajes.</p>;
  return (
    <ul aria-label="Mensajes" className="space-y-4">
      {messages.map(message => (
        <MessageBubble key={message.id} {...message} onDelete={onDeleteMessage} onSaveAsFaq={message.inbound ? onSaveAsFaq : undefined} />
      ))}
    </ul>
  );
};

/** Right column of the inbox: the open conversation, its actions and the manual reply. */
export const ChatThread = (props: ChatThreadProps) => {
  const { title, channel, messages, draft, sending, onDraftChange, onSend, onBack, onClear, replyBlockedReason } = props;
  const endRef = useRef<HTMLDivElement>(null);
  // Scroll only when a message arrives or the conversation changes: typing or polling must not move the reader.
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [title, lastMessageId, messages.length]);

  if (!title) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 shadow-sm">
        <FaRobot aria-hidden="true" size={48} className="text-slate-200" />
        <p className="text-sm">Elegí una conversación para ver los mensajes.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="thread-title" className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onBack} aria-label="Volver a conversaciones" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden">
            <FaArrowLeft aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h2 id="thread-title" className="truncate font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{channel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
        >
          <FaTrash aria-hidden="true" /> Limpiar historial
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
        <ThreadBody {...props} />
        <div ref={endRef} />
      </div>
      <Composer value={draft} sending={sending} onChange={onDraftChange} onSend={onSend} blockedReason={replyBlockedReason} />
    </section>
  );
};
