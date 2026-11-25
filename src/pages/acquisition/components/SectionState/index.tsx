import { useId } from 'react';
import type { SectionStateProps } from './types';

/** One card per report that keeps loading, failure, emptiness and staleness visibly different. */
export const SectionState = ({ title, isLoading, hasError, isEmpty, emptyMessage, children, isStale = false, onRetry }: SectionStateProps) => {
  const headingId = useId();

  const body = () => {
    if (isLoading) {
      return (
        <div role="status" aria-busy="true" className="h-24 animate-pulse rounded-xl bg-slate-100">
          <span className="sr-only">Cargando…</span>
        </div>
      );
    }
    if (hasError && !isStale) {
      return (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>No se pudo cargar esta sección.</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className="rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100">
              Reintentar
            </button>
          )}
        </div>
      );
    }
    if (isEmpty) return <p className="text-sm text-slate-500">{emptyMessage}</p>;
    return (
      <>
        {isStale && (
          <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Mostrando datos anteriores: no se pudo actualizar.
          </p>
        )}
        {children}
      </>
    );
  };

  return (
    <section aria-labelledby={headingId} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <h2 id={headingId} className="text-lg font-bold text-slate-900">{title}</h2>
      {body()}
    </section>
  );
};
