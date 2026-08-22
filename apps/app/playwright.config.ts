import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // shared test user/data — avoid cross-test races
  retries: 1,
  reporter: "list",
  workers: 1,
  use: {
    baseURL: "http://localhost:8081",
    trace: "retain-on-failure",
  },
  timeout: 45_000,
  webServer: {
    command: "cross-env EXPO_NO_DOTENV=1 expo start --web --port 8081",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/state.json" },
    },
  ],
});
