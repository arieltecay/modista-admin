import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SectionState } from '.';

const renderState = (props: Partial<Parameters<typeof SectionState>[0]> = {}) =>
  render(
    <SectionState title="Canales" isLoading={false} hasError={false} isEmpty={false} emptyMessage="Sin datos en el rango" {...props}>
      <p>contenido</p>
    </SectionState>,
  );

describe('SectionState', () => {
  it('shows a busy indicator, not the content, while loading', () => {
    renderState({ isLoading: true });
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('contenido')).not.toBeInTheDocument();
  });

  it('shows the failure with a retry, never the empty message', async () => {
    const onRetry = vi.fn();
    renderState({ hasError: true, onRetry });
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo cargar/i);
    expect(screen.queryByText('Sin datos en el rango')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty message when the request worked but there is nothing', () => {
    renderState({ isEmpty: true });
    expect(screen.getByText('Sin datos en el rango')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the old data visible but flagged when a refresh failed (stale)', () => {
    renderState({ isStale: true });
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/datos anteriores/i);
  });

  it('renders the content when everything is fine, under a heading', () => {
    renderState();
    expect(screen.getByRole('heading', { name: 'Canales' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
