/**
 * Palette Switch Tests
 *
 * Tests the runtime color-palette switch (Fibonacci default / Open Color opt-in)
 * wired through js/components/theme-customizer.js and the generated palette CSS.
 * Covers: default palette, programmatic + UI switching, persistence, remap, contrast.
 *
 * Assertions compare the ACTIVE scale against the fixed, palette-independent
 * --vd-fib-* / --vd-oc-* reference swatches (no hardcoded hex), and use the blue
 * family which is not remapped by data-primary so it isolates the palette switch.
 */

import { test, expect, type Page } from '@playwright/test';

const PALETTE_KEY = 'vanduo-palette';

const bgOf = (page: Page, id: string) =>
  page.evaluate(
    (sel) => getComputedStyle(document.getElementById(sel) as Element).backgroundColor,
    id,
  );

const relativeLuminance = (rgb: string): number => {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number => {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test.describe('Palette Switch @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/palette-switch.html');
    await page.evaluate((key) => localStorage.removeItem(key), PALETTE_KEY);
    await page.reload();
    await page.waitForTimeout(100);
  });

  test('defaults to the Fibonacci palette', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'fibonacci');
    expect(await bgOf(page, 'active-swatch')).toBe(await bgOf(page, 'ref-fib'));
  });

  test('switches to Open Color programmatically', async ({ page }) => {
    await page.locator('#set-open-color').click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'open-color');
    expect(await bgOf(page, 'active-swatch')).toBe(await bgOf(page, 'ref-oc'));
  });

  test('switches back to Fibonacci', async ({ page }) => {
    await page.locator('#set-open-color').click();
    await page.locator('#set-fibonacci').click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'fibonacci');
    expect(await bgOf(page, 'active-swatch')).toBe(await bgOf(page, 'ref-fib'));
  });

  test('persists the palette choice across reloads', async ({ page }) => {
    await page.locator('#set-open-color').click();
    await expect(page.locator('#palette-storage')).toHaveText('open-color');
    await page.reload();
    await page.waitForTimeout(100);
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'open-color');
    expect(await bgOf(page, 'active-swatch')).toBe(await bgOf(page, 'ref-oc'));
  });

  test('exposes a palette toggle in the customizer UI', async ({ page }) => {
    await page.locator('[data-theme-customizer-trigger]').click();
    const ocBtn = page.locator('.tc-palette-btn[data-palette="open-color"]');
    await expect(ocBtn).toBeVisible();
    await ocBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', 'open-color');
    expect(await bgOf(page, 'active-swatch')).toBe(await bgOf(page, 'ref-oc'));
  });

  test('data-primary remap wins over the palette switch @a11y', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-palette', 'open-color');
      document.documentElement.setAttribute('data-primary', 'red');
    });
    // --vd-color-primary should resolve to Open Color red, not Open Color primary.
    expect(await bgOf(page, 'color-primary-swatch')).toBe(await bgOf(page, 'ref-oc-red'));
  });

  test('default Fibonacci primary keeps readable text contrast @a11y', async ({ page }) => {
    const bg = await bgOf(page, 'active-swatch');
    const fg = await page.evaluate(
      () => getComputedStyle(document.getElementById('active-swatch') as Element).color,
    );
    expect(contrast(bg, fg)).toBeGreaterThanOrEqual(3);
  });
});
