/**
 * Timepicker Component Tests
 *
 * Tests for js/components/timepicker.js + css/components/timepicker.css
 * Covers: rendering, time slots, selection, 12h/24h format, step intervals
 */

import { test, expect } from '@playwright/test';

test.describe('Timepicker Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/timepicker.html');
    await page.waitForTimeout(200);
  });

  test.describe('Initialization', () => {
    test('input has correct ARIA', async ({ page }) => {
      const input = page.locator('#time-12h');
      await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('popup is hidden initially', async ({ page }) => {
      const popup = page.locator('.vd-timepicker-popup');
      await expect(popup.first()).not.toHaveClass(/is-open/);
    });
  });

  test.describe('12h Format', () => {
    test('opens dropdown on focus', async ({ page }) => {
      await page.click('#time-12h');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-timepicker-popup.is-open');
      await expect(popup.first()).toBeVisible();
    });

    test('shows AM/PM times with 30min step', async ({ page }) => {
      await page.click('#time-12h');
      await page.waitForTimeout(200);

      const items = page.locator('.vd-timepicker-popup.is-open .vd-timepicker-item');
      const count = await items.count();
      expect(count).toBe(48); // 24h * 2 slots

      await expect(items.first()).toContainText('AM');
    });

    test('clicking time slot selects it', async ({ page }) => {
      await page.click('#time-12h');
      await page.waitForTimeout(200);

      const item = page.locator('.vd-timepicker-item').nth(5);
      await item.click();
      await page.waitForTimeout(100);

      const value = await page.locator('#time-12h').inputValue();
      expect(value.length).toBeGreaterThan(0);
    });
  });

  test.describe('24h Format', () => {
    test('shows 24h times', async ({ page }) => {
      await page.click('#time-24h');
      await page.waitForTimeout(200);

      const firstItem = page.locator('.vd-timepicker-popup.is-open .vd-timepicker-item').first();
      const text = await firstItem.textContent();
      expect(text).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  test.describe('Step Intervals', () => {
    test('15-minute step shows 96 slots', async ({ page }) => {
      await page.click('#time-15min');
      await page.waitForTimeout(200);

      const items = page.locator('.vd-timepicker-popup.is-open .vd-timepicker-item');
      await expect(items).toHaveCount(96); // 24h * 4 slots
    });
  });

  test.describe('Close Behavior', () => {
    test('closes on Escape', async ({ page }) => {
      await page.click('#time-12h');
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-timepicker-popup.is-open');
      await expect(popup).toHaveCount(0);
    });
  });
});
