/**
 * Idempotency utilities for order submission.
 * Covers F086 (key generation), F096 (replay detection), F097 (conflict detection).
 */

// ─── Key Generation (F086) ────────────────────────────────────────────────────

/**
 * Generate a cryptographically unique idempotency key using the Web Crypto API.
 * One key should be generated per logical order submission intent.
 * The same key must be reused for retry attempts of the exact same payload.
 * A new key must be used when the trader starts a new order.
 */
export const generateIdempotencyKey = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is unavailable (test/SSR)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
};

// ─── Replay Detection (F096) ──────────────────────────────────────────────────

/**
 * Describes the result of an idempotency replay — i.e., same key + same payload
 * returning the original previously-accepted response.
 */
export interface IdempotencyReplayResult {
  readonly isReplay: true;
  readonly idempotencyKey: string;
}

/**
 * Returns true if the status code indicates the response is a replayed prior result.
 * Per Phase 1 contract: same key + same hash → 201 with original body (no new order created).
 * The UI should distinguish this as a deterministic prior outcome, not a new submission.
 */
export const isIdempotencyReplay = (statusCode: number, isReplay: boolean): boolean =>
  statusCode === 201 && isReplay;

// ─── Conflict Detection (F097) ────────────────────────────────────────────────

/**
 * Describes the result of an idempotency conflict — i.e., same key + different payload.
 */
export interface IdempotencyConflictResult {
  readonly isConflict: true;
  readonly idempotencyKey: string;
  readonly message: string;
}

/**
 * Returns true if the error code represents an idempotency conflict.
 * Per Phase 1 contract: same key + different hash → 409 IDEMPOTENCY_CONFLICT.
 */
export const isIdempotencyConflict = (errorCode: string | null | undefined): boolean =>
  errorCode === "IDEMPOTENCY_CONFLICT";

/**
 * Minimum idempotency key length as required by the OpenAPI spec.
 */
export const IDEMPOTENCY_KEY_MIN_LENGTH = 8;

/**
 * Maximum idempotency key length as required by the OpenAPI spec.
 */
export const IDEMPOTENCY_KEY_MAX_LENGTH = 128;

/**
 * Validates an idempotency key meets the API contract constraints.
 */
export const isValidIdempotencyKey = (key: string): boolean =>
  key.length >= IDEMPOTENCY_KEY_MIN_LENGTH && key.length <= IDEMPOTENCY_KEY_MAX_LENGTH;
