/**
 * Offcanvas (Sidenav Enhancement) Tests
 *
 * Tests for the multi-direction offcanvas enhancement to sidenav
 * Covers: top, bottom, right directions, data-vd-position, open/close
 */

import { test, expect } from '@playwright/test';

test.describe('Offcanvas Multi-direction @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/offcanvas.html');
    await page.waitForTimeout(200);
  });

  test.describe('Top Direction', () => {
    test('top offcanvas has correct CSS class', async ({ page }) => {
      const el = page.locator('#offcanvas-top');
      await expect(el).toHaveClass(/vd-offcanvas-top/);
    });

    test('opens top offcanvas on toggle click', async ({ page }) => {
      await page.click('#open-top');
      await page.waitForTimeout(400);
      const el = page.locator('#offcanvas-top');
      await expect(el).toHaveClass(/is-open/);
    });

    test('closes top offcanvas via close button', async ({ page }) => {
      await page.click('#open-top');
      await page.waitForTimeout(400);
      await page.click('#offcanvas-top .vd-sidenav-close');
      await page.waitForTimeout(400);
      const el = page.locator('#offcanvas-top');
      await expect(el).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Bottom Direction', () => {
    test('bottom offcanvas opens and closes', async ({ page }) => {
      await page.click('#open-bottom');
      await page.waitForTimeout(400);
      const el = page.locator('#offcanvas-bottom');
      await expect(el).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      await expect(el).not.toHaveClass(/is-open/);
    });

    test('card-hosted bottom offcanvas portals to the viewport while open', async ({ page }) => {
      const el = page.locator('#offcanvas-card-bottom');

      await expect.poll(() => el.evaluate((node) => node.parentElement && node.parentElement.id)).toBe('offcanvas-card-body');

      await page.click('#open-card-bottom');
      await expect(el).toHaveClass(/is-open/);
      await expect.poll(() => el.evaluate((node) => node.parentElement === document.body)).toBe(true);

      const layout = await el.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          viewportHeight: window.innerHeight
        };
      });

      expect(Math.abs(layout.bottom - layout.viewportHeight)).toBeLessThanOrEqual(2);

      await page.keyboard.press('Escape');
      await expect(el).not.toHaveClass(/is-open/);
      await page.waitForTimeout(500);
      await expect.poll(() => el.evaluate((node) => node.parentElement && node.parentElement.id)).toBe('offcanvas-card-body');
    });
  });

  test.describe('Right Direction', () => {
    test('right offcanvas has correct class and opens', async ({ page }) => {
      const el = page.locator('#offcanvas-right');
      await expect(el).toHaveClass(/vd-offcanvas-right/);

      await page.click('#open-right');
      await page.waitForTimeout(400);
      await expect(el).toHaveClass(/is-open/);
    });
  });

  test.describe('data-vd-position Attribute', () => {
    test('applies direction class from data attribute', async ({ page }) => {
      const el = page.locator('#offcanvas-data');
      await expect(el).toHaveClass(/vd-sidenav-bottom/);
    });
  });
});
