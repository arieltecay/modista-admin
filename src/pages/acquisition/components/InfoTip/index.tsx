import { useId, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { InfoTipProps } from './types';

/**
 * Formula, source and limits of a metric. Reachable by hover, keyboard focus and tap (touch screens
 * have neither hover nor reliable focus on buttons), and dismissible with Escape.
 */
export const InfoTip = ({ label, help }: InfoTipProps) => {
  const tipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const visibility = isOpen ? 'visible' : isDismissed ? 'invisible' : 'invisible group-focus-within:visible group-hover:visible';

  return (
    <span className="group relative inline-flex" onMouseLeave={() => setIsDismissed(false)} onBlur={() => setIsDismissed(false)}>
      <button
        type="button"
        aria-label={`Cómo se calcula ${label}`}
        aria-describedby={tipId}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          setIsDismissed(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          setIsOpen(false);
          setIsDismissed(true);
        }}
        className="rounded-full text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <InformationCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        id={tipId}
        className={`absolute left-0 top-6 z-20 w-64 max-w-[80vw] space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal text-slate-600 shadow-lg ${visibility}`}
      >
        <span className="block"><strong>Fórmula:</strong> {help.formula}</span>
        <span className="block"><strong>Fuente:</strong> {help.source}</span>
        <span className="block"><strong>Límites:</strong> {help.limits}</span>
      </span>
    </span>
  );
};
