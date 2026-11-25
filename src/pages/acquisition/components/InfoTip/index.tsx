import { useEffect, useId, useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { InfoTipProps, TipState } from './types';

const VISIBILITY: Record<TipState, string> = {
  auto: 'hidden sm:group-focus-within:block sm:group-hover:block',
  open: 'block',
  dismissed: 'hidden',
};

/**
 * Formula, source and limits of a metric. Reachable by hover, keyboard focus and tap (touch screens
 * have neither hover nor reliable focus on buttons), and dismissible with Escape or a tap outside.
 * On phones it is a panel at the bottom of the screen, opened only by tap (on focus it could cover its own button); from `sm` it spans the nearest `relative` ancestor (the card).
 * Closed it is `hidden`, not `invisible`: an invisible box still widens the page and makes it scroll sideways.
 */
export const InfoTip = ({ label, help }: InfoTipProps) => {
  const tipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  /** `auto`: shown by hover or focus. `dismissed`: closed on purpose, stays closed while it keeps the focus. */
  const [state, setState] = useState<TipState>('auto');
  const isOpen = state === 'open';

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        // A touch that becomes a scroll keeps the focus here, and focus alone would show it again.
        setState('dismissed');
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [isOpen]);

  const allowHoverAgain = () => {
    if (!rootRef.current?.contains(document.activeElement)) setState((current) => (current === 'dismissed' ? 'auto' : current));
  };

  return (
    <span ref={rootRef} className="group inline-flex" onMouseEnter={allowHoverAgain} onMouseLeave={allowHoverAgain} onBlur={() => setState('auto')}>
      <button
        type="button"
        aria-label={`Cómo se calcula ${label}`}
        aria-describedby={tipId}
        aria-expanded={isOpen}
        onClick={() => setState(isOpen ? 'dismissed' : 'open')}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setState('dismissed');
        }}
        className="rounded-full text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <InformationCircleIcon aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        id={tipId}
        className={`fixed inset-x-4 bottom-4 z-20 space-y-1 sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-8 rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal text-slate-600 shadow-lg ${VISIBILITY[state]}`}
      >
        <span className="block"><strong>Fórmula:</strong> {help.formula}</span>
        <span className="block"><strong>Fuente:</strong> {help.source}</span>
        <span className="block"><strong>Límites:</strong> {help.limits}</span>
      </span>
    </span>
  );
};
