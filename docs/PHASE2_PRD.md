# OEMS Phase 2 PRD (Frontend)

Last updated: 2026-04-05
Owner: Product + Engineering + QA
Status: Draft v1 (Phase A baseline)

## 1. Product Vision

Deliver a secure, fast, and testable frontend for OEMS that enables traders to place and track orders and allows ops users to inspect audit data with clear operational context.

## 2. Problem Statement

Phase 1 provides stable backend APIs, but users still need a browser-based workflow to execute order flows without API tooling and for QA to validate behavior manually.

## 3. Phase 2 Goals

1. Provide role-aware frontend access for trader and ops workflows.
2. Provide production-ready UX for order placement, order lookup, and ops audit investigation.
3. Provide deterministic, user-friendly handling of validation, rejection, idempotency replay/conflict, and auth failures.
4. Provide QA-ready manual testability with clear scenario templates and evidence requirements.

## 4. In Scope

1. Web app shell, route model, and role-aware navigation.
2. OIDC login/logout/session handling against Keycloak.
3. Trader flows:
   - place order
   - view immediate order outcome
   - lookup order by order id
4. Ops flows:
   - query order audit events
   - inspect event payloads and troubleshooting context
5. Frontend integration with existing Phase 1 APIs and standardized `ApiError`.
6. Frontend loading/empty/error states, notifications, and form-validation UX patterns.
7. Manual QA-ready acceptance definitions and evidence templates.

## 5. Out of Scope

1. New backend business capabilities beyond Phase 1 APIs.
2. Amend/cancel order functionality.
3. Real-time streaming market data and live blotter feeds.
4. Mobile native app implementation.
5. Multi-tenant theming/white-label support.
6. Production-grade BI analytics module.

## 6. Personas and Goals

1. `TRADER`
   - Place MARKET/LIMIT orders quickly and safely.
   - Understand acceptance/rejection reason immediately.
   - Find an order by id without backend/API tooling.
2. `OPS`
   - Access audit events for incident/debug workflows.
   - Read payload and trace context quickly.
   - Distinguish auth/permission/data issues from business rejects.
3. `QA`
   - Execute deterministic manual functional checks across key scenarios.
   - Capture pass/fail evidence consistently.
   - Reproduce idempotency and error scenarios without code changes.

## 7. Core User Journeys

1. Trader Order Entry Journey
   - Login -> open place-order screen -> submit order -> review success/rejection -> open order detail.
2. Trader Order Lookup Journey
   - Login -> enter order id -> view detail/status or not-found outcome.
3. Ops Audit Journey
   - Login as ops -> search by order id -> view event timeline + payload -> export/copy details for incident note.

## 8. Screen Inventory

1. `Login`
2. `Auth Callback`
3. `Unauthorized`
4. `Not Found`
5. `Trader Dashboard`
6. `Place Order`
7. `Order Lookup`
8. `Order Detail`
9. `Ops Dashboard`
10. `Ops Audit Search`
11. `Ops Audit Detail`

## 9. Navigation IA and Route Map

| Route | Screen | Visibility | Notes |
| --- | --- | --- | --- |
| `/login` | Login | Public | Entry point for unauthenticated users |
| `/auth/callback` | Auth Callback | Public | OIDC redirect handling |
| `/` | Role landing | `TRADER`, `OPS` | Redirect to default dashboard by role |
| `/trader` | Trader Dashboard | `TRADER` | Trader home |
| `/trader/place-order` | Place Order | `TRADER` | Primary trading action |
| `/orders/lookup` | Order Lookup | `TRADER`, `OPS` | Search by order id |
| `/orders/:orderId` | Order Detail | `TRADER`, `OPS` | Detail read view |
| `/ops` | Ops Dashboard | `OPS` | Ops home |
| `/ops/audit` | Ops Audit Search | `OPS` | Audit search form |
| `/ops/audit/:orderId` | Ops Audit Detail | `OPS` | Events + payload view |
| `/unauthorized` | Unauthorized | Protected | Shown on role denial |
| `*` | Not Found | Public | Unknown route handling |

Role visibility matrix:

