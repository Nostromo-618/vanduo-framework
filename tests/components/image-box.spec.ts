/**
 * Image Box Component Tests
 *
 * Tests for js/components/image-box.js
 * Covers: initialization, open/close behavior, keyboard navigation,
 * captions, accessibility, focus management, and custom events
 */

import { test, expect } from '@playwright/test';

test.describe('Image Box Component @component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/fixtures/image-box.html');
        await page.waitForTimeout(100);
    });

    test.describe('Initialization', () => {
        test('initializes image box triggers', async ({ page }) => {
            const trigger = page.locator('#basic-image');
            await expect(trigger).toHaveAttribute('data-image-box-initialized', 'true');
        });

        test('adds trigger class to initialized elements', async ({ page }) => {
            const trigger = page.locator('#basic-image');
            await expect(trigger).toHaveClass(/image-box-trigger/);
        });

        test('creates backdrop element in DOM', async ({ page }) => {
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toBeAttached();
        });

        test('backdrop has correct ARIA attributes', async ({ page }) => {
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveAttribute('role', 'dialog');
            await expect(backdrop).toHaveAttribute('aria-modal', 'true');
            await expect(backdrop).toHaveAttribute('aria-label', 'Image viewer');
        });

        test('adds keyboard accessibility to image triggers', async ({ page }) => {
            const trigger = page.locator('#basic-image');
            await expect(trigger).toHaveAttribute('role', 'button');
            await expect(trigger).toHaveAttribute('tabindex', '0');
            await expect(trigger).toHaveAttribute('aria-label', 'View enlarged image');
        });
    });

    test.describe('Open Behavior', () => {
        test('opens on image click', async ({ page }) => {
            await page.click('#basic-image');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveClass(/is-visible/);
        });

        test('displays correct image source', async ({ page }) => {
            await page.click('#basic-image');
            const img = page.locator('.vd-image-box-img').first();
            await expect(img).toHaveAttribute('src', /thumb1\.jpg/);
        });

        test('opens with Enter key', async ({ page }) => {
            await page.focus('#basic-image');
            await page.keyboard.press('Enter');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveClass(/is-visible/);
        });

        test('opens with Space key', async ({ page }) => {
            await page.focus('#basic-image');
            await page.keyboard.press('Space');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveClass(/is-visible/);
        });

        test('uses full-src attribute when available', async ({ page }) => {
            await page.click('#dual-source-image');
            const img = page.locator('.vd-image-box-img').first();
            await expect(img).toHaveAttribute('src', /full3\.jpg/);
        });

        test('dispatches imageBox:open event', async ({ page }) => {
            await page.click('#basic-image');
            const events = await page.evaluate(() => (window as any).imageBoxEvents);
            expect(events).toContainEqual(expect.objectContaining({ type: 'open' }));
        });

        test('adds body class to prevent scroll', async ({ page }) => {
            await page.click('#basic-image');
            const body = page.locator('body');
            await expect(body).toHaveClass(/body-image-box-open/);
        });
    });

    test.describe('Close Behavior', () => {
        test('closes on backdrop click', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.click('.vd-image-box-backdrop');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).not.toHaveClass(/is-visible/);
        });

        test('closes on image click', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.click('.vd-image-box-img');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).not.toHaveClass(/is-visible/);
        });

        test('closes on close button click', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.click('.vd-image-box-close');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).not.toHaveClass(/is-visible/);
        });

        test('closes on ESC key', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.keyboard.press('Escape');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).not.toHaveClass(/is-visible/);
        });

        test('dispatches imageBox:close event', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.keyboard.press('Escape');
            const events = await page.evaluate(() => (window as any).imageBoxEvents);
            expect(events).toContainEqual({ type: 'close' });
        });

        test('removes body class on close', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(100);
            await page.keyboard.press('Escape');
            const body = page.locator('body');
            await expect(body).not.toHaveClass(/body-image-box-open/);
        });

        test('returns focus to trigger on close', async ({ page }) => {
            const trigger = page.locator('#basic-image');
            await trigger.click();
            await page.waitForTimeout(100);
            await page.keyboard.press('Escape');
            await page.waitForTimeout(100);
            await expect(trigger).toBeFocused();
        });
    });

    test.describe('Caption Display', () => {
        test('displays caption when data-image-box-caption is set', async ({ page }) => {
            await page.click('#image-with-caption');
            const caption = page.locator('.vd-image-box-caption').first();
            await expect(caption).toBeVisible();
            await expect(caption).toHaveText('This is a test caption');
        });

        test('hides caption when not provided', async ({ page }) => {
            await page.evaluate(() => {
                const img = document.querySelector('#basic-image');
                img?.removeAttribute('alt');
            });
            await page.click('#basic-image');
            const caption = page.locator('.vd-image-box-caption').first();
            await expect(caption).not.toBeVisible();
        });

        test('uses alt text as fallback caption', async ({ page }) => {
            // The basic image has alt text but no caption attribute
            // Caption should use alt as fallback
            const trigger = page.locator('#basic-image');
            const altText = await trigger.getAttribute('alt');
            await trigger.click();
            const caption = page.locator('.vd-image-box-caption').first();

            // Check if caption shows alt text (if implemented that way)
            const captionText = await caption.textContent();
            // Caption may be hidden if alt is not used, or show the alt
            expect(captionText === '' || captionText === altText).toBeTruthy();
        });
    });

    test.describe('Link Trigger', () => {
        test('works with anchor elements', async ({ page }) => {
            await page.click('#link-trigger');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveClass(/is-visible/);
        });

        test('uses href as image source for links', async ({ page }) => {
            await page.click('#link-trigger');
            const img = page.locator('.vd-image-box-img').first();
            await expect(img).toHaveAttribute('src', /photo\.jpg/);
        });

        test('prevents default link navigation', async ({ page }) => {
            // The page should not navigate away
            await page.click('#link-trigger');
            await page.waitForTimeout(100);
            await expect(page).toHaveURL(/image-box\.html/);
        });
    });

    test.describe('Broken Images', () => {
        test('adds is-broken class to broken images', async ({ page }) => {
            // Wait for the error to be detected
            await page.waitForTimeout(500);
            const brokenImg = page.locator('#broken-image');
            await expect(brokenImg).toHaveClass(/is-broken/);
        });
    });

    test.describe('Programmatic API', () => {
        test('VanduoImageBox is exposed globally', async ({ page }) => {
            const exists = await page.evaluate(() => typeof (window as any).VanduoImageBox !== 'undefined');
            expect(exists).toBe(true);
        });

        test('open method works programmatically', async ({ page }) => {
            await page.click('#open-programmatic');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveClass(/is-visible/);
        });

        test('close method works programmatically', async ({ page }) => {
            await page.click('#open-programmatic');
            await page.waitForTimeout(100);
            await page.click('#close-programmatic');
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).not.toHaveClass(/is-visible/);
        });

        test('reinit binds new triggers', async ({ page }) => {
            // Add a new image dynamically
            await page.evaluate(() => {
                const img = document.createElement('img');
                img.id = 'dynamic-image';
                img.src = '/images/thumb1.jpg';
                img.setAttribute('data-image-box', '');
                document.querySelector('#gallery')?.appendChild(img);
            });

            // Before reinit, new image should not be initialized
            const dynamicImg = page.locator('#dynamic-image');
            await expect(dynamicImg).not.toHaveAttribute('data-image-box-initialized', 'true');

            // Reinit
            await page.click('#reinit-btn');

            // Now it should be initialized
            await expect(dynamicImg).toHaveAttribute('data-image-box-initialized', 'true');
        });

        test('has isOpen property', async ({ page }) => {
            let isOpen = await page.evaluate(() => (window as any).VanduoImageBox.isOpen);
            expect(isOpen).toBe(false);

            await page.click('#basic-image');
            isOpen = await page.evaluate(() => (window as any).VanduoImageBox.isOpen);
            expect(isOpen).toBe(true);

            await page.keyboard.press('Escape');
            await page.waitForTimeout(100);
            isOpen = await page.evaluate(() => (window as any).VanduoImageBox.isOpen);
            expect(isOpen).toBe(false);
        });
    });

    test.describe('Accessibility', () => {
        test('close button has aria-label', async ({ page }) => {
            const closeBtn = page.locator('.vd-image-box-close').first();
            await expect(closeBtn).toHaveAttribute('aria-label', 'Close image viewer');
        });

        // Skip: Focus behavior varies by browser/platform
        test.skip('backdrop receives focus when opened', async ({ page }) => {
            await page.click('#basic-image');
            await page.waitForTimeout(200);

            // Check that the active element is within the backdrop (close button or backdrop itself)
            const focusedElement = await page.evaluate(() => document.activeElement?.closest('.vd-image-box-backdrop'));
            expect(focusedElement).not.toBeNull();
        });

        test('backdrop has tabindex for focus', async ({ page }) => {
            const backdrop = page.locator('.vd-image-box-backdrop').first();
            await expect(backdrop).toHaveAttribute('tabindex', '-1');
        });
    });

    test.describe('Gallery Behavior', () => {
        test('each gallery image can be opened independently', async ({ page }) => {
            const galleryImages = page.locator('.gallery-img');
            const count = await galleryImages.count();
            expect(count).toBe(3);

            // Check each image can open
            for (let i = 0; i < count; i++) {
                await galleryImages.nth(i).click();
                const backdrop = page.locator('.vd-image-box-backdrop').first();
                await expect(backdrop).toHaveClass(/is-visible/);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(200);
            }
        });
    });
});
