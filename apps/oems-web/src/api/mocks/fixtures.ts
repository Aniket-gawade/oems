/**
 * Deterministic mock API fixtures for QA manual testing (F102).
 * These fixtures represent all key response scenarios from the Phase 1 backend.
 *
 * Usage in mock mode: import fixtures and use them in mock-api.ts handlers.
 * Usage in unit tests: import directly to avoid network calls.
 */
import type {
  InstrumentResponse,
  OrderDetailResponse,
  OrderEventResponse,
  PlaceOrderResponse,
  ApiErrorPayload
} from "@/api/types";

// ─── Instrument Fixtures ──────────────────────────────────────────────────────

export const MOCK_INSTRUMENT_AAPL: InstrumentResponse = {
  symbol: "AAPL",
  name: "Apple Inc.",
  tradable: true,
  tickSize: 0.01,
  minQty: 1,
  maxQty: 100000
};

export const MOCK_INSTRUMENT_MSFT: InstrumentResponse = {
  symbol: "MSFT",
  name: "Microsoft Corporation",
  tradable: true,
  tickSize: 0.01,
  minQty: 1,
  maxQty: 50000
};

export const MOCK_INSTRUMENT_NOT_TRADABLE: InstrumentResponse = {
  symbol: "HALTED",
  name: "Halted Instrument",
  tradable: false,
  tickSize: 0.01,
  minQty: 1,
  maxQty: 1000
};

// ─── Order Fixtures ───────────────────────────────────────────────────────────

export const MOCK_ORDER_ID = "00000000-0000-0000-0000-000000000001";

export const MOCK_ORDER_ACCEPTED: PlaceOrderResponse = {
  orderId: MOCK_ORDER_ID,
  status: "NEW",
  symbol: "AAPL",
  side: "BUY",
  orderType: "LIMIT",
  quantity: 10,
  price: 182.5,
  createdAt: "2026-06-01T09:30:00.000Z"
};

export const MOCK_ORDER_DETAIL: OrderDetailResponse = {
  orderId: MOCK_ORDER_ID,
  traderId: "trader1",
  status: "NEW",
  symbol: "AAPL",
  side: "BUY",
  orderType: "LIMIT",
  quantity: 10,
  price: 182.5,
  createdAt: "2026-06-01T09:30:00.000Z",
  updatedAt: "2026-06-01T09:30:00.001Z"
};

export const MOCK_ORDER_REJECTED: PlaceOrderResponse = {
  orderId: "00000000-0000-0000-0000-000000000002",
  status: "REJECTED",
  symbol: "AAPL",
  side: "BUY",
  orderType: "LIMIT",
  quantity: 99999,
  price: 182.5,
  createdAt: "2026-06-01T09:31:00.000Z"
};

// ─── Risk Rejection Fixtures ──────────────────────────────────────────────────

export const MOCK_RISK_REJECTION_MAX_QTY: ApiErrorPayload = {
  code: "RISK_MAX_QTY_EXCEEDED",
  message: "Quantity exceeds maximum allowed: 1000",
  status: 422,
  path: "/v1/orders",
  timestamp: "2026-06-01T09:32:00.000Z",
  traceId: "trace-risk-qty-001"
};

export const MOCK_RISK_REJECTION_MAX_NOTIONAL: ApiErrorPayload = {
  code: "RISK_MAX_NOTIONAL_EXCEEDED",
  message: "Notional value exceeds maximum allowed: 100000.00",
  status: 422,
  path: "/v1/orders",
  timestamp: "2026-06-01T09:33:00.000Z",
  traceId: "trace-risk-notional-001"
};

export const MOCK_RISK_REJECTION_PRICE_BAND: ApiErrorPayload = {
  code: "RISK_PRICE_BAND_EXCEEDED",
  message: "Limit price is outside allowed price band of 10%",
  status: 422,
  path: "/v1/orders",
  timestamp: "2026-06-01T09:34:00.000Z",
  traceId: "trace-risk-price-001"
};

// ─── Idempotency Fixtures ─────────────────────────────────────────────────────

/** Fixture for an idempotency replay — same key + same payload returns original 201 body. */
export const MOCK_IDEMPOTENCY_REPLAY: PlaceOrderResponse = {
  ...MOCK_ORDER_ACCEPTED
};

/** Fixture for an idempotency conflict — same key + different payload returns 409. */
export const MOCK_IDEMPOTENCY_CONFLICT: ApiErrorPayload = {
  code: "IDEMPOTENCY_CONFLICT",
  message:
    "An order with this idempotency key was already submitted with different parameters.",
  status: 409,
  path: "/v1/orders",
  timestamp: "2026-06-01T09:35:00.000Z",
  traceId: "trace-idem-conflict-001"
};

// ─── Ops Audit Event Fixtures ─────────────────────────────────────────────────

export const MOCK_ORDER_EVENTS: OrderEventResponse[] = [
  {
    eventId: 1,
    orderId: MOCK_ORDER_ID,
    eventType: "ORDER_RECEIVED",
    payload: {
      symbol: "AAPL",
      side: "BUY",
      orderType: "LIMIT",
      quantity: 10,
      price: 182.5
    },
    traceId: "trace-event-001",
    createdAt: "2026-06-01T09:30:00.000Z"
  },
  {
    eventId: 2,
    orderId: MOCK_ORDER_ID,
    eventType: "ORDER_ACCEPTED",
    payload: {
      orderId: MOCK_ORDER_ID,
      status: "NEW"
    },
    traceId: "trace-event-001",
    createdAt: "2026-06-01T09:30:00.001Z"
  }
];

// ─── Error Fixtures ───────────────────────────────────────────────────────────

export const MOCK_VALIDATION_ERROR: ApiErrorPayload = {
  code: "VALIDATION_ERROR",
  message: "Request validation failed",
  status: 400,
  path: "/v1/orders",
  timestamp: "2026-06-01T09:36:00.000Z",
  traceId: "trace-validation-001",
  fieldErrors: [
    { field: "quantity", message: "must be greater than 0" },
    { field: "symbol", message: "must not be blank" }
  ]
};

export const MOCK_INSTRUMENT_NOT_FOUND_ERROR: ApiErrorPayload = {
  code: "INSTRUMENT_NOT_FOUND",
  message: "Instrument not found: INVALID",
  status: 404,
  path: "/v1/instruments/INVALID",
  timestamp: "2026-06-01T09:37:00.000Z",
  traceId: "trace-not-found-001"
};
