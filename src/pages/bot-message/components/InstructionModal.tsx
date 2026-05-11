import React, { useState, useEffect } from 'react';
import { BotInstruction, BotInstructionFormData } from '../types';
import { FaSave, FaTimes } from 'react-icons/fa';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {instruction ? 'Editar Bloque de Instrucción' : 'Nuevo Bloque de Instrucción'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Título de la Sección</label>
              <input 
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Mensaje de Bienvenida"
                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Orden de Ensamblado</label>
              <input 
                type="number"
                required
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
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
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <p className="text-[10px] text-gray-400 italic">
              * Los saltos de línea y emojis serán preservados por el sistema de sanitización.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
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

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            <FaSave /> {loading ? 'Guardando...' : 'Guardar Instrucción'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
