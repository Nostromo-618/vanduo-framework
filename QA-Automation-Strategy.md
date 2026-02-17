# QA Automation Strategy for Vanduo Framework

> **Document Version:** 2.1
> **Created:** 2026-02-01
> **Framework:** Playwright Test (ONLY)
> **Target Browsers:** Chromium, Firefox, WebKit

> 🚫 **Visual pixel-comparison tests are currently NOT run** (removed per project direction)

---

## ⚠️ SINGLE DEPENDENCY PHILOSOPHY

**This strategy mandates a single automated testing framework dependency: `@playwright/test`**

The Vanduo Framework is built on zero-dependency principles for runtime usage. Our testing strategy follows the same philosophy for the test runner:

| Requirement | Solution | Dependency |
|-------------|----------|------------|
| Test Runner | Playwright Test | `@playwright/test` |
| Browser Testing | Playwright | `@playwright/test` |
| Visual Regression | ~~`toHaveScreenshot()`~~ (not currently run) | N/A |
| Accessibility | `page.evaluate()` + ARIA assertions | `@playwright/test` |
| Unit-level Tests | `page.evaluate()` | `@playwright/test` |
| Performance | Performance API via `page.evaluate()` | `@playwright/test` |
| Mobile/Tablet | Device emulation | `@playwright/test` |
| Local Server | Python/Node built-in HTTP | None |

> ⚠️ **Note:** Visual/pixel-comparison tests have been removed from the test suite as per project direction. Testing focuses on functional behavior, ARIA attributes, and DOM state rather than screenshot comparisons.

