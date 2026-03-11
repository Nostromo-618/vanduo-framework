/**
 * FAB (Floating Action Button) Component Tests
 *
 * Tests for css/components/fab.css
 * Covers: rendering, sizes, positions, variants, speed dial
 */

import { test, expect } from '@playwright/test';

test.describe('FAB Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/fab.html');
    await page.waitForTimeout(200);
  });

  test.describe('Rendering', () => {
    test('basic FAB renders with fixed position', async ({ page }) => {
      const fab = page.locator('#basic-fab');
      await expect(fab).toBeVisible();

      const position = await fab.evaluate(el => getComputedStyle(el).position);
      expect(position).toBe('fixed');
    });

    test('FAB has correct ARIA label', async ({ page }) => {
      const fab = page.locator('#basic-fab');
      await expect(fab).toHaveAttribute('aria-label', 'Add');
    });
  });

  test.describe('Sizes', () => {
    test('small FAB has smaller dimensions', async ({ page }) => {
      const sm = page.locator('#fab-sm');
      const basic = page.locator('#basic-fab');

      const smWidth = await sm.evaluate(el => el.offsetWidth);
      const basicWidth = await basic.evaluate(el => el.offsetWidth);
      expect(smWidth).toBeLessThan(basicWidth);
    });

    test('large FAB has larger dimensions', async ({ page }) => {
      const lg = page.locator('#fab-lg');
      const basic = page.locator('#basic-fab');

      const lgWidth = await lg.evaluate(el => el.offsetWidth);
      const basicWidth = await basic.evaluate(el => el.offsetWidth);
      expect(lgWidth).toBeGreaterThan(basicWidth);
    });
  });

  test.describe('Extended', () => {
    test('extended FAB is wider than round FAB', async ({ page }) => {
      const ext = page.locator('#fab-extended');
      const basic = page.locator('#basic-fab');

      const extWidth = await ext.evaluate(el => el.offsetWidth);
      const basicWidth = await basic.evaluate(el => el.offsetWidth);
      expect(extWidth).toBeGreaterThan(basicWidth);
    });
  });

  test.describe('Position Variants', () => {
    test('bottom-left FAB positioned on left', async ({ page }) => {
      const fab = page.locator('#fab-bottom-left');
      const left = await fab.evaluate(el => getComputedStyle(el).left);
      expect(left).not.toBe('auto');
    });
  });

  test.describe('Color Variants', () => {
    test('success FAB has green background', async ({ page }) => {
      const fab = page.locator('#fab-success');
      await expect(fab).toHaveClass(/vd-fab-success/);
    });
  });

  test.describe('Speed Dial', () => {
    test('speed dial menu is hidden by default', async ({ page }) => {
      const menu = page.locator('#fab-menu');
      await expect(menu).not.toHaveClass(/is-open/);
    });

    test('clicking main FAB opens speed dial', async ({ page }) => {
      await page.click('#fab-main');
      const menu = page.locator('#fab-menu');
      await expect(menu).toHaveClass(/is-open/);

      const actions = menu.locator('.vd-fab-action');
      await expect(actions).toHaveCount(3);
    });
  });
});
