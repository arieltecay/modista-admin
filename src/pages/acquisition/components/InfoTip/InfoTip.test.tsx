import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InfoTip } from '.';

describe('InfoTip', () => {
  it('exposes formula, source and limits to everyone, including screen readers', () => {
    render(<InfoTip label="Visita→lead" help={{ formula: 'leads / visitas', source: 'Telemetría propia', limits: 'Solo con consentimiento' }} />);
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip).toHaveTextContent('leads / visitas');
    expect(tip).toHaveTextContent('Telemetría propia');
    expect(tip).toHaveTextContent('Solo con consentimiento');
    expect(screen.getByRole('button', { name: /cómo se calcula visita→lead/i })).toHaveAttribute('aria-describedby', tip.id);
  });

  it('opens on tap (touch devices have no hover or focus) and closes with Escape', async () => {
    render(<InfoTip label="Leads" help={{ formula: 'a / b', source: 'Pagos', limits: 'Ninguno conocido' }} />);
    const button = screen.getByRole('button', { name: /cómo se calcula leads/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes with a second tap or a tap outside, and takes no space while closed', async () => {
    render(<InfoTip label="Leads" help={{ formula: 'a / b', source: 'Pagos', limits: 'Ninguno conocido' }} />);
    const button = screen.getByRole('button', { name: /cómo se calcula leads/i });
    const tip = screen.getByRole('tooltip', { hidden: true });
    expect(tip).toHaveClass('hidden');

    await userEvent.click(button);
    expect(tip).toHaveClass('block');
    await userEvent.click(button);
    expect(tip).toHaveClass('hidden');
    expect(tip).not.toHaveClass('sm:group-focus-within:block');

    await userEvent.click(button);
    await userEvent.click(document.body);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays closed when a touch outside closes it but the focus stays', () => {
    render(<InfoTip label="Leads" help={{ formula: 'a / b', source: 'Pagos', limits: 'Ninguno conocido' }} />);
    const button = screen.getByRole('button', { name: /cómo se calcula leads/i });
    const tip = screen.getByRole('tooltip', { hidden: true });
    act(() => button.focus());
    fireEvent.click(button);
    fireEvent.pointerDown(document.body);
    fireEvent.mouseLeave(button.parentElement as HTMLElement);
    expect(button).toHaveFocus();
    expect(tip).toHaveClass('hidden');
    expect(tip).not.toHaveClass('sm:group-focus-within:block');

    act(() => button.blur());
    expect(tip).toHaveClass('sm:group-focus-within:block');
  });
});
