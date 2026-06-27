/**
 * Popover Component Tests
 *
 * Tests for js/components/popover.js + css/components/popover.css
 * Covers: rendering, ARIA, triggers (click/hover/focus), placement, flip, events
 */

import { test, expect } from '@playwright/test';

test.describe('Popover Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/popover.html');
    await page.waitForTimeout(200);
  });

  test.describe('Rendering & ARIA', () => {
    test('trigger has correct ARIA attributes', async ({ page }) => {
      const trigger = page.locator('#basic-popover');
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-controls', 'basic-panel');
    });

    test('panel is hidden by default', async ({ page }) => {
      const panel = page.locator('#basic-panel');
      await expect(panel).toBeHidden();
    });
  });

  test.describe('Click trigger', () => {
    test('opens panel on click', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      const panel = page.locator('#basic-panel');
      await expect(panel).toBeVisible();
      await expect(page.locator('#basic-popover')).toHaveAttribute('aria-expanded', 'true');
    });

    test('closes panel on second click (toggle)', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      const panel = page.locator('#basic-panel');
      await expect(panel).toBeHidden();
      await expect(page.locator('#basic-popover')).toHaveAttribute('aria-expanded', 'false');
    });

    test('closes panel on outside click', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      await page.click('body', { position: { x: 5, y: 5 } });
      await page.waitForTimeout(120);
      await expect(page.locator('#basic-panel')).toBeHidden();
    });

    test('closes panel on Escape', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
      await expect(page.locator('#basic-panel')).toBeHidden();
    });

    test('emits popover:show / popover:hide events', async ({ page }) => {
      const events = await page.evaluate(() => {
        const show = [];
        const hide = [];
        document.addEventListener('popover:show', (e) => show.push(e.detail.placement));
        document.addEventListener('popover:hide', () => hide.push(true));
        document.getElementById('basic-popover').click();
        return new Promise((resolve) => setTimeout(() => {
          document.getElementById('basic-popover').click();
          setTimeout(() => resolve({ show, hide }), 150);
        }, 150));
      });
      expect(events.show).toContain('bottom');
      expect(events.hide.length).toBeGreaterThan(0);
    });
  });

  test.describe('Hover trigger', () => {
    test('opens on mouseenter, closes on mouseleave', async ({ page }) => {
      await page.hover('#hover-popover');
      await page.waitForTimeout(200);
      await expect(page.locator('#hover-panel')).toBeVisible();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      await expect(page.locator('#hover-panel')).toBeHidden();
    });
  });

  test.describe('Focus trigger', () => {
    test('opens on focus', async ({ page }) => {
      await page.focus('#focus-popover');
      await page.waitForTimeout(120);
      await expect(page.locator('#focus-panel')).toBeVisible();
    });

    test('closes on blur', async ({ page }) => {
      await page.focus('#focus-popover');
      await page.waitForTimeout(120);
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
      await page.waitForTimeout(120);
      await expect(page.locator('#focus-panel')).toBeHidden();
    });
  });

  test.describe('Placement', () => {
    test('bottom placement sets data-placement', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(150);
      await expect(page.locator('#basic-panel')).toHaveAttribute('data-placement', 'bottom');
    });

    test('top placement sets data-placement', async ({ page }) => {
      await page.click('#top-popover');
      await page.waitForTimeout(150);
      await expect(page.locator('#top-panel')).toHaveAttribute('data-placement', 'top');
    });
  });

  test.describe('Size variants', () => {
    test('large variant increases max-width', async ({ page }) => {
      await page.click('#large-popover');
      await page.waitForTimeout(150);
      const maxWidth = await page.locator('#large-panel').evaluate(
        (el) => getComputedStyle(el).maxWidth
      );
      // 34rem at the default 16px root font = 544px (LightningCSS preserves the unit).
      expect(maxWidth).toMatch(/^544px|34rem$/);
    });
  });

  test.describe('Lifecycle', () => {
    test('destroyAll cleans up listeners', async ({ page }) => {
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      await page.evaluate(() => window.VanduoPopover.destroyAll());
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
      await page.click('#basic-popover');
      await page.waitForTimeout(120);
      await expect(page.locator('#basic-panel')).toBeHidden();
    });
  });
});