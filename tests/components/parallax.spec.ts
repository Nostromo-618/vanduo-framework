import { test, expect } from '@playwright/test';

/**
 * Parallax regression coverage.
 *
 * v1.4.6 finished the 1.4.1 `vd-` rename for parallax: the JS now reads both the
 * canonical `vd-parallax-*` classes/`data-parallax-speed` AND the legacy
 * unprefixed `parallax-*`/`data-speed` forms. These specs lock in that dual
 * contract plus the reduced-motion and mobile-disable guards.
 */
test.describe('Parallax Component', () => {
  test.beforeEach(async ({ page }) => {
    // reducedMotion is captured once when parallax.js loads, so set it before navigating.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/tests/fixtures/parallax.html');
    await page.waitForFunction(
      () => typeof (window as any).VanduoParallax !== 'undefined',
      null,
      { timeout: 10000 }
    );
  });

  test('initializes every .vd-parallax element', async ({ page }) => {
    const initialized = await page.$$eval('.vd-parallax', els =>
      els.every(el => (el as HTMLElement).dataset.parallaxInitialized === 'true')
    );
    expect(initialized).toBe(true);
  });

  test('getSpeed honors canonical and legacy speed classes', async ({ page }) => {
    const speeds = await page.evaluate(() => {
      const P = (window as any).VanduoParallax;
      const speed = (id: string) => P.getSpeed(document.getElementById(id));
      return {
        slow: speed('p-slow'),
        slowLegacy: speed('p-slow-legacy'),
        fast: speed('p-fast'),
        fastLegacy: speed('p-fast-legacy'),
        def: speed('p-default'),
      };
    });
    expect(speeds.slow).toBe(0.5);
    expect(speeds.slowLegacy).toBe(0.5); // legacy `parallax-slow` resolves identically
    expect(speeds.fast).toBe(1.5);
    expect(speeds.fastLegacy).toBe(1.5); // legacy `parallax-fast` resolves identically
    expect(speeds.def).toBe(1);
  });

  test('direction honors canonical and legacy horizontal classes', async ({ page }) => {
    const directions = await page.evaluate(() => {
      const P = (window as any).VanduoParallax;
      const dir = (id: string) => P.parallaxElements.get(document.getElementById(id))?.direction;
      return {
        horizontal: dir('p-horizontal'),
        horizontalLegacy: dir('p-horizontal-legacy'),
        vertical: dir('p-default'),
      };
    });
    expect(directions.horizontal).toBe('horizontal');
    expect(directions.horizontalLegacy).toBe('horizontal'); // legacy `parallax-horizontal`
    expect(directions.vertical).toBe('vertical');
  });

  test('disable-mobile (canonical + legacy) is skipped only on mobile widths', async ({ page }) => {
    const result = await page.evaluate(() => {
      const P = (window as any).VanduoParallax;
      return {
        isMobile: window.innerWidth < 768,
        canonicalTracked: P.parallaxElements.has(document.getElementById('p-disable-mobile')),
        legacyTracked: P.parallaxElements.has(document.getElementById('p-disable-mobile-legacy')),
      };
    });
    // Both forms must behave identically; on mobile they are excluded from the tracked set.
    expect(result.canonicalTracked).toBe(result.legacyTracked);
    expect(result.canonicalTracked).toBe(!result.isMobile);
  });

  test('collects .vd-parallax-bg and .vd-parallax-layer and consumes both speed attributes', async ({ page }) => {
    const result = await page.evaluate(() => {
      const P = (window as any).VanduoParallax;
      const el = document.getElementById('p-layers');
      P.updateParallax(el);
      const config = P.parallaxElements.get(el);
      const bg = document.getElementById('layer-bg') as HTMLElement;
      const canonical = document.getElementById('layer-canonical') as HTMLElement;
      const legacy = document.getElementById('layer-legacy') as HTMLElement;
      return {
        layerCount: config ? config.layers.length : 0,
        // data-parallax-speed="0" / data-speed="0" => offset * 0 => exactly translateY(0px)
        canonicalTransform: canonical.style.transform,
        legacyTransform: legacy.style.transform,
        bgHasTransform: bg.style.transform.length > 0,
      };
    });
    expect(result.layerCount).toBe(3); // bg + 2 layers all collected
    expect(result.bgHasTransform).toBe(true);
    expect(result.canonicalTransform).toBe('translateY(0px)'); // data-parallax-speed consumed
    expect(result.legacyTransform).toBe('translateY(0px)'); // legacy data-speed consumed
  });

  test('refresh() and destroyAll() are exposed and destroyAll clears state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const P = (window as any).VanduoParallax;
      const hadRefresh = typeof P.refresh === 'function';
      P.refresh(); // must not throw
      const before = P.parallaxElements.size;
      P.destroyAll();
      const layer = document.getElementById('layer-canonical') as HTMLElement;
      return {
        hadRefresh,
        before,
        after: P.parallaxElements.size,
        clearedTransform: layer.style.transform,
        isInitialized: P.isInitialized,
      };
    });
    expect(result.hadRefresh).toBe(true);
    expect(result.before).toBeGreaterThan(0);
    expect(result.after).toBe(0);
    expect(result.clearedTransform).toBe('');
    expect(result.isInitialized).toBe(false);
  });

  test('respects prefers-reduced-motion (no initialization)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/fixtures/parallax.html');
    await page.waitForFunction(
      () => typeof (window as any).VanduoParallax !== 'undefined',
      null,
      { timeout: 10000 }
    );
    const anyInitialized = await page.$$eval('.vd-parallax', els =>
      els.some(el => (el as HTMLElement).dataset.parallaxInitialized === 'true')
    );
    const tracked = await page.evaluate(() => (window as any).VanduoParallax.parallaxElements.size);
    expect(anyInitialized).toBe(false);
    expect(tracked).toBe(0);
  });
});
