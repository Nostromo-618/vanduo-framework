/**
 * Unit Tests for Layout Primitives
 *
 * Tests that .vd-box / .vd-stack / .vd-inline / .vd-center and their data-*
 * attributes resolve to the expected computed styles in a real browser, and
 * that a utility on the same element still overrides a primitive default.
 */

import { test, expect } from '@playwright/test';

test.describe('Layout Primitives @unit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/primitives.html');
  });

  test.describe('Stack', () => {
    test('data-gap maps to the Fibonacci token (fib-13 = 13px)', async ({ page }) => {
      const styles = await page.locator('#stack-gap').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, dir: cs.flexDirection, gap: cs.rowGap };
      });
      expect(styles.display).toBe('flex');
      expect(styles.dir).toBe('column');
      expect(styles.gap).toBe('13px');
    });

    test('data-align sets align-items', async ({ page }) => {
      const align = await page.locator('#stack-align').evaluate((el) => getComputedStyle(el).alignItems);
      expect(align).toBe('center');
    });
  });

  test.describe('Box', () => {
    test('data-pad maps to the Fibonacci token (fib-8 = 12px)', async ({ page }) => {
      const pad = await page.locator('#box-pad').evaluate((el) => getComputedStyle(el).padding);
      expect(pad).toBe('12px');
    });

    test('data-round maps to the rounded scale (lg = 8px)', async ({ page }) => {
      const radius = await page.locator('#box-round').evaluate((el) => getComputedStyle(el).borderRadius);
      expect(radius).toBe('8px');
    });

    test('data-bg sets a non-transparent background', async ({ page }) => {
      const bg = await page.locator('#box-bg').evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(bg).toBeTruthy();
    });

    test('data-border applies a 1px solid border', async ({ page }) => {
      const styles = await page.locator('#box-border').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { width: cs.borderTopWidth, style: cs.borderTopStyle };
      });
      expect(styles.width).toBe('1px');
      expect(styles.style).toBe('solid');
    });
  });

  test.describe('Inline', () => {
    test('defaults to a wrapping, center-aligned flex row', async ({ page }) => {
      const styles = await page.locator('#inline-default').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, wrap: cs.flexWrap, align: cs.alignItems };
      });
      expect(styles.display).toBe('flex');
      expect(styles.wrap).toBe('wrap');
      expect(styles.align).toBe('center');
    });

    test('data-justify sets justify-content', async ({ page }) => {
      const justify = await page.locator('#inline-justify').evaluate((el) => getComputedStyle(el).justifyContent);
      expect(justify).toBe('space-between');
    });

    test('data-wrap="nowrap" disables wrapping', async ({ page }) => {
      const wrap = await page.locator('#inline-nowrap').evaluate((el) => getComputedStyle(el).flexWrap);
      expect(wrap).toBe('nowrap');
    });
  });

  test.describe('Center', () => {
    test('data-max constrains width', async ({ page }) => {
      const maxWidth = await page.locator('#center-max').evaluate((el) => getComputedStyle(el).maxWidth);
      expect(maxWidth).toBe('610px');
    });

    test('data-axis="both" centers content via flex', async ({ page }) => {
      const styles = await page.locator('#center-axis').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, align: cs.alignItems, justify: cs.justifyContent };
      });
      expect(styles.display).toBe('flex');
      expect(styles.align).toBe('center');
      expect(styles.justify).toBe('center');
    });
  });

  test.describe('Frame', () => {
    test('defaults to the golden aspect ratio', async ({ page }) => {
      const ratio = await page.locator('#frame-default').evaluate((el) => getComputedStyle(el).aspectRatio);
      expect(ratio).toContain('1.618');
    });

    test('data-ratio="square" sets a 1:1 ratio', async ({ page }) => {
      const ratio = await page.locator('#frame-square').evaluate((el) => getComputedStyle(el).aspectRatio);
      expect(ratio.replace(/\s/g, '')).toBe('1/1');
    });
  });

  test.describe('Cover', () => {
    test('is a vertically-centering flex column with a min-height', async ({ page }) => {
      const styles = await page.locator('#cover-half').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { display: cs.display, dir: cs.flexDirection, justify: cs.justifyContent, minHeight: cs.minHeight };
      });
      expect(styles.display).toBe('flex');
      expect(styles.dir).toBe('column');
      expect(styles.justify).toBe('center');
      expect(styles.minHeight).not.toBe('auto');
      expect(styles.minHeight).not.toBe('0px');
    });
  });

  test.describe('Switcher', () => {
    test('is a wrapping flex row with a token gap and growing children', async ({ page }) => {
      const styles = await page.locator('#switcher').evaluate((el) => {
        const cs = getComputedStyle(el);
        const child = getComputedStyle(el.firstElementChild as Element);
        return { display: cs.display, wrap: cs.flexWrap, gap: cs.columnGap, grow: child.flexGrow };
      });
      expect(styles.display).toBe('flex');
      expect(styles.wrap).toBe('wrap');
      expect(styles.gap).toBe('12px');
      expect(styles.grow).toBe('1');
    });
  });

  test.describe('Override semantics', () => {
    test('a gap utility overrides the primitive data-gap on the same element', async ({ page }) => {
      const result = await page.evaluate(() => {
        const ref = getComputedStyle(document.getElementById('gap2-ref')!).rowGap;
        const overridden = getComputedStyle(document.getElementById('override')!).rowGap;
        return { ref, overridden };
      });
      // The .vd-gap-2 utility wins over data-gap="fib-55" (55px) → matches the bare utility.
      expect(result.overridden).toBe(result.ref);
      expect(result.overridden).not.toBe('55px');
    });
  });
});
