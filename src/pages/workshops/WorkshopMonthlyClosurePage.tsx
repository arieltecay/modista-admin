import { type FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, processMonthlyClosure, getMonthlyReports } from '@/services/courses/coursesService';
import type { Course, MonthlyClosureReport } from '@/services/courses/types';
import Spinner from '@/components/shared/Spinner';
import toast from 'react-hot-toast';
import ClosureConfirmationModal from '@/pages/workshops/components/ClosureConfirmationModal';
import { HiChevronLeft, HiDownload, HiCalendar, HiClock, HiCurrencyDollar } from 'react-icons/hi';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;

  return (
    <div className="bg-gray-50/30 min-h-screen p-4 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-indigo-600 mb-6 transition-colors group font-medium"
          >
            <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg">Volver</span>
          </button>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Cierre Mensual: {course?.title}
          </h1>
          <p className="text-gray-500 text-lg mt-1 font-medium">Gestiona los cierres de ciclo y descarga reportes históricos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Panel de Acción */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <HiCalendar className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Nuevo Cierre</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Fecha de Cierre</label>
                  <input
                    type="date"
                    value={closureDate}
                    onChange={(e) => setClosureDate(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-inner"
                  />
                  <p className="text-xs text-gray-400 mt-4 leading-relaxed font-medium">
                    Todos los pagos registrados hasta esta fecha serán incluidos en el reporte mensual.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={processing}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    processing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  <HiClock className="w-5 h-5" />
                  Procesar Cierre
                </button>
              </div>
              
              {course?.lastMonthlyClosureDate && (
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <p className="text-[10px] text-gray-300 uppercase font-black tracking-[0.2em] mb-1">Último Cierre Realizado</p>
                  <p className="text-xl font-black text-gray-800 tracking-tight">
                    {new Date(course.lastMonthlyClosureDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Reportes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center gap-3">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
                  <HiDownload className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Historial de Reportes</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                      <th className="px-8 py-5 font-black">Período</th>
                      <th className="px-8 py-5 font-black text-right">Recaudado</th>
                      <th className="px-8 py-5 font-black text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-gray-900 uppercase text-sm tracking-tight">
                                {new Date(0, report.paymentMonth - 1).toLocaleString('es-ES', { month: 'long' })}
                              </span>
                              <span className="text-xs text-gray-400 font-bold">{report.paymentYear}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-black text-emerald-600 tracking-tighter">
                                ${report.totalAmountCollected.toLocaleString('es-AR')}
                              </span>
                              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Monto Total</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <a
                              href={report.reportUrl.startsWith('http') ? report.reportUrl : `${import.meta.env.VITE_API_URL || ''}${report.reportUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-black shadow-sm group-hover:shadow-md"
                            >
                              <HiDownload className="h-4 w-4" />
                              CSV
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center text-gray-400">
                          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiClock className="w-8 h-8 text-gray-200" />
                          </div>
                          <p className="font-bold text-lg tracking-tight">No hay reportes generados aún.</p>
                        </td>
                      </tr>
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
