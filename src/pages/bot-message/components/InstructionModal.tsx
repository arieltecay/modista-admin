import React, { useState, useEffect } from 'react';
import { BotInstruction, BotInstructionFormData } from '../types';
import { FaSave } from 'react-icons/fa';
import GlobalModal from '../../../components/shared/GlobalModal';

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
    isActive: true
  });

  useEffect(() => {
    if (instruction) {
      setFormData({
        title: instruction.title,
        content: instruction.content,
        order: instruction.order,
        isActive: instruction.isActive
      });
    } else {
      setFormData({
        title: '',
        content: '',
        order: 0,
        isActive: true
      });
    }
  }, [instruction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={instruction ? 'Editar Bloque de Instrucción' : 'Nuevo Bloque de Instrucción'}
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
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave /> {loading ? 'Guardando...' : 'Guardar Instrucción'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Título de la Sección</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Mensaje de Bienvenida"
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Orden de Ensamblado</label>
            <input 
              type="number"
              required
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Contenido de la Instrucción</label>
          <textarea 
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
      </form>
    </GlobalModal>
  );
};

export default InstructionModal;
