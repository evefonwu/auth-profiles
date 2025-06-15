import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for different test execution strategies */
  projects: [
    // === SMOKE TESTS === 
    // Fast, essential tests for every deployment (5-10 minutes)
    {
      name: "smoke-chromium",
      testMatch: "**/smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "smoke-webkit", 
      testMatch: "**/smoke.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "smoke-firefox",
      testMatch: "**/smoke.spec.ts", 
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "smoke-mobile",
      testMatch: "**/smoke.spec.ts",
      use: { ...devices["iPhone 12"] },
    },

    // === FULL TEST SUITE ===
    // Comprehensive testing for major releases (30-60 minutes)
    {
      name: "full-chromium",
      testIgnore: "**/smoke.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "full-webkit",
      testIgnore: "**/smoke.spec.ts", 
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "full-firefox",
      testMatch: ["**/auth-flow.spec.ts", "**/profile-management.spec.ts", "**/avatar-workflow.spec.ts"],
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "full-mobile",
      testMatch: ["**/auth-flow.spec.ts", "**/profile-management.spec.ts"],
      use: { ...devices["iPhone 12"] },
    },

    // === CRITICAL TESTS ===
    // Key user journeys for PR validation (15-20 minutes)
    {
      name: "critical-chromium",
      testMatch: ["**/auth-flow.spec.ts", "**/profile-management.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "critical-webkit",
      testMatch: ["**/auth-flow.spec.ts", "**/profile-management.spec.ts"],
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Next.js to start
  },
});
