import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI or local to avoid overloading RAM. Focus on stability. */
  workers: 1,
  /* Reporter to use - HTML report helps with viewing test results */
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:5173",

    /* Cấu hình để luôn ghi lại Trace và Video (giúp demo báo cáo đầy đủ hơn) */
    trace: "on",
    video: "on",
  },

  /* Configure projects */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Public - Test giao diện công khai (không cần login)
    {
      name: "public",
      testDir: "./tests/public",
      use: { ...devices["Desktop Chrome"] },
    },

    // E2E Admin - Test Admin EVM
    {
      name: "e2e-admin",
      testDir: "./tests/evm",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },

    // E2E Dealer - Test CRM Đại lý & Bàn hàng B2C
    {
      name: "e2e-dealer",
      testDir: "./tests/dealer",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/dealer.json",
      },
      dependencies: ["setup"],
    },

    // ITC smoke - API-focused checks mapped from test case sheet
    {
      name: "e2e-itc",
      testDir: "./tests/e2e/itc",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
