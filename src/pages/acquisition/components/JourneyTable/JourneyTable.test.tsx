import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VISIT_ID, journeysResponse } from '../../testing/fixtures';
import { JourneyTable } from '.';

const setup = (props = {}) => {
  const onSelect = vi.fn();
  const onPageChange = vi.fn();
  const response = journeysResponse();
  render(<JourneyTable journeys={response.data.journeys} pagination={response.pagination} timezone="America/Argentina/Tucuman" onSelect={onSelect} onPageChange={onPageChange} {...props} />);
  return { onSelect, onPageChange };
};

describe('JourneyTable', () => {
  it('shows only the first 8 characters of each id', () => {
    setup();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.queryByText(VISIT_ID)).not.toBeInTheDocument();
  });

  it('summarizes each journey: channel, landing, device, furthest step, outcome', () => {
    setup();
    const row = screen.getByText('12345678').closest('tr') as HTMLElement;
    for (const text of ['Meta Ads', 'curso', 'Celular', 'Compró', 'Sí']) expect(row).toHaveTextContent(text);
    expect(row).toHaveTextContent(/100\.000/);
    expect(row).toHaveTextContent('12:00');
  });

  it('flags journeys with more events than the server shows', () => {
    setup();
    expect(within(screen.getByText('ffffffff').closest('tr') as HTMLElement).getByText(/truncado/i)).toBeInTheDocument();
  });

  it('opens a journey with the full id', async () => {
    const { onSelect } = setup();
    await userEvent.click(screen.getByRole('button', { name: /ver recorrido 12345678/i }));
    expect(onSelect).toHaveBeenCalledWith(VISIT_ID);
  });

  it('paginates through the server', async () => {
    const { onPageChange } = setup();
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
