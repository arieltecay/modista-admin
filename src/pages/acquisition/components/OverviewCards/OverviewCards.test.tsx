import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OverviewCards } from '.';

const overview = { visits: 9, visitors: 8, attributableVisits: 8, leads: 4, purchases: 2, partialPayments: 1, revenue: 190000, leadRate: 4 / 9, purchaseRate: 2 / 9, averageTicket: 95000, unlinked: null };
const coverage = { observedConsentedVisits: 9, knownChannelVisits: 8, attributionCoverage: 8 / 9, measurementCoverage: null };
const setup = (props = {}) => render(<OverviewCards overview={overview} coverage={coverage} reportingMode="acquisition_cohort" outcomeWindowDays={30} outcomesComplete {...props} />);

describe('OverviewCards', () => {
  it('shows the headline numbers formatted', () => {
    setup();
    expect(screen.getByText('Visitas medibles').closest('article')).toHaveTextContent('9');
    expect(screen.getByText('Ingresos cobrados').closest('article')).toHaveTextContent(/190\.000/);
    expect(screen.getByText('Visita→lead').closest('article')).toHaveTextContent(/44,4\s?%/);
    expect(screen.getByText('Cobertura de atribución').closest('article')).toHaveTextContent(/88,9\s?%/);
  });

  it('documents formula, source and limits of every card', () => {
    setup();
    for (const label of ['Visitas medibles', 'Ingresos cobrados', 'Visita→lead', 'Visita→compra', 'Cobertura de atribución']) {
      expect(screen.getByRole('button', { name: new RegExp(`cómo se calcula ${label}`, 'i') })).toBeInTheDocument();
    }
  });

  it('never calls consented visits "total traffic" and says the measurement coverage is unavailable', () => {
    setup();
    expect(screen.queryByText(/tráfico total/i)).not.toBeInTheDocument();
    expect(screen.getByText('Cobertura de medición').closest('article')).toHaveTextContent(/no disponible/i);
  });

  it('does not invent conversion rates for an event-period report', () => {
    setup({ reportingMode: 'event_period', outcomeWindowDays: null, overview: { ...overview, leadRate: null, purchaseRate: null } });
    expect(screen.getByText('Visita→lead').closest('article')).toHaveTextContent(/no aplica/i);
    expect(screen.getByText('Visita→compra').closest('article')).toHaveTextContent(/no aplica/i);
  });

  it('warns when the outcome window of the cohort has not finished', () => {
    setup({ outcomesComplete: false });
    expect(screen.getByRole('status')).toHaveTextContent(/ventana de resultados.*no terminó/i);
  });

  it('reports conversions without a linked journey instead of hiding them', () => {
    setup({ overview: { ...overview, unlinked: { leads: 1, purchases: 1, partialPayments: 0, revenue: 40000 } } });
    expect(screen.getByText(/sin recorrido enlazable/i)).toHaveTextContent(/40\.000/);
  });
});
