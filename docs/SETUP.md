# OEMS Local Setup

Last updated: 2026-03-17

## 1. Prerequisites

1. JDK 25:
   - `java -version`
2. Maven 3.9+:
   - `mvn -version`
3. Docker Desktop (with engine running):
   - `docker version`

If Docker CLI is installed but engine is not running, start Docker Desktop first.

## 2. Environment File

1. Copy `.env.example` to `.env`:
   - PowerShell: `Copy-Item .env.example .env`
2. Adjust values if needed (ports/passwords).

## 3. Start Local Infrastructure

Required services (MySQL, Redis, Keycloak):

```powershell
./scripts/dev-up.ps1
```

Optional observability stack (Prometheus + Grafana):

```powershell
./scripts/dev-up.ps1 -WithObservability
```

## 4. Verify Readiness

Required services healthcheck:

```powershell
./scripts/dev-healthcheck.ps1
```

With observability checks:

```powershell
./scripts/dev-healthcheck.ps1 -WithObservability
```

## 5. Useful URLs

1. MySQL: `localhost:${MYSQL_PORT}`
2. Redis: `localhost:${REDIS_PORT}`
3. Keycloak Admin Console: `http://localhost:${KEYCLOAK_PORT}/admin`
4. Keycloak Realm Well-Known Config: `http://localhost:${KEYCLOAK_PORT}/realms/oems/.well-known/openid-configuration`
5. Prometheus (optional): `http://localhost:${PROMETHEUS_PORT}`
6. Grafana (optional): `http://localhost:${GRAFANA_PORT}`

## 6. Keycloak Local Bootstrap Defaults

The compose setup imports `ops/keycloak/oems-realm-export.json` automatically.

Imported defaults:

1. Realm: `oems`
2. Client: `oems-api`
3. Roles: `TRADER`, `OPS`
4. Test users:
   - `trader1` / `trader1pass` (`TRADER`)
   - `ops1` / `ops1pass` (`OPS`)

If the realm was previously created with different values, reset Keycloak volume:

```powershell
./scripts/dev-down.ps1 -ResetVolumes
./scripts/dev-up.ps1
```

## 7. Stop Infrastructure

Stop containers:

```powershell
./scripts/dev-down.ps1
```

Stop and remove volumes (full local reset):

```powershell
./scripts/dev-down.ps1 -ResetVolumes
```

## 8. Security Smoke Check

Once infra is up and OEMS API is running locally on `http://localhost:8080`:

```powershell
./scripts/security-smoke.ps1
```

To let the smoke script start/stop the API automatically:

```powershell
./scripts/security-smoke.ps1 -StartApi
```

Note: `-StartApi` does not start MySQL/Redis/Keycloak. Run `./scripts/dev-up.ps1` first.

## 9. Troubleshooting

1. If `docker version` shows only client output, Docker engine is not ready yet.
2. If ports are already in use, change values in `.env` and restart containers.
3. If healthcheck fails for Keycloak, wait ~30-60s and rerun `dev-healthcheck.ps1`.
