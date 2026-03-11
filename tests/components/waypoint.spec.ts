/**
 * Waypoint (Scrollspy) Component Tests
 *
 * Tests for js/components/waypoint.js + css/components/waypoint.css
 * Covers: initialization, active highlighting, scroll updates, click navigation, events
 */

import { test, expect } from '@playwright/test';

test.describe('Waypoint (Scrollspy) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/waypoint.html');
    await page.waitForTimeout(400);
  });

  test.describe('Initialization', () => {
    test('highlights first section link on load', async ({ page }) => {
      const firstLink = page.locator('#spy-nav a').first();
      await expect(firstLink).toHaveClass(/is-active/);
    });

    test('sections get data-vd-waypoint-section attribute', async ({ page }) => {
      const section = page.locator('#section-1');
      await expect(section).toHaveAttribute('data-vd-waypoint-section', '');
    });
  });

  test.describe('Scroll Highlighting', () => {
    test('highlights correct link when scrolling to section', async ({ page }) => {
      // Scroll the section to top of viewport
      await page.evaluate(() => {
        const section = document.getElementById('section-3')!;
        const top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 40, behavior: 'instant' });
      });

      // Poll for the IntersectionObserver to fire
      await expect(async () => {
        const cls = await page.locator('#spy-nav a[href="#section-3"]').getAttribute('class');
        expect(cls).toContain('is-active');
      }).toPass({ timeout: 8000 });
    });
  });

  test.describe('Click Navigation', () => {
    test('clicking nav link scrolls to section', async ({ page }) => {
      await page.click('#spy-nav a[href="#section-2"]');

      await expect(async () => {
        const cls = await page.locator('#spy-nav a[href="#section-2"]').getAttribute('class');
        expect(cls).toContain('is-active');
      }).toPass({ timeout: 8000 });
    });
  });

  test.describe('Events', () => {
    test('fires waypoint:change event', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise<boolean>(resolve => {
          const nav = document.getElementById('spy-nav')!;
          nav.addEventListener('waypoint:change', () => resolve(true));
          document.getElementById('section-3')!.scrollIntoView();
        });
      });
      expect(eventFired).toBe(true);
    });
  });
});
