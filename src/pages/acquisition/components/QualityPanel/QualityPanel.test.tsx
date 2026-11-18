import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { qualityResponse, unknownRule } from '../../testing/fixtures';
import { QualityPanel } from '.';

const setup = (rules: Array<typeof unknownRule> = [unknownRule], overrides: Record<string, unknown> = {}) => {
  const { data } = qualityResponse(rules);
  render(<QualityPanel {...data} {...overrides} timezone="America/Argentina/Tucuman" />);
};

describe('QualityPanel', () => {
  it('explains each triggered rule in plain words, with its numbers and the recommended action', () => {
    setup();
    const rule = screen.getByText('Muchas visitas sin clasificar').closest('li') as HTMLElement;
    expect(rule).toHaveTextContent(/advertencia/i);
    expect(rule).toHaveTextContent(/12 de 40/);
    expect(rule).toHaveTextContent(/30,0\s?%/);
    expect(rule).toHaveTextContent('Revisá las UTMs de las campañas activas.');
  });

  it('distinguishes "all clear" from "not checked" by naming how many rules passed', () => {
    setup([]);
    expect(screen.getByText(/todas las reglas pasaron/i)).toHaveTextContent('3');
  });

  it('marks critical rules apart from warnings', () => {
    setup([{ ...unknownRule, severity: 'critical' }]);
    expect(screen.getByText(/crítica/i)).toBeInTheDocument();
  });

  it('shows how many CAPI events are delivered, retrying or lost', () => {
    setup();
    const capi = screen.getByRole('region', { name: /entrega a meta/i });
    expect(capi).toHaveTextContent(/entregados.*20/i);
    expect(capi).toHaveTextContent(/reintentos.*2/i);
    expect(capi).toHaveTextContent(/agotados.*1/i);
  });

  it('shows identifier coverage and warns when tracking looks stale', () => {
    setup([], { tracking: { lastActivityAt: '2026-11-18T01:00:00.000Z', stale: true } });
    expect(screen.getByText(/fbc/i).closest('li')).toHaveTextContent(/75,0\s?%/);
    expect(screen.getByRole('alert')).toHaveTextContent(/sin actividad reciente/i);
  });

  it('falls back to the code for a rule it does not know yet', () => {
    setup([{ ...unknownRule, code: 'SOME_NEW_RULE' }]);
    expect(screen.getByText('SOME_NEW_RULE')).toBeInTheDocument();
  });
});
