import { describe, it, expect } from 'vitest';
import { getDishById, getCategoryById, getAllDishes, categories } from '../../data/menuData';

describe('Menu Data — Structure', () => {
  it('has at least one category', () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it('every category has id, name, emoji, subcategories', () => {
    categories.forEach(cat => {
      expect(cat.id, `${cat.name} missing id`).toBeTruthy();
      expect(cat.name, `category missing name`).toBeTruthy();
      expect(cat.emoji, `${cat.name} missing emoji`).toBeTruthy();
      expect(Array.isArray(cat.subcategories)).toBe(true);
    });
  });

  it('every dish has required fields', () => {
    getAllDishes().forEach(dish => {
      expect(dish.id,          `dish missing id`).toBeTruthy();
      expect(dish.name,        `${dish.id} missing name`).toBeTruthy();
      expect(dish.price,       `${dish.id} missing price`).toBeGreaterThan(0);
      expect(dish.description, `${dish.id} missing description`).toBeTruthy();
      expect(Array.isArray(dish.ingredients), `${dish.id} ingredients not array`).toBe(true);
      expect(dish.ingredients.length, `${dish.id} has no ingredients`).toBeGreaterThan(0);
      expect(dish.calories,    `${dish.id} missing calories`).toBeGreaterThan(0);
      expect(dish.prepTime,    `${dish.id} missing prepTime`).toBeTruthy();
      expect(dish.image,       `${dish.id} missing image`).toBeTruthy();
      expect(dish.type,        `${dish.id} missing type`).toBeTruthy();
    });
  });

  it('every dish has a valid 3D model with glb path', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model,              `${dish.id} missing model`).toBeTruthy();
      expect(dish.model.glb,          `${dish.id} missing model.glb`).toBeTruthy();
      expect(dish.model.glb).toMatch(/^\/models\/.+\.glb$/);
    });
  });

  it('no duplicate dish IDs', () => {
    const ids = getAllDishes().map(d => d.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it('dish prices are reasonable (₹50–₹2000)', () => {
    getAllDishes().forEach(dish => {
      expect(dish.price, `${dish.id} price out of range`).toBeGreaterThanOrEqual(50);
      expect(dish.price, `${dish.id} price too high`).toBeLessThanOrEqual(2000);
    });
  });

  it('dish type is veg, non-veg, or beverage/mocktail', () => {
    const validTypes = ['veg', 'non-veg', 'beverage', 'mocktail'];
    getAllDishes().forEach(dish => {
      expect(validTypes, `${dish.id} has invalid type: ${dish.type}`).toContain(dish.type);
    });
  });
});

describe('Menu Data — Lookups', () => {
  it('getDishById returns correct dish', () => {
    const result = getDishById('classic-margherita');
    expect(result).not.toBeNull();
    expect(result.dish.name).toBe('Classic Margherita');
    expect(result.dish.price).toBe(299);
  });

  it('getDishById returns null for unknown id', () => {
    expect(getDishById('non-existent-dish')).toBeNull();
  });

  it('getDishById returns category info', () => {
    const result = getDishById('classic-margherita');
    expect(result.category.id).toBe('pizza');
  });

  it('getCategoryById returns correct category', () => {
    const cat = getCategoryById('pizza');
    expect(cat).not.toBeNull();
    expect(cat.name).toBe('Pizza');
  });

  it('getCategoryById returns null for unknown id', () => {
    expect(getCategoryById('unknown-cat')).toBeNull();
  });

  it('getAllDishes returns flat array of all dishes', () => {
    const all = getAllDishes();
    expect(all.length).toBeGreaterThan(10);
    expect(all.every(d => d.id)).toBe(true);
  });
});

describe('Menu Data — AR Models', () => {
  it('all glb paths start with /models/', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model.glb).toMatch(/^\/models\//);
    });
  });

  it('no dish uses undefined or null model', () => {
    getAllDishes().forEach(dish => {
      expect(dish.model).not.toBeNull();
      expect(dish.model).not.toBeUndefined();
      expect(dish.model.glb).not.toBeNull();
    });
  });

  it('dish images are valid URLs', () => {
    getAllDishes().forEach(dish => {
      expect(dish.image).toMatch(/^https?:\/\//);
    });
  });
});
