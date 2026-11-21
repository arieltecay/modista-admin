import React, { useState } from 'react';
import { FaUndo } from 'react-icons/fa';
import { TEMPLATE_FIELDS, customizedTemplates, validateTemplate } from './fields';
import { buildPreview } from './preview';
import type { EnrollmentSettingsProps, TemplateKey } from './types';

const EnrollmentSettings: React.FC<EnrollmentSettingsProps> = ({ value, defaults, saving, onSave }) => {
  const [whatsappLookupEnabled, setWhatsappLookupEnabled] = useState(value.whatsappLookupEnabled);
  const [templates, setTemplates] = useState(value.templates);

  const errors = Object.fromEntries(TEMPLATE_FIELDS.map(field => [field.key, validateTemplate(field, templates[field.key])]));
  const hasErrors = Object.values(errors).some(Boolean);
  const setTemplate = (key: TemplateKey, text: string) => setTemplates(current => ({ ...current, [key]: text }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={whatsappLookupEnabled} onChange={e => setWhatsappLookupEnabled(e.target.checked)} aria-label="Responder consultas de inscripción por WhatsApp" />
            <span>
              <span className="block font-semibold text-gray-800">Responder consultas de inscripción por WhatsApp</span>
              <span className="block text-xs text-gray-500">Identifica a la persona por el número desde el que escribe y solo dice curso y estado de pago. Apagado: el bot sigue como siempre.</span>
            </span>
          </label>
          <p className="mt-4 rounded-xl bg-pink-50 p-3 text-xs text-pink-800">
            En Instagram se activa por tema en Entrenamiento ("Permitir consulta de inscripciones"). Pide email y celular, y atiende hasta 6 consultas por hora por cuenta.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800">Qué responde el bot</h3>
          <p className="text-xs text-gray-500">El bot solo puede insertar el nombre del curso con <code>{'{curso}'}</code>. Ningún otro dato de la inscripción se muestra.</p>
          {TEMPLATE_FIELDS.map(field => (
            <div key={field.key}>
              <label htmlFor={`template-${field.key}`} className="block text-sm font-medium text-gray-800">{field.label}</label>
              <textarea id={`template-${field.key}`} rows={2} value={templates[field.key]} onChange={e => setTemplate(field.key, e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm" />
              <p className="text-xs text-gray-500">{field.help}</p>
              {errors[field.key] && <p role="alert" className="text-xs font-semibold text-red-600">{errors[field.key]}</p>}
            </div>
          ))}
        </section>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-800">Vista previa</h3>
          <pre data-testid="enrollment-preview" className="whitespace-pre-wrap rounded-xl bg-green-50 p-3 text-sm text-gray-800">{buildPreview(templates)}</pre>
        </section>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={saving || hasErrors} onClick={() => onSave({ whatsappLookupEnabled, templates: customizedTemplates(templates, defaults) })} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => setTemplates(defaults)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <FaUndo /> Restaurar textos originales
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSettings;
