# OEMS Local Setup

Last updated: 2026-03-15

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
4. Prometheus (optional): `http://localhost:${PROMETHEUS_PORT}`
5. Grafana (optional): `http://localhost:${GRAFANA_PORT}`

## 6. Stop Infrastructure

Stop containers:

```powershell
./scripts/dev-down.ps1
```

Stop and remove volumes (full local reset):

```powershell
./scripts/dev-down.ps1 -ResetVolumes
```

## 7. Troubleshooting

1. If `docker version` shows only client output, Docker engine is not ready yet.
2. If ports are already in use, change values in `.env` and restart containers.
3. If healthcheck fails for Keycloak, wait ~30-60s and rerun `dev-healthcheck.ps1`.
