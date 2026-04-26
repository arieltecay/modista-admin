import { FC, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPaymentHistory, addPayment, deletePayment, type PaymentHistoryData } from '@/services/inscriptions/inscriptionService';
import Spinner from '@/components/shared/Spinner';
import { TrashIcon } from '@heroicons/react/24/outline';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscriptionId: string;
  studentName: string;
  coursePrice: number;
}

const PaymentHistoryModal: FC<PaymentHistoryModalProps> = ({ isOpen, onClose, inscriptionId, studentName, coursePrice }) => {
  const [historyData, setHistoryData] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; amount: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = async () => {
    if (!inscriptionId) return;
    try {
      setLoading(true);
      const response = await getPaymentHistory(inscriptionId);
      setHistoryData(response.data);
    } catch (err) { toast.error('Error al cargar historial'); } finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) fetchHistory(); }, [isOpen, inscriptionId]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    try {
      setIsSubmitting(true);
      await addPayment(inscriptionId, { amount: num, paymentMethod, notes });
      toast.success('Pago registrado');
      setAmount(''); setPaymentMethod(''); setNotes('');
      onClose();
      fetchHistory();
    } catch (err) { toast.error('Error al registrar'); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <div><h2 className="text-xl font-bold">Historial de Pagos</h2><p className="text-sm text-gray-500">{studentName}</p></div>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </header>
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? <Spinner /> : historyData && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50"><tr><th className="p-2">Fecha</th><th className="p-2">Método</th><th className="p-2 text-right">Monto</th><th className="p-2 text-center"></th></tr></thead>
                  <tbody>{historyData.history.map((p: any) => (
                    <tr key={p._id} className="border-t"><td className="p-2">{new Date(p.date).toLocaleDateString()}</td><td className="p-2">{p.paymentMethod}</td><td className="p-2 text-right font-mono">${p.amount}</td><td className="p-2 text-center">
                      <button onClick={() => { setPaymentToDelete({ id: p._id, amount: p.amount }); setIsDeleteModalOpen(true); }} className="text-red-500"><TrashIcon className="h-4 w-4" /></button>
                    </td></tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="flex justify-around bg-gray-50 p-4 rounded-lg font-bold">
                <div><p className="text-xs text-gray-500">Total</p><p>${coursePrice}</p></div>
                <div><p className="text-xs text-gray-500">Pagado</p><p className="text-green-600">${historyData.totalPaid}</p></div>
              </div>
              <form onSubmit={handleAddPayment} className="space-y-4 border-t pt-4">
                <h3 className="font-bold">Nuevo Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Monto" value={amount} onChange={e => setAmount(e.target.value)} className="border p-2 rounded" required />
                  <input type="text" placeholder="Método" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="border p-2 rounded" />
                </div>
                <textarea placeholder="Notas" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border p-2 rounded" rows={2} />
                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">Registrar</button>
              </form>
            </>
          )}
        </div>
      </div>
      <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={async () => { await deletePayment(inscriptionId, paymentToDelete!.id); fetchHistory(); }} itemName={`$${paymentToDelete?.amount}`} itemType="el pago de" isDeleting={isDeleting} />
    </div>
  );
};
export default PaymentHistoryModal;
