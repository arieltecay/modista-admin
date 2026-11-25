import { formatCurrency, formatInteger, formatPercent } from '../../utils/format';
import { METRIC_HELP } from '../../utils/metrics';
import { InfoTip } from '../InfoTip';
import type { OverviewCardsProps } from './types';

export const OverviewCards = ({ overview, coverage, reportingMode, outcomeWindowDays, outcomesComplete }: OverviewCardsProps) => {
  const isCohort = reportingMode === 'acquisition_cohort';
  // Conversion rates only make sense when visits and outcomes belong to the same cohort.
  const rate = (value: number | null) => (isCohort ? formatPercent(value) : 'No aplica');
  const cards = [
    { key: 'visits', label: 'Visitas medibles', value: formatInteger(overview.visits) },
    { key: 'visitors', label: 'Visitantes únicos', value: formatInteger(overview.visitors) },
    { key: 'attributableVisits', label: 'Visitas atribuibles', value: formatInteger(overview.attributableVisits) },
    { key: 'leads', label: 'Leads', value: formatInteger(overview.leads) },
    { key: 'purchases', label: 'Compras completas', value: formatInteger(overview.purchases) },
    { key: 'partialPayments', label: 'Pagos parciales', value: formatInteger(overview.partialPayments) },
    { key: 'revenue', label: 'Ingresos cobrados', value: formatCurrency(overview.revenue) },
    { key: 'leadRate', label: 'Visita→lead', value: rate(overview.leadRate) },
    { key: 'purchaseRate', label: 'Visita→compra', value: rate(overview.purchaseRate) },
    { key: 'attributionCoverage', label: 'Cobertura de atribución', value: formatPercent(coverage.attributionCoverage) },
    { key: 'measurementCoverage', label: 'Cobertura de medición', value: coverage.measurementCoverage === null ? 'No disponible' : formatPercent(coverage.measurementCoverage) },
  ];

  return (
    <div className="space-y-3">
      {isCohort && outcomesComplete === false && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          La ventana de resultados ({outcomeWindowDays} días) no terminó: los leads y las compras de la cohorte pueden seguir creciendo.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.key} className="relative rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <h3>{card.label}</h3>
              <InfoTip label={card.label} help={METRIC_HELP[card.key]} />
            </div>
            <p className="mt-1 break-words text-base font-bold sm:text-2xl text-slate-900">{card.value}</p>
          </article>
        ))}
      </div>
      {overview.unlinked && (
        <p className="text-sm text-slate-600">
          Conversiones sin recorrido enlazable: {formatInteger(overview.unlinked.leads)} leads, {formatInteger(overview.unlinked.purchases)} compras,{' '}
          {formatCurrency(overview.unlinked.revenue)} cobrados.
        </p>
      )}
    </div>
  );
};
