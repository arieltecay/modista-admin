import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';
import { HiArrowUp, HiArrowDown, HiCheckCircle, HiClock, HiCurrencyDollar, HiReply, HiTrash } from 'react-icons/hi';
import type { WorkshopInscription, WorkshopSortConfig, Turno } from '../types';

interface WorkshopInscriptionsTableProps {
  inscriptions: WorkshopInscription[];
  loading: boolean;
  handlePaymentStatusUpdate: (id: string, status: 'paid' | 'pending') => Promise<void>;
  sortConfig: WorkshopSortConfig;
  handleSort: (key: string) => void;
  onDepositClick: (inv: WorkshopInscription) => void;
  onDeleteClick: (id: string, name: string) => void;
}

const WorkshopInscriptionsTable: FC<WorkshopInscriptionsTableProps> = ({ 
  inscriptions, 
  loading, 
  handlePaymentStatusUpdate, 
  sortConfig, 
  handleSort, 
  onDepositClick,
  onDeleteClick
}) => {
  if (loading) return (
    <div className="p-24 flex flex-col items-center justify-center bg-white rounded-[2rem]">
      <Spinner />
      <p className="mt-4 text-gray-400 font-bold animate-pulse">Actualizando lista...</p>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <HiArrowUp className="inline w-3 h-3 ml-1" /> : <HiArrowDown className="inline w-3 h-3 ml-1" />;
  };

  const getTurnoInfo = (turnoId: string | Turno | undefined) => {
    if (!turnoId || typeof turnoId === 'string') return '-';
    return `${turnoId.diaSemana} ${turnoId.horaInicio}hs`;
  };
  
  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th 
              className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSort('nombre')}
            >
              Nombre {getSortIcon('nombre')}
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Contacto
            </th>
            <th 
              className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSort('fechaInscripcion')}
            >
              Fecha Inscr. {getSortIcon('fechaInscripcion')}
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Horario
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Precio
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Pagado
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Saldo
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Estado
            </th>
            <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inscriptions.map((inv) => {
            const totalPaid = inv.totalPaid || inv.depositAmount || 0;
            const balance = Math.max(0, inv.coursePrice - totalPaid);
            
            return (
              <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {inv.nombre} {inv.apellido}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-xs text-gray-600 font-bold">{inv.email}</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">{inv.celular}</div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-gray-400">
                  {formatDate(inv.fechaInscripcion)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-xs text-indigo-600 font-black bg-indigo-50 px-2.5 py-1 rounded-lg inline-block border border-indigo-100/50 uppercase tracking-tighter">
                    {getTurnoInfo(inv.turnoId)}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-xs font-bold text-gray-500">
                  {formatCurrency(inv.coursePrice)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-emerald-600 tracking-tighter">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-red-500 tracking-tighter">
                  {balance > 0 ? formatCurrency(balance) : '-'}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                    inv.paymentStatus === 'paid' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : inv.paymentStatus === 'partial'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {inv.paymentStatus === 'paid' ? 'PAGADO' : inv.paymentStatus === 'partial' ? 'PARCIAL' : 'PENDIENTE'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inv.paymentStatus === 'paid' ? (
                      <button 
                        onClick={() => handlePaymentStatusUpdate(inv._id, 'pending')} 
                        className="p-2.5 text-gray-400 bg-gray-50 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                        title="Revertir a Pendiente"
                      >
                        <HiReply className="w-4 h-4" />
                        Revertir
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePaymentStatusUpdate(inv._id, 'paid')} 
                        className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                        title="Confirmar Pago Total"
                      >
                        <HiCheckCircle className="w-4 h-4" />
                        Pagado
                      </button>
                    )}
                    <button 
                      onClick={() => onDepositClick(inv)} 
                      className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                      title="Registrar Pago Parcial / Seña"
                    >
                      <HiCurrencyDollar className="w-4 h-4" />
                      Seña
                    </button>
                    <button 
                      onClick={() => onDeleteClick(inv._id, `${inv.nombre} ${inv.apellido}`)} 
                      className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                      title="Eliminar Inscripción"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                    </div>
                    </td>              </tr>
            );
          })}
          {inscriptions.length === 0 && (
            <tr>
              <td colSpan={9} className="px-8 py-24 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                  <HiClock className="w-10 h-10" />
                </div>
                <p className="text-gray-400 font-bold text-lg tracking-tight">No se encontraron inscriptos para este taller.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkshopInscriptionsTable;
