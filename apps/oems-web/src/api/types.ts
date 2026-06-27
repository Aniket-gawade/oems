/**
 * Domain types for Phase 1 API contracts.
 * Derived from the generated OpenAPI types in ./generated/openapi.ts.
 * Use these types throughout the application instead of the raw generated types.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT";
export type OrderStatus = "NEW" | "REJECTED";
export type OrderEventType = "ORDER_RECEIVED" | "ORDER_ACCEPTED" | "ORDER_REJECTED";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "INSTRUMENT_NOT_FOUND"
  | "INSTRUMENT_NOT_TRADABLE"
  | "INSTRUMENT_QTY_OUT_OF_RANGE"
  | "INSTRUMENT_TICK_SIZE_VIOLATION"
  | "RISK_MAX_QTY_EXCEEDED"
  | "RISK_MAX_NOTIONAL_EXCEEDED"
  | "RISK_PRICE_BAND_EXCEEDED"
  | "IDEMPOTENCY_CONFLICT"
  | "INTERNAL_SERVER_ERROR";

// ─── Request Types ─────────────────────────────────────────────────────────────

export interface PlaceOrderRequest {
  readonly clientOrderId: string;
  readonly symbol: string;
  readonly side: OrderSide;
  readonly orderType: OrderType;
  readonly quantity: number;
  readonly price?: number | null;
}

// ─── Response Types ────────────────────────────────────────────────────────────

export interface PlaceOrderResponse {
  readonly orderId: string;
  readonly status: OrderStatus;
  readonly symbol: string;
  readonly side: OrderSide;
  readonly orderType: OrderType;
  readonly quantity: number;
  readonly price?: number | null;
  readonly createdAt: string;
}

export interface OrderDetailResponse {
  readonly orderId: string;
  readonly traderId: string;
  readonly status: OrderStatus;
  readonly symbol: string;
  readonly side: OrderSide;
  readonly orderType: OrderType;
  readonly quantity: number;
  readonly price?: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InstrumentResponse {
  readonly symbol: string;
  readonly name: string;
  readonly tradable: boolean;
  readonly tickSize: number;
  readonly minQty: number;
  readonly maxQty: number;
}

export interface OrderEventResponse {
  readonly eventId: number;
  readonly orderId: string;
  readonly eventType: OrderEventType;
  readonly payload: Record<string, unknown>;
  readonly traceId: string;
  readonly createdAt: string;
}

// ─── API Error Model ───────────────────────────────────────────────────────────

/** Structured field-level validation error from the backend. */
export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

/** Canonical backend ApiError payload (Phase 1 error model). */
export interface ApiErrorPayload {
  readonly code: ErrorCode | string;
  readonly message: string;
  readonly status: number;
  readonly path: string;
  readonly timestamp: string;
  readonly traceId: string | null;
  readonly fieldErrors?: ApiFieldError[];
}
