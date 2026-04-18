import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.WEB_PORT ?? 5173);
const webHost = process.env.WEB_HOST ?? "localhost";
const appUrl = `http://${webHost}:${webPort}`;

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
    command: `npm run dev -- --host ${webHost} --port ${webPort}`,
    env: {
      VITE_APP_ENV: process.env.VITE_APP_ENV ?? "local",
      VITE_ENABLE_MOCK_AUTH: process.env.VITE_ENABLE_MOCK_AUTH ?? "true",
      VITE_OIDC_POST_LOGOUT_REDIRECT_URI:
        process.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ?? `${appUrl}/login`,
      VITE_OIDC_REDIRECT_URI: process.env.VITE_OIDC_REDIRECT_URI ?? `${appUrl}/auth/callback`,
      VITE_OIDC_SILENT_REDIRECT_URI:
        process.env.VITE_OIDC_SILENT_REDIRECT_URI ?? `${appUrl}/auth/silent-callback`
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
