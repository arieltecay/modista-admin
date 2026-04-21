import { type FC, Fragment } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import Spinner from '@/components/shared/Spinner';

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
          <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <DialogTitle as="h3" className="text-xl font-bold text-gray-900 leading-6">
                        Confirmar Cierre Mensual
                      </DialogTitle>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 leading-relaxed">
                          ¿Estás seguro de que deseas realizar el cierre mensual al <span className="font-bold text-gray-800">{new Date(closureDate).toLocaleDateString()}</span>?
                        </p>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          Esta acción generará el reporte contable y reiniciará el ciclo de pagos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                  <button
                    type="button"
                    disabled={isProcessing}
                    className="inline-flex w-full justify-center rounded-xl px-6 py-2.5 bg-indigo-600 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onConfirm}
                  >
                    {isProcessing ? 'Procesando...' : 'Confirmar Cierre'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-6 py-2.5 text-base font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </button>
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
