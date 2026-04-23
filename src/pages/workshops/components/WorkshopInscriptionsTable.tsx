import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

const WorkshopInscriptionsTable = ({ inscriptions, loading, handlePaymentStatusUpdate, sortConfig, handleSort, onDepositClick }: any) => {
  if (loading) return <div className="p-20 flex justify-center"><Spinner /></div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <HiArrowUp className="inline w-3 h-3" /> : <HiArrowDown className="inline w-3 h-3" />;
  };
  
  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th 
              className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSort('nombre')}
            >
              Nombre {getSortIcon('nombre')}
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Contacto
            </th>
            <th 
              className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSort('fechaInscripcion')}
            >
              Fecha Inscr. {getSortIcon('fechaInscripcion')}
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Horario
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Precio
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Pagado
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Saldo
            </th>
            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Estado
            </th>
            <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {inscriptions.map((inv: any) => {
            const totalPaid = inv.totalPaid || inv.depositAmount || 0;
            const balance = Math.max(0, inv.coursePrice - totalPaid);
            
            return (
              <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                    {inv.nombre} {inv.apellido}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-[13px] text-gray-600 font-medium">{inv.email}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{inv.celular}</div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-[13px] text-gray-500">
                  {formatDate(inv.fechaInscripcion)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-[13px] text-gray-700 font-medium">
                    {inv.turnoId?.diaSemana} {inv.turnoId?.horaInicio}hs
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-[13px] font-semibold text-gray-600">
                  {formatCurrency(inv.coursePrice)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-[13px] font-bold text-emerald-600">
                  {formatCurrency(totalPaid)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-[13px] font-bold text-red-500">
                  {balance > 0 ? formatCurrency(balance) : '-'}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                    inv.paymentStatus === 'paid' 
                      ? 'bg-green-50 text-green-600 border border-green-100' 
                      : inv.paymentStatus === 'partial'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {inv.paymentStatus === 'paid' ? 'PAGADO' : inv.paymentStatus === 'partial' ? 'PARCIAL' : 'PENDIENTE'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-4">
                    <button 
                      onClick={() => handlePaymentStatusUpdate(inv._id, inv.paymentStatus === 'paid' ? 'pending' : 'paid')} 
                      className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                    >
                      {inv.paymentStatus === 'paid' ? 'Revertir' : 'Pagado'}
                    </button>
                    <button 
                      onClick={() => onDepositClick(inv)} 
                      className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                    >
                      Seña
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {inscriptions.length === 0 && (
            <tr>
              <td colSpan={9} className="px-8 py-20 text-center text-gray-400 font-medium">
                No se encontraron inscriptos para este taller.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WorkshopInscriptionsTable;
