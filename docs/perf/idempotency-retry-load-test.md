# Idempotency Retry Load Scenario

This scenario validates that retries with the same `Idempotency-Key` do not create duplicate orders.

## Script

- `scripts/load-idempotency-retries.js`

## Prerequisites

1. OEMS API running (default `http://localhost:8080`)
2. Valid trader JWT token
3. `k6` installed

## Run

```bash
k6 run \
  -e OEMS_BASE_URL=http://localhost:8080 \
  -e OEMS_BEARER_TOKEN="<jwt>" \
  -e VUS=20 \
  -e DURATION=2m \
  scripts/load-idempotency-retries.js
```

## What it verifies per iteration

1. First submit with new idempotency key reaches terminal status (`201` or `422`).
2. Replay with same key + same payload returns same status and body.
3. Same key + different payload returns `409`.

## Post-run SQL check

```sql
SELECT client_order_id, COUNT(*) AS order_rows
FROM order_book
GROUP BY client_order_id
HAVING COUNT(*) > 1;
```

Expected result: zero rows.
