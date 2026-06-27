/**
 * Tests for API error parser, UX message map, trace-id extraction, and field mapping.
 * Covers F098 (adapter unit tests) and F099 (error parser + trace-id integration tests).
 */
import { describe, it, expect } from "vitest";
import { ApiClientError } from "@/app/providers/api-client-provider";
import {
  parseApiError,
  getErrorMessage,
  getRiskRejectLabel,
  isRiskRejectCode,
  mapFieldErrors,
  getTraceId
} from "@/api/error";
import type { ApiErrorPayload } from "@/api/types";

// ─── parseApiError (F083, F099) ───────────────────────────────────────────────

describe("parseApiError", () => {
  it("parses ApiClientError with code, status, and traceId", () => {
    const err = new ApiClientError(
      422,
      { code: "RISK_MAX_QTY_EXCEEDED", message: "Qty exceeded" },
      "trace-001"
    );
    const result = parseApiError(err);
    expect(result.code).toBe("RISK_MAX_QTY_EXCEEDED");
    expect(result.status).toBe(422);
    expect(result.traceId).toBe("trace-001");
    expect(result.message).toBe("Qty exceeded");
  });

  it("parses ApiClientError with null code as INTERNAL_SERVER_ERROR", () => {
    const err = new ApiClientError(500, { message: "Boom" }, null);
    const result = parseApiError(err);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("parses a plain Error", () => {
    const err = new Error("Network failure");
    const result = parseApiError(err);
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.message).toBe("Network failure");
    expect(result.traceId).toBeNull();
  });

  it("parses unknown thrown value", () => {
    const result = parseApiError("unexpected string error");
    expect(result.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.traceId).toBeNull();
  });
});

// ─── getErrorMessage (F084) ───────────────────────────────────────────────────

describe("getErrorMessage", () => {
  it("returns message for all known error codes", () => {
    const codes = [
      "VALIDATION_ERROR",
      "UNAUTHORIZED",
      "FORBIDDEN",
      "RESOURCE_NOT_FOUND",
      "INSTRUMENT_NOT_FOUND",
      "INSTRUMENT_NOT_TRADABLE",
      "INSTRUMENT_QTY_OUT_OF_RANGE",
      "INSTRUMENT_TICK_SIZE_VIOLATION",
      "RISK_MAX_QTY_EXCEEDED",
      "RISK_MAX_NOTIONAL_EXCEEDED",
      "RISK_PRICE_BAND_EXCEEDED",
      "IDEMPOTENCY_CONFLICT",
      "INTERNAL_SERVER_ERROR"
    ];

    for (const code of codes) {
      const message = getErrorMessage(code);
      expect(message.length, `message for ${code} should be non-empty`).toBeGreaterThan(0);
      expect(message, `message for ${code} should not contain the placeholder`).not.toContain(
        "An error occurred"
      );
    }
  });

  it("returns a fallback message for unknown codes", () => {
    const message = getErrorMessage("UNKNOWN_CODE_XYZ");
    expect(message).toContain("UNKNOWN_CODE_XYZ");
  });

  it("returns INTERNAL_SERVER_ERROR message for null/undefined", () => {
    expect(getErrorMessage(null)).toContain("unexpected server error");
    expect(getErrorMessage(undefined)).toContain("unexpected server error");
  });
});

// ─── Risk reject helpers (F095) ───────────────────────────────────────────────

describe("getRiskRejectLabel", () => {
  it("returns label for RISK_MAX_QTY_EXCEEDED", () => {
    expect(getRiskRejectLabel("RISK_MAX_QTY_EXCEEDED")).toBe("Maximum Quantity Exceeded");
  });

  it("returns label for RISK_MAX_NOTIONAL_EXCEEDED", () => {
    expect(getRiskRejectLabel("RISK_MAX_NOTIONAL_EXCEEDED")).toBe("Maximum Notional Exceeded");
  });

  it("returns label for RISK_PRICE_BAND_EXCEEDED", () => {
    expect(getRiskRejectLabel("RISK_PRICE_BAND_EXCEEDED")).toBe("Price Band Exceeded");
  });

  it("returns null for non-risk codes", () => {
    expect(getRiskRejectLabel("VALIDATION_ERROR")).toBeNull();
    expect(getRiskRejectLabel(null)).toBeNull();
    expect(getRiskRejectLabel(undefined)).toBeNull();
  });
});

describe("isRiskRejectCode", () => {
  it("returns true for all risk codes", () => {
    expect(isRiskRejectCode("RISK_MAX_QTY_EXCEEDED")).toBe(true);
    expect(isRiskRejectCode("RISK_MAX_NOTIONAL_EXCEEDED")).toBe(true);
    expect(isRiskRejectCode("RISK_PRICE_BAND_EXCEEDED")).toBe(true);
  });

  it("returns false for non-risk codes", () => {
    expect(isRiskRejectCode("VALIDATION_ERROR")).toBe(false);
    expect(isRiskRejectCode("IDEMPOTENCY_CONFLICT")).toBe(false);
    expect(isRiskRejectCode(null)).toBe(false);
  });
});

// ─── mapFieldErrors (F094) ────────────────────────────────────────────────────

describe("mapFieldErrors", () => {
  it("maps backend fieldErrors array to record", () => {
    const payload: ApiErrorPayload = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      status: 400,
      path: "/v1/orders",
      timestamp: "2026-06-01T09:00:00Z",
      traceId: null,
      fieldErrors: [
        { field: "quantity", message: "must be greater than 0" },
        { field: "symbol", message: "must not be blank" }
      ]
    };

    const result = mapFieldErrors(payload);
    expect(result["quantity"]).toBe("must be greater than 0");
    expect(result["symbol"]).toBe("must not be blank");
  });

  it("returns empty record when no field errors", () => {
    const payload: ApiErrorPayload = {
      code: "INTERNAL_SERVER_ERROR",
      message: "Server error",
      status: 500,
      path: "/v1/orders",
      timestamp: "2026-06-01T09:00:00Z",
      traceId: null
    };
    expect(mapFieldErrors(payload)).toEqual({});
  });

  it("returns empty record for null/undefined payload", () => {
    expect(mapFieldErrors(null)).toEqual({});
    expect(mapFieldErrors(undefined)).toEqual({});
  });
});

// ─── getTraceId (F085, F099) ──────────────────────────────────────────────────

describe("getTraceId", () => {
  it("extracts trace id from ApiClientError", () => {
    const err = new ApiClientError(500, { message: "err" }, "trace-xyz");
    expect(getTraceId(err)).toBe("trace-xyz");
  });

  it("returns null for non-ApiClientError", () => {
    expect(getTraceId(new Error("plain error"))).toBeNull();
    expect(getTraceId("string error")).toBeNull();
    expect(getTraceId(null)).toBeNull();
  });
});
