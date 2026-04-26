import { useEffect, useState, type FC, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkshopDetails, deleteWorkshopInscription } from '@/services/inscriptions/workshopInscriptionService';
import { WorkshopDetailsResponse, WorkshopInscriptionItem } from '@/services/inscriptions/types';
import Spinner from '@/components/shared/Spinner';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import PaymentHistoryModal from '@/components/shared/PaymentHistoryModal';
import { 
  HiChevronLeft, 
  HiCalendar, 
  HiClipboardCheck, 
  HiUsers, 
  HiBadgeCheck, 
  HiCurrencyDollar, 
  HiUserGroup,
  HiCash,
  HiTrash
} from 'react-icons/hi';

// Tipos para los modales
interface HistoryModalInscription {
  inscriptionId: string;
  studentName: string;
  coursePrice: number;
}

const WorkshopAnalyticsPage: FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<WorkshopDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedForHistory, setSelectedForHistory] = useState<HistoryModalInscription | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, inscriptionId: '', studentName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!workshopId) {
      toast.error('No se ha especificado un ID de workshop.');
      navigate('/admin/workshops');
      return;
    }
    try {
      setLoading(true);
      const response = await getWorkshopDetails(workshopId);
      setData(response);
    } catch {
      setError('Error al cargar los detalles. Por favor, intenta de nuevo.');
      toast.error('Error al cargar los detalles del workshop.');
    } finally {
      setLoading(false);
    }
  }, [workshopId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para Modales ---
  
  const openHistoryModal = (inscription: HistoryModalInscription) => {
    setSelectedForHistory(inscription);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedForHistory(null);
    fetchData();
  };

  const handleDelete = (inscriptionId: string, studentName: string) => {
    setDeleteModal({ isOpen: true, inscriptionId, studentName });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteWorkshopInscription(deleteModal.inscriptionId);
      toast.success('Alumno eliminado correctamente.');
      await fetchData();
    } catch (err) {
      toast.error('No se pudo eliminar al alumno. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, inscriptionId: '', studentName: '' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  if (loading && !data) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><Spinner /></div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 bg-gray-50 min-h-screen flex items-center justify-center">{error || 'No se cargaron datos'}</div>;
  }

  const { workshopTitle, summary, turnoGroups } = data;

  return (
    <div className="p-4 sm:p-10 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <header className="mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 mb-6 flex items-center hover:text-indigo-600 transition-colors text-sm font-medium"
        >
          <HiChevronLeft className="w-5 h-5 mr-1" />
          Volver
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
              {workshopTitle} ✂️
            </h1>
            <p className="text-lg text-gray-500">Análisis de inscriptos y pagos por turnos.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate(`/admin/workshops/${workshopId}/schedule`)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <HiCalendar className="w-5 h-5 opacity-90" />
              Ver Agenda y Horarios
            </button>
            <button 
              onClick={() => navigate(`/admin/workshops/${workshopId}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <HiUsers className="w-5 h-5 opacity-90" />
              Ver Inscriptos y Pagos
            </button>
            <button 
              onClick={() => navigate(`/admin/workshops/closures/${workshopId}`)}
              className="flex items-center gap-2 bg-[#d1e7dd] hover:bg-[#c3e0d2] text-[#0f5132] px-6 py-3.5 rounded-xl text-sm font-bold border border-[#badbcc] transition-all active:scale-95"
            >
              <HiClipboardCheck className="w-5 h-5 opacity-90" />
              Cierre Mensual
            </button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600"><HiUserGroup className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Inscriptos</p>
                <p className="text-3xl font-black text-gray-900">{summary.totalInscriptions}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="bg-green-50 p-4 rounded-2xl text-green-600"><HiBadgeCheck className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pagos Completos</p>
                <p className="text-3xl font-black text-gray-900">{summary.totalPaidCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><HiCurrencyDollar className="w-8 h-8" /></div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Señas / Parciales</p>
                <p className="text-3xl font-black text-gray-900">{summary.partialPaidCount}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-10">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Turnos Programados</h2>
        
        {turnoGroups.length > 0 ? (
          turnoGroups.map((group) => (
            <div key={group.turnoId} className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-gray-900">
                  {group.turnoLabel} 
                  <span className="ml-3 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {group.enrolled} / {group.capacity} cupos
                  </span>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                      <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Estado del Pago</th>
                      <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Monto Pagado</th>
                      <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {group.inscriptions.map((insc: WorkshopInscriptionItem) => (
                      <tr key={insc._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                            {insc.nombre} {insc.apellido}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            insc.isFullPayment 
                              ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                              : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                            {insc.isFullPayment ? 'PAGO TOTAL' : 'PAGO PARCIAL'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap font-bold text-gray-900">
                          {formatCurrency(insc.totalPaid || 0)}
                        </td>
                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openHistoryModal({ inscriptionId: insc._id, studentName: `${insc.nombre} ${insc.apellido}`, coursePrice: data.workshopPrice })}
                              className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-95"
                              title="Registrar o Ver Pagos"
                            >
                              <HiCash className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(insc._id, `${insc.nombre} ${insc.apellido}`)}
                              className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-95"
                              title="Eliminar inscripción"
                            >
                              <HiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-gray-100 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiUsers className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold text-xl">No hay inscriptos para este taller.</p>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.studentName}
        itemType="alumno"
        isDeleting={isDeleting}
      />

      {selectedForHistory && (
        <PaymentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={closeHistoryModal}
          inscriptionId={selectedForHistory.inscriptionId}
          studentName={selectedForHistory.studentName}
          coursePrice={selectedForHistory.coursePrice}
        />
      )}
    </div>
  );
};

export default WorkshopAnalyticsPage;
