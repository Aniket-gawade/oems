# ADR-002: MySQL as Primary Data Store for Phase 1

Date: 2026-03-03  
Status: Accepted  
Owners: Product + Engineering

## Context

Phase 1 OEMS requirements need a transactional relational store for:

1. Order persistence (`order_book`)
2. Immutable audit events (`order_event`)
3. Idempotency tracking (`idempotency_key`)
4. Reference data (`instrument`)
5. Risk limits (`risk_limit`)

System needs in Phase 1:

1. Strong consistency for order + audit writes in a single transaction
2. Predictable query performance for point lookups and indexed reads
3. Simple local/staging setup with Docker
4. Good Spring Boot + Flyway support
5. Low operational complexity for MVP timeline

Repository direction is already aligned to MySQL in service configuration and Phase 1 planning documents.

## Decision

Use **MySQL (8.4 LTS)** as the primary source of truth for Phase 1.

Implementation decisions:

1. Use InnoDB tables for transactional consistency and row-level locking.
2. Use Flyway for schema migration and versioned database changes.
3. Use MySQL JSON columns where flexible payload storage is required (for audit/idempotency response payloads).
4. Keep application-level domain invariants and DB constraints both enforced.
5. Keep schema design compatible with later service decomposition.

## Rationale

1. MySQL provides the ACID guarantees required for order workflows.
2. MySQL + Spring Data JPA + Flyway is mature and widely supported.
3. Operational model is straightforward for local, staging, and managed environments.
4. Team onboarding is faster with common tooling and ecosystem familiarity.
5. LTS version (8.4) gives stability for MVP delivery window.

## Alternatives Considered

### Alternative A: PostgreSQL as primary store

Pros:

1. Strong SQL feature set.
2. Advanced indexing/query options.

Cons:

1. Not aligned with current project direction and service configuration in this repo.
2. Would require rework in planning/docs already shifted to MySQL.

Decision: Rejected for Phase 1 to avoid unnecessary switching cost and maintain consistency.

### Alternative B: NoSQL-first (for example document DB)

Pros:

1. Flexible schema evolution for event payloads.

Cons:

1. We still need relational integrity and transactional semantics for order path.
2. Additional complexity for joins/constraints and risk of weak consistency patterns.

Decision: Rejected for Phase 1 core transaction system.

### Alternative C: Polyglot persistence in Phase 1

Pros:

1. Can optimize storage per use case.

Cons:

1. Premature complexity for MVP scope.
2. Higher operational and testing overhead.

Decision: Rejected for Phase 1. Reconsider after real scale signals.

## Consequences

### Positive consequences

1. Consistent, transactional order handling with strong integrity.
2. Faster development and debugging due to single primary relational store.
3. Lower operational overhead in early product stage.
4. Clear migration/versioning process with Flyway.

### Negative consequences

1. Vendor-specific SQL differences may need attention in future migration scenarios.
2. JSON querying is less expressive than specialized document/event stores for some advanced analytics.
3. Scaling write-heavy workloads may require additional sharding/partitioning strategy later.

### Mitigations

1. Keep SQL migrations clean, explicit, and reviewed.
2. Avoid unnecessary DB-specific constructs where portable options are sufficient.
3. Add targeted indexes based on measured query patterns.
4. Re-evaluate storage strategy after Phase 1 performance and usage metrics are available.

## Implementation Impact

1. Continue using MySQL container/service in local setup docs and tasks.
2. Use MySQL driver dependency in application modules.
3. Align Testcontainers setup to MySQL.
4. Ensure all schema examples and runbooks use MySQL syntax and tooling.

