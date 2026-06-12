import { expect, test } from "@playwright/test";

test("mock auth trader login and logout flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Trader Dashboard" })).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "OEMS Login" })).toBeVisible();
});

test("mock auth ops login flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Role").selectOption("OPS");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Ops Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ops Audit" })).toBeVisible();
});
