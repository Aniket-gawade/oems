/**
 * useOpsOrderEvents hook (F091, F092).
 * Fetches audit event trail for an order — ops-only endpoint.
 */
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/app/providers/api-client-provider";
import { getOpsOrderEvents } from "@/api/services/ops.service";
import type { GetOpsOrderEventsOutcome } from "@/api/services/ops.service";
import { opsAuditKeys, OPS_EVENTS_STALE_TIME_MS } from "@/api/query-keys";
import { makeGetRetryFn } from "@/api/retry";
import type { RequestState } from "@/api/request-state";
import { toRequestState } from "@/api/request-state";

/**
 * Fetch audit events for a given order (OPS role required).
 *
 * Returns a RequestState wrapping GetOpsOrderEventsOutcome.
 * Empty event list is treated as "empty" state (not "success") for UX purposes.
 *
 * Usage:
 * ```tsx
 * const state = useOpsOrderEvents(orderId);
 * if (state.status === "success" && !isOpsOrderEventsNotFound(state.data)) {
 *   // state.data.events is OrderEventResponse[]
 * }
 * ```
 *
 * Note: This hook should only be used within OPS-role-gated routes.
 * The RoleGuard at the route level prevents non-ops users from rendering this component.
 */
export const useOpsOrderEvents = (
  orderId: string | null | undefined
): RequestState<GetOpsOrderEventsOutcome> => {
  const client = useApiClient();

  const query = useQuery<GetOpsOrderEventsOutcome, unknown>({
    queryKey: opsAuditKeys.events(orderId ?? ""),
    queryFn: () => getOpsOrderEvents(orderId!, client),
    enabled: Boolean(orderId && orderId.trim().length > 0),
    staleTime: OPS_EVENTS_STALE_TIME_MS,
    retry: makeGetRetryFn()
  });

  const state = toRequestState(query, (result) => {
    // Treat empty event list as "empty" state
    if ("events" in result) return result.events.length === 0;
    return false;
  });

  return state;
};
