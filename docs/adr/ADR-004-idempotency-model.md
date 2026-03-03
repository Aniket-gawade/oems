# ADR-004: DB-First Idempotency Model for `POST /v1/orders`

Date: 2026-03-03  
Status: Accepted  
Owners: Product + Engineering

## Context

`POST /v1/orders` is a write operation exposed over HTTP, where retries are expected due to:

1. Client/network timeouts
2. Transient gateway failures
3. Client retry policies

Without idempotency, retries can create duplicate orders and inconsistent audit trails.

Phase 1 requirements:

1. Same idempotency key + same payload must return original response.
2. Same idempotency key + different payload must return conflict.
3. Source of truth must be strongly consistent and transaction-safe.

## Decision

Use a **DB-first idempotency model** with MySQL as the authoritative store.

Key decisions:

1. `Idempotency-Key` header is mandatory for `POST /v1/orders`.
2. Compute `request_hash` from a canonical request representation.
3. Persist idempotency records in MySQL table `idempotency_key` with unique constraint on `idem_key`.
4. Persist final API response snapshot (`response_status`, `response_body`) for replay.
5. Redis may be used as optional read optimization cache only; MySQL remains source of truth.

## DB-First Flow (Authoritative)

1. Validate `Idempotency-Key` presence and format.
2. Compute `request_hash`.
3. Lookup by `idem_key` in MySQL:
   - If no record exists:
     - create new record in `PROCESSING` state (or equivalent lock marker) with `request_hash`.
   - If record exists and `request_hash` differs:
     - return `409 IDEMPOTENCY_CONFLICT`.
   - If record exists and `request_hash` matches and response snapshot exists:
     - return stored response (idempotent replay).
   - If record exists and still processing:
     - return deterministic retry signal (`409` or project-selected equivalent).
4. For new processing record:
   - execute business flow (instrument/risk/order/audit) transactionally.
   - store terminal response snapshot into idempotency record.
5. Commit transaction.
6. Subsequent identical retries return stored response snapshot.

## Rationale

1. DB-first gives strong consistency for correctness-critical deduplication.
2. Unique constraint and transactional operations are reliable under concurrency.
3. Response snapshot replay guarantees deterministic client behavior.
4. Cache-only idempotency is avoided as source-of-truth because cache eviction/network issues can cause duplicates.

## Alternatives Considered

### Alternative A: Cache-first idempotency (Redis-only)

Pros:

1. Very low-latency reads/writes.

Cons:

1. Risk of duplicate acceptance on cache loss/eviction/restart.
2. Harder correctness guarantees under distributed failures.

Decision: Rejected as authoritative model.

### Alternative B: No response snapshot (dedupe only)

Pros:

1. Simpler storage model.

Cons:

1. Cannot return deterministic original response for retries.
2. Clients may see inconsistent status for same logical request.

Decision: Rejected.

### Alternative C: Client-order-id only dedupe

Pros:

1. Reduces one explicit header requirement.

Cons:

1. Semantics are weaker and can collide with business identifiers.
2. Does not fully model transport retry idempotency.

Decision: Rejected for Phase 1.

## Consequences

### Positive consequences

1. Duplicate order creation risk is strongly reduced.
2. Deterministic retry behavior for clients.
3. Clear operational troubleshooting using durable DB records.

### Negative consequences

1. Additional write/read overhead on order placement path.
2. Requires careful handling of `PROCESSING`/terminal states.
3. Slightly more schema and test complexity.

### Mitigations

1. Add targeted indexes and keep idempotency records compact.
2. Add cleanup policy for expired records.
3. Add concurrency integration tests for same-key parallel requests.
4. Optionally add Redis cache as non-authoritative read optimization.

## Implementation Impact

1. Add idempotency table/entity/repository as first-class component.
2. Enforce unique key and request-hash conflict logic.
3. Persist response snapshot for both accepted and rejected business outcomes.
4. Add explicit metrics:
   - replay count
   - conflict count
   - in-progress contention count

