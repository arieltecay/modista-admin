import { useState } from 'react';
import GlobalModal from '@/components/shared/GlobalModal';
import Pagination from '@/components/shared/Pagination';
import CouponForm from './components/CouponForm';
import CouponKpis from './components/CouponKpis';
import CouponsFilters from './components/CouponsFilters';
import CouponsTable from './components/CouponsTable';
import type { CouponStatusFilter } from './types';
import { useCoupons } from './useCoupons';
import { useCouponSummary } from './useCouponSummary';
import { useCourseOptions } from './useCourseOptions';
import { useCreateCoupon } from './useCreateCoupon';
import { useToggleCoupon } from './useToggleCoupon';
import { formatMoney } from './utils/format';

const CouponsPage = () => {
  const [status, setStatus] = useState<CouponStatusFilter>('');
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);

  const courses = useCourseOptions();
  const { state, reload } = useCoupons({ page, limit, status: status || undefined, courseId: courseId || undefined });
  const { summary, reload: reloadSummary } = useCouponSummary();
  const hasFilters = Boolean(status || courseId);
  const total = state.status === 'ready' ? state.total : 0;

  const refresh = () => {
    reload();
    reloadSummary();
  };

  const { busyId, toggle } = useToggleCoupon(refresh);
  const { submitting, error: formError, create, clearError } = useCreateCoupon(() => {
    setFormOpen(false);
    setPage(1);
    refresh();
  });

  const openForm = () => {
    clearError();
    setFormOpen(true);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Cuponera</h1>
        <button type="button" onClick={openForm} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Nuevo cupón
        </button>
      </div>

      <CouponKpis
        title="Resumen de cupones"
        items={[
          { label: 'Cupones activos', value: summary ? String(summary.activeCoupons) : '—' },
          { label: 'Usos pagos', value: summary ? String(summary.uses) : '—' },
          { label: 'Descuento otorgado', value: summary ? formatMoney(summary.discountTotal) : '—' },
          { label: 'Ingreso neto', value: summary ? formatMoney(summary.netRevenue) : '—' },
        ]}
      />

      <CouponsFilters
        status={status}
        courseId={courseId}
        courses={courses}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCourseChange={(value) => {
          setCourseId(value);
          setPage(1);
        }}
      />

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {state.status === 'loading' && (
          <p role="status" className="p-8 text-center text-gray-500">
            Cargando cupones…
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
          <p className="p-8 text-center text-gray-500">{hasFilters ? 'No hay cupones con esos filtros.' : 'Todavía no creaste cupones.'}</p>
        )}
        {state.status === 'ready' && state.items.length > 0 && <CouponsTable rows={state.items} busyId={busyId} onToggle={toggle} />}
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

      <GlobalModal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Nuevo cupón" size="lg">
        <CouponForm courses={courses} submitting={submitting} serverError={formError} onSubmit={create} onCancel={() => setFormOpen(false)} />
      </GlobalModal>
    </div>
  );
};

export default CouponsPage;
