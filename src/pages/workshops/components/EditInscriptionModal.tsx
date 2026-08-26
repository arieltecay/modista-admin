import { type FC, useState, useEffect, FormEvent, Fragment } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import toast from 'react-hot-toast';
import { HiX, HiCheck, HiPencil } from 'react-icons/hi';
import { updateWorkshopInscriptionPersonalData } from '@/services/inscriptions/workshopInscriptionService';
import type { WorkshopInscription } from '../types';

interface EditInscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inscription: WorkshopInscription;
  onSuccess: () => Promise<void>;
}

const EditInscriptionModal: FC<EditInscriptionModalProps> = ({ isOpen, onClose, inscription, onSuccess }) => {
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [celular, setCelular] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && inscription) {
      setNombre(inscription.nombre || '');
      setApellido(inscription.apellido || '');
      setEmail(inscription.email || '');
      setCelular(inscription.celular || '');
    }
  }, [isOpen, inscription]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedNombre = nombre.trim();
    const trimmedApellido = apellido.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCelular = celular.trim();

    if (!trimmedNombre || !trimmedApellido || !trimmedEmail || !trimmedCelular) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Por favor, introduce un email válido');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateWorkshopInscriptionPersonalData(inscription._id, {
        nombre: trimmedNombre,
        apellido: trimmedApellido,
        email: trimmedEmail,
        celular: trimmedCelular,
      });
      toast.success('Datos actualizados y mail de confirmación reenviado');
      await onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al actualizar los datos');
    } finally {
      setIsSubmitting(false);
    }
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
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <DialogTitle as="h3" className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                        Editar Datos Personales
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
                        <input
                          type="text"
                          value={nombre}
                          onChange={e => setNombre(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                          placeholder="Nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
                        <input
                          type="text"
                          value={apellido}
                          onChange={e => setApellido(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                          placeholder="Apellido"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Celular</label>
                      <input
                        type="tel"
                        value={celular}
                        onChange={e => setCelular(e.target.value)}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-gray-900"
                        placeholder="+54 9 11 1234 5678"
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
                            Guardar cambios
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

export default EditInscriptionModal;