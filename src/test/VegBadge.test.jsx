import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VegBadge from '../components/menu/VegBadge';

describe('VegBadge', () => {
  it('renders veg badge', () => {
    const { container } = render(<VegBadge type="veg" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders non-veg badge', () => {
    const { container } = render(<VegBadge type="non-veg" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders beverage badge', () => {
    const { container } = render(<VegBadge type="beverage" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders mocktail badge', () => {
    const { container } = render(<VegBadge type="mocktail" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('does not crash with unknown type', () => {
    expect(() => render(<VegBadge type="unknown" />)).not.toThrow();
  });
});