**Total test framework dependencies: 1 (one)** (`@playwright/test`). Other dev tooling such as ESLint, Stylelint, and the build pipeline are outside the scope of this testing dependency count.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Architecture Overview](#test-architecture-overview)
4. [Browser and Viewport Configuration](#browser-and-viewport-configuration)
5. [Test Categories](#test-categories)
6. [Component Testing Matrix](#component-testing-matrix)
7. [Directory Structure](#directory-structure)
8. [Configuration](#configuration)
9. [CI/CD Integration](#cicd-integration)
10. [Implementation Phases](#implementation-phases)
11. [Best Practices](#best-practices)

---

## Executive Summary

This document outlines a comprehensive QA automation strategy for the **Vanduo Framework** using **only Playwright Test** as the testing framework. No additional test libraries are required.

### Key Objectives

- Ensure cross-browser compatibility (Chromium, Firefox, WebKit)
- Validate responsive design (Desktop, Mobile, Tablet)
- Maintain visual consistency via DOM/state checks (no screenshots)
- Verify accessibility compliance with WCAG 2.1 AA
- Test all JavaScript component interactions
- Keep dependencies minimal (Playwright only)

### Priority Matrix

| Priority | Viewport | Rationale |
|----------|----------|-----------|
| P0 | Desktop (1920×1080) | Primary user base |
| P0 | Mobile (375×812) | Critical for responsive framework |
| P1 | Tablet (768×1024) | Secondary breakpoint |

---

## Testing Philosophy

### Core Principles

1. **Minimal Dependencies** - One test framework: Playwright
2. **Test User Behavior** - Focus on what users experience
3. **Cross-Browser Parity** - Consistent behavior across all engines
4. **Accessibility-First** - Every component tested for a11y
5. **Visual Consistency** - DOM/state assertions (no screenshots)
6. **Responsive by Default** - All tests run across viewports

---

## Test Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Playwright Test Suite                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Unit       │  │  Component   │  │ Integration  │          │
│  │   Tests      │  │    Tests     │  │    Tests     │          │
│  │              │  │              │  │              │          │
│  │ page.eval()  │  │ Click/Type   │  │ Multi-comp   │          │
│  │ JS functions │  │ Assertions   │  │ Interactions │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Visual     │  │    E2E       │  │Accessibility │          │
│  │ (disabled)   │  │    Tests     │  │    Tests     │          │
│  │              │  │              │  │              │          │
│  │ Not run      │  │ User flows   │  │ ARIA checks  │          │
│  │              │  │ Doc site     │  │ Focus mgmt   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Engines                              │
│                                                                 │
│     Chromium          Firefox           WebKit                  │
│     (Desktop)         (Desktop)         (Desktop)               │
│     (Mobile)          (Mobile)          (Mobile)                │
│     (Tablet)          (Tablet)          (Tablet)                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Browser and Viewport Configuration

### Supported Browsers

| Browser | Engine | Version Policy |
|---------|--------|----------------|
| Chrome | Chromium | Last 2 versions |
| Firefox | Gecko | Last 2 versions |
| Safari | WebKit | Last 2 versions |
| Edge | Chromium | (covered by Chromium) |

### Viewport Definitions

```typescript
// Defined directly in playwright.config.ts
const viewports = {
  desktop: { width: 1920, height: 1080 },
  desktopSmall: { width: 1366, height: 768 },
  mobile: { width: 375, height: 812, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, isMobile: true, hasTouch: true },
};
```

### Test Matrix

|                 | Chromium | Firefox | WebKit |
|-----------------|:--------:|:-------:|:------:|
| Desktop         |    ✅    |    ✅   |   ✅   |
| Mobile          |    ✅    |    ✅   |   ✅   |
| Tablet          |    ✅    |    ◐    |   ✅   |

**Legend:** ✅ = Full suite | ◐ = Smoke tests

---

## Test Categories

### 1. Unit-Level Tests (via page.evaluate)

Test pure JavaScript functions by evaluating them in the browser context.

```typescript
// tests/unit/helpers.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Utility Helpers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/helpers.html');
  });

  test('debounce delays function execution', async ({ page }) => {
    const result = await page.evaluate(async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debounced = window.debounce(fn, 50);
      
      debounced();
      debounced();
      debounced();
      
      // Immediate check
      const beforeWait = callCount;
      
      // Wait for debounce
      await new Promise(r => setTimeout(r, 100));
      const afterWait = callCount;
      
      return { beforeWait, afterWait };
    });
    
    expect(result.beforeWait).toBe(0);
    expect(result.afterWait).toBe(1);
  });

  test('escapeHtml prevents XSS', async ({ page }) => {
    const result = await page.evaluate(() => {
      return window.escapeHtml('<script>alert("xss")</script>');
    });
    
    expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });
});
```

### 2. Component Tests

Test individual component behavior in isolation.

```typescript
// tests/components/modals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Modal Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/modals.html');
  });

  test('initializes with ARIA attributes', async ({ page }) => {
    const modal = page.locator('#test-modal');
    
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-hidden', 'true');
  });

  test('opens via trigger click', async ({ page }) => {
    await page.click('[data-modal="#test-modal"]');
    
    const modal = page.locator('#test-modal');
    await expect(modal).toHaveClass(/is-open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'false');
  });

  test('closes on ESC key', async ({ page }) => {
    await page.click('[data-modal="#test-modal"]');
    await page.keyboard.press('Escape');
    
    await expect(page.locator('#test-modal')).not.toHaveClass(/is-open/);
  });

  test('closes on backdrop click', async ({ page }) => {
    await page.click('[data-modal="#test-modal"]');
    await page.locator('.vd-modal-backdrop').click();
    
    await expect(page.locator('#test-modal')).not.toHaveClass(/is-open/);
  });

  test('traps focus within modal', async ({ page }) => {
    await page.click('[data-modal="#test-modal"]');
    
    // Get all focusable elements
    const focusableCount = await page.evaluate(() => {
      const modal = document.querySelector('#test-modal');
      const focusable = modal?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return focusable?.length || 0;
    });
    
    // Tab through and verify focus stays in modal
    for (let i = 0; i < focusableCount + 1; i++) {
      await page.keyboard.press('Tab');
    }
    
    const isInModal = await page.evaluate(() => {
      return document.activeElement?.closest('#test-modal') !== null;
    });
    
    expect(isInModal).toBe(true);
  });
});
```

### 3. Visual Regression Tests (Disabled)

Screenshot-based visual regression is currently disabled. Visual checks are done via DOM/state assertions only.

### 4. Accessibility Tests

Test ARIA attributes and keyboard navigation manually without external libraries.

```typescript
// tests/a11y/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accessibility @a11y', () => {
  test('modal has correct ARIA structure', async ({ page }) => {
    await page.goto('/tests/fixtures/modals.html');
    
    const modal = page.locator('#test-modal');
    
    // Check ARIA attributes
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-labelledby');
    
    // Verify aria-labelledby points to a valid element
    const labelledby = await modal.getAttribute('aria-labelledby');
    if (labelledby) {
      const label = page.locator(`#${labelledby}`);
      await expect(label).toBeVisible();
    }
  });

  test('dropdown has keyboard navigation', async ({ page }) => {
    await page.goto('/tests/fixtures/dropdown.html');
    
    const toggle = page.locator('.vd-dropdown-toggle');
    const menu = page.locator('.vd-dropdown-menu');
    
    // Check ARIA attributes
    await expect(toggle).toHaveAttribute('aria-haspopup', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    
    // Open with Enter
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    
    // Navigate with arrows
    await page.keyboard.press('ArrowDown');
    const focusedItem = page.locator('.vd-dropdown-item:focus');
    await expect(focusedItem).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('tabs have proper keyboard navigation', async ({ page }) => {
    await page.goto('/tests/fixtures/tabs.html');
    
    const tabList = page.locator('[role="tablist"]');
    const tabs = page.locator('[role="tab"]');
    
    await expect(tabList).toBeVisible();
    
    // Navigate tabs with arrow keys
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    
    const activeTab = page.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toBeFocused();
  });

  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/tests/fixtures/buttons.html');
    
    await page.focus('.vd-btn-primary');
    
    // Check that element has visible focus (outline or box-shadow)
    const hasFocusStyle = await page.evaluate(() => {
      const btn = document.querySelector('.vd-btn-primary');
      if (!btn) return false;
      
      const style = getComputedStyle(btn);
      const hasOutline = style.outlineWidth !== '0px' && style.outlineStyle !== 'none';
      const hasBoxShadow = style.boxShadow !== 'none';
      
      return hasOutline || hasBoxShadow;
    });
    
    expect(hasFocusStyle).toBe(true);
  });
});
```

### 5. Integration Tests (Planned)

Integration tests are planned but not yet implemented.

### 6. E2E Tests (Planned)

E2E flows are planned but not yet implemented.

### 7. Performance Tests (Planned)

Performance checks are planned but not yet implemented.

---

## Component Testing Matrix

| Component | Unit | Component | A11y |
|-----------|:----:|:---------:|:----:|
| Modals | ✅ | ✅ | ✅ |
| Dropdown | ✅ | ✅ | ✅ |
| Navbar | ✅ | ✅ | ✅ |
| Tabs | ✅ | ✅ | ✅ |
| Toast | ✅ | ✅ | ✅ |
| Tooltips | ✅ | ✅ | ✅ |
| Collapsible | ✅ | ✅ | ✅ |
| Sidenav | ✅ | ✅ | ✅ |

---

## Directory Structure

```
vanduo-framework/
├── tests/
│   ├── unit/                    # Unit-level tests via page.evaluate()
│   │   └── helpers.spec.ts
│   │
│   ├── components/              # Component interaction tests
│   │   ├── code-snippet.spec.ts
│   │   ├── collapsible.spec.ts
│   │   ├── dropdown.spec.ts
│   │   ├── font-switcher.spec.ts
│   │   ├── image-box.spec.ts
│   │   ├── modals.spec.ts
│   │   ├── navbar.spec.ts
│   │   ├── pagination.spec.ts
│   │   ├── select.spec.ts
│   │   ├── sidenav.spec.ts
│   │   ├── tabs.spec.ts
│   │   ├── theme-switcher.spec.ts
│   │   ├── toast.spec.ts
│   │   └── tooltips.spec.ts
│   │
│   ├── a11y/                    # Accessibility tests
│   │   └── accessibility.spec.ts
│   │
│   └── fixtures/                # Test HTML pages
│       ├── helpers.html         # Loads helpers.js for unit tests
│       ├── modals.html
│       ├── dropdown.html
│       ├── buttons.html
│       ├── cards.html
│       └── tabs.html
│
├── playwright.config.ts         # Playwright configuration (ONLY config file)
├── eslint.config.js             # JavaScript lint configuration
├── stylelint.config.js          # CSS lint configuration
└── package.json                 # Playwright and lint/build dev tooling
```

---

## Configuration

### package.json (Test and tooling scripts)

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:a11y": "playwright test --grep @a11y",
    "test:e2e": "playwright test --grep @e2e",
    "test:perf": "playwright test --grep @perf",
    "test:mobile": "playwright test --project='*Mobile*'",
    "test:desktop": "playwright test --project='*Desktop*'",
    "test:chromium": "playwright test --project='Chromium*'",
    "test:firefox": "playwright test --project='Firefox*'",
    "test:webkit": "playwright test --project='WebKit*'",
    "report": "playwright show-report"
  },

  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@eslint/js": "^10.0.1",
    "eslint": "^10.0.0",
    "stylelint": "^17.1.1",
    "stylelint-config-standard": "^40.0.0",
    "esbuild": "^0.27.3",
    "lightningcss": "^1.31.1",
    "husky": "^9.1.7"
  }
}
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    process.env.CI ? ['junit', { outputFile: 'test-results/junit.xml' }] : ['line'],
  ],

  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers - P0 Priority
    {
      name: 'Chromium Desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Firefox Desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'WebKit Desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile browsers - P0 Priority
    {
      name: 'Chromium Mobile',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'WebKit Mobile',
      use: { ...devices['iPhone 14'] },
    },

    // Tablet browsers - P1 Priority
    {
      name: 'Chromium Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'WebKit Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  // Local server - uses Python's built-in HTTP server (no extra dependency)
  webServer: {
    // CI suppresses server logs to keep workflow output focused on test results.
    command: process.env.CI
      ? 'python3 -m http.server 8787 >/dev/null 2>&1'
      : 'python3 -m http.server 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 1000,
  },
});
```

---

## CI/CD Integration

Note: CI suppresses the local web server access logs so GitHub Actions output
stays focused on test failures. Local runs keep logs for debugging asset loads.

### GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: ['Chromium Desktop', 'Firefox Desktop', 'WebKit Desktop', 'Chromium Mobile', 'WebKit Mobile']
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: |
          npm install -D @playwright/test
          npx playwright install --with-deps
      
      - name: Run tests
        run: npx playwright test --project="${{ matrix.project }}"
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-${{ matrix.project }}
          path: playwright-report/
          retention-days: 7

  # Note: Visual/pixel-comparison tests have been removed from the test suite.
  # Testing focuses on functional behavior, ARIA attributes, and DOM state.
```

---

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Strategy document (this file)
- [x] Install `@playwright/test`
- [x] Create `playwright.config.ts`
- [x] Create test fixtures directory
- [x] Create initial test fixture HTML files

### Phase 2: Core Component Tests ✅
- [x] Modal tests
- [x] Dropdown tests
- [x] Navbar tests
- [x] Tabs tests

### Phase 3: Extended Tests ✅
- [x] Toast tests
- [x] Tooltips tests
- [x] Collapsible tests
- [x] Unit-level tests for helpers.js

### Phase 4: Quality Assurance ◐
- [ ] Additional visual regression guidance (non-pixel DOM/state patterns)
- [x] Accessibility test suite
- [ ] Integration tests

### Phase 5: CI/CD ✅
- [x] GitHub Actions workflow
- [x] Documentation (this file and repository README references)

---

## Best Practices

Fixtures should include `/js/vanduo.js` and call `Vanduo.init()` before assertions. Prefer `vd-` class selectors when verifying DOM output.

### 1. Test Naming
```typescript
test('Component: behavior description', async ({ page }) => {
  // ...
});
```

### 2. Use Tags for Filtering
```typescript
test.describe('Feature @a11y', () => {
  // Tests here can be filtered with --grep @a11y
});
```

### 3. Prefer Locators over Selectors
```typescript
// Good
const modal = page.locator('#test-modal');

// Avoid
const modal = await page.$('#test-modal');
```

### 4. Use Auto-waiting
```typescript
// Playwright auto-waits for elements
await page.click('.button');
await expect(page.locator('.result')).toBeVisible();
```

### 5. Test Data via Fixtures
```html
<!-- tests/fixtures/modals.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/css/vanduo.css">
</head>
<body>
  <button data-modal="#test-modal">Open Modal</button>
  
  <div id="test-modal" class="vd-modal">
    <div class="vd-modal-dialog">
      <div class="vd-modal-content">
        <h2 class="vd-modal-title">Test Modal</h2>
        <button class="vd-modal-close">Close</button>
      </div>
    </div>
  </div>
  
  <script src="/js/vanduo.js"></script>
  <script>
    Vanduo.init();
  </script>
</body>
</html>
```

---

## Summary

This strategy enables comprehensive testing of the Vanduo Framework with **a single dependency**: `@playwright/test`.

> **Current Status:** Visual/pixel-comparison tests (screenshot-based regression) have been removed from the active test suite. Testing now focuses on functional behavior, DOM state assertions, ARIA attributes, and component interactions rather than pixel-perfect visual comparisons.

All testing needs are covered:
- ✅ Unit testing (via `page.evaluate()`)
- ✅ Component testing (native Playwright)
- ✅ Accessibility testing (manual ARIA checks)
- ◐ Integration testing (planned)
- ◐ E2E testing (planned)
- ◐ Performance testing (planned)
- ✅ Cross-browser (Chromium, Firefox, WebKit)
- ✅ Responsive (Desktop, Mobile, Tablet)

**Zero additional dependencies beyond Playwright.**
