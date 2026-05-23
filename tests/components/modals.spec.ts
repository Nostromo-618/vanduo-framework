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
      
      const backdrop = page.locator('.vd-modal-backdrop.is-visible').first();
      await expect(backdrop).toBeVisible();
    });

    test('locks body scroll when opened', async ({ page }) => {
      await page.click('[data-modal="#test-modal"]');
      
      const isBodyLocked = await page.evaluate(() => {
        return document.body.classList.contains('body-modal-open');
      });
      
      expect(isBodyLocked).toBe(true);
    });

    test('card-hosted modal portals to body and stays above its backdrop', async ({ page }) => {
      const modal = page.locator('#card-hosted-modal');

      await expect.poll(() => modal.evaluate((node) => node.parentElement && node.parentElement.id)).toBe('card-modal-body');

      await page.click('[data-modal="#card-hosted-modal"]');
      await expect(modal).toHaveClass(/is-open/);
      await expect.poll(() => modal.evaluate((node) => node.parentElement === document.body)).toBe(true);

      const layerInfo = await page.evaluate(() => {
        const modalEl = document.querySelector('#card-hosted-modal');
        const backdropEl = document.querySelector('.vd-modal-backdrop.is-visible');
        const rect = modalEl?.getBoundingClientRect();

        return {
          modalZ: modalEl ? Number(window.getComputedStyle(modalEl).zIndex) : 0,
          backdropZ: backdropEl ? Number(window.getComputedStyle(backdropEl).zIndex) : 0,
          centered: rect ? Math.abs((rect.left + rect.width / 2) - window.innerWidth / 2) <= 2 : false
        };
      });

      expect(layerInfo.modalZ).toBeGreaterThan(layerInfo.backdropZ);
      expect(layerInfo.centered).toBe(true);
    });

    test('dialog-level size modifiers render distinct desktop widths', async ({ page }) => {
      const viewport = page.viewportSize();
      test.skip(!viewport || viewport.width < 992, 'Desktop width tiers collapse on narrow viewports by design.');

      const measureDialogWidth = async (triggerSelector: string, modalSelector: string) => {
        await page.click(triggerSelector);
        await expect(page.locator(modalSelector)).toHaveClass(/is-open/);

        const width = await page.locator(`${modalSelector} .vd-modal-dialog`).evaluate((node) => {
          return Math.round(node.getBoundingClientRect().width);
        });

        await page.keyboard.press('Escape');
        await expect(page.locator(modalSelector)).not.toHaveClass(/is-open/);

        return width;
      };

      const defaultWidth = await measureDialogWidth('[data-modal="#test-modal"]', '#test-modal');
      const smallWidth = await measureDialogWidth('[data-modal="#size-modal-sm"]', '#size-modal-sm');
      const largeWidth = await measureDialogWidth('[data-modal="#size-modal-lg"]', '#size-modal-lg');
      const extraLargeWidth = await measureDialogWidth('[data-modal="#size-modal-xl"]', '#size-modal-xl');

      expect(smallWidth).toBeLessThan(defaultWidth);
      expect(defaultWidth).toBeLessThan(largeWidth);
      expect(largeWidth).toBeLessThan(extraLargeWidth);

      expect(defaultWidth - smallWidth).toBeGreaterThanOrEqual(120);
      expect(largeWidth - defaultWidth).toBeGreaterThanOrEqual(180);
      expect(extraLargeWidth - largeWidth).toBeGreaterThanOrEqual(300);
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

    test('restores a card-hosted modal to its original container on close', async ({ page }) => {
      const modal = page.locator('#card-hosted-modal');

      await page.click('[data-modal="#card-hosted-modal"]');
      await expect.poll(() => modal.evaluate((node) => node.parentElement === document.body)).toBe(true);

      await page.keyboard.press('Escape');
      await expect(modal).not.toHaveClass(/is-open/);
      await expect.poll(() => modal.evaluate((node) => node.parentElement && node.parentElement.id)).toBe('card-modal-body');
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
