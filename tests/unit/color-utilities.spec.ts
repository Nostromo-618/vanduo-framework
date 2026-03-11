/**
 * Unit Tests for Color Utility Classes
 *
 * Tests that .vd-bg-{color}-{shade} and .vd-text-{color}-{shade}
 * resolve to the correct computed styles in a real browser context.
 */

import { test, expect } from '@playwright/test';

/** Helper: parse rgb(r, g, b) string into [r, g, b] */
function parseRgb(rgb: string): number[] {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [];
}

/** Helper: convert hex to [r, g, b] */
function hexToRgb(hex: string): number[] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

test.describe('Color Utility Classes @unit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/color-utilities.html');
  });

  test.describe('Background Color Utilities', () => {
    const bgCases: [string, string][] = [
      ['#bg-red-5', '#ff6b6b'],
      ['#bg-blue-3', '#74c0fc'],
      ['#bg-teal-7', '#0ca678'],
      ['#bg-orange-0', '#fff4e6'],
      ['#bg-gray-9', '#212529'],
      ['#bg-indigo-4', '#748ffc'],
      ['#bg-violet-6', '#7950f2'],
      ['#bg-pink-2', '#fcc2d7'],
    ];

    for (const [selector, expectedHex] of bgCases) {
      test(`${selector} applies correct background color`, async ({ page }) => {
        const bg = await page.locator(selector).evaluate(
          (el) => getComputedStyle(el).backgroundColor
        );
        const actual = parseRgb(bg);
        const expected = hexToRgb(expectedHex);
        expect(actual).toEqual(expected);
      });
    }
  });

  test.describe('Text Color Utilities', () => {
    const textCases: [string, string][] = [
      ['#text-red-7', '#f03e3e'],
      ['#text-green-5', '#51cf66'],
      ['#text-cyan-8', '#0c8599'],
      ['#text-grape-4', '#da77f2'],
      ['#text-yellow-6', '#fab005'],
      ['#text-lime-3', '#c0eb75'],
    ];

    for (const [selector, expectedHex] of textCases) {
      test(`${selector} applies correct text color`, async ({ page }) => {
        const color = await page.locator(selector).evaluate(
          (el) => getComputedStyle(el).color
        );
        const actual = parseRgb(color);
        const expected = hexToRgb(expectedHex);
        expect(actual).toEqual(expected);
      });
    }
  });

  test.describe('Combining Utilities', () => {
    test('element can have both bg and text utility classes', async ({ page }) => {
      const styles = await page.locator('#combined').evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, color: cs.color };
      });

      // vd-bg-teal-2 = #96f2d7
      expect(parseRgb(styles.bg)).toEqual(hexToRgb('#96f2d7'));
      // vd-text-indigo-9 = #364fc7
      expect(parseRgb(styles.color)).toEqual(hexToRgb('#364fc7'));
    });
  });

  test.describe('Backward Compatibility', () => {
    test('existing .vd-bg-primary still works', async ({ page }) => {
      const bg = await page.locator('#semantic-bg').evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );
      // Should resolve to a non-transparent color
      expect(bg).not.toBe('rgba(0, 0, 0, 0)');
      expect(bg).toBeTruthy();
    });

    test('existing .vd-text-error still works', async ({ page }) => {
      const color = await page.locator('#semantic-text').evaluate(
        (el) => getComputedStyle(el).color
      );
      // Should resolve to a non-default color
      expect(color).toBeTruthy();
      const rgb = parseRgb(color);
      // Error color is red-based, so R channel should be dominant
      expect(rgb[0]).toBeGreaterThan(150);
    });
  });
});
