/**
 * Tooltips Component Tests
 *
 * Tests for js/components/tooltips.js
 * Covers: initialization, show/hide, positioning, programmatic API
 */

import { test, expect } from '@playwright/test';

test.describe('Tooltips Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/tooltips.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('creates tooltip element on init', async ({ page }) => {
      const tooltip = page.locator('.vd-tooltip').first();
      await expect(tooltip).toBeAttached();
    });

    test('tooltip has correct ARIA attributes', async ({ page }) => {
      const trigger = page.locator('#tooltip-top');
      const tooltipId = await trigger.getAttribute('aria-describedby');

      expect(tooltipId).toBeTruthy();

      const tooltip = page.locator(`#${tooltipId}`);
      await expect(tooltip).toHaveAttribute('role', 'tooltip');
      await expect(tooltip).toHaveAttribute('aria-hidden', 'true');
    });

    test('tooltip has correct content', async ({ page }) => {
      await page.locator('#tooltip-top').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip').first();
      await expect(tooltip).toContainText('Tooltip on top');
    });
  });

  test.describe('Show/Hide', () => {
    test('shows tooltip on hover', async ({ page }) => {
      await page.locator('#tooltip-top').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible').first();
      await expect(tooltip).toBeVisible();
    });

    test('shows tooltip on focus', async ({ page }) => {
      await page.locator('#tooltip-top').focus();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible').first();
      await expect(tooltip).toBeVisible();
    });

    test('hides tooltip on mouse leave', async ({ page }) => {
      await page.locator('#tooltip-top').hover();
      await page.waitForTimeout(100);

      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveCount(0);
    });
  });

  test.describe('Positioning', () => {
    test('top placement has correct class', async ({ page }) => {
      await page.locator('#tooltip-top').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveClass(/tooltip-top/);
    });

    test('bottom placement has correct class', async ({ page }) => {
      await page.locator('#tooltip-bottom').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveClass(/tooltip-bottom/);
    });

    test('left placement has correct class', async ({ page }) => {
      await page.locator('#tooltip-left').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveClass(/tooltip-left/);
    });

    test('right placement has correct class', async ({ page }) => {
      await page.locator('#tooltip-right').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveClass(/tooltip-right/);
    });
  });

  test.describe('Delayed Tooltip', () => {
    test('delayed tooltip appears after specified time', async ({ page }) => {
      await page.locator('#tooltip-delayed').hover();

      // Should not be visible immediately
      let tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveCount(0);

      // Wait for delay
      await page.waitForTimeout(600);

      tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toBeVisible();
    });
  });

  test.describe('HTML Tooltips', () => {
    test('renders HTML content when using data-tooltip-html', async ({ page }) => {
      await page.locator('#tooltip-html').hover();
      await page.waitForTimeout(100);

      const tooltip = page.locator('.vd-tooltip.vd-tooltip-html');
      await expect(tooltip).toBeVisible();
      await expect(tooltip.locator('strong')).toContainText('Bold');
    });
  });

  test.describe('Programmatic API', () => {
    test('shows tooltip programmatically via show()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).VanduoTooltips.show('#tooltip-top');
      });

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toBeVisible();
    });

    test('hides tooltip programmatically via hide()', async ({ page }) => {
      await page.locator('#tooltip-top').hover();
      await page.waitForTimeout(100);

      await page.evaluate(() => {
        (window as any).VanduoTooltips.hide('#tooltip-top');
      });

      const tooltip = page.locator('.vd-tooltip.is-visible');
      await expect(tooltip).toHaveCount(0);
    });
  });
});
