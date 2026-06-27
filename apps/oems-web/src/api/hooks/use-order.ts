/**
 * Order hooks (F089, F090, F092).
 * - useOrder: GET /v1/orders/{orderId} — always-fresh query
 * - usePlaceOrder: POST /v1/orders — mutation with 0 auto-retries
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import { useApiClient } from "@/app/providers/api-client-provider";
import { getOrder, placeOrder } from "@/api/services/order.service";
import type { GetOrderOutcome, PlaceOrderOutcome } from "@/api/services/order.service";
import type { PlaceOrderRequest } from "@/api/types";
import { orderKeys, ORDER_DETAIL_STALE_TIME_MS } from "@/api/query-keys";
import { makeGetRetryFn, POST_ORDER_RETRY_COUNT } from "@/api/retry";
import type { RequestState } from "@/api/request-state";
import { toRequestState, mutationToRequestState } from "@/api/request-state";

// ─── useOrder (F090) ──────────────────────────────────────────────────────────

/**
 * Fetch order details by order ID.
 * Ownership-scoped: 403 and 404 both resolve to the notFound result (no error thrown).
 *
 * Usage:
 * ```tsx
 * const state = useOrder(orderId);
 * if (state.status === "success" && !isOrderNotFound(state.data)) {
 *   // state.data.order is OrderDetailResponse
 * }
 * ```
 */
export const useOrder = (orderId: string | null | undefined): RequestState<GetOrderOutcome> => {
  const client = useApiClient();

  const query = useQuery<GetOrderOutcome, unknown>({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: () => getOrder(orderId!, client),
    enabled: Boolean(orderId && orderId.trim().length > 0),
    staleTime: ORDER_DETAIL_STALE_TIME_MS,
    retry: makeGetRetryFn()
  });

  return toRequestState(query);
};

// ─── usePlaceOrder (F089) ─────────────────────────────────────────────────────

export interface PlaceOrderMutationVars {
  readonly payload: PlaceOrderRequest;
  readonly idempotencyKey: string;
  readonly isRetryWithSameKey?: boolean;
}

/**
 * Mutation hook for POST /v1/orders.
 *
 * Key behaviors:
 * - retry is set to 0 — callers control retry semantics via isRetryWithSameKey
 * - returns a typed PlaceOrderOutcome (accepted, replay, rejected, conflict)
 * - 400/401/403/500 are thrown and bubble up to the mutation error state
 *
 * Usage:
 * ```tsx
 * const { mutateAsync, isPending } = usePlaceOrder();
 * const outcome = await mutateAsync({ payload, idempotencyKey });
 * if (isPlaceOrderAccepted(outcome)) { ... }
 * ```
 */
export const usePlaceOrder = () => {
  const client = useApiClient();

  const mutation = useMutation<PlaceOrderOutcome, unknown, PlaceOrderMutationVars>({
    mutationFn: ({ payload, idempotencyKey, isRetryWithSameKey }) =>
      placeOrder(payload, idempotencyKey, client, isRetryWithSameKey),
    retry: POST_ORDER_RETRY_COUNT
  });

  return {
    mutateAsync: mutation.mutateAsync,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
    state: mutationToRequestState(
      mutation as Parameters<typeof mutationToRequestState>[0]
    )
  } as const;
};
