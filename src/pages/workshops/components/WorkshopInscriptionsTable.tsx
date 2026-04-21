import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SortableHeader = ({ children, name, sortConfig, onSort }: any) => {
  const isSorted = sortConfig.key === name;
  return (
    <th className="px-5 py-4 border-b bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer" onClick={() => onSort(name)}>
      <div className="flex items-center">{children} {isSorted ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-gray-300" />}</div>
    </th>
  );
};

const WorkshopInscriptionsTable = ({ inscriptions, loading, handlePaymentStatusUpdate, sortConfig, handleSort, onDepositClick }: any) => {
  if (loading) return <div className="p-10 flex justify-center"><Spinner /></div>;
  return (
    <div className="overflow-x-auto hidden md:block">
      <table className="min-w-full">
        <thead>
          <tr>
            <SortableHeader name="nombre" sortConfig={sortConfig} onSort={handleSort}>Nombre</SortableHeader>
            <SortableHeader name="email" sortConfig={sortConfig} onSort={handleSort}>Contacto</SortableHeader>
            <SortableHeader name="turnoId" sortConfig={sortConfig} onSort={handleSort}>Horario</SortableHeader>
            <th className="px-5 py-4 border-b bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
            <th className="px-5 py-4 border-b bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inscriptions.map((inv: any) => (
            <tr key={inv._id} className="hover:bg-gray-50">
              <td className="px-5 py-4 border-b text-sm font-semibold">{inv.nombre} {inv.apellido}</td>
              <td className="px-5 py-4 border-b text-xs">{inv.email}<br/>{inv.celular}</td>
              <td className="px-5 py-4 border-b text-xs">
                {inv.turnoId?.diaSemana} {inv.turnoId?.horaInicio}hs
              </td>
              <td className="px-5 py-4 border-b">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${inv.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inv.paymentStatus === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                </span>
              </td>
              <td className="px-5 py-4 border-b flex gap-2">
                <button onClick={() => handlePaymentStatusUpdate(inv._id, inv.paymentStatus === 'paid' ? 'pending' : 'paid')} className="text-xs font-bold text-indigo-600">
                  {inv.paymentStatus === 'paid' ? 'Revertir' : 'Pagado'}
                </button>
                <button onClick={() => onDepositClick(inv)} className="text-xs font-bold text-indigo-600">Seña</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default WorkshopInscriptionsTable;
