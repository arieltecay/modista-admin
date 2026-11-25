import { useEffect, useId, useRef, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { InfoTipProps } from './types';

/**
 * Formula, source and limits of a metric. Reachable by hover, keyboard focus and tap (touch screens
 * have neither hover nor reliable focus on buttons), and dismissible with Escape or a tap outside.
 * On phones it is a panel at the bottom of the screen, opened only by tap (on focus it could cover its own button); from `sm` it spans the nearest `relative` ancestor (the card).
 * Closed it is `hidden`, not `invisible`: an invisible box still widens the page and makes it scroll sideways.
 */
export const InfoTip = ({ label, help }: InfoTipProps) => {
  const tipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        // A touch that becomes a scroll keeps the focus here, and focus alone would show it again.
        setIsDismissed(true);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [isOpen]);

  const visibility = isOpen ? 'block' : isDismissed ? 'hidden' : 'hidden sm:group-focus-within:block sm:group-hover:block';

  // While the button keeps the focus, a dismissed tip must stay closed.
  const allowHoverAgain = () => {
    if (!rootRef.current?.contains(document.activeElement)) setIsDismissed(false);
  };
  const reset = () => {
    setIsOpen(false);
    setIsDismissed(false);
  };

  return (
    <span ref={rootRef} className="group inline-flex" onMouseEnter={allowHoverAgain} onMouseLeave={allowHoverAgain} onBlur={reset}>
      <button
        type="button"
        aria-label={`Cómo se calcula ${label}`}
        aria-describedby={tipId}
        aria-expanded={isOpen}
        onClick={() => {
          // Closing by tap leaves the button focused: without this it would stay open through focus.
          setIsDismissed(isOpen);
          setIsOpen(!isOpen);
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
        className={`fixed inset-x-4 bottom-4 z-20 space-y-1 sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-8 rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal text-slate-600 shadow-lg ${visibility}`}
      >
        <span className="block"><strong>Fórmula:</strong> {help.formula}</span>
        <span className="block"><strong>Fuente:</strong> {help.source}</span>
        <span className="block"><strong>Límites:</strong> {help.limits}</span>
      </span>
    </span>
  );
};
