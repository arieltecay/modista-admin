import { useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useDashboardData } from './useDashboardData';

const getLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const FUNNEL_STEP_LABELS: Record<string, string> = {
  course_detail_view: 'Vio el curso',
  pricing_visible: 'Vio el precio',
  cta_click: 'Tocó el botón de inscripción',
  form_view: 'Vio el formulario',
  form_start: 'Empezó a completar el formulario',
  form_submit: 'Envió el formulario',
  redirect_to_payment: 'Fue a Mercado Pago',
  lead: 'Lead registrado',
  initiate_checkout: 'Inició el pago',
  purchase: 'Volvió con pago confirmado',
};

const DashboardPage = () => {
  const today = useMemo(() => new Date(), []);
  const [startDate, setStartDate] = useState(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return getLocalDate(start);
  });
  const [endDate, setEndDate] = useState(() => getLocalDate(today));
  const {
    stats,
    performance,
    whatsAppStats,
    traffic,
    funnelStats,
    isLoading,
    isRefreshing,
    hasLoadError,
    refresh,
  } = useDashboardData(startDate, endDate);

  const paidRate = stats && stats.totalInscriptions > 0
    ? (stats.paidInscriptions / stats.totalInscriptions) * 100
    : 0;

  const kpis = [
    {
      label: 'Ingresos asociados',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      detail: 'Pagos acumulados de inscripciones creadas en el período',
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Inscripciones',
      value: (stats?.totalInscriptions ?? 0).toLocaleString('es-AR'),
      detail: 'Registros creados en el período',
      icon: UserGroupIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pagos confirmados',
      value: (stats?.paidInscriptions ?? 0).toLocaleString('es-AR'),
      detail: 'Estado actual: pago completo',
      icon: CurrencyDollarIcon,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: 'Inscripción a pago',
      value: `${paidRate.toFixed(1)}%`,
      detail: 'Pagos confirmados ÷ inscripciones',
      icon: ArrowTrendingUpIcon,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <main className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Rendimiento de ventas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pagos reales, campañas registradas y actividad de WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <CalendarIcon aria-hidden="true" className="ml-1 h-5 w-5 text-slate-400" />
          <label className="sr-only" htmlFor="dashboard-start-date">Desde</label>
          <input
            id="dashboard-start-date"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="min-w-0 border-0 bg-transparent text-sm font-medium text-slate-700 focus:ring-0"
          />
          <span aria-hidden="true" className="text-slate-300">—</span>
          <label className="sr-only" htmlFor="dashboard-end-date">Hasta</label>
          <input
            id="dashboard-end-date"
            type="date"
            value={endDate}
            min={startDate}
            max={getLocalDate(today)}
            onChange={(event) => setEndDate(event.target.value)}
            className="min-w-0 border-0 bg-transparent text-sm font-medium text-slate-700 focus:ring-0"
          />
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            aria-label="Actualizar tablero"
            className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 text-slate-600 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {hasLoadError && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Algunos datos no se pudieron cargar. Actualizá el tablero para volver a intentarlo.
        </div>
      )}

      <section aria-label="Resumen de ventas" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-900" aria-live="polite">
                  {isLoading ? '—' : kpi.value}
                </p>
              </div>
              <span className={`rounded-xl p-3 ${kpi.color}`}>
                <kpi.icon aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{kpi.detail}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section aria-labelledby="campaign-heading" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 id="campaign-heading" className="text-lg font-bold text-slate-900">Campañas con UTM registradas</h2>
            <p className="mt-1 text-sm text-slate-500">
              Datos del sitio vinculados a una campaña UTM y a una inscripción con sesión registrada.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th scope="col" className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Campaña</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">IDs registrados</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Inscripciones vinculadas</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Con pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(traffic?.topCampaigns ?? []).map((campaign) => {
                  return (
                    <tr key={campaign.campaign} className="hover:bg-slate-50/70">
                      <th scope="row" className="max-w-[240px] truncate px-5 py-4 text-sm font-semibold text-slate-800">
                        {campaign.campaign}
                      </th>
                      <td className="px-5 py-4 text-right text-sm text-slate-600">{campaign.visits.toLocaleString('es-AR')}</td>
                      <td className="px-5 py-4 text-right text-sm text-slate-600">{campaign.leads.toLocaleString('es-AR')}</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-emerald-700">{campaign.purchases.toLocaleString('es-AR')}</td>
                    </tr>
                  );
                })}
                {!isLoading && (traffic?.topCampaigns.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">
                      No hay campañas con UTM registradas en este período.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">Cargando campañas…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-5 py-4 text-xs leading-relaxed text-slate-500 sm:px-6">
            No son métricas exclusivas de Meta Ads: el endpoint no distingue la fuente de la campaña ni excluye importaciones históricas de GA4. El rango filtra cuándo se registró el ID del navegador; las inscripciones vinculadas pueden haberse creado en otra fecha. “Con pago” incluye pagos parciales y completos. El tracking depende del consentimiento.
          </p>
        </section>

        <section aria-labelledby="whatsapp-heading" className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white/10 p-2.5 text-indigo-300">
              <ChatBubbleBottomCenterTextIcon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="whatsapp-heading" className="text-lg font-bold">Mensajes de WhatsApp</h2>
              <p className="text-xs text-slate-400">Estados guardados en el sistema</p>
            </div>
          </div>
          <dl className="mt-7 space-y-4">
            {[
              ['Enviados', whatsAppStats?.sent],
              ['Entregados', whatsAppStats?.delivered],
              ['Leídos', whatsAppStats?.read],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                <dt className="text-sm text-slate-300">{label}</dt>
                <dd className="text-lg font-bold">{isLoading ? '—' : Number(value ?? 0).toLocaleString('es-AR')}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            Este endpoint no informa inversión publicitaria ni costo por mensaje.
          </p>
        </section>
      </div>

      <section aria-labelledby="course-heading" className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 id="course-heading" className="text-lg font-bold text-slate-900">Inscripciones por curso</h2>
          <p className="mt-1 text-sm text-slate-500">Inscripciones creadas y pagos completos en el período seleccionado.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="bg-slate-50">
                <th scope="col" className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Curso</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Inscripciones</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Pagos completos</th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Tasa de pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performance.map((course) => {
                const coursePaidRate = course.totalInscribed > 0
                  ? (course.paidInscribed / course.totalInscribed) * 100
                  : 0;

                return (
                  <tr key={course._id}>
                    <th scope="row" className="px-5 py-4 text-sm font-semibold text-slate-800">{course.courseTitle}</th>
                    <td className="px-5 py-4 text-right text-sm text-slate-600">{course.totalInscribed.toLocaleString('es-AR')}</td>
                    <td className="px-5 py-4 text-right text-sm text-emerald-700">{course.paidInscribed.toLocaleString('es-AR')}</td>
                    <td className="px-5 py-4 text-right text-sm text-slate-600">{coursePaidRate.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {!isLoading && performance.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">No hay inscripciones para este período.</td></tr>
              )}
              {isLoading && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">Cargando cursos…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="journey-heading" className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 id="journey-heading" className="text-lg font-bold text-slate-900">Actividad observada en el sitio</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sesiones con consentimiento que registraron cada evento. Los pasos no representan necesariamente a las mismas personas; por eso no mostramos una tasa entre pasos.
          </p>
        </div>
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Cargando actividad…</p>
        ) : (funnelStats?.funnel.length ?? 0) > 0 ? (
          <ul className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {funnelStats?.funnel.map((step) => (
              <li key={step.step} className="flex items-center justify-between gap-3 bg-white p-4 sm:p-5">
                <span className="text-sm font-medium text-slate-700">{FUNNEL_STEP_LABELS[step.step] ?? step.step}</span>
                <span className="shrink-0 text-lg font-bold text-slate-900">{step.uniqueSessions.toLocaleString('es-AR')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-400">No hay eventos registrados en este período.</p>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
