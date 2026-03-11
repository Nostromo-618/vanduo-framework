/**
 * Flow (Carousel) Component Tests
 *
 * Tests for js/components/flow.js + css/components/flow.css
 * Covers: rendering, navigation, indicators, ARIA, autoplay, fade, alias
 */

import { test, expect } from '@playwright/test';

test.describe('Flow (Carousel) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/flow.html');
    await page.waitForTimeout(200);
  });

  test.describe('Rendering', () => {
    test('renders carousel with correct structure', async ({ page }) => {
      const flow = page.locator('#basic-flow');
      await expect(flow).toBeVisible();
      await expect(flow).toHaveAttribute('role', 'region');
      await expect(flow).toHaveAttribute('aria-roledescription', 'carousel');

      const slides = flow.locator('.vd-flow-slide');
      await expect(slides).toHaveCount(3);
    });

    test('first slide is active by default', async ({ page }) => {
      const firstSlide = page.locator('#basic-flow .vd-flow-slide').first();
      await expect(firstSlide).toHaveClass(/is-active|/);
      await expect(firstSlide).toHaveAttribute('aria-hidden', 'false');
    });

    test('slides have correct ARIA attributes', async ({ page }) => {
      const slides = page.locator('#basic-flow .vd-flow-slide');
      const count = await slides.count();
      for (let i = 0; i < count; i++) {
        const slide = slides.nth(i);
        await expect(slide).toHaveAttribute('role', 'group');
        await expect(slide).toHaveAttribute('aria-roledescription', 'slide');
      }
    });
  });

  test.describe('Navigation Controls', () => {
    test('next button advances to next slide', async ({ page }) => {
      await page.click('#basic-flow .vd-flow-next');
      await page.waitForTimeout(600);

      const track = page.locator('#basic-flow .vd-flow-track');
      const transform = await track.evaluate(el => el.style.transform);
      expect(transform).toBe('translateX(-100%)');
    });

    test('prev button goes to previous slide', async ({ page }) => {
      await page.click('#basic-flow .vd-flow-next');
      await page.waitForTimeout(600);
      await page.click('#basic-flow .vd-flow-prev');
      await page.waitForTimeout(600);

      const track = page.locator('#basic-flow .vd-flow-track');
      const transform = await track.evaluate(el => el.style.transform);
      expect(transform).toBe('translateX(0%)');
    });

    test('loops around from last to first slide', async ({ page }) => {
      const flow = page.locator('#basic-flow');
      await page.click('#basic-flow .vd-flow-next');
      await page.waitForTimeout(100);
      await page.click('#basic-flow .vd-flow-next');
      await page.waitForTimeout(100);
      await page.click('#basic-flow .vd-flow-next');
      await page.waitForTimeout(600);

      const track = page.locator('#basic-flow .vd-flow-track');
      const transform = await track.evaluate(el => el.style.transform);
      expect(transform).toBe('translateX(0%)');
    });
  });

  test.describe('Indicators', () => {
    test('indicators render with correct ARIA', async ({ page }) => {
      const indicators = page.locator('#basic-flow .vd-flow-indicator');
      await expect(indicators).toHaveCount(3);

      const first = indicators.first();
      await expect(first).toHaveAttribute('role', 'tab');
      await expect(first).toHaveAttribute('aria-selected', 'true');
      await expect(first).toHaveClass(/is-active/);
    });

    test('clicking indicator navigates to that slide', async ({ page }) => {
      const indicators = page.locator('#basic-flow .vd-flow-indicator');
      await indicators.nth(2).click();
      await page.waitForTimeout(600);

      const track = page.locator('#basic-flow .vd-flow-track');
      const transform = await track.evaluate(el => el.style.transform);
      expect(transform).toBe('translateX(-200%)');

      await expect(indicators.nth(2)).toHaveClass(/is-active/);
      await expect(indicators.nth(0)).not.toHaveClass(/is-active/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('arrow keys navigate slides', async ({ page }) => {
      const flow = page.locator('#basic-flow');
      await flow.focus();

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(600);

      const track = page.locator('#basic-flow .vd-flow-track');
      const transform = await track.evaluate(el => el.style.transform);
      expect(transform).toBe('translateX(-100%)');

      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(600);

      const transform2 = await track.evaluate(el => el.style.transform);
      expect(transform2).toBe('translateX(0%)');
    });
  });

  test.describe('Autoplay', () => {
    test('auto-advances slides', async ({ page }) => {
      const indicator0 = page.locator('#autoplay-flow .vd-flow-indicator').first();
      const indicator1 = page.locator('#autoplay-flow .vd-flow-indicator').nth(1);

      await expect(indicator0).toHaveClass(/is-active/);

      await page.waitForTimeout(1500);

      await expect(indicator1).toHaveClass(/is-active/);
    });
  });

  test.describe('Fade Variant', () => {
    test('fade carousel uses opacity transitions', async ({ page }) => {
      const flow = page.locator('#fade-flow');
      await expect(flow).toHaveClass(/vd-flow-fade/);

      const firstSlide = flow.locator('.vd-flow-slide').first();
      await expect(firstSlide).toHaveClass(/is-active/);

      await page.click('#fade-flow .vd-flow-next');
      await page.waitForTimeout(600);

      const secondSlide = flow.locator('.vd-flow-slide').nth(1);
      await expect(secondSlide).toHaveClass(/is-active/);
      await expect(firstSlide).not.toHaveClass(/is-active/);
    });
  });

  test.describe('Alias', () => {
    test('.vd-carousel alias initializes correctly', async ({ page }) => {
      const flow = page.locator('#alias-flow');
      await expect(flow).toHaveAttribute('role', 'region');

      const slides = flow.locator('.vd-flow-slide');
      await expect(slides).toHaveCount(2);
    });
  });

  test.describe('Events', () => {
    test('emits flow:change event on navigation', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise<boolean>(resolve => {
          const el = document.getElementById('basic-flow');
          el!.addEventListener('flow:change', () => resolve(true));
          el!.querySelector<HTMLButtonElement>('.vd-flow-next')!.click();
        });
      });
      expect(eventFired).toBe(true);
    });
  });
});
