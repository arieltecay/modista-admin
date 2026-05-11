import React, { useState, useEffect } from 'react';
import { BotInstruction, BotInstructionFormData } from '../types';
import { botInstructionService } from '../../../services/bot-instruction/botInstructionService';
import InstructionCard from '../components/InstructionCard';
import InstructionModal from '../components/InstructionModal';
import { FaPlus, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

const TrainingTab: React.FC = () => {
  const [instructions, setInstructions] = useState<BotInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<BotInstruction | null>(null);

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    setLoading(true);
    try {
      const response = await botInstructionService.getInstructions();
      // Asegurar que siempre sea un array
      setInstructions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando instrucciones", error);
      setInstructions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: BotInstructionFormData) => {
    setModalLoading(true);
    try {
      if (editingInstruction) {
        await botInstructionService.updateInstruction(editingInstruction._id, data);
      } else {
        await botInstructionService.createInstruction(data);
      }
      await loadInstructions();
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al guardar la instrucción");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta sección de entrenamiento?")) return;
    try {
      await botInstructionService.deleteInstruction(id);
      await loadInstructions();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const openModal = (inst?: BotInstruction) => {
    setEditingInstruction(inst || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
        <FaLightbulb className="mt-1 flex-shrink-0" />
        <div>
          <p className="font-bold text-sm">Consejo de Entrenamiento</p>
          <p className="text-xs">Divide las instrucciones por temas (Identidad, Ventas, Políticas). El bot unirá todas las secciones activas en orden numérico para formar su "cerebro".</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          Instrucciones de Mila AI ({instructions?.length || 0})
        </h2>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FaPlus /> Nuevo Bloque
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (instructions?.length || 0) > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructions.map(inst => (
            <InstructionCard 
              key={inst._id}
              instruction={inst}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
          <FaExclamationTriangle size={40} className="mb-4 text-gray-300" />
          <p>No hay instrucciones configuradas.</p>
          <p className="text-sm">El bot usará su personalidad por defecto hasta que crees un bloque.</p>
        </div>
      )}

      <InstructionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        instruction={editingInstruction}
        loading={modalLoading}
      />
    </div>
  );
};

export default TrainingTab;
