/**
 * Rating Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Rating Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/rating.html');
    await page.waitForTimeout(200);
  });

  test('renders correct number of stars', async ({ page }) => {
    const stars = page.locator('#rating-basic .vd-rating-star');
    await expect(stars).toHaveCount(5);
  });

  test('initial value highlights correct stars', async ({ page }) => {
    const active = page.locator('#rating-basic .vd-rating-star.is-active');
    await expect(active).toHaveCount(3);
  });

  test('clicking a star changes value', async ({ page }) => {
    const stars = page.locator('#rating-empty .vd-rating-star');
    await stars.nth(3).click(); // 4th star
    await page.waitForTimeout(100);

    const active = page.locator('#rating-empty .vd-rating-star.is-active');
    await expect(active).toHaveCount(4);
  });

  test('displays value number', async ({ page }) => {
    const value = page.locator('#rating-basic .vd-rating-value');
    await expect(value).toContainText('3');
  });

  test('readonly rating is not interactive', async ({ page }) => {
    const ro = page.locator('#rating-readonly');
    await expect(ro).toHaveClass(/vd-rating-readonly/);

    const activeCount = await ro.locator('.vd-rating-star.is-active').count();
    expect(activeCount).toBe(4);
  });

  test('custom max renders correct star count', async ({ page }) => {
    const stars = page.locator('#rating-10 .vd-rating-star');
    await expect(stars).toHaveCount(10);
  });

  test('has radiogroup role', async ({ page }) => {
    await expect(page.locator('#rating-basic')).toHaveAttribute('role', 'radiogroup');
  });

  test('fires rating:change event', async ({ page }) => {
    const fired = await page.evaluate(() => {
      return new Promise<boolean>(resolve => {
        document.getElementById('rating-empty')!.addEventListener('rating:change', () => resolve(true));
        const star = document.querySelector('#rating-empty .vd-rating-star:nth-child(2)') as HTMLElement;
        star.click();
      });
    });
    expect(fired).toBe(true);
  });
});
