# OEMS Phase 1 PRD

Last updated: 2026-03-03
Owner: Product + Engineering
Status: Draft v1

## 1. Product Vision

Build a simple and reliable OEMS Phase 1 that allows authenticated traders to place an order for an instrument and retrieve order status by order id.

## 2. Problem Statement

Traders need a fast and consistent way to submit orders with basic pre-trade checks and receive immediate, auditable outcomes.

## 3. Phase 1 Goals

1. Allow authenticated trader to place a market or limit order.
2. Validate instrument and basic risk rules before accepting order.
3. Persist immutable audit events for each order attempt.
4. Allow trader to fetch order details by order id.
5. Return deterministic, machine-readable errors.

## 4. In Scope

1. Authentication with JWT and role-based access (`TRADER`, `OPS`).
2. Instrument read/validation (symbol existence and tradable status).
3. Order placement API: `POST /v1/orders`.
4. Order query API: `GET /v1/orders/{orderId}`.
5. Basic risk checks:
   - max quantity
   - max notional
   - price band
6. Idempotency key handling for order placement.
7. Order and event persistence in PostgreSQL.
8. Basic observability:
   - health endpoint
   - request trace id
   - core metrics

## 5. Out of Scope

1. Exchange or broker connectivity.
2. Advanced order types beyond market/limit.
3. Amend/cancel flow.
4. Portfolio projection.
5. Complex risk models (VaR, concentration, Greeks).
6. Multi-region deployment and DR automation.
7. Full reporting suite and regulatory exports.

## 6. Personas

1. Trader:
   - Places orders.
   - Checks order status.
2. Ops user:
   - Monitors system health and audit data.

## 7. User Stories

1. Place Order Story (mandatory)
   - As a trader, I want to place an order for a tradable instrument so that the system can accept or reject it immediately with a clear reason.

2. Get Order Story (mandatory)
   - As a trader, I want to fetch an order by id so that I can see its latest status and details.

3. Ops Observability Story
   - As an ops user, I want to inspect health and order/audit signals so that I can diagnose incidents quickly.

## 8. Functional Requirements

1. Authentication and Authorization
   - All APIs require valid JWT.
   - Only `TRADER` can place and query trader orders.
   - `OPS` can access operational/audit endpoints.

2. Place Order (`POST /v1/orders`)
   - Accepts market and limit orders.
   - Requires `Idempotency-Key` header.
   - Validates payload schema and business rules.
   - Runs instrument and risk checks before decision.
   - Persists order and audit events.
   - Returns:
     - `201` on accepted order.
     - deterministic error on rejected/invalid request.

3. Get Order (`GET /v1/orders/{orderId}`)
   - Returns order details for the requesting trader.
   - Returns `404` if order not found (or not visible to user based on policy).

4. Audit
   - Every order attempt must create `ORDER_RECEIVED` event.
   - Terminal event must be persisted:
     - `ORDER_ACCEPTED` or `ORDER_REJECTED`.

5. Idempotency
   - Same key + same payload returns original response.
   - Same key + different payload returns conflict.

## 9. Business Rules (Phase 1)

1. Instrument must exist and be tradable.
2. Quantity must be positive and within instrument/risk limits.
3. Notional must be within trader limits.
4. Limit order requires valid price.
5. Price must satisfy configured price-band rule.

## 10. API Outcomes and Error Model

Standard error payload fields:

1. `code`
2. `message`
3. `status`
4. `path`
5. `timestamp`
6. `traceId`

Initial error code set:

1. `VALIDATION_ERROR`
2. `INSTRUMENT_NOT_FOUND`
3. `INSTRUMENT_NOT_TRADABLE`
4. `RISK_MAX_QTY_EXCEEDED`
5. `RISK_MAX_NOTIONAL_EXCEEDED`
6. `RISK_PRICE_BAND_EXCEEDED`
7. `IDEMPOTENCY_CONFLICT`
8. `UNAUTHORIZED`
9. `FORBIDDEN`
10. `INTERNAL_SERVER_ERROR`

## 11. Non-Functional Requirements (Phase 1 Targets)

1. Performance
   - `POST /v1/orders` p95 under 150 ms in staging baseline load.
2. Reliability
   - No duplicate order creation for idempotent retries.
3. Security
   - JWT validation and role checks on all protected endpoints.
4. Observability
   - All requests include trace id.
   - Core metrics exposed to Prometheus.
5. Data Integrity
   - Order and event writes occur atomically.

## 12. Success Metrics

1. Order placement success path works end-to-end.
2. All planned rejection cases return deterministic codes.
3. Zero duplicate orders under idempotency replay tests.
4. p95 latency target met in baseline performance run.
5. UAT sign-off for trader and ops flows.

## 13. Assumptions

1. Phase 1 is built as a modular monolith.
2. PostgreSQL is the source of truth.
3. Keycloak is available for JWT issuing in all environments.
4. Market data feed is not required in Phase 1; reference values are configured/seeded.

## 14. Dependencies

1. Infrastructure availability: Postgres, Redis, Keycloak.
2. Security realm and roles configured.
3. Seed data for instruments and risk limits.
4. CI pipeline for repeatable validation.

## 15. Risks and Mitigations

1. Risk: ambiguous business validation rules.
   - Mitigation: lock rules in this PRD + API examples early.
2. Risk: duplicate orders due to retries.
   - Mitigation: enforce idempotency key + transactional checks.
3. Risk: observability gaps during incidents.
   - Mitigation: trace id, metrics, and runbook before release.

## 16. Release Criteria (Phase 1)

1. `POST /v1/orders` and `GET /v1/orders/{orderId}` are production-ready.
2. Security and idempotency tests pass.
3. Migration and deployment are automated.
4. UAT completed with no open blockers.

