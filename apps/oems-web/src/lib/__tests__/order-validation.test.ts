/**
 * Unit tests for order form validation (F131).
 * Covers all validation rules for LIMIT, MARKET, decimal precision, symbol format.
 */
import { describe, it, expect } from "vitest";
import {
  validateOrderForm,
  isValidOrderForm,
  isLargeNotional,
  calcNotional,
  countDecimals,
  normalizeSymbol,
  LARGE_NOTIONAL_THRESHOLD
} from "@/lib/order-validation";

// ─── validateOrderForm ─────────────────────────────────────────────────────────

describe("validateOrderForm — LIMIT orders", () => {
  const base = {
    symbol: "AAPL",
    side: "BUY",
    orderType: "LIMIT",
    quantity: "10",
    price: "182.50"
  };

  it("passes for a valid LIMIT order", () => {
    expect(isValidOrderForm(validateOrderForm(base))).toBe(true);
  });

  it("fails when price is missing for LIMIT", () => {
    const errors = validateOrderForm({ ...base, price: "" });
    expect(errors.price).toBeDefined();
  });

  it("fails when price is negative", () => {
    const errors = validateOrderForm({ ...base, price: "-1" });
    expect(errors.price).toBeDefined();
  });

  it("passes with price that has many decimals within limit", () => {
    const errors = validateOrderForm({ ...base, price: "182.12345678" });
    expect(errors.price).toBeUndefined();
  });

  it("fails with price exceeding max decimal places", () => {
    const errors = validateOrderForm({ ...base, price: "182.123456789" }); // 9 decimals
    expect(errors.price).toBeDefined();
  });
});

describe("validateOrderForm — MARKET orders", () => {
  const base = {
    symbol: "AAPL",
    side: "SELL",
    orderType: "MARKET",
    quantity: "5",
    price: ""
  };

  it("passes for a valid MARKET order (no price)", () => {
    expect(isValidOrderForm(validateOrderForm(base))).toBe(true);
  });

  it("passes for MARKET order even with price value (price ignored for MARKET)", () => {
    // Price field is hidden in UI for MARKET; validation skips price validation
    expect(isValidOrderForm(validateOrderForm({ ...base, price: "123" }))).toBe(true);
  });
});

describe("validateOrderForm — quantity rules (F111)", () => {
  const base = {
    symbol: "AAPL",
    side: "BUY",
    orderType: "LIMIT",
    quantity: "10",
    price: "100"
  };

  it("passes integer quantity", () => {
    expect(validateOrderForm(base).quantity).toBeUndefined();
  });

  it("fails when quantity has decimals", () => {
    expect(validateOrderForm({ ...base, quantity: "10.5" }).quantity).toBeDefined();
  });

  it("fails when quantity is zero", () => {
    expect(validateOrderForm({ ...base, quantity: "0" }).quantity).toBeDefined();
  });

  it("fails when quantity is negative", () => {
    expect(validateOrderForm({ ...base, quantity: "-5" }).quantity).toBeDefined();
  });

  it("fails when quantity is empty", () => {
    expect(validateOrderForm({ ...base, quantity: "" }).quantity).toBeDefined();
  });
});

describe("validateOrderForm — symbol rules", () => {
  const base = {
    symbol: "AAPL",
    side: "BUY",
    orderType: "MARKET",
    quantity: "1",
    price: ""
  };

  it("passes valid uppercase symbol", () => {
    expect(validateOrderForm(base).symbol).toBeUndefined();
  });

  it("passes symbol with digits", () => {
    expect(validateOrderForm({ ...base, symbol: "BRK.A" }).symbol).toBeUndefined();
  });

  it("fails empty symbol", () => {
    expect(validateOrderForm({ ...base, symbol: "" }).symbol).toBeDefined();
  });

  it("passes lowercase symbol (normalizeSymbol converts it to uppercase before validation)", () => {
    // validateOrderForm calls normalizeSymbol internally, so 'aapl' → 'AAPL' → passes
    expect(validateOrderForm({ ...base, symbol: "aapl" }).symbol).toBeUndefined();
  });

  it("fails symbol longer than 12 chars", () => {
    expect(validateOrderForm({ ...base, symbol: "TOOLONGSYMBOLX" }).symbol).toBeDefined();
  });
});

// ─── countDecimals ─────────────────────────────────────────────────────────────

describe("countDecimals", () => {
  it("returns 0 for integer string", () => expect(countDecimals("100")).toBe(0));
  it("returns 2 for '182.50'", () => expect(countDecimals("182.50")).toBe(2));
  it("returns 8 for 8-decimal value", () => expect(countDecimals("1.12345678")).toBe(8));
});

// ─── calcNotional ──────────────────────────────────────────────────────────────

describe("calcNotional", () => {
  it("calculates qty × price", () => expect(calcNotional("10", "182.50")).toBe(1825));
  it("returns null for invalid quantity", () => expect(calcNotional("abc", "100")).toBeNull());
  it("returns null for zero price", () => expect(calcNotional("10", "0")).toBeNull());
});

// ─── isLargeNotional ──────────────────────────────────────────────────────────

describe("isLargeNotional", () => {
  it("returns true when notional >= threshold", () => {
    expect(isLargeNotional("1000", "200", 100_000)).toBe(true); // 200,000
  });

  it("returns false when notional < threshold", () => {
    expect(isLargeNotional("10", "100", 100_000)).toBe(false); // 1,000
  });

  it("returns false when inputs are invalid", () => {
    expect(isLargeNotional("abc", "100", 100_000)).toBe(false);
  });

  it("uses default threshold constant", () => {
    const qty = String(LARGE_NOTIONAL_THRESHOLD / 100);
    expect(isLargeNotional(qty, "100")).toBe(true);
  });
});

// ─── normalizeSymbol ──────────────────────────────────────────────────────────

describe("normalizeSymbol", () => {
  it("uppercases and trims", () => {
    expect(normalizeSymbol("  aapl  ")).toBe("AAPL");
  });

  it("preserves dots", () => {
    expect(normalizeSymbol("brk.a")).toBe("BRK.A");
  });
});
