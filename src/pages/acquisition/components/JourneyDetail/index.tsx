import { useEffect, useRef } from 'react';
import { formatCurrency, formatDateTime, shortId } from '../../utils/format';
import { CHANNEL_LABELS, DEVICE_LABELS, EVENT_SOURCE_LABELS, PAYMENT_STATUS_LABELS, STEP_LABELS, labelOf } from '../../utils/labels';
import type { JourneyDetailProps } from './types';

/**
 * Attribution and timeline of one visit. Campaign, source and medium come from the visitor's URL,
 * so they are always rendered as text.
 */
export const JourneyDetail = ({ detail, timezone, onClose }: JourneyDetailProps) => {
  const { visit } = detail;
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Opening a journey sits far from the row that opened it, so keyboard focus follows it.
  useEffect(() => headingRef.current?.focus(), []);
  const attribution: Array<[string, string | undefined]> = [
    ['Canal', labelOf(CHANNEL_LABELS, visit.channelGroup)],
    ['Plataforma', visit.sourcePlatform],
    ['Tipo', visit.acquisitionType],
    ['Fuente', visit.rawAttribution.source],
    ['Medio', visit.rawAttribution.medium],
    ['Campaña', visit.rawAttribution.campaign],
    ['Landing', visit.landingSlug ?? visit.entryPath],
    ['Referrer', visit.referrerHost],
    ['Dispositivo', labelOf(DEVICE_LABELS, visit.device)],
    ['Cookies de Meta', `${visit.hasFbc ? 'fbc' : 'sin fbc'} · ${visit.hasFbp ? 'fbp' : 'sin fbp'}`],
  ];

  return (
    <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex items-center justify-between">
        <h3 ref={headingRef} tabIndex={-1} className="font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">Recorrido {shortId(visit.visitId)}</h3>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50">
          Cerrar
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-3">
        {attribution.filter(([, value]) => value).map(([term, value]) => (
          <div key={term} className="min-w-0">
            <dt className="text-xs text-slate-500">{term}</dt>
            <dd className="break-words text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      {detail.truncated && <p className="text-sm text-amber-800">Esta visita tiene más eventos de los que se muestran.</p>}
      <ol className="space-y-1 border-l-2 break-words border-indigo-200 pl-4 text-sm">
        {detail.events.map((event, index) => (
          <li key={`${event.occurredAt}-${event.name}-${index}`}>
            <span className="mr-2 tabular-nums text-slate-500">{formatDateTime(event.occurredAt, timezone)}</span>
            <span className="font-medium text-slate-900">{labelOf(STEP_LABELS, event.name)}</span>
            <span className="ml-2 text-xs text-slate-500">({labelOf(EVENT_SOURCE_LABELS, event.source)}){event.path ? ` ${event.path}` : ''}</span>
          </li>
        ))}
      </ol>
      {detail.conversions.length > 0 && (
        <ul className="space-y-1 text-sm">
          {detail.conversions.map((conversion) => (
            <li key={conversion.inscriptionId}>
              <span className="font-medium">{labelOf(PAYMENT_STATUS_LABELS, conversion.paymentStatus)}</span>
              <span className="ml-2 text-slate-600">cobrado {formatCurrency(conversion.collected)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
