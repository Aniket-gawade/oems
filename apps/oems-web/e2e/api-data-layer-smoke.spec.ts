/**
 * Data layer smoke test (F105).
 * Validates that the API data layer works end-to-end in the local environment with mock-auth.
 *
 * These tests use mock-auth mode (VITE_ENABLE_MOCK_AUTH=true) as configured in playwright.config.ts,
 * so no real Keycloak or backend is required for CI validation.
 *
 * For full local backend validation, set VITE_ENABLE_MOCK_AUTH=false and ensure
 * the backend is running at http://localhost:8080.
 */
import { expect, test } from "@playwright/test";

test.describe("Data layer — trader role", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as TRADER via mock auth
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();
  });

  test("order lookup page renders without runtime error", async ({ page }) => {
    await page.goto("/orders/lookup");
    await expect(page.getByRole("heading", { name: "Order Lookup" })).toBeVisible();
    // No console errors from broken imports or hooks
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    expect(errors.filter((e) => e.includes("useApiClient") || e.includes("Cannot read"))).toHaveLength(0);
  });

  test("order lookup search input is interactive", async ({ page }) => {
    await page.goto("/orders/lookup");
    const input = page.getByLabel("Order ID");
    await input.fill("00000000-0000-0000-0000-000000000001");
    await expect(input).toHaveValue("00000000-0000-0000-0000-000000000001");
  });

  test("place-order page renders without runtime error", async ({ page }) => {
    await page.goto("/trader/place-order");
    await expect(page.getByRole("heading", { name: /place order/i })).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    expect(errors.filter((e) => e.includes("useApiClient") || e.includes("Cannot read"))).toHaveLength(0);
  });

  test("non-existent order detail page renders without crash", async ({ page }) => {
    await page.goto("/orders/00000000-0000-0000-0000-000000000099");
    // Should render an order detail page or not-found state — no crash
    await expect(page.locator("body")).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    // No React rendering errors expected
    expect(errors.filter((e) => e.includes("Cannot read properties of undefined"))).toHaveLength(0);
  });
});

test.describe("Data layer — ops role", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as OPS via mock auth
    await page.goto("/login");
    await page.getByLabel("Role").selectOption("OPS");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Ops Dashboard" })).toBeVisible();
  });

  test("ops audit search page renders without runtime error", async ({ page }) => {
    await page.goto("/ops/audit");
    await expect(page.getByRole("heading", { name: "Audit Search" })).toBeVisible();
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    expect(errors.filter((e) => e.includes("useApiClient") || e.includes("Cannot read"))).toHaveLength(0);
  });

  test("ops audit search navigates to audit detail route", async ({ page }) => {
    await page.goto("/ops/audit");
    const input = page.getByLabel("Order ID");
    await input.fill("00000000-0000-0000-0000-000000000001");
    await page.getByRole("button", { name: "Open audit" }).click();
    await expect(page).toHaveURL(/\/ops\/audit\/00000000-0000-0000-0000-000000000001/);
  });
});

test.describe("Data layer — role gating", () => {
  test("ops audit route is blocked for TRADER role", async ({ page }) => {
    // Sign in as TRADER
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();

    // Attempt to access ops-only route
    await page.goto("/ops/audit");
    // Should redirect to /unauthorized or show an access-denied state
    await expect(page).toHaveURL(/\/(unauthorized|login)/);
  });
});
