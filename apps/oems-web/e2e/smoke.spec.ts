import { expect, test } from "@playwright/test";

test("home screen renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "OEMS Web" })).toBeVisible();
  await expect(page.getByText("Phase 2 frontend scaffold is running.")).toBeVisible();
});
