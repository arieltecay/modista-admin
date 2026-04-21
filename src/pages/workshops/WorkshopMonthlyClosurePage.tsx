import { type FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, processMonthlyClosure, getMonthlyReports } from '@/services/courses/coursesService';
import type { Course, MonthlyClosureReport } from '@/services/courses/types';
import Spinner from '@/components/shared/Spinner';
import toast from 'react-hot-toast';
import ClosureConfirmationModal from '@/pages/workshops/components/ClosureConfirmationModal';

const WorkshopMonthlyClosurePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [reports, setReports] = useState<MonthlyClosureReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [closureDate, setClosureDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [courseData, reportsData] = await Promise.all([
        getCourseById(id),
        getMonthlyReports(id, 1, 50)
      ]);
      setCourse(courseData);
      setReports(reportsData.data);
    } catch (error) {
      toast.error('Error al cargar datos del cierre mensual');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessClosure = async () => {
    if (!id) return;
    try {
      setProcessing(true);
      await processMonthlyClosure(id, closureDate);
      toast.success('Cierre mensual procesado correctamente');
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el cierre mensual');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Cierre Mensual: {course?.title}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Cierre</h2>
              <div className="space-y-4">
                <input
                  type="date"
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={processing}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  Procesar Cierre Mensual
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Historial de Reportes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="px-6 py-4 font-semibold">Período</th>
                      <th className="px-6 py-4 font-semibold text-right">Recaudado</th>
                      <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report._id}>
                          <td className="px-6 py-4">
                            {new Date(0, report.paymentMonth - 1).toLocaleString('es-ES', { month: 'long' })} {report.paymentYear}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-green-600">
                            ${report.totalAmountCollected.toLocaleString('es-AR')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <a
                              href={report.reportUrl.startsWith('http') ? report.reportUrl : `${import.meta.env.VITE_API_URL || ''}${report.reportUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm font-semibold"
                            >
                              Descargar CSV
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No hay reportes generados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClosureConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleProcessClosure}
        closureDate={closureDate}
        isProcessing={processing}
      />
    </div>
  );
};

export default WorkshopMonthlyClosurePage;
