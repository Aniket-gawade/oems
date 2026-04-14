# OEMS Frontend Container View (Phase 2)

Last updated: 2026-04-11  
Applies to: `apps/oems-web`

## 1. Purpose

This document defines the Phase 2 frontend container structure for shell, routing, role access, and reusable component primitives.

## 2. Top-Level Container

`oems-web` is a Vite + React SPA that runs as a browser client and consumes Phase 1 backend APIs through `/api` proxying in local runtime.

Primary responsibilities:

1. Render role-aware routes and app shell.
2. Enforce public/protected/role-gated route behavior.
3. Provide shared app services via top-level providers.
4. Expose reusable UI primitives and baseline state components.

## 3. Frontend Module Breakdown

| Module | Path | Responsibility |
| --- | --- | --- |
| App bootstrap | `src/main.tsx`, `src/App.tsx` | Starts React app and router provider |
| App providers | `src/app/providers/*` | Auth/session context, API client, query cache, notifications |
| Routing model | `src/app/routes/route-registry.tsx`, `src/app/routes/app-router.tsx` | Central route metadata + router object creation |
| Route guards | `src/app/routing/*` | Public guard, protected guard, role guard |
| App shell | `src/app/shell/app-shell.tsx` | Header, navigation, content region, user context |
| Reusable primitives | `src/components/primitives/*` | Button/Input/Select/NumberInput |
| Shared state components | `src/components/feedback/*` | Toasts, empty/error state, skeleton, status badge, loading overlay, page error boundary |
| Shared data rendering | `src/components/data/*` | Table/list primitive with loading and empty variants |
| Screen pages | `src/pages/*` | Route-level screens and placeholders for Phase D+ feature work |

## 4. Runtime Dependencies

| Dependency | Usage |
| --- | --- |
| `react-router-dom` | Route tree, navigation, redirects, route metadata handles |
| `@tanstack/react-query` | Query cache container for upcoming API hooks |
| Browser `fetch` | API client provider transport |
| Notification provider | Cross-screen severity toasts |

## 5. Access-Control Flow

1. Public routes (`/login`, `/auth/callback`, `*`) render without session requirement.
2. Protected shell routes require authenticated session (`ProtectedRoute`).
3. Role-restricted routes are enforced by `RoleGuard` using `TRADER`/`OPS` route metadata.
4. Unauthorized role access redirects to `/unauthorized`.
5. Missing session redirects to `/login` with return path context.

## 6. UI Foundation Capabilities (Phase C)

1. Tokenized global stylesheet (`src/styles.css`) aligned to `docs/PHASE2_DESIGN_TOKENS.md`.
2. Responsive shell behavior for mobile/tablet/desktop breakpoints.
3. Reusable state primitives for loading/empty/error/status flows.
4. Component docs route (`/component-docs`) as interactive reference baseline.
5. Automated baseline checks:
   - visual snapshots (`e2e/visual-baseline.spec.ts`)
   - accessibility critical checks (`e2e/a11y.spec.ts`)
   - keyboard navigation baseline (`e2e/keyboard.spec.ts`)

## 7. Out-of-Scope for This Container Doc

1. Full OIDC integration and token renewal details (covered in Phase D).
2. Typed API contract adapters and error mapping details (covered in Phase E).
3. Feature-specific trader/ops business workflows (covered in Phases F-H).
