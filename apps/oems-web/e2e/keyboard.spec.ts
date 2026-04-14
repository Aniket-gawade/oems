import { expect, test } from "@playwright/test";

const mockSession = {
  displayName: "Trader One",
  role: "TRADER",
  userId: "mock-trader"
};

test("keyboard navigation baseline works in app shell", async ({ page }) => {
  await page.addInitScript((sessionValue) => {
    window.sessionStorage.setItem("oems-web-mock-session", JSON.stringify(sessionValue));
  }, mockSession);

  await page.goto("/trader");
  await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Sign out" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Trader Dashboard" })).toBeFocused();
});
