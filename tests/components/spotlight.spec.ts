/**
 * Spotlight (Feature Discovery) Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Spotlight Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/spotlight.html');
    await page.waitForTimeout(200);
  });

  test('starts tour on trigger', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toBeVisible();
    await expect(page.locator('.vd-spotlight-tooltip')).toBeVisible();
  });

  test('first step shows correct content', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-title')).toContainText('Step 1');
    await expect(page.locator('.vd-spotlight-description')).toContainText('first feature');
    await expect(page.locator('.vd-spotlight-counter')).toContainText('1 / 3');
  });

  test('target element gets highlight class', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);

    await expect(page.locator('#target-1')).toHaveClass(/vd-spotlight-target/);
  });

  test('next button advances to next step', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);
    await page.click('.vd-spotlight-btn-primary'); // Next
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-title')).toContainText('Step 2');
    await expect(page.locator('#target-2')).toHaveClass(/vd-spotlight-target/);
    await expect(page.locator('#target-1')).not.toHaveClass(/vd-spotlight-target/);
  });

  test('skip button ends tour', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);

    const skipBtn = page.locator('.vd-spotlight-btn:has-text("Skip")');
    await skipBtn.click();
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toHaveCount(0);
  });

  test('Escape key ends tour', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toHaveCount(0);
  });

  test('last step shows Done button', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(200);
    await page.click('.vd-spotlight-btn-primary'); // Next
    await page.waitForTimeout(200);
    await page.click('.vd-spotlight-btn-primary'); // Next
    await page.waitForTimeout(200);

    const doneBtn = page.locator('.vd-spotlight-btn-primary:has-text("Done")');
    await expect(doneBtn).toBeVisible();
  });
});
