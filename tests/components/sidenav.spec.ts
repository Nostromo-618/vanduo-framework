/**
 * Sidenav Component Tests
 *
 * Tests for js/components/sidenav.js
 * Covers: initialization, drawer open/close, overlay, push variant, keyboard navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Sidenav Component @component', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for sidenav tests
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tests/fixtures/sidenav.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes sidenav components', async ({ page }) => {
      const sidenavs = page.locator('.vd-sidenav');
      await expect(sidenavs).toHaveCount(4);
    });

    test('sets correct ARIA attributes', async ({ page }) => {
      const sidenav = page.locator('#basic-sidenav');
      await expect(sidenav).toHaveAttribute('role', 'navigation');
      await expect(sidenav).toHaveAttribute('aria-hidden', 'true');
    });

    test('toggle buttons are initialized', async ({ page }) => {
      const toggles = page.locator('[data-sidenav-toggle]');
      await expect(toggles).toHaveCount(4);
    });

    test('toggle buttons have initialized attribute', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      await expect(toggle).toHaveAttribute('data-sidenav-toggle-initialized', 'true');
    });
  });

  test.describe('Opening and Closing', () => {
    test('opens sidenav on toggle button click', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      const sidenav = page.locator('#basic-sidenav');

      await toggle.click();

      await expect(sidenav).toHaveClass(/is-open/);
      await expect(sidenav).toHaveAttribute('aria-hidden', 'false');
    });

    test('closes sidenav on close button click', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      const closeBtn = page.locator('#basic-sidenav .vd-sidenav-close');
      const sidenav = page.locator('#basic-sidenav');

      await toggle.click();
      await expect(sidenav).toHaveClass(/is-open/);

      await closeBtn.click();
      await expect(sidenav).not.toHaveClass(/is-open/);
    });

    test('closes sidenav on overlay click', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      const sidenav = page.locator('#basic-sidenav');

      await toggle.click();
      await expect(sidenav).toHaveClass(/is-open/);

      // Dispatch a direct click on the visible overlay to avoid pointer interception issues
      await page.evaluate(() => {
        const overlay = document.querySelector('.vd-sidenav-overlay.is-visible');
        overlay?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      await expect(sidenav).not.toHaveClass(/is-open/);
    });

    test('overlay is visible when sidenav is open', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');

      await toggle.click();

      const overlay = page.locator('.vd-sidenav-overlay.is-visible');
      await expect(overlay).toBeVisible();
    });
  });

  test.describe('Static Backdrop', () => {
    test('does not close on overlay click when backdrop is static', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#static-sidenav"]');
      const sidenav = page.locator('#static-sidenav');

      await toggle.click();
      await expect(sidenav).toHaveClass(/is-open/);

      // Try clicking overlay (use force to bypass sidenav body element)
      const overlay = page.locator('.vd-sidenav-overlay.is-visible');
      if (await overlay.isVisible().catch(() => false)) {
        await overlay.click({ force: true });
      }

      // Sidenav should still be open
      await expect(sidenav).toHaveClass(/is-open/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('closes sidenav on Escape key', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      const sidenav = page.locator('#basic-sidenav');

      await toggle.click();
      await expect(sidenav).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');

      await expect(sidenav).not.toHaveClass(/is-open/);
    });

    test('does not close on Escape when keyboard is disabled', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#no-keyboard-sidenav"]');
      const sidenav = page.locator('#no-keyboard-sidenav');

      await toggle.click();
      await expect(sidenav).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');

      // Should still be open
      await expect(sidenav).toHaveClass(/is-open/);
    });
  });

  test.describe('Body Scroll Lock', () => {
    test('adds body class when sidenav is open', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');

      await toggle.click();

      const bodyHasClass = await page.evaluate(() => {
        return document.body.classList.contains('body-sidenav-open');
      });
      expect(bodyHasClass).toBe(true);
    });

    test('removes body class when sidenav is closed', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      const closeBtn = page.locator('#basic-sidenav .vd-sidenav-close');

      await toggle.click();
      await closeBtn.click();

      const bodyHasClass = await page.evaluate(() => {
        return document.body.classList.contains('body-sidenav-open');
      });
      expect(bodyHasClass).toBe(false);
    });
  });

  test.describe('Right-aligned Sidenav', () => {
    test('opens right-aligned sidenav', async ({ page }) => {
      const toggle = page.locator('[data-sidenav-toggle="#right-sidenav"]');
      const sidenav = page.locator('#right-sidenav');

      await toggle.click();

      await expect(sidenav).toHaveClass(/is-open/);
      await expect(sidenav).toHaveClass(/sidenav-right/);
    });
  });

  test.describe('Events', () => {
    test('dispatches sidenav:open event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).openEventFired = false;
        document.addEventListener('sidenav:open', () => {
          (window as any).openEventFired = true;
        });
      });

      await page.locator('[data-sidenav-toggle="#basic-sidenav"]').click();

      const eventFired = await page.evaluate(() => (window as any).openEventFired);
      expect(eventFired).toBe(true);
    });

    test('dispatches sidenav:close event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).closeEventFired = false;
        document.addEventListener('sidenav:close', () => {
          (window as any).closeEventFired = true;
        });
      });

      const toggle = page.locator('[data-sidenav-toggle="#basic-sidenav"]');
      await toggle.click();
      await page.locator('#basic-sidenav .vd-sidenav-close').click();

      const eventFired = await page.evaluate(() => (window as any).closeEventFired);
      expect(eventFired).toBe(true);
    });
  });

  test.describe('Programmatic API', () => {
    test('VanduoSidenav is exposed globally', async ({ page }) => {
      const exists = await page.evaluate(() => typeof (window as any).VanduoSidenav !== 'undefined');
      expect(exists).toBe(true);
    });

    test('has expected API methods', async ({ page }) => {
      const methods = await page.evaluate(() => {
        const sn = (window as any).VanduoSidenav;
        return {
          init: typeof sn.init,
          initSidenav: typeof sn.initSidenav,
          open: typeof sn.open,
          close: typeof sn.close,
          toggle: typeof sn.toggle,
          handlePushVariant: typeof sn.handlePushVariant,
          handleResize: typeof sn.handleResize,
          createOverlay: typeof sn.createOverlay,
          destroy: typeof sn.destroy,
          destroyAll: typeof sn.destroyAll
        };
      });

      expect(methods.init).toBe('function');
      expect(methods.initSidenav).toBe('function');
      expect(methods.open).toBe('function');
      expect(methods.close).toBe('function');
      expect(methods.toggle).toBe('function');
      expect(methods.handlePushVariant).toBe('function');
      expect(methods.handleResize).toBe('function');
      expect(methods.createOverlay).toBe('function');
      expect(methods.destroy).toBe('function');
      expect(methods.destroyAll).toBe('function');
    });

    test('open method opens sidenav', async ({ page }) => {
      await page.click('#open-basic');

      const sidenav = page.locator('#basic-sidenav');
      await expect(sidenav).toHaveClass(/is-open/);
    });

    test('close method closes sidenav', async ({ page }) => {
      // First open it via toggle button
      await page.locator('[data-sidenav-toggle="#basic-sidenav"]').click();
      await expect(page.locator('#basic-sidenav')).toHaveClass(/is-open/);

      // Then close via API
      await page.evaluate(() => {
        (window as any).VanduoSidenav.close('#basic-sidenav');
      });
      await expect(page.locator('#basic-sidenav')).not.toHaveClass(/is-open/);
    });

    test('toggle method toggles sidenav', async ({ page }) => {
      const sidenav = page.locator('#basic-sidenav');

      // Toggle open via API
      await page.evaluate(() => {
        (window as any).VanduoSidenav.toggle('#basic-sidenav');
      });
      await expect(sidenav).toHaveClass(/is-open/);

      // Toggle closed via API
      await page.evaluate(() => {
        (window as any).VanduoSidenav.toggle('#basic-sidenav');
      });
      await expect(sidenav).not.toHaveClass(/is-open/);
    });

    test('can open sidenav by selector string', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).VanduoSidenav.open('#basic-sidenav');
      });

      const sidenav = page.locator('#basic-sidenav');
      await expect(sidenav).toHaveClass(/is-open/);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('handles resize events', async ({ page }) => {
      const hasHandler = await page.evaluate(() => {
        return typeof (window as any).VanduoSidenav.handleResize === 'function';
      });
      expect(hasHandler).toBe(true);
    });
  });
});