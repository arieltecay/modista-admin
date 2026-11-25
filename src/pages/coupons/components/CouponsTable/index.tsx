import { Link } from 'react-router-dom';
import CouponStatusBadge from '../CouponStatusBadge';
import { discountLabel, formatDate, formatMoney, usageLabel } from '../../utils/format';
import type { CouponsTableProps } from './types';

const HEADERS = ['Código', 'Descuento', 'Curso', 'Vigencia', 'Usos', 'Ingreso neto', 'Estado', 'Acciones'];
const ACTION = 'rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50';

/** Texto del servidor (código, curso): siempre como texto de React, nunca como HTML. */
export const CouponsTable = ({ rows, busyId, onToggle }: CouponsTableProps) => (
  <div className="relative overflow-x-auto">
    <table role="table" className="stacked-table min-w-full divide-y divide-gray-200 text-sm">
      <thead role="rowgroup" className="bg-gray-50">
        <tr role="row">
          {HEADERS.map((header) => (
            <th role="columnheader" key={header} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className="divide-y divide-gray-100 bg-white">
        {rows.map((row) => (
          <tr role="row" key={row.id}>
            <td role="cell" data-label="Código" className="px-4 py-3 font-mono md:whitespace-nowrap font-semibold text-gray-900">{row.code}</td>
            <td role="cell" data-label="Descuento" className="whitespace-nowrap px-4 py-3">{discountLabel(row.type, row.value)}</td>
            <td role="cell" data-label="Curso" className="px-4 py-3">{row.courseTitle ?? 'Todos los cursos'}</td>
            <td role="cell" data-label="Vigencia" className="whitespace-nowrap px-4 py-3">{`${formatDate(row.startsAt)} – ${formatDate(row.endsAt)}`}</td>
            <td role="cell" data-label="Usos" className="whitespace-nowrap px-4 py-3">{usageLabel(row.usedCount, row.maxUses)}</td>
            <td role="cell" data-label="Ingreso neto" className="whitespace-nowrap px-4 py-3">{formatMoney(row.netRevenue ?? 0)}</td>
            <td role="cell" data-label="Estado" className="px-4 py-3">
              <CouponStatusBadge status={row.status} />
            </td>
            <td role="cell" data-label="Acciones" className="whitespace-nowrap px-4 py-3">
              <div className="flex gap-2">
                <Link to={`/admin/coupons/${row.id}`} className={`${ACTION} border-indigo-200 text-indigo-700`}>
                  Ver detalle
                </Link>
                <button type="button" disabled={busyId === row.id} onClick={() => onToggle(row.id, !row.active)} className={ACTION}>
                  {row.active ? 'Pausar' : 'Reanudar'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CouponsTable;
