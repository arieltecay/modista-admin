import { type FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { getWorkshopInscriptions, getWorkshopDetails, deleteWorkshopInscription } from '@/services/inscriptions/workshopInscriptionService';
import { getCourseById } from '@/services/courses/coursesService';
import { getTurnosByCourse } from '@/services/turnos/turnoService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import PaymentHistoryModal from '@/pages/workshops/components/PaymentHistoryModal';
import WorkshopInscriptionsTable from '@/pages/workshops/components/WorkshopInscriptionsTable';
import WorkshopInscriptionsList from '@/pages/workshops/components/WorkshopInscriptionsList';
import Pagination from '@/components/shared/Pagination';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import type { WorkshopCourse, WorkshopInscription, Turno, WorkshopSortConfig } from './types';
import { HiCalendar, HiUsers, HiClipboardCheck, HiChevronLeft, HiCurrencyDollar } from 'react-icons/hi';

const WorkshopInscriptionsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [inscriptions, setInscriptions] = useState<WorkshopInscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [turnoFilter, setTurnoFilter] = useState<string>('all');
  const [availableTurnos, setAvailableTurnos] = useState<Turno[]>([]);
  const [sortConfig, setSortConfig] = useState<WorkshopSortConfig>({ key: 'fechaInscripcion', direction: 'desc' });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<WorkshopInscription | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, inscriptionId: '', studentName: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [courseData, turnosData, inscriptionsData] = await Promise.all([
        getCourseById(id),
        getTurnosByCourse(id, { includeBlocked: true }),
        getWorkshopInscriptions(id, { 
          page: currentPage, 
          limit: itemsPerPage, 
          sortBy: sortConfig.key, 
          sortOrder: sortConfig.direction, 
          search: debouncedSearchTerm, 
          turnoFilter: turnoFilter !== 'all' ? turnoFilter : undefined 
        })
      ]);

      setCourse(courseData as unknown as WorkshopCourse);
      setAvailableTurnos(turnosData.data || []);
      setInscriptions(inscriptionsData.data || []);
      setTotalItems(inscriptionsData.total || 0);
    } catch (e) { 
      toast.error('Error al cargar datos'); 
    } finally { 
      setLoading(false); 
    }
  }, [id, currentPage, itemsPerPage, debouncedSearchTerm, turnoFilter, sortConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
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

  if (loading && !course) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  const tabs = [
    { id: 'inscriptions', label: 'Inscriptos y Pagos', icon: HiUsers, path: `/admin/workshops/more-info/${id}` },
    { id: 'schedule', label: 'Agenda y Horarios', icon: HiCalendar, path: `/admin/workshops/${id}/schedule` },
    { id: 'closures', label: 'Cierre Mensual', icon: HiClipboardCheck, path: `/admin/workshops/closures/${id}` },
  ];

  const currentTab = tabs.find(t => location.pathname.includes(t.path))?.id || 'inscriptions';

  return (
    <div className="p-4 sm:p-10 max-w-[1600px] mx-auto">
      <header className="mb-10">
        <button 
          onClick={() => navigate('/admin/workshops')} 
          className="text-gray-500 mb-6 flex items-center hover:text-indigo-600 transition-colors text-sm font-medium"
        >
          <HiChevronLeft className="w-5 h-5 mr-1" />
          Volver a Cursos
        </button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
              {course?.title} ✂️
            </h1>
            <p className="text-lg text-gray-500">Gestión de inscriptos y pagos para este taller.</p>
          </div>

          {course && (
            <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                <HiCurrencyDollar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio del Curso</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(course.price)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="flex p-1.5 bg-gray-100/50 rounded-2xl w-fit mb-10 border border-gray-200/50">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <input 
              placeholder="Buscar por nombre, email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-4 pr-10 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <select 
              value={turnoFilter} 
              onChange={e => setTurnoFilter(e.target.value)} 
              className="px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-gray-700 min-w-[180px]"
            >
              <option value="all">Todos los horarios</option>
              {availableTurnos.map(t => (
                <option key={t._id} value={t._id}>{t.diaSemana} {t.horaInicio}hs</option>
              ))}
            </select>
          </div>
        </div>

        <WorkshopInscriptionsTable 
          inscriptions={inscriptions} 
          loading={loading} 
          sortConfig={sortConfig} 
          handleSort={handleSort} 
          onManagePaymentClick={(i) => { setSelectedInscription(i); setIsPaymentModalOpen(true); }} 
          onDeleteClick={(id, name) => handleDelete(id, name)}
          lastMonthlyClosureDate={course?.lastMonthlyClosureDate}
        />
        <WorkshopInscriptionsList 
          inscriptions={inscriptions} 
          loading={loading} 
          onManagePaymentClick={(i) => { setSelectedInscription(i); setIsPaymentModalOpen(true); }} 
          onDeleteClick={(id, name) => handleDelete(id, name)}
          lastMonthlyClosureDate={course?.lastMonthlyClosureDate}
        />

        <div className="p-8 bg-gray-50/50">
          <Pagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(totalItems / itemsPerPage)} 
            totalItems={totalItems} 
            itemsPerPage={itemsPerPage} 
            handlePrevPage={() => setCurrentPage(p => p - 1)} 
            handleNextPage={() => setCurrentPage(p => p + 1)} 
            handleItemsPerPageChange={e => setItemsPerPage(Number(e.target.value))} 
          />
        </div>
      </div>

      {selectedInscription && (
        <PaymentHistoryModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
          onSuccess={fetchData} 
          inscription={selectedInscription} 
          lastMonthlyClosureDate={course?.lastMonthlyClosureDate}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.studentName}
        itemType="alumno"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default WorkshopInscriptionsPage;

