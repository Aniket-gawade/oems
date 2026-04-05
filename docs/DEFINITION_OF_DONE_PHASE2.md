# Definition of Done - Phase 2 OEMS Frontend

Last updated: 2026-04-05
Applies to: Phase 2 frontend scope (auth UX, trader order entry, order lookup/detail, ops audit, frontend QA readiness)

## 1. Purpose

This checklist defines the minimum measurable criteria required to call a Phase 2 frontend feature or release "done".

## 2. Feature-Level Done Criteria (Per Task/Story)

All conditions below must be true:

1. Functional behavior matches `docs/PHASE2_PRD.md` acceptance criteria.
2. Unit tests are added/updated for changed UI logic and utilities.
3. Integration tests are added/updated for API adapters and error mapping changes.
4. Existing tests pass with no regressions.
5. UX states are complete for loading, empty, error, and success outcomes.
6. Accessibility checks are completed for changed screens/components.
7. Relevant docs and task board status are updated in the same PR.

## 3. Measurable Release Gates (Phase 2)

All gates are mandatory for Phase 2 release.

### 3.1 Functional Gates

1. Trader login/logout flow works on supported browsers.
2. Place-order UX criteria pass (`AC-UI-POST-001` to `AC-UI-POST-106`).
3. Order lookup/detail UX criteria pass (`AC-UI-GET-001` to `AC-UI-GET-004`).
4. Ops audit UX criteria pass (`AC-UI-OPS-001` to `AC-UI-OPS-004`).
5. Idempotency replay and conflict UX states are validated end-to-end.

### 3.2 Quality Gates

1. Frontend lint, tests, and production build pass in CI.
2. Frontend line coverage threshold >= 80% (or stricter agreed threshold).
3. No critical/high-severity open defects in Phase 2 committed scope.
4. Contract drift checks pass for frontend API types/adapters vs OpenAPI.

### 3.3 Performance and Reliability Gates

1. p75 FCP <= 1.8s for desktop baseline routes.
2. p75 FCP <= 2.5s for mobile baseline routes.
3. p95 action-to-feedback latency <= 150ms for critical submit/search actions.
4. Frontend unhandled runtime exception rate <= 0.1% of sessions in validation window.

### 3.4 Security Gates

1. OIDC login/session flow is validated against Keycloak in target environments.
2. Protected API requests require bearer token attachment.
3. Route and API access control enforce role boundaries (`TRADER` vs `OPS`).
4. Auth outcome checks pass:
   - unauthenticated -> login or `401` handling
   - unauthorized role -> `403` handling/unauthorized UX
5. No tokens or credentials are exposed in logs, toasts, or client telemetry.

### 3.5 Accessibility Gates

1. Key routes (`Login`, `Place Order`, `Order Detail`, `Ops Audit`) meet WCAG 2.2 AA baseline.
2. Keyboard-only interaction works for critical user journeys.
3. Automated accessibility scan reports zero critical violations on key routes.

### 3.6 Manual QA and UAT Gates

1. Manual QA scenarios in Phase J (`F196` to `F220`) are executed with evidence.
2. Each failed case has defect tracking link and triage decision.
3. UAT sign-off is recorded, or explicit approved risk exceptions are documented.

### 3.7 Documentation and Operational Readiness Gates

1. `docs/PHASE2_PRD.md` is current with implemented behavior.
2. `docs/OEMS_PHASE2_TASKS_BOARD.md` accurately reflects completion state.
3. Phase 2 release checklist and user/ops runbook docs are updated.
4. Rollout and rollback steps for frontend deployment are documented and reviewed.

## 4. Verification Evidence Required

For each release candidate, collect and store:

1. CI link/artifacts proving frontend lint + test + build success.
2. Performance report for key frontend routes and interaction latency.
3. Security/auth verification evidence (`401`, `403`, role gating, token handling).
4. Accessibility report for critical screens.
5. Manual QA execution record with screenshots/videos and trace ids.
6. UAT sign-off note with blocker/risk summary.

## 5. Completion Decision Rule

Phase 2 frontend is considered complete only when:

1. All measurable gates in Section 3 pass.
2. Required evidence in Section 4 is available and reviewable.
3. Product + Engineering + QA + Ops sign off release readiness.

