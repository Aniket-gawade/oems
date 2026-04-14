# OEMS Phase 2 Frontend Setup

Last updated: 2026-04-05
Applies to: `apps/oems-web`

## 1. Prerequisites

1. Node.js 20+ (recommended for CI parity and Playwright support)
2. npm 10+ (or npm version bundled with Node 20)
3. Backend API running locally at `http://localhost:8080` (for integrated testing)
4. Keycloak running at `http://localhost:8081` (for auth integration when enabled)

## 2. Frontend Environment

Create local frontend env file:

```powershell
Copy-Item apps/oems-web/.env.example apps/oems-web/.env
```

Key variables:

1. `WEB_PORT` (default `5173`)
2. `VITE_PROXY_TARGET` (default `http://localhost:8080`)
3. OIDC settings (`VITE_OIDC_*`)
4. `VITE_ENABLE_MOCK_AUTH` (`true` for local shell/routing tests, `false` for OIDC-only behavior)

## 3. Install and Run (Local)

Install dependencies:

```powershell
cd apps/oems-web
npm ci
```

Run dev server directly:

```powershell
npm run dev
```

Or run via helper script from repo root:

```powershell
./scripts/run-oems-web.ps1
./scripts/run-oems-web.ps1 -Port 5173 -ApiProxyTarget http://localhost:8080
```

Health check:

```powershell
./scripts/web-healthcheck.ps1
./scripts/web-healthcheck.ps1 -Port 5173 -TimeoutSeconds 45
```

## 4. Quality Commands

From `apps/oems-web`:

```powershell
npm run lint
npm run format:check
npm run test:run
npm run build
```

Install Playwright browser binaries (first time only):

```powershell
npm run e2e:install
```

Run E2E smoke tests:

```powershell
npm run e2e
```

Run Phase C foundation checks:

```powershell
npm run e2e:visual
npm run e2e:a11y
npm run e2e:keyboard
```

## 5. Optional Docker Compose Web Service

Start optional frontend service with compose profile:

```powershell
docker compose --profile web up -d oems-web
```

Notes:

1. Service uses `apps/oems-web` Docker build `dev` target.
2. Default port mapping is `${WEB_PORT}:5173`.
3. Default proxy target inside compose network is `http://oems-api:8080`.

## 6. Git Hook Setup for Frontend Pre-Commit Checks

Install repository hooks path once:

```powershell
./scripts/install-git-hooks.ps1
```

Hook behavior:

1. Runs only when staged files include `apps/oems-web/*`.
2. Executes:
   - `npm --prefix apps/oems-web run lint`
   - `npm --prefix apps/oems-web run test:run`
3. Blocks commit when either command fails.

## 7. Clean Bootstrap Verification Record (F035)

Verification date: 2026-04-05  
Environment: local Windows shell in clean dependency state for `apps/oems-web`

Executed commands:

```powershell
cd apps/oems-web
npm ci
npm run lint
npm run test:run
npm run build
npm run e2e:install
npm run e2e
```

Observed outcome:

1. Install succeeded and generated lockfile.
2. Lint passed.
3. Unit tests passed.
4. Production build passed.
5. Playwright smoke test passed in headless Chromium.
