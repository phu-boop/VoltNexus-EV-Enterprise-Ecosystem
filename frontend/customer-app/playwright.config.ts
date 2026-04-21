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
    ['json', {  outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:5174",

    /* Collect trace when retrying the failed test. */
    trace: "retain-on-failure",
    /* Record video for tests */
    video: "retain-on-failure",
  },

  /* Configure projects */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // Smoke tests - Quick checks for public pages
    {
      name: "smoke",
      testMatch: /.*smoke\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    // E2E tests - Complex multi-step user flows
    {
      name: "e2e:desktop",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    
    // Protected routes requiring authentication
    {
      name: "e2e:protected",
      testMatch: /.*protected\.spec\.ts/,
      use: { 
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
  },
});
