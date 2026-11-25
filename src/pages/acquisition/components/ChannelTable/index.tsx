import { useMemo, useState } from 'react';
import { formatCurrency, formatInteger, formatPercent } from '../../utils/format';
import { CHANNEL_LABELS, labelOf } from '../../utils/labels';
import type { ChannelRowView, ChannelTableProps, SortDirection, SortKey } from './types';

const COLUMNS: ReadonlyArray<{ key: SortKey; label: string; isText?: boolean }> = [
  { key: 'channelGroup', label: 'Canal', isText: true },
  { key: 'sourcePlatform', label: 'Plataforma', isText: true },
  { key: 'visits', label: 'Visitas' },
  { key: 'leads', label: 'Leads' },
  { key: 'purchases', label: 'Compras' },
  { key: 'leadRate', label: 'Tasa lead' },
  { key: 'purchaseRate', label: 'Tasa compra' },
  { key: 'revenue', label: 'Ingresos' },
  { key: 'averageTicket', label: 'Ticket promedio' },
  { key: 'revenueShare', label: 'Participación' },
];

/** Missing values (null rates, no ticket) always sort last, whichever the direction. */
const compare = (a: ChannelRowView, b: ChannelRowView, key: SortKey, direction: SortDirection): number => {
  const left = key === 'channelGroup' ? labelOf(CHANNEL_LABELS, a.channelGroup) : a[key];
  const right = key === 'channelGroup' ? labelOf(CHANNEL_LABELS, b.channelGroup) : b[key];
  if (left === null) return right === null ? 0 : 1;
  if (right === null) return -1;
  const order = typeof left === 'string' ? left.localeCompare(String(right), 'es') : left - Number(right);
  return direction === 'asc' ? order : -order;
};

export const ChannelTable = ({ rows, unlinked, isCohort }: ChannelTableProps) => {
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'revenue', direction: 'desc' });
  const sorted = useMemo(() => [...rows].sort((a, b) => compare(a, b, sort.key, sort.direction)), [rows, sort]);

  const toggle = (key: SortKey, isText: boolean | undefined) =>
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: isText ? 'asc' : 'desc' },
    );

  return (
    <div className="relative overflow-x-auto">
      <table role="table" className="stacked-table stacked-table-sortable min-w-full text-left text-sm">
        <caption className="sr-only">Canales de adquisición</caption>
        <thead role="rowgroup" className="text-xs uppercase tracking-wide text-slate-500">
          <tr role="row">
            {COLUMNS.map((column) => (
              <th role="columnheader"
                key={column.key}
                scope="col"
                aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2 font-semibold"
              >
                <button type="button" onClick={() => toggle(column.key, column.isText)} className="uppercase tracking-wide hover:text-slate-800">
                  {column.label}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="divide-y divide-slate-100 text-slate-700">
          {sorted.map((row) => (
            <tr role="row" key={`${row.channelGroup}-${row.sourcePlatform}`}>
              <td role="cell" data-label="Canal" className="px-3 py-2 font-medium text-slate-900">{labelOf(CHANNEL_LABELS, row.channelGroup)}</td>
              <td role="cell" data-label="Plataforma" className="px-3 py-2 text-slate-500">{row.sourcePlatform}</td>
              <td role="cell" data-label="Visitas" className="px-3 py-2">{formatInteger(row.visits)}</td>
              <td role="cell" data-label="Leads" className="px-3 py-2">{formatInteger(row.leads)}</td>
              <td role="cell" data-label="Compras" className="px-3 py-2">{formatInteger(row.purchases)}</td>
              <td role="cell" data-label="Tasa lead" className="px-3 py-2">{isCohort ? formatPercent(row.leadRate) : '—'}</td>
              <td role="cell" data-label="Tasa compra" className="px-3 py-2">{isCohort ? formatPercent(row.purchaseRate) : '—'}</td>
              <td role="cell" data-label="Ingresos" className="px-3 py-2">{formatCurrency(row.revenue)}</td>
              <td role="cell" data-label="Ticket promedio" className="px-3 py-2">{formatCurrency(row.averageTicket)}</td>
              <td role="cell" data-label="Participación" className="px-3 py-2">{formatPercent(row.revenueShare)}</td>
            </tr>
          ))}
          {unlinked && (
            <tr role="row" className="bg-slate-50 italic">
              <td role="cell" data-label="Canal" className="px-3 py-2">Conversiones sin recorrido enlazable</td>
              <td role="cell" data-label="Plataforma" className="px-3 py-2">—</td>
              <td role="cell" data-label="Visitas" className="px-3 py-2">—</td>
              <td role="cell" data-label="Leads" className="px-3 py-2">{formatInteger(unlinked.leads)}</td>
              <td role="cell" data-label="Compras" className="px-3 py-2">{formatInteger(unlinked.purchases)}</td>
              <td role="cell" data-label="Tasa lead" className="px-3 py-2">—</td>
              <td role="cell" data-label="Tasa compra" className="px-3 py-2">—</td>
              <td role="cell" data-label="Ingresos" className="px-3 py-2">{formatCurrency(unlinked.revenue)}</td>
              <td role="cell" data-label="Ticket promedio" className="px-3 py-2">—</td>
              <td role="cell" data-label="Participación" className="px-3 py-2">—</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
