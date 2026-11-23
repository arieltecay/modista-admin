import { useId } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { RuleCardData, RuleCardProps } from './types';

/** Channels where the rule can answer, exactly as the API applies it (see docs/guia-mensajes.md). */
const channelsOf = (rule: RuleCardData) =>
  [
    'WhatsApp',
    rule.instagramDirect && 'Instagram · mensajes directos',
    rule.instagramComments && 'Instagram · comentarios (responde por privado)',
  ].filter((value): value is string => Boolean(value));

/** One automatic-reply rule: where it answers, what triggers it and what Mila knows from it. */
export const RuleCard = ({ rule, onEdit, onDelete }: RuleCardProps) => {
  const titleId = useId();
  const sendsFixed = rule.replyMode === 'fixed' && (rule.instagramDirect || rule.instagramComments);
  return (
    <article aria-labelledby={titleId} className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm ${rule.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-75'}`}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={titleId} className="truncate font-bold text-slate-900">{rule.title}</h3>
          <p className="text-xs text-slate-400">Orden {rule.order}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
          {rule.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </header>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Responde en</p>
        <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
          {channelsOf(rule).map(channel => (
            <li key={channel} className="flex gap-1.5">
              <span aria-hidden="true" className="text-green-600">✓</span>
              <span>{channel}</span>
            </li>
          ))}
        </ul>
        {rule.enrollmentLookup && rule.instagramDirect && <p className="mt-1 text-xs text-amber-700">Puede consultar inscripciones por Instagram.</p>}
      </div>

      {rule.keywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Se activa en Instagram con</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {rule.keywords.map(keyword => <li key={keyword} className="break-all rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-800">{keyword}</li>)}
          </ul>
        </div>
      )}

      {sendsFixed && (
        <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-pink-800">Respuesta fija en Instagram</p>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-800">{rule.fixedResponse}</p>
          <p className="mt-2 text-xs text-pink-800">Se envía tal cual, sin Gemini.</p>
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lo que sabe Mila</p>
        <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">{rule.content}</p>
        <p className="mt-2 text-xs text-slate-500">{sendsFixed ? 'Mila lo usa en WhatsApp; en Instagram se envía la respuesta fija.' : 'Mila redacta con este texto; no lo envía tal cual.'}</p>
      </div>

      <footer className="mt-auto flex justify-end gap-2">
        <button type="button" onClick={() => onEdit(rule.id)} aria-label={`Editar regla ${rule.title}`} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
          <FaEdit aria-hidden="true" /> Editar
        </button>
        <button type="button" onClick={() => onDelete(rule.id)} aria-label={`Eliminar regla ${rule.title}`} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
          <FaTrash aria-hidden="true" /> Eliminar
        </button>
      </footer>
    </article>
  );
};
