import { Link, useParams } from 'react-router-dom';
import CouponKpis from './components/CouponKpis';
import CouponStatusBadge from './components/CouponStatusBadge';
import RecentInscriptions from './components/RecentInscriptions';
import UsageByDay from './components/UsageByDay';
import { useCouponDetail } from './useCouponDetail';
import { useToggleCoupon } from './useToggleCoupon';
import { discountLabel, formatDate, formatMoney, usageLabel } from './utils/format';

const conversion = (uses: number, started: number): string => (started > 0 ? `${Math.round((uses / started) * 100)} %` : '—');

const CouponDetailPage = () => {
  const { id } = useParams();
  const { state, reload } = useCouponDetail(id);
  const { busyId, toggle } = useToggleCoupon(reload);

  if (state.status === 'loading') return <p role="status" className="p-8 text-center text-gray-500">Cargando cupón…</p>;
  if (state.status === 'error') {
    return (
      <div role="alert" className="p-8 text-center">
        <p className="text-red-700">{state.message}</p>
        <button type="button" onClick={reload} className="mt-3 rounded-md border px-4 py-2 text-sm font-medium">
          Reintentar carga
        </button>
      </div>
    );
  }

  const { coupon } = state;
  const { stats } = coupon;
  return (
    <div className="space-y-6 pb-8">
      <Link to="/admin/coupons" className="text-sm text-indigo-700">
        ← Volver a la cuponera
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all font-mono text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{coupon.code}</h1>
            <CouponStatusBadge status={coupon.status} />
          </div>
          <p className="flex flex-wrap gap-x-2 text-sm text-gray-600">
            <span>{discountLabel(coupon.type, coupon.value)}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>{coupon.courseTitle ?? 'Todos los cursos'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Vigencia: {formatDate(coupon.startsAt)} – {formatDate(coupon.endsAt)}
          </p>
        </div>
        <button type="button" disabled={busyId !== null} onClick={() => toggle(coupon.id, !coupon.active)} className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50">
          {coupon.active ? 'Pausar cupón' : 'Reanudar cupón'}
        </button>
      </header>

      <CouponKpis
        title="Estadísticas del cupón"
        items={[
          { label: 'Inscripciones iniciadas', value: String(stats.started) },
          { label: 'Usos pagos', value: usageLabel(stats.uses, coupon.maxUses) },
          { label: 'Descuento otorgado', value: formatMoney(stats.discountTotal) },
          { label: 'Ingreso neto', value: formatMoney(stats.netRevenue) },
          { label: 'Conversión', value: conversion(stats.uses, stats.started) },
        ]}
      />

      <section aria-label="Usos por día" className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Usos por día</h2>
        {stats.daily.length === 0 ? <p className="text-gray-500">Todavía no se usó este cupón.</p> : <UsageByDay days={stats.daily} />}
      </section>

      {stats.recent.length > 0 && <RecentInscriptions rows={stats.recent} />}
    </div>
  );
};

export default CouponDetailPage;
