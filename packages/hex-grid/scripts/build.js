import * as esbuild from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

function resetDistDirectory() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
}

async function buildEntry(inputFile, baseName, format) {
  await esbuild.build({
    entryPoints: [resolve(rootDir, 'src', inputFile)],
    outfile: resolve(distDir, `${baseName}.${format === 'esm' ? 'js' : 'cjs'}`),
    bundle: true,
    format,
    minify: false,
    sourcemap: true,
    target: ['es2020'],
    logLevel: 'warning'
  });
}

async function build() {
  resetDistDirectory();
  await buildEntry('index.js', 'index', 'esm');
  await buildEntry('index.js', 'index', 'cjs');
  await buildEntry('hex-math.js', 'hex-math', 'esm');
  await buildEntry('hex-math.js', 'hex-math', 'cjs');
  console.log('Built @vanduo-oss/hex-grid dist artifacts.');
}

build();
