import Spinner from '@/components/shared/Spinner';

const WorkshopInscriptionsList = ({ inscriptions, loading, handlePaymentStatusUpdate, onDepositClick }: any) => {
  if (loading) return <div className="p-10 flex justify-center"><Spinner /></div>;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  return (
    <div className="md:hidden space-y-4 p-4">
      {inscriptions.map((inv: any) => {
        const totalPaid = inv.totalPaid || inv.depositAmount || 0;
        const balance = Math.max(0, inv.coursePrice - totalPaid);
        
        return (
          <div key={inv._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-tight">{inv.nombre} {inv.apellido}</h3>
                <p className="text-[11px] text-gray-400 font-medium">{inv.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                inv.paymentStatus === 'paid' 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : inv.paymentStatus === 'partial'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {inv.paymentStatus === 'paid' ? 'PAGADO' : inv.paymentStatus === 'partial' ? 'PARCIAL' : 'PENDIENTE'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-50">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Horario</p>
                <p className="text-xs font-semibold text-gray-700">{inv.turnoId?.diaSemana} {inv.turnoId?.horaInicio}hs</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pagado</p>
                <p className="text-xs font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
              </div>
              {balance > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo</p>
                  <p className="text-xs font-bold text-red-500">{formatCurrency(balance)}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handlePaymentStatusUpdate(inv._id, inv.paymentStatus === 'paid' ? 'pending' : 'paid')} 
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                {inv.paymentStatus === 'paid' ? 'Revertir' : 'Pagado'}
              </button>
              <button 
                onClick={() => onDepositClick(inv)} 
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all active:scale-95"
              >
                Seña
              </button>
            </div>
          </div>
        );
      })}
      {inscriptions.length === 0 && (
        <div className="text-center py-10 text-gray-400 font-medium">
          No se encontraron inscriptos.
        </div>
      )}
    </div>
  );
};
export default WorkshopInscriptionsList;
