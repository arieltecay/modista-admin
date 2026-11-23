import { useEffect, useState } from 'react';
import GlobalModal from '../../../../components/shared/GlobalModal';
import { toTestPhone } from '../../utils/templates';
import type { TemplateTestDialogProps } from './types';

/** Asks for the test number. A test is a real WhatsApp message, so the dialog says so and checks the number. */
export const TemplateTestDialog = ({ templateName, sending, onSend, onClose }: TemplateTestDialogProps) => {
  const [phone, setPhone] = useState('');
  const valid = toTestPhone(phone);

  useEffect(() => {
    if (templateName) setPhone('');
  }, [templateName]);

  return (
    <GlobalModal
      isOpen={templateName !== null}
      onClose={() => !sending && onClose()}
      title={`Probar ${templateName ?? ''}`}
      footer={
        <>
          <button
            type="button"
            onClick={() => valid && onSend(valid)}
            disabled={sending || !valid}
            className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 sm:w-auto"
          >
            {sending ? 'Enviando…' : 'Enviar prueba'}
          </button>
          <button type="button" onClick={onClose} disabled={sending} className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:mt-0 sm:w-auto">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Se envía un mensaje real de WhatsApp. Usá solo un número de prueba autorizado, nunca el de una alumna.</p>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Número de WhatsApp (con código de país)</span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="549..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <p className="text-xs text-slate-500">{valid ? `Se enviará a +${valid}` : 'Entre 10 y 15 dígitos, empezando por el código de país.'}</p>
      </div>
    </GlobalModal>
  );
};
