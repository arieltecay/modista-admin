import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/config/apiClient';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneralStats {
  totalRevenue: number;
  totalInscriptions: number;
  paidInscriptions: number;
  partialInscriptions: number;
  attribution: {
    organic: number;
    paidAds: number;
  };
}

interface CoursePerformance {
  _id: string;
  courseTitle: string;
  totalInscribed: number;
  paidInscribed: number;
  revenue: number;
}

interface MetaStats {
  spent: number;
  currency: string;
  costPerMessage: number;
  sent: number;
  delivered: number;
  read: number;
  uniqueResponses: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [performance, setPerformance] = useState<CoursePerformance[]>([]);
  const [metaStats, setMetaStats] = useState<MetaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };

      // Ejecutamos las peticiones individualmente para que una falla no bloquee las demás
      const statsPromise = apiClient.get('/dashboard/stats', { params })
        .then(res => setStats(res))
        .catch(err => console.error('Error fetching stats:', err));

      const perfPromise = apiClient.get('/dashboard/performance', { params })
        .then(res => setPerformance(res))
        .catch(err => console.error('Error fetching performance:', err));

      const metaPromise = apiClient.get('/dashboard/meta-whatsapp', { params })
        .then(res => setMetaStats(res))
        .catch(err => console.error('Error fetching meta stats:', err));

      await Promise.allSettled([statsPromise, perfPromise, metaPromise]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = [
    { 
      label: 'Ingresos Totales', 
      value: `$${stats?.totalRevenue.toLocaleString() || 0}`, 
      icon: CurrencyDollarIcon, 
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Basado en pagos reales'
    },
    { 
      label: 'Inscripciones', 
      value: stats?.totalInscriptions || 0, 
      icon: UserGroupIcon, 
      color: 'bg-blue-50 text-blue-600',
      description: 'Total de leads registrados'
    },
    { 
      label: 'Tasa de Conversión', 
      value: stats ? `${((stats.paidInscriptions / stats.totalInscriptions) * 100).toFixed(1)}%` : '0%', 
      icon: ArrowTrendingUpIcon, 
      color: 'bg-amber-50 text-amber-600',
      description: 'Leads que pagaron el total'
    },
    { 
      label: 'Origen Paid (IG)', 
      value: stats?.attribution.paidAds || 0, 
      icon: ChartBarIcon, 
      color: 'bg-purple-50 text-purple-600',
      description: 'Ventas atribuidas a Ads'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard General</h1>
          <p className="text-slate-500 mt-1">Resumen dinámico del rendimiento de tu academia.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <CalendarIcon className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
          />
          <span className="text-slate-300">|</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{kpi.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
              <p className="text-xs text-slate-400 mt-2">{kpi.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Cursos más Vendidos</h2>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Top Performance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nombre del Curso</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Inscriptos</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Pagados</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Efectividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performance.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{course.courseTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-600 font-medium">{course.totalInscribed}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {course.paidInscribed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full" 
                            style={{ width: `${(course.paidInscribed / course.totalInscribed) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {((course.paidInscribed / course.totalInscribed) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {performance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No hay datos para este período</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meta WhatsApp Insights */}
        <div className="bg-slate-900 rounded-3xl shadow-xl p-6 text-white flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-indigo-400" />
              Insights de Meta
            </h2>
            <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">WhatsApp API</div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Inversión</p>
                <p className="text-xl font-black">{metaStats?.spent} {metaStats?.currency}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-xs text-slate-400 mb-1">Costo p/msj</p>
                <p className="text-xl font-black">{metaStats?.costPerMessage} {metaStats?.currency}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { label: 'Enviados', value: metaStats?.sent, icon: PaperAirplaneIcon, color: 'text-indigo-400' },
                { label: 'Entregados', value: metaStats?.delivered, icon: ChartBarIcon, color: 'text-blue-400' },
                { label: 'Leídos', value: metaStats?.read, icon: EyeIcon, color: 'text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-lg">{item.value || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[10px] text-slate-500 text-center leading-tight">
              Datos obtenidos directamente desde la API Cloud de Meta. <br/>
              Actualizado en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* Looker Studio Iframe Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Analítica de Tráfico (Google Looker Studio)</h2>
          <p className="text-xs text-slate-500 mt-1">Reporte detallado de comportamiento y velocidad del sitio.</p>
        </div>
        <div className="aspect-video w-full bg-slate-50 flex items-center justify-center">
          {/* Aquí el usuario puede insertar su URL de Looker Studio */}
          <div className="text-center p-12">
            <ChartBarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 max-w-sm mx-auto">
              Conecta tu reporte de Looker Studio aquí para ver métricas de GA4 (LCP, CLS, UX) integradas.
            </p>
            <button className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold">
              Configurar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
