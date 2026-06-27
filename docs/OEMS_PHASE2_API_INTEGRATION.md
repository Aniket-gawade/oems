# OEMS Phase 2 — Frontend API Integration Guide

Last updated: 2026-06-27  
Applies to: `apps/oems-web`  
Backend spec: `docs/api/openapi-phase1.yaml`

---

## 1. Overview

The Phase 2 frontend consumes four Phase 1 backend endpoints.  
All API calls are mediated through the `ApiClientProvider` which:
- Attaches the bearer token automatically
- Handles `401` (clears session, redirects to `/login`)
- Handles `403` (shows permission denied notification)
- Throws `ApiClientError` for all non-2xx responses

---

## 2. Screen-to-Endpoint Mapping

| Screen | Method | Endpoint | Hook | Notes |
|---|---|---|---|---|
| Place Order | `POST` | `/v1/orders` | `usePlaceOrder()` | Requires `Idempotency-Key` header |
| Place Order | `GET` | `/v1/instruments/{symbol}` | `useInstrument(symbol)` | Pre-submit constraint display |
| Order Lookup | `GET` | `/v1/orders/{orderId}` | `useOrder(orderId)` | Shared with Order Detail |
| Order Detail | `GET` | `/v1/orders/{orderId}` | `useOrder(orderId)` | Trader-ownership scoped |
| Ops Audit Search | _(navigate only)_ | — | — | Navigates to `/ops/audit/:orderId` |
| Ops Audit Detail | `GET` | `/v1/ops/orders/{orderId}/events` | `useOpsOrderEvents(orderId)` | OPS role only |

---

## 3. Hook Usage Examples

### 3.1 Instrument lookup (Place Order screen)

```tsx
import { useInstrument, isInstrumentNotFound } from "@/api/hooks/use-instrument";

const { status, data } = useInstrument("AAPL");

if (status === "loading") return <Skeleton />;
if (status === "error") return <ErrorState />;
if (status === "success" && !isInstrumentNotFound(data)) {
  const { instrument } = data;
  // instrument.minQty, instrument.maxQty, instrument.tickSize, instrument.tradable
}
if (status === "success" && isInstrumentNotFound(data)) {
  // Show: "Symbol not found"
}
```

### 3.2 Place order (mutation)

```tsx
import { usePlaceOrder } from "@/api/hooks/use-order";
import { generateIdempotencyKey } from "@/api/idempotency";
import { isPlaceOrderAccepted, isPlaceOrderRejected, isPlaceOrderConflict, isPlaceOrderReplay } from "@/api/services/order.service";

const { mutateAsync, isPending } = usePlaceOrder();
// Generate once per order intent, store in component state
const [idempotencyKey] = useState(() => generateIdempotencyKey());

const handleSubmit = async (payload: PlaceOrderRequest) => {
  const outcome = await mutateAsync({ payload, idempotencyKey });

  if (isPlaceOrderAccepted(outcome)) {
    // Show success: outcome.response.orderId, outcome.response.status
  }
  if (isPlaceOrderReplay(outcome)) {
    // Show: "This order was already submitted — showing prior outcome"
  }
  if (isPlaceOrderRejected(outcome)) {
    // Show risk/instrument rejection: outcome.code, outcome.message, outcome.traceId
    // Use getErrorMessage(outcome.code) for user-facing text
    // Use getRiskRejectLabel(outcome.code) for risk-specific label
  }
  if (isPlaceOrderConflict(outcome)) {
    // Show: "Please start a new order — this key has conflicting data"
  }
};
```

### 3.3 Order lookup / detail

```tsx
import { useOrder } from "@/api/hooks/use-order";
import { isOrderNotFound } from "@/api/services/order.service";

const { status, data } = useOrder(orderId);

if (status === "loading") return <Skeleton />;
if (status === "error") return <ErrorState />;
if (status === "success" && isOrderNotFound(data)) {
  // Show neutral not-found: "Order not found or not visible to your account"
}
if (status === "success" && !isOrderNotFound(data)) {
  const { order } = data;
  // order.orderId, order.status, order.symbol, order.side, etc.
}
```

### 3.4 Ops audit events

