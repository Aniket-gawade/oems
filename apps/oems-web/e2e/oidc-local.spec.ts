import { expect, test } from "@playwright/test";

const requiresOidcMode = process.env.VITE_ENABLE_MOCK_AUTH === "false";

test.describe("OIDC local smoke", () => {
  test.setTimeout(120_000);
  test.skip(!requiresOidcMode, "Run with VITE_ENABLE_MOCK_AUTH=false to execute real OIDC local smoke.");

  test("trader and ops users complete Keycloak login callback", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in with Keycloak" }).click();

    await expect(page).toHaveURL(/localhost:8081/);
    await page.locator("#username").fill("trader1");
    await page.locator("#password").fill("trader1pass");
    await page.locator("#kc-login").click();
    await expect(page).toHaveURL(/\/trader/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out (OIDC)" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByRole("button", { name: "Sign in with Keycloak" }).click();
    await expect(page).toHaveURL(/localhost:8081/);
    await page.locator("#username").fill("ops1");
    await page.locator("#password").fill("ops1pass");
    await page.locator("#kc-login").click();
    await expect(page).toHaveURL(/\/ops/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Ops Dashboard" })).toBeVisible();
  });
});
