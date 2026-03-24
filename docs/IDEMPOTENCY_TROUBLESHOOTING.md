# Idempotency Troubleshooting Queries

Use these queries on MySQL to investigate replay/conflict behavior for `POST /v1/orders`.

## 1. Inspect a single key

```sql
SELECT id,
       idem_key,
       request_hash,
       order_id,
       response_status,
       response_body,
       created_at,
       expires_at
FROM idempotency_key
WHERE idem_key = :idem_key;
```

## 2. Find same-key collisions by hash

```sql
SELECT idem_key,
       COUNT(DISTINCT request_hash) AS distinct_hashes,
       MIN(created_at) AS first_seen_at,
       MAX(created_at) AS last_seen_at
FROM idempotency_key
GROUP BY idem_key
HAVING COUNT(DISTINCT request_hash) > 1;
```

## 3. Find stale processing rows

```sql
SELECT id,
       idem_key,
       request_hash,
       created_at,
       expires_at
FROM idempotency_key
WHERE response_status = 0
  AND created_at < (UTC_TIMESTAMP() - INTERVAL 5 MINUTE)
ORDER BY created_at ASC;
```

## 4. Find keys that should be cleaned up

```sql
SELECT id,
       idem_key,
       expires_at
FROM idempotency_key
WHERE expires_at < UTC_TIMESTAMP()
ORDER BY expires_at ASC;
```

## 5. Verify duplicate-safe order creation

```sql
SELECT client_order_id,
       COUNT(*) AS order_rows
FROM order_book
GROUP BY client_order_id
HAVING COUNT(*) > 1;
```

## 6. Correlate idempotency row with order events

```sql
SELECT ik.idem_key,
       ik.request_hash,
       ik.response_status,
       ob.id AS order_id,
       ob.status AS order_status,
       oe.event_type,
       oe.created_at
FROM idempotency_key ik
LEFT JOIN order_book ob
       ON ob.id = ik.order_id
LEFT JOIN order_event oe
       ON oe.order_id = ob.id
WHERE ik.idem_key = :idem_key
ORDER BY oe.created_at ASC;
```

## Operational notes

- `response_status = 0` means in-progress reservation; this should be transient.
- Expired rows are removed by scheduled cleanup; keep DB as source of truth.
- Check metrics:
  - `idempotency_replay_total`
  - `idempotency_conflict_total`
