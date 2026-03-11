/**
 * Ripple (Waves Effect) Component Tests
 *
 * Tests for js/components/ripple.js + css/components/ripple.css
 * Covers: wave creation, positioning, cleanup, variants, data attribute
 */

import { test, expect } from '@playwright/test';

test.describe('Ripple Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/ripple.html');
    await page.waitForTimeout(200);
  });

  test.describe('Wave Creation', () => {
    test('creates ripple wave on click', async ({ page }) => {
      await page.click('#ripple-btn');
      const wave = page.locator('#ripple-btn .vd-ripple-wave');
      await expect(wave.first()).toBeAttached();
    });

    test('wave element is removed after animation', async ({ page }) => {
      await page.click('#ripple-btn');
      await page.waitForTimeout(1000);
      const waves = page.locator('#ripple-btn .vd-ripple-wave');
      await expect(waves).toHaveCount(0);
    });
  });

  test.describe('Data Attribute', () => {
    test('data-vd-ripple initializes ripple', async ({ page }) => {
      await page.click('#ripple-data');
      const wave = page.locator('#ripple-data .vd-ripple-wave');
      await expect(wave.first()).toBeAttached();
    });
  });

  test.describe('Variants', () => {
    test('dark variant has correct class', async ({ page }) => {
      const btn = page.locator('#ripple-dark');
      await expect(btn).toHaveClass(/vd-ripple-dark/);
    });
  });

  test.describe('Non-button Elements', () => {
    test('ripple works on div elements', async ({ page }) => {
      await page.click('#ripple-div');
      const wave = page.locator('#ripple-div .vd-ripple-wave');
      await expect(wave.first()).toBeAttached();
    });
  });
});
