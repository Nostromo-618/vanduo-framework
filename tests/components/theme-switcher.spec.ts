/**
 * Theme Switcher Component Tests
 *
 * Tests for js/components/theme-switcher.js
 * Covers: initialization, light/dark/system toggle, localStorage persistence
 */

import { test, expect, type Page } from '@playwright/test';

const THEME_CUSTOMIZER_DEFAULTS_KEY = 'vanduo-test-theme-customizer-defaults';
const SHARED_THEME_STORAGE_KEYS = [
  'vanduo-theme-preference',
  'vanduo-primary-color',
  'vanduo-neutral-color',
  'vanduo-radius',
  'vanduo-font-preference'
];

async function reloadWithThemeCustomizerDefaults(
  page: Page,
  defaults: { PRIMARY_LIGHT: string; PRIMARY_DARK: string }
) {
  await page.evaluate((payload: {
    key: string;
    value: { PRIMARY_LIGHT: string; PRIMARY_DARK: string };
    storageKeys: string[];
  }) => {
    const { key, value, storageKeys } = payload;
    storageKeys.forEach((storageKey) => {
      localStorage.removeItem(storageKey);
    });
    sessionStorage.setItem(key, JSON.stringify(value));
  }, {
    key: THEME_CUSTOMIZER_DEFAULTS_KEY,
    value: defaults,
    storageKeys: SHARED_THEME_STORAGE_KEYS
  });

  await page.reload();
  await page.waitForTimeout(100);
}

test.describe('Theme Switcher Component @component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/tests/fixtures/theme-switcher.html');
    await page.evaluate(({ defaultsKey, storageKeys }) => {
      storageKeys.forEach((storageKey) => {
        localStorage.removeItem(storageKey);
      });
      sessionStorage.removeItem(defaultsKey);
    }, {
      defaultsKey: THEME_CUSTOMIZER_DEFAULTS_KEY,
      storageKeys: SHARED_THEME_STORAGE_KEYS
    });
    await page.reload();
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes theme switcher', async ({ page }) => {
      const themeSelect = page.locator('#theme-select');
      await expect(themeSelect).toHaveAttribute('data-theme-initialized', 'true');
    });

    test('persists shared system preference on init', async ({ page }) => {
      const storagePref = await page.evaluate(() => {
        return localStorage.getItem('vanduo-theme-preference');
      });

      // ThemeCustomizer initializes first in this fixture and persists the shared mode.
      expect(storagePref).toBe('system');
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

    test('ThemeCustomizer writes vd-prefixed runtime tokens', async ({ page }) => {
      const tokens = await page.evaluate(() => {
        const legacyToken = '--' + 'radius-scale';
        window.ThemeCustomizer.applyRadius('0.25');

        return {
          radius: document.documentElement.style.getPropertyValue('--vd-radius-scale'),
          legacyRadius: document.documentElement.style.getPropertyValue(legacyToken),
          swatchesUseVdToken: window.ThemeCustomizer.getPanelHTML().includes('--vd-swatch-color'),
        };
      });

      expect(tokens).toEqual({
        radius: '0.25',
        legacyRadius: '',
        swatchesUseVdToken: true,
      });
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

  test.describe('ThemeCustomizer Coordination', () => {
    test('syncs primary color with ThemeCustomizer on theme change', async ({ page }) => {
      await reloadWithThemeCustomizerDefaults(page, {
        PRIMARY_LIGHT: 'blue',
        PRIMARY_DARK: 'red'
      });

      const themeSelect = page.locator('#theme-select');

      // Start with light theme
      await themeSelect.selectOption('light');
      await page.waitForTimeout(100);

      // Check primary color in light mode
      let primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('blue');

      // Switch to dark theme
      await themeSelect.selectOption('dark');
      await page.waitForTimeout(100);

      // Primary color should swap to dark mode default
      primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('red');

      // Switch back to light
      await themeSelect.selectOption('light');
      await page.waitForTimeout(100);

      // Primary should swap back
      primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('blue');
    });

    test('does not override user-selected primary color', async ({ page }) => {
      await reloadWithThemeCustomizerDefaults(page, {
        PRIMARY_LIGHT: 'blue',
        PRIMARY_DARK: 'red'
      });

      await page.evaluate(() => {
        // @ts-ignore
        if (window.ThemeCustomizer) {
          // User manually selects green
          // @ts-ignore
          window.ThemeCustomizer.applyPrimary('green');
        }
      });

      // Verify green is set
      let primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('green');

      // Switch to dark theme
      await page.locator('#theme-select').selectOption('dark');
      await page.waitForTimeout(100);

      // Primary should stay green (user's choice)
      primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('green');
    });

    test('handles ThemeCustomizer not being present', async ({ page }) => {
      // Remove ThemeCustomizer temporarily
      await page.evaluate(() => {
        // @ts-ignore
        delete window.ThemeCustomizer;
      });

      // ThemeSwitcher should still work without errors
      await page.locator('#theme-select').selectOption('dark');
      await page.waitForTimeout(100);

      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');
    });

    test('normalizes stale default primary amber when theme is light on reload', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.evaluate(() => {
        localStorage.setItem('vanduo-theme-preference', 'light');
        localStorage.setItem('vanduo-primary-color', 'amber');
      });
      await page.reload();
      await page.waitForTimeout(100);

      const primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('black');
    });

    test('normalizes stale default primary black when theme is dark on reload', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.evaluate(() => {
        localStorage.setItem('vanduo-theme-preference', 'dark');
        localStorage.setItem('vanduo-primary-color', 'black');
      });
      await page.reload();
      await page.waitForTimeout(100);

      const primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('amber');
    });

    test('system mode normalizes primary to black when OS is light on reload', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.evaluate(() => {
        localStorage.setItem('vanduo-theme-preference', 'system');
        localStorage.setItem('vanduo-primary-color', 'amber');
      });
      await page.reload();
      await page.waitForTimeout(100);

      const primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('black');
    });

    test('system mode normalizes primary to amber when OS is dark on reload', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.evaluate(() => {
        localStorage.setItem('vanduo-theme-preference', 'system');
        localStorage.setItem('vanduo-primary-color', 'black');
      });
      await page.reload();
      await page.waitForTimeout(100);

      const primary = await page.evaluate(() => document.documentElement.getAttribute('data-primary'));
      expect(primary).toBe('amber');
    });

    test('reset keeps ThemeSwitcher storage and UI in sync', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await reloadWithThemeCustomizerDefaults(page, {
        PRIMARY_LIGHT: 'blue',
        PRIMARY_DARK: 'red'
      });

      await page.locator('#theme-select').selectOption('dark');
      await page.waitForTimeout(100);

      const resetState = await page.evaluate(() => {
        // @ts-ignore
        window.ThemeCustomizer.reset();

        return {
          theme: document.documentElement.getAttribute('data-theme'),
          primary: document.documentElement.getAttribute('data-primary'),
          storagePref: localStorage.getItem('vanduo-theme-preference')
        };
      });

      expect(resetState.theme).toBeNull();
      expect(resetState.primary).toBe('blue');
      expect(resetState.storagePref).toBe('system');
      await expect(page.locator('#theme-select')).toHaveValue('system');
    });
  });
});
