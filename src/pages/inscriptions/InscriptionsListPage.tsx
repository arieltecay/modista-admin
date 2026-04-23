import React, { useState, useEffect } from 'react';
import {
  getInscriptions,
  updateInscriptionPaymentStatus,
  getInscriptionsCount,
  exportInscriptions,
} from '@/services/inscriptions/inscriptionService';
import { sendPaymentSuccessEmail, sendCoursePaidEmail } from '@/services/email/emailService';
import { getCoursesAdmin } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import InscriptionsListMobile from '@/pages/inscriptions/components/InscriptionsListMobile';
import InscriptionsTableDesktop from '@/pages/inscriptions/components/InscriptionsTableDesktop';
import Pagination from '@/components/shared/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import type { InscriptionsCount } from '@/services/types';
import type { Inscription } from './components/types';
import type { SortConfig } from './types';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { StatCard, TotalIcon, PaidIcon, PendingIcon, SearchIcon } from '@/components/shared/AdminStatComponents';

const InscriptionsAdminPage: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fechaInscripcion', direction: 'desc' });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const debouncedCourseFilter = useDebounce(courseFilter, 500);

  const [courseSuggestions, setCourseSuggestions] = useState<any[]>([]);
  const [inscriptionStats, setInscriptionStats] = useState<(InscriptionsCount & { searchTotal?: number }) | null>(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, courseId: null as string | null, courseTitle: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const inscriptionsPromise = getInscriptions({
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          search: debouncedSearchTerm,
          paymentStatusFilter,
          courseFilter: debouncedCourseFilter,
          excludeWorkshops: true
        });

        const statsPromise = getInscriptionsCount(true);

        const [inscriptionsData, statsResponse] = await Promise.all([inscriptionsPromise, statsPromise]);
        
        const finalStats = 'data' in statsResponse ? (statsResponse as any).data : statsResponse;

        if (debouncedCourseFilter) {
          finalStats.searchTotal = inscriptionsData.total;
        }

        setInscriptions(inscriptionsData.data as unknown as Inscription[]);
        setTotalItems(inscriptionsData.total);
        setInscriptionStats(finalStats);

      } catch (err: any) {
        setError(err.message || 'Error al cargar las inscripciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, sortConfig, paymentStatusFilter, debouncedCourseFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, paymentStatusFilter, debouncedCourseFilter]);

  useEffect(() => {
    if (debouncedCourseFilter) {
      const fetchSuggestions = async () => {
        try {
          const data = await getCoursesAdmin(1, 10, undefined, undefined, debouncedCourseFilter as string);
          setCourseSuggestions(data.data);
        } catch (err: any) {
          console.error('Error fetching course suggestions:', err);
        }
      };
      fetchSuggestions();
    } else {
      setCourseSuggestions([]);
    }
  }, [debouncedCourseFilter]);

  const handlePaymentStatusUpdate = async (inscriptionId: string, newStatus: 'paid' | 'pending') => {
    try {
      setLoading(true);
      await updateInscriptionPaymentStatus(inscriptionId, newStatus);

      const updatedInscriptions = inscriptions.map(inscription =>
        inscription._id === inscriptionId
          ? { ...inscription, paymentStatus: newStatus }
          : inscription
      );
      setInscriptions(updatedInscriptions);

      if (inscriptionStats) {
        setInscriptionStats(prevStats => {
          if (!prevStats) return prevStats;
          const newStats = { ...prevStats };
          if (newStatus === 'paid') {
            newStats.paid += 1;
            newStats.pending -= 1;
          } else {
            newStats.paid -= 1;
            newStats.pending += 1;
          }
          return newStats;
        });
      }

      if (newStatus === 'paid') {
        const inscription = updatedInscriptions.find(i => i._id === inscriptionId);
        if (inscription) {
          try {
            await sendPaymentSuccessEmail(inscription as any);
            toast.success('Correo de confirmación de pago enviado.');
          } catch (emailError: any) {
            toast.error(`Error al enviar el correo: ${emailError.message}`);
          }
        }
      }

      toast.success(`Estado actualizado a ${newStatus === 'paid' ? 'pagado' : 'pendiente'} correctamente`);
    } catch (error: any) {
      toast.error('Error al actualizar el estado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCourseEmail = async (inscription: Inscription) => {
    try {
      setLoading(true);
      await sendCoursePaidEmail(inscription as any);
      toast.success('Correo con el link del curso enviado exitosamente.');
    } catch (error: any) {
      toast.error('Error al enviar el correo del curso: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await toast.promise(
      exportInscriptions(paymentStatusFilter, debouncedSearchTerm as string, debouncedCourseFilter as string, true),
      {
        loading: 'Exportando inscripciones...',
        success: <b>Archivo descargado con éxito.</b>,
        error: (err: any) => <b>{err.message || "Error al exportar"}</b>,
      }
    );
    setIsExporting(false);
  };
  
  const handleDeleteCourse = async () => {};

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-8 py-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administrador</h1>
          <p className="text-sm text-gray-500">Resumen general de inscripciones.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Inscripciones"
            value={inscriptionStats?.total ?? '...'}
            icon={<TotalIcon />}
            colorClass="bg-blue-100"
            loading={!inscriptionStats}
          />
          <StatCard
            title="Alumnas Pagadas"
            value={inscriptionStats?.paid ?? '...'}
            icon={<PaidIcon />}
            colorClass="bg-green-100"
            loading={!inscriptionStats}
          />
          <StatCard
            title="Pagos Pendientes"
            value={inscriptionStats?.pending ?? '...'}
            icon={<PendingIcon />}
            colorClass="bg-yellow-100"
            loading={!inscriptionStats}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-6 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:max-w-md">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-2 w-full border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as 'all' | 'pending' | 'paid')}
                className="px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="all">Todos los pagos</option>
                <option value="paid">Pagados</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full md:w-auto px-6 py-2 text-center font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none transition-all duration-200 disabled:bg-gray-400"
            >
              {isExporting ? 'Exportando...' : 'Exportar a Excel'}
            </button>
          </div>

          <InscriptionsListMobile
            inscriptions={inscriptions}
            loading={loading}
            handlePaymentStatusUpdate={handlePaymentStatusUpdate}
            handleSendCourseEmail={handleSendCourseEmail}
            onDepositClick={() => {}}
          />
          <InscriptionsTableDesktop
            inscriptions={inscriptions}
            loading={loading}
            handlePaymentStatusUpdate={handlePaymentStatusUpdate}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleSendCourseEmail={handleSendCourseEmail}
            onDepositClick={() => {}}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
        onConfirm={handleDeleteCourse}
        itemName={deleteModal.courseTitle}
        itemType="la inscripción"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InscriptionsAdminPage;
