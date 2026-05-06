// Hex math utilities — Canonical source: framework/js/utils/hex-math.js
// Based on web-civ utils/hex-math.js

/**
 * Rotate a point around the origin
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} [rotation=0] - Rotation in radians
 * @returns {{x: number, y: number}} Rotated point
 */
export function rotatePoint(x, y, rotation = 0) {
    if (!rotation) {
        return { x, y };
    }

    const cosRot = Math.cos(rotation);
    const sinRot = Math.sin(rotation);

    return {
        x: x * cosRot - y * sinRot,
        y: x * sinRot + y * cosRot
    };
}

/**
 * Apply the inverse of a rotation to a point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} [rotation=0] - Rotation in radians
 * @returns {{x: number, y: number}} Unrotated point
 */
export function unrotatePoint(x, y, rotation = 0) {
    return rotatePoint(x, y, -rotation);
}

/**
 * Convert hex axial coordinates to pixel coordinates (flat-top orientation)
 * @param {number} q - Hex column coordinate
 * @param {number} r - Hex row coordinate
 * @param {number} size - Hex radius
 * @param {number} [rotation=0] - Optional grid rotation in radians
 * @returns {{x: number, y: number}} Pixel coordinates
 */
export function hexToPixel(q, r, size, rotation = 0) {
    const baseX = size * 1.5 * q;
    const baseY = size * Math.sqrt(3) * (r + q * 0.5);
    return rotatePoint(baseX, baseY, rotation);
}

/**
 * Convert pixel coordinates to hex axial coordinates (flat-top orientation)
 * @param {number} px - Pixel X coordinate
 * @param {number} py - Pixel Y coordinate
 * @param {number} size - Hex radius
 * @param {number} [rotation=0] - Optional grid rotation in radians
 * @returns {{q: number, r: number}} Hex coordinates (rounded)
 */
export function pixelToHex(px, py, size, rotation = 0) {
    const point = unrotatePoint(px, py, rotation);
    const q = (2 / 3 * point.x) / size;
    const r = (-1 / 3 * point.x + Math.sqrt(3) / 3 * point.y) / size;
    return axialRound(q, r);
}

/**
 * Round fractional axial coordinates to nearest hex
 * @param {number} q - Fractional q coordinate
 * @param {number} r - Fractional r coordinate
 * @returns {{q: number, r: number}} Rounded hex coordinates
 */
export function axialRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(s);
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);
    if (qDiff > rDiff && qDiff > sDiff) {
        rq = -rr - rs;
    } else if (rDiff > sDiff) {
        rr = -rq - rs;
    }
    return { q: rq, r: rr };
}

/**
 * Get the 6 corner points of a flat-top hexagon
 * @param {number} x - Center X coordinate
 * @param {number} y - Center Y coordinate
 * @param {number} size - Hex radius
 * @param {number} [rotation=0] - Optional hex rotation in radians
 * @returns {Array<{x: number, y: number}>} Array of 6 corner points
 */
export function getHexCorners(x, y, size, rotation = 0) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
        const angleRad = (Math.PI / 180) * (60 * i) + rotation;
        corners.push({
            x: x + size * Math.cos(angleRad),
            y: y + size * Math.sin(angleRad)
        });
    }
    return corners;
}

/**
 * Get the 6 adjacent hex coordinates from a given hex
 * @param {number} q - Hex column
 * @param {number} r - Hex row
 * @returns {Array<{q: number, r: number}>} Array of 6 adjacent hex coordinates
 */
export function getAdjacentHexes(q, r) {
    return [
        { q: q + 1, r: r },
        { q: q + 1, r: r - 1 },
        { q: q, r: r - 1 },
        { q: q - 1, r: r },
        { q: q - 1, r: r + 1 },
        { q: q, r: r + 1 }
    ];
}

