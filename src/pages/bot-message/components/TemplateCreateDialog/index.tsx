import { useState } from 'react';
import type { FormEvent } from 'react';
import GlobalModal from '../../../../components/shared/GlobalModal';
import type { TemplateCreateDialogProps, TemplateDraft } from './types';

const EMPTY: TemplateDraft = { name: '', category: 'UTILITY', language: 'es_AR', body: '' };

const CATEGORIES = [
  { value: 'UTILITY', label: 'Utilidad (pagos, avisos)' },
  { value: 'MARKETING', label: 'Marketing (promociones)' },
];
const LANGUAGES = [
  { value: 'es_AR', label: 'Español (Argentina)' },
  { value: 'es', label: 'Español (general)' },
  { value: 'en_US', label: 'Inglés (EE. UU.)' },
];

const fieldClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

/** New WhatsApp template. Meta reviews it before it can be used. The draft is kept if Meta rejects it. */
export const TemplateCreateDialog = ({ isOpen, onSubmit, onClose }: TemplateCreateDialogProps) => {
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const set = (patch: Partial<TemplateDraft>) => setDraft(previous => ({ ...previous, ...patch }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    if (await onSubmit(draft)) setDraft(EMPTY);
    setSubmitting(false);
  };

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title="Crear plantilla en Meta">
      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Nombre (minúsculas y guiones bajos)</span>
          <input required value={draft.name} onChange={e => set({ name: e.target.value })} placeholder="ej: confirmacion_pago" className={fieldClass} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Categoría</span>
            <select value={draft.category} onChange={e => set({ category: e.target.value })} className={fieldClass}>
              {CATEGORIES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Idioma</span>
            <select value={draft.language} onChange={e => set({ language: e.target.value })} className={fieldClass}>
              {LANGUAGES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
        <div className="space-y-1">
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Contenido del mensaje</span>
            <textarea required rows={4} value={draft.body} onChange={e => set({ body: e.target.value })} placeholder="Hola {{1}}, tu curso {{2}} ya está listo..." className={`${fieldClass} resize-none`} />
          </label>
          <p className="text-xs text-slate-500">Usá {'{{1}}'}, {'{{2}}'}… para datos que completa el sistema.</p>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={submitting} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Enviar a Meta</button>
        </div>
      </form>
    </GlobalModal>
  );
};
