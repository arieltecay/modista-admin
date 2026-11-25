import { formatCurrency, formatDateTime, formatInteger, shortId } from '../../utils/format';
import { CHANNEL_LABELS, DEVICE_LABELS, journeyStepLabel, labelOf } from '../../utils/labels';
import type { JourneyTableProps } from './types';

/** The API only serves up to this page. */
const MAX_PAGE = 1000;
const HEADERS = ['ID', 'Inicio', 'Última actividad', 'Canal', 'Landing', 'Dispositivo', 'Paso máximo', 'Lead', 'Compra', 'Ingresos', 'Acciones'];

export const JourneyTable = ({ journeys, pagination, timezone, onSelect, onPageChange }: JourneyTableProps) => (
  <div className="space-y-3">
    <div className="relative overflow-x-auto">
      <table className="stacked-table min-w-full text-left text-sm">
        <caption className="sr-only">Recorridos de visitantes (identificadores abreviados)</caption>
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>{HEADERS.map((header, index) => <th key={`${header}-${index}`} scope="col" className="px-3 py-2 font-semibold">{header === 'Acciones' ? <span className="sr-only">{header}</span> : header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {journeys.map((journey) => (
            <tr key={journey.visitId}>
              <td data-label="ID" className="px-3 py-2"><code className="text-xs">{shortId(journey.visitId)}</code></td>
              <td data-label="Inicio" className="px-3 py-2">{formatDateTime(journey.startedAt, timezone)}</td>
              <td data-label="Última actividad" className="px-3 py-2">{formatDateTime(journey.lastActivityAt, timezone)}</td>
              <td data-label="Canal" className="px-3 py-2">{labelOf(CHANNEL_LABELS, journey.channelGroup)}</td>
              <td data-label="Landing" className="px-3 py-2">{journey.landingSlug ?? '—'}</td>
              <td data-label="Dispositivo" className="px-3 py-2">{labelOf(DEVICE_LABELS, journey.device)}</td>
              <td data-label="Paso máximo" className="px-3 py-2">
                <span>
                  {journeyStepLabel(journey.maxStep)}
                  {journey.truncated && <span className="ml-1 rounded bg-amber-100 px-1 text-xs text-amber-800" title="Tiene más eventos de los que se muestran">Truncado</span>}
                </span>
              </td>
              <td data-label="Lead" className="px-3 py-2">{journey.hasLead ? 'Sí' : 'No'}</td>
              <td data-label="Compra" className="px-3 py-2">{journey.hasPurchase ? 'Sí' : 'No'}</td>
              <td data-label="Ingresos" className="px-3 py-2">{formatCurrency(journey.revenue)}</td>
              <td data-label="Acciones" className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onSelect(journey.visitId)}
                  aria-label={`Ver recorrido ${shortId(journey.visitId)}`}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium hover:bg-slate-50"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <nav aria-label="Paginación de recorridos" className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
      <span>Página {pagination.page} de {Math.max(1, pagination.totalPages)} · {formatInteger(pagination.total)} recorridos</span>
      <div className="flex gap-2">
        <button type="button" disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">
          Anterior
        </button>
        <button type="button" disabled={pagination.page >= Math.min(pagination.totalPages, MAX_PAGE)} onClick={() => onPageChange(pagination.page + 1)} className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-40">
          Siguiente
        </button>
      </div>
    </nav>
  </div>
);
