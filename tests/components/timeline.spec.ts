/**
 * Timeline Component Tests (CSS-only)
 */

import { test, expect } from '@playwright/test';

test.describe('Timeline Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/timeline.html');
    await page.waitForTimeout(200);
  });

  test('renders timeline with items', async ({ page }) => {
    const items = page.locator('#basic-timeline .vd-timeline-item');
    await expect(items).toHaveCount(3);
  });

  test('markers are visible', async ({ page }) => {
    const markers = page.locator('#basic-timeline .vd-timeline-marker');
    await expect(markers.first()).toBeVisible();
  });

  test('content displays title and date', async ({ page }) => {
    const first = page.locator('#basic-timeline .vd-timeline-item').first();
    await expect(first.locator('.vd-timeline-title')).toContainText('Project Started');
    await expect(first.locator('.vd-timeline-date')).toContainText('Jan 2025');
  });

  test('color variants apply correctly', async ({ page }) => {
    const success = page.locator('#basic-timeline .vd-timeline-success');
    await expect(success).toHaveCount(1);

    const danger = page.locator('#basic-timeline .vd-timeline-danger');
    await expect(danger).toHaveCount(1);
  });

  test('alternating timeline has correct class', async ({ page }) => {
    const alt = page.locator('#alt-timeline');
    await expect(alt).toHaveClass(/vd-timeline-alternating/);
  });

  test('timeline has vertical line pseudo-element', async ({ page }) => {
    const hasBefore = await page.locator('#basic-timeline').evaluate(el => {
      const pseudo = getComputedStyle(el, '::before');
      return pseudo.content !== 'none' && pseudo.content !== '';
    });
    expect(hasBefore).toBe(true);
  });
});
