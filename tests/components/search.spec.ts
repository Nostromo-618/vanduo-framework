/**
 * Search Helper Tests
 *
 * Tests for js/components/search.js — registry + query API.
 */

import { test, expect } from '@playwright/test';

test.describe('Search Helper @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/search.html');
    await page.waitForTimeout(150);
  });

  test('register + list returns registered sources', async ({ page }) => {
    const list = await page.evaluate(() => window.VanduoSearch.list().map((s) => s.name));
    expect(list).toContain('sections');
    expect(list).toContain('guides');
  });

  test('duplicate registration throws', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        window.VanduoSearch.register({ name: 'sections', fetch: () => [] });
        return 'no-throw';
      } catch (e) {
        return e.message;
      }
    });
    expect(result).toMatch(/already registered/);
  });

  test('register without name throws', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        window.VanduoSearch.register({ fetch: () => [] });
        return 'no-throw';
      } catch (e) {
        return e.message;
      }
    });
    expect(result).toMatch(/name is required/);
  });

  test('register without fetch throws', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        window.VanduoSearch.register({ name: 'no-fetch' });
        return 'no-throw';
      } catch (e) {
        return e.message;
      }
    });
    expect(result).toMatch(/fetch must be a function/);
  });

  test('query returns results per source', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const r = await window.VanduoSearch.query('button');
      return {
        sourceNames: r.sources.map((s) => s.name),
        totalResults: r.sources.reduce((sum, s) => sum + s.results.length, 0)
      };
    });
    expect(result.sourceNames).toContain('sections');
    expect(result.totalResults).toBeGreaterThan(0);
  });

  test('empty query returns empty results for every source', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const r = await window.VanduoSearch.query('');
      return r.sources.every((s) => s.results.length === 0);
    });
    expect(result).toBe(true);
  });

  test('source fetch error is captured, not thrown', async ({ page }) => {
    const result = await page.evaluate(async () => {
      window.VanduoSearch.register({
        name: 'broken',
        fetch: () => Promise.reject(new Error('boom'))
      });
      const r = await window.VanduoSearch.query('x');
      const broken = r.sources.find((s) => s.name === 'broken');
      return { hasError: !!broken.error, msg: broken.error };
    });
    expect(result.hasError).toBe(true);
    expect(result.msg).toBe('boom');
  });

  test('unregister removes source', async ({ page }) => {
    const result = await page.evaluate(() => ({
      removed: window.VanduoSearch.unregister('sections'),
      list: window.VanduoSearch.list().map((s) => s.name)
    }));
    expect(result.removed).toBe(true);
    expect(result.list).not.toContain('sections');
  });

  test('per-source limit caps results', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const r = await window.VanduoSearch.query('e', { limitPerSource: 2 });
      return r.sources.every((s) => s.results.length <= 2);
    });
    expect(result).toBe(true);
  });
});