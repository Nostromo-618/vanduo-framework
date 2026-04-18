/**
 * Datepicker Component Tests
 *
 * Tests for js/components/datepicker.js + css/components/datepicker.css
 * Covers: rendering, calendar display, day selection, month/year nav, ARIA, pre-selected
 */

import { test, expect } from '@playwright/test';

test.describe('Datepicker Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/datepicker.html');
    await page.waitForTimeout(200);
  });

  test.describe('Initialization', () => {
    test('input has correct ARIA', async ({ page }) => {
      const input = page.locator('#date-basic');
      await expect(input).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('popup is hidden initially', async ({ page }) => {
      const popup = page.locator('.vd-datepicker-popup');
      await expect(popup.first()).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Calendar Display', () => {
    test('opens calendar on focus', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-datepicker-popup.is-open');
      await expect(popup.first()).toBeVisible();
    });

    test('shows weekday headers', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const weekdays = page.locator('.vd-datepicker-weekdays');
      await expect(weekdays.first()).toContainText('Mo');
      await expect(weekdays.first()).toContainText('Fr');
    });

    test('shows day buttons', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const days = page.locator('.vd-datepicker-day');
      const count = await days.count();
      expect(count).toBeGreaterThan(27); // at least 28 days
    });

    test('highlights today', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const today = page.locator('.vd-datepicker-day.is-today');
      await expect(today).toHaveCount(1);
    });
  });

  test.describe('Day Selection', () => {
    test('clicking a day selects it and closes popup', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const day15 = page.locator('.vd-datepicker-day:not(.is-outside):not(.is-disabled)').filter({ hasText: /^15$/ });
      await day15.first().click();
      await page.waitForTimeout(200);

      const value = await page.locator('#date-basic').inputValue();
      expect(value).toContain('15');

      const popup = page.locator('.vd-datepicker-popup.is-open');
      await expect(popup).toHaveCount(0);
    });
  });

  test.describe('Month Navigation', () => {
    test('next button advances month', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      const title = page.locator('.vd-datepicker-title').first();
      const initialText = await title.textContent();

      await page.locator('.vd-datepicker-next').first().click();
      await page.waitForTimeout(100);

      const newText = await title.textContent();
      expect(newText).not.toBe(initialText);
    });
  });

  test.describe('Pre-selected Date', () => {
    test('shows pre-selected date as selected', async ({ page }) => {
      await page.click('#date-preselected');
      await page.waitForTimeout(200);

      const selected = page.locator('.vd-datepicker-day.is-selected');
      await expect(selected.first()).toContainText('15');
    });
  });

  test.describe('Close Behavior', () => {
    test('closes on Escape', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-datepicker-popup.is-open');
      await expect(popup).toHaveCount(0);
    });
  });

  test.describe('Custom format', () => {
    test('MM/DD/YYYY writes formatted value on pick', async ({ page }) => {
      await page.click('#date-us-format');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-datepicker-popup.is-open');
      const day7 = popup.locator('.vd-datepicker-day:not(.is-outside):not(.is-disabled)').filter({ hasText: /^7$/ });
      await day7.first().click();
      await page.waitForTimeout(200);

      const value = await page.locator('#date-us-format').inputValue();
      expect(value).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(value.split('/')[0]).toMatch(/^(0[1-9]|1[0-2])$/);
    });

    test('DD.MM.YYYY pre-selected value highlights correct day', async ({ page }) => {
      await page.click('#date-de-format');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-datepicker-popup.is-open');
      const selected = popup.locator('.vd-datepicker-day.is-selected');
      await expect(selected.first()).toHaveText('15');
    });
  });

  test.describe('Min / max', () => {
    test('disabled in-range days expose aria-disabled', async ({ page }) => {
      await page.click('#date-partial-range');
      await page.waitForTimeout(200);

      const popup = page.locator('.vd-datepicker-popup.is-open');
      const disabled = popup.locator('[data-vd-date="2025-06-25"]');
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');
      await expect(disabled).toHaveClass(/is-disabled/);
    });
  });

  test.describe('Keyboard navigation', () => {
    test('ArrowRight then Enter selects focused date', async ({ page }) => {
      await page.click('#date-basic');
      await page.waitForTimeout(200);

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);

      const value = await page.locator('#date-basic').inputValue();
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
