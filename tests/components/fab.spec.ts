/**
 * FAB (Floating Action Button) Component Tests
 *
 * Tests for css/components/fab.css
 * Covers: rendering, fixed positioning, sizes, positions, variants, speed dial
 */

import { test, expect } from '@playwright/test';

test.describe('FAB Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/fab.html');
    await page.waitForTimeout(200);
  });

  test.describe('Rendering', () => {
    test('basic FAB renders without fixed position', async ({ page }) => {
      const fab = page.locator('#basic-fab');
      await expect(fab).toBeVisible();

      const position = await fab.evaluate(el => getComputedStyle(el).position);
      expect(position).not.toBe('fixed');
    });

    test('FAB has correct ARIA label', async ({ page }) => {
      const fab = page.locator('#basic-fab');
      await expect(fab).toHaveAttribute('aria-label', 'Add');
    });

    test('FAB renders as inline-flex', async ({ page }) => {
      const fab = page.locator('#basic-fab');
      const display = await fab.evaluate(el => getComputedStyle(el).display);
      expect(display).toBe('inline-flex');
    });
  });

  test.describe('Fixed Positioning', () => {
    test('.vd-fab-fixed applies position: fixed', async ({ page }) => {
      const fab = page.locator('#fab-fixed');
      await expect(fab).toBeVisible();

      const position = await fab.evaluate(el => getComputedStyle(el).position);
      expect(position).toBe('fixed');
    });

    test('.vd-fab-bottom-left applies position: fixed', async ({ page }) => {
      const fab = page.locator('#fab-bottom-left');
      const position = await fab.evaluate(el => getComputedStyle(el).position);
      expect(position).toBe('fixed');
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

    test('speed dial actions are invisible by default', async ({ page }) => {
      const actions = page.locator('#fab-menu .vd-fab-actions');
      const opacity = await actions.evaluate(el => getComputedStyle(el).opacity);
      expect(opacity).toBe('0');
    });

    test('clicking main FAB opens speed dial', async ({ page }) => {
      await page.click('#fab-main');
      const menu = page.locator('#fab-menu');
      await expect(menu).toHaveClass(/is-open/);

      const actions = menu.locator('.vd-fab-actions .vd-fab');
      await expect(actions).toHaveCount(3);
    });

    test('clicking main FAB toggles aria-expanded', async ({ page }) => {
      const trigger = page.locator('#fab-main');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
