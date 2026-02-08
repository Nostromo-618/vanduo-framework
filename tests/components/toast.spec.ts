/**
 * Toast Component Tests
 *
 * Tests for js/components/toast.js
 * Covers: show, dismiss, types, events, programmatic API
 */

import { test, expect } from '@playwright/test';

test.describe('Toast Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/toast.html');
    await page.waitForTimeout(100);
  });

  test.describe('Basic Toast', () => {
    test('shows a toast with message', async ({ page }) => {
      await page.click('#show-toast');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('This is a test toast message');
    });

    test('toast has correct ARIA attributes', async ({ page }) => {
      await page.click('#show-toast');

      const container = page.locator('.vd-toast-container').first();
      await expect(container).toHaveAttribute('role', 'status');
      await expect(container).toHaveAttribute('aria-live', 'polite');
    });

    test('toast has close button', async ({ page }) => {
      await page.click('#show-toast');

      const closeBtn = page.locator('.vd-toast-close').first();
      await expect(closeBtn).toBeVisible();
      await expect(closeBtn).toHaveAttribute('aria-label', 'Close');
    });

    test('closes toast when clicking close button', async ({ page }) => {
      await page.click('#show-toast');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toBeVisible();

      await page.click('.vd-toast-close');
      await page.waitForTimeout(500);

      await expect(toast).not.toBeVisible();
    });
  });

  test.describe('Toast Types', () => {
    test('success toast has correct styling', async ({ page }) => {
      await page.click('#show-success');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-success/);
      await expect(toast).toContainText('Operation completed successfully!');
    });

    test('error toast has correct styling', async ({ page }) => {
      await page.click('#show-error');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-error/);
      await expect(toast).toContainText('Something went wrong!');
    });

    test('warning toast has correct styling', async ({ page }) => {
      await page.click('#show-warning');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-warning/);
      await expect(toast).toContainText('Please check your input');
    });

    test('info toast has correct styling', async ({ page }) => {
      await page.click('#show-info');

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-info/);
      await expect(toast).toContainText('Here is some information');
    });

    test('type toasts have icons', async ({ page }) => {
      await page.click('#show-success');

      const icon = page.locator('.vd-toast-icon').first();
      await expect(icon).toBeVisible();
      await expect(icon.locator('svg')).toBeVisible();
    });
  });

  test.describe('Events', () => {
    test('dispatches toast:show event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).toastShowEvent = null;
        document.addEventListener('toast:show', (e: any) => {
          (window as any).toastShowEvent = e.detail;
        });
      });

      await page.click('#show-toast');

      const eventDetail = await page.evaluate(() => (window as any).toastShowEvent);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.config.message).toBe('This is a test toast message');
    });

    test('dispatches toast:dismiss event', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).toastDismissEvent = null;
        document.addEventListener('toast:dismiss', (e: any) => {
          (window as any).toastDismissEvent = e.detail;
        });
      });

      await page.click('#show-toast');
      await page.click('.vd-toast-close');

      const eventDetail = await page.evaluate(() => (window as any).toastDismissEvent);
      expect(eventDetail).toBeTruthy();
    });
  });

  test.describe('Programmatic API', () => {
    test('shows toast programmatically with Toast.show()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.show('Programmatic toast message');
      });

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toContainText('Programmatic toast message');
    });

    test('shows success toast with Toast.success()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.success('Success via API');
      });

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-success/);
      await expect(toast).toContainText('Success via API');
    });

    test('shows error toast with Toast.error()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.error('Error via API');
      });

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-error/);
      await expect(toast).toContainText('Error via API');
    });

    test('shows warning toast with Toast.warning()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.warning('Warning via API');
      });

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-warning/);
    });

    test('shows info toast with Toast.info()', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.info('Info via API');
      });

      const toast = page.locator('.vd-toast').first();
      await expect(toast).toHaveClass(/toast-info/);
    });

    test('dismisses all toasts with Toast.dismissAll()', async ({ page }) => {
      // Create multiple toasts
      await page.evaluate(() => {
        (window as any).Toast.show('Toast 1');
        (window as any).Toast.show('Toast 2');
        (window as any).Toast.show('Toast 3');
      });

      await page.waitForTimeout(100);

      let toastCount = await page.locator('.vd-toast').count();
      expect(toastCount).toBe(3);

      await page.evaluate(() => {
        (window as any).Toast.dismissAll();
      });
      await page.waitForTimeout(500);

      toastCount = await page.locator('.vd-toast').count();
      expect(toastCount).toBe(0);
    });

    test('returns toast element from show()', async ({ page }) => {
      const toastElement = await page.evaluate(() => {
        const toast = (window as any).Toast.show('Test');
        return toast && toast.classList.contains('vd-toast');
      });

      expect(toastElement).toBe(true);
    });
  });

  test.describe('Container Positions', () => {
    test('creates container with correct position class', async ({ page }) => {
      await page.evaluate(() => {
        (window as any).Toast.show({
          message: 'Top right toast',
          position: 'top-right'
        });
      });

      const container = page.locator('.vd-toast-container-top-right');
      await expect(container).toBeVisible();
    });
  });
});
