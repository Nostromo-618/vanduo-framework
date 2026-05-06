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

// ../../js/components/vd-hex.js
var ZOOM_MIN = 0.3;
var ZOOM_MAX = 3;
var ZOOM_FACTOR = 0.1;
var DRAG_THRESHOLD = 2;
var VdHexGrid = class {
  constructor({ element, canvas, size = 30, width = 10, height = 10, rotation = 0 }) {
    this.element = element;
    this.canvas = canvas;
    this.size = size;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.hexes = /* @__PURE__ */ new Map();
    this.selectedHex = null;
    this.listeners = {};
    this.transform = { x: 0, y: 0, scale: 1 };
    this.dragging = false;
    this.lastPos = null;
    this.hasMoved = false;
    this.themeColors = this._getThemeColors();
    this.customRenderCallback = null;
    if (!this.canvas) {
      this.canvas = element.querySelector("canvas") || document.createElement("canvas");
      if (!element.contains(this.canvas)) {
        element.appendChild(this.canvas);
      }
    }
    this.ctx = this.canvas.getContext("2d");
    this._generateGrid();
    this._render();
    this._setupEvents();
    this._observeThemeChanges();
  }
  /**
   * Get theme colors from CSS custom properties
   */
  _getThemeColors() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return {
      bgPrimary: style.getPropertyValue("--bg-primary").trim() || "#ffffff",
      bgSecondary: style.getPropertyValue("--bg-secondary").trim() || "#f5f5f5",
      borderColor: style.getPropertyValue("--border-color").trim() || "#e0e0e0",
      colorPrimary: style.getPropertyValue("--color-primary").trim() || "#3b82f6",
      textColor: style.getPropertyValue("--text-primary").trim() || "#1f2937",
      textMuted: style.getPropertyValue("--text-muted").trim() || "#6b7280"
    };
  }
  /**
   * Observe theme changes and re-render when theme changes
   */
  _observeThemeChanges() {
    this._themeObserver = new MutationObserver(() => {
      this.themeColors = this._getThemeColors();
      this._render();
    });
    this._themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }
  /**
   * Disconnect the theme observer and remove all canvas event listeners.
   * Call this before discarding the instance (e.g. on SPA page unload).
   */
  destroy() {
    if (this._themeObserver) {
      this._themeObserver.disconnect();
      this._themeObserver = null;
    }
  }
  /**
   * Convert screen coordinates to world coordinates
   */
  _screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    return {
      x: (canvasX - this.transform.x) / this.transform.scale,
      y: (canvasY - this.transform.y) / this.transform.scale
    };
  }
  /**
   * Convert client coordinates to canvas-local coordinates
   */
  _clientToCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }
  /**
   * Generate hex grid data
   */
  _generateGrid() {
    this.hexes.clear();
    for (let r = 0; r < this.height; r++) {
      const qOffset = Math.floor(r / 2);
      for (let q = -qOffset; q < this.width - qOffset; q++) {
        const pixel = hexToPixel(q, r, this.size, this.rotation);
        const hex = {
          q,
          r,
          x: pixel.x,
          y: pixel.y,
          fill: this.themeColors.bgSecondary,
          stroke: this.themeColors.borderColor,
          adjacent: getAdjacentHexes(q, r),
          terrain: null,
          data: {}
        };
        this.hexes.set(`${q},${r}`, hex);
      }
    }
  }
  /**
   * Keep selected hex reference in sync after grid regeneration
   */
  _resyncSelectedHex() {
    if (!this.selectedHex) return;
    this.selectedHex = this.hexes.get(`${this.selectedHex.q},${this.selectedHex.r}`) ?? null;
  }
  /**
   * Render the hex grid on canvas
   */
  _render() {
    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = rect.width || 800;
    const displayHeight = rect.height || 400;
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.ctx.fillStyle = this.themeColors.bgPrimary;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.transform.x, this.transform.y);
    this.ctx.scale(this.transform.scale, this.transform.scale);
    this.hexes.forEach((hex) => {
      this._drawHex(hex);
      if (this.customRenderCallback) {
        this.customRenderCallback(this.ctx, hex, this.size);
      }
    });
    if (this.selectedHex) {
      this._drawHex(this.selectedHex, true);
    }
    this.ctx.restore();
  }
  /**
   * Draw a single hex
   */
  _drawHex(hex, isSelected = false) {
    const corners = getHexCorners(hex.x, hex.y, this.size, this.rotation);
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }
    this.ctx.closePath();
    let fill;
    if (isSelected) {
      fill = this.themeColors.colorPrimary;
    } else if (hex.terrain) {
      fill = getTerrainColor(hex.terrain);
    } else if (hex.fill) {
      fill = hex.fill;
    } else {
      fill = this.themeColors.bgSecondary;
    }
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    const stroke = isSelected ? this.themeColors.colorPrimary : hex.stroke || this.themeColors.borderColor;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = isSelected ? 3 : 1;
    this.ctx.stroke();
    if (isSelected) {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "10px monospace";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(`${hex.q},${hex.r}`, hex.x, hex.y);
    }
  }
  /**
   * Set up mouse/touch events for hex selection, pan, and zoom
   */
  _setupEvents() {
    this.touchState = {
      initialDistance: 0,
      initialScale: 1,
      touches: []
    };
    this.canvas.addEventListener("pointerdown", (e) => {
      this.dragging = true;
      this.hasMoved = false;
      this.lastPos = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = "grabbing";
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const cur = { x: e.clientX, y: e.clientY };
      const dx = cur.x - this.lastPos.x;
      const dy = cur.y - this.lastPos.y;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        this.hasMoved = true;
      }
      this.transform.x += dx;
      this.transform.y += dy;
      this.lastPos = cur;
      this._render();
    });
    const stopDrag = () => {
      this.dragging = false;
      if (!this.hasMoved) {
        this.canvas.style.cursor = "pointer";
      }
    };
    this.canvas.addEventListener("pointerup", stopDrag);
    this.canvas.addEventListener("pointerleave", stopDrag);
    this.canvas.addEventListener("click", (e) => {
      if (this.hasMoved) return;
      const worldPos = this._screenToWorld(e.clientX, e.clientY);
      const hexCoords = pixelToHex(worldPos.x, worldPos.y, this.size, this.rotation);
      const hex = this.hexes.get(`${hexCoords.q},${hexCoords.r}`);
      if (hex) {
        this.selectedHex = hex;
        this._render();
        this._emit("select", hex);
      }
    });
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1 - ZOOM_FACTOR : 1 + ZOOM_FACTOR;
      const newScale = Math.max(ZOOM_MIN, Math.min(this.transform.scale * zoomFactor, ZOOM_MAX));
      const mouse = this._clientToCanvas(e.clientX, e.clientY);
      const scaleDiff = newScale / this.transform.scale;
      this.transform.x = mouse.x - (mouse.x - this.transform.x) * scaleDiff;
      this.transform.y = mouse.y - (mouse.y - this.transform.y) * scaleDiff;
      this.transform.scale = newScale;
      this._render();
      this._emit("zoom", { scale: this.transform.scale });
    }, { passive: false });
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        this.touchState.touches = Array.from(e.touches);
        this.touchState.initialDistance = this._getTouchDistance(e.touches);
        this.touchState.initialScale = this.transform.scale;
      }
    }, { passive: false });
    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = this._getTouchDistance(e.touches);
        const scale = currentDistance / this.touchState.initialDistance * this.touchState.initialScale;
        const newScale = Math.max(ZOOM_MIN, Math.min(scale, ZOOM_MAX));
        const centerClientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerClientY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const center = this._clientToCanvas(centerClientX, centerClientY);
        const scaleDiff = newScale / this.transform.scale;
        this.transform.x = center.x - (center.x - this.transform.x) * scaleDiff;
        this.transform.y = center.y - (center.y - this.transform.y) * scaleDiff;
        this.transform.scale = newScale;
        this._render();
        this._emit("zoom", { scale: this.transform.scale });
      }
    }, { passive: false });
    this.canvas.addEventListener("touchend", () => {
      this.touchState.touches = [];
    });
    this.canvas.addEventListener("mouseenter", () => {
      this.canvas.style.cursor = "grab";
    });
    this.canvas.addEventListener("mouseleave", () => {
      this.canvas.style.cursor = "default";
    });
  }
  /**
   * Calculate distance between two touch points
   * @param {TouchList} touches - Touch list
   * @returns {number} Distance in pixels
   */
  _getTouchDistance(touches) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  /**
   * Set hex size
   */
  setSize(size) {
    this.size = size;
    this._generateGrid();
    this._resyncSelectedHex();
    this._render();
  }
  /**
   * Set grid dimensions
   */
  setDimensions(width, height) {
    this.width = width;
    this.height = height;
    this._generateGrid();
    this._resyncSelectedHex();
    this._render();
  }
  /**
   * Reset grid to defaults
   */
  reset() {
    this.size = 30;
    this.width = 15;
    this.height = 10;
    this.rotation = 0;
    this.selectedHex = null;
    this.transform = { x: 0, y: 0, scale: 1 };
    this._generateGrid();
    this._render();
  }
  /**
   * Fill hexes with random colors
   */
  fillRandom() {
    const colors = ["#f0f0f0", "#d4e5d4", "#e5d4d4", "#d4d4e5", "#e5e5d4", "#d4e5e5", "#e8e8e8", "#d0d0d0"];
    this.hexes.forEach((hex) => {
      hex.fill = colors[Math.floor(Math.random() * colors.length)];
    });
    this._render();
  }
  /**
   * Get hex by coordinates
   */
  getHex(q, r) {
    return this.hexes.get(`${q},${r}`);
  }
  /**
   * Get all hexes
   */
  getAllHexes() {
    return Array.from(this.hexes.values());
  }
  /**
   * Set hex fill color
   */
  setHexFill(q, r, color) {
    const hex = this.hexes.get(`${q},${r}`);
    if (hex) {
      hex.fill = color;
      this._render();
    }
  }
  /**
   * Reset view to default position
   */
  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    this._render();
    this._emit("pan", { x: 0, y: 0 });
    this._emit("zoom", { scale: 1 });
  }
  /**
   * Zoom in
   */
  zoomIn() {
    const newScale = Math.min(this.transform.scale * (1 + ZOOM_FACTOR), ZOOM_MAX);
    this.transform.scale = newScale;
    this._render();
    this._emit("zoom", { scale: this.transform.scale });
  }
  /**
   * Zoom out
   */
  zoomOut() {
    const newScale = Math.max(this.transform.scale * (1 - ZOOM_FACTOR), ZOOM_MIN);
    this.transform.scale = newScale;
    this._render();
    this._emit("zoom", { scale: this.transform.scale });
  }
  /**
   * Get current transform state
   */
  getTransform() {
    return { ...this.transform };
  }
  /**
   * Subscribe to events
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  /**
   * Emit events
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
  // ═══════════════════════════════════════════════════════
  // Terrain System
  // ═══════════════════════════════════════════════════════
  /**
   * Set terrain type for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @param {string} terrainType - Terrain type (e.g., 'GRASSLAND', 'OCEAN')
   */
  setHexTerrain(q, r, terrainType) {
    const hex = this.hexes.get(`${q},${r}`);
    if (hex) {
      hex.terrain = terrainType;
      this._render();
    }
  }
  /**
   * Get terrain type for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {string|null} Terrain type or null
   */
  getHexTerrain(q, r) {
    const hex = this.hexes.get(`${q},${r}`);
    return hex ? hex.terrain : null;
  }
  /**
   * Generate random terrain for all hexes
   */
  generateRandomTerrain() {
    const terrainTypes = Object.values(TerrainType);
    this.hexes.forEach((hex) => {
      hex.terrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
    });
    this._render();
  }
  /**
   * Get terrain yields for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {Object} Yields object {food, production, gold}
   */
  getHexYields(q, r) {
    const terrain = this.getHexTerrain(q, r);
    return terrain ? getTerrainYields(terrain) : { food: 0, production: 0, gold: 0 };
  }
  /**
   * Get movement cost for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {number} Movement cost
   */
  getHexMovementCost(q, r) {
    const terrain = this.getHexTerrain(q, r);
    return terrain ? getMovementCost(terrain) : 999;
  }
  /**
   * Check if hex is passable
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {boolean} True if passable
   */
  isHexPassable(q, r) {
    const terrain = this.getHexTerrain(q, r);
    return terrain ? isPassable(terrain) : false;
  }
  // ═══════════════════════════════════════════════════════
  // Hex Data Attachment
  // ═══════════════════════════════════════════════════════
  /**
   * Set custom data for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @param {Object} data - Custom data object
   */
  setHexData(q, r, data) {
    const hex = this.hexes.get(`${q},${r}`);
    if (hex) {
      hex.data = { ...hex.data, ...data };
    }
  }
  /**
   * Get custom data for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {Object} Custom data object
   */
  getHexData(q, r) {
    const hex = this.hexes.get(`${q},${r}`);
    return hex ? hex.data : {};
  }
  /**
   * Clear custom data for a hex
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   */
  clearHexData(q, r) {
    const hex = this.hexes.get(`${q},${r}`);
    if (hex) {
      hex.data = {};
    }
  }
  // ═══════════════════════════════════════════════════════
  // Distance & Pathfinding
  // ═══════════════════════════════════════════════════════
  /**
   * Calculate distance between two hexes
   * @param {number} q1 - First hex q coordinate
   * @param {number} r1 - First hex r coordinate
   * @param {number} q2 - Second hex q coordinate
   * @param {number} r2 - Second hex r coordinate
   * @returns {number} Distance in hex steps
   */
  hexDistance(q1, r1, q2, r2) {
    return hexDistance(q1, r1, q2, r2);
  }
  /**
   * Get valid moves from a hex within movement points
   * @param {number} q - Starting hex column
   * @param {number} r - Starting hex row
   * @param {number} movementPoints - Available movement points
   * @returns {Array<{q: number, r: number}>} Array of valid hex coordinates
   */
  getValidMoves(q, r, movementPoints) {
    const validHexes = [];
    const adjacent = getAdjacentHexes(q, r);
    for (const hex of adjacent) {
      if (!this.hexes.has(`${hex.q},${hex.r}`)) continue;
      const cost = this.getHexMovementCost(hex.q, hex.r);
      if (cost < 999 && movementPoints >= cost) {
        validHexes.push(hex);
      }
    }
    return validHexes;
  }
  /**
   * Get path between two hexes (simple BFS)
   * @param {number} startQ - Starting hex column
   * @param {number} startR - Starting hex row
   * @param {number} endQ - Ending hex column
   * @param {number} endR - Ending hex row
   * @returns {Array<{q: number, r: number}>} Array of hex coordinates forming path
   */
  getPath(startQ, startR, endQ, endR) {
    const startKey = `${startQ},${startR}`;
    const endKey = `${endQ},${endR}`;
    if (!this.hexes.has(startKey) || !this.hexes.has(endKey)) {
      return [];
    }
    const queue = [[startQ, startR]];
    const visited = /* @__PURE__ */ new Set([startKey]);
    const parent = /* @__PURE__ */ new Map();
    while (queue.length > 0) {
      const [currentQ, currentR] = queue.shift();
      const currentKey = `${currentQ},${currentR}`;
      if (currentKey === endKey) {
        const path = [];
        let key = endKey;
        while (key) {
          const [q, r] = key.split(",").map(Number);
          path.unshift({ q, r });
          key = parent.get(key);
        }
        return path;
      }
      const adjacent = getAdjacentHexes(currentQ, currentR);
      for (const neighbor of adjacent) {
        const neighborKey = `${neighbor.q},${neighbor.r}`;
        if (this.hexes.has(neighborKey) && !visited.has(neighborKey)) {
          if (this.isHexPassable(neighbor.q, neighbor.r)) {
            visited.add(neighborKey);
            parent.set(neighborKey, currentKey);
            queue.push([neighbor.q, neighbor.r]);
          }
        }
      }
    }
    return [];
  }
  // ═══════════════════════════════════════════════════════
  // Grid Rotation
  // ═══════════════════════════════════════════════════════
  /**
   * Set grid rotation
   * @param {number} rotation - Rotation in radians
   */
  setRotation(rotation) {
    this.rotation = rotation;
    this._generateGrid();
    this._resyncSelectedHex();
    this._render();
  }
  /**
   * Get current grid rotation
   * @returns {number} Rotation in radians
   */
  getRotation() {
    return this.rotation;
  }
  // ═══════════════════════════════════════════════════════
  // Custom Rendering
  // ═══════════════════════════════════════════════════════
  /**
   * Set custom render callback for each hex
   * @param {function} callback - Called with (ctx, hex, size) for each hex
   */
  setCustomRender(callback) {
    this.customRenderCallback = callback;
    this._render();
  }
  /**
   * Clear custom render callback
   */
  clearCustomRender() {
    this.customRenderCallback = null;
    this._render();
  }
  // ═══════════════════════════════════════════════════════
  // Utility Methods
  // ═══════════════════════════════════════════════════════
  /**
   * Check if hex exists at coordinates
   * @param {number} q - Hex column
   * @param {number} r - Hex row
   * @returns {boolean}
   */
  hasHex(q, r) {
    return this.hexes.has(`${q},${r}`);
  }
  /**
   * Get hex count
   * @returns {number} Number of hexes in grid
   */
  getHexCount() {
    return this.hexes.size;
  }
  /**
   * Export terrain data as JSON
   * @returns {Object} Terrain data object
   */
  exportTerrainData() {
    const data = {};
    this.hexes.forEach((hex, key) => {
      if (hex.terrain) {
        data[key] = hex.terrain;
      }
    });
    return data;
  }
  /**
   * Import terrain data from JSON
   * @param {Object} data - Terrain data object
   */
  importTerrainData(data) {
    Object.entries(data).forEach(([key, terrain]) => {
      const hex = this.hexes.get(key);
      if (hex) hex.terrain = terrain;
    });
    this._render();
  }
};
export {
  DEFAULT_TERRAIN_COLOR,
  TERRAIN_COLORS,
  TERRAIN_MOVEMENT_COSTS,
  TERRAIN_YIELDS,
  TerrainType,
  VdHexGrid,
  axialRound,
  getAdjacentHexes,
  getHexCorners,
  getMovementCost,
  getTerrainColor,
  getTerrainYields,
  hexDistance,
  hexToPixel,
  isPassable,
  pixelToHex,
  rotatePoint,
  unrotatePoint
};
//# sourceMappingURL=index.js.map
