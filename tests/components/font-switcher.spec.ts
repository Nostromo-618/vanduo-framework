/**
 * Font Switcher Component Tests
 *
 * Tests for js/components/font-switcher.js
 * Covers: initialization, font selection, data-font attribute, localStorage
 */

import { test, expect } from '@playwright/test';

test.describe('Font Switcher Component @component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/tests/fixtures/font-switcher.html');
    await page.evaluate(() => {
      localStorage.removeItem('vanduo-font-preference');
    });
    await page.reload();
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes font switcher', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      await expect(fontSelect).toHaveAttribute('data-font-initialized', 'true');
    });

    test('sets default font to ubuntu', async ({ page }) => {
      const font = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(font).toBe('ubuntu');
    });

    test('select reflects current font', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      await expect(fontSelect).toHaveValue('ubuntu');
    });
  });

  test.describe('Font Selection', () => {
    test('changes font via select', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      
      await fontSelect.selectOption('inter');

      const font = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(font).toBe('inter');
    });

    test('changes to system font removes data-font attribute', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      
      await fontSelect.selectOption('system');

      const font = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(font).toBeNull();
    });

    test('button cycles through fonts', async ({ page }) => {
      const fontButton = page.locator('#font-button');
      
      // Get initial font
      const initialFont = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      
      // Click to cycle
      await fontButton.click();
      
      const newFont = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(newFont).not.toBe(initialFont);
    });

    test('can select various fonts', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      const fonts = ['inter', 'fira-sans', 'ibm-plex', 'open-sans'];

      for (const font of fonts) {
        await fontSelect.selectOption(font);
        const dataFont = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
        expect(dataFont).toBe(font);
      }
    });
  });

  test.describe('localStorage Persistence', () => {
    test('saves font preference to localStorage', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      
      await fontSelect.selectOption('inter');

      const storagePref = await page.evaluate(() => {
        return localStorage.getItem('vanduo-font-preference');
      });
      expect(storagePref).toBe('inter');
    });

    test('restores preference from localStorage on reload', async ({ page }) => {
      // Set preference
      await page.locator('#font-select').selectOption('fira-sans');
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(100);

      // Check that preference was restored
      const font = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(font).toBe('fira-sans');

      const selectValue = await page.locator('#font-select').inputValue();
      expect(selectValue).toBe('fira-sans');
    });
  });

  test.describe('UI Updates', () => {
    test('button label updates with current font', async ({ page }) => {
      const fontSelect = page.locator('#font-select');
      const fontLabel = page.locator('.font-current-label');

      await fontSelect.selectOption('inter');

      await expect(fontLabel).toContainText('Inter');
    });

    test('select updates when button is clicked', async ({ page }) => {
      const fontButton = page.locator('#font-button');
      const fontSelect = page.locator('#font-select');

      const initialValue = await fontSelect.inputValue();
      await fontButton.click();

      const newValue = await fontSelect.inputValue();
      expect(newValue).not.toBe(initialValue);
    });
  });

  test.describe('Custom Event', () => {
    test('dispatches font:change event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).fontChangeEvent = null;
        document.addEventListener('font:change', (e: any) => {
          (window as any).fontChangeEvent = e.detail;
        });
      });

      await page.locator('#font-select').selectOption('inter');

      const eventDetail = await page.evaluate(() => (window as any).fontChangeEvent);
      expect(eventDetail).not.toBeNull();
      expect(eventDetail.font).toBe('inter');
    });
  });

  test.describe('Programmatic API', () => {
    test('FontSwitcher is exposed globally', async ({ page }) => {
      const exists = await page.evaluate(() => typeof (window as any).FontSwitcher !== 'undefined');
      expect(exists).toBe(true);
    });

    test('has expected API methods', async ({ page }) => {
      const methods = await page.evaluate(() => {
        const fs = (window as any).FontSwitcher;
        return {
          init: typeof fs.init,
          getPreference: typeof fs.getPreference,
          setPreference: typeof fs.setPreference,
          applyFont: typeof fs.applyFont,
          renderUI: typeof fs.renderUI,
          updateUI: typeof fs.updateUI,
          getCurrentFont: typeof fs.getCurrentFont,
          getFontData: typeof fs.getFontData
        };
      });

      expect(methods.init).toBe('function');
      expect(methods.getPreference).toBe('function');
      expect(methods.setPreference).toBe('function');
      expect(methods.applyFont).toBe('function');
      expect(methods.renderUI).toBe('function');
      expect(methods.updateUI).toBe('function');
      expect(methods.getCurrentFont).toBe('function');
      expect(methods.getFontData).toBe('function');
    });

    test('setPreference programmatically changes font', async ({ page }) => {
      await page.click('#set-inter');

      const font = await page.evaluate(() => document.documentElement.getAttribute('data-font'));
      expect(font).toBe('inter');
    });

    test('getCurrentFont returns current font', async ({ page }) => {
      await page.click('#get-font');

      const display = await page.locator('#font-display').textContent();
      expect(display).toContain('ubuntu');
    });

    test('getFontData returns font information', async ({ page }) => {
      await page.click('#get-font-data');

      const display = await page.locator('#font-display').textContent();
      expect(display).toContain('Inter');
      expect(display).toContain('Inter\', sans-serif');
    });

    test('getFontData returns null for unknown font', async ({ page }) => {
      const result = await page.evaluate(() => {
        return (window as any).FontSwitcher.getFontData('unknown-font');
      });
      expect(result).toBeNull();
    });
  });

  test.describe('Available Fonts', () => {
    test('has expected fonts in configuration', async ({ page }) => {
      const fonts = await page.evaluate(() => {
        return Object.keys((window as any).FontSwitcher.fonts);
      });

      expect(fonts).toContain('system');
      expect(fonts).toContain('inter');
      expect(fonts).toContain('ubuntu');
      expect(fonts).toContain('open-sans');
      expect(fonts).toContain('jetbrains-mono');
    });

    test('font data includes name and family', async ({ page }) => {
      const fontData = await page.evaluate(() => {
        return (window as any).FontSwitcher.getFontData('inter');
      });

      expect(fontData.name).toBe('Inter');
      expect(fontData.family).toBe("'Inter', sans-serif");
    });
  });
});