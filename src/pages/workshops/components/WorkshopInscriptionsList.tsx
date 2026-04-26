import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';
import { HiCheckCircle, HiClock, HiCurrencyDollar, HiReply, HiMail, HiPhone, HiCalendar, HiTrash } from 'react-icons/hi';
import type { WorkshopInscription, Turno } from '../types';

interface WorkshopInscriptionsListProps {
  inscriptions: WorkshopInscription[];
  loading: boolean;
  handlePaymentStatusUpdate: (id: string, status: 'paid' | 'pending') => Promise<void>;
  onDepositClick: (inv: WorkshopInscription) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const WorkshopInscriptionsList: FC<WorkshopInscriptionsListProps> = ({ 
  inscriptions, 
  loading, 
  handlePaymentStatusUpdate, 
  onDepositClick,
  onDeleteClick
}) => {
  if (loading) return (
    <div className="p-12 flex justify-center bg-white rounded-[2rem] shadow-sm m-4">
      <Spinner />
    </div>
  );
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const getTurnoInfo = (turnoId: string | Turno | undefined) => {
    if (!turnoId || typeof turnoId === 'string') return '-';
    return `${turnoId.diaSemana} ${turnoId.horaInicio}hs`;
  };

  return (
    <div className="md:hidden space-y-6 p-4">
      {inscriptions.map((inv) => {
        const totalPaid = inv.totalPaid || inv.depositAmount || 0;
        const balance = Math.max(0, inv.coursePrice - totalPaid);
        
        return (
          <div key={inv._id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg leading-tight">
                  {inv.nombre} {inv.apellido}
                </h3>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                    <HiMail className="w-3.5 h-3.5" />
                    {inv.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                    <HiPhone className="w-3.5 h-3.5" />
                    {inv.celular}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                inv.paymentStatus === 'paid' 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : inv.paymentStatus === 'partial'
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {inv.paymentStatus === 'paid' ? 'PAGADO' : inv.paymentStatus === 'partial' ? 'PARCIAL' : 'PENDIENTE'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6 p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <HiCalendar className="w-3 h-3" /> Horario
                </p>
                <p className="text-xs font-black text-indigo-600 uppercase">
                  {getTurnoInfo(inv.turnoId)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <HiCurrencyDollar className="w-3 h-3" /> Pagado
                </p>
                <p className="text-sm font-black text-emerald-600 tracking-tighter">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              {balance > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo</p>
                  <p className="text-sm font-black text-red-500 tracking-tighter">
                    {formatCurrency(balance)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {inv.paymentStatus === 'paid' ? (
                <button 
                  onClick={() => handlePaymentStatusUpdate(inv._id, 'pending')} 
                  className="flex-1 bg-white border border-gray-200 text-gray-400 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <HiReply className="w-4 h-4" />
                  Revertir
                </button>
              ) : (
                <button 
                  onClick={() => handlePaymentStatusUpdate(inv._id, 'paid')} 
                  className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  <HiCheckCircle className="w-4 h-4" />
                  Pagado
                </button>
              )}
              <button 
                onClick={() => onDepositClick(inv)} 
                className="flex-1 bg-indigo-50 text-indigo-700 border border-indigo-100 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <HiCurrencyDollar className="w-4 h-4" />
                Seña
              </button>
              <button 
                onClick={() => onDeleteClick(inv._id, `${inv.nombre} ${inv.apellido}`)} 
                className="bg-red-50 text-red-600 border border-red-100 p-3.5 rounded-xl active:scale-95 transition-all"
                title="Eliminar Inscripción"
              >
                <HiTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
      {inscriptions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 m-4">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
            <HiClock className="w-8 h-8" />
          </div>
          <p className="text-gray-400 font-bold tracking-tight">No se encontraron inscriptos.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopInscriptionsList;
