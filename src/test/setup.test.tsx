import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('renders React into a DOM and exposes jest-dom matchers', () => {
    render(<button type="button" disabled>Actualizar</button>);
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeDisabled();
  });
});
