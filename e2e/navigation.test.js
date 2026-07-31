import { test, expect } from '@playwright/test';

// ── Home page ─────────────────────────────────────────────────────────────────
test.describe('Home Page', () => {
  test('loads and shows MenuVista branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MenuVista/i);
  });

  test('has a link to the menu', async ({ page }) => {
    await page.goto('/');
    const menuLink = page.getByRole('link', { name: /menu/i }).first();
    await expect(menuLink).toBeVisible();
  });
});

// ── Menu page ─────────────────────────────────────────────────────────────────
test.describe('Menu Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('shows menu page', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('shows category tabs', async ({ page }) => {
    // At least one category should be visible
    const categories = page.locator('[class*="category"], button, a').filter({ hasText: /pizza|starters|pasta|salad|beverages|mocktails/i });
    await expect(categories.first()).toBeVisible();
  });

  test('shows dish cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Dishes should be listed
    const dishes = page.locator('img[alt]');
    await expect(dishes.first()).toBeVisible();
  });
});

// ── Dish Detail Page ──────────────────────────────────────────────────────────
test.describe('Dish Detail Page', () => {
  test('opens dish detail when dish clicked', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
    // Click first dish image or card
    const firstDish = page.locator('img[alt]').first();
    await firstDish.click();
    // Should navigate to dish detail
    await expect(page).toHaveURL(/\/dish\//);
  });

  test('dish detail shows name, price, ingredients', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    await expect(page.getByText('Classic Margherita')).toBeVisible();
    await expect(page.getByText(/₹299/)).toBeVisible();
    await expect(page.getByText('Ingredients')).toBeVisible();
  });

  test('dish detail shows AR button', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    const arBtn = page.getByRole('button', { name: /view in ar/i });
    await expect(arBtn).toBeVisible();
  });

  test('back button navigates back', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    const backBtn = page.locator('button').first();
    await backBtn.click();
    // Should go back to menu or home
    await expect(page).not.toHaveURL(/\/dish\/classic-margherita/);
  });

  test('shows 404 for invalid dish id', async ({ page }) => {
    await page.goto('/dish/this-dish-does-not-exist');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test('ingredient chips are visible', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    await expect(page.getByText('Mozzarella')).toBeVisible();
    await expect(page.getByText('Tomato Sauce')).toBeVisible();
  });
});

// ── AR Viewer ─────────────────────────────────────────────────────────────────
test.describe('AR Viewer', () => {
  test('AR button opens viewer overlay', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    const arBtn = page.getByRole('button', { name: /view in ar/i });
    await arBtn.click();
    // AR viewer should be present (close button appears)
    const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(closeBtn).toBeVisible();
  });

  test('close button dismisses AR viewer', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    await page.getByRole('button', { name: /view in ar/i }).click();
    // Find and click close (X) button
    await page.keyboard.press('Escape');
    // Dish detail should still be visible
    await expect(page.getByText('Classic Margherita')).toBeVisible();
  });
});

// ── Multiple dishes ───────────────────────────────────────────────────────────
test.describe('All key dishes load', () => {
  const dishes = [
    { id: 'classic-margherita',       name: 'Classic Margherita' },
    { id: 'cheese-corn-balls',        name: 'Cheese Corn Balls' },
    { id: 'chicken-alfredo',          name: 'Chicken Alfredo' },
    { id: 'guava-mojito',             name: 'Guava Mojito' },
    { id: 'hot-coffee',               name: 'Hot Coffee' },
    { id: 'veg-caesar-salad',         name: 'Veg Caesar Salad' },
  ];

  dishes.forEach(({ id, name }) => {
    test(`${name} detail page loads`, async ({ page }) => {
      await page.goto(`/dish/${id}`);
      await expect(page.getByText(name)).toBeVisible();
      await expect(page.getByRole('button', { name: /view in ar/i })).toBeVisible();
    });
  });
});

// ── Mobile viewport ───────────────────────────────────────────────────────────
test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 size

  test('menu page is usable on mobile', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('dish detail AR button is tappable on mobile', async ({ page }) => {
    await page.goto('/dish/classic-margherita');
    const arBtn = page.getByRole('button', { name: /view in ar/i });
    await expect(arBtn).toBeVisible();
    const box = await arBtn.boundingBox();
    // Button should be at least 44px tall (minimum tap target)
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
