import { useId } from 'react';
import type { KeyboardEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import type { ComposerProps } from './types';

/** Manual reply. Enter sends, Shift+Enter adds a line. The draft is only cleared by the parent on success. */
export const Composer = ({ value, sending, onChange, onSend, blockedReason }: ComposerProps) => {
  const hintId = useId();
  const blocked = Boolean(blockedReason);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter while an IME or a predictive keyboard is composing a word confirms the word, not the message.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onSend();
  };

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        onSend();
      }}
      className="space-y-2 border-t border-slate-100 bg-white p-3"
    >
      {blockedReason && (
        <p id={hintId} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{blockedReason}</p>
      )}
      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Respuesta manual</span>
          <textarea
            rows={1}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending || blocked}
            aria-describedby={blocked ? hintId : undefined}
            placeholder="Escribí una respuesta…"
            className="max-h-32 min-h-[2.5rem] w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          />
        </label>
        <button
          type="submit"
          disabled={sending || blocked || !value.trim()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-300"
        >
          <FaPaperPlane aria-hidden="true" /> {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  );
};
