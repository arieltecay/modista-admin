import React, { useState, useEffect } from 'react';
import { BotInstruction, BotInstructionFormData } from '../types';
import { FaSave } from 'react-icons/fa';
import GlobalModal from '../../../components/shared/GlobalModal';

/** An emptied number field gives NaN; the API only accepts integers from 0. */
const toOrder = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
};

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BotInstructionFormData) => void;
  instruction?: BotInstruction | null;
  loading: boolean;
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  instruction,
  loading
}) => {
  const [formData, setFormData] = useState<BotInstructionFormData>({
    title: '',
    content: '',
    order: 0,
    isActive: true,
    instagramAutoReply: false,
    instagramKeywords: [],
    instagramEnrollmentLookup: false,
    instagramCommentReply: false
  });
  const [keywordText, setKeywordText] = useState('');

  useEffect(() => {
    if (instruction) {
      setFormData({
        title: instruction.title,
        content: instruction.content,
        order: instruction.order,
        isActive: instruction.isActive,
        instagramAutoReply: instruction.instagramAutoReply ?? false,
        instagramKeywords: instruction.instagramKeywords ?? [],
        instagramEnrollmentLookup: instruction.instagramEnrollmentLookup ?? false,
        instagramCommentReply: instruction.instagramCommentReply ?? false
      });
      setKeywordText((instruction.instagramKeywords ?? []).join(', '));
    } else {
      setFormData({
        title: '',
        content: '',
        order: 0,
        isActive: true,
        instagramAutoReply: false,
        instagramKeywords: [],
        instagramEnrollmentLookup: false,
        instagramCommentReply: false
      });
      setKeywordText('');
    }
  }, [instruction, isOpen]);

  const hasKeywords = keywordText.split(/[,\n]/).some(value => value.trim().length >= 3);
  const needsKeywords = formData.instagramAutoReply || formData.instagramCommentReply;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const instagramKeywords = [...new Set(keywordText.split(/[,\n]/).map(value => value.trim()).filter(value => value.length >= 3))];
    onSubmit({ ...formData, instagramKeywords });
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={instruction ? 'Editar regla' : 'Nueva regla'}
      size="2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || !formData.content.trim() || (needsKeywords && !hasKeywords)}
            className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave aria-hidden="true" /> {loading ? 'Guardando...' : 'Guardar regla'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="rule-title" className="text-sm font-semibold text-gray-700">Nombre de la regla</label>
            <input
              id="rule-title"
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Mensaje de Bienvenida"
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="rule-order" className="text-sm font-semibold text-gray-700">Orden</label>
            <input
              id="rule-order"
              type="number"
              min={0}
              required
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: toOrder(e.target.value) })}
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="rule-content" className="text-sm font-semibold text-gray-700">Lo que sabe Mila</label>
          <p className="text-xs text-gray-500">Mila redacta la respuesta usando este texto como contexto: no lo envía palabra por palabra.</p>
          <textarea
            id="rule-content"
            required
            rows={8}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="Escribe aquí las instrucciones específicas para esta sección..."
            className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none border-gray-200 shadow-sm"
          />
          <p className="text-[10px] text-gray-400 italic">
            * Los saltos de línea y emojis serán preservados por el sistema de sanitización.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <input 
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-indigo-900 cursor-pointer">
            ¿Esta sección está activa para Mila AI?
          </label>
        </div>
        <div className="space-y-4 rounded-xl border border-pink-200 bg-pink-50 p-4">
          <div>
            <p className="text-sm font-bold text-pink-900">Respuestas automáticas en Instagram</p>
            <p className="text-xs text-pink-800">Mila responde solo si el mensaje contiene una de las frases configuradas. Los demás mensajes quedan en el chat para respuesta humana. Las instrucciones anteriores permanecen apagadas en Instagram.</p>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-pink-900">
            <input type="checkbox" checked={formData.instagramAutoReply} onChange={e => setFormData({ ...formData, instagramAutoReply: e.target.checked })} />
            Permitir que este bloque responda en Instagram
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-pink-900">
            <input type="checkbox" checked={formData.instagramCommentReply} onChange={e => setFormData({ ...formData, instagramCommentReply: e.target.checked })} />
            Responder comentarios públicos por mensaje privado
          </label>
          {formData.instagramCommentReply && <p className="text-xs text-gray-600">Si el comentario contiene una frase, Mila envía un único mensaje privado (hasta 7 días después del comentario). Los comentarios sin coincidencia quedan en la Bandeja. Nunca incluye datos de inscripciones.</p>}
          {needsKeywords && (
            <>
              <label className="block text-sm font-medium text-gray-800" htmlFor="instagramKeywords">Frases que activan este bloque</label>
              <textarea id="instagramKeywords" value={keywordText} onChange={e => setKeywordText(e.target.value)} rows={2} placeholder="camisa, cuellos, fecha del curso (mínimo 3 letras)" className="w-full rounded-xl border border-gray-200 p-3 text-sm" />
              <p className="text-xs text-gray-600">Separá las frases con comas o saltos de línea. Solo el contenido de los bloques coincidentes se envía a Gemini.</p>
              {formData.instagramAutoReply && (<>
              <label className="flex items-center gap-3 text-sm text-pink-900">
                <input type="checkbox" checked={formData.instagramEnrollmentLookup} onChange={e => setFormData({ ...formData, instagramEnrollmentLookup: e.target.checked })} />
                Permitir consulta de inscripciones en este tema
              </label>
              {formData.instagramEnrollmentLookup && <p className="text-xs text-amber-800">La consulta compara email y celular, pero no verifica por un segundo factor. Se muestra solo curso y estado registrado.</p>}
              </>)}
            </>
          )}
        </div>
      </form>
    </GlobalModal>
  );
};

export default InstructionModal;
