import { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaSync } from 'react-icons/fa';
import * as chatService from '../../../services/chatService';
import { notify } from '../../../components/shared/Toast';
import { TemplateCard } from '../components/TemplateCard';
import { TemplateTestDialog } from '../components/TemplateTestDialog';
import { TemplateCreateDialog } from '../components/TemplateCreateDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadState } from '../components/LoadState';
import { testComponentsFor, toTemplates, type TemplateRow } from '../utils/templates';
import type { LoadStatus } from './types';

const errorText = (error: unknown) => (error instanceof Error && error.message ? error.message : 'Error al crear la plantilla');

/** "Plantillas de WhatsApp": templates as Meta has them. Same services and payloads as before. */
const TemplatesTab = () => {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState<TemplateRow | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data: unknown = await chatService.getTemplates();
      setTemplates(toTemplates(data));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (draft: { name: string; category: string; language: string; body: string }) => {
    try {
      await chatService.createTemplate({
        name: draft.name.toLowerCase().replace(/\s+/g, '_'),
        category: draft.category,
        language: draft.language,
        components: [{ type: 'BODY', text: draft.body }],
      });
      setCreating(false);
      load();
      notify.success('Plantilla enviada a revisión en Meta.');
      return true;
    } catch (error) {
      notify.error(errorText(error));
      return false;
    }
  };

  const sendTest = async (to: string) => {
    if (!testing) return;
    setBusy(true);
    try {
      await chatService.sendTestTemplate({ to, templateName: testing.name, languageCode: testing.language, components: testComponentsFor(testing.name) });
      notify.success('¡Prueba enviada con éxito!');
      setTesting(null);
    } catch {
      notify.error('Error al enviar la prueba');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await chatService.deleteTemplate(toDelete);
      notify.success('Plantilla eliminada');
      setToDelete(null);
      load();
    } catch {
      notify.error('Error al eliminar la plantilla');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
        Las plantillas son los únicos mensajes que WhatsApp permite enviar fuera de las 24 horas desde el último mensaje de la persona. Meta las revisa antes de aprobarlas.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">Plantillas ({templates.length})</h2>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <FaSync aria-hidden="true" className={status === 'loading' ? 'animate-spin' : ''} /> Actualizar desde Meta
          </button>
          <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <FaPlus aria-hidden="true" /> Crear plantilla
          </button>
        </div>
      </div>

      <LoadState
        status={status}
        loadingLabel="Cargando plantillas…"
        errorMessage="No se pudieron cargar las plantillas de Meta."
        isEmpty={templates.length === 0}
        emptyMessage="No hay plantillas en tu cuenta de Meta."
        onRetry={load}
        skeletonClass="h-48 rounded-2xl"
        skeletonLayoutClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} onSendTest={id => setTesting(templates.find(t => t.id === id) ?? null)} onDelete={setToDelete} />
          ))}
        </div>
      </LoadState>

      <TemplateCreateDialog isOpen={creating} onSubmit={create} onClose={() => setCreating(false)} />
      <TemplateTestDialog templateName={testing?.name ?? null} sending={busy} onSend={sendTest} onClose={() => setTesting(null)} />
      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Eliminar plantilla"
        message={`Se elimina "${toDelete ?? ''}" de tu cuenta de Meta, en todos sus idiomas. No se puede deshacer.`}
        confirmLabel="Eliminar"
        busy={busy}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default TemplatesTab;
