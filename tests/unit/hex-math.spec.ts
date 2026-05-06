/**
 * Unit Tests for hex-math utilities
 *
 * Tests for framework/js/utils/hex-math.js using Playwright page.evaluate()
 */

import { test, expect } from '@playwright/test';

test.describe('hex-math utilities @unit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/hex-harness.html');
    await page.waitForFunction(() => window.hexMath && window.hexMath.hexToPixel);
  });

  test('rotatePoint and unrotatePoint are inverse operations', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { rotatePoint, unrotatePoint } = window.hexMath;
      const rotation = -Math.PI / 6;
      const rotated = rotatePoint(30, 40, rotation);
      const original = unrotatePoint(rotated.x, rotated.y, rotation);
      return { x: original.x, y: original.y };
    });

    expect(result.x).toBeCloseTo(30, 5);
    expect(result.y).toBeCloseTo(40, 5);
  });

  test('hexToPixel and pixelToHex round trip with and without rotation', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { hexToPixel, pixelToHex } = window.hexMath;
      const noRotationPixel = hexToPixel(2, 3, 30);
      const noRotationHex = pixelToHex(noRotationPixel.x, noRotationPixel.y, 30);

      const rotation = -Math.PI / 6;
      const rotatedPixel = hexToPixel(2, 1, 30, rotation);
      const rotatedHex = pixelToHex(rotatedPixel.x, rotatedPixel.y, 30, rotation);

      return { noRotationPixel, noRotationHex, rotatedHex };
    });

    expect(result.noRotationPixel.x).toBe(90);
    expect(result.noRotationHex).toEqual({ q: 2, r: 3 });
    expect(result.rotatedHex).toEqual({ q: 2, r: 1 });
  });

  test('axialRound handles positive and negative fractional coordinates', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { axialRound } = window.hexMath;
      return {
        a: axialRound(0.6, 0.7),
        b: axialRound(-0.4, -0.3),
        c: axialRound(0.2, 0.2),
      };
    });

    expect(result.a).toEqual({ q: 0, r: 1 });
    expect(result.b.q).toBe(-1);
    expect(result.b.r).toBeCloseTo(0, 5);
    expect(result.c).toEqual({ q: 0, r: 0 });
  });

  test('getHexCorners returns six points and applies rotation', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { getHexCorners } = window.hexMath;
      const corners = getHexCorners(0, 0, 30, Math.PI / 6);
      return {
        count: corners.length,
        first: corners[0],
      };
    });

    expect(result.count).toBe(6);
    expect(result.first.x).toBeCloseTo(25.980762, 5);
    expect(result.first.y).toBeCloseTo(15, 5);
  });

  test('adjacent hexes and hexDistance use axial geometry correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { getAdjacentHexes, hexDistance } = window.hexMath;
      const adjacent = getAdjacentHexes(0, 0);
      const distances = adjacent.map((hex) => hexDistance(0, 0, hex.q, hex.r));
      return { adjacent, distances };
    });

    expect(result.adjacent).toEqual([
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ]);
    expect(result.distances.every((value) => value === 1)).toBe(true);
  });

  test('terrain constants include all terrain types', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { TerrainType, TERRAIN_COLORS, TERRAIN_YIELDS, TERRAIN_MOVEMENT_COSTS } = window.hexMath;
      const types = Object.values(TerrainType);
      return {
        count: types.length,
        allHaveColor: types.every((type) => TERRAIN_COLORS[type] !== undefined),
        allHaveYields: types.every((type) => TERRAIN_YIELDS[type] !== undefined),
        allHaveCosts: types.every((type) => TERRAIN_MOVEMENT_COSTS[type] !== undefined),
      };
    });

    expect(result.count).toBe(8);
    expect(result.allHaveColor).toBe(true);
    expect(result.allHaveYields).toBe(true);
    expect(result.allHaveCosts).toBe(true);
  });

  test('terrain helpers handle known and unknown values', async ({ page }) => {
    const result = await page.evaluate(() => {
      const {
        TerrainType,
        DEFAULT_TERRAIN_COLOR,
        getMovementCost,
        getTerrainColor,
        getTerrainYields,
        isPassable,
      } = window.hexMath;

      return {
        grasslandPassable: isPassable(TerrainType.GRASSLAND),
        oceanPassable: isPassable(TerrainType.OCEAN),
        unknownPassable: isPassable('UNKNOWN'),
        snowCost: getMovementCost(TerrainType.SNOW),
        unknownCost: getMovementCost('UNKNOWN'),
        oceanColor: getTerrainColor(TerrainType.OCEAN),
        unknownColor: getTerrainColor('UNKNOWN'),
        unknownYields: getTerrainYields('UNKNOWN'),
        defaultColor: DEFAULT_TERRAIN_COLOR,
      };
    });

    expect(result.grasslandPassable).toBe(true);
    expect(result.oceanPassable).toBe(false);
    expect(result.unknownPassable).toBe(false);
    expect(result.snowCost).toBe(2);
    expect(result.unknownCost).toBe(999);
    expect(result.oceanColor).toBe('#1d354c');
    expect(result.unknownColor).toBe(result.defaultColor);
    expect(result.unknownYields).toEqual({ food: 0, production: 0, gold: 0 });
  });
});
