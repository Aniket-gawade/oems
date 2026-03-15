# OEMS Phase 1 - Sequence: Place Order

Last updated: 2026-03-15

## Overview

This sequence covers the successful order path and idempotent replay behavior.

```mermaid
sequenceDiagram
    autonumber
    participant Trader as Trader Client
    participant API as OEMS API
    participant Redis as Redis
    participant RefData as Ref-Data Module
    participant Risk as Risk Module
    participant DB as MySQL

    Trader->>API: POST /v1/orders + JWT + Idempotency-Key
    API->>Redis: Lookup key (fast path)
    API->>DB: Lookup idempotency key (source of truth)

    alt Existing key and same request hash (replay)
        DB-->>API: Return stored status + body
        API-->>Trader: Replay original response (same status/body)
    else Existing key and different request hash
        API-->>Trader: 409 IDEMPOTENCY_CONFLICT
    else New key
        API->>RefData: Validate instrument exists and tradable
        RefData-->>API: Instrument OK
        API->>Risk: Evaluate maxQty, maxNotional, priceBand
        Risk-->>API: PASS
        API->>DB: TX insert ORDER_RECEIVED + order_book + ORDER_ACCEPTED + idem row
        DB-->>API: Commit successful
        API->>Redis: Cache idempotency response snapshot
        API-->>Trader: 201 Created
    end
```

## Notes

1. DB check remains authoritative even when Redis is used.
2. Success and replay paths return deterministic results for the same idempotency key and payload hash.
