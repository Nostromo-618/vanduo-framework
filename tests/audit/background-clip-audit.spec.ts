import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  auditElement,
  CONTROL_IDS,
  formatAuditTable,
  type AuditResult,
} from './background-clip-audit';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const auditIds = [
  'vd-input',
  'vd-textarea',
  'vd-select',
  'vd-input-group-prefix',
  'vd-dropdown-menu',
  'vd-toast',
  'vd-pagination-link',
  'vd-collapsible-item',
  'vd-code-snippet',
  'vd-collection-bordered',
  'vd-tabs-bordered-active',
  'vd-alert-primary',
  'vd-draggable',
  'vd-modal-content',
  'vd-btn-primary',
] as const;

test.describe('Background clip audit @audit', () => {
  test('reports corner bleed risk across component surfaces', async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.includes('Desktop'),
      'Corner pixel audit uses a desktop fixture grid and runs on desktop projects only',
    );
    await page.goto('/tests/fixtures/background-clip-audit.html');
    await page.waitForSelector('[data-audit-id]');

    const parentRgb = await page.evaluate(() => {
      const body = document.body;
      const style = getComputedStyle(body);
      const match = style.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) {
        return [33, 37, 41] as [number, number, number];
      }
      return [Number(match[1]), Number(match[2]), Number(match[3])] as [
        number,
        number,
        number,
      ];
    });

    const results: AuditResult[] = [];
    for (const id of auditIds) {
      results.push(await auditElement(page, id, parentRgb));
    }

    const report = {
      generatedAt: new Date().toISOString(),
      dataRadius: await page.evaluate(() => document.documentElement.dataset.radius ?? ''),
      theme: await page.evaluate(() => document.documentElement.dataset.theme ?? ''),
      parentRgb,
      results: results.map((result) => ({
        id: result.id,
        isControl: result.isControl,
        isNegativeControl: result.isNegativeControl,
        styleRisk: result.styleRisk,
        visualBleed: result.visualBleed,
        backgroundClip: result.styleMetrics.backgroundClip,
        borderTopLeftRadius: result.styleMetrics.borderTopLeftRadius,
        backgroundColor: result.styleMetrics.backgroundColor,
        borderTopColor: result.styleMetrics.borderTopColor,
        cornerSamples: result.cornerSamples,
      })),
    };

    const outputDir = path.join(projectRoot, 'test-results');
    mkdirSync(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, 'background-clip-audit.json');
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    console.log('\nBackground clip audit results:\n');
    console.log(formatAuditTable(results));
    console.log(`\nReport written to ${reportPath}\n`);

    for (const controlId of CONTROL_IDS) {
      const control = results.find((result) => result.id === controlId);
      expect(control, `missing control ${controlId}`).toBeTruthy();
      expect(control!.styleMetrics.backgroundClip).toBe('padding-box');
      expect(control!.visualBleed).toBe(false);
    }

    const negativeControl = results.find((result) => result.id === 'vd-btn-primary');
    expect(negativeControl?.visualBleed).toBe(false);

    const confirmedBleed = results.filter(
      (result) => !result.isControl && !result.isNegativeControl && result.visualBleed,
    );

    if (confirmedBleed.length > 0) {
      console.log(
        `Confirmed visual bleed: ${confirmedBleed.map((result) => result.id).join(', ')}`,
      );
    }
  });
});
