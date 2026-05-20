import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    Vanduo: {
      init: (root?: Element | Document) => void;
      destroy: (root?: Element | Document) => void;
      destroyAll: () => void;
      reinit: (name: string, root?: Element | Document) => void;
      getComponent: (name: string) => any;
      register: (name: string, component: { init?: (root?: Element | Document) => void }) => void;
    };
    VanduoLifecycle: {
      getAll: () => Array<{ element: Element; component: string }>;
    };
  }
}

const FIXTURE = '/tests/fixtures/runtime-scope.html';

test.describe('Runtime Scope Contract @component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE);
    await page.waitForFunction(() => typeof window.Vanduo !== 'undefined');
  });

  test('init(root), reinit(name, root), destroy(root), and destroyAll() stay scoped', async ({ page }) => {
    const afterInitA = await page.evaluate(() => {
      const root = document.getElementById('scope-a')!;
      window.Vanduo.init(root);
      const timeline = window.Vanduo.getComponent('timeline');
      return {
        instanceCount: timeline.instances.size,
        hasA: timeline.instances.has(document.getElementById('timeline-a')),
        hasB: timeline.instances.has(document.getElementById('timeline-b')),
        lifecycle: window.VanduoLifecycle.getAll().map((entry) => ({
          id: (entry.element as HTMLElement).id,
          component: entry.component,
        })),
      };
    });

    expect(afterInitA.instanceCount).toBe(1);
    expect(afterInitA.hasA).toBe(true);
    expect(afterInitA.hasB).toBe(false);
    expect(afterInitA.lifecycle).toEqual([{ id: 'timeline-a', component: 'timeline' }]);

    const afterReinitA = await page.evaluate(() => {
      const root = document.getElementById('scope-a')!;
      window.Vanduo.reinit('timeline', root);
      const timeline = window.Vanduo.getComponent('timeline');
      return {
        instanceCount: timeline.instances.size,
        lifecycleCount: window.VanduoLifecycle.getAll().length,
      };
    });

    expect(afterReinitA.instanceCount).toBe(1);
    expect(afterReinitA.lifecycleCount).toBe(1);

    const afterInitB = await page.evaluate(() => {
      const root = document.getElementById('scope-b')!;
      window.Vanduo.init(root);
      const timeline = window.Vanduo.getComponent('timeline');
      return {
        instanceCount: timeline.instances.size,
        hasA: timeline.instances.has(document.getElementById('timeline-a')),
        hasB: timeline.instances.has(document.getElementById('timeline-b')),
      };
    });

    expect(afterInitB.instanceCount).toBe(2);
    expect(afterInitB.hasA).toBe(true);
    expect(afterInitB.hasB).toBe(true);

    const afterDestroyA = await page.evaluate(() => {
      const root = document.getElementById('scope-a')!;
      window.Vanduo.destroy(root);
      const timeline = window.Vanduo.getComponent('timeline');
      return {
        instanceCount: timeline.instances.size,
        hasA: timeline.instances.has(document.getElementById('timeline-a')),
        hasB: timeline.instances.has(document.getElementById('timeline-b')),
        lifecycle: window.VanduoLifecycle.getAll().map((entry) => ({
          id: (entry.element as HTMLElement).id,
          component: entry.component,
        })),
      };
    });

    expect(afterDestroyA.instanceCount).toBe(1);
    expect(afterDestroyA.hasA).toBe(false);
    expect(afterDestroyA.hasB).toBe(true);
    expect(afterDestroyA.lifecycle).toEqual([{ id: 'timeline-b', component: 'timeline' }]);

    const afterDestroyAll = await page.evaluate(() => {
      window.Vanduo.destroyAll();
      const timeline = window.Vanduo.getComponent('timeline');
      return {
        instanceCount: timeline.instances.size,
        lifecycleCount: window.VanduoLifecycle.getAll().length,
      };
    });

    expect(afterDestroyAll.instanceCount).toBe(0);
    expect(afterDestroyAll.lifecycleCount).toBe(0);
  });

  test('scoped init does not mutate document query APIs', async ({ page }) => {
    const state = await page.evaluate(() => {
      const originalQuerySelectorAll = document.querySelectorAll;
      let sameDuringInit = false;

      window.Vanduo.register('queryProbe', {
        init: () => {
          sameDuringInit = document.querySelectorAll === originalQuerySelectorAll;
        }
      });

      window.Vanduo.reinit('queryProbe', document.getElementById('scope-a')!);

      return {
        sameDuringInit,
        sameAfterInit: document.querySelectorAll === originalQuerySelectorAll
      };
    });

    expect(state.sameDuringInit).toBe(true);
    expect(state.sameAfterInit).toBe(true);
  });
});
