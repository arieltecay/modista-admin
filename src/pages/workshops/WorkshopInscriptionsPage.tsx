import { type FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkshopInscriptions } from '@/services/inscriptions/workshopInscriptionService';
import { updateInscriptionPaymentStatus } from '@/services/inscriptions/inscriptionService';
import { sendPaymentSuccessEmail } from '@/services/email/emailService';
import { getCourseById } from '@/services/courses/coursesService';
import { getTurnosByCourse } from '@/services/turnos/turnoService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import DepositModal from '@/pages/workshops/components/DepositModal';
import WorkshopInscriptionsTable from '@/pages/workshops/components/WorkshopInscriptionsTable';
import WorkshopInscriptionsList from '@/pages/workshops/components/WorkshopInscriptionsList';
import Pagination from '@/components/shared/Pagination';
import type { WorkshopCourse, WorkshopInscription, Turno, WorkshopSortConfig } from '../types';

const WorkshopInscriptionsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [inscriptions, setInscriptions] = useState<WorkshopInscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [turnoFilter, setTurnoFilter] = useState<string>('all');
  const [availableTurnos, setAvailableTurnos] = useState<Turno[]>([]);
  const [sortConfig, setSortConfig] = useState<WorkshopSortConfig>({ key: 'fechaInscripcion', direction: 'desc' });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<WorkshopInscription | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const currentCourse: any = await getCourseById(id);
        setCourse(currentCourse);
        const { data: turnos } = await getTurnosByCourse(id, { includeBlocked: true });
        setAvailableTurnos(turnos || []);
        const response: any = await getWorkshopInscriptions(id, { page: currentPage, limit: itemsPerPage, sortBy: sortConfig.key, sortOrder: sortConfig.direction, search: searchTerm, paymentStatusFilter: paymentFilter, turnoFilter: turnoFilter !== 'all' ? turnoFilter : undefined });
        setInscriptions(response.data || []);
        setTotalItems(response.total || 0);
      } catch (e) { toast.error('Error al cargar datos'); } finally { setLoading(false); }
    };
    fetchData();
  }, [id, currentPage, itemsPerPage, searchTerm, paymentFilter, turnoFilter, sortConfig]);

  const handlePaymentStatusUpdate = async (insId: string, status: 'paid' | 'pending') => {
    try {
      await updateInscriptionPaymentStatus(insId, status);
      setInscriptions(prev => prev.map(i => i._id === insId ? { ...i, paymentStatus: status } : i));
      if (status === 'paid') {
        const ins = inscriptions.find(i => i._id === insId);
        if (ins) await sendPaymentSuccessEmail(ins as any);
      }
      toast.success('Estado actualizado');
    } catch (e) { toast.error('Error'); }
  };

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  if (loading && !course) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8">
        <button onClick={() => navigate('/admin/workshops')} className="text-gray-500 mb-4 flex items-center">← Volver</button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{course?.title}</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/admin/workshops/${id}/schedule`)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Agenda</button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          <input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 border p-2 rounded" />
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value as any)} className="border p-2 rounded">
            <option value="all">Todos</option>
            <option value="paid">Pagados</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>

        <WorkshopInscriptionsTable inscriptions={inscriptions} loading={loading} handlePaymentStatusUpdate={handlePaymentStatusUpdate} sortConfig={sortConfig} handleSort={handleSort} onDepositClick={(i: any) => { setSelectedInscription(i); setIsDepositModalOpen(true); }} />
        <WorkshopInscriptionsList inscriptions={inscriptions} loading={loading} handlePaymentStatusUpdate={handlePaymentStatusUpdate} onDepositClick={(i: any) => { setSelectedInscription(i); setIsDepositModalOpen(true); }} />

        <div className="p-4">
          <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} totalItems={totalItems} itemsPerPage={itemsPerPage} handlePrevPage={() => setCurrentPage(p => p - 1)} handleNextPage={() => setCurrentPage(p => p + 1)} handleItemsPerPageChange={e => setItemsPerPage(Number(e.target.value))} />
        </div>
      </div>

      {selectedInscription && <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} onSubmit={async () => {}} inscription={selectedInscription} isSubmitting={false} />}
    </div>
  );
};

export default WorkshopInscriptionsPage;
