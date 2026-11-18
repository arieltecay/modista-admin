import { useId } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { InfoTipProps } from './types';

/** Formula, source and limits of a metric; reachable by hover, keyboard focus and screen readers. */
export const InfoTip = ({ label, help }: InfoTipProps) => {
  const tipId = useId();
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={`Cómo se calcula ${label}`}
        aria-describedby={tipId}
        className="rounded-full text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <InformationCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        id={tipId}
        className="pointer-events-none invisible absolute left-0 top-6 z-20 w-72 space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal text-slate-600 shadow-lg group-focus-within:visible group-hover:visible"
      >
        <span className="block"><strong>Fórmula:</strong> {help.formula}</span>
        <span className="block"><strong>Fuente:</strong> {help.source}</span>
        <span className="block"><strong>Límites:</strong> {help.limits}</span>
      </span>
    </span>
  );
};
