import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tokenPattern = /--(?!vd-)[A-Za-z][A-Za-z0-9-]*/g;
const scannedExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.md', '.ts', '.txt']);
const scannedTargets = [
  'ARCHITECTURE.md',
  'README.md',
  'TOKENS.md',
  'css',
  'dist',
  'js',
  'llms.txt',
  'tests',
];
const shellCommandPattern = /^\s*(corepack|git|node|npm|npx|playwright|pnpm)\b/;

function collectFiles(target: string, files: string[] = []): string[] {
  const absoluteTarget = path.join(projectRoot, target);
  if (!existsSync(absoluteTarget)) return files;

  const stats = statSync(absoluteTarget);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(absoluteTarget)) {
      if (entry === 'node_modules' || entry === 'playwright-report' || entry === 'test-results') {
        continue;
      }
      collectFiles(path.join(target, entry), files);
    }
    return files;
  }

  if (scannedExtensions.has(path.extname(absoluteTarget))) {
    files.push(absoluteTarget);
  }
  return files;
}

function isAllowedCommandLine(filePath: string, line: string): boolean {
  const extension = path.extname(filePath);
  return (extension === '.md' || extension === '.txt') && shellCommandPattern.test(line);
}

test.describe('Design Token Prefix Contract @unit', () => {
  test('shipped custom properties use the vd namespace', () => {
    const offenders: string[] = [];

    for (const target of scannedTargets) {
      for (const filePath of collectFiles(target)) {
        const relativePath = path.relative(projectRoot, filePath);
        const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

        lines.forEach((line, index) => {
          if (isAllowedCommandLine(filePath, line)) return;

          for (const match of line.matchAll(tokenPattern)) {
            offenders.push(`${relativePath}:${index + 1}: ${match[0]}`);
          }
        });
      }
    }

    expect(
      offenders,
      `Found custom properties outside the --vd-* namespace:\n${offenders.slice(0, 80).join('\n')}`,
    ).toEqual([]);
  });
});
