import { type FC, useState, useEffect, FormEvent, Fragment } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import toast from 'react-hot-toast';
import { HiCurrencyDollar, HiX, HiCheck, HiTrash, HiCalendar } from 'react-icons/hi';
import { addPayment, deletePayment } from '@/services/inscriptions/inscriptionService';
import type { WorkshopInscription, Payment } from '../types';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscription: WorkshopInscription;
  onSuccess: () => Promise<void>;
  lastMonthlyClosureDate?: string;
}

const PaymentHistoryModal: FC<PaymentHistoryModalProps> = ({ isOpen, onClose, inscription, onSuccess, lastMonthlyClosureDate }) => {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('TRANSFERENCIA');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDate, setViewDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNotes('');
      // Por defecto, ver desde el último cierre o inicio de mes
      if (lastMonthlyClosureDate) {
        const d = new Date(lastMonthlyClosureDate);
        d.setDate(d.getDate() + 1);
        setViewDate(d.toISOString().split('T')[0]);
      } else {
        const now = new Date();
        setViewDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      }
    }
  }, [isOpen, lastMonthlyClosureDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error('Por favor, ingresa un monto válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPayment(inscription._id, { 
        amount: num, 
        paymentMethod: method, 
        notes 
      });
      toast.success('Pago registrado correctamente');
      setAmount('');
      setNotes('');
      await onSuccess();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este pago? Esta acción es irreversible.')) return;
    
    try {
      await deletePayment(inscription._id, paymentId);
      toast.success('Pago eliminado');
      await onSuccess();
    } catch (e) {
      toast.error('Error al eliminar el pago');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const filteredHistory = inscription.paymentHistory?.filter(p => {
    if (!viewDate) return true;
    return new Date(p.date) >= new Date(viewDate);
  }) || [];

  const totalPaidInRange = filteredHistory.reduce((sum, p) => sum + p.amount, 0);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white p-8 sm:p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <DialogTitle as="h3" className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                        Historial de Pagos
                      </DialogTitle>
                      <p className="text-gray-500 font-bold uppercase mt-1">{inscription.nombre} {inscription.apellido}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ver desde:</span>
                      <input 
                        type="date" 
                        value={viewDate} 
                        onChange={(e) => setViewDate(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto mb-8 pr-2">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-gray-100">
                          <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                          <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Método</th>
                          <th className="py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                          <th className="py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredHistory.map((p) => (
                          <tr key={p._id} className="group hover:bg-gray-50/50">
                            <td className="py-4 text-xs font-bold text-gray-500">
                              {new Date(p.date).toLocaleDateString('es-AR')}
                            </td>
                            <td className="py-4 text-xs font-bold text-gray-900 uppercase">
                              {p.paymentMethod || 'Manual'}
                            </td>
                            <td className="py-4 text-right text-sm font-black text-gray-900">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => p._id && handleDeletePayment(p._id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredHistory.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-10 text-center text-gray-400 text-sm font-medium italic">
                              No hay pagos registrados en este rango.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Curso</p>
                      <p className="text-xl font-black text-gray-900 tracking-tighter">{formatCurrency(inscription.coursePrice)}</p>
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Pagado (en este rango)</p>
                      <p className="text-xl font-black text-emerald-600 tracking-tighter">{formatCurrency(totalPaidInRange)}</p>
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-8" />

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Nuevo Pago</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Método</label>
                        <select 
                          value={method} 
                          onChange={e => setMethod(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                        >
                          <option value="TRANSFERENCIA">Transferencia</option>
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TARJETA">Tarjeta</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notas</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900 resize-none"
                        rows={2}
                        placeholder="Ej: Pago de la segunda cuota..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                      >
                        Cerrar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <HiCheck className="w-6 h-6" />
                            Registrar Pago
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PaymentHistoryModal;
