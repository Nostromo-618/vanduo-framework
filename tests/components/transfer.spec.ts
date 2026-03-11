/**
 * Transfer Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Transfer Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/transfer.html');
    await page.waitForTimeout(200);
  });

  test('renders dual panels', async ({ page }) => {
    const panels = page.locator('#basic-transfer .vd-transfer-panel');
    await expect(panels).toHaveCount(2);
  });

  test('source panel contains all items', async ({ page }) => {
    const items = page.locator('#basic-transfer .vd-transfer-panel').first().locator('.vd-transfer-item');
    await expect(items).toHaveCount(5);
  });

  test('target panel starts empty', async ({ page }) => {
    const items = page.locator('#basic-transfer .vd-transfer-panel').last().locator('.vd-transfer-item');
    await expect(items).toHaveCount(0);
  });

  test('selecting item and moving right transfers it', async ({ page }) => {
    // Click first item to select
    const sourceItems = page.locator('#basic-transfer .vd-transfer-panel').first().locator('.vd-transfer-item');
    await sourceItems.first().click();
    await page.waitForTimeout(100);

    // Click move-right button
    const moveRight = page.locator('#basic-transfer .vd-transfer-btn').first();
    await moveRight.click();
    await page.waitForTimeout(200);

    const targetItems = page.locator('#basic-transfer .vd-transfer-panel').last().locator('.vd-transfer-item');
    await expect(targetItems).toHaveCount(1);
  });

  test('has search inputs', async ({ page }) => {
    const searches = page.locator('#basic-transfer .vd-transfer-search input');
    await expect(searches).toHaveCount(2);
  });

  test('search filters items', async ({ page }) => {
    const searchInput = page.locator('#basic-transfer .vd-transfer-search input').first();
    await searchInput.fill('Ban');
    await page.waitForTimeout(200);

    const items = page.locator('#basic-transfer .vd-transfer-panel').first().locator('.vd-transfer-item');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('Banana');
  });
});
