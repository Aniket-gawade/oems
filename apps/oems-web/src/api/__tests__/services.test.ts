/**
 * Tests for API service functions — instrument, order, and ops services.
 * Covers F098 (adapter unit tests for success and failure branches).
 */
import { describe, it, expect, vi } from "vitest";
import type { ApiClient } from "@/app/providers/api-client-provider";
import { ApiClientError } from "@/app/providers/api-client-provider";
import { getInstrument, isInstrumentNotFound } from "@/api/services/instrument.service";
import {
  placeOrder,
  getOrder,
  isOrderNotFound,
  isPlaceOrderAccepted,
  isPlaceOrderReplay,
  isPlaceOrderRejected,
  isPlaceOrderConflict
} from "@/api/services/order.service";
import { getOpsOrderEvents, isOpsOrderEventsNotFound } from "@/api/services/ops.service";
import {
  MOCK_INSTRUMENT_AAPL,
  MOCK_ORDER_ACCEPTED,
  MOCK_ORDER_DETAIL,
  MOCK_ORDER_EVENTS,
  MOCK_ORDER_ID
} from "@/api/mocks/fixtures";

// ─── Helper ───────────────────────────────────────────────────────────────────

const makeMockClient = (response: unknown): ApiClient => ({
  basePath: "/api",
  request: vi.fn().mockResolvedValue(response)
});

const makeErrorClient = (status: number, code: string, message = "error"): ApiClient => ({
  basePath: "/api",
  request: vi.fn().mockRejectedValue(
    new ApiClientError(status, { code, message }, `trace-${status}`)
  )
});

// ─── Instrument Service ───────────────────────────────────────────────────────

describe("getInstrument", () => {
  it("returns instrument on 200 success", async () => {
    const client = makeMockClient(MOCK_INSTRUMENT_AAPL);
    const result = await getInstrument("AAPL", client);
    expect(isInstrumentNotFound(result)).toBe(false);
    if (!isInstrumentNotFound(result)) {
      expect(result.instrument.symbol).toBe("AAPL");
      expect(result.instrument.tradable).toBe(true);
    }
  });

  it("returns not-found result on 404 (no throw)", async () => {
    const client = makeErrorClient(404, "INSTRUMENT_NOT_FOUND");
    const result = await getInstrument("INVALID", client);
    expect(isInstrumentNotFound(result)).toBe(true);
    if (isInstrumentNotFound(result)) {
      expect(result.symbol).toBe("INVALID");
    }
  });

  it("re-throws on unexpected error (500)", async () => {
    const client = makeErrorClient(500, "INTERNAL_SERVER_ERROR");
    await expect(getInstrument("AAPL", client)).rejects.toThrow();
  });
});

// ─── Order Service: placeOrder ────────────────────────────────────────────────

describe("placeOrder", () => {
  const validPayload = {
    clientOrderId: "cli-001",
    symbol: "AAPL",
    side: "BUY" as const,
    orderType: "LIMIT" as const,
    quantity: 10,
    price: 182.5
  };

  it("returns accepted outcome on 201 (first submission)", async () => {
    const client = makeMockClient(MOCK_ORDER_ACCEPTED);
    const result = await placeOrder(validPayload, "key-001", client, false);
    expect(isPlaceOrderAccepted(result)).toBe(true);
    if (isPlaceOrderAccepted(result)) {
      expect(result.response.status).toBe("NEW");
      expect(result.idempotencyKey).toBe("key-001");
    }
  });

  it("returns replay outcome on 201 when isRetryWithSameKey=true", async () => {
    const client = makeMockClient(MOCK_ORDER_ACCEPTED);
    const result = await placeOrder(validPayload, "key-001", client, true);
    expect(isPlaceOrderReplay(result)).toBe(true);
  });

  it("returns rejected outcome on 422 (risk reject, no throw)", async () => {
    const client = makeErrorClient(422, "RISK_MAX_QTY_EXCEEDED", "Qty exceeded");
    const result = await placeOrder(validPayload, "key-002", client, false);
    expect(isPlaceOrderRejected(result)).toBe(true);
    if (isPlaceOrderRejected(result)) {
      expect(result.code).toBe("RISK_MAX_QTY_EXCEEDED");
    }
  });

  it("returns conflict outcome on 409 (idempotency conflict, no throw)", async () => {
    const client = makeErrorClient(409, "IDEMPOTENCY_CONFLICT", "Conflict");
    const result = await placeOrder(validPayload, "key-003", client, false);
    expect(isPlaceOrderConflict(result)).toBe(true);
  });

  it("throws on 400 validation error", async () => {
    const client = makeErrorClient(400, "VALIDATION_ERROR");
    await expect(placeOrder(validPayload, "key-004", client, false)).rejects.toThrow();
  });

  it("throws on 500 server error", async () => {
    const client = makeErrorClient(500, "INTERNAL_SERVER_ERROR");
    await expect(placeOrder(validPayload, "key-005", client, false)).rejects.toThrow();
  });
});

