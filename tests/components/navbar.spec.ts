/**
 * Navbar Component Tests
 *
 * Tests for js/components/navbar.js
 * Covers: initialization, mobile menu toggle, ESC key, resize handling, events
 */

import { test, expect } from '@playwright/test';

test.describe('Navbar Component @component', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for navbar tests (toggle only visible on mobile)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tests/fixtures/navbar.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes navbar elements', async ({ page }) => {
      const navbars = page.locator('.navbar');
      await expect(navbars).toHaveCount(3);
    });

    test('sets correct aria-expanded on toggle buttons', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('sets correct aria-hidden on menus', async ({ page }) => {
      const menu = page.locator('#basic-navbar .navbar-menu');
      await expect(menu).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Mobile Menu Toggle', () => {
    test('opens menu on toggle click', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      const menu = page.locator('#basic-navbar .navbar-menu');

      await toggle.click();

      await expect(menu).toHaveClass(/is-open/);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).toHaveAttribute('aria-hidden', 'false');
    });

    test('closes menu on second toggle click', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      const menu = page.locator('#basic-navbar .navbar-menu');

      await toggle.click();
      await expect(menu).toHaveClass(/is-open/);

      await toggle.click();
      await expect(menu).not.toHaveClass(/is-open/);
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes menu on overlay click', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      const menu = page.locator('#basic-navbar .navbar-menu');

      await toggle.click();
      await expect(menu).toHaveClass(/is-open/);

      // Click on the overlay (use force to bypass navbar menu element)
      await page.locator('.navbar-overlay.is-active').click({ force: true });

      await expect(menu).not.toHaveClass(/is-open/);
    });

    test('closes menu on outside click', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      const menu = page.locator('#basic-navbar .navbar-menu');

      await toggle.click();
      await expect(menu).toHaveClass(/is-open/);

      // Click on body outside navbar (main content)
      await page.evaluate(() => {
        document.body.click();
      });

      await expect(menu).not.toHaveClass(/is-open/);
    });

    test('toggle button gets is-active class when menu is open', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');

      await toggle.click();

      await expect(toggle).toHaveClass(/is-active/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('closes menu on Escape key', async ({ page }) => {
      const toggle = page.locator('#basic-navbar .navbar-toggle');
      const menu = page.locator('#basic-navbar .navbar-menu');

      await toggle.click();
      await expect(menu).toHaveClass(/is-open/);

      await page.keyboard.press('Escape');

      await expect(menu).not.toHaveClass(/is-open/);
    });
  });

  test.describe('Dropdown in Mobile Menu', () => {
    test('toggles dropdown on click in mobile view', async ({ page }) => {
      const toggle = page.locator('#navbar-with-dropdown .navbar-toggle');
      const menu = page.locator('#navbar-with-dropdown .navbar-menu');

      await toggle.click();
      await expect(menu).toHaveClass(/is-open/);

      const dropdownLink = page.locator('#navbar-with-dropdown .navbar-dropdown > .nav-link').first();
      const dropdownMenu = page.locator('#navbar-with-dropdown .navbar-dropdown-menu');

      await dropdownLink.click();

      await expect(dropdownMenu).toHaveClass(/is-open/);
    });
  });

  test.describe('Programmatic API', () => {
    test('VanduoNavbar is exposed globally', async ({ page }) => {
      const navbarExists = await page.evaluate(() => typeof window.VanduoNavbar !== 'undefined');
      expect(navbarExists).toBe(true);
    });

    test('has expected API methods', async ({ page }) => {
      const methods = await page.evaluate(() => {
        const nb = window.VanduoNavbar;
        return {
          init: typeof nb.init,
          initNavbar: typeof nb.initNavbar,
          toggleMenu: typeof nb.toggleMenu,
          openMenu: typeof nb.openMenu,
          closeMenu: typeof nb.closeMenu,
          destroy: typeof nb.destroy,
          destroyAll: typeof nb.destroyAll,
          getBreakpoint: typeof nb.getBreakpoint,
          createOverlay: typeof nb.createOverlay
        };
      });

      expect(methods.init).toBe('function');
      expect(methods.initNavbar).toBe('function');
      expect(methods.toggleMenu).toBe('function');
      expect(methods.openMenu).toBe('function');
      expect(methods.closeMenu).toBe('function');
      expect(methods.destroy).toBe('function');
      expect(methods.destroyAll).toBe('function');
      expect(methods.getBreakpoint).toBe('function');
      expect(methods.createOverlay).toBe('function');
    });

    test('getBreakpoint returns a number', async ({ page }) => {
      const breakpoint = await page.evaluate(() => window.VanduoNavbar.getBreakpoint());
      expect(typeof breakpoint).toBe('number');
      expect(breakpoint).toBeGreaterThan(0);
    });

    test('can programmatically toggle menu', async ({ page }) => {
      const menu = page.locator('#api-menu');

      await page.evaluate(() => {
        const navbar = document.querySelector('#api-navbar') as HTMLElement;
        const toggle = document.querySelector('#api-toggle') as HTMLElement;
        const menuEl = document.querySelector('#api-menu') as HTMLElement;
        const overlay = document.querySelector('.navbar-overlay') as HTMLElement | null;
        window.VanduoNavbar.openMenu(navbar, toggle, menuEl, overlay);
      });

      await expect(menu).toHaveClass(/is-open/);
    });
  });
});