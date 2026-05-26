import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../services/config/apiClient';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getTrafficData, TrafficData } from '../../services/analytics/analyticsService';

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
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [isRefreshingTraffic, setIsRefreshingTraffic] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [trafficStartDate, setTrafficStartDate] = useState(startDate);
  const [trafficEndDate, setTrafficEndDate] = useState(endDate);

  const fetchTraffic = useCallback(async (showLoader = true) => {
    if (showLoader) setIsRefreshingTraffic(true);
    try {
      const params = { startDate: trafficStartDate, endDate: trafficEndDate };
      const data = await getTrafficData(params);
      setTraffic(data);
    } catch (err) {
      console.error('Error fetching traffic:', err);
    } finally {
      if (showLoader) setIsRefreshingTraffic(false);
    }
  }, [trafficStartDate, trafficEndDate]);

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.post('/analytics/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('CSV importado correctamente');
      fetchTraffic(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al importar CSV');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { startDate, endDate };

      const statsPromise = apiClient.get('/dashboard/stats', { params })
        .then(res => setStats(res))
        .catch(err => console.error('Error fetching stats:', err));

      const perfPromise = apiClient.get('/dashboard/performance', { params })
        .then(res => setPerformance(res))
        .catch(err => console.error('Error fetching performance:', err));

      const metaPromise = apiClient.get('/dashboard/meta-whatsapp', { params })
        .then(res => setMetaStats(res))
        .catch(err => console.error('Error fetching meta stats:', err));

      const trafficPromise = fetchTraffic(false);

      await Promise.allSettled([statsPromise, perfPromise, metaPromise, trafficPromise]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, fetchTraffic]);

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

      {/* Traffic Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800">Tráfico de la Web</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {traffic?.lastUpdated && (
              <span className="text-xs text-slate-400">
                Últ. actualización: {new Date(traffic.lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <CalendarIcon className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="date"
                value={trafficStartDate}
                onChange={(e) => setTrafficStartDate(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer w-28"
              />
              <span className="text-slate-300 text-xs">|</span>
              <input
                type="date"
                value={trafficEndDate}
                onChange={(e) => setTrafficEndDate(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer w-28"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="hidden"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="Importar CSV de GA4"
            >
              {isImporting ? (
                <ArrowPathIcon className="w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <DocumentArrowUpIcon className="w-4 h-4 text-indigo-500" />
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchTraffic(true)}
              disabled={isRefreshingTraffic}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 text-slate-500 ${isRefreshingTraffic ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Mini KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Sesiones</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{traffic?.totalSessions?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Orgánico</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{traffic?.organic?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Pagado</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{traffic?.paid?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Channel Bars */}
          {traffic && (
            <div className="space-y-3">
              {[
                { label: 'Orgánico', value: traffic.organic, pct: traffic.totalSessions ? (traffic.organic / traffic.totalSessions) * 100 : 0, color: 'bg-emerald-500' },
                { label: 'Pagado', value: traffic.paid, pct: traffic.totalSessions ? (traffic.paid / traffic.totalSessions) * 100 : 0, color: 'bg-purple-500' },
                { label: 'Directo', value: traffic.direct, pct: traffic.totalSessions ? (traffic.direct / traffic.totalSessions) * 100 : 0, color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value.toLocaleString()} ({item.pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(item.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Campaigns */}
          {traffic && traffic.topCampaigns.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Top Campañas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Campaña</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Visitas</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Leads</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Tasa Conv.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {traffic.topCampaigns.map((camp) => (
                      <tr key={camp.campaign} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800 text-sm">{camp.campaign}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-600">{camp.visits}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${camp.leads > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {camp.leads}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          {camp.visits > 0 ? `${((camp.leads / camp.visits) * 100).toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!traffic && (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              Cargando datos de tráfico...
            </div>
          )}
        </div>
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
    </div>
  );
};

export default DashboardPage;
