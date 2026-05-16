import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: "./tests",

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution options
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced retries from 2 to 1 for faster CI
  workers: process.env.CI ? 2 : undefined, // Increased workers from 1 to 2 for parallel execution

  // Reporter configuration
  reporter: process.env.CI
    ? [["html", { outputFolder: "playwright-report" }], ["list"], ["github"]]
    : [["html", { outputFolder: "playwright-report" }], ["list"]],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    // Can be overridden with PLAYWRIGHT_BASE_URL env var
    // Default: astro dev (localhost:4321)
    // For Pages testing: localhost:8788 (wrangler pages dev)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4321",

    // Collect trace on first retry
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",
  },

  // Configure projects for major browsers
  // In CI, only run Chromium for faster execution
  // Locally, run all browsers for comprehensive testing
  projects: process.env.CI
    ? [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] },
        },

        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },

        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] },
        },

        // Mobile viewports
        {
          name: "Mobile Chrome",
          use: { ...devices["Pixel 5"] },
        },

        {
          name: "Mobile Safari",
          use: { ...devices["iPhone 12"] },
        },
      ],

  // Run dev server before starting tests
  // Can be overridden with PLAYWRIGHT_WEB_SERVER_COMMAND env var
  // Default: astro dev (localhost:4321)
  // For Pages testing: set PLAYWRIGHT_WEB_SERVER_COMMAND="pnpm test:local" and PLAYWRIGHT_BASE_URL="http://localhost:8788"
  webServer: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND
    ? {
        command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND,
        url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8788",
        reuseExistingServer: !process.env.CI,
        timeout: 180 * 1000, // Longer timeout for Pages build
        stdout: "ignore",
        stderr: "pipe",
      }
    : {
        command: "pnpm dev",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: "ignore", // Suppress dev server logs for cleaner CI output
        stderr: "pipe",
      },
});
