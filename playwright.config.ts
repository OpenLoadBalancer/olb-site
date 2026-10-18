import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
});
