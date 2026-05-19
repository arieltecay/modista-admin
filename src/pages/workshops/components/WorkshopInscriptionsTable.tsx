import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';
import { HiArrowUp, HiArrowDown, HiClock, HiCurrencyDollar, HiTrash } from 'react-icons/hi';
import type { WorkshopInscription, WorkshopSortConfig, Turno } from '../types';
import { formatDateTime } from '@/utils/date-utils';

interface WorkshopInscriptionsTableProps {
  inscriptions: WorkshopInscription[];
  loading: boolean;
  sortConfig: WorkshopSortConfig;
  handleSort: (key: string) => void;
  onManagePaymentClick: (inv: WorkshopInscription) => void;
  onDeleteClick: (id: string, name: string) => void;
  lastMonthlyClosureDate?: string;
}

const WorkshopInscriptionsTable: FC<WorkshopInscriptionsTableProps> = ({ 
  inscriptions, 
  loading, 
  sortConfig, 
  handleSort, 
  onManagePaymentClick,
  onDeleteClick,
  lastMonthlyClosureDate
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

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <HiArrowUp className="inline w-3 h-3 ml-1" /> : <HiArrowDown className="inline w-3 h-3 ml-1" />;
  };

  const getTurnoInfo = (turnoId: string | Turno | undefined) => {
    if (!turnoId || typeof turnoId === 'string') return '-';
    return `${turnoId.diaSemana} ${turnoId.horaInicio}hs`;
  };

  const getEffectiveStartDate = () => {
    if (lastMonthlyClosureDate) {
      const d = new Date(lastMonthlyClosureDate);
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const startDate = getEffectiveStartDate();
  
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
              Pagado Ciclo
            </th>
            <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Saldo
            </th>
            <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inscriptions.map((inv) => {
            const paidInCycle = inv.paymentHistory
              ? inv.paymentHistory
                  .filter(p => new Date(p.date) >= startDate)
                  .reduce((sum, p) => sum + p.amount, 0)
              : 0;

            const balance = Math.max(0, inv.coursePrice - paidInCycle);
            
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
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400">
                      {formatDateTime(inv.fechaInscripcion).date}
                    </span>
                    <span className="text-[10px] font-medium text-gray-300">
                      {formatDateTime(inv.fechaInscripcion).time}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-xs text-indigo-600 font-black bg-indigo-50 px-2.5 py-1 rounded-lg inline-block border border-indigo-100/50 uppercase tracking-tighter">
                    {getTurnoInfo(inv.turnoId)}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-black text-emerald-600 tracking-tighter">
                  {formatCurrency(paidInCycle)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  {balance > 0 ? (
                    <span className="text-sm font-black text-red-500 tracking-tighter">
                      {formatCurrency(balance)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest">
                      PAGADO
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onManagePaymentClick(inv)} 
                      className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                      title="Gestionar Pago"
                    >
                      <HiCurrencyDollar className="w-4 h-4" />
                      Gestionar Pago
                    </button>
                    <button 
                      onClick={() => onDeleteClick(inv._id, `${inv.nombre} ${inv.apellido}`)} 
                      className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                      title="Eliminar Inscripción"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {inscriptions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-8 py-24 text-center">
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
