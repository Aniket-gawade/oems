/**
 * Client-side order validation (F110, F111).
 * Rules mirror the backend OpenAPI spec constraints so errors are caught before the API call.
 */
import type { OrderSide, OrderType } from "@/api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderFormValues {
  readonly symbol: string;
  readonly side: string;
  readonly orderType: string;
  readonly quantity: string;
  readonly price: string;
}

export interface OrderValidationErrors {
  readonly symbol?: string;
  readonly side?: string;
  readonly orderType?: string;
  readonly quantity?: string;
  readonly price?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Max decimal places allowed for price (tick size compliance enforced server-side). */
export const PRICE_MAX_DECIMALS = 8;

/** Quantity must be a positive integer with no decimal component. */
export const QTY_MAX_DECIMALS = 0;

/** Default large-notional warning threshold. */
export const LARGE_NOTIONAL_THRESHOLD = 100_000;

const VALID_SIDES: readonly string[] = ["BUY", "SELL"];
const VALID_ORDER_TYPES: readonly string[] = ["LIMIT", "MARKET"];
const SYMBOL_REGEX = /^[A-Z0-9.]{1,12}$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Count decimal places in a numeric string.
 * Returns 0 for integers or non-parseable strings.
 */
export const countDecimals = (value: string): number => {
  const trimmed = value.trim();
  const dotIndex = trimmed.indexOf(".");
  if (dotIndex === -1) return 0;
  return trimmed.length - dotIndex - 1;
};

/**
 * Parse a string to a finite positive number.
 * Returns null if the string is not a valid finite positive number.
 */
export const parsePositive = (value: string): number | null => {
  const num = Number(value.trim());
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
};

/**
 * Format a number with up to 2 decimal places for display.
 */
export const formatNotional = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);

/**
 * Calculate notional value (quantity × price).
 * Returns null when inputs are not valid positive numbers.
 */
export const calcNotional = (quantity: string, price: string): number | null => {
  const qty = parsePositive(quantity);
  const px = parsePositive(price);
  if (qty === null || px === null) return null;
  return qty * px;
};

/**
 * Normalize a symbol string to uppercase, trimming whitespace.
 */
export const normalizeSymbol = (value: string): string => value.trim().toUpperCase();

// ─── Main Validation (F110, F111) ─────────────────────────────────────────────

/**
 * Validate order form values against client-side rules.
 * Returns an error record — empty object means validation passed.
 */
export const validateOrderForm = (values: OrderFormValues): OrderValidationErrors => {
  const errors: Record<string, string> = {};

  // Symbol
  const symbol = normalizeSymbol(values.symbol);
  if (!symbol) {
    errors["symbol"] = "Symbol is required.";
  } else if (!SYMBOL_REGEX.test(symbol)) {
    errors["symbol"] = "Symbol must be 1–12 uppercase letters, digits, or dots.";
  }

  // Side
  if (!VALID_SIDES.includes(values.side)) {
    errors["side"] = "Side must be BUY or SELL.";
  }

  // Order type
  if (!VALID_ORDER_TYPES.includes(values.orderType)) {
    errors["orderType"] = "Order type must be LIMIT or MARKET.";
  }

  // Quantity — must be a positive integer
  const qty = parsePositive(values.quantity);
  if (qty === null) {
    errors["quantity"] = "Quantity must be a positive number.";
  } else if (!Number.isInteger(qty)) {
    errors["quantity"] = "Quantity must be a whole number (no decimals).";
  } else if (countDecimals(values.quantity) > QTY_MAX_DECIMALS) {
    errors["quantity"] = "Quantity must be a whole number.";
  }

  // Price — required for LIMIT, must be absent/empty for MARKET
  if (values.orderType === "LIMIT") {
    if (!values.price.trim()) {
      errors["price"] = "Price is required for LIMIT orders.";
    } else {
      const px = parsePositive(values.price);
      if (px === null) {
        errors["price"] = "Price must be a positive number.";
      } else if (countDecimals(values.price) > PRICE_MAX_DECIMALS) {
        errors["price"] = `Price may have at most ${PRICE_MAX_DECIMALS} decimal places.`;
      }
    }
  }

  return errors as OrderValidationErrors;
};

/**
 * Returns true when the error record has no entries.
 */
export const isValidOrderForm = (errors: OrderValidationErrors): boolean =>
  Object.keys(errors).length === 0;

/**
 * Returns true when the order notional exceeds the configured threshold.
 * Used to trigger the large-notional confirmation prompt (F125).
 */
export const isLargeNotional = (
  quantity: string,
  price: string,
  threshold = LARGE_NOTIONAL_THRESHOLD
): boolean => {
  const notional = calcNotional(quantity, price);
  return notional !== null && notional >= threshold;
};

// ─── Type coercions for submission ────────────────────────────────────────────

export const toOrderSide = (value: string): OrderSide => value as OrderSide;
export const toOrderType = (value: string): OrderType => value as OrderType;
