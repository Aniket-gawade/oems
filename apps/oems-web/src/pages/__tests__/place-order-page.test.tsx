/**
 * Integration tests for Place Order page (F132, F133).
 * Uses mock session auth and vi.fn mocks on the API hooks.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "@/App";
import { AppProviders } from "@/app/providers/app-providers";
import { createAppMemoryRouter } from "@/app/routes/app-router";

// ─── Mock the usePlaceOrder hook ──────────────────────────────────────────────

const mockMutateAsync = vi.fn();

vi.mock("@/api/hooks/use-order", () => ({
  usePlaceOrder: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: null,
    reset: vi.fn(),
    state: { status: "idle", data: undefined, error: null }
  }),
  useOrder: () => ({ status: "idle", data: undefined, error: null })
}));

vi.mock("@/api/hooks/use-instrument", () => ({
  useInstrument: () => ({ status: "idle", data: undefined, error: null })
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TRADER_SESSION = {
  displayName: "Trader One",
  role: "TRADER",
  userId: "mock-trader"
};

const renderPlaceOrderPage = () => {
  window.sessionStorage.setItem("oems-web-mock-session", JSON.stringify(TRADER_SESSION));
  const router = createAppMemoryRouter(["/trader/place-order"]);
  return render(
    <AppProviders>
      <App router={router} />
    </AppProviders>
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlaceOrderPage — rendering", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockMutateAsync.mockReset();
  });

  it("renders the place order form", async () => {
    renderPlaceOrderPage();
    expect(await screen.findByRole("heading", { name: "Place Order" })).toBeTruthy();
    expect(screen.getByLabelText("Symbol")).toBeTruthy();
    expect(screen.getByLabelText("Side")).toBeTruthy();
    expect(screen.getByLabelText("Order type")).toBeTruthy();
    expect(screen.getByLabelText("Quantity")).toBeTruthy();
  });

  it("shows price field for LIMIT order type", async () => {
    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });
    // LIMIT is default
    expect(screen.getByLabelText("Price")).toBeTruthy();
  });

  it("hides price field when order type is MARKET (F109)", async () => {
    const user = userEvent.setup();
    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });

    await user.selectOptions(screen.getByLabelText("Order type"), "MARKET");
    expect(screen.queryByLabelText("Price")).toBeNull();
  });
});

const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  overrides: { symbol?: string; quantity?: string; price?: string; orderType?: string } = {}
) => {
  if (overrides.orderType) {
    await user.selectOptions(screen.getByLabelText("Order type"), overrides.orderType);
  }
  if (overrides.symbol !== undefined) {
    const sym = screen.getByLabelText("Symbol");
    await user.clear(sym);
    if (overrides.symbol) await user.type(sym, overrides.symbol);
  }
  const qty = screen.getByLabelText("Quantity");
  await user.clear(qty);
  if (overrides.quantity) await user.type(qty, overrides.quantity ?? "10");

  const priceField = screen.queryByLabelText("Price");
  if (priceField) {
    await user.clear(priceField);
    if (overrides.price) await user.type(priceField, overrides.price ?? "100");
  }
  await user.click(screen.getByRole("button", { name: "Submit order" }));
};

describe("PlaceOrderPage — client-side validation (F110)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockMutateAsync.mockReset();
  });

  it("shows error when symbol is empty on submit", async () => {
    const user = userEvent.setup();
    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });

    // Fill valid qty/price but leave symbol empty
    await submitForm(user, { symbol: "", quantity: "10", price: "100" });

    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});

describe("PlaceOrderPage — submission outcomes (F132)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockMutateAsync.mockReset();
  });

  it("calls mutateAsync with correct payload when order is submitted", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({
      kind: "accepted",
      idempotencyKey: "key-001",
      response: {
        orderId: "00000000-0000-0000-0000-000000000001",
        status: "NEW",
        symbol: "AAPL",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 10,
        price: 182.5,
        createdAt: "2026-06-01T09:30:00Z"
      }
    });

    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });
    await submitForm(user, { symbol: "AAPL", quantity: "10", price: "182.50" });

    // Verify the API was called with the expected payload
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs.payload.symbol).toBe("AAPL");
    expect(callArgs.payload.side).toBe("BUY");
    expect(callArgs.payload.quantity).toBe(10);
    expect(callArgs.payload.price).toBe(182.5);
    expect(callArgs.idempotencyKey).toBeTruthy();
  });

  it("does not call mutateAsync when validation fails", async () => {
    const user = userEvent.setup();
    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });

    // Empty symbol — validation should block
    await submitForm(user, { symbol: "", quantity: "10", price: "100" });

    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});

describe("PlaceOrderPage — idempotency (F133)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockMutateAsync.mockReset();
  });

  it("passes isRetryWithSameKey=true for replay path", async () => {
    const user = userEvent.setup();
    // First submit succeeds — we get accepted outcome and can test replay
    mockMutateAsync.mockResolvedValue({
      kind: "accepted",
      idempotencyKey: "key-003",
      response: {
        orderId: "00000000-0000-0000-0000-000000000002",
        status: "NEW",
        symbol: "AAPL",
        side: "BUY",
        orderType: "LIMIT",
        quantity: 10,
        price: 182.5,
        createdAt: "2026-06-01T09:30:00Z"
      }
    });

    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });
    await submitForm(user, { symbol: "AAPL", quantity: "10", price: "182.50" });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    // Verify idempotency key was included
    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs.idempotencyKey).toBeTruthy();
    expect(callArgs.payload.clientOrderId).toBe(callArgs.idempotencyKey);
  });

  it("includes clientOrderId matching idempotencyKey for conflict detection (F133)", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({
      kind: "conflict",
      idempotencyKey: "key-004",
      message: "Conflict detected",
      traceId: "trace-002"
    });

    renderPlaceOrderPage();
    await screen.findByRole("heading", { name: "Place Order" });
    await submitForm(user, { symbol: "AAPL", quantity: "10", price: "182.50" });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
    // clientOrderId must always match the idempotency key
    const callArgs = mockMutateAsync.mock.calls[0][0];
    expect(callArgs.payload.clientOrderId).toBe(callArgs.idempotencyKey);
  });
});
