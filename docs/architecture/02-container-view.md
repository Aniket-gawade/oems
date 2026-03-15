# OEMS Phase 1 - Container View

Last updated: 2026-03-15

## Overview

Phase 1 is implemented as a modular monolith. This view shows runtime modules and their primary dependencies.

```mermaid
flowchart TB
    Trader[Trader Client]
    Ops[Ops User]
    Keycloak[Keycloak]
    MySQL[(MySQL)]
    Redis[(Redis)]

    subgraph OEMS["OEMS API (Modular Monolith)"]
        API[HTTP API Layer]
        RefData[ref-data module]
        Order[order module]
        Risk[risk module]
        Audit[audit module]
    end

    Trader --> API
    Ops --> API
    API --> RefData
    API --> Order
    API --> Risk
    API --> Audit

    Order --> RefData
    Order --> Risk
    Order --> Audit
    Order --> MySQL
    RefData --> MySQL
    Risk --> MySQL
    Audit --> MySQL
    Order --> Redis
    API --> Keycloak
```

## Module Responsibilities

1. `ref-data`: instrument lookup and tradability constraints.
2. `order`: request orchestration, idempotency, and persistence of order state.
3. `risk`: pre-trade checks (max quantity, max notional, price band).
4. `audit`: immutable order-event trail creation and retrieval.
