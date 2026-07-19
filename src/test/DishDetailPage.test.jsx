import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DishDetailPage from '../pages/DishDetailPage';
import { getAllDishes } from '../data/menuData';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div:    ({ children, ...p }) => <div {...p}>{children}</div>,
    button: ({ children, ...p }) => <button {...p}>{children}</button>,
    p:      ({ children, ...p }) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const renderDish = (dishId) =>
  render(
    <MemoryRouter initialEntries={[`/dish/${dishId}`]}>
      <Routes>
        <Route path="/dish/:dishId" element={<DishDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('DishDetailPage', () => {
  it('renders dish not found for unknown id', () => {
    renderDish('totally-fake-dish-xyz');
    expect(screen.getByText(/dish not found/i)).toBeInTheDocument();
  });

  it('renders dish name for classic-margherita', () => {
    renderDish('classic-margherita');
    expect(screen.getByText('Classic Margherita')).toBeInTheDocument();
  });

  it('renders price for classic-margherita', () => {
    renderDish('classic-margherita');
    expect(screen.getByText(/₹299/)).toBeInTheDocument();
  });

  it('renders View in AR button', () => {
    renderDish('classic-margherita');
    expect(screen.getByText(/view in ar/i)).toBeInTheDocument();
  });

  it('renders ingredients section', () => {
    renderDish('classic-margherita');
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
  });

  it('renders ingredient chips', () => {
    renderDish('classic-margherita');
    expect(screen.getByText('Mozzarella')).toBeInTheDocument();
    expect(screen.getByText('Tomato Sauce')).toBeInTheDocument();
  });

  it('opens AR viewer when AR button clicked', () => {
    renderDish('classic-margherita');
    const arBtn = screen.getByText(/view in ar/i);
    fireEvent.click(arBtn);
    // AR viewer overlay should appear — dish name appears twice (page + viewer header)
    expect(screen.getAllByText('Classic Margherita').length).toBeGreaterThanOrEqual(2);
  });

  it('renders prep time', () => {
    renderDish('classic-margherita');
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  it('renders calories', () => {
    renderDish('classic-margherita');
    expect(screen.getByText(/480/)).toBeInTheDocument();
  });

  it('renders all dishes without crashing', () => {
    const dishes = getAllDishes();
    dishes.forEach((dish) => {
      expect(() => renderDish(dish.id)).not.toThrow();
    });
  });
});
