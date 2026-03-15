# OEMS

Order Execution and Management System (OEMS) monorepo for Phase 1.

Last updated: 2026-03-15

## Current Status

1. Phases A through D are completed.
2. Root Maven build is green (`mvnw clean verify`).
3. Active app module: `apps/oems-api` (Spring Boot, Java 25).

## Repository Layout

1. `apps/oems-api` - Phase 1 deployable API app.
2. `shared/common` - Shared utilities and common types.
3. `shared/contracts` - Shared contracts/enums.
4. `docs` - PRD, architecture, setup guide, and task board.
5. `scripts` - Build/test/run and local infra automation scripts.
6. `docker-compose.yml` - Local infrastructure (MySQL, Redis, Keycloak, optional Prometheus/Grafana).

## Prerequisites

1. JDK 25
   - `java -version`
2. Maven 3.9+
   - `mvn -version`
3. Docker Desktop
   - `docker version`

## Local Infrastructure Quick Start

1. Create local env file:

```powershell
Copy-Item .env.example .env
```

2. Start required services (MySQL, Redis, Keycloak):

```powershell
./scripts/dev-up.ps1
```

3. Optional: start observability stack (Prometheus + Grafana):

```powershell
./scripts/dev-up.ps1 -WithObservability
```

4. Run readiness checks:

```powershell
./scripts/dev-healthcheck.ps1
./scripts/dev-healthcheck.ps1 -WithObservability
```

5. Stop services:

```powershell
./scripts/dev-down.ps1
./scripts/dev-down.ps1 -ResetVolumes
```

Detailed setup: `docs/SETUP.md`.

## Build, Test, Run

Using wrapper directly:

```powershell
./mvnw.cmd clean verify
./mvnw.cmd test
./mvnw.cmd -pl apps/oems-api -am spring-boot:run -Dspring-boot.run.profiles=local
```

Using helper scripts:

```powershell
./scripts/build.ps1
./scripts/test.ps1
./scripts/run-oems-api.ps1
```

## Local Endpoints

When infrastructure is running:

1. Keycloak Admin: `http://localhost:8081/admin`
2. Prometheus (optional): `http://localhost:9090`
3. Grafana (optional): `http://localhost:3000`

## Planning and Documentation

1. Task board: `docs/OEMS_PHASE1_TASKS_BOARD.md`
2. Product requirements: `docs/PHASE1_PRD.md`
3. Setup guide: `docs/SETUP.md`
4. API cookbook: `docs/OEMS_PHASE1_COOKBOOK.md`
