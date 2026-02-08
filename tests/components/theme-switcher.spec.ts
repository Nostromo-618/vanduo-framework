/**
 * Theme Switcher Component Tests
 *
 * Tests for js/components/theme-switcher.js
 * Covers: initialization, light/dark/system toggle, localStorage persistence
 */

import { test, expect } from '@playwright/test';

test.describe('Theme Switcher Component @component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/tests/fixtures/theme-switcher.html');
    await page.evaluate(() => {
      localStorage.removeItem('vanduo-theme-preference');
    });
    await page.reload();
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes theme switcher', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      await expect(themeSelect).toHaveAttribute('data-theme-initialized', 'true');
    });

    test('sets default preference to system', async ({ page }) => {
      const storagePref = await page.evaluate(() => {
        return localStorage.getItem('vanduo-theme-preference');
      });
      // Initially null, but component treats as 'system'
      expect(storagePref).toBeNull();
    });

    test('select reflects current preference', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      await expect(themeSelect).toHaveValue('system');
    });
  });

  test.describe('Theme Selection', () => {
    test('changes theme to light via select', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      
      await themeSelect.selectOption('light');

      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('light');
    });

    test('changes theme to dark via select', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      
      await themeSelect.selectOption('dark');

      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');
    });

    test('system theme removes data-theme attribute', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      
      // First set to dark
      await themeSelect.selectOption('dark');
      let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');

      // Then back to system
      await themeSelect.selectOption('system');
      theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBeNull();
    });

    test('button cycles through themes', async ({ page }) => {
      const themeButton = page.locator('#theme-button');
      
      // First click: system -> light
      await themeButton.click();
      let theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('light');

      // Second click: light -> dark
      await themeButton.click();
      theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');

      // Third click: dark -> system
      await themeButton.click();
      theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBeNull();
    });
  });

  test.describe('localStorage Persistence', () => {
    test('saves preference to localStorage', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      
      await themeSelect.selectOption('dark');

      const storagePref = await page.evaluate(() => {
        return localStorage.getItem('vanduo-theme-preference');
      });
      expect(storagePref).toBe('dark');
    });

    test('restores preference from localStorage on reload', async ({ page }) => {
      // Set preference
      await page.locator('#theme-select').selectOption('dark');
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(100);

      // Check that preference was restored
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');

      const selectValue = await page.locator('#theme-select').inputValue();
      expect(selectValue).toBe('dark');
    });
  });

  test.describe('UI Updates', () => {
    test('button label updates with current theme', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      const themeLabel = page.locator('.theme-current-label');

      await themeSelect.selectOption('dark');

      await expect(themeLabel).toContainText('Dark');
    });

    test('select updates when button is clicked', async ({ page }) => {
      const themeButton = page.locator('#theme-button');
      const themeSelect = page.locator('#theme-select');

      await themeButton.click();

      // Button cycles to light first
      await expect(themeSelect).toHaveValue('light');
    });
  });

  test.describe('Programmatic API', () => {
    test('ThemeSwitcher functionality exists', async ({ page }) => {
      // Check that the theme switcher is working by verifying UI is initialized
      const themeSelect = page.locator('#theme-select');
      await expect(themeSelect).toHaveAttribute('data-theme-initialized', 'true');
    });

    test('programmatic theme change via localStorage', async ({ page }) => {
      // Set dark theme via localStorage and reload
      await page.evaluate(() => {
        localStorage.setItem('vanduo-theme-preference', 'dark');
      });
      await page.reload();
      await page.waitForTimeout(100);

      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');
    });

    test('theme preference is reflected in UI', async ({ page }) => {
      // Set a preference
      await page.locator('#theme-select').selectOption('light');
      await page.waitForTimeout(100);

      // Verify select shows correct value
      await expect(page.locator('#theme-select')).toHaveValue('light');
      
      // Verify data-theme attribute
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('light');
    });
  });

  test.describe('System Theme Detection', () => {
    test('applies system theme correctly', async ({ page }) => {
      // Select system theme
      await page.locator('#theme-select').selectOption('system');
      await page.waitForTimeout(50);

      // System theme should remove data-theme attribute
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBeNull();
    });
  });
});