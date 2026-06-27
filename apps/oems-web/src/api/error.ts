/**
 * API error utilities for Phase 1 backend contracts.
 * Covers F083 (error parser), F084 (error-code messages), F085 (trace-id), F094 (field mapping), F095 (risk codes).
 */
import type { ApiErrorPayload, ApiFieldError, ErrorCode } from "@/api/types";
import { ApiClientError } from "@/app/providers/api-client-provider";

// ─── Error Parser (F083) ───────────────────────────────────────────────────────

/**
 * Parse an unknown thrown value into a structured ApiErrorPayload.
 * Works with ApiClientError (from api-client-provider) or raw objects.
 */
export const parseApiError = (error: unknown): ApiErrorPayload => {
  if (error instanceof ApiClientError) {
    return {
      code: (error.code as ErrorCode) ?? "INTERNAL_SERVER_ERROR",
      message: error.message,
      status: error.status,
      path: "",
      timestamp: new Date().toISOString(),
      traceId: error.traceId
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      status: 0,
      path: "",
      timestamp: new Date().toISOString(),
      traceId: null
    };
  }

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
    status: 0,
    path: "",
    timestamp: new Date().toISOString(),
    traceId: null
  };
};

/**
 * Extract X-Trace-Id from a Response (F085).
 * Falls back to null if the header is absent.
 */
export const extractTraceId = (response: Response): string | null =>
  response.headers.get("X-Trace-Id");

// ─── Error Code → UX Message Map (F084) ────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR:
    "One or more fields are invalid. Please review the highlighted fields and try again.",
  UNAUTHORIZED:
    "Your session has expired or you are not signed in. Please sign in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  RESOURCE_NOT_FOUND: "The requested resource could not be found.",
  INSTRUMENT_NOT_FOUND:
    "The instrument symbol you entered does not exist. Please check the symbol and try again.",
  INSTRUMENT_NOT_TRADABLE:
    "This instrument is currently not available for trading. Please contact your desk for assistance.",
  INSTRUMENT_QTY_OUT_OF_RANGE:
    "The quantity entered is outside the allowed range for this instrument. Please check the instrument constraints.",
  INSTRUMENT_TICK_SIZE_VIOLATION:
    "The price entered does not conform to the required tick size for this instrument.",
  // Risk reject codes (F095) — aligned with docs/RISK_CODES.md
  RISK_MAX_QTY_EXCEEDED:
    "Order rejected: the requested quantity exceeds your configured risk limit for this symbol. Please reduce the quantity.",
  RISK_MAX_NOTIONAL_EXCEEDED:
    "Order rejected: the order notional value (price × quantity) exceeds your configured limit. Please adjust the price or quantity.",
  RISK_PRICE_BAND_EXCEEDED:
    "Order rejected: the limit price is outside the allowed price band for this instrument. Please enter a price closer to the reference price.",
  IDEMPOTENCY_CONFLICT:
    "A different order was already submitted with this request key. Please start a new order submission.",
  INTERNAL_SERVER_ERROR:
    "An unexpected server error occurred. Please try again or contact support if the issue persists."
};

/**
 * Return a user-facing message for a backend error code (F084).
 * Falls back to a generic message for unknown codes.
 */
export const getErrorMessage = (code: string | null | undefined): string => {
  if (!code) return ERROR_MESSAGES["INTERNAL_SERVER_ERROR"]!;
  return ERROR_MESSAGES[code] ?? `An error occurred (code: ${code}). Please try again.`;
};

/**
 * Returns user-facing display label for a known risk rejection code (F095).
 * Returns null for non-risk codes.
 */
export const getRiskRejectLabel = (code: string | null | undefined): string | null => {
  if (code === "RISK_MAX_QTY_EXCEEDED") return "Maximum Quantity Exceeded";
  if (code === "RISK_MAX_NOTIONAL_EXCEEDED") return "Maximum Notional Exceeded";
  if (code === "RISK_PRICE_BAND_EXCEEDED") return "Price Band Exceeded";
  return null;
};

export const isRiskRejectCode = (code: string | null | undefined): boolean =>
  code === "RISK_MAX_QTY_EXCEEDED" ||
  code === "RISK_MAX_NOTIONAL_EXCEEDED" ||
  code === "RISK_PRICE_BAND_EXCEEDED";

// ─── Field-Level Validation Mapping (F094) ────────────────────────────────────

/**
 * Maps backend fieldErrors array to a field-name → message record.
 * Used to bind backend validation errors to specific form fields.
 */
export const mapFieldErrors = (
  payload: ApiErrorPayload | null | undefined
): Record<string, string> => {
  if (!payload?.fieldErrors?.length) return {};

  return payload.fieldErrors.reduce<Record<string, string>>(
    (acc: Record<string, string>, fe: ApiFieldError) => {
      acc[fe.field] = fe.message;
      return acc;
    },
    {}
  );
};

/**
 * Extract trace id from a parsed ApiErrorPayload or ApiClientError.
 */
export const getTraceId = (error: unknown): string | null => {
  if (error instanceof ApiClientError) return error.traceId;
  return null;
};
