# OEMS

Order Execution and Management System (OEMS) monorepo for Phase 1 backend and Phase 2 frontend planning.

Last updated: 2026-04-05

## Current Status

1. Phases A through M are completed, and Phase N tasks `T237`-`T245` are completed.
2. Root Maven build is green (`mvnw clean verify`).
3. Active app module: `apps/oems-api` (Spring Boot, Java 25).
4. Flyway migrations and seed data are in place (`V0` to `V13`).
5. Shared contracts/core types for Phase F are in place (enums, value objects, error model, architecture tests).
6. Security baseline is in place (Keycloak realm import, JWT validation, RBAC, auth handlers, and security integration tests).
7. Reference-data module is implemented (`GET /v1/instruments/{symbol}` + tradable/qty/tick validations).
8. Risk module is implemented (risk-limit lookup with fallback, fail-fast risk checks, reject metrics, and persisted risk audit payloads).
9. Order placement core flow is implemented (`POST /v1/orders` with instrument+risk validation, transactional order/event persistence, and integration coverage for success/reject scenarios).
10. Idempotency and duplicate-safety are implemented (`Idempotency-Key` required, canonical request hashing, replay/conflict handling, transactional duplicate protection, optional Redis fast-path cache, TTL cleanup scheduler, and replay/conflict metrics).
11. Query, audit, global error handling, and observability baseline are implemented (`GET /v1/orders/{orderId}`, ops audit-event query, global API exception mapping, trace/trader MDC logging, order outcome/latency metrics, and Prometheus/Grafana alerting assets).
12. Testing and quality automation baseline is implemented (Testcontainers-backed integration test wiring, OpenAPI example contract tests, architecture boundary tests, JaCoCo coverage gate, and Checkstyle/PMD build checks).
13. Performance/CI/deployment baseline is implemented (order-load script, baseline perf report, tuned perf profile, CI pipeline stages, dependency vulnerability scan report step, production Dockerfile, staging deploy manifest with migration step, and release checklist).
14. Phase 2 frontend execution board is published in `docs/OEMS_PHASE2_TASKS_BOARD.md`, including manual QA execution tasks.

## Phase E (DB) Snapshot

1. Core tables created: `instrument`, `order_book`, `order_event`, `idempotency_key`, `risk_limit`.
2. Schema hardening added: order query/event indexes and DB check constraints.
3. Seed data added for instruments and baseline risk limits.
4. Fresh DB reset and migration bootstrap is available via `./scripts/db-reset-local.ps1`.
5. Roll-forward policy is documented in `docs/DB_CHANGE_POLICY.md`.

## Phase I (Risk) Snapshot

1. `risk_limit` is queried with exact (`trader+symbol`) then trader-default fallback.
2. Risk rules implemented with deterministic fail-fast order: max qty, max notional, price band.
3. Rounding/precision is fixed with scale-8 decimal math in risk calculations.
4. API-driven risk checks are wired to `POST /v1/orders`.
5. Rejections map to `422` with standardized `ApiError` codes.
6. Rejection metrics are emitted via `oems.risk.reject.total{rejectCode=...}`.
7. Structured risk audit payloads are persisted in `risk_audit_event`.

## Phase J (Order Placement) Snapshot

1. `POST /v1/orders` is wired end-to-end through `OrderApplicationService`.
2. Request/domain invariants enforce correct `MARKET` vs `LIMIT` rules and mandatory fields.
3. Notional calculation policy is implemented and unit tested for both order types.
4. Orders are persisted in `order_book` with terminal status (`NEW` or `REJECTED`).
5. Event trail is persisted in `order_event` with `ORDER_RECEIVED` and terminal event.
6. Place-order path executes in a single transaction for order + events.
7. Integration tests cover: successful `LIMIT`, successful `MARKET`, instrument-not-found, and all risk rejection variants.

## Phase K (Idempotency) Snapshot

