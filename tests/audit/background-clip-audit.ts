import { inflateSync } from 'node:zlib';
import type { Locator, Page } from '@playwright/test';

export const CONTROL_IDS = ['vd-draggable', 'vd-modal-content'] as const;
export const NEGATIVE_CONTROL_IDS = ['vd-btn-primary'] as const;

export interface StyleMetrics {
  backgroundClip: string;
  backgroundColor: string;
  borderTopColor: string;
  borderTopWidth: number;
  borderTopStyle: string;
  borderTopLeftRadius: number;
  backgroundRgb: [number, number, number, number];
  borderRgb: [number, number, number, number];
}

export interface AuditResult {
  id: string;
  isControl: boolean;
  isNegativeControl: boolean;
  styleMetrics: StyleMetrics;
  styleRisk: boolean;
  visualBleed: boolean | null;
  cornerSamples: Array<{
    corner: string;
    rgb: [number, number, number];
    closerToFill: boolean;
  }>;
}

export async function readStyleMetrics(locator: Locator): Promise<StyleMetrics> {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);

    function parseCssColor(color: string): [number, number, number, number] {
      if (!color || color === 'transparent') {
        return [0, 0, 0, 0];
      }

      const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgba) {
        return [
          Number(rgba[1]),
          Number(rgba[2]),
          Number(rgba[3]),
          rgba[4] ? Math.round(Number(rgba[4]) * 255) : 255,
        ];
      }

      return [0, 0, 0, 255];
    }

    return {
      backgroundClip: style.backgroundClip,
      backgroundColor: style.backgroundColor,
      borderTopColor: style.borderTopColor,
      borderTopWidth: Number.parseFloat(style.borderTopWidth) || 0,
      borderTopStyle: style.borderTopStyle,
      borderTopLeftRadius: Number.parseFloat(style.borderTopLeftRadius) || 0,
      backgroundRgb: parseCssColor(style.backgroundColor),
      borderRgb: parseCssColor(style.borderTopColor),
    };
  });
}

export function evaluateStyleRisk(metrics: StyleMetrics): boolean {
  if (metrics.backgroundClip === 'padding-box') {
    return false;
  }

  if (metrics.backgroundRgb[3] < 242) {
    return false;
  }

  if (metrics.borderTopWidth <= 0 || metrics.borderTopStyle === 'none') {
    return false;
  }

  if (metrics.borderTopLeftRadius < 6) {
    return false;
  }

  const borderMatchesFill =
    metrics.backgroundRgb[0] === metrics.borderRgb[0] &&
    metrics.backgroundRgb[1] === metrics.borderRgb[1] &&
    metrics.backgroundRgb[2] === metrics.borderRgb[2];

  return !borderMatchesFill;
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export function decodePngRgba(buffer: Buffer): {
  width: number;
  height: number;
  data: Uint8Array;
} {
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    throw new Error('Invalid PNG signature');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length;
  }

  if (colorType !== 2 && colorType !== 6) {
    throw new Error(`Unsupported PNG color type: ${colorType}`);
  }

  const inflated = inflateSync(Buffer.concat(idatChunks));
  const sourceBytesPerPixel = colorType === 6 ? 4 : 3;
  const rowSize = width * sourceBytesPerPixel;
  const pixels = new Uint8Array(width * height * 4);
  let sourceOffset = 0;
  let priorRow = Buffer.alloc(rowSize);

  for (let y = 0; y < height; y += 1) {
    const filterType = inflated[sourceOffset];
    sourceOffset += 1;
    const row = inflated.subarray(sourceOffset, sourceOffset + rowSize);
    sourceOffset += rowSize;
    const reconstructed = Buffer.alloc(rowSize);

    for (let i = 0; i < rowSize; i += 1) {
      const left = i >= sourceBytesPerPixel ? reconstructed[i - sourceBytesPerPixel] : 0;
      const up = priorRow[i];
      const upLeft = i >= sourceBytesPerPixel ? priorRow[i - sourceBytesPerPixel] : 0;
      let value = row[i];

      switch (filterType) {
        case 1:
          value = (value + left) & 0xff;
          break;
        case 2:
          value = (value + up) & 0xff;
          break;
        case 3:
          value = (value + Math.floor((left + up) / 2)) & 0xff;
          break;
        case 4:
          value = (value + paethPredictor(left, up, upLeft)) & 0xff;
          break;
        default:
          break;
      }

      reconstructed[i] = value;
    }

    const rgbaRow = new Uint8Array(width * 4);
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = x * sourceBytesPerPixel;
      const targetIndex = x * 4;
      rgbaRow[targetIndex] = reconstructed[sourceIndex];
      rgbaRow[targetIndex + 1] = reconstructed[sourceIndex + 1];
      rgbaRow[targetIndex + 2] = reconstructed[sourceIndex + 2];
      rgbaRow[targetIndex + 3] = colorType === 6 ? reconstructed[sourceIndex + 3] : 255;
    }

    pixels.set(rgbaRow, y * width * 4);
    priorRow = reconstructed;
  }

  return { width, height, data: pixels };
}

