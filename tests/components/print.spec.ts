import { test, expect } from '@playwright/test';

/**
 * Print stylesheet regression coverage.
 *
 * v1.4.6 finished the 1.4.1 `vd-` rename for print.css: the chrome hide-list and
 * the print display utilities now target the canonical `vd-` classes
 * (`.vd-navbar`, `.vd-modal`, `.vd-d-print-*`, `.vd-container`). Before the fix
 * the rules pointed at no-longer-existing unprefixed selectors, so printing was
 * a no-op. These specs assert the @media print rules actually match.
 */
test.describe('Print Utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/print.html');
  });

  const displayOf = (id: string) =>
    `(() => getComputedStyle(document.getElementById('${id}')).display)()`;

  test('hides UI chrome under print media', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    expect(await page.evaluate(displayOf('t-navbar'))).toBe('none');
    expect(await page.evaluate(displayOf('t-modal'))).toBe('none');
    expect(await page.evaluate(displayOf('t-print-none'))).toBe('none');
  });

  test('reveals print-only display utilities under print media', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    // Inline display:none is overridden by the stylesheet's `display: ... !important`.
    expect(await page.evaluate(displayOf('t-print-block'))).toBe('block');
    expect(await page.evaluate(displayOf('t-print-inline'))).toBe('inline');
  });

  test('print rules are scoped to print media only', async ({ page }) => {
    await page.emulateMedia({ media: 'screen' });
    // Chrome stays visible on screen...
    expect(await page.evaluate(displayOf('t-navbar'))).not.toBe('none');
    expect(await page.evaluate(displayOf('t-print-none'))).not.toBe('none');
    // ...and the print-only elements stay hidden (their inline display:none wins).
    expect(await page.evaluate(displayOf('t-print-block'))).toBe('none');
    expect(await page.evaluate(displayOf('t-print-inline'))).toBe('none');
  });
});
