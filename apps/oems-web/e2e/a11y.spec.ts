import AxeBuilder from "@axe-core/playwright";
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

test("login screen has no critical accessibility violations", async ({ page }) => {
  await page.goto("/login");
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  const criticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === "critical"
  );
  expect(criticalViolations).toEqual([]);
});

test("app shell has no critical accessibility violations", async ({ page }) => {
  await setMockSession(page);
  await page.goto("/trader");
  await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  const criticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === "critical"
  );
  expect(criticalViolations).toEqual([]);
});

test("place order form has no critical accessibility violations (F135)", async ({ page }) => {
  await setMockSession(page);
  await page.goto("/trader/place-order");
  await expect(page.getByRole("heading", { name: "Place Order" })).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  const criticalViolations = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === "critical"
  );
  expect(criticalViolations).toEqual([]);
});