function colorDistance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function getPixel(
  data: Uint8Array,
  width: number,
  x: number,
  y: number,
): [number, number, number] {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2]];
}

export function detectVisualBleedFromScreenshot(
  pngBuffer: Buffer,
  metrics: StyleMetrics,
  parentRgb: [number, number, number],
): {
  visualBleed: boolean;
  cornerSamples: AuditResult['cornerSamples'];
} {
  const { width, height, data } = decodePngRgba(pngBuffer);
  const fillRgb: [number, number, number] = [
    metrics.backgroundRgb[0],
    metrics.backgroundRgb[1],
    metrics.backgroundRgb[2],
  ];
  const borderRgb: [number, number, number] = [
    metrics.borderRgb[0],
    metrics.borderRgb[1],
    metrics.borderRgb[2],
  ];

  const samplePoints: Array<{ corner: string; x: number; y: number }> = [
    { corner: 'top-left', x: 1, y: 1 },
    { corner: 'top-right', x: width - 2, y: 1 },
    { corner: 'bottom-left', x: 1, y: height - 2 },
    { corner: 'bottom-right', x: width - 2, y: height - 2 },
  ];

  const cornerSamples = samplePoints.map(({ corner, x, y }) => {
    const rgb = getPixel(data, width, Math.max(0, x), Math.max(0, y));
    const distanceToFill = colorDistance(rgb, fillRgb);
    const distanceToParent = colorDistance(rgb, parentRgb);
    const distanceToBorder = colorDistance(rgb, borderRgb);
    const closerToFill =
      distanceToFill + 4 < distanceToParent &&
      distanceToFill + 2 < distanceToBorder;

    return { corner, rgb, closerToFill };
  });

  const bleedCorners = cornerSamples.filter((sample) => sample.closerToFill).length;
  return {
    visualBleed: bleedCorners >= 2,
    cornerSamples,
  };
}

export async function auditElement(
  page: Page,
  id: string,
  parentRgb: [number, number, number],
): Promise<AuditResult> {
  const locator = page.locator(`[data-audit-id="${id}"]`);
  const styleMetrics = await readStyleMetrics(locator);
  const styleRisk = evaluateStyleRisk(styleMetrics);
  const isControl = CONTROL_IDS.includes(id as (typeof CONTROL_IDS)[number]);
  const isNegativeControl = NEGATIVE_CONTROL_IDS.includes(
    id as (typeof NEGATIVE_CONTROL_IDS)[number],
  );

  if (!styleRisk) {
    return {
      id,
      isControl,
      isNegativeControl,
      styleMetrics,
      styleRisk,
      visualBleed: false,
      cornerSamples: [],
    };
  }

  const box = await locator.boundingBox();
  if (!box || box.width < 4 || box.height < 4) {
    return {
      id,
      isControl,
      isNegativeControl,
      styleMetrics,
      styleRisk,
      visualBleed: null,
      cornerSamples: [],
    };
  }

  const pngBuffer = await page.screenshot({
    clip: {
      x: box.x,
      y: box.y,
      width: Math.ceil(box.width),
      height: Math.ceil(box.height),
    },
  });

  const { visualBleed, cornerSamples } = detectVisualBleedFromScreenshot(
    pngBuffer,
    styleMetrics,
    parentRgb,
  );

  return {
    id,
    isControl,
    isNegativeControl,
    styleMetrics,
    styleRisk,
    visualBleed,
    cornerSamples,
  };
}

export function formatAuditTable(results: AuditResult[]): string {
  const header = ['id', 'styleRisk', 'visualBleed', 'backgroundClip', 'radius'];
  const rows = results.map((result) => [
    result.id,
    String(result.styleRisk),
    String(result.visualBleed),
    result.styleMetrics.backgroundClip,
    String(result.styleMetrics.borderTopLeftRadius),
  ]);

  const widths = header.map((cell, index) =>
    Math.max(cell.length, ...rows.map((row) => row[index].length)),
  );

  const formatRow = (cells: string[]) =>
    cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');

  return [formatRow(header), formatRow(widths.map((w) => '-'.repeat(w))), ...rows.map(formatRow)].join('\n');
}
