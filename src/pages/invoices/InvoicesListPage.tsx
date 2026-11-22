import { useState } from 'react';
import toast from 'react-hot-toast';
import Pagination from '@/components/shared/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { resendInvoice, retryInvoice } from '@/services/invoices/invoiceService';
import InvoicesTable from './components/InvoicesTable';
import type { InvoiceStatusFilter } from './types';
import { useInvoices } from './useInvoices';

const STATUS_OPTIONS: Array<{ value: InvoiceStatusFilter; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'authorized', label: 'Autorizadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'failed', label: 'Con error' },
];
const FIELD = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

const errorText = (error: unknown, fallback: string): string => (error instanceof Error ? error.message : fallback);

interface ActionOutcome {
  message: string;
  /** False when the action ran but did not get the invoice where the admin wanted it. */
  ok: boolean;
}

/** What a retry really did: issued now, already issued by someone else, refused by ARCA, or still waiting. */
const describeRetry = ({ status, issued }: { status: string; issued: boolean }): ActionOutcome => {
  if (status === 'authorized') {
    return { ok: true, message: issued ? 'Factura emitida y enviada' : 'La factura ya estaba autorizada' };
  }
  if (status === 'failed') return { ok: false, message: 'ARCA rechazó la factura: revisá el detalle del error' };
  return { ok: false, message: 'La factura sigue pendiente: ARCA no respondió' };
};

const InvoicesListPage = () => {
  const [status, setStatus] = useState<InvoiceStatusFilter>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [busyId, setBusyId] = useState<string | null>(null);
  const q = useDebounce(search.trim(), 500);

  const { state, reload } = useInvoices({ page, limit, status: status || undefined, q: q || undefined });
  const hasFilters = Boolean(status || q);

  const runAction = async (id: string, action: () => Promise<ActionOutcome>, failure: string) => {
    setBusyId(id);
    try {
      const outcome = await action();
      (outcome.ok ? toast.success : toast.error)(outcome.message);
      reload();
    } catch (error) {
      toast.error(errorText(error, failure));
    } finally {
      setBusyId(null);
    }
  };

  const handleResend = (id: string) =>
    runAction(id, async () => (await resendInvoice(id), { ok: true, message: 'Mail reenviado' }), 'No se pudo reenviar el mail');
  const handleRetry = (id: string) =>
    runAction(id, async () => describeRetry(await retryInvoice(id)), 'No se pudo reintentar la factura');

  const total = state.status === 'ready' ? state.total : 0;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Estado
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as InvoiceStatusFilter);
              setPage(1);
            }}
            className={FIELD}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Buscar por nombre o mail
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className={FIELD}
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {state.status === 'loading' && (
          <p role="status" className="p-8 text-center text-gray-500">
            Cargando facturas…
          </p>
        )}
        {state.status === 'error' && (
          <div role="alert" className="p-8 text-center">
            <p className="text-red-700">{state.message}</p>
            <button type="button" onClick={reload} className="mt-3 rounded-md border px-4 py-2 text-sm font-medium">
              Reintentar carga
            </button>
          </div>
        )}
        {state.status === 'ready' && state.items.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            {hasFilters ? 'No hay facturas con esos filtros.' : 'Todavía no hay facturas.'}
          </p>
        )}
        {state.status === 'ready' && state.items.length > 0 && (
          <InvoicesTable rows={state.items} busyId={busyId} onResend={handleResend} onRetry={handleRetry} />
        )}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          totalItems={total}
          itemsPerPage={limit}
          handlePrevPage={() => setPage((value) => Math.max(1, value - 1))}
          handleNextPage={() => setPage((value) => value + 1)}
          handleItemsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default InvoicesListPage;
