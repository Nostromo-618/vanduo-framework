#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const cssDir = path.join(rootDir, 'css');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push(fullPath);
    }
  });
  return files;
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}

function getLayer(relativePath) {
  const firstSegment = relativePath.split(path.sep)[0];
  return firstSegment || 'root';
}

const files = walk(cssDir)
  .map((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(rootDir, filePath);
    const lineCount = content.split('\n').length;
    const byteSize = Buffer.byteLength(content);

    return {
      relativePath,
      layer: getLayer(path.relative(cssDir, filePath)),
      lineCount,
      byteSize,
    };
  })
  .sort((a, b) => b.lineCount - a.lineCount);

const totalLines = files.reduce((sum, file) => sum + file.lineCount, 0);
const totalBytes = files.reduce((sum, file) => sum + file.byteSize, 0);
const byLayer = files.reduce((acc, file) => {
  const current = acc.get(file.layer) || { lineCount: 0, byteSize: 0, files: 0 };
  current.lineCount += file.lineCount;
  current.byteSize += file.byteSize;
  current.files += 1;
  acc.set(file.layer, current);
  return acc;
}, new Map());

console.log('Vanduo CSS Inventory');
console.log('====================');
console.log(`Files: ${files.length}`);
console.log(`Total lines: ${totalLines}`);
console.log(`Total size: ${formatBytes(totalBytes)}`);
console.log('');
console.log('By layer');
console.log('--------');

Array.from(byLayer.entries())
  .sort((a, b) => b[1].lineCount - a[1].lineCount)
  .forEach(([layer, stats]) => {
    console.log(
      `${layer.padEnd(12)} ${String(stats.files).padStart(3)} files  ${String(stats.lineCount).padStart(6)} lines  ${formatBytes(stats.byteSize)}`
    );
  });

console.log('');
console.log('Top files');
console.log('---------');

files.slice(0, 15).forEach((file) => {
  console.log(
    `${String(file.lineCount).padStart(6)} lines  ${formatBytes(file.byteSize).padStart(8)}  ${file.relativePath}`
  );
});
