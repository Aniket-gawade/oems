# OEMS Database ER Diagram (Conceptual)

```mermaid
erDiagram
    INSTRUMENT {
        string symbol PK
        string exchange
        string status
        datetime created_at
    }

    ORDERS {
        bigint id PK
        string client_order_id UK
        string symbol FK
        string side
        string order_type
        decimal quantity
        decimal limit_price
        string status
        datetime created_at
        datetime updated_at
    }

    ORDER_EVENTS {
        bigint id PK
        bigint order_id FK
        string event_type
        string from_status
        string to_status
        string actor
        datetime event_at
    }

    EXECUTIONS {
        bigint id PK
        bigint order_id FK
        decimal exec_qty
        decimal exec_price
        string liquidity_flag
        datetime executed_at
    }

    IDEMPOTENCY_KEYS {
        bigint id PK
        string idempotency_key UK
        string request_hash
        bigint order_id FK
        datetime created_at
    }

    RISK_LIMITS {
        bigint id PK
        string scope_type
        string scope_value
        decimal max_qty
        decimal max_notional
        decimal price_band_pct
        datetime updated_at
    }

    RISK_DECISIONS {
        bigint id PK
        bigint order_id FK
        string decision
        string reject_code
        string reject_reason
        datetime decided_at
    }

    POSITIONS {
        bigint id PK
        string account_id
        string symbol FK
        decimal net_qty
        decimal avg_price
        datetime updated_at
    }

    AUDIT_EVENTS {
        bigint id PK
        string service_name
        string entity_type
        string entity_id
        string action
        string trace_id
        datetime created_at
    }

    INSTRUMENT ||--o{ ORDERS : "traded_as"
    ORDERS ||--o{ ORDER_EVENTS : "state_changes"
    ORDERS ||--o{ EXECUTIONS : "fills"
    ORDERS ||--|| IDEMPOTENCY_KEYS : "created_by"
    ORDERS ||--o{ RISK_DECISIONS : "risk_checked"
    EXECUTIONS }o--|| POSITIONS : "updates"
    INSTRUMENT ||--o{ POSITIONS : "held_as"
```

## Service Ownership (Logical)

- `reference-data-service`: `INSTRUMENT`
- `order-service`: `ORDERS`, `ORDER_EVENTS`, `IDEMPOTENCY_KEYS`
- `risk-service`: `RISK_LIMITS`, `RISK_DECISIONS`
- `execution-sim-service`: `EXECUTIONS` (or local simulation tables if separated)
- `portfolio-service`: `POSITIONS`
- `audit-reporting-service`: `AUDIT_EVENTS`
