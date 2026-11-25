import { formatInteger, formatPercent } from '../../utils/format';
import { FUNNEL_LABELS, labelOf } from '../../utils/labels';
import type { FunnelViewProps } from './types';

export const FunnelView = ({ steps, independentCounts }: FunnelViewProps) => {
  const largest = Math.max(1, ...steps.map((step) => step.visits));

  return (
    <div className="space-y-3">
      {independentCounts && (
        <p role="note" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-800">
          Conteos independientes: cada paso cuenta las visitas que tuvieron ese evento en el período. No son subconjuntos del paso anterior, por eso no se muestran tasas entre pasos.
        </p>
      )}
      <ol className="space-y-2">
        {steps.map((step) => {
          const label = labelOf(FUNNEL_LABELS, step.step);
          const width = Math.round((step.visits / largest) * 100);
          return (
            <li key={step.step} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
              <span className="text-slate-700 sm:truncate">{label}</span>
              <div
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={width}
                aria-valuetext={formatInteger(step.visits)}
                className="col-span-2 row-start-2 h-3 overflow-hidden sm:col-span-1 sm:row-start-auto rounded-full bg-slate-100"
              >
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${width}%` }} />
              </div>
              <span className="whitespace-nowrap tabular-nums text-slate-900">
                {formatInteger(step.visits)}
                {!independentCounts && step.conversionFromPrevious !== null && (
                  <span className="ml-2 text-xs text-slate-500">{formatPercent(step.conversionFromPrevious)} del paso anterior</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
