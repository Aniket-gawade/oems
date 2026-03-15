# OEMS Phase 1 - ERD

Last updated: 2026-03-15

## Core Tables

The following ERD models the Phase 1 core entities required for order placement, audit, and idempotency.

```mermaid
erDiagram
    INSTRUMENT ||--o{ ORDER_BOOK : referenced_by
    ORDER_BOOK ||--o{ ORDER_EVENT : has
    ORDER_BOOK ||--o{ IDEMPOTENCY_KEY : response_for

    INSTRUMENT {
      BIGINT id PK
      VARCHAR symbol UK
      VARCHAR name
      BOOLEAN tradable
      DECIMAL tick_size
      DECIMAL min_qty
      DECIMAL max_qty
      TIMESTAMP created_at
    }

    ORDER_BOOK {
      CHAR id PK
      VARCHAR client_order_id
      VARCHAR trader_id
      VARCHAR symbol
      VARCHAR side
      VARCHAR order_type
      DECIMAL quantity
      DECIMAL price
      DECIMAL notional
      VARCHAR status
      VARCHAR rejection_reason
      TIMESTAMP created_at
      TIMESTAMP updated_at
      INT version
    }

    ORDER_EVENT {
      BIGINT id PK
      CHAR order_id FK
      VARCHAR event_type
      JSON payload
      VARCHAR trace_id
      TIMESTAMP created_at
    }

    IDEMPOTENCY_KEY {
      BIGINT id PK
      VARCHAR idem_key UK
      VARCHAR request_hash
      CHAR order_id
      INT response_status
      JSON response_body
      TIMESTAMP created_at
      TIMESTAMP expires_at
    }
```

## Notes

1. `ORDER_EVENT` is append-only and provides immutable audit traceability.
2. `IDEMPOTENCY_KEY` stores canonical response snapshots for deterministic replays.
