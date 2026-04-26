import { type FC, Fragment } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { HiClipboardCheck, HiX, HiExclamation } from 'react-icons/hi';

interface ClosureConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  closureDate: string;
  isProcessing: boolean;
}

const ClosureConfirmationModal: FC<ClosureConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  closureDate,
  isProcessing
}) => {
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
              <DialogPanel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white p-8 sm:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
                      <HiExclamation className="w-8 h-8" />
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-all"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>

                  <DialogTitle as="h3" className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                    Confirmar Cierre Mensual
                  </DialogTitle>
                  
                  <div className="space-y-4 mb-10">
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                      ¿Estás seguro de que deseas realizar el cierre mensual al <span className="text-gray-900 font-bold">{new Date(closureDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>?
                    </p>
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                      <p className="text-sm text-indigo-700 font-bold leading-relaxed flex items-center gap-2">
                        <HiClipboardCheck className="w-5 h-5 flex-shrink-0" />
                        Esta acción generará el reporte contable y reiniciará el ciclo de pagos para el próximo período.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                      disabled={isProcessing}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      disabled={isProcessing}
                      className={`flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isProcessing ? 'opacity-50' : ''
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <HiClipboardCheck className="w-6 h-6" />
                      )}
                      Confirmar Cierre
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ClosureConfirmationModal;
