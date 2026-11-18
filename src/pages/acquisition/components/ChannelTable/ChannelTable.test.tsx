import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { channelRows } from '../../testing/fixtures';
import { ChannelTable } from '.';

const setup = (props = {}) => render(<ChannelTable rows={channelRows} unlinked={null} isCohort {...props} />);
const channelsInOrder = () => within(screen.getByRole('table')).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);

describe('ChannelTable', () => {
  it('uses readable channel names and orders by revenue by default', () => {
    setup();
    expect(channelsInOrder()).toEqual(['Meta Ads', 'Google Ads', 'Directo']);
    expect(screen.getByRole('columnheader', { name: /ingresos/i })).toHaveAttribute('aria-sort', 'descending');
  });

  it('sorts by any column and toggles the direction', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /^visitas/i }));
    expect(channelsInOrder()).toEqual(['Directo', 'Meta Ads', 'Google Ads']);
    expect(screen.getByRole('columnheader', { name: /visitas/i })).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(screen.getByRole('button', { name: /^visitas/i }));
    expect(channelsInOrder()).toEqual(['Google Ads', 'Meta Ads', 'Directo']);
    expect(screen.getByRole('columnheader', { name: /visitas/i })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('shows money, rates and shares formatted, and dashes where there is nothing', () => {
    setup();
    const meta = screen.getByText('Meta Ads').closest('tr') as HTMLElement;
    expect(meta).toHaveTextContent(/100\.000/);
    expect(meta).toHaveTextContent(/30,0\s?%/);
    expect(meta).toHaveTextContent(/50,0\s?%/);
    expect(screen.getByText('Directo').closest('tr')).toHaveTextContent('—');
  });

  it('does not show conversion rates for an event-period report', () => {
    setup({ isCohort: false, rows: channelRows.map((row) => ({ ...row, leadRate: null, purchaseRate: null })) });
    expect(screen.getByText('Meta Ads').closest('tr')).not.toHaveTextContent(/30,0\s?%/);
  });

  it('lists conversions with no linkable journey as their own line', () => {
    setup({ unlinked: { leads: 2, purchases: 1, partialPayments: 0, revenue: 40000 } });
    const row = screen.getByText(/sin recorrido enlazable/i).closest('tr') as HTMLElement;
    expect(row).toHaveTextContent(/40\.000/);
  });

  it('is an accessible table with a caption and column headers', () => {
    setup();
    expect(screen.getByRole('table', { name: /canales/i })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(5);
  });
});