| Capability | Trader | Ops | QA (as role holder) |
| --- | --- | --- | --- |
| Login/logout | Yes | Yes | Yes |
| Place order | Yes | No | Yes (as trader) |
| Lookup order | Yes | Yes | Yes |
| View ops audit events | No | Yes | Yes (as ops) |

## 10. Frontend API Dependency Map (Phase 1 Backend)

| Backend API | Method | Used by Screen(s) | Primary UX Purpose |
| --- | --- | --- | --- |
| `/v1/orders` | `POST` | Place Order | Submit order and render accepted/rejected outcome |
| `/v1/orders/{orderId}` | `GET` | Order Lookup, Order Detail | Retrieve order details by id |
| `/v1/instruments/{symbol}` | `GET` | Place Order | Validate/display instrument constraints |
| `/v1/ops/orders/{orderId}/events` | `GET` | Ops Audit Detail | Show audit trail for incident/debug |

Common response model dependencies:

1. Standardized backend `ApiError` fields: `code`, `message`, `status`, `path`, `timestamp`, `traceId`.
2. Trace correlation header: `X-Trace-Id`.
3. Idempotency contract: `Idempotency-Key` on `POST /v1/orders`.

## 11. Frontend Security Requirements (Token and Session)

1. Use OIDC Authorization Code + PKCE flow with Keycloak.
2. Store tokens in memory where feasible; avoid local persistent storage for access tokens.
3. If refresh token storage is required by chosen library, apply secure browser storage policy and strict environment gating.
4. Attach bearer token on protected API requests only.
5. Enforce route-level role checks:
   - trader routes require `TRADER`
   - ops routes require `OPS`
6. On `401`, clear session and redirect to login.
7. On `403`, keep session and render authorization denial UX.
8. Disable any mock-auth mode outside local/dev environments.
9. Do not log tokens or sensitive PII in frontend logs.

## 12. Browser and Device Support Matrix

| Platform | Minimum Version | Support Level |
| --- | --- | --- |
| Chrome (desktop) | 124+ | Primary |
| Edge (desktop) | 124+ | Primary |
| Firefox (desktop) | 125+ | Secondary |
| Safari (macOS) | 17+ | Secondary |
| Chrome (Android) | 124+ | Secondary |
| Safari (iOS) | 17+ | Secondary |

Responsive target breakpoints:

1. Mobile: `360-767px`
2. Tablet: `768-1023px`
3. Desktop: `1024px+`

## 13. Non-Functional Requirements (Phase 2 Targets)

1. Performance
   - Route-level p75 FCP <= 1.8s on desktop baseline (staging, warm CDN/cache).
   - Route-level p75 FCP <= 2.5s on mobile baseline (simulated mid-tier 4G).
   - p95 user action-to-visible-feedback latency <= 150ms for UI actions (button -> spinner/toast/error visible).
2. Reliability
   - Frontend unhandled runtime exceptions on critical routes <= 0.1% of sessions.
   - Frontend-induced duplicate submit rate <= 0.1% of order submit attempts (excluding intentional QA tests).
3. Accessibility
   - WCAG 2.2 AA baseline for key screens (`Login`, `Place Order`, `Order Detail`, `Ops Audit`).
   - Keyboard-only completion for critical flows must be possible (no mouse required).
   - Zero critical accessibility violations in automated checks on key routes.
4. Security
   - 100% protected API calls include valid bearer token or are blocked before request.
   - 0 known token leaks in logs, toasts, or client telemetry payloads.
5. Observability
   - >= 99.9% of surfaced error states include trace id when backend provides it.
   - Client error logging includes route and error code without exposing secrets.

## 14. UX Standards

### 14.1 Loading, Empty, and Error Patterns

1. Loading
   - Page-level first load: skeleton layout.
   - Action-level requests: inline spinner + disabled action button.
2. Empty
   - Show neutral explanation and recommended next action.
   - No empty table without message.
3. Error
   - Recoverable: inline message with retry action.
   - Non-recoverable: stable error panel with trace id and support hint.
   - Auth failures route to login/unauthorized flows without page crash.

### 14.2 Notification and Form Error Standards

