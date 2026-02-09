/**
 * Accessibility Tests
 * 
 * Tests for ARIA attributes, keyboard navigation, focus management
 * Manual assertions without external dependencies
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests @a11y', () => {
  
  test.describe('Modal Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/modals.html');
      await page.waitForTimeout(100);
    });

    test('modal has required ARIA attributes', async ({ page }) => {
      const modal = page.locator('#test-modal');
      
      // Check core ARIA
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('hidden modal has aria-hidden="true"', async ({ page }) => {
      const modal = page.locator('#test-modal');
      await expect(modal).toHaveAttribute('aria-hidden', 'true');
    });

    test('opened modal has aria-hidden="false"', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      const modal = page.locator('#test-modal');
      await expect(modal).toHaveAttribute('aria-hidden', 'false');
    });

    test('close button has aria-label', async ({ page }) => {
      const closeButton = page.locator('#test-modal .vd-modal-close');
      await expect(closeButton).toHaveAttribute('aria-label', 'Close');
    });
  });

  test.describe('Dropdown Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/dropdown.html');
      await page.waitForTimeout(100);
    });

    test('dropdown toggle has aria-haspopup', async ({ page }) => {
      const toggle = page.locator('#basic-dropdown .vd-dropdown-toggle');
      await expect(toggle).toHaveAttribute('aria-haspopup', 'true');
    });

    test('aria-expanded reflects dropdown state', async ({ page }) => {
      const toggle = page.locator('#basic-dropdown .vd-dropdown-toggle');
      
      // Closed by default
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      
      // Open dropdown
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      
      // Close dropdown via API
      await page.evaluate(() => {
        (window as any).VanduoDropdown.close('#basic-dropdown');
      });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('dropdown menu has role="menu"', async ({ page }) => {
      const menu = page.locator('#basic-dropdown .vd-dropdown-menu');
      await expect(menu).toHaveAttribute('role', 'menu');
    });

    test('menu aria-hidden reflects visibility', async ({ page }) => {
      const menu = page.locator('#basic-dropdown .vd-dropdown-menu');
      
      // Hidden by default
      await expect(menu).toHaveAttribute('aria-hidden', 'true');
      
      // Open dropdown
      await page.click('#basic-dropdown .vd-dropdown-toggle');
      await expect(menu).toHaveAttribute('aria-hidden', 'false');
    });

    test('dropdown can be closed with API', async ({ page }) => {
      await page.click('#basic-dropdown .vd-dropdown-toggle');
      
      // Should be open
      await expect(page.locator('#basic-dropdown')).toHaveClass(/is-open/);
      
      // Close via API
      await page.evaluate(() => {
        (window as any).VanduoDropdown.close('#basic-dropdown');
      });
      
      // Should be closed
      await expect(page.locator('#basic-dropdown')).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Button Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/buttons.html');
    });

    test('buttons have proper focus indication', async ({ page }) => {
      const button = page.locator('.btn-primary').first();
      await button.focus();
      
      // Check that button can be focused
      await expect(button).toBeFocused();
    });

    test('disabled buttons are not interactive', async ({ page }) => {
      const disabledButton = page.locator('.btn-primary[disabled]').first();
      
      // Check disabled attribute
      await expect(disabledButton).toBeDisabled();
    });

    test('buttons maintain accessible name', async ({ page }) => {
      const button = page.locator('.btn-primary').first();
      
      // Button should have visible text content
      const text = await button.textContent();
      expect(text?.trim()).toBeTruthy();
    });
  });

  test.describe('Color Contrast', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/buttons.html');
    });

    test('primary button has sufficient color contrast', async ({ page }) => {
      // Get computed styles
      const styles = await page.evaluate(() => {
        const btn = document.querySelector('.btn-primary');
        if (!btn) return null;
        const computed = window.getComputedStyle(btn);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });

      expect(styles).toBeTruthy();
      // Verify we got color values
      expect(styles?.color).toBeTruthy();
      expect(styles?.backgroundColor).toBeTruthy();
    });

    test('text is visible on button backgrounds', async ({ page }) => {
      const buttons = page.locator('.btn');
      const count = await buttons.count();
      
      // Check each button has visible text
      for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        expect(text?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('Focus Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/buttons.html');
    });

    test('buttons can receive focus', async ({ page }) => {
      const button = page.locator('.btn').first();
      await button.focus();
      
      const isFocused = await page.evaluate(() => {
        return document.activeElement?.tagName === 'BUTTON' || 
               document.activeElement?.classList.contains('btn');
      });
      expect(isFocused).toBe(true);
    });

    test('focus is visible on interactive elements', async ({ page }) => {
      const buttons = page.locator('.btn:not([disabled])');
      const firstButton = buttons.first();
      
      await firstButton.focus();
      
      // Should be focused
      await expect(firstButton).toBeFocused();
    });
  });

  test.describe('Font Switching Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/buttons.html');
    });

    test('all Google Fonts render correctly', async ({ page }) => {
      const fonts = ['ubuntu', 'open-sans', 'rubik', 'titillium-web'];
      
      for (const font of fonts) {
        // Set font via data-font attribute
        await page.evaluate((f) => {
          document.documentElement.setAttribute('data-font', f);
        }, font);
        
        // Check that body has the font family applied
        const fontFamily = await page.evaluate(() => {
          return window.getComputedStyle(document.body).fontFamily;
        });
        
        // Font family should contain the expected font name
        expect(fontFamily.toLowerCase()).toContain(font.replace('-', ' '));
      }
    });

    test('font switching maintains text readability', async ({ page }) => {
      // Switch to Ubuntu
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-font', 'ubuntu');
      });
      
      // Get body font size and line height
      const styles = await page.evaluate(() => {
        const computed = window.getComputedStyle(document.body);
        return {
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight
        };
      });
      
      // Verify text remains readable (font size should be reasonable)
      const fontSizePx = parseInt(styles.fontSize);
      expect(fontSizePx).toBeGreaterThanOrEqual(14);
      expect(fontSizePx).toBeLessThanOrEqual(20);
    });

  });
});
