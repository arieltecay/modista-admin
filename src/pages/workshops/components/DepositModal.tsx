import { type FC, useState, useEffect, FormEvent, Fragment } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import toast from 'react-hot-toast';
import { HiCurrencyDollar, HiX, HiCheck } from 'react-icons/hi';

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

  useEffect(() => {
    if (isOpen) {
      setAmount(inscription?.depositAmount > 0 ? String(inscription.depositAmount) : '');
    }
  }, [inscription, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast.error('Por favor, ingresa un monto válido.');
      return;
    }
    onSubmit(inscription._id, num);
  };

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
              <DialogPanel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-white p-8 sm:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                      <HiCurrencyDollar className="w-8 h-8" />
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>

                  <DialogTitle as="h3" className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                    Registrar Seña
                  </DialogTitle>
                  <p className="text-gray-500 font-medium text-lg mb-8">
                    Alumno: <span className="text-gray-900 font-bold uppercase">{inscription?.nombre} {inscription?.apellido}</span>
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Monto de la Seña</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          className="w-full pl-12 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all text-2xl font-black text-gray-900 shadow-inner"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <HiCheck className="w-6 h-6" />
                        )}
                        Confirmar
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

export default DepositModal;
