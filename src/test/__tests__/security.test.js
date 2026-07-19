import { describe, it, expect } from 'vitest';
import { getAllDishes } from '../../data/menuData';

describe('Security — Data Injection', () => {
  it('no dish name contains HTML/script tags', () => {
    getAllDishes().forEach(dish => {
      expect(dish.name).not.toMatch(/<script|<img|javascript:|on\w+=/i);
      expect(dish.description).not.toMatch(/<script|<img|javascript:|on\w+=/i);
    });
  });

  it('no ingredient contains script injection', () => {
    getAllDishes().forEach(dish => {
      dish.ingredients.forEach(ing => {
        expect(ing).not.toMatch(/<script|javascript:|on\w+=/i);
      });
    });
  });

  it('all model glb paths are relative (no external URLs)', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model.glb).not.toMatch(/^https?:\/\//);
    });
  });

  it('no dish exposes internal API keys or secrets', () => {
    const raw = JSON.stringify(getAllDishes());
    expect(raw).not.toMatch(/sk-|api_key|secret|password|token/i);
  });

  it('dish IDs contain only safe URL characters', () => {
    getAllDishes().forEach(dish => {
      expect(dish.id).toMatch(/^[a-z0-9-]+$/);
    });
  });
});

describe('Security — Model Paths', () => {
  it('no path traversal in model paths (no ../ or .../)', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model.glb).not.toContain('../');
      expect(dish.model.glb).not.toContain('..\\');
    });
  });

  it('model paths use only allowed extensions', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model.glb).toMatch(/\.(glb)$/);
    });
  });
});
