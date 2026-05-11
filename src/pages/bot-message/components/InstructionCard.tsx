import React from 'react';
import { BotInstruction } from '../types';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface InstructionCardProps {
  instruction: BotInstruction;
  onEdit: (inst: BotInstruction) => void;
  onDelete: (id: string) => void;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ instruction, onEdit, onDelete }) => {
  return (
    <div className={`p-4 bg-white border rounded-xl shadow-sm transition-all hover:shadow-md ${!instruction.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            #{instruction.order}
          </span>
          <h3 className="font-bold text-gray-800">{instruction.title}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(instruction)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => onDelete(instruction._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 line-clamp-3 mb-4 whitespace-pre-wrap">
        {instruction.content}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t">
        <div className="flex items-center gap-1 text-xs">
          {instruction.isActive ? (
            <span className="text-green-600 flex items-center gap-1 font-medium">
              <FaCheckCircle /> Activo
            </span>
          ) : (
            <span className="text-gray-400 flex items-center gap-1 font-medium">
              <FaTimesCircle /> Inactivo
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400">
          Orden: {instruction.order}
        </span>
      </div>
    </div>
  );
};

export default InstructionCard;
