/**
 * Ops API service (F091).
 * Wraps GET /v1/ops/orders/{orderId}/events — restricted to OPS role.
 */
import type { ApiClient } from "@/app/providers/api-client-provider";
import { ApiClientError } from "@/app/providers/api-client-provider";
import type { OrderEventResponse } from "@/api/types";

export interface GetOpsOrderEventsResult {
  readonly events: OrderEventResponse[];
  readonly orderId: string;
}

export interface GetOpsOrderEventsNotFoundResult {
  readonly notFound: true;
  readonly orderId: string;
}

export type GetOpsOrderEventsOutcome =
  | GetOpsOrderEventsResult
  | GetOpsOrderEventsNotFoundResult;

/**
 * Fetch audit events for an order — ops-only endpoint.
 *
 * - 200: returns ordered event list
 * - 404: returns not-found result
 * - 403: thrown (ops user present but lacks access — should be caught at route guard level)
 * - Other errors: thrown
 *
 * Note: this endpoint is guarded at the route level by RoleGuard (OPS role required).
 * Callers should ensure they only call this hook in OPS-scoped routes.
 */
export const getOpsOrderEvents = async (
  orderId: string,
  client: ApiClient
): Promise<GetOpsOrderEventsOutcome> => {
  try {
    const events = await client.request<OrderEventResponse[]>(
      `/v1/ops/orders/${encodeURIComponent(orderId)}/events`
    );
    return { events: events ?? [], orderId };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return { notFound: true, orderId };
    }
    throw error;
  }
};

export const isOpsOrderEventsNotFound = (
  result: GetOpsOrderEventsOutcome
): result is GetOpsOrderEventsNotFoundResult =>
  "notFound" in result && result.notFound === true;
