import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.WEB_PORT ?? 5173);
const appUrl = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: appUrl,
    headless: true,
    trace: "retain-on-failure"
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${webPort}`,
    env: {
      VITE_ENABLE_MOCK_AUTH: "true"
    },
    port: webPort,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
