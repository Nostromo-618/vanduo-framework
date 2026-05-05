# @vanduo-oss/hex-grid

Standalone `VdHexGrid` package for canvas-based hex grids in Vanduo projects.

## Install

```bash
pnpm add @vanduo-oss/hex-grid
```

## Usage

```js
import { VdHexGrid } from '@vanduo-oss/hex-grid';

const grid = new VdHexGrid({
  element: document.getElementById('hex-demo-container'),
  canvas: document.getElementById('hex-demo'),
  size: 30,
  width: 15,
  height: 10,
  rotation: 0
});
```

## Optional Utility Import

```js
import { hexToPixel, pixelToHex, hexDistance } from '@vanduo-oss/hex-grid/hex-math';
```

## Notes

- `VdHexGrid` is intentionally split from `@vanduo-oss/framework` so core UI consumers do not have to depend on niche canvas APIs.
- Framework docs and Labs demos may still include mirrors for local experimentation, but package consumers should use `@vanduo-oss/hex-grid`.
