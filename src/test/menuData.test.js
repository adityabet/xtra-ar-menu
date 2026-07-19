import { describe, it, expect } from 'vitest';
import {
  categories,
  getDishById,
  getCategoryById,
  getAllDishes,
  MODELS,
} from '../data/menuData';

// ── MODELS ──────────────────────────────────────────────────────────────────
describe('MODELS', () => {
  it('every model has a glb path', () => {
    Object.entries(MODELS).forEach(([key, model]) => {
      expect(model.glb, `${key} missing glb`).toBeTruthy();
      expect(model.glb, `${key} glb should end in .glb`).toMatch(/\.glb$/);
    });
  });

  it('every glb path starts with /models/', () => {
    Object.entries(MODELS).forEach(([key, model]) => {
      expect(model.glb, `${key} glb path wrong`).toMatch(/^\/models\//);
    });
  });
});

// ── CATEGORIES ───────────────────────────────────────────────────────────────
describe('categories', () => {
  it('has at least one category', () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it('every category has id, name, emoji, subcategories', () => {
    categories.forEach((cat) => {
      expect(cat.id,            `category missing id`).toBeTruthy();
      expect(cat.name,          `${cat.id} missing name`).toBeTruthy();
      expect(cat.emoji,         `${cat.id} missing emoji`).toBeTruthy();
      expect(cat.subcategories, `${cat.id} missing subcategories`).toBeDefined();
      expect(Array.isArray(cat.subcategories)).toBe(true);
    });
  });
});

// ── DISHES ───────────────────────────────────────────────────────────────────
describe('all dishes', () => {
  const dishes = getAllDishes();

  it('returns at least one dish', () => {
    expect(dishes.length).toBeGreaterThan(0);
  });

  it('every dish has required fields', () => {
    dishes.forEach((dish) => {
      expect(dish.id,          `dish missing id`).toBeTruthy();
      expect(dish.name,        `${dish.id} missing name`).toBeTruthy();
      expect(dish.price,       `${dish.id} missing price`).toBeGreaterThan(0);
      expect(dish.description, `${dish.id} missing description`).toBeTruthy();
      expect(dish.calories,    `${dish.id} missing calories`).toBeGreaterThan(0);
      expect(dish.prepTime,    `${dish.id} missing prepTime`).toBeTruthy();
      expect(dish.image,       `${dish.id} missing image`).toBeTruthy();
      expect(dish.type,        `${dish.id} missing type`).toBeTruthy();
    });
  });

  it('every dish has ingredients array with at least one item', () => {
    dishes.forEach((dish) => {
      expect(Array.isArray(dish.ingredients), `${dish.id} ingredients not array`).toBe(true);
      expect(dish.ingredients.length, `${dish.id} has no ingredients`).toBeGreaterThan(0);
    });
  });

  it('every dish has a 3D model assigned', () => {
    dishes.forEach((dish) => {
      expect(dish.model,      `${dish.id} missing model`).toBeDefined();
      expect(dish.model.glb,  `${dish.id} model missing glb`).toBeTruthy();
    });
  });

  it('no duplicate dish IDs', () => {
    const ids = dishes.map((d) => d.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('dish type is veg, non-veg, beverage, or mocktail', () => {
    const validTypes = ['veg', 'non-veg', 'beverage', 'mocktail'];
    dishes.forEach((dish) => {
      expect(validTypes, `${dish.id} has invalid type "${dish.type}"`).toContain(dish.type);
    });
  });

  it('dish price is a reasonable number (₹50–₹2000)', () => {
    dishes.forEach((dish) => {
      expect(dish.price, `${dish.id} price too low`).toBeGreaterThanOrEqual(50);
      expect(dish.price, `${dish.id} price too high`).toBeLessThanOrEqual(2000);
    });
  });
});

// ── getDishById ───────────────────────────────────────────────────────────────
describe('getDishById', () => {
  it('finds a valid dish by id', () => {
    const result = getDishById('classic-margherita');
    expect(result).not.toBeNull();
    expect(result.dish.name).toBe('Classic Margherita');
  });

  it('returns category and subcategory along with dish', () => {
    const result = getDishById('classic-margherita');
    expect(result.category).toBeDefined();
    expect(result.subcategory).toBeDefined();
  });

  it('returns null for unknown dish id', () => {
    const result = getDishById('non-existent-dish-xyz');
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getDishById('')).toBeNull();
  });

  it('finds every dish by its own id', () => {
    const dishes = getAllDishes();
    dishes.forEach((dish) => {
      const result = getDishById(dish.id);
      expect(result, `getDishById failed for ${dish.id}`).not.toBeNull();
      expect(result.dish.id).toBe(dish.id);
    });
  });
});

// ── getCategoryById ───────────────────────────────────────────────────────────
describe('getCategoryById', () => {
  it('finds pizza category', () => {
    const cat = getCategoryById('pizza');
    expect(cat).not.toBeNull();
    expect(cat.name).toBe('Pizza');
  });

  it('returns null for unknown category', () => {
    expect(getCategoryById('unknown-xyz')).toBeNull();
  });
});
