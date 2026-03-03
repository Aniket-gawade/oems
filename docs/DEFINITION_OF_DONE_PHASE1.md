# Definition of Done - Phase 1 OEMS

Last updated: 2026-03-03
Applies to: Phase 1 scope (`POST /v1/orders`, `GET /v1/orders/{orderId}`, auth, risk, idempotency, audit)

## 1. Purpose

This checklist defines the minimum measurable criteria required to call a Phase 1 feature or release "done".

## 2. Feature-Level Done Criteria (per task/story)

All conditions below must be true:

1. Functional behavior is complete and matches PRD acceptance criteria.
2. Unit tests are added/updated for changed logic.
3. Integration tests are added/updated for API/data path changes.
4. No regression in existing tests.
5. API errors use standardized error model (`code`, `message`, `status`, `path`, `timestamp`, `traceId`).
6. DB changes are delivered through Flyway migration scripts only.
7. Relevant docs are updated in same PR (ADR/API/cookbook/task board if impacted).

## 3. Measurable Release Gates (Phase 1)

All gates are mandatory for Phase 1 release.

### 3.1 Functional gates

1. `POST /v1/orders` acceptance criteria pass (`AC-POST-001` to `AC-POST-111`).
2. `GET /v1/orders/{orderId}` acceptance criteria pass (`AC-GET-001` to `AC-GET-103`).
3. Idempotency behavior passes:
   - same key + same payload => same response replay
   - same key + different payload => `409 IDEMPOTENCY_CONFLICT`

### 3.2 Quality gates

1. `mvn clean verify` passes on default CI branch.
2. Integration test suite passes in CI with containerized dependencies.
3. Test coverage threshold >= 80% line coverage (or agreed CI threshold, whichever is stricter).
4. No critical/high severity open defects linked to Phase 1 scope.

### 3.3 Performance and reliability gates

1. `POST /v1/orders` p95 <= 150 ms at baseline load (100 RPS, 10 minutes).
2. `POST /v1/orders` p99 <= 300 ms at same baseline.
3. Duplicate order creation rate due to retries = 0% in idempotency test scenarios.
4. 5xx error rate for order placement <= 0.5% during baseline load test.

### 3.4 Security gates

1. JWT validation is enabled for protected APIs.
2. Role checks are enforced:
   - only `TRADER` for trader order endpoints
   - `OPS` restricted for operational endpoints
3. Auth tests pass for required paths:
   - unauthenticated => `401`
   - unauthorized role => `403`

### 3.5 Observability and operability gates

1. 100% of API responses include `X-Trace-Id`.
2. >= 99.9% of request logs include `traceId`, `path`, `httpStatus`.
3. >= 99.9% of error logs include `traceId`, `errorCode`.
4. Core metrics are scrapeable by Prometheus every 15 seconds.
5. Health endpoint is reachable and reports healthy state in target environment.

### 3.6 Data and migration gates

1. Flyway migrations apply on a fresh MySQL database with no manual SQL.
2. Schema validation is enabled (`ddl-auto=validate` equivalent policy).
3. Order and audit event writes are transactionally consistent.

### 3.7 Documentation and readiness gates

1. PRD is up to date for any behavior changes.
2. Relevant ADRs are present and accepted (`ADR-001` to `ADR-004` for current foundation).
3. Runbook and release checklist are updated for deployment/incident handling.
4. UAT sign-off is recorded with no blocker issues.

## 4. Verification Evidence Required

For each release candidate, collect and store:

1. CI link/artifacts proving build + test success.
2. Performance report with measured p95/p99 and error rate.
3. Security/auth test evidence (`401/403/role` checks).
4. Idempotency test evidence (replay and conflict cases).
5. Migration run evidence on clean MySQL instance.
6. UAT sign-off note and open-risk summary.

## 5. Completion Decision Rule

Phase 1 is considered complete only when:

1. All measurable gates in Section 3 pass.
2. Required evidence in Section 4 is available.
3. Product + Engineering + Ops sign off release readiness.

