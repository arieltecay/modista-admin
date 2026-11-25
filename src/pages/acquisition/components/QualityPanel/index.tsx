import { formatDateTime, formatInteger, formatPercent } from '../../utils/format';
import { RULE_TITLES, SEVERITY_LABELS, labelOf } from '../../utils/labels';
import type { QualityPanelProps } from './types';

const SEVERITY_STYLE = {
  info: 'bg-sky-100 text-sky-800',
  warning: 'bg-amber-100 text-amber-800',
  critical: 'bg-red-100 text-red-800',
};

export const QualityPanel = ({ rules, evaluated, capi, identifiers, tracking, timezone }: QualityPanelProps) => (
  <div className="space-y-4">
    {tracking.stale && (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Sin actividad reciente: el último dato llegó {tracking.lastActivityAt ? formatDateTime(tracking.lastActivityAt, timezone) : 'nunca'}.
      </p>
    )}

    {rules.length === 0 ? (
      <p className="text-sm text-emerald-700">Todas las reglas pasaron ({evaluated.length} revisadas).</p>
    ) : (
      <ul className="space-y-3">
        {rules.map((rule) => (
          <li key={rule.code} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[rule.severity]}`}>{labelOf(SEVERITY_LABELS, rule.severity)}</span>
              <span className="font-semibold text-slate-900">{labelOf(RULE_TITLES, rule.code)}</span>
              <span className="text-xs text-slate-500">
                {formatInteger(rule.affected)} de {formatInteger(rule.universe)} ({formatPercent(rule.percentage)})
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{rule.explanation}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{rule.action}</p>
            {rule.firstOccurrence && rule.lastOccurrence && (
              <p className="mt-1 text-xs text-slate-500">
                Entre {formatDateTime(rule.firstOccurrence, timezone)} y {formatDateTime(rule.lastOccurrence, timezone)}
              </p>
            )}
          </li>
        ))}
      </ul>
    )}

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section aria-label="Entrega a Meta (CAPI)" className="rounded-xl bg-slate-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold text-slate-800">Entrega a Meta (CAPI)</h3>
        <ul className="grid grid-cols-2 gap-1 text-slate-600">
          <li>Aceptados {formatInteger(capi.accepted)}</li>
          <li>Entregados {formatInteger(capi.delivered)}</li>
          <li>Pendientes {formatInteger(capi.pending)}</li>
          <li>Con reintentos {formatInteger(capi.retry)}</li>
          <li>Agotados {formatInteger(capi.exhausted)}</li>
        </ul>
      </section>
      <section aria-label="Identificadores de Meta" className="rounded-xl bg-slate-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold text-slate-800">Identificadores de Meta</h3>
        <ul className="space-y-1 text-slate-600">
          <li className="flex justify-between"><span>Visitas con _fbc</span><strong>{formatPercent(identifiers.fbcCoverage)}</strong></li>
          <li className="flex justify-between"><span>Visitas con _fbp</span><strong>{formatPercent(identifiers.fbpCoverage)}</strong></li>
        </ul>
      </section>
    </div>
  </div>
);
