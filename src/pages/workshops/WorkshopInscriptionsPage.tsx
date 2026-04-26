import { type FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { getWorkshopInscriptions, getWorkshopDetails, exportWorkshopInscriptions } from '@/services/inscriptions/workshopInscriptionService';
import { updateInscriptionPaymentStatus, updateInscriptionDeposit } from '@/services/inscriptions/inscriptionService';
import { sendPaymentSuccessEmail } from '@/services/email/emailService';
import { getCourseById } from '@/services/courses/coursesService';
import { getTurnosByCourse } from '@/services/turnos/turnoService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import DepositModal from '@/pages/workshops/components/DepositModal';
import WorkshopInscriptionsTable from '@/pages/workshops/components/WorkshopInscriptionsTable';
import WorkshopInscriptionsList from '@/pages/workshops/components/WorkshopInscriptionsList';
import Pagination from '@/components/shared/Pagination';
import type { WorkshopCourse, WorkshopInscription, Turno, WorkshopSortConfig } from './types';
import { HiCalendar, HiUsers, HiClipboardCheck, HiChevronLeft, HiDownload, HiCurrencyDollar, HiUserGroup, HiBadgeCheck } from 'react-icons/hi';

const WorkshopInscriptionsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [inscriptions, setInscriptions] = useState<WorkshopInscription[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'partial'>('all');
  const [turnoFilter, setTurnoFilter] = useState<string>('all');
  const [availableTurnos, setAvailableTurnos] = useState<Turno[]>([]);
  const [sortConfig, setSortConfig] = useState<WorkshopSortConfig>({ key: 'fechaInscripcion', direction: 'desc' });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedInscription, setSelectedInscription] = useState<WorkshopInscription | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [courseData, turnosData, inscriptionsData, detailsData] = await Promise.all([
        getCourseById(id),
        getTurnosByCourse(id, { includeBlocked: true }),
        getWorkshopInscriptions(id, { 
          page: currentPage, 
          limit: itemsPerPage, 
          sortBy: sortConfig.key, 
          sortOrder: sortConfig.direction, 
          search: debouncedSearchTerm, 
          paymentStatusFilter: paymentFilter, 
          turnoFilter: turnoFilter !== 'all' ? turnoFilter : undefined 
        }),
        getWorkshopDetails(id)
      ]);

      setCourse(courseData as unknown as WorkshopCourse);
      setAvailableTurnos(turnosData.data || []);
      setInscriptions(inscriptionsData.data || []);
      setTotalItems(inscriptionsData.total || 0);
      setSummary(detailsData.summary || null);
    } catch (e) { 
      toast.error('Error al cargar datos'); 
    } finally { 
      setLoading(false); 
    }
  }, [id, currentPage, itemsPerPage, debouncedSearchTerm, paymentFilter, turnoFilter, sortConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePaymentStatusUpdate = async (insId: string, status: 'paid' | 'pending') => {
    try {
      await updateInscriptionPaymentStatus(insId, status);
      
      if (status === 'paid') {
        const student = inscriptions.find(i => i._id === insId);
        if (student) {
          await sendPaymentSuccessEmail({
            ...student,
            dateYear: new Date().getFullYear(),
            turno: student.turnoId
          } as any);
        }
      }

      await fetchData();
      toast.success('Estado actualizado');
    } catch (e) { toast.error('Error'); }
  };

  const handleDepositSubmit = async (insId: string, amount: number) => {
    try {
      setIsSubmittingDeposit(true);
      await updateInscriptionDeposit(insId, amount);

      // Actualizar lista local (opcional si se hace fetchData, pero bueno para consistencia)
      const updatedList = inscriptions.map(inv =>
        inv._id === insId
          ? { ...inv, depositAmount: amount, depositDate: new Date().toISOString(), isReserved: true }
          : inv
      );
      setInscriptions(updatedList);
      
      setIsDepositModalOpen(false);
      await fetchData();
      toast.success('Seña registrada y correo enviado exitosamente');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al registrar la seña');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      setIsExporting(true);
      await exportWorkshopInscriptions(id, paymentFilter, debouncedSearchTerm, turnoFilter !== 'all' ? turnoFilter : undefined);
      toast.success('Exportación completada');
    } catch (e) {
      toast.error('Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSort = (key: string) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setTurnoFilter('all');
    setCurrentPage(1);
    fetchData(); // Force refresh
  };

  if (loading && !course) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

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
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate(`/admin/workshops/${id}/schedule`)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <HiCalendar className="w-5 h-5 opacity-90" />
              Ver Agenda y Horarios
            </button>
            <button 
              onClick={() => navigate(`/admin/workshops/more-info/${id}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <HiUsers className="w-5 h-5 opacity-90" />
              Ver Inscriptos y Pagos
            </button>
            <button 
              onClick={() => navigate(`/admin/workshops/closures/${id}`)}
              className="flex items-center gap-2 bg-[#d1e7dd] hover:bg-[#c3e0d2] text-[#0f5132] px-6 py-3.5 rounded-xl text-sm font-bold border border-[#badbcc] transition-all active:scale-95"
            >
              <HiClipboardCheck className="w-5 h-5 opacity-90" />
              Cierre Mensual
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <HiDownload className="w-5 h-5 opacity-90" />
              {isExporting ? 'Exportando...' : 'Exportar Excel'}
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
              value={paymentFilter} 
              onChange={e => setPaymentFilter(e.target.value as any)} 
              className="px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-gray-700 min-w-[180px]"
            >
              <option value="all">Todos los pagos</option>
              <option value="paid">Solo Pagados</option>
              <option value="partial">Solo Señas/Parciales</option>
              <option value="pending">Solo Pendientes</option>
            </select>
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
          handlePaymentStatusUpdate={handlePaymentStatusUpdate} 
          sortConfig={sortConfig} 
          handleSort={handleSort} 
          onDepositClick={(i) => { setSelectedInscription(i); setIsDepositModalOpen(true); }} 
        />
        <WorkshopInscriptionsList 
          inscriptions={inscriptions} 
          loading={loading} 
          handlePaymentStatusUpdate={handlePaymentStatusUpdate} 
          onDepositClick={(i) => { setSelectedInscription(i); setIsDepositModalOpen(true); }} 
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
        <DepositModal 
          isOpen={isDepositModalOpen} 
          onClose={() => setIsDepositModalOpen(false)} 
          onSubmit={handleDepositSubmit} 
          inscription={selectedInscription} 
          isSubmitting={isSubmittingDeposit} 
        />
      )}
    </div>
  );
};

export default WorkshopInscriptionsPage;
