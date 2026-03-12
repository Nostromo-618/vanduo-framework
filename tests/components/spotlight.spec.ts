/**
 * Spotlight (Feature Discovery) Component Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Spotlight Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/spotlight.html');
    await page.waitForTimeout(200);
  });

  test('starts tour on programmatic trigger', async ({ page }) => {
    await page.click('#start-tour');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toBeVisible();
    await expect(page.locator('.vd-spotlight-tooltip')).toBeVisible();
  });

  test('starts tour on declarative trigger', async ({ page }) => {
    await page.click('#start-tour-declarative');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toBeVisible();
    await expect(page.locator('.vd-spotlight-title')).toContainText('Step 1');
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

  test('repeated init does not double-bind declarative handlers', async ({ page }) => {
    const stepCount = await page.evaluate(() => {
      let count = 0;
      document.addEventListener('spotlight:step', () => {
        count += 1;
      });

      window.Vanduo.init();
      window.Vanduo.init();

      const trigger = document.getElementById('start-tour-declarative');
      trigger?.click();

      return new Promise<number>(resolve => {
        setTimeout(() => resolve(count), 300);
      });
    });

    expect(stepCount).toBe(1);
    await expect(page.locator('.vd-spotlight-overlay')).toHaveCount(1);
  });

  test('invalid declarative payload fails safely', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.click('#start-tour-invalid');
    await page.waitForTimeout(300);

    await expect(page.locator('.vd-spotlight-overlay')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('spotlight events expose expected detail payloads', async ({ page }) => {
    const payload = await page.evaluate(() => {
      return new Promise<{ stepDetail: unknown; endDetail: unknown }>((resolve) => {
        let stepDetail = null;

        document.addEventListener('spotlight:step', (event) => {
          stepDetail = (event as CustomEvent).detail;
        }, { once: true });

        document.addEventListener('spotlight:end', (event) => {
          resolve({
            stepDetail,
            endDetail: (event as CustomEvent).detail
          });
        }, { once: true });

        const trigger = document.getElementById('start-tour-declarative');
        trigger?.click();

        setTimeout(() => {
          const skipButton = Array.from(document.querySelectorAll('.vd-spotlight-btn'))
            .find(button => button.textContent === 'Skip');
          skipButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }, 200);
      });
    });

    expect(payload).toEqual({
      stepDetail: {
        index: 0,
        step: 0,
        total: 3,
        data: {
          target: '#target-1',
          title: 'Step 1',
          description: 'This is the first feature.'
        }
      },
      endDetail: {
        completedSteps: 1,
        total: 3,
        completed: false
      }
    });
  });
});
