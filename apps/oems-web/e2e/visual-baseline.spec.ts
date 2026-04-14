import { expect, test, type Page } from "@playwright/test";

const mockSession = {
  displayName: "Trader One",
  role: "TRADER",
  userId: "mock-trader"
};

const setMockSession = async (page: Page) => {
  await page.addInitScript((sessionValue) => {
    window.sessionStorage.setItem("oems-web-mock-session", JSON.stringify(sessionValue));
  }, mockSession);
};

test("shell visual baseline", async ({ page }) => {
  await setMockSession(page);
  await page.goto("/trader");
  await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();
  await expect(page).toHaveScreenshot("shell-baseline.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.03
  });
});

test("component docs visual baseline", async ({ page }) => {
  await setMockSession(page);
  await page.goto("/component-docs");
  await expect(page.getByRole("heading", { name: "Component Docs" })).toBeVisible();
  await expect(page).toHaveScreenshot("component-docs-baseline.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.03
  });
});
