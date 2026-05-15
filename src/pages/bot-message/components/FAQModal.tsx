import React, { useState, useEffect } from 'react';
import GlobalModal from '../../../components/shared/GlobalModal';
import { FAQFormData } from '../../faq/types';
import { FaSave, FaQuestionCircle } from 'react-icons/fa';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FAQFormData) => void;
  initialQuestion: string;
  loading: boolean;
}

const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialQuestion,
  loading
}) => {
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
    category: 'general',
    status: 'active',
    order: 0,
    iconName: 'HelpCircle'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        question: initialQuestion,
        answer: '',
        category: 'general',
        status: 'active',
        order: 0,
        iconName: 'HelpCircle'
      });
    }
  }, [initialQuestion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Entrenar a Mila AI"
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
            disabled={loading || !formData.question.trim() || !formData.answer.trim()}
            className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave /> {loading ? 'Guardando...' : 'Guardar en FAQ'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-center">
          <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
            <FaQuestionCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">Nueva Pregunta Frecuente</p>
            <p className="text-xs text-indigo-700">Convierte este mensaje en conocimiento para que Mila responda automáticamente en el futuro.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Pregunta identificada</label>
            <input 
              type="text"
              required
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              placeholder="¿Cómo puedo comprar?"
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200 shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Respuesta oficial de Mila</label>
            <textarea 
              required
              rows={5}
              value={formData.answer}
              onChange={e => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Escribe la respuesta que Mila dará..."
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none border-gray-200 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Categoría</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200 shadow-sm bg-white"
              >
                <option value="general">General</option>
                <option value="purchase-process">Proceso de Compra</option>
                <option value="courses">Cursos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Orden (Prioridad)</label>
              <input 
                type="number"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200 shadow-sm"
              />
            </div>
          </div>
        </form>
      </div>
    </GlobalModal>
  );
};

export default FAQModal;
