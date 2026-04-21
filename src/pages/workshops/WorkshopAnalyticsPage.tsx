import { useEffect, useState, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkshopDetails, deleteWorkshopInscription } from '@/services/inscriptions/workshopInscriptionService';
import { WorkshopDetailsResponse } from '@/services/inscriptions/types';
import Spinner from '@/components/shared/Spinner';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import PaymentHistoryModal from '@/components/shared/PaymentHistoryModal';

const WorkshopAnalyticsPage: FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WorkshopDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedForHistory, setSelectedForHistory] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    if (!workshopId) return;
    try {
      setLoading(true);
      const res = await getWorkshopDetails(workshopId);
      setData(res);
    } catch { toast.error('Error al cargar datos'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [workshopId]);

  if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <button onClick={() => navigate(-1)} className="text-gray-500 mb-2">← Volver</button>
          <h1 className="text-2xl font-bold">{data.workshopTitle}</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8 text-center">
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-500">Pagos Totales</p><p className="text-3xl font-bold text-blue-600">{data.summary.totalPaidCount}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-sm text-gray-500">Parciales</p><p className="text-3xl font-bold text-green-600">{data.summary.partialPaidCount}</p></div>
      </div>

      <div className="space-y-6">
        {data.turnoGroups.map(g => (
          <div key={g.turnoId} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold">{g.turnoLabel} ({g.enrolled}/{g.capacity})</div>
            <table className="w-full text-left text-sm">
              <tbody>{g.inscriptions.map(i => (
                <tr key={i._id} className="border-t">
                  <td className="p-4 font-semibold">{i.nombre} {i.apellido}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">{i.isFullPayment ? 'Pago Total' : 'Parcial'}</span></td>
                  <td className="p-4 text-right font-mono">${i.totalPaid}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setSelectedForHistory({ inscriptionId: i._id, studentName: `${i.nombre} ${i.apellido}`, coursePrice: data.workshopPrice }); setIsHistoryModalOpen(true); }} className="text-blue-600 mr-4 font-bold text-xs">Pagos</button>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: i._id, name: `${i.nombre} ${i.apellido}` })} className="text-red-500 font-bold text-xs">Eliminar</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ))}
      </div>

      <ConfirmDeleteModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={async () => { await deleteWorkshopInscription(deleteModal.id); fetchData(); }} itemName={deleteModal.name} itemType="alumno" isDeleting={isDeleting} />
      {selectedForHistory && <PaymentHistoryModal isOpen={isHistoryModalOpen} onClose={() => { setIsHistoryModalOpen(false); fetchData(); }} inscriptionId={selectedForHistory.inscriptionId} studentName={selectedForHistory.studentName} coursePrice={selectedForHistory.coursePrice} />}
    </div>
  );
};

export default WorkshopAnalyticsPage;
