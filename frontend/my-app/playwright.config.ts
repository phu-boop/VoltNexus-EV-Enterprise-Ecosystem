import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    /* Record video for tests */
    video: 'on',
    launchOptions: {
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox'
      ]
    }
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup - Chạy các file cấu hình đăng nhập ngầm 1 lần duy nhất
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Public - Test giao diện công khai (không cần login)
    {
      name: 'public',
      testDir: './tests/public',
      use: { ...devices['Desktop Chrome'] },
    },

    // E2E Admin - Test Admin EVM
    {
      name: 'e2e-admin',
      testDir: './tests/evm',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // E2E Dealer - Test CRM Đại lý & Bàn hàng B2C
    {
      name: 'e2e-dealer',
      testDir: './tests/dealer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/dealer.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
