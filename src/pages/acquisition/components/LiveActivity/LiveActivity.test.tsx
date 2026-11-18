import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { liveResponse } from '../../testing/fixtures';
import { LiveActivity } from '.';

const setup = (props = {}) => {
  const onWindowChange = vi.fn();
  render(<LiveActivity data={liveResponse().data} windowMinutes={15} timezone="America/Argentina/Tucuman" onWindowChange={onWindowChange} {...props} />);
  return { onWindowChange };
};

describe('LiveActivity', () => {
  it('shows active visits, events and the channel split', () => {
    setup();
    expect(screen.getByText('Visitas activas').closest('div')).toHaveTextContent('3');
    expect(screen.getByText('Eventos en la ventana').closest('div')).toHaveTextContent('12');
    expect(screen.getByText('Meta Ads')).toBeInTheDocument();
  });

  it('charts events per minute with accessible values', () => {
    setup();
    const bars = screen.getAllByRole('img', { name: /eventos a las/i });
    expect(bars).toHaveLength(3);
    expect(bars[1]).toHaveAccessibleName(/11:59.*8/);
  });

  it('lists recent anonymized events with the local time', () => {
    setup();
    const item = screen.getByText('Tocó el botón de inscripción').closest('li') as HTMLElement;
    expect(item).toHaveTextContent('abcd1234');
    expect(item).toHaveTextContent('11:59');
    expect(item).toHaveTextContent('Meta Ads');
  });

  it('lets the user pick the window', async () => {
    const { onWindowChange } = setup();
    await userEvent.selectOptions(screen.getByLabelText('Ventana'), '60');
    expect(onWindowChange).toHaveBeenCalledWith(60);
  });

  it('says so when nothing happened', () => {
    setup({ data: { ...liveResponse().data, activeVisits: 0, eventsInWindow: 0, recentEvents: [], activeByChannel: [] } });
    expect(screen.getByText(/sin actividad/i)).toBeInTheDocument();
  });
});