1. `POST /v1/orders` requires `Idempotency-Key` (missing/invalid => deterministic `400 VALIDATION_ERROR`).
2. Canonical request hash is computed to support stable duplicate detection independent of JSON field order.
3. Same key + same payload returns the original status/body without creating a new order.
4. Same key + different payload returns `409 IDEMPOTENCY_CONFLICT`.
5. Concurrent same-key submissions are protected by DB uniqueness + transactional reservation/finalization flow.
6. Final response snapshots are persisted in `idempotency_key` with TTL (`expires_at`) for deterministic replay.
7. Optional Redis idempotency cache is available as a read optimization; MySQL remains source of truth.
8. Scheduled cleanup removes expired idempotency records.
9. Metrics emitted:
   - `idempotency_replay_total`
   - `idempotency_conflict_total`
10. Integration tests cover missing key, replay, conflict, and same-key parallel submissions.

## Phase L (Query, Error Model, Observability) Snapshot

1. `GET /v1/orders/{orderId}` now returns contract-compliant order details with strict trader ownership scoping.
2. Unknown or unauthorized order lookups are normalized to `404 RESOURCE_NOT_FOUND` with the standard `ApiError` payload.
3. Ops audit endpoint is available at `GET /v1/ops/orders/{orderId}/events` and protected with `ROLE_OPS`.
4. A global exception handler now standardizes validation, business, and unexpected failure responses across all controllers.
5. Auth failures remain standardized through dedicated `401/403` handlers with `code`, `path`, `timestamp`, and `traceId`.
6. Request correlation adds `X-Trace-Id` propagation plus MDC-enriched logs: `traceId` and `traderId`.
7. New order metrics are emitted:
   - `orders_accepted_total`
   - `orders_rejected_total`
   - `oems.orders.place.latency` (timer with p95 distribution enabled)
8. Actuator exposure includes `health`, `info`, and `prometheus` (with `prometheus` secured to ops role).
9. Observability assets added:
   - Prometheus alert rules: `ops/prometheus/alerts.yml`
   - Grafana provisioning + baseline dashboard: `ops/grafana/provisioning/*`, `ops/grafana/dashboards/oems-phase1-overview.json`

## Phase M (Testing and Quality Automation) Snapshot

1. JUnit 5 baseline test execution is enforced across all modules from the root build.
2. Integration tests are wired to Testcontainers for MySQL and Redis.
3. Existing order/risk/idempotency/query/audit integration suites are consolidated on a shared containerized base test.
4. OpenAPI example contract validation is automated via JSON schema checks against `docs/api/openapi-phase1.yaml`.
5. Architecture boundary tests are added for `apps/oems-api` layers (`api`, `application`, `domain`, `infrastructure`, `config`).
6. Regression dataset coverage is added for known risk scenarios (`apps/oems-api/src/test/resources/datasets/risk-regression-cases.csv`).
7. Quality gates run in `verify`:
   - JaCoCo report + threshold enforcement
   - Checkstyle (`ops/quality/checkstyle.xml`)
   - PMD (`ops/quality/pmd-ruleset.xml`)
8. Testcontainers suites are configured with `disabledWithoutDocker=true`; they run when Docker is available and are skipped automatically otherwise.

## Phase N (Performance, CI/CD, Deployment) Snapshot

1. `POST /v1/orders` load script is available at `scripts/load-post-orders.js` (k6, configurable `VUS` and `DURATION`).
2. Baseline performance report with p95/p99 and before/after tuning comparison is recorded in `docs/perf/phase1-baseline.md`.
3. Tuned runtime profile is available in `apps/oems-api/src/main/resources/application-perf.properties`.
4. CI pipeline is defined in `.github/workflows/ci.yml` with stages for compile, unit tests, integration tests, package, and a final quality gate.
5. Dependency vulnerability scanning is included in CI (Trivy SARIF + JSON artifact per build).
6. Production Docker image build is defined in root `Dockerfile` with actuator health check.
7. Staging deployment compose manifest is available at `ops/staging/docker-compose.staging.yml`.
8. Staging deploy script is available at `scripts/deploy-staging.ps1` (includes migration execution before API rollout).
9. Release checklist is published at `docs/RELEASE_CHECKLIST_PHASE1.md`.

## Repository Layout

