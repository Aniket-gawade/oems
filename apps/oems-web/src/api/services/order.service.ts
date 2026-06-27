/**
 * Order API service (F089, F090).
 * Covers:
 *   - POST /v1/orders (placeOrder) with idempotency, replay, conflict, and risk reject handling
 *   - GET /v1/orders/{orderId} (getOrder) with ownership-scoped not-found behavior
 */
import type { ApiClient } from "@/app/providers/api-client-provider";
import { ApiClientError } from "@/app/providers/api-client-provider";
import type { OrderDetailResponse, PlaceOrderRequest, PlaceOrderResponse } from "@/api/types";
import { isIdempotencyConflict } from "@/api/idempotency";

// ─── Place Order Types ─────────────────────────────────────────────────────────

export interface PlaceOrderAcceptedResult {
  readonly kind: "accepted";
  readonly response: PlaceOrderResponse;
  readonly idempotencyKey: string;
}

export interface PlaceOrderReplayResult {
  readonly kind: "replay";
  readonly response: PlaceOrderResponse;
  readonly idempotencyKey: string;
}

export interface PlaceOrderRejectedResult {
  readonly kind: "rejected";
  readonly code: string;
  readonly message: string;
  readonly traceId: string | null;
  readonly idempotencyKey: string;
}

export interface PlaceOrderConflictResult {
  readonly kind: "conflict";
  readonly idempotencyKey: string;
  readonly message: string;
  readonly traceId: string | null;
}

export type PlaceOrderOutcome =
  | PlaceOrderAcceptedResult
  | PlaceOrderReplayResult
  | PlaceOrderRejectedResult
  | PlaceOrderConflictResult;

// ─── Place Order Service (F089) ───────────────────────────────────────────────

/**
 * Submit a new order via POST /v1/orders.
 *
 * Handles all Phase 1 response cases:
 * - 201 (NEW): accepted outcome
 * - 422 (REJECTED): risk or instrument rejection — represented as rejected outcome, NOT thrown
 * - 409 (IDEMPOTENCY_CONFLICT): conflict outcome — NOT thrown
 * - Other errors (400, 401, 403, 500): thrown as ApiClientError
 *
 * Replay detection: the Phase 1 backend returns 201 for replays.
 * The frontend uses `isReplay` flag in the call context (caller tracks whether this is a retry
 * with a previously-used key). For first-time submissions it is always `false`.
 */
export const placeOrder = async (
  payload: PlaceOrderRequest,
  idempotencyKey: string,
  client: ApiClient,
  isRetryWithSameKey = false
): Promise<PlaceOrderOutcome> => {
  try {
    const response = await client.request<PlaceOrderResponse>("/v1/orders", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: payload as unknown as Record<string, unknown>
    });

    // If this was a retry with the same key, the 201 response is a replay
    if (isRetryWithSameKey) {
      return { kind: "replay", response, idempotencyKey };
    }

    return { kind: "accepted", response, idempotencyKey };
  } catch (error) {
    if (error instanceof ApiClientError) {
      // 422: business rule rejection (instrument not tradable, risk reject)
      if (error.status === 422) {
        return {
          kind: "rejected",
          code: error.code ?? "INTERNAL_SERVER_ERROR",
          message: error.message,
          traceId: error.traceId,
          idempotencyKey
        };
      }

      // 409: idempotency conflict (same key + different payload)
      if (error.status === 409 || isIdempotencyConflict(error.code)) {
        return {
          kind: "conflict",
          idempotencyKey,
          message: error.message,
          traceId: error.traceId
        };
      }
    }

    // All other errors (400 validation, 401 auth, 403 forbidden, 500 server) are thrown
    throw error;
  }
};

// ─── Get Order Types ──────────────────────────────────────────────────────────

export interface GetOrderFoundResult {
  readonly order: OrderDetailResponse;
}

export interface GetOrderNotFoundResult {
  readonly notFound: true;
  readonly orderId: string;
}

export type GetOrderOutcome = GetOrderFoundResult | GetOrderNotFoundResult;

// ─── Get Order Service (F090) ─────────────────────────────────────────────────

/**
 * Fetch order details by order ID.
 *
 * Ownership-scoped not-found behavior (per Phase 1 PRD):
 * - 404 and 403 are both normalized to a not-found result to avoid leaking ownership details.
 * - This prevents the UI from distinguishing "order doesn't exist" vs "order belongs to someone else".
 */
export const getOrder = async (
  orderId: string,
  client: ApiClient
): Promise<GetOrderOutcome> => {
  try {
    const order = await client.request<OrderDetailResponse>(
      `/v1/orders/${encodeURIComponent(orderId)}`
    );
    return { order };
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 404 || error.status === 403)) {
      return { notFound: true, orderId };
    }
    throw error;
  }
};

export const isOrderNotFound = (result: GetOrderOutcome): result is GetOrderNotFoundResult =>
  "notFound" in result && result.notFound === true;

// ─── Outcome Type Guards ──────────────────────────────────────────────────────

export const isPlaceOrderAccepted = (
  result: PlaceOrderOutcome
): result is PlaceOrderAcceptedResult => result.kind === "accepted";

export const isPlaceOrderReplay = (
  result: PlaceOrderOutcome
): result is PlaceOrderReplayResult => result.kind === "replay";

export const isPlaceOrderRejected = (
  result: PlaceOrderOutcome
): result is PlaceOrderRejectedResult => result.kind === "rejected";

export const isPlaceOrderConflict = (
  result: PlaceOrderOutcome
): result is PlaceOrderConflictResult => result.kind === "conflict";
