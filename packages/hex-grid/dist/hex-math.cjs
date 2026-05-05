var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hex-math.js
var hex_math_exports = {};
__export(hex_math_exports, {
  DEFAULT_TERRAIN_COLOR: () => DEFAULT_TERRAIN_COLOR,
  TERRAIN_COLORS: () => TERRAIN_COLORS,
  TERRAIN_MOVEMENT_COSTS: () => TERRAIN_MOVEMENT_COSTS,
  TERRAIN_YIELDS: () => TERRAIN_YIELDS,
  TerrainType: () => TerrainType,
  axialRound: () => axialRound,
  getAdjacentHexes: () => getAdjacentHexes,
  getHexCorners: () => getHexCorners,
  getMovementCost: () => getMovementCost,
  getTerrainColor: () => getTerrainColor,
  getTerrainYields: () => getTerrainYields,
  hexDistance: () => hexDistance,
  hexToPixel: () => hexToPixel,
  isPassable: () => isPassable,
  pixelToHex: () => pixelToHex,
  rotatePoint: () => rotatePoint,
  unrotatePoint: () => unrotatePoint
});
module.exports = __toCommonJS(hex_math_exports);

// ../../js/utils/hex-math.js
function rotatePoint(x, y, rotation = 0) {
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
function unrotatePoint(x, y, rotation = 0) {
  return rotatePoint(x, y, -rotation);
}
function hexToPixel(q, r, size, rotation = 0) {
  const baseX = size * 1.5 * q;
  const baseY = size * Math.sqrt(3) * (r + q * 0.5);
  return rotatePoint(baseX, baseY, rotation);
}
function pixelToHex(px, py, size, rotation = 0) {
  const point = unrotatePoint(px, py, rotation);
  const q = 2 / 3 * point.x / size;
  const r = (-1 / 3 * point.x + Math.sqrt(3) / 3 * point.y) / size;
  return axialRound(q, r);
}
function axialRound(q, r) {
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
function getHexCorners(x, y, size, rotation = 0) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = Math.PI / 180 * (60 * i) + rotation;
    corners.push({
      x: x + size * Math.cos(angleRad),
      y: y + size * Math.sin(angleRad)
    });
  }
  return corners;
}
function getAdjacentHexes(q, r) {
  return [
    { q: q + 1, r },
    { q: q + 1, r: r - 1 },
    { q, r: r - 1 },
    { q: q - 1, r },
    { q: q - 1, r: r + 1 },
    { q, r: r + 1 }
  ];
}
function hexDistance(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}
var TerrainType = Object.freeze({
  GRASSLAND: "Grassland",
  PLAINS: "Plains",
  DESERT: "Desert",
  TUNDRA: "Tundra",
  SNOW: "Snow",
  MOUNTAIN: "Mountain",
  OCEAN: "Ocean",
  COAST: "Coast"
});
var TERRAIN_COLORS = Object.freeze({
  [TerrainType.GRASSLAND]: "#47602f",
  [TerrainType.PLAINS]: "#6e6838",
  [TerrainType.DESERT]: "#bd9a60",
  [TerrainType.TUNDRA]: "#75787b",
  [TerrainType.SNOW]: "#cfdce4",
  [TerrainType.MOUNTAIN]: "#464543",
  [TerrainType.OCEAN]: "#1d354c",
  [TerrainType.COAST]: "#295170"
});
var DEFAULT_TERRAIN_COLOR = "#FF00FF";
var TERRAIN_YIELDS = Object.freeze({
  [TerrainType.GRASSLAND]: { food: 2, production: 0, gold: 0 },
  [TerrainType.PLAINS]: { food: 1, production: 1, gold: 0 },
  [TerrainType.DESERT]: { food: 0, production: 1, gold: 0 },
  [TerrainType.TUNDRA]: { food: 1, production: 0, gold: 0 },
  [TerrainType.SNOW]: { food: 0, production: 0, gold: 0 },
  [TerrainType.COAST]: { food: 1, production: 0, gold: 0 },
  [TerrainType.OCEAN]: { food: 0, production: 0, gold: 0 },
  [TerrainType.MOUNTAIN]: { food: 0, production: 0, gold: 0 }
});
var TERRAIN_MOVEMENT_COSTS = Object.freeze({
  [TerrainType.GRASSLAND]: 1,
  [TerrainType.PLAINS]: 1,
  [TerrainType.DESERT]: 1,
  [TerrainType.TUNDRA]: 1,
  [TerrainType.SNOW]: 2,
  [TerrainType.COAST]: 1,
  [TerrainType.OCEAN]: 999,
  // Impassable for land units
  [TerrainType.MOUNTAIN]: 999
  // Impassable
});
function isPassable(terrainType) {
  const cost = TERRAIN_MOVEMENT_COSTS[terrainType];
  return cost !== void 0 && cost < 999;
}
function getMovementCost(terrainType) {
  return TERRAIN_MOVEMENT_COSTS[terrainType] ?? 999;
}
function getTerrainYields(terrainType) {
  return TERRAIN_YIELDS[terrainType] || { food: 0, production: 0, gold: 0 };
}
function getTerrainColor(terrainType) {
  return TERRAIN_COLORS[terrainType] || DEFAULT_TERRAIN_COLOR;
}
//# sourceMappingURL=hex-math.cjs.map
