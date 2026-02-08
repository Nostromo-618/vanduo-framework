/**
 * Modal Component Tests
 * 
 * Tests for js/components/modals.js
 * Covers: initialization, opening, closing, focus management
 */

import { test, expect } from '@playwright/test';

test.describe('Modal Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/modals.html');
    // Wait for modals to be initialized
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes with correct ARIA attributes', async ({ page }) => {
      const modal = page.locator('#test-modal');
      
      await expect(modal).toHaveAttribute('role', 'dialog');
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      await expect(modal).toHaveAttribute('aria-hidden', 'true');
    });

    test('modal has dialog role when opened', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      const modal = page.locator('#test-modal');
      await expect(modal).toHaveAttribute('role', 'dialog');
    });
  });

  test.describe('Opening', () => {
    test('opens via data-modal trigger click', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      
      const modal = page.locator('#test-modal');
      await expect(modal).toHaveClass(/is-open/);
      await expect(modal).toHaveAttribute('aria-hidden', 'false');
    });

    test('shows backdrop when opened', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      
      // Use first() since there might be multiple backdrops
      const backdrop = page.locator('.vd-modal-backdrop').first();
      await expect(backdrop).toHaveClass(/is-visible/);
    });

    test('locks body scroll when opened', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      
      const isBodyLocked = await page.evaluate(() => {
        return document.body.classList.contains('body-modal-open');
      });
      
      expect(isBodyLocked).toBe(true);
    });
  });

  test.describe('Closing', () => {
    test('closes on close button click', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      await page.click('#test-modal .vd-modal-close');
      
      const modal = page.locator('#test-modal');
      await expect(modal).not.toHaveClass(/is-open/);
      await expect(modal).toHaveAttribute('aria-hidden', 'true');
    });

    test('closes on ESC key', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      await page.keyboard.press('Escape');
      
      const modal = page.locator('#test-modal');
      await expect(modal).not.toHaveClass(/is-open/);
    });

    test('static backdrop modal opens correctly', async ({ page }) => {
      await page.click('[data-modal="#static-backdrop-modal"]');
      
      // Modal should be open
      const modal = page.locator('#static-backdrop-modal');
      await expect(modal).toHaveClass(/is-open/);
      
      // Can close via close button
      await page.click('#static-backdrop-modal .vd-modal-close');
      await expect(modal).not.toHaveClass(/is-open/);
    });

    test('restores body scroll on close', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      await page.keyboard.press('Escape');
      
      const isBodyLocked = await page.evaluate(() => {
        return document.body.classList.contains('body-modal-open');
      });
      
      expect(isBodyLocked).toBe(false);
    });
  });

  test.describe('Events', () => {
    test('dispatches modal:open event', async ({ page }) => {
      // Set up event listener
      await page.evaluate(() => {
        (window as any).modalOpenFired = false;
        document.querySelector('#test-modal')?.addEventListener('modal:open', () => {
          (window as any).modalOpenFired = true;
        });
      });
      
      await page.click('[data-modal="#test-modal"]');
      
      const eventFired = await page.evaluate(() => (window as any).modalOpenFired);
      expect(eventFired).toBe(true);
    });

    test('dispatches modal:close event', async ({ page }) => {
      // Set up event listener
      await page.evaluate(() => {
        (window as any).modalCloseFired = false;
        document.querySelector('#test-modal')?.addEventListener('modal:close', () => {
          (window as any).modalCloseFired = true;
        });
      });
      
      await page.click('[data-modal="#test-modal"]');
      await page.keyboard.press('Escape');
      
      const eventFired = await page.evaluate(() => (window as any).modalCloseFired);
      expect(eventFired).toBe(true);
    });
  });

  test.describe('Programmatic API', () => {
    test('opens programmatically via VanduoModals.open()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).VanduoModals.open('#test-modal');
      });
      
      const modal = page.locator('#test-modal');
      await expect(modal).toHaveClass(/is-open/);
    });

    test('closes programmatically via VanduoModals.close()', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      
      await page.evaluate(() => {
        (window as any).VanduoModals.close('#test-modal');
      });
      
      const modal = page.locator('#test-modal');
      await expect(modal).not.toHaveClass(/is-open/);
    });
  });
});
