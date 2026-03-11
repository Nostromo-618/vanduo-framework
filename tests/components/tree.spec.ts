/**
 * Tree View Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Tree Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/tree.html');
    await page.waitForTimeout(200);
  });

  test('renders tree with role=tree', async ({ page }) => {
    await expect(page.locator('#basic-tree')).toHaveAttribute('role', 'tree');
  });

  test('renders root-level nodes', async ({ page }) => {
    const rootNodes = page.locator('#basic-tree > .vd-tree-node');
    await expect(rootNodes).toHaveCount(2); // src + README
  });

  test('open node shows children', async ({ page }) => {
    const srcNode = page.locator('#basic-tree > .vd-tree-node').first();
    await expect(srcNode).toHaveClass(/is-open/);

    const children = srcNode.locator('.vd-tree-children .vd-tree-node');
    const count = await children.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking toggle closes node', async ({ page }) => {
    const toggle = page.locator('#basic-tree > .vd-tree-node.is-open .vd-tree-toggle').first();
    await toggle.click();
    await page.waitForTimeout(100);

    const srcNode = page.locator('#basic-tree > .vd-tree-node').first();
    await expect(srcNode).not.toHaveClass(/is-open/);
  });

  test('leaf nodes have no toggle button', async ({ page }) => {
    const readme = page.locator('#basic-tree > .vd-tree-node').last();
    const toggle = readme.locator('.vd-tree-toggle');
    await expect(toggle).toHaveCount(0);
  });

  test('checkbox tree renders checkboxes', async ({ page }) => {
    const checkboxes = page.locator('#checkbox-tree .vd-tree-checkbox');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('checking parent cascades to children', async ({ page }) => {
    const parentCb = page.locator('#checkbox-tree > .vd-tree-node').first().locator('.vd-tree-checkbox').first();
    await parentCb.check();
    await page.waitForTimeout(200);

    const childCheckboxes = page.locator('#checkbox-tree .vd-tree-children .vd-tree-checkbox');
    const count = await childCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(childCheckboxes.nth(i)).toBeChecked();
    }
  });
});
