import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { journeyDetailResponse } from '../../testing/fixtures';
import { JourneyDetail } from '.';

const setup = (campaign = 'black') => {
  const onClose = vi.fn();
  render(<JourneyDetail detail={journeyDetailResponse(campaign).data} timezone="America/Argentina/Tucuman" onClose={onClose} />);
  return { onClose };
};

describe('JourneyDetail', () => {
  it('shows the attribution and the timeline in order, with readable event names', () => {
    setup();
    expect(screen.getByText('Meta Ads')).toBeInTheDocument();
    expect(screen.getByText('black')).toBeInTheDocument();
    const events = screen.getAllByRole('listitem');
    expect(events[0]).toHaveTextContent('Vio el curso');
    expect(events[0]).toHaveTextContent('12:01');
    expect(events[1]).toHaveTextContent('Lead registrado');
    expect(events[1]).toHaveTextContent(/servidor/i);
  });

  it('shows the conversions with their payment state and collected amount, never a person', () => {
    setup();
    expect(screen.getByText(/pagada/i).closest('li')).toHaveTextContent(/100\.000/);
  });

  it('renders campaign text from the URL as plain text (it is controlled by visitors)', () => {
    setup('<img src=x onerror=alert(1)>');
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('can be closed', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('moves focus to its heading when it opens, so keyboard users land on it', () => {
    setup();
    expect(screen.getByRole('heading', { name: /recorrido 12345678/i })).toHaveFocus();
  });
});
