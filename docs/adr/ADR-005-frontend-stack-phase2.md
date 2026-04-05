# ADR-005: Frontend Stack Selection for Phase 2

Date: 2026-04-05  
Status: Accepted  
Owners: Product + Engineering + QA

## Context

Phase 2 introduces a browser-based frontend over the Phase 1 backend APIs. The stack must support:

1. Fast local setup and predictable builds.
2. Type-safe API integration against OpenAPI contracts.
3. UI unit testing and browser end-to-end testing.
4. Low operational overhead for CI and containerized runtime.

## Decision

Adopt the following baseline frontend stack for Phase 2:

1. `Vite + React + TypeScript` for application framework and build tooling.
2. `TypeScript strict mode` with path aliasing (`@/*`) for maintainability.
3. `ESLint + Prettier` for code quality and formatting consistency.
4. `Vitest + Testing Library` for unit/component tests.
5. `Playwright` for browser E2E smoke/regression coverage.
6. `Docker multi-stage build`:
   - dev stage for local containerized UI.
   - prod stage for static asset serving via Nginx.

## Rationale

1. Vite offers fast startup/HMR and simple proxy configuration for backend integration.
2. React + TypeScript aligns with team skills and supports incremental architecture growth.
3. Vitest integrates natively with Vite and keeps test setup lightweight.
4. Playwright provides stable, headless browser automation for CI and manual QA support.
5. A multi-stage Dockerfile supports both local development and production-style packaging.

## Alternatives Considered

### Alternative A: Next.js (SSR-first)

Pros:

1. Built-in routing and full-stack primitives.

Cons:

1. Adds SSR/runtime complexity not required for Phase 2 scope.
2. Slower initial setup for API-only frontend integration.

Decision: Rejected for Phase 2 baseline.

### Alternative B: Angular

Pros:

1. Strong conventions and built-in structure.

Cons:

1. Higher framework overhead for current scope.
2. Larger migration/learning effort for current team workflow.

Decision: Rejected.

### Alternative C: Plain React + Webpack

Pros:

1. Maximum configurability.

Cons:

1. Higher maintenance and slower iteration compared with Vite defaults.

Decision: Rejected.

## Consequences

### Positive

1. Faster developer feedback loop for UI work.
2. Stronger reliability via lint + unit + E2E baseline.
3. Clear upgrade path for route/data/auth layers in later phases.

### Negative

1. Additional Node toolchain requirements in a Maven-centric repo.
2. More CI stages to maintain.
3. Playwright browser binaries increase initial setup time.

### Mitigations

1. Document exact setup in `docs/SETUP_PHASE2_FRONTEND.md`.
2. Add dedicated scripts for run/healthcheck and hook installation.
3. Keep frontend module isolated under `apps/oems-web`.

## Implementation Impact

1. New module scaffold: `apps/oems-web`.
2. New frontend docs:
   - `docs/PHASE2_PRD.md`
   - `docs/DEFINITION_OF_DONE_PHASE2.md`
   - `docs/SETUP_PHASE2_FRONTEND.md`
3. CI additions for frontend lint/test/build and dependency scan.
4. Optional local compose profile for web service.

