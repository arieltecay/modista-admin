import { Link } from 'react-router-dom';
import CouponStatusBadge from '../CouponStatusBadge';
import { discountLabel, formatDate, formatMoney, usageLabel } from '../../utils/format';
import type { CouponsTableProps } from './types';

const HEADERS = ['Código', 'Descuento', 'Curso', 'Vigencia', 'Usos', 'Ingreso neto', 'Estado', 'Acciones'];
const ACTION = 'rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50';

/** Texto del servidor (código, curso): siempre como texto de React, nunca como HTML. */
export const CouponsTable = ({ rows, busyId, onToggle }: CouponsTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {HEADERS.map((header) => (
            <th key={header} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-gray-900">{row.code}</td>
            <td className="whitespace-nowrap px-4 py-3">{discountLabel(row.type, row.value)}</td>
            <td className="px-4 py-3">{row.courseTitle ?? 'Todos los cursos'}</td>
            <td className="whitespace-nowrap px-4 py-3">{`${formatDate(row.startsAt)} – ${formatDate(row.endsAt)}`}</td>
            <td className="whitespace-nowrap px-4 py-3">{usageLabel(row.usedCount, row.maxUses)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatMoney(row.netRevenue ?? 0)}</td>
            <td className="px-4 py-3">
              <CouponStatusBadge status={row.status} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">
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
