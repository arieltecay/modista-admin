import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { funnelResponse } from '../../testing/fixtures';
import { FunnelView } from '.';

describe('FunnelView', () => {
  it('lists every step with readable names, counts and rates', () => {
    const { data } = funnelResponse(false);
    render(<FunnelView steps={data.steps} independentCounts={false} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(11);
    expect(screen.getByText('Vio el curso').closest('li')).toHaveTextContent(/91/);
    expect(screen.getByText('Compró').closest('li')).toHaveTextContent(/10/);
    expect(screen.getByText('Vio el curso').closest('li')).toHaveTextContent(/91,0\s?%/);
  });

  it('draws bars proportional to the top of the funnel', () => {
    const { data } = funnelResponse(false);
    render(<FunnelView steps={data.steps} independentCounts={false} />);
    expect(screen.getByRole('meter', { name: /visitas/i })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('meter', { name: /compró/i })).toHaveAttribute('aria-valuenow', '10');
  });

  it('says the steps are independent counts and shows no rates for them', () => {
    const { data } = funnelResponse(true);
    render(<FunnelView steps={data.steps} independentCounts />);
    expect(screen.getByRole('note')).toHaveTextContent(/conteos independientes/i);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