1. Toast levels
   - `success`: completion outcomes (for example order accepted).
   - `warning`: recoverable non-blocking issues.
   - `error`: failed action requiring user intervention.
2. Form errors
   - Client validation errors show inline near field before submit.
   - Backend validation errors map to exact field when possible.
   - Top-form summary appears when multiple fields fail.

## 15. Functional UX Acceptance Criteria

### 15.1 Place Order UX Criteria

Success:

1. `AC-UI-POST-001` Valid LIMIT order
   - Given trader session and valid inputs
   - When user submits
   - Then UI shows success state with `orderId` and link to detail page.
2. `AC-UI-POST-002` Valid MARKET order
   - Given trader session and valid MARKET payload
   - When user submits without price
   - Then UI submits successfully and displays terminal outcome.

Failure and edge:

1. `AC-UI-POST-101` Client validation fail blocks submit and highlights fields.
2. `AC-UI-POST-102` Backend `VALIDATION_ERROR` maps to inline field/global messages.
3. `AC-UI-POST-103` Instrument/risk rejection displays backend code and readable guidance.
4. `AC-UI-POST-104` Same idempotency key + same payload replay is shown as deterministic prior outcome.
5. `AC-UI-POST-105` Same idempotency key + changed payload conflict is shown as conflict state.
6. `AC-UI-POST-106` Transient network failure preserves draft and offers retry.

### 15.2 Order Lookup and Detail UX Criteria

1. `AC-UI-GET-001` Valid order id returns detail view with status and core fields.
2. `AC-UI-GET-002` Invalid id format is blocked client-side before request.
3. `AC-UI-GET-003` Not-found/hidden response shows neutral not-found UX without leaking ownership details.
4. `AC-UI-GET-004` Errors show retry option and trace id when present.

### 15.3 Ops Audit UX Criteria

1. `AC-UI-OPS-001` Ops user can search by order id and view ordered event timeline.
2. `AC-UI-OPS-002` Event payload is readable via expandable JSON viewer with copy support.
3. `AC-UI-OPS-003` Non-ops users are blocked from ops audit routes and API calls.
4. `AC-UI-OPS-004` Auth and permission failures are distinguishable in UX.

## 16. Manual QA Acceptance Template (Per Feature)

Use the template below in QA checklist and evidence logs.

| Field | Required Content |
| --- | --- |
| `Test Case ID` | Stable id (example: `QA-POST-001`) |
| `Feature` | Screen/flow under test |
| `Preconditions` | Accounts, environment, seeded data, login state |
| `Steps` | Ordered manual actions |
| `Expected Result` | Observable expected behavior |
| `Actual Result` | Observed behavior during run |
| `Pass/Fail` | Final verdict |
| `Evidence` | Screenshot/video/log/trace id link |
| `Defect Link` | Issue id if failed |
| `Executed By` | QA owner |
| `Executed On` | Date and environment |

## 17. Assumptions

1. Phase 1 backend APIs remain contract-compatible during initial Phase 2 implementation.
2. Keycloak realm/users used in Phase 1 remain available for Phase 2 test flows.
3. Frontend can use a local mock-auth mode only for development and QA acceleration.

## 18. Dependencies

1. Stable OpenAPI spec at `docs/api/openapi-phase1.yaml`.
2. Backend local/staging environments with seeded instrument and risk data.
3. QA accounts (`trader1`, `ops1`) and role configuration.
4. CI support for frontend lint/test/build and browser E2E.

## 19. Risks and Mitigations

1. Risk: UX behavior diverges from backend error semantics.
   - Mitigation: centralized error mapping and AC-driven tests.
2. Risk: session/token handling introduces security exposure.
   - Mitigation: strict storage policy and mandatory auth regression tests.
3. Risk: manual QA results are inconsistent across testers.
   - Mitigation: enforce the standardized QA template and evidence capture.

## 20. Release Criteria (Phase 2)

1. Critical trader and ops journeys pass defined UX acceptance criteria.
2. Manual QA scenarios have evidence and no open blocker defects.
3. Frontend quality gates (lint/test/e2e/build/security checks) pass in CI.
4. UAT sign-off is captured or accepted-risk log is approved.

