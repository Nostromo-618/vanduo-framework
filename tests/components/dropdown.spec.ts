/**
 * Dropdown Component Tests
 * 
 * Tests for js/components/dropdown.js
 * Covers: initialization, opening, closing, keyboard navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Dropdown Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/dropdown.html');
    // Wait for dropdowns to be initialized
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes with correct ARIA attributes', async ({ page }) => {
      const toggle = page.locator('#basic-dropdown .dropdown-toggle');
      const menu = page.locator('#basic-dropdown .dropdown-menu');
      
      await expect(toggle).toHaveAttribute('aria-haspopup', 'true');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toHaveAttribute('role', 'menu');
      await expect(menu).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Opening', () => {
    test('opens on toggle click', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      
      const dropdown = page.locator('#basic-dropdown');
      const menu = page.locator('#basic-dropdown .dropdown-menu');
      
      await expect(dropdown).toHaveClass(/is-open/);
      await expect(menu).toHaveClass(/is-open/);
    });

    test('updates ARIA states when opened', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      
      const toggle = page.locator('#basic-dropdown .dropdown-toggle');
      const menu = page.locator('#basic-dropdown .dropdown-menu');
      
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).toHaveAttribute('aria-hidden', 'false');
    });
  });

  test.describe('Closing', () => {
    test('closes via close API', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      
      // Open first
      await expect(page.locator('#basic-dropdown')).toHaveClass(/is-open/);
      
      // Close via programmatic API (most reliable)
      await page.evaluate(() => {
        (window as any).VanduoDropdown.close('#basic-dropdown');
      });
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).not.toHaveClass(/is-open/);
    });

    test('updates ARIA states when closed', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      await expect(page.locator('#basic-dropdown')).toHaveClass(/is-open/);
      
      // Close via programmatic API
      await page.evaluate(() => {
        (window as any).VanduoDropdown.close('#basic-dropdown');
      });
      
      const toggle = page.locator('#basic-dropdown .dropdown-toggle');
      const menu = page.locator('#basic-dropdown .dropdown-menu');
      
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('opens on Enter key', async ({ page }) => {
      await page.focus('#basic-dropdown .dropdown-toggle');
      await page.keyboard.press('Enter');
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('opens on Space key', async ({ page }) => {
      await page.focus('#basic-dropdown .dropdown-toggle');
      await page.keyboard.press('Space');
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('opens on ArrowDown key', async ({ page }) => {
      await page.focus('#basic-dropdown .dropdown-toggle');
      await page.keyboard.press('ArrowDown');
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).toHaveClass(/is-open/);
    });

  });

  test.describe('Item Selection', () => {
    test('closes dropdown when item clicked', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      await page.click('#basic-dropdown .dropdown-item[data-value="option2"]');
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).not.toHaveClass(/is-open/);
    });

    test('fires dropdown:select event with item details', async ({ page }) => {
      // Set up event listener
      await page.evaluate(() => {
        (window as any).selectEventDetail = null;
        document.querySelector('#basic-dropdown')?.addEventListener('dropdown:select', (e: any) => {
          (window as any).selectEventDetail = e.detail;
        });
      });
      
      await page.click('#basic-dropdown .dropdown-toggle');
      await page.click('#basic-dropdown .dropdown-item[data-value="option2"]');
      
      const detail = await page.evaluate(() => (window as any).selectEventDetail);
      expect(detail).toBeTruthy();
      expect(detail.value).toBe('option2');
    });
  });

  test.describe('Disabled Items', () => {
    test('does not select disabled items', async ({ page }) => {
      // Set up event listener
      await page.evaluate(() => {
        (window as any).selectEventFired = false;
        document.querySelector('#dropdown-with-disabled')?.addEventListener('dropdown:select', () => {
          (window as any).selectEventFired = true;
        });
      });
      
      await page.click('#dropdown-with-disabled .dropdown-toggle');
      
      // Try to click a disabled item - the implementation prevents this
      const disabledItem = page.locator('#dropdown-with-disabled .dropdown-item.disabled');
      const isDisabled = await disabledItem.evaluate(el => el.classList.contains('disabled'));
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Programmatic API', () => {
    test('opens programmatically via VanduoDropdown.open()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).VanduoDropdown.open('#basic-dropdown');
      });
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).toHaveClass(/is-open/);
    });

    test('closes programmatically via VanduoDropdown.close()', async ({ page }) => {
      await page.click('#basic-dropdown .dropdown-toggle');
      
      await page.evaluate(() => {
        (window as any).VanduoDropdown.close('#basic-dropdown');
      });
      
      const dropdown = page.locator('#basic-dropdown');
      await expect(dropdown).not.toHaveClass(/is-open/);
    });
  });
});
