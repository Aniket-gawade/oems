# OEMS Phase 2 Manual QA Checklist

Last updated: 2026-04-18  
Scope in this revision: Phase D auth/session regression

## 1. Auth Regression Checklist (F079)

| Test Case ID | Scenario | Preconditions | Steps | Expected Result | Pass/Fail Criteria |
| --- | --- | --- | --- | --- | --- |
| QA-AUTH-001 | Trader OIDC login callback | Keycloak up, `trader1` user active | Open `/login` -> sign in with Keycloak -> login as `trader1` | Redirects to `/trader` and Trader Dashboard is visible | `PASS` if dashboard and trader role context render without callback error |
| QA-AUTH-002 | Ops OIDC login callback | Keycloak up, `ops1` user active | Open `/login` -> sign in with Keycloak -> login as `ops1` | Redirects to `/ops` and Ops Dashboard is visible | `PASS` if dashboard and ops role context render without callback error |
| QA-AUTH-003 | OIDC logout flow | Active OIDC session | Click `Sign out (OIDC)` | Browser completes OIDC logout and returns to `/login` | `PASS` if user is returned to login and protected routes require auth again |
| QA-AUTH-004 | Mock trader login/logout | `VITE_ENABLE_MOCK_AUTH=true`, local app env | Select `TRADER` and sign in via local form, then sign out | Trader dashboard renders, then login page renders after sign out | `PASS` if both transitions succeed without runtime error |
| QA-AUTH-005 | Mock ops login | `VITE_ENABLE_MOCK_AUTH=true`, local app env | Select `OPS` and sign in via local form | Ops dashboard renders and nav shows ops options | `PASS` if ops route/nav is role-correct |
| QA-AUTH-006 | Mock auth safety guard | `VITE_APP_ENV=staging`, `VITE_ENABLE_MOCK_AUTH=true` | Launch app and inspect login mode | Local mock form is not shown; OIDC sign-in button is shown | `PASS` if mock mode is blocked outside local/dev/test |
| QA-AUTH-007 | Callback route handling | OIDC flow in progress | Complete Keycloak login redirect to `/auth/callback` | Callback finalizes once and navigates to role landing | `PASS` if no callback race error and no stuck callback page |
| QA-AUTH-008 | Unavailable IdP fallback UX | Stop Keycloak, OIDC mode enabled | Click Keycloak sign-in button from login page | User sees actionable guidance that auth server is unavailable | `PASS` if failure is user-readable and app remains stable |

## 2. Local Auth Regression Execution Record (F080)

Execution date: 2026-04-18  
Environment: Windows local workstation, `apps/oems-web`, Playwright Chromium, local Keycloak at `http://localhost:8081`

Evidence commands:

```powershell
npm --prefix apps/oems-web run lint
npm --prefix apps/oems-web run test:run
npm --prefix apps/oems-web run build
npm --prefix apps/oems-web run e2e:auth -- --project=chromium
$env:VITE_ENABLE_MOCK_AUTH='false'
npm --prefix apps/oems-web run e2e:oidc-local -- --project=chromium
$env:VITE_APP_ENV='staging'
$env:VITE_ENABLE_MOCK_AUTH='false'
npm --prefix apps/oems-web run e2e:oidc-local -- --project=chromium
```

Recorded outcomes:

| Test Case ID | Result | Evidence |
| --- | --- | --- |
| QA-AUTH-001 | PASS | `e2e/oidc-local.spec.ts` run (`VITE_ENABLE_MOCK_AUTH=false`) |
| QA-AUTH-002 | PASS | `e2e/oidc-local.spec.ts` run (`VITE_ENABLE_MOCK_AUTH=false`) |
| QA-AUTH-003 | PASS | `e2e/oidc-local.spec.ts` logout assertion to `/login` |
| QA-AUTH-004 | PASS | `e2e/auth-smoke.spec.ts` trader flow |
| QA-AUTH-005 | PASS | `e2e/auth-smoke.spec.ts` ops flow |
| QA-AUTH-006 | PASS | staging-profile OIDC run (`VITE_APP_ENV=staging`) with mock mode disabled by guard |
| QA-AUTH-007 | PASS | OIDC callback smoke pass after idempotent callback handling fix |
| QA-AUTH-008 | PASS | login page contains unavailable-auth fallback messaging (`AUTH_SERVER_UNAVAILABLE`) and retry action |
