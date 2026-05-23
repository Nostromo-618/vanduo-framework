import { expect, test } from '@playwright/test';

test.describe('Runtime Token Contract @component', () => {
  test('Water Morph reads the vd-prefixed duration token', async ({ page }) => {
    await page.goto('/tests/fixtures/token-runtime.html');

    const started = await page.evaluate(() => {
      const target = document.getElementById('morph-target');
      window.VanduoMorph.morph(target);
      return target.classList.contains('is-morphing');
    });

    expect(started).toBe(true);
    await page.waitForTimeout(100);
    await expect(page.locator('#morph-target')).not.toHaveClass(/is-morphing/);
  });
});
