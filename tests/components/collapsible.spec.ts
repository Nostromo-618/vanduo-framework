/**
 * Collapsible Component Tests
 *
 * Tests for js/components/collapsible.js
 * Covers: initialization, toggle, open/close, accordion behavior, events
 */

import { test, expect } from '@playwright/test';

test.describe('Collapsible Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/collapsible.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes collapsible items', async ({ page }) => {
      const items = page.locator('#basic-collapsible .vd-collapsible-item');
      await expect(items).toHaveCount(2);
    });

    test('sets correct aria-expanded on items', async ({ page }) => {
      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();
      await expect(firstItem).toHaveAttribute('aria-expanded', 'false');
    });

    test('accordion initializes with open item correctly', async ({ page }) => {
      const openItem = page.locator('#accordion-test .accordion-item.is-open');
      await expect(openItem).toHaveCount(1);
      await expect(openItem).toContainText('Accordion 3');
    });
  });

  test.describe('Toggle', () => {
    test('opens item on header click', async ({ page }) => {
      const firstHeader = page.locator('#basic-collapsible .vd-collapsible-header').first();
      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();

      await firstHeader.click();

      await expect(firstItem).toHaveClass(/is-open/);
      await expect(firstItem).toHaveAttribute('aria-expanded', 'true');
    });

    test('closes item on second header click', async ({ page }) => {
      const firstHeader = page.locator('#basic-collapsible .vd-collapsible-header').first();
      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();

      await firstHeader.click();
      await expect(firstItem).toHaveClass(/is-open/);

      await firstHeader.click();
      await expect(firstItem).not.toHaveClass(/is-open/);
    });

    test('dispatches collapsible:open event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).openEvent = null;
        document.querySelector('#basic-collapsible')?.addEventListener('collapsible:open', (e: any) => {
          (window as any).openEvent = true;
        });
      });

      await page.locator('#basic-collapsible .vd-collapsible-header').first().click();

      const eventFired = await page.evaluate(() => (window as any).openEvent);
      expect(eventFired).toBe(true);
    });

    test('dispatches collapsible:close event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).closeEvent = null;
        document.querySelector('#basic-collapsible')?.addEventListener('collapsible:close', (e: any) => {
          (window as any).closeEvent = true;
        });
      });

      const header = page.locator('#basic-collapsible .vd-collapsible-header').first();
      await header.click();
      await header.click();

      const eventFired = await page.evaluate(() => (window as any).closeEvent);
      expect(eventFired).toBe(true);
    });
  });

  test.describe('Accordion Behavior', () => {
    test('closes other items when opening new one', async ({ page }) => {
      // First open item 1
      await page.locator('#accordion-test .accordion-header').first().click();
      await expect(page.locator('#accordion-test .accordion-item').first()).toHaveClass(/is-open/);

      // Then click item 2
      await page.locator('#accordion-test .accordion-header').nth(1).click();

      // Item 1 should be closed
      await expect(page.locator('#accordion-test .accordion-item').first()).not.toHaveClass(/is-open/);
      // Item 2 should be open
      await expect(page.locator('#accordion-test .accordion-item').nth(1)).toHaveClass(/is-open/);
    });
  });

  test.describe('Focus ring', () => {
    test.beforeEach(async ({ browserName }) => {
      test.skip(browserName === 'webkit', 'Playwright WebKit does not tab-focus buttons in this fixture');
    });

    async function focusViaKeyboard(page, target) {
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });

      for (let index = 0; index < 20; index += 1) {
        await page.keyboard.press('Tab');

        if (await target.evaluate(el => el === document.activeElement)) {
          return;
        }
      }

      throw new Error('Failed to focus target via keyboard navigation');
    }

    test('header does not carry its own outline when focused via keyboard', async ({ page }) => {
      const firstHeader = page.locator('#basic-collapsible .vd-collapsible-header').first();

      await focusViaKeyboard(page, firstHeader);

      const styles = await firstHeader.evaluate(el => {
        const computed = getComputedStyle(el);

        return {
          outlineStyle: computed.outlineStyle,
          boxShadow: computed.boxShadow
        };
      });

      // Firefox can report a non-zero outline shorthand even when the outline style is none.
      expect(styles.outlineStyle).toBe('none');
      expect(styles.boxShadow).toBe('none');
    });

    test('standard item receives a rounded box-shadow focus ring when header is focused', async ({ page }) => {
      const firstHeader = page.locator('#basic-collapsible .vd-collapsible-header').first();
      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();

      await focusViaKeyboard(page, firstHeader);

      const styles = await firstItem.evaluate(el => {
        const computed = getComputedStyle(el);

        return {
          boxShadow: computed.boxShadow,
          borderRadius: computed.borderTopLeftRadius
        };
      });

      expect(styles.boxShadow).not.toBe('none');
      expect(parseFloat(styles.borderRadius)).toBeGreaterThan(0);
    });

    test('flush variant applies the focus ring to the header with the global radius', async ({ page }) => {
      const flushHeader = page.locator('#flush-accordion-test .accordion-header').first();

      await focusViaKeyboard(page, flushHeader);

      const styles = await flushHeader.evaluate(el => {
        const computed = getComputedStyle(el);

        return {
          boxShadow: computed.boxShadow,
          borderRadius: computed.borderTopLeftRadius
        };
      });

      expect(styles.boxShadow).not.toBe('none');
      expect(parseFloat(styles.borderRadius)).toBeGreaterThan(0);
    });

    test('flush item itself stays unboxed while the header owns the focus ring', async ({ page }) => {
      const flushHeader = page.locator('#flush-accordion-test .accordion-header').first();
      const flushItem = page.locator('#flush-accordion-test .accordion-item').first();

      await focusViaKeyboard(page, flushHeader);

      const itemBoxShadow = await flushItem.evaluate(el =>
        getComputedStyle(el).boxShadow
      );

      expect(itemBoxShadow).toBe('none');
    });
  });

  test.describe('Programmatic API', () => {
    test('opens item via open()', async ({ page }) => {
      await page.click('#open-first');

      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();
      await expect(firstItem).toHaveClass(/is-open/);
    });

    test('closes item via close()', async ({ page }) => {
      // First open it
      await page.click('#open-first');
      await expect(page.locator('#basic-collapsible .vd-collapsible-item').first()).toHaveClass(/is-open/);

      // Then close
      await page.click('#close-first');
      await expect(page.locator('#basic-collapsible .vd-collapsible-item').first()).not.toHaveClass(/is-open/);
    });

    test('toggles item via toggle()', async ({ page }) => {
      const firstItem = page.locator('#basic-collapsible .vd-collapsible-item').first();

      // Toggle open
      await page.click('#toggle-first');
      await expect(firstItem).toHaveClass(/is-open/);

      // Toggle closed
      await page.click('#toggle-first');
      await expect(firstItem).not.toHaveClass(/is-open/);
    });
  });
});