1. `apps/oems-api` - Phase 1 deployable API app.
2. `shared/common` - Shared utilities and common types.
3. `shared/contracts` - Shared contracts/enums.
4. `docs` - PRD, architecture, setup guide, and task board.
5. `scripts` - Build/test/run and local infra/DB automation scripts.
6. `docker-compose.yml` - Local infrastructure (MySQL, Redis, Keycloak, optional Prometheus/Grafana).

## Prerequisites

1. JDK 25
   - `java -version`
2. Maven 3.9+
   - `mvn -version`
3. Docker Desktop
   - `docker version`

## Local Infrastructure Quick Start

1. Create local env file:

```powershell
Copy-Item .env.example .env
```

2. Start required services (MySQL, Redis, Keycloak):

```powershell
./scripts/dev-up.ps1
```

3. Optional: start observability stack (Prometheus + Grafana):

```powershell
./scripts/dev-up.ps1 -WithObservability
```

4. Run readiness checks:

```powershell
./scripts/dev-healthcheck.ps1
./scripts/dev-healthcheck.ps1 -WithObservability
```

5. Stop services:

```powershell
./scripts/dev-down.ps1
./scripts/dev-down.ps1 -ResetVolumes
```

6. Reset local DB quickly (drop/recreate + migrate):

```powershell
./scripts/db-reset-local.ps1
```

7. Open local MySQL shell:

```powershell
./scripts/db-connect.ps1
```

Detailed setup: `docs/SETUP.md`.

## Build, Test, Run

Using wrapper directly:

```powershell
./mvnw.cmd clean verify
./mvnw.cmd test
$env:SPRING_PROFILES_ACTIVE="local"
./mvnw.cmd -f apps/oems-api/pom.xml spring-boot:run
```

Notes:

1. `clean verify` now includes Checkstyle, PMD, JaCoCo, architecture tests, and OpenAPI contract tests.
2. Docker is required for executing Testcontainers-backed integration tests; when Docker is unavailable those specific tests are skipped by design.

Using helper scripts:

```powershell
./scripts/build.ps1
./scripts/test.ps1
./scripts/run-oems-api.ps1
./scripts/run-oems-api.ps1 -MockAuth
./scripts/security-smoke.ps1
./scripts/security-smoke.ps1 -StartApi
```

Idempotency retry load scenario (k6):

```powershell
k6 run `
  -e OEMS_BASE_URL=http://localhost:8080 `
  -e OEMS_BEARER_TOKEN="<jwt>" `
  -e VUS=20 `
  -e DURATION=2m `
  scripts/load-idempotency-retries.js
```

## Local Endpoints

When infrastructure is running:

1. Keycloak Admin: `http://localhost:8081/admin`
2. Keycloak OEMS realm OIDC config: `http://localhost:8081/realms/oems/.well-known/openid-configuration`
3. Prometheus (optional): `http://localhost:9090`
4. Grafana (optional): `http://localhost:3000`

## Planning and Documentation

1. Task board: `docs/OEMS_PHASE1_TASKS_BOARD.md`
2. Task board (Phase 2 frontend): `docs/OEMS_PHASE2_TASKS_BOARD.md`
3. Product requirements: `docs/PHASE1_PRD.md`
4. Setup guide: `docs/SETUP.md`
5. API cookbook: `docs/OEMS_PHASE1_COOKBOOK.md`
6. Contract versioning policy: `docs/CONTRACT_VERSIONING.md`
7. Shared-module usage guide: `docs/SHARED_MODULE_USAGE.md`
8. Security guide: `docs/SECURITY_PHASE1.md`
9. Secrets policy: `docs/SECRETS_POLICY.md`
10. Risk reject catalog: `docs/RISK_CODES.md`
11. Idempotency troubleshooting queries: `docs/IDEMPOTENCY_TROUBLESHOOTING.md`
12. Idempotency load scenario: `docs/perf/idempotency-retry-load-test.md`
13. Phase 1 baseline performance report: `docs/perf/phase1-baseline.md`
14. Phase 1 release checklist: `docs/RELEASE_CHECKLIST_PHASE1.md`
