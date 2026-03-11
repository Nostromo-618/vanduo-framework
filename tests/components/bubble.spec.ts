/**
 * Bubble (Popover) Component Tests
 *
 * Tests for js/components/bubble.js + css/components/bubble.css
 * Covers: rendering, show/hide, ARIA, placement, close, events, alias
 */

import { test, expect } from '@playwright/test';

test.describe('Bubble (Popover) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/bubble.html');
    await page.waitForTimeout(200);
  });

  test.describe('Rendering', () => {
    test('trigger has correct ARIA attributes', async ({ page }) => {
      const trigger = page.locator('#basic-bubble');
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('popover is hidden by default', async ({ page }) => {
      const popovers = page.locator('.vd-bubble-content');
      const count = await popovers.count();
      for (let i = 0; i < count; i++) {
        await expect(popovers.nth(i)).not.toHaveClass(/is-visible/);
      }
    });
  });

  test.describe('Show/Hide', () => {
    test('shows popover on click', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      const popId = await trigger.getAttribute('aria-controls');
      const popover = page.locator('#' + popId);
      await expect(popover).toHaveClass(/is-visible/);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    test('hides popover on second click (toggle)', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('hides popover on outside click', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('hides popover on Escape key', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Content', () => {
    test('displays title and content', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      const popId = await trigger.getAttribute('aria-controls');
      const popover = page.locator('#' + popId);

      await expect(popover.locator('.vd-bubble-header')).toContainText('My Popover');
      await expect(popover.locator('.vd-bubble-body')).toContainText('This is popover content');
    });

    test('renders without title', async ({ page }) => {
      await page.click('#no-title-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#no-title-bubble');
      const popId = await trigger.getAttribute('aria-controls');
      const popover = page.locator('#' + popId);

      await expect(popover.locator('.vd-bubble-header')).toHaveCount(0);
      await expect(popover.locator('.vd-bubble-body')).toContainText('Just content, no title');
    });
  });

  test.describe('Close Button', () => {
    test('close button hides popover', async ({ page }) => {
      await page.click('#basic-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#basic-bubble');
      const popId = await trigger.getAttribute('aria-controls');
      await page.locator('#' + popId + ' .vd-bubble-close').click();
      await page.waitForTimeout(100);

      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test.describe('Placement', () => {
    test('top placement sets correct data attribute', async ({ page }) => {
      await page.click('#top-bubble');
      await page.waitForTimeout(100);

      const trigger = page.locator('#top-bubble');
      const popId = await trigger.getAttribute('aria-controls');
      const popover = page.locator('#' + popId);
      await expect(popover).toHaveAttribute('data-placement', 'top');
    });
  });

  test.describe('Alias', () => {
    test('data-vd-popover alias works', async ({ page }) => {
      const trigger = page.locator('#alias-bubble');
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

      await page.click('#alias-bubble');
      await page.waitForTimeout(100);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Events', () => {
    test('emits bubble:show event', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise<boolean>(resolve => {
          const el = document.getElementById('basic-bubble')!;
          el.addEventListener('bubble:show', () => resolve(true));
          el.click();
        });
      });
      expect(eventFired).toBe(true);
    });
  });
});
