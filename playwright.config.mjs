import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  globalSetup: "./tests/browser/setup.mjs",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "docs/evidence/browser-results.json" }],
  ],
  use: {
    baseURL: "http://localhost:3193",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
