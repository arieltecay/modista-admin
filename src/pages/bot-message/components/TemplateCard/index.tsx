import { useId } from 'react';
import { FaPaperPlane, FaTrash } from 'react-icons/fa';
import type { TemplateCardProps } from './types';

const STATUS: Record<string, { label: string; className: string }> = {
  APPROVED: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
  PENDING: { label: 'En revisión', className: 'bg-amber-100 text-amber-800' },
  REJECTED: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
};

/** One WhatsApp template with its real Meta status. Only approved ones can be tested. */
export const TemplateCard = ({ template, onSendTest, onDelete }: TemplateCardProps) => {
  const titleId = useId();
  const status = STATUS[template.status] ?? { label: template.status, className: 'bg-slate-100 text-slate-700' };
  return (
    <article aria-labelledby={titleId} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-2 border-b border-slate-100 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">{template.category}</p>
          <h3 id={titleId} className="break-all font-bold text-slate-900">{template.name}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </header>
      <div className="flex-1 bg-emerald-50/60 p-4">
        <div className="rounded-xl rounded-tl-sm border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-sm">
          <p className="whitespace-pre-wrap">{template.body || 'Sin contenido'}</p>
          <p className="mt-1 text-right text-[10px] text-slate-400">{template.language}</p>
        </div>
      </div>
      <footer className="flex justify-end gap-2 p-3">
        {template.status === 'APPROVED' && (
          <button type="button" onClick={() => onSendTest(template.id)} aria-label={`Enviar prueba de ${template.name} (${template.language})`} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
            <FaPaperPlane aria-hidden="true" /> Probar
          </button>
        )}
        <button type="button" onClick={() => onDelete(template.name)} aria-label={`Eliminar plantilla ${template.name}`} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
          <FaTrash aria-hidden="true" /> Eliminar
        </button>
      </footer>
    </article>
  );
};
