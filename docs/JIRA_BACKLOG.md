# OEMS Jira-Style Backlog (Repo-Tracked)

Use this file as the single source of truth for planning + execution.

## Update Workflow

1. Pick the next `To Do` item.
2. Implement code changes.
3. Commit with ticket key in message, for example: `OEMS-202 create order API for market/limit`.
4. Update this file in the same commit:
   - Set `Status` (`In Progress` -> `Done`).
   - Add short commit hash in `Commit`.
   - Add date in `Updated On` (`YYYY-MM-DD`).
5. Push.

Status values: `To Do`, `In Progress`, `Blocked`, `Done`

---

## Epics

| Key | Summary | Status |
|---|---|---|
| OEMS-EP1 | Platform Foundation | In Progress |
| OEMS-EP2 | Order Lifecycle Core | To Do |
| OEMS-EP3 | Risk Controls | To Do |
| OEMS-EP4 | Execution Simulator | To Do |
| OEMS-EP5 | Query, Audit, Ops Readiness | To Do |

---

## Sprint 0 - Platform Foundation

| Key | Type | Epic | Summary | SP | Status | Commit | Updated On | Notes |
|---|---|---|---|---:|---|---|---|---|
| OEMS-101 | Task | OEMS-EP1 | Monorepo modules and parent POM | 3 | Done | - | 2026-03-03 | Completed in local scaffold |
| OEMS-102 | Task | OEMS-EP1 | Use `application.properties` across services | 1 | Done | - | 2026-03-03 | Converted from YAML |
| OEMS-103 | Task | OEMS-EP1 | MySQL + Flyway baseline per service | 3 | Done | - | 2026-03-03 | Baseline migration placeholders added |
| OEMS-104 | Story | OEMS-EP1 | Docker Compose for MySQL/Redis/Prometheus/Grafana | 5 | To Do |  |  |  |
| OEMS-105 | Story | OEMS-EP1 | JWT auth + roles (`TRADER`,`RISK`,`OPS`) | 5 | To Do |  |  |  |
| OEMS-106 | Story | OEMS-EP1 | Global error model + exception handling | 3 | To Do |  |  |  |
| OEMS-107 | Story | OEMS-EP1 | OpenAPI setup for all services | 3 | To Do |  |  |  |
| OEMS-108 | Story | OEMS-EP1 | CI pipeline (`clean verify`) + quality gate placeholders | 3 | To Do |  |  |  |

---

## Sprint 1 - Order Lifecycle Core

| Key | Type | Epic | Summary | SP | Status | Commit | Updated On | Notes |
|---|---|---|---|---:|---|---|---|---|
| OEMS-201 | Story | OEMS-EP2 | Order domain model + valid state transitions | 5 | To Do |  |  |  |
| OEMS-202 | Story | OEMS-EP2 | `POST /orders` for market/limit | 5 | To Do |  |  |  |
| OEMS-203 | Story | OEMS-EP2 | Idempotency key for order create | 5 | To Do |  |  |  |
| OEMS-204 | Story | OEMS-EP2 | Amend order API | 3 | To Do |  |  |  |
| OEMS-205 | Story | OEMS-EP2 | Cancel order API | 3 | To Do |  |  |  |
| OEMS-206 | Story | OEMS-EP2 | Immutable order audit/event persistence | 5 | To Do |  |  |  |
| OEMS-207 | Story | OEMS-EP2 | Integration tests for lifecycle scenarios | 5 | To Do |  |  |  |
| OEMS-208 | Story | OEMS-EP2 | Performance harness (`POST /orders p95 < 100ms`) | 3 | To Do |  |  |  |

---

## Sprint 2 - Risk + Execution Simulator

| Key | Type | Epic | Summary | SP | Status | Commit | Updated On | Notes |
|---|---|---|---|---:|---|---|---|---|
| OEMS-301 | Story | OEMS-EP3 | Risk rules: max qty/notional/price band | 5 | To Do |  |  |  |
| OEMS-302 | Story | OEMS-EP3 | Standard risk reject reason model | 3 | To Do |  |  |  |
| OEMS-303 | Story | OEMS-EP3 | Order -> Risk synchronous integration | 3 | To Do |  |  |  |
| OEMS-304 | Story | OEMS-EP4 | Execution mode API/config enum | 3 | To Do |  |  |  |
| OEMS-305 | Story | OEMS-EP4 | `AUTO_ACK` mode | 2 | To Do |  |  | ACK only, no fills |
| OEMS-306 | Story | OEMS-EP4 | `SINGLE_FULLY_FILLED` mode | 3 | To Do |  |  | One fill completes order |
| OEMS-307 | Story | OEMS-EP4 | `SINGLE_PARTIAL_FILLED` mode | 3 | To Do |  |  | Stays partial until cancel/modify |
| OEMS-308 | Story | OEMS-EP4 | `MULTI_FULLY_FILLED` mode | 3 | To Do |  |  | Multi fills complete order |
| OEMS-309 | Story | OEMS-EP4 | Tests for all 4 simulator modes | 5 | To Do |  |  |  |

---

## Sprint 3 - Query, Audit, Ops Readiness

| Key | Type | Epic | Summary | SP | Status | Commit | Updated On | Notes |
|---|---|---|---|---:|---|---|---|---|
| OEMS-401 | Story | OEMS-EP5 | `GET /orders/{id}` + filtered list APIs | 5 | To Do |  |  |  |
| OEMS-402 | Story | OEMS-EP5 | Portfolio projection from fills | 5 | To Do |  |  |  |
| OEMS-403 | Story | OEMS-EP5 | DB indexes for query performance | 3 | To Do |  |  |  |
| OEMS-404 | Story | OEMS-EP5 | Trace IDs + metrics + baseline dashboard | 5 | To Do |  |  |  |
| OEMS-405 | Story | OEMS-EP5 | Runbook + UAT checklist + release candidate | 3 | To Do |  |  |  |

---

## Definition of Done (for each ticket)

- Build passes: `./mvnw -DskipTests clean verify` (or `mvnw.cmd` on Windows).
- Relevant tests added/updated.
- API/contract changes documented.
- `Status`, `Commit`, and `Updated On` updated in this file.
