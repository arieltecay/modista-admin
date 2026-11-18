import { describe, expect, it } from 'vitest';
import { METRIC_HELP } from './metrics';

describe('metric help', () => {
  it('documents formula, source and limits for every metric the panel shows', () => {
    const keys = ['visits', 'visitors', 'attributableVisits', 'leads', 'purchases', 'partialPayments', 'revenue', 'leadRate', 'purchaseRate', 'attributionCoverage', 'measurementCoverage'];
    for (const key of keys) {
      const help = METRIC_HELP[key];
      expect(help, key).toBeDefined();
      for (const field of [help.formula, help.source, help.limits]) expect(field.length, key).toBeGreaterThan(10);
    }
  });

  it('keeps the formulas aligned with the report definitions', () => {
    expect(METRIC_HELP.leadRate.formula).toMatch(/leads.*visitas/i);
    expect(METRIC_HELP.purchaseRate.formula).toMatch(/compras.*visitas/i);
    expect(METRIC_HELP.attributionCoverage.formula).toMatch(/visitas.*canal conocido.*visitas medibles/i);
    expect(METRIC_HELP.revenue.source).toMatch(/pagos/i);
    expect(METRIC_HELP.measurementCoverage.limits).toMatch(/no disponible|fuente independiente/i);
  });
});
