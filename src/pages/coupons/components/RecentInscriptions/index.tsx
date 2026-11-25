import { formatDate, formatMoney } from '../../utils/format';
import type { RecentInscriptionsProps } from './types';

const STATUS_LABELS = { paid: 'Pagada', pending: 'Pendiente de pago', partial: 'Pago parcial' } as const;

/** Nombre abreviado y sin mail: es lo único que el servidor manda de cada persona. */
export const RecentInscriptions = ({ rows }: RecentInscriptionsProps) => (
  <section aria-label="Últimas inscripciones" className="relative overflow-x-auto rounded-lg bg-white shadow">
    <table role="table" className="stacked-table min-w-full divide-y divide-gray-200 text-sm">
      <thead role="rowgroup" className="bg-gray-50">
        <tr role="row">
          {['Alumna', 'Fecha', 'Precio', 'Estado'].map((header) => (
            <th role="columnheader" key={header} scope="col" className="px-4 py-3 text-left font-semibold text-gray-600">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className="divide-y divide-gray-100">
        {rows.map((row, index) => (
          <tr role="row" key={`${row.date}-${index}`}>
            <td role="cell" data-label="Alumna" className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
            <td role="cell" data-label="Fecha" className="whitespace-nowrap px-4 py-3">{formatDate(row.date)}</td>
            <td role="cell" data-label="Precio" className="whitespace-nowrap px-4 py-3">{formatMoney(row.price)}</td>
            <td role="cell" data-label="Estado" className="px-4 py-3">{STATUS_LABELS[row.status]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export default RecentInscriptions;
