/**
 * Affix (Sticky) Component Tests
 *
 * Tests for js/components/affix.js + css/components/affix.css
 * Covers: initialization, stuck state, placeholder, events, offset
 */

import { test, expect } from '@playwright/test';

test.describe('Affix (Sticky) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/affix.html');
    await page.waitForTimeout(200);
  });

  test.describe('Initialization', () => {
    test('element starts as not stuck', async ({ page }) => {
      const bar = page.locator('#sticky-bar');
      await expect(bar).not.toHaveClass(/is-stuck/);
    });
  });

  test.describe('Stuck Behavior', () => {
    test('adds is-stuck class when scrolled past', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);

      const bar = page.locator('#sticky-bar');
      await expect(bar).toHaveClass(/is-stuck/);
    });

    test('placeholder becomes active when stuck', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);

      const placeholder = page.locator('.vd-affix-placeholder.is-active');
      await expect(placeholder.first()).toBeAttached();
    });

    test('removes is-stuck when scrolled back', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const bar = page.locator('#sticky-bar');
      await expect(bar).not.toHaveClass(/is-stuck/);
    });
  });

  test.describe('Events', () => {
    test('fires affix:stuck event', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise<boolean>(resolve => {
          document.getElementById('sticky-bar')!.addEventListener('affix:stuck', () => resolve(true));
          window.scrollBy(0, 400);
        });
      });
      expect(eventFired).toBe(true);
    });
  });
});
