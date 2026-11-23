import type { LoadStateProps } from './types';

const SKELETONS = [1, 2, 3];

/** Loading, failure and emptiness look different, and a failure always offers "Reintentar". */
export const LoadState = ({
  status,
  loadingLabel,
  errorMessage,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
  skeletonClass = 'h-14 rounded-xl',
  skeletonLayoutClass = 'space-y-2',
}: LoadStateProps) => {
  if (status === 'loading') {
    return (
      <div role="status" className={skeletonLayoutClass}>
        <span className="sr-only">{loadingLabel}</span>
        {SKELETONS.map(i => <div key={i} className={`animate-pulse bg-slate-100 ${skeletonClass}`} />)}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div role="alert" className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{errorMessage}</p>
        <button type="button" onClick={onRetry} className="rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100">
          Reintentar
        </button>
      </div>
    );
  }
  if (isEmpty) return <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{emptyMessage}</div>;
  return <>{children}</>;
};
