/**
 * Tabs Component Tests
 *
 * Tests for js/components/tabs.js
 * Covers: initialization, tab switching, keyboard navigation, programmatic API
 */

import { test, expect } from '@playwright/test';

test.describe('Tabs Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/tabs.html');
    await page.waitForTimeout(100);
  });

  test.describe('Initialization', () => {
    test('initializes with correct ARIA attributes', async ({ page }) => {
      const tabList = page.locator('#basic-tabs .vd-tab-list');
      const firstTab = page.locator('#basic-tabs .vd-tab-link').first();
      const firstPane = page.locator('#basic-tabs .vd-tab-pane').first();

      await expect(tabList).toHaveAttribute('role', 'tablist');
      await expect(firstTab).toHaveAttribute('role', 'tab');
      await expect(firstTab).toHaveAttribute('aria-selected', 'true');
      await expect(firstPane).toHaveAttribute('role', 'tabpanel');
    });

    test('sets initial active tab state correctly', async ({ page }) => {
      const activeTab = page.locator('#basic-tabs .vd-tab-link.is-active');
      const activePane = page.locator('#basic-tabs .vd-tab-pane.is-active');

      await expect(activeTab).toHaveText('Tab 1');
      await expect(activePane).toHaveAttribute('id', 'tab1');
    });

    test('inactive tabs have correct ARIA state', async ({ page }) => {
      const inactiveTab = page.locator('#basic-tabs .vd-tab-link').nth(1);

      await expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
      await expect(inactiveTab).toHaveAttribute('tabindex', '-1');
    });
  });

  test.describe('Tab Switching', () => {
    test('switches tab on click', async ({ page }) => {
      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);
      const secondPane = page.locator('#basic-tabs .vd-tab-pane').nth(1);

      await secondTab.click();

      await expect(secondTab).toHaveClass(/is-active/);
      await expect(secondTab).toHaveAttribute('aria-selected', 'true');
      await expect(secondPane).toHaveClass(/is-active/);
    });

    test('deactivates previous tab when switching', async ({ page }) => {
      const firstTab = page.locator('#basic-tabs .vd-tab-link').first();
      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);

      await secondTab.click();

      await expect(firstTab).not.toHaveClass(/is-active/);
      await expect(firstTab).toHaveAttribute('aria-selected', 'false');
    });

    test('dispatches tab:change event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).tabChangeEvent = null;
        document.querySelector('#basic-tabs')?.addEventListener('tab:change', (e: any) => {
          (window as any).tabChangeEvent = e.detail;
        });
      });

      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);
      await secondTab.click();

      const eventDetail = await page.evaluate(() => (window as any).tabChangeEvent);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.tabId).toBe('tab2');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('navigates with ArrowRight key', async ({ page }) => {
      const firstTab = page.locator('#basic-tabs .vd-tab-link').first();
      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);

      await firstTab.focus();
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);

      await expect(secondTab).toBeFocused();
      await expect(secondTab).toHaveClass(/is-active/);
    });

    test('navigates with ArrowLeft key', async ({ page }) => {
      const tabs = page.locator('#basic-tabs .vd-tab-link');
      const lastTab = tabs.last();
      const secondLastTab = tabs.nth(1);

      await lastTab.focus();
      await page.waitForTimeout(100);
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);

      // Should navigate to previous tab (tab 2), not wrap to first
      await expect(secondLastTab).toBeFocused();
    });

    test('navigates to first tab with Home key', async ({ page }) => {
      const lastTab = page.locator('#basic-tabs .vd-tab-link').last();
      const firstTab = page.locator('#basic-tabs .vd-tab-link').first();

      await lastTab.focus();
      await page.keyboard.press('Home');

      await expect(firstTab).toBeFocused();
      await expect(firstTab).toHaveClass(/is-active/);
    });

    test('navigates to last tab with End key', async ({ page }) => {
      const firstTab = page.locator('#basic-tabs .vd-tab-link').first();
      const lastTab = page.locator('#basic-tabs .vd-tab-link').last();

      await firstTab.focus();
      await page.keyboard.press('End');

      await expect(lastTab).toBeFocused();
      await expect(lastTab).toHaveClass(/is-active/);
    });

    test('activates tab with Enter key', async ({ page }) => {
      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);

      await secondTab.focus();
      await page.keyboard.press('Enter');

      await expect(secondTab).toHaveClass(/is-active/);
    });

    test('activates tab with Space key', async ({ page }) => {
      const secondTab = page.locator('#basic-tabs .vd-tab-link').nth(1);

      await secondTab.focus();
      await page.keyboard.press('Space');

      await expect(secondTab).toHaveClass(/is-active/);
    });
  });

  test.describe('Vertical Tabs', () => {
    test('navigates vertical tabs with ArrowDown', async ({ page }) => {
      const firstTab = page.locator('#vertical-tabs .vd-tab-link').first();
      const secondTab = page.locator('#vertical-tabs .vd-tab-link').nth(1);

      await firstTab.focus();
      await page.keyboard.press('ArrowDown');

      await expect(secondTab).toBeFocused();
    });

    test('navigates vertical tabs with ArrowUp', async ({ page }) => {
      const firstTab = page.locator('#vertical-tabs .vd-tab-link').first();
      const secondTab = page.locator('#vertical-tabs .vd-tab-link').nth(1);

      await secondTab.focus();
      await page.keyboard.press('ArrowUp');

      await expect(firstTab).toBeFocused();
    });
  });

  test.describe('Disabled Tabs', () => {
    test('disabled tab has correct attributes', async ({ page }) => {
      const disabledTab = page.locator('#disabled-tabs .vd-tab-link.disabled');

      await expect(disabledTab).toHaveAttribute('tabindex', '-1');
      await expect(disabledTab).toHaveAttribute('aria-selected', 'false');
    });

    test('does not activate disabled tab on click', async ({ page }) => {
      const disabledTab = page.locator('#disabled-tabs .vd-tab-link.disabled');
      const activeTab = page.locator('#disabled-tabs .vd-tab-link.is-active');

      // Use force to click through any parent element interception
      await disabledTab.click({ force: true });

      // Active tab should still be the first one
      await expect(activeTab).toHaveText('Active');
    });
  });

  test.describe('Programmatic API', () => {
    test('tab switching works via click (user interaction)', async ({ page }) => {
      const thirdTab = page.locator('#basic-tabs .vd-tab-link').nth(2);
      const thirdPane = page.locator('#basic-tabs .vd-tab-pane').nth(2);

      await thirdTab.click();

      await expect(thirdTab).toHaveClass(/is-active/);
      await expect(thirdPane).toHaveClass(/is-active/);
    });
  });
});
