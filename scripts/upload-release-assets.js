#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const PKG_PATH = path.join(ROOT, 'package.json');

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const explicitTag = args.find((arg) => arg.startsWith('--tag='))?.slice(6);
const positionalTag = args.find((arg) => !arg.startsWith('--')) || null;
const dryRun = args.includes('--dry-run');

const packageJson = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
const fallbackTag = `v${packageJson.version}`;
const tag = explicitTag || positionalTag || process.env.RELEASE_TAG || fallbackTag;

const allowedNames = new Set([
  'build-info.json',
  'vanduo.css',
  'vanduo.css.map',
  'vanduo.min.css',
  'vanduo.min.css.map',
  'vanduo.js',
  'vanduo.js.map',
  'vanduo.min.js',
  'vanduo.min.js.map',
  'vanduo.esm.js',
  'vanduo.esm.js.map',
  'vanduo.esm.min.js',
  'vanduo.esm.min.js.map',
  'vanduo.cjs.js',
  'vanduo.cjs.js.map',
  'vanduo.cjs.min.js',
  'vanduo.cjs.min.js.map'
]);

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist/ directory not found. Run `pnpm build` first.');
  process.exit(1);
}

const selectedAssets = fs
  .readdirSync(DIST_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => allowedNames.has(name))
  .sort();

if (selectedAssets.length === 0) {
  console.error('No allowed dist assets found to upload.');
  process.exit(1);
}

const hasAllExpected = [...allowedNames].every((name) => selectedAssets.includes(name));
if (!hasAllExpected) {
  const missing = [...allowedNames].filter((name) => !selectedAssets.includes(name));
  console.error(`Missing expected assets in dist/: ${missing.join(', ')}`);
  process.exit(1);
}

const assetPaths = selectedAssets.map((name) => path.join('dist', name));

if (dryRun) {
  console.log(`Release tag: ${tag}`);
  console.log('Assets to upload:');
  assetPaths.forEach((assetPath) => console.log(`- ${assetPath}`));
  process.exit(0);
}

execFileSync('gh', ['release', 'upload', tag, ...assetPaths, '--clobber'], {
  stdio: 'inherit'
});

console.log(`Uploaded ${assetPaths.length} assets to release ${tag}.`);
