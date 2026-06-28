import { expect, test, type Page } from "@playwright/test";

const TRADER_SESSION = JSON.stringify({
  displayName: "Trader One",
  role: "TRADER",
  userId: "mock-trader"
});

const installOrderApiMocks = async (page: Page) => {
  await page.route("**/api/v1/instruments/*", async (route) => {
    const symbol = route.request().url().split("/").pop()?.toUpperCase() ?? "AAPL";

    if (symbol === "UNKNOWN") {
      await route.fulfill({
        contentType: "application/json",
        status: 404,
        body: JSON.stringify({
          code: "INSTRUMENT_NOT_FOUND",
          message: "Instrument not found",
          status: 404,
          path: `/v1/instruments/${symbol}`,
          timestamp: "2026-06-01T09:30:00.000Z",
          traceId: "trace-instrument-001"
        })
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        symbol,
        name: symbol === "MSFT" ? "Microsoft Corporation" : "Apple Inc.",
        tradable: true,
        tickSize: 0.01,
        minQty: 1,
        maxQty: 100000
      })
    });
  });

  await page.route("**/api/v1/orders", async (route) => {
    const payload = route.request().postDataJSON() as {
      symbol: string;
      side: "BUY" | "SELL";
      orderType: "LIMIT" | "MARKET";
      quantity: number;
      price?: number | null;
    };

    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({
        orderId:
          payload.orderType === "MARKET"
            ? "00000000-0000-0000-0000-000000000102"
            : "00000000-0000-0000-0000-000000000101",
        status: "NEW",
        symbol: payload.symbol,
        side: payload.side,
        orderType: payload.orderType,
        quantity: payload.quantity,
        price: payload.orderType === "MARKET" ? null : payload.price,
        createdAt: "2026-06-01T09:30:00.000Z"
      })
    });
  });
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((session) => {
    window.sessionStorage.setItem("oems-web-mock-session", session);
  }, TRADER_SESSION);
  await installOrderApiMocks(page);
});

test.describe("Place Order page", () => {
  test("loads with all required fields", async ({ page }) => {
    await page.goto("/trader/place-order");

    await expect(page.getByRole("heading", { name: "Place Order" })).toBeVisible();
    await expect(page.getByLabel("Symbol")).toBeVisible();
    await expect(page.getByLabel("Side")).toBeVisible();
    await expect(page.getByLabel("Order type")).toBeVisible();
    await expect(page.getByLabel("Quantity")).toBeVisible();
  });

  test("price field shows for LIMIT and hides for MARKET", async ({ page }) => {
    await page.goto("/trader/place-order");

    await expect(page.getByLabel("Price")).toBeVisible();
    await page.getByLabel("Order type").selectOption("MARKET");
    await expect(page.getByLabel("Price")).not.toBeVisible();
  });
});

test.describe("Place Order validation", () => {
  test("shows validation error when symbol is empty", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").fill("");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("shows error when quantity is not a whole number", async ({ page }) => {
    await page.goto("/trader/place-order");

    const quantity = page.getByLabel("Quantity");
    await page.getByLabel("Symbol").fill("AAPL");
    await quantity.fill("10.5");
    await page.getByLabel("Price").fill("100");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect
      .poll(() => quantity.evaluate((element) => (element as HTMLInputElement).validity.valid))
      .toBe(false);
  });
});

test.describe("Place Order happy paths", () => {
  test("submits a LIMIT order and shows the order link", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").fill("AAPL");
    await page.getByLabel("Quantity").fill("10");
    await page.getByLabel("Price").fill("182.50");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect(
      page.locator(".outcome-panel--success").getByRole("heading", { name: "Order Submitted" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "00000000-0000-0000-0000-000000000101" })
    ).toBeVisible();
  });

  test("submits a MARKET order without price", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").fill("MSFT");
    await page.getByLabel("Order type").selectOption("MARKET");
    await page.getByLabel("Quantity").fill("12");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect(
      page.locator(".outcome-panel--success").getByRole("heading", { name: "Order Submitted" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "00000000-0000-0000-0000-000000000102" })
    ).toBeVisible();
  });
});

test.describe("Place Order large notional prompt", () => {
  test("shows confirmation banner when notional exceeds threshold", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").fill("AAPL");
    await page.getByLabel("Quantity").fill("10000");
    await page.getByLabel("Price").fill("200");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText(/Large order/i)).toBeVisible();
  });

  test("cancels large notional confirmation and returns to form", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").fill("AAPL");
    await page.getByLabel("Quantity").fill("10000");
    await page.getByLabel("Price").fill("200");
    await page.getByRole("button", { name: "Submit order" }).click();

    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByRole("alertdialog")).not.toBeVisible();
    await expect(page.getByLabel("Symbol")).toBeVisible();
  });
});

test.describe("Place Order keyboard navigation", () => {
  test("all fields are reachable via Tab", async ({ page }) => {
    await page.goto("/trader/place-order");

    await page.getByLabel("Symbol").focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    await expect(page.getByRole("button", { name: "Submit order" })).toBeFocused();
  });
});
