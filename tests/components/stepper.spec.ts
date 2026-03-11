/**
 * Stepper Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Stepper Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/stepper.html');
    await page.waitForTimeout(200);
  });

  test('renders horizontal stepper', async ({ page }) => {
    const items = page.locator('#stepper-h .vd-stepper-item');
    await expect(items).toHaveCount(4);
  });

  test('active step has is-active class', async ({ page }) => {
    const active = page.locator('#stepper-h .vd-stepper-item.is-active');
    await expect(active).toHaveCount(1);
    await expect(active.locator('.vd-stepper-label')).toContainText('Details');
  });

  test('completed steps have is-completed class', async ({ page }) => {
    const completed = page.locator('#stepper-h .vd-stepper-item.is-completed');
    await expect(completed).toHaveCount(1);
  });

  test('next() advances the stepper', async ({ page }) => {
    await page.click('#next-btn');
    await page.waitForTimeout(100);

    const active = page.locator('#stepper-h .vd-stepper-item.is-active');
    await expect(active.locator('.vd-stepper-label')).toContainText('Review');
  });

  test('prev() goes back', async ({ page }) => {
    await page.click('#next-btn');
    await page.waitForTimeout(50);
    await page.click('#prev-btn');
    await page.waitForTimeout(100);

    const active = page.locator('#stepper-h .vd-stepper-item.is-active');
    await expect(active.locator('.vd-stepper-label')).toContainText('Details');
  });

  test('clickable stepper responds to item clicks', async ({ page }) => {
    const items = page.locator('#stepper-click .vd-stepper-item');
    await items.nth(2).click();
    await page.waitForTimeout(100);

    await expect(items.nth(2)).toHaveClass(/is-active/);
    await expect(items.nth(0)).toHaveClass(/is-completed/);
    await expect(items.nth(1)).toHaveClass(/is-completed/);
  });

  test('vertical stepper renders correctly', async ({ page }) => {
    const stepper = page.locator('#stepper-v');
    await expect(stepper).toHaveClass(/vd-stepper-vertical/);
  });

  test('fires stepper:change event', async ({ page }) => {
    const fired = await page.evaluate(() => {
      return new Promise<boolean>(resolve => {
        document.getElementById('stepper-h')!.addEventListener('stepper:change', () => resolve(true));
        document.getElementById('next-btn')!.click();
      });
    });
    expect(fired).toBe(true);
  });
});