/**
 * Calculate distance between two hexes using axial coordinates
 * @param {number} q1 - First hex q coordinate
 * @param {number} r1 - First hex r coordinate
 * @param {number} q2 - Second hex q coordinate
 * @param {number} r2 - Second hex r coordinate
 * @returns {number} Distance in hex steps
 */
export function hexDistance(q1, r1, q2, r2) {
    return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

/**
 * Terrain types available in the system
 */
export const TerrainType = Object.freeze({
    GRASSLAND: 'Grassland',
    PLAINS: 'Plains',
    DESERT: 'Desert',
    TUNDRA: 'Tundra',
    SNOW: 'Snow',
    MOUNTAIN: 'Mountain',
    OCEAN: 'Ocean',
    COAST: 'Coast'
});

/**
 * Terrain colors for rendering
 */
export const TERRAIN_COLORS = Object.freeze({
    [TerrainType.GRASSLAND]: '#47602f',
    [TerrainType.PLAINS]: '#6e6838',
    [TerrainType.DESERT]: '#bd9a60',
    [TerrainType.TUNDRA]: '#75787b',
    [TerrainType.SNOW]: '#cfdce4',
    [TerrainType.MOUNTAIN]: '#464543',
    [TerrainType.OCEAN]: '#1d354c',
    [TerrainType.COAST]: '#295170'
});

/**
 * Default terrain color for unknown types
 */
export const DEFAULT_TERRAIN_COLOR = '#FF00FF';

/**
 * Terrain yields - resources generated per turn from each terrain type
 */
export const TERRAIN_YIELDS = Object.freeze({
    [TerrainType.GRASSLAND]: { food: 2, production: 0, gold: 0 },
    [TerrainType.PLAINS]: { food: 1, production: 1, gold: 0 },
    [TerrainType.DESERT]: { food: 0, production: 1, gold: 0 },
    [TerrainType.TUNDRA]: { food: 1, production: 0, gold: 0 },
    [TerrainType.SNOW]: { food: 0, production: 0, gold: 0 },
    [TerrainType.COAST]: { food: 1, production: 0, gold: 0 },
    [TerrainType.OCEAN]: { food: 0, production: 0, gold: 0 },
    [TerrainType.MOUNTAIN]: { food: 0, production: 0, gold: 0 }
});

/**
 * Movement costs for units based on terrain
 * Higher cost = harder to move through
 */
export const TERRAIN_MOVEMENT_COSTS = Object.freeze({
    [TerrainType.GRASSLAND]: 1,
    [TerrainType.PLAINS]: 1,
    [TerrainType.DESERT]: 1,
    [TerrainType.TUNDRA]: 1,
    [TerrainType.SNOW]: 2,
    [TerrainType.COAST]: 1,
    [TerrainType.OCEAN]: 999, // Impassable for land units
    [TerrainType.MOUNTAIN]: 999 // Impassable
});

/**
 * Check if terrain is passable for land units
 * @param {string} terrainType - Terrain type
 * @returns {boolean} True if passable
 */
export function isPassable(terrainType) {
    const cost = TERRAIN_MOVEMENT_COSTS[terrainType];
    return cost !== undefined && cost < 999;
}

/**
 * Get movement cost for terrain
 * @param {string} terrainType - Terrain type
 * @returns {number} Movement cost
 */
export function getMovementCost(terrainType) {
    return TERRAIN_MOVEMENT_COSTS[terrainType] ?? 999;
}

/**
 * Get terrain yields
 * @param {string} terrainType - Terrain type
 * @returns {Object} Yields object {food, production, gold}
 */
export function getTerrainYields(terrainType) {
    return TERRAIN_YIELDS[terrainType] || { food: 0, production: 0, gold: 0 };
}

/**
 * Get terrain color
 * @param {string} terrainType - Terrain type
 * @returns {string} Hex color string
 */
export function getTerrainColor(terrainType) {
    return TERRAIN_COLORS[terrainType] || DEFAULT_TERRAIN_COLOR;
}
