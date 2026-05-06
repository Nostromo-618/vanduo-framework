/**
 * E2E Tests for VdHexGrid component
 *
 * Tests for framework/js/components/vd-hex.js via Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('VdHexGrid @e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/hex-harness.html');
    await page.evaluate(() => {
      window.resetGrid({ width: 6, height: 4, size: 24 });
    });
  });

  test('initializes grid and exposes expected base state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      return {
        hasOrigin: grid.hasHex(0, 0),
        count: grid.getHexCount(),
        transform: grid.getTransform(),
      };
    });

    expect(result.hasOrigin).toBe(true);
    expect(result.count).toBeGreaterThan(0);
    expect(result.transform).toEqual({ x: 0, y: 0, scale: 1 });
  });

  test('selects a hex on click and emits select event', async ({ page }) => {
    const clickTarget = await page.evaluate(() => {
      const grid = window.grid;
      const firstHex = grid.getAllHexes()[0];
      return {
        x: firstHex.x,
        y: firstHex.y,
      };
    });

    await page.locator('#hex-canvas').click({
      position: {
        x: clickTarget.x,
        y: clickTarget.y,
      },
    });

    const result = await page.evaluate(() => {
      const grid = window.grid;
      const evt = window.lastEvent;
      return {
        selected: grid.selectedHex ? { q: grid.selectedHex.q, r: grid.selectedHex.r } : null,
        eventType: evt?.type,
      };
    });

    expect(result.selected).not.toBeNull();
    expect(result.eventType).toBe('select');
  });

  test('drag pan updates transform and suppresses click selection', async ({ page }) => {
    const canvas = page.locator('#hex-canvas');
    await canvas.dispatchEvent('pointerdown', { clientX: 200, clientY: 200 });
    await canvas.dispatchEvent('pointermove', { clientX: 220, clientY: 230 });
    await canvas.dispatchEvent('pointerup', { clientX: 220, clientY: 230 });
    await canvas.dispatchEvent('click', { clientX: 220, clientY: 230 });

    const result = await page.evaluate(() => {
      const grid = window.grid;
      return {
        transform: grid.getTransform(),
        selectedHex: grid.selectedHex,
      };
    });

    expect(result.transform.x).toBe(20);
    expect(result.transform.y).toBe(30);
    expect(result.selectedHex).toBeNull();
  });

  test('wheel zoom clamps and emits zoom event', async ({ page }) => {
    const canvas = page.locator('#hex-canvas');
    await canvas.dispatchEvent('wheel', { deltaY: -500, clientX: 300, clientY: 300 });

    const afterZoomIn = await page.evaluate(() => {
      const grid = window.grid;
      return { transform: grid.getTransform(), lastEvent: window.lastEvent };
    });

    expect(afterZoomIn.transform.scale).toBeGreaterThan(1);
    expect(afterZoomIn.lastEvent.type).toBe('zoom');

    await page.evaluate(() => {
      const grid = window.grid;
      for (let i = 0; i < 50; i++) grid.zoomOut();
    });

    const minScale = await page.evaluate(() => window.grid.getTransform().scale);
    expect(minScale).toBeCloseTo(0.3, 5);
  });

  test('setSize, setDimensions and setRotation keep selected hex in sync', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      grid.selectedHex = grid.getHex(0, 0);
      grid.setSize(20);
      const afterSize = grid.selectedHex ? `${grid.selectedHex.q},${grid.selectedHex.r}` : null;
      grid.setDimensions(8, 5);
      const afterDimensions = grid.selectedHex ? `${grid.selectedHex.q},${grid.selectedHex.r}` : null;
      grid.setRotation(Math.PI / 6);
      const afterRotation = grid.selectedHex ? `${grid.selectedHex.q},${grid.selectedHex.r}` : null;
      return { afterSize, afterDimensions, afterRotation, rotation: grid.getRotation() };
    });

    expect(result.afterSize).toBe('0,0');
    expect(result.afterDimensions).toBe('0,0');
    expect(result.afterRotation).toBe('0,0');
    expect(result.rotation).toBeCloseTo(Math.PI / 6, 5);
  });

  test('reset restores default size, dimensions and transform', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      grid.setSize(42);
      grid.setDimensions(12, 7);
      grid.zoomIn();
      grid.reset();
      return {
        size: grid.size,
        width: grid.width,
        height: grid.height,
        rotation: grid.rotation,
        selectedHex: grid.selectedHex,
        transform: grid.getTransform(),
      };
    });

    expect(result.size).toBe(30);
    expect(result.width).toBe(15);
    expect(result.height).toBe(10);
    expect(result.rotation).toBe(0);
    expect(result.selectedHex).toBeNull();
    expect(result.transform).toEqual({ x: 0, y: 0, scale: 1 });
  });

  test('fill and terrain APIs mutate hexes as expected', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      const { TerrainType } = window.hexMath;
      grid.setHexFill(0, 0, '#112233');
      grid.setHexTerrain(0, 0, TerrainType.GRASSLAND);
      const terrain = grid.getHexTerrain(0, 0);
      const yields = grid.getHexYields(0, 0);
      const movementCost = grid.getHexMovementCost(0, 0);
      const passable = grid.isHexPassable(0, 0);
      return {
        fill: grid.getHex(0, 0).fill,
        terrain,
        yields,
        movementCost,
        passable,
      };
    });

    expect(result.fill).toBe('#112233');
    expect(result.terrain).toBe('Grassland');
    expect(result.yields.food).toBe(2);
    expect(result.movementCost).toBe(1);
    expect(result.passable).toBe(true);
  });

  test('hex custom data APIs merge/read/clear values', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      grid.setHexData(0, 0, { owner: 'player-a', hp: 10 });
      grid.setHexData(0, 0, { hp: 8, moved: true });
      const merged = grid.getHexData(0, 0);
      grid.clearHexData(0, 0);
      const cleared = grid.getHexData(0, 0);
      return { merged, cleared };
    });

    expect(result.merged).toEqual({ owner: 'player-a', hp: 8, moved: true });
    expect(result.cleared).toEqual({});
  });

  test('movement and pathfinding respect impassable terrain', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      const { TerrainType } = window.hexMath;
      grid.generateRandomTerrain();
      grid.setHexTerrain(0, 0, TerrainType.GRASSLAND);
      grid.setHexTerrain(1, 0, TerrainType.OCEAN);
      grid.setHexTerrain(0, 1, TerrainType.GRASSLAND);
      grid.setHexTerrain(1, 1, TerrainType.GRASSLAND);
      const validMoves = grid.getValidMoves(0, 0, 1);
      const blockedPath = grid.getPath(0, 0, 1, 0);
      const openPath = grid.getPath(0, 0, 1, 1);
      return { validMoves, blockedPath, openPath, distance: grid.hexDistance(0, 0, 1, 1) };
    });

    expect(result.validMoves.some((move) => move.q === 1 && move.r === 0)).toBe(false);
    expect(result.blockedPath).toEqual([]);
    expect(result.openPath.length).toBeGreaterThan(0);
    expect(result.distance).toBe(2);
  });

  test('terrain import/export round trip preserves keyed entries', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      const { TerrainType } = window.hexMath;
      grid.importTerrainData({
        '0,0': TerrainType.GRASSLAND,
        '1,1': TerrainType.MOUNTAIN,
      });
      const exported = grid.exportTerrainData();
      return { exported, originTerrain: grid.getHexTerrain(0, 0) };
    });

    expect(result.originTerrain).toBe('Grassland');
    expect(result.exported['0,0']).toBe('Grassland');
    expect(result.exported['1,1']).toBe('Mountain');
  });

  test('custom render callback and theme observer trigger re-render paths', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const grid = window.grid;
      let customCount = 0;
      grid.setCustomRender(() => {
        customCount += 1;
      });

      const baseRender = grid._render.bind(grid);
      let renderCount = 0;
      grid._render = function patchedRender() {
        renderCount += 1;
        return baseRender();
      };

      document.documentElement.setAttribute('data-theme', 'dark');
      await new Promise((resolve) => setTimeout(resolve, 20));

      grid.clearCustomRender();
      return {
        customCount,
        renderCount,
        callbackCleared: grid.customRenderCallback === null,
      };
    });

    expect(result.customCount).toBeGreaterThan(0);
    expect(result.renderCount).toBeGreaterThan(0);
    expect(result.callbackCleared).toBe(true);
  });

  test('resetView emits pan and zoom events', async ({ page }) => {
    const result = await page.evaluate(() => {
      const grid = window.grid;
      grid.zoomIn();
      grid.resetView();
      return {
        transform: grid.getTransform(),
        lastEvent: window.lastEvent,
      };
    });

    expect(result.transform).toEqual({ x: 0, y: 0, scale: 1 });
    expect(result.lastEvent.type).toBe('zoom');
    expect(result.lastEvent.data.scale).toBe(1);
  });
});
