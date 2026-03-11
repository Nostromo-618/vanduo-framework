/**
 * Validate (Form Validation) Component Tests
 *
 * Tests for js/components/validate.js
 * Covers: required, email, min/max, url, match, custom messages, ARIA, submit prevention
 */

import { test, expect } from '@playwright/test';

test.describe('Validate (Form Validation) Component @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/validate.html');
    await page.waitForTimeout(200);
  });

  test.describe('Required Validation', () => {
    test('shows error for empty required field on submit', async ({ page }) => {
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const nameInput = page.locator('#name');
      await expect(nameInput).toHaveClass(/is-invalid/);

      const error = page.locator('#name ~ .vd-validate-error, .vd-form-group .vd-validate-error').first();
      await expect(error).toContainText('Name is required');
    });

    test('custom error message from data attribute', async ({ page }) => {
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const error = page.locator('.vd-form-group:has(#name) .vd-validate-error');
      await expect(error).toContainText('Name is required');
    });
  });

  test.describe('Email Validation', () => {
    test('invalid email shows error', async ({ page }) => {
      await page.fill('#email', 'notanemail');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveClass(/is-invalid/);
    });

    test('valid email passes', async ({ page }) => {
      await page.fill('#name', 'John');
      await page.fill('#email', 'test@example.com');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveClass(/is-valid/);
    });
  });

  test.describe('Min Length', () => {
    test('too short value fails', async ({ page }) => {
      await page.fill('#name', 'AB');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const nameInput = page.locator('#name');
      await expect(nameInput).toHaveClass(/is-invalid/);
    });
  });

  test.describe('Number / Range', () => {
    test('non-number fails number rule', async ({ page }) => {
      await page.fill('#age', 'abc');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      await expect(page.locator('#age')).toHaveClass(/is-invalid/);
    });

    test('value below minVal fails', async ({ page }) => {
      await page.fill('#age', '10');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      await expect(page.locator('#age')).toHaveClass(/is-invalid/);
    });
  });

  test.describe('Match Rule', () => {
    test('mismatched passwords fail', async ({ page }) => {
      await page.fill('#password', 'secret123');
      await page.fill('#confirm', 'different');
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      await expect(page.locator('#confirm')).toHaveClass(/is-invalid/);
    });
  });

  test.describe('ARIA', () => {
    test('sets aria-invalid on invalid field', async ({ page }) => {
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
    });

    test('error element has role=alert', async ({ page }) => {
      await page.click('#submit-btn');
      await page.waitForTimeout(100);

      const errors = page.locator('.vd-validate-error[role="alert"]');
      const count = await errors.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Submit Prevention', () => {
    test('prevents form submission when invalid', async ({ page }) => {
      let navigated = false;
      page.on('request', () => { navigated = true; });

      await page.click('#submit-btn');
      await page.waitForTimeout(200);

      expect(navigated).toBe(false);
    });
  });
});
