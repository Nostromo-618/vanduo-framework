/**
 * Visual Regression Tests for Buttons
 * 
 * Uses Playwright's built-in screenshot comparison.
 * Tag: @visual
 */

import { test, expect } from '@playwright/test';

test.describe('Button Visual Tests @visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/buttons.html');
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `
    });
  });

  test('primary buttons default state', async ({ page }) => {
    const showcase = page.locator('[data-testid="primary-buttons"]');
    
    await expect(showcase).toHaveScreenshot('primary-buttons-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('secondary buttons default state', async ({ page }) => {
    const showcase = page.locator('[data-testid="secondary-buttons"]');
    
    await expect(showcase).toHaveScreenshot('secondary-buttons-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('outline buttons default state', async ({ page }) => {
    const showcase = page.locator('[data-testid="outline-buttons"]');
    
    await expect(showcase).toHaveScreenshot('outline-buttons-default.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('semantic buttons (success, warning, error, info)', async ({ page }) => {
    const showcase = page.locator('[data-testid="semantic-buttons"]');
    
    await expect(showcase).toHaveScreenshot('semantic-buttons.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('button hover state', async ({ page }) => {
    const button = page.locator('.btn-primary').first();
    await button.hover();
    
    await expect(button).toHaveScreenshot('button-primary-hover.png', {
      maxDiffPixelRatio: 0.02, // Slightly higher tolerance for hover states
    });
  });

  test('button focus state', async ({ page }) => {
    const button = page.locator('#focus-test-1');
    await button.focus();
    
    await expect(button).toHaveScreenshot('button-primary-focus.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('button disabled state', async ({ page }) => {
    const disabledButton = page.locator('.btn-primary[disabled]');
    
    await expect(disabledButton).toHaveScreenshot('button-primary-disabled.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('button group layout', async ({ page }) => {
    const buttonGroup = page.locator('[data-testid="button-groups"]');
    
    await expect(buttonGroup).toHaveScreenshot('button-group.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('full page button showcase', async ({ page }) => {
    await expect(page).toHaveScreenshot('buttons-full-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