// ─── Order Service: getOrder ──────────────────────────────────────────────────

describe("getOrder", () => {
  it("returns order on 200 success", async () => {
    const client = makeMockClient(MOCK_ORDER_DETAIL);
    const result = await getOrder(MOCK_ORDER_ID, client);
    expect(isOrderNotFound(result)).toBe(false);
    if (!isOrderNotFound(result)) {
      expect(result.order.orderId).toBe(MOCK_ORDER_ID);
    }
  });

  it("returns not-found on 404 (privacy policy)", async () => {
    const client = makeErrorClient(404, "RESOURCE_NOT_FOUND");
    const result = await getOrder("nonexistent", client);
    expect(isOrderNotFound(result)).toBe(true);
  });

  it("returns not-found on 403 (ownership-scoped, no leak)", async () => {
    const client = makeErrorClient(403, "FORBIDDEN");
    const result = await getOrder("other-trader-order", client);
    expect(isOrderNotFound(result)).toBe(true);
  });

  it("throws on 500", async () => {
    const client = makeErrorClient(500, "INTERNAL_SERVER_ERROR");
    await expect(getOrder(MOCK_ORDER_ID, client)).rejects.toThrow();
  });
});

// ─── Ops Service ──────────────────────────────────────────────────────────────

describe("getOpsOrderEvents", () => {
  it("returns events on 200 success", async () => {
    const client = makeMockClient(MOCK_ORDER_EVENTS);
    const result = await getOpsOrderEvents(MOCK_ORDER_ID, client);
    expect(isOpsOrderEventsNotFound(result)).toBe(false);
    if (!isOpsOrderEventsNotFound(result)) {
      expect(result.events).toHaveLength(2);
      expect(result.events[0]?.eventType).toBe("ORDER_RECEIVED");
    }
  });

  it("returns empty events array when API returns null/undefined", async () => {
    const client = makeMockClient(null);
    const result = await getOpsOrderEvents(MOCK_ORDER_ID, client);
    if (!isOpsOrderEventsNotFound(result)) {
      expect(result.events).toEqual([]);
    }
  });

  it("returns not-found on 404", async () => {
    const client = makeErrorClient(404, "RESOURCE_NOT_FOUND");
    const result = await getOpsOrderEvents("unknown-order", client);
    expect(isOpsOrderEventsNotFound(result)).toBe(true);
  });

  it("throws on 403 (ops user present but access denied)", async () => {
    const client = makeErrorClient(403, "FORBIDDEN");
    await expect(getOpsOrderEvents(MOCK_ORDER_ID, client)).rejects.toThrow();
  });

  it("throws on 500", async () => {
    const client = makeErrorClient(500, "INTERNAL_SERVER_ERROR");
    await expect(getOpsOrderEvents(MOCK_ORDER_ID, client)).rejects.toThrow();
  });
});
