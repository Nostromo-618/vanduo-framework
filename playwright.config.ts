import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Vanduo Framework
 * 
 * Single testing dependency strategy - @playwright/test only
 * See: plans/QA-Automation-Strategy.md
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:8787',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and viewports */
  projects: [
    // ===== Desktop Browsers - P0 Priority =====
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

    // ===== Mobile Browsers - P0 Priority =====
    {
      name: 'Chromium Mobile',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'WebKit Mobile',
      use: { ...devices['iPhone 14'] },
    },

    // ===== Tablet Browsers - P1 Priority =====
    {
      name: 'Chromium Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'WebKit Tablet',
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  /* Run local dev server before starting the tests */
  /* Uses Python's built-in HTTP server - no extra dependency needed */
  webServer: {
    command: process.env.CI
      ? 'python3 -m http.server 8787 >/dev/null 2>&1'
      : 'python3 -m http.server 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 1000,
  },
});
