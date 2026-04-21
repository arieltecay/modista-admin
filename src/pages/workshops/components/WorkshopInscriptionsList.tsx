import type { FC } from 'react';
import Spinner from '@/components/shared/Spinner';

const WorkshopInscriptionsList = ({ inscriptions, loading, handlePaymentStatusUpdate, onDepositClick }: any) => {
  if (loading) return <div className="p-10 flex justify-center"><Spinner /></div>;
  return (
    <div className="md:hidden space-y-4 p-4">
      {inscriptions.map((inv: any) => (
        <div key={inv._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">{inv.nombre} {inv.apellido}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>{inv.paymentStatus}</span>
          </div>
          <div className="text-xs text-gray-500 mb-4">{inv.turnoId?.diaSemana} - {inv.turnoId?.horaInicio}hs</div>
          <div className="flex gap-2">
            <button onClick={() => handlePaymentStatusUpdate(inv._id, 'paid')} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold">Pago</button>
            <button onClick={() => onDepositClick(inv)} className="flex-1 border py-2 rounded-lg text-xs font-bold">Seña</button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default WorkshopInscriptionsList;
