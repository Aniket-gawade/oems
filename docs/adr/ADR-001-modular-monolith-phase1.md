# ADR-001: Modular Monolith for Phase 1

Date: 2026-03-03  
Status: Accepted  
Owners: Product + Engineering

## Context

Phase 1 scope is intentionally narrow and delivery-focused:

1. `POST /v1/orders` (place order)
2. `GET /v1/orders/{orderId}` (query order)
3. Instrument validation
4. Basic risk checks (max qty, max notional, price band)
5. Idempotency for order placement
6. Immutable audit events
7. JWT/RBAC security and baseline observability

Additional context:

1. Current repository has service scaffolding but no completed business flows.
2. Phase 1 requires fast iteration, simple debugging, and deterministic transactional behavior.
3. Starting with distributed services would add significant overhead:
   - inter-service contracts/versioning
   - network failure handling and retries
   - distributed tracing and operational complexity
   - eventual consistency design for critical order path
4. Phase 1 team and timeline favor implementation speed and correctness over early distribution.

## Decision

For Phase 1, we will implement OEMS as a **modular monolith**:

1. Single deployable application (`apps/oems-api` target structure).
2. Internal module boundaries in code:
   - `auth`
   - `reference-data`
   - `order`
   - `risk`
   - `audit`
3. Inter-module communication is in-process via interfaces/application services, not HTTP.
4. Data persistence uses MySQL as source of truth with Flyway-managed schema.
5. Architecture boundaries will be enforced by package structure and architecture tests.

## Alternatives Considered

### Alternative A: Microservices-first from day one

Pros:

1. Independent deployment per domain.
2. Early separation aligned with long-term target architecture.

Cons:

1. Higher delivery and operational complexity for small Phase 1 scope.
2. Harder end-to-end debugging for early-stage product.
3. Additional infrastructure burden before core behavior is proven.

Decision: Rejected for Phase 1. Can be revisited after stable MVP and load evidence.

### Alternative B: Unstructured monolith (no explicit module boundaries)

Pros:

1. Fast initial coding.

Cons:

1. High risk of tight coupling and architectural erosion.
2. Difficult future extraction to services.
3. Harder ownership and testing boundaries.

Decision: Rejected. We keep monolith runtime but enforce modular design in code.

## Consequences

### Positive consequences

1. Faster Phase 1 delivery with lower infrastructure overhead.
2. Strong transactional consistency for order + audit persistence.
3. Simpler local development, test setup, and incident debugging.
4. Easier to iterate business rules quickly.

### Negative consequences

1. Single deployable unit may grow larger over time.
2. Independent scaling/release by domain is limited.
3. Risk of coupling if module boundaries are not actively enforced.

### Mitigations

1. Keep module boundaries explicit and reviewed.
2. Add architecture tests to prevent forbidden dependencies.
3. Maintain API contracts/events in shared modules for future extraction.
4. Define future split triggers:
   - sustained scaling hotspot in one domain
   - independent release cadence needed by teams
   - operational isolation requirement

## Implementation Impact

1. Proceed with modular monolith tasks in Phase 1 board.
2. Keep `services/` skeleton out of active implementation path for Phase 1.
3. Revisit this ADR after Phase 1 release and performance/operational review.

