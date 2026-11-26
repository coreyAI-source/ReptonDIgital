import { defineConfig } from "@playwright/test";

const APP_PORT = 3200;
const MOCK_PORT = 4010;
const APP_ORIGIN = `http://127.0.0.1:${APP_PORT}`;

/**
 * Browser tests. Playwright builds the site into .next-e2e, starts it with
 * test-only settings (analytics IDs and a local mock webhook), and runs the
 * desktop and mobile projects. Install the browser once with:
 *   npx playwright install chromium
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: APP_ORIGIN,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: [
    {
      command: `node e2e/mock-webhook.mjs ${MOCK_PORT}`,
      url: `http://127.0.0.1:${MOCK_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: `npx next build && npx next start -p ${APP_PORT}`,
      url: APP_ORIGIN,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_SITE_URL: APP_ORIGIN,
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-E2ETEST001",
        NEXT_PUBLIC_META_PIXEL_ID: "123456789012345",
        LEAD_WEBHOOK_URL: `http://127.0.0.1:${MOCK_PORT}/hook`,
        LEAD_WEBHOOK_SECRET: "e2e-secret",
      },
    },
  ],
});
