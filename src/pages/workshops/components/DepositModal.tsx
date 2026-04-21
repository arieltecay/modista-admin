import type { FC } from 'react';
import React, { useState, useEffect, FormEvent } from 'react';
import toast from 'react-hot-toast';

interface Inscription {
  _id: string;
  nombre: string;
  apellido: string;
  depositAmount: number;
  coursePrice: number;
  courseTitle: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inscriptionId: string, amount: number) => Promise<void>;
  inscription: Inscription;
  isSubmitting: boolean;
}

const DepositModal: FC<DepositModalProps> = ({ isOpen, onClose, onSubmit, inscription, isSubmitting }) => {
  const [amount, setAmount] = useState<string>('');
  useEffect(() => { setAmount(inscription?.depositAmount > 0 ? String(inscription.depositAmount) : ''); }, [inscription]);
  if (!isOpen) return null;
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { toast.error('Monto inválido'); return; }
    onSubmit(inscription._id, num);
  };
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Registrar Seña</h3>
        <p className="text-sm text-gray-600 mb-4">{inscription.nombre} {inscription.apellido}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border-2 p-3 rounded-xl font-bold" placeholder="0.00" autoFocus />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-600">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl">{isSubmitting ? '...' : 'Confirmar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default DepositModal;
