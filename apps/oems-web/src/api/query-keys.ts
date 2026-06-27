/**
 * React Query key factory and cache policy definitions (F092).
 *
 * Cache policy rationale:
 * - Instrument data: relatively stable, 5-minute stale window is acceptable.
 * - Order detail: must always reflect the latest server state; stale time = 0.
 * - Ops events: immutable append-only audit trail, but ops needs real-time view; stale time = 0.
 *
 * gcTime (garbage collection) is set globally in the QueryProvider (5 minutes).
 */

// ─── Order Query Keys ─────────────────────────────────────────────────────────

export const orderKeys = {
  /** Base scope for all order queries. */
  all: ["orders"] as const,
  /** Detail query for a specific order. */
  detail: (orderId: string) => [...orderKeys.all, "detail", orderId] as const
} as const;

// ─── Instrument Query Keys ────────────────────────────────────────────────────

export const instrumentKeys = {
  /** Base scope for all instrument queries. */
  all: ["instruments"] as const,
  /** Detail query for a specific instrument symbol. */
  detail: (symbol: string) => [...instrumentKeys.all, "detail", symbol] as const
} as const;

// ─── Ops Audit Query Keys ─────────────────────────────────────────────────────

export const opsAuditKeys = {
  /** Base scope for all ops audit queries. */
  all: ["ops", "audit"] as const,
  /** Events list for a specific order. */
  events: (orderId: string) => [...opsAuditKeys.all, "events", orderId] as const
} as const;

// ─── Cache Policy Constants ───────────────────────────────────────────────────

/** Instrument data stale time: 5 minutes. Instruments change rarely. */
export const INSTRUMENT_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Order detail stale time: 0ms.
 * Order status must always reflect the latest server state.
 */
export const ORDER_DETAIL_STALE_TIME_MS = 0;

/**
 * Ops events stale time: 0ms.
 * Audit events are append-only but ops users need current state.
 */
export const OPS_EVENTS_STALE_TIME_MS = 0;
