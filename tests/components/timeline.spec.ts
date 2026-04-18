/**
 * Timeline Component Tests (CSS-only)
 */

import { test, expect, type Locator } from '@playwright/test';

test.describe('Timeline Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
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

  test('alternating animated items use side-biased transforms on desktop', async ({ page }) => {
    const odd = page.locator('#choreography-alt .vd-timeline-item').first();
    const even = page.locator('#choreography-alt .vd-timeline-item').nth(1);
    const tx = async (loc: Locator) => {
      return await loc.evaluate((el) => {
        const t = getComputedStyle(el).transform;
        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return null;
        const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
        return parts[4];
      });
    };
    expect(await tx(odd)).toBe(-12);
    expect(await tx(even)).toBe(12);
  });

  test('alternating animated items use vertical-only transform on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addStyleTag({
      content: '#choreography-alt .vd-timeline-item, #choreography-alt .vd-timeline-item .vd-timeline-marker { transition: none !important; }',
    });
    const first = page.locator('#choreography-alt .vd-timeline-item').first();
    const second = page.locator('#choreography-alt .vd-timeline-item').nth(1);
    const parse = async (loc: Locator) => {
      return await loc.evaluate((el) => {
        const t = getComputedStyle(el).transform;
        const m = t.match(/matrix\(([^)]+)\)/);
        if (!m) return { tx: null as number | null, ty: null as number | null };
        const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
        return { tx: parts[4], ty: parts[5] };
      });
    };
    const a = await parse(first);
    const b = await parse(second);
    expect(a.tx).toBe(0);
    expect(b.tx).toBe(0);
    expect(a.ty).toBe(12);
    expect(b.ty).toBe(12);
  });

  test('playback timeline starts with no revealed items', async ({ page }) => {
    await expect(page.locator('#playback-timeline .vd-timeline-item.is-revealed')).toHaveCount(0);
  });

  test('playback next and back adjust revealed items', async ({ page }) => {
    const items = page.locator('#playback-timeline .vd-timeline-item');
    await page.locator('#pb-next').click();
    await expect(items.nth(0)).toHaveClass(/is-revealed/);
    await expect(items.nth(1)).not.toHaveClass(/is-revealed/);
    await page.locator('#pb-next').click();
    await expect(items.nth(1)).toHaveClass(/is-revealed/);
    await page.locator('#pb-prev').click();
    await expect(items.nth(1)).not.toHaveClass(/is-revealed/);
  });

  test('playback play reveals all items', async ({ page }) => {
    await page.locator('#pb-play').click();
    await expect.poll(async () => {
      return await page.locator('#playback-timeline .vd-timeline-item.is-revealed').count();
    }, { timeout: 5000 }).toBe(3);
  });

  test('playback pause stops auto-advance', async ({ page }) => {
    await page.locator('#pb-play').click();
    await page.waitForTimeout(1100);
    await page.locator('#pb-pause').click();
    await expect(page.locator('#playback-timeline .vd-timeline-item.is-revealed')).toHaveCount(1);
    await page.waitForTimeout(1200);
    await expect(page.locator('#playback-timeline .vd-timeline-item.is-revealed')).toHaveCount(1);
  });
});
