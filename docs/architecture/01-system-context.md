# OEMS Phase 1 - System Context

Last updated: 2026-03-15

## Overview

This diagram shows the Phase 1 runtime context with external actors and core dependencies.

```mermaid
flowchart LR
    Trader[Trader Client] -->|HTTPS + JWT| API[OEMS API]
    Ops[Ops User] -->|HTTPS + JWT| API
    API -->|SQL| MySQL[(MySQL 8.4)]
    API -->|Idempotency Cache| Redis[(Redis 8.6)]
    API -->|OIDC Discovery + JWKS| Keycloak[Keycloak 26.5.x]
    API -->|/actuator/prometheus| Prometheus[Prometheus]
    Prometheus --> Grafana[Grafana]
```

## Notes

1. MySQL is the primary source of truth for orders, events, and idempotency records.
2. Redis is a performance optimization for idempotency lookup, not the source of truth.
3. Keycloak issues and validates JWT tokens consumed by the API.
