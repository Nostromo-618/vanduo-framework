/**
 * Affix (Sticky) Component Tests
 *
 * Tests for js/components/affix.js + css/components/affix.css
 * Covers: initialization, viewport fallback, container sticking, events, offset
 */

import { test, expect } from '@playwright/test';

test.describe('Affix (Sticky) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/affix.html');
    await page.waitForTimeout(200);
  });

  test.describe('Initialization', () => {
    test('element starts as not stuck', async ({ page }) => {
      const bar = page.locator('#sticky-bar');
      await expect(bar).not.toHaveClass(/is-stuck/);
    });

    test('sets the vd-prefixed offset runtime token', async ({ page }) => {
      const offset = await page.locator('#nested-sticky').evaluate((el) => {
        return (el as HTMLElement).style.getPropertyValue('--vd-affix-top-offset');
      });

      expect(offset).toBe('20px');
    });
  });

  test.describe('Viewport Fallback', () => {
    test('adds is-stuck class when scrolled past with window scrolling', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);

      const bar = page.locator('#sticky-bar');
      await expect(bar).toHaveClass(/is-stuck/);
    });

    test('removes is-stuck when scrolled back', async ({ page }) => {
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const bar = page.locator('#sticky-bar');
      await expect(bar).not.toHaveClass(/is-stuck/);
    });
  });

  test.describe('Scroll Container Detection', () => {
    test('sticks when the nearest scroll container scrolls', async ({ page }) => {
      await page.locator('#scroll-panel').evaluate((el) => {
        el.scrollTop = 180;
      });
      await page.waitForTimeout(300);

      const bar = page.locator('#container-sticky');
      await expect(bar).toHaveClass(/is-stuck/);
    });

    test('unsticks when the nearest scroll container scrolls back', async ({ page }) => {
      await page.locator('#scroll-panel').evaluate((el) => {
        el.scrollTop = 180;
      });
      await page.waitForTimeout(300);
      await page.locator('#scroll-panel').evaluate((el) => {
        el.scrollTop = 0;
      });
      await page.waitForTimeout(300);

      const bar = page.locator('#container-sticky');
      await expect(bar).not.toHaveClass(/is-stuck/);
    });

    test('applies offset relative to the active scroll container', async ({ page }) => {
      await page.locator('#inner-scroll').evaluate((el) => {
        el.scrollTop = 180;
      });
      await page.waitForTimeout(300);

      const metrics = await page.evaluate(() => {
        const root = document.getElementById('inner-scroll');
        const sticky = document.getElementById('nested-sticky');
        if (!root || !sticky) return null;

        const rootRect = root.getBoundingClientRect();
        const stickyRect = sticky.getBoundingClientRect();

        return {
          delta: stickyRect.top - rootRect.top
        };
      });

      expect(metrics).not.toBeNull();
      expect(metrics!.delta).toBeGreaterThanOrEqual(18);
      expect(metrics!.delta).toBeLessThanOrEqual(22);
    });

    test('prefers the nearest scrollable ancestor', async ({ page }) => {
      await page.locator('#outer-scroll').evaluate((el) => {
        el.scrollTop = 180;
      });
      await page.waitForTimeout(300);

      const nestedBar = page.locator('#nested-sticky');
      await expect(nestedBar).not.toHaveClass(/is-stuck/);

      await page.locator('#inner-scroll').evaluate((el) => {
        el.scrollTop = 180;
      });
      await page.waitForTimeout(300);

      await expect(nestedBar).toHaveClass(/is-stuck/);
    });
  });

  test.describe('Events', () => {
    test('fires affix events for container scrolling with detail', async ({ page }) => {
      const eventData = await page.evaluate(() => {
        return new Promise<{ stuck: string; unstuck: string }>((resolve) => {
          const target = document.getElementById('container-sticky');
          const panel = document.getElementById('scroll-panel');
          const state = { stuck: '', unstuck: '' };

          if (!target || !panel) {
            resolve(state);
            return;
          }

          target.addEventListener('affix:stuck', (event) => {
            const detail = (event as CustomEvent).detail;
            state.stuck = detail.root === window ? 'window' : detail.root.id;
            panel.scrollTop = 0;
          }, { once: true });

          target.addEventListener('affix:unstuck', (event) => {
            const detail = (event as CustomEvent).detail;
            state.unstuck = detail.root === window ? 'window' : detail.root.id;
            resolve(state);
          }, { once: true });

          panel.scrollTop = 180;
        });
      });

      expect(eventData).toEqual({
        stuck: 'scroll-panel',
        unstuck: 'scroll-panel'
      });
    });
  });
});