```tsx
import { useOpsOrderEvents } from "@/api/hooks/use-ops-order-events";
import { isOpsOrderEventsNotFound } from "@/api/services/ops.service";

const { status, data } = useOpsOrderEvents(orderId);

if (status === "loading") return <Skeleton />;
if (status === "empty") return <EmptyState title="No events found" />;
if (status === "error") return <ErrorState />;
if (status === "success" && !isOpsOrderEventsNotFound(data)) {
  // data.events is OrderEventResponse[]
}
```

---

## 4. Error Code Handling

```tsx
import { getErrorMessage, getRiskRejectLabel, isRiskRejectCode, mapFieldErrors } from "@/api/error";
import { parseApiError, getTraceId } from "@/api/error";

// In catch blocks or from mutation error state:
const parsed = parseApiError(error);
const userMessage = getErrorMessage(parsed.code);
const traceId = getTraceId(error); // for display in error panels

// For form validation binding:
const fieldErrors = mapFieldErrors(parsed);
// fieldErrors["symbol"] → per-field message

// For risk rejection display:
if (isRiskRejectCode(parsed.code)) {
  const label = getRiskRejectLabel(parsed.code); // "Maximum Quantity Exceeded" etc.
}
```

---

## 5. Idempotency Key Guidelines

| Scenario | Key Behavior |
|---|---|
| New order intent | Generate new key: `generateIdempotencyKey()` |
| Retry same order | Reuse the same key and same payload |
| New order after rejection | Generate a new key |
| After conflict (409) | Generate a new key — prior key is poisoned |
| After replay (201 replay) | No action needed — prior result returned |

```tsx
// Generate one key per order intent in component state
const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyKey());

// After conflict, reset:
setIdempotencyKey(generateIdempotencyKey());
```

---

## 6. Cache Policy Summary

| Endpoint | Hook | Stale Time | Notes |
|---|---|---|---|
| `GET /v1/instruments/{symbol}` | `useInstrument` | 5 minutes | Instruments change rarely |
| `GET /v1/orders/{orderId}` | `useOrder` | 0ms | Always fetches fresh |
| `GET /v1/ops/orders/{orderId}/events` | `useOpsOrderEvents` | 0ms | Audit requires current state |
| `POST /v1/orders` | `usePlaceOrder` | — (mutation) | 0 auto-retries |

---

## 7. Trace ID Display

Every error response from the backend includes a `traceId` for incident investigation.
Extract it and display it in error panels:

```tsx
const traceId = getTraceId(error); // from ApiClientError
// Display as: "Reference: trace-abc123" in error state UI
// Include in any support ticket or ops incident log
```

---

## 8. Mock Fixtures (QA Testing)

When running in mock-auth mode, QA can import fixtures from `@/api/mocks/fixtures.ts`:

```ts
import {
  MOCK_INSTRUMENT_AAPL,
  MOCK_ORDER_ACCEPTED,
  MOCK_ORDER_REJECTED,
  MOCK_RISK_REJECTION_MAX_QTY,
  MOCK_IDEMPOTENCY_CONFLICT,
  MOCK_ORDER_EVENTS
} from "@/api/mocks/fixtures";
```

Available fixtures:
- `MOCK_INSTRUMENT_AAPL`, `MOCK_INSTRUMENT_MSFT`, `MOCK_INSTRUMENT_NOT_TRADABLE`
- `MOCK_ORDER_ACCEPTED`, `MOCK_ORDER_REJECTED`, `MOCK_ORDER_DETAIL`
- `MOCK_RISK_REJECTION_MAX_QTY`, `MOCK_RISK_REJECTION_MAX_NOTIONAL`, `MOCK_RISK_REJECTION_PRICE_BAND`
- `MOCK_IDEMPOTENCY_REPLAY`, `MOCK_IDEMPOTENCY_CONFLICT`
- `MOCK_ORDER_EVENTS`
- `MOCK_VALIDATION_ERROR`, `MOCK_INSTRUMENT_NOT_FOUND_ERROR`

---

## 9. Type Generation

Frontend types are auto-generated from `docs/api/openapi-phase1.yaml`:

```powershell
cd apps/oems-web
npm run api:generate   # regenerate after spec changes
npm run api:check      # verify no drift (run in CI)
```

The generated file lives at `src/api/generated/openapi.ts`.  
Hand-authored domain types for app use are in `src/api/types.ts`.

> [!IMPORTANT]
> Always re-run `npm run api:generate` and commit the result whenever `docs/api/openapi-phase1.yaml` changes.
> CI will fail via `api:check` if generated types are stale.
