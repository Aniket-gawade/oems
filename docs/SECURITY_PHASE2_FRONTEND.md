# OEMS Phase 2 Frontend Security and Auth Configuration

Last updated: 2026-04-18  
Applies to: `apps/oems-web` (Phase 2 frontend)

## 1. Authentication Modes

Frontend auth supports two modes:

1. `oidc` (default): Keycloak OIDC Authorization Code + PKCE flow.
2. `mock` (local QA/dev only): local in-browser mock session for fast UX testing.

Runtime selection:

1. `VITE_ENABLE_MOCK_AUTH=true` requests mock mode.
2. Mock mode is allowed only when both are true:
   - build is non-production
   - `VITE_APP_ENV` is one of `local`, `dev`, `development`, `test`
3. If requested outside allowed environments, mock mode is blocked and OIDC mode is used.

## 2. Required Environment Variables

Key auth variables (see `apps/oems-web/.env.example`):

1. `VITE_OIDC_ISSUER` (for example `http://localhost:8081/realms/oems`)
2. `VITE_OIDC_CLIENT_ID` (for example `oems-api`)
3. `VITE_OIDC_REDIRECT_URI` (for example `http://localhost:5173/auth/callback`)
4. `VITE_OIDC_SILENT_REDIRECT_URI` (for example `http://localhost:5173/auth/silent-callback`)
5. `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` (for example `http://localhost:5173/login`)
6. `VITE_OIDC_SCOPE` (default `openid profile email`)

Origin rule:

1. Auth callback/logout URIs must use the same web origin as the running frontend host.
2. For Playwright, auth URIs are injected from `playwright.config.ts` to keep origin parity and avoid state mismatch.

## 3. Session and Token Handling

1. Access token is held in frontend auth session state (`UserSession.accessToken`).
2. OIDC client state and user metadata are stored in `sessionStorage` through `oidc-client-ts` `WebStorageStateStore`.
3. Mock session uses `sessionStorage` key `oems-web-mock-session`.
4. `401` responses clear session and force clean re-auth UX.
5. `403` responses preserve session and show permission-denied UX.
6. Silent renew is enabled (`automaticSilentRenew=true`) with `/auth/silent-callback`.
7. Logout performs local cleanup and OIDC signout redirect with `id_token_hint`.

## 4. Route and Authorization UX

1. Public routes:
   - `/login`
   - `/auth/callback`
   - `/auth/silent-callback`
2. Protected routes use auth + role guard checks.
3. Role navigation visibility:
   - `TRADER`: trader routes + shared routes
   - `OPS`: ops routes + shared routes
4. Header displays signed-in identity and role chip.

## 5. Auth Failure Mapping

1. `AUTH_SERVER_UNAVAILABLE`: shown when Keycloak is unreachable.
2. `AUTH_REQUIRED`: shown when callback or claims resolution fails.
3. `SESSION_EXPIRED`: shown on token expiry or API `401`.
4. `SESSION_TERMINATED`: shown on forced/failed signout cleanup paths.

## 6. Telemetry (Non-PII)

Auth telemetry is emitted via `console.info` under `[oems-auth-telemetry]`:

1. `auth_login_initiated`
2. `auth_login_succeeded`
3. `auth_login_failed`
4. `auth_logout`
5. `auth_session_expired`
6. `auth_silent_renew_succeeded`
7. `auth_silent_renew_failed`

Payload excludes tokens and credentials.

## 7. CORS and Redirect Validation Record (F078)

Validation date: 2026-04-18

Executed checks:

```powershell
# Local profile (OIDC)
$env:VITE_ENABLE_MOCK_AUTH='false'
npm --prefix apps/oems-web run e2e:oidc-local -- --project=chromium

# Staging profile simulation (OIDC + mock guard active)
$env:VITE_APP_ENV='staging'
$env:VITE_ENABLE_MOCK_AUTH='false'
npm --prefix apps/oems-web run e2e:oidc-local -- --project=chromium
```

Observed result:

1. OIDC login callback succeeds for `trader1` and `ops1`.
2. Logout redirects complete to `/login`.
3. No browser callback/CORS errors observed during local and staging-profile runs.
