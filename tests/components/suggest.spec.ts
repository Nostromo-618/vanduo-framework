/**
 * Suggest (Autocomplete) Component Tests
 *
 * Tests for js/components/suggest.js + css/components/suggest.css
 * Covers: rendering, filtering, keyboard navigation, selection, ARIA, alias
 */

import { test, expect } from '@playwright/test';

test.describe('Suggest (Autocomplete) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/suggest.html');
    await page.waitForTimeout(200);
  });

  test.describe('Initialization', () => {
    test('input has combobox role', async ({ page }) => {
      const input = page.locator('#fruits');
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-autocomplete', 'list');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    test('dropdown list is hidden initially', async ({ page }) => {
      const list = page.locator('.vd-suggest-list');
      await expect(list.first()).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Filtering', () => {
    test('shows matching items on input', async ({ page }) => {
      await page.fill('#fruits', 'app');
      await page.waitForTimeout(300);

      const list = page.locator('#fruits ~ .vd-suggest-list, .vd-suggest-wrapper .vd-suggest-list');
      await expect(list.first()).toHaveClass(/is-open/);

      const items = list.first().locator('.vd-suggest-item');
      await expect(items).toHaveCount(1); // Apple
    });

    test('shows no results message', async ({ page }) => {
      await page.fill('#fruits', 'xyz');
      await page.waitForTimeout(300);

      const empty = page.locator('.vd-suggest-empty');
      await expect(empty.first()).toContainText('No results');
    });

    test('highlights matching text', async ({ page }) => {
      await page.fill('#fruits', 'ban');
      await page.waitForTimeout(300);

      const match = page.locator('.vd-suggest-match');
      await expect(match.first()).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('arrow down highlights items', async ({ page }) => {
      await page.fill('#fruits', 'a');
      await page.waitForTimeout(300);
      await page.keyboard.press('ArrowDown');

      const highlighted = page.locator('.vd-suggest-item.is-highlighted');
      await expect(highlighted).toHaveCount(1);
    });

    test('enter selects highlighted item', async ({ page }) => {
      await page.fill('#fruits', 'ap');
      await page.waitForTimeout(300);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      const input = page.locator('#fruits');
      const value = await input.inputValue();
      expect(value.length).toBeGreaterThan(0);
    });

    test('escape closes dropdown', async ({ page }) => {
      await page.fill('#fruits', 'a');
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');

      const list = page.locator('.vd-suggest-wrapper .vd-suggest-list').first();
      await expect(list).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Selection', () => {
    test('clicking item selects it', async ({ page }) => {
      await page.fill('#fruits', 'ban');
      await page.waitForTimeout(300);

      await page.click('.vd-suggest-item');
      const value = await page.locator('#fruits').inputValue();
      expect(value).toBe('Banana');
    });
  });

  test.describe('CSV Data Source', () => {
    test('parses comma-separated values', async ({ page }) => {
      await page.fill('#csv-input', 'Re');
      await page.waitForTimeout(300);

      const items = page.locator('.vd-suggest-wrapper .vd-suggest-list .vd-suggest-item');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Min Chars', () => {
    test('does not open with fewer chars than minimum', async ({ page }) => {
      await page.fill('#min-chars', 'A');
      await page.waitForTimeout(300);

      const lists = page.locator('.vd-suggest-list.is-open');
      await expect(lists).toHaveCount(0);
    });
  });

  test.describe('Alias', () => {
    test('data-vd-autocomplete works', async ({ page }) => {
      const input = page.locator('#alias-input');
      await expect(input).toHaveAttribute('role', 'combobox');
    });
  });
});
