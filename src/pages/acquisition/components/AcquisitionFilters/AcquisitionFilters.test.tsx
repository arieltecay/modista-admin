import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AcquisitionFilters } from '.';

const filters = { from: '2026-10-20', to: '2026-11-18', timezone: 'America/Argentina/Tucuman', reportingMode: 'acquisition_cohort' as const, outcomeWindowDays: 30 as const, perspective: 'visit_touch' as const };
const setup = (overrides = {}) => {
  const onChange = vi.fn();
  const onRefresh = vi.fn();
  render(<AcquisitionFilters filters={{ ...filters, ...overrides }} onChange={onChange} onRefresh={onRefresh} isRefreshing={false} />);
  return { onChange, onRefresh };
};

describe('AcquisitionFilters', () => {
  it('labels every control', () => {
    setup();
    for (const label of ['Desde', 'Hasta', 'Zona horaria', 'Modo de reporte', 'Ventana de resultados', 'Perspectiva de atribución', 'Canal', 'Campaña', 'Landing', 'Dispositivo']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('reports a change with just the field that changed', async () => {
    const { onChange } = setup();
    await userEvent.selectOptions(screen.getByLabelText('Perspectiva de atribución'), 'first_touch');
    expect(onChange).toHaveBeenLastCalledWith({ perspective: 'first_touch' });
    await userEvent.selectOptions(screen.getByLabelText('Dispositivo'), 'mobile');
    expect(onChange).toHaveBeenLastCalledWith({ device: 'mobile' });
    await userEvent.selectOptions(screen.getByLabelText('Canal'), 'meta_paid');
    expect(onChange).toHaveBeenLastCalledWith({ channel: 'meta_paid' });
  });

  it('clears a filter by choosing "Todos"', async () => {
    const { onChange } = setup({ channel: 'meta_paid' });
    await userEvent.selectOptions(screen.getByLabelText('Canal'), '');
    expect(onChange).toHaveBeenLastCalledWith({ channel: undefined });
  });

  it('only offers the outcome window in cohort mode', () => {
    setup({ reportingMode: 'event_period' });
    expect(screen.getByLabelText('Ventana de resultados')).toBeDisabled();
  });

  it('asks for a refresh', async () => {
    const { onRefresh } = setup();
    await userEvent.click(screen.getByRole('button', { name: /actualizar/i }));
    expect(onRefresh).toHaveBeenCalled();
  });
});
