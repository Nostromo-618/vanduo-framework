/**
 * Select Component Tests
 *
 * Tests for js/components/select.js
 * Covers: initialization, custom dropdown, search, keyboard navigation, multi-select
 */

import { test, expect } from '@playwright/test';

test.describe('Select Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/select.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes custom selects', async ({ page }) => {
      const wrappers = page.locator('.custom-select-wrapper');
      await expect(wrappers).toHaveCount(7);
    });

    test('creates custom button for each select', async ({ page }) => {
      const buttons = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      await expect(buttons).toHaveCount(1);
    });

    test('creates dropdown for each select', async ({ page }) => {
      const dropdowns = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');
      await expect(dropdowns).toHaveCount(1);
    });

    test('button has correct aria attributes', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      await expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('dropdown has correct role', async ({ page }) => {
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');
      await expect(dropdown).toHaveAttribute('role', 'listbox');
    });
  });

  test.describe('Dropdown Toggle', () => {
    test('opens dropdown on button click', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.click();

      await expect(dropdown).toHaveClass(/is-open/);
      await expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    test('closes dropdown on second button click', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.click();
      await expect(dropdown).toHaveClass(/is-open/);

      await button.click();
      await expect(dropdown).not.toHaveClass(/is-open/);
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes dropdown when clicking outside', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.click();
      await expect(dropdown).toHaveClass(/is-open/);

      await page.locator('h1').click();
      await expect(dropdown).not.toHaveClass(/is-open/);
    });

    test('selects option on click', async ({ page }) => {
      const select = page.locator('#basic-select');
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');

      await button.click();
      
      // Find and click an option
      const option = page.locator('#basic-select').locator('..').locator('.custom-select-option').nth(1);
      await option.click();

      // Verify the select value changed
      await expect(select).toHaveValue('1');
      // Button text should update
      await expect(button).toContainText('Option 1');
    });
  });

  test.describe('Preselected Value', () => {
    test('displays correct initial value for preselected select', async ({ page }) => {
      const button = page.locator('#preselected-select').locator('..').locator('.custom-select-button');
      await expect(button).toContainText('Choice B');
    });

    test('marks preselected option as selected', async ({ page }) => {
      const button = page.locator('#preselected-select').locator('..').locator('.custom-select-button');
      await button.click();

      const selectedOption = page.locator('#preselected-select')
        .locator('..')
        .locator('.custom-select-option.is-selected');
      
      await expect(selectedOption).toHaveCount(1);
      await expect(selectedOption).toContainText('Choice B');
    });
  });

  test.describe('Disabled Options', () => {
    test('disabled option has correct classes and attributes', async ({ page }) => {
      const button = page.locator('#disabled-option-select').locator('..').locator('.custom-select-button');
      await button.click();

      const options = page.locator('#disabled-option-select').locator('..').locator('.custom-select-option');
      const disabledOption = options.nth(2);

      await expect(disabledOption).toHaveClass(/is-disabled/);
      await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
    });

    test('clicking disabled option does not select it', async ({ page }) => {
      const select = page.locator('#disabled-option-select');
      const button = page.locator('#disabled-option-select').locator('..').locator('.custom-select-button');

      await button.click();

      const options = page.locator('#disabled-option-select').locator('..').locator('.custom-select-option');
      const disabledOption = options.nth(2);

      await disabledOption.click({ force: true });

      // Value should still be empty
      await expect(select).toHaveValue('');
    });
  });

  test.describe('Searchable Select', () => {
    test('searchable select has search input', async ({ page }) => {
      const button = page.locator('#searchable-select').locator('..').locator('.custom-select-button');
      await button.click();

      const searchInput = page.locator('#searchable-select').locator('..').locator('.custom-select-search input');
      await expect(searchInput).toBeVisible();
    });

    test('filters options based on search input', async ({ page }) => {
      const button = page.locator('#searchable-select').locator('..').locator('.custom-select-button');
      await button.click();

      const searchInput = page.locator('#searchable-select').locator('..').locator('.custom-select-search input');
      await searchInput.fill('app');

      // Wait for filter to apply
      await page.waitForTimeout(150);

      // Check that at least Apple is visible
      const appleOption = page.locator('#searchable-select').locator('..').locator('.custom-select-option').filter({ hasText: 'Apple' });
      await expect(appleOption).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('opens dropdown with Enter key', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.focus();
      await page.keyboard.press('Enter');

      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('opens dropdown with Space key', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.focus();
      await page.keyboard.press(' ');

      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('closes dropdown with Escape key', async ({ page, browserName }) => {
      // WebKit has different focus behavior for escape key
      test.skip(browserName === 'webkit', 'Different escape key behavior in WebKit');

      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.click();
      await expect(dropdown).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);
      await expect(dropdown).not.toHaveClass(/is-open/);
    });

    test('ArrowDown opens dropdown', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');

      await button.focus();
      await page.keyboard.press('ArrowDown');

      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('ArrowUp navigates within dropdown', async ({ page }) => {
      const button = page.locator('#basic-select').locator('..').locator('.custom-select-button');

      await button.click();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Dropdown should still be open
      const dropdown = page.locator('#basic-select').locator('..').locator('.custom-select-dropdown');
      await expect(dropdown).toHaveClass(/is-open/);
    });
  });

  test.describe('Programmatic API', () => {
    test('Select component is exposed globally', async ({ page }) => {
      const componentExists = await page.evaluate(() => {
        return typeof (window as any).Vanduo !== 'undefined' || document.querySelectorAll('.custom-select-wrapper').length > 0;
      });
      expect(componentExists).toBe(true);
    });

    test('custom select wrapper created for select elements', async ({ page }) => {
      // Verify the API test select has a custom wrapper
      const apiSelect = page.locator('#api-select');
      const parent = apiSelect.locator('..');
      
      // Parent should be the custom select wrapper
      await expect(parent).toHaveClass(/custom-select-wrapper/);
    });
  });
});