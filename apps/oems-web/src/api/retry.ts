/**
 * Retry policy definitions for frontend API requests (F087).
 *
 * Policy:
 * - GET requests (instrument, order, ops events) are safe to retry — they are idempotent.
 * - POST /v1/orders must NEVER be auto-retried because:
 *   1. The caller controls idempotency via the Idempotency-Key header.
 *   2. Auto-retrying with a different system-assigned key would create a duplicate order intent.
 *   3. Auto-retrying with the same key after a network failure is safe only if the caller
 *      explicitly decides to resubmit with the same idempotency key and same payload.
 */

/** Number of automatic retries for idempotent GET requests. */
export const GET_RETRY_COUNT = 3;

/**
 * Number of automatic retries for POST /v1/orders.
 * Must always be 0 — callers must handle retries explicitly with a stable idempotency key.
 */
export const POST_ORDER_RETRY_COUNT = 0;

/**
 * Exponential back-off delay in milliseconds for retry attempt `n` (1-based).
 * Pattern: 250ms, 500ms, 1000ms (as recommended in the OpenAPI spec idempotency policy).
 */
export const getRetryDelay = (attempt: number): number => {
  const base = 250;
  const cap = 1000;
  return Math.min(base * Math.pow(2, attempt - 1), cap);
};

/**
 * React Query retry function factory for GET endpoints.
 * Excludes 4xx responses from retry (client errors should not be retried).
 */
export const makeGetRetryFn =
  (maxRetries = GET_RETRY_COUNT) =>
  (failureCount: number, error: unknown): boolean => {
    if (failureCount >= maxRetries) return false;
    // Do not retry client errors (4xx)
    if (
      error !== null &&
      typeof error === "object" &&
      "status" in error &&
      typeof (error as { status: number }).status === "number"
    ) {
      const status = (error as { status: number }).status;
      if (status >= 400 && status < 500) return false;
    }
    return true;
  };
