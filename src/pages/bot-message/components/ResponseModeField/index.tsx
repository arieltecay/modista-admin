import { useId } from 'react';
import { FIXED_REPLY_MAX_CHARS, fixedReplyIssue, fixedReplyLength } from '../../utils/fixedReply';
import type { ResponseMode, ResponseModeFieldProps } from './types';

const OPTIONS: Array<{ value: ResponseMode; label: string; hint: string }> = [
  { value: 'gemini', label: 'Mila redacta con Gemini', hint: 'Usa "Lo que sabe Mila" como contexto y escribe cada respuesta.' },
  { value: 'fixed', label: 'Enviar respuesta fija', hint: 'Manda siempre el mismo mensaje, sin pasar por Gemini.' },
];

/** How a rule answers on Instagram: Mila writes the reply, or a fixed message goes out word for word. */
export const ResponseModeField = ({ mode, fixedResponse, onModeChange, onFixedResponseChange }: ResponseModeFieldProps) => {
  const name = useId();
  const textId = useId();
  const hintId = useId();
  const statusId = useId();
  const issue = fixedReplyIssue(fixedResponse);
  const tooLong = issue === 'tooLong';
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-gray-800">Cómo responde en Instagram</legend>
      {OPTIONS.map(option => (
        <label key={option.value} className="flex items-start gap-3 rounded-xl border border-pink-100 bg-white p-3 text-sm text-pink-900">
          <input type="radio" name={name} value={option.value} checked={mode === option.value} onChange={() => onModeChange(option.value)} className="mt-1" />
          <span>
            <span className="block font-medium">{option.label}</span>
            <span className="block text-xs text-gray-600">{option.hint}</span>
          </span>
        </label>
      ))}
      {mode === 'fixed' ? (
        <div className="space-y-1">
          <label htmlFor={textId} className="block text-sm font-medium text-gray-800">Mensaje que se enviará</label>
          <textarea id={textId} rows={4} value={fixedResponse} onChange={e => onFixedResponseChange(e.target.value)}
            aria-describedby={`${hintId} ${statusId}`} aria-invalid={tooLong}
            placeholder="Ej: ¡Hola! El curso de camisa empieza el sábado. Te dejo el link para inscribirte: …"
            className="w-full rounded-xl border border-gray-200 p-3 text-sm" />
          <p id={hintId} className="text-xs text-gray-600">Este mensaje se envía tal cual y no usa Gemini. En WhatsApp, Mila sigue usando "Lo que sabe Mila".</p>
          <p id={statusId} aria-live="polite" className={`text-xs ${tooLong ? 'font-semibold text-red-700' : 'text-gray-500'}`}>
            {issue === 'empty' && 'Escribí el mensaje para poder guardar. '}
            {tooLong && 'El mensaje es demasiado largo para Instagram (los emojis ocupan más). '}
            {fixedReplyLength(fixedResponse)} / {FIXED_REPLY_MAX_CHARS} caracteres
          </p>
        </div>
      ) : tooLong && (
        // The kept fixed text still goes to the API, which rejects it: say so instead of failing on save.
        <p role="alert" className="text-xs font-semibold text-red-700">
          El mensaje fijo guardado es demasiado largo para Instagram. Elegí "Enviar respuesta fija" para acortarlo.
        </p>
      )}
    </fieldset>
  );
};
