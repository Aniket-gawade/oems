# OEMS

Current repository snapshot for the Order Execution and Management System (OEMS).

## Current Repo State

1. `shared/common` contains source code and `pom.xml`.
2. `shared/contracts` contains source code and `pom.xml`.
3. `services/*` currently contains compiled artifacts under `target/` (jars/classes).
4. Service module source directories and service `pom.xml` files are not present in this snapshot.
5. Root parent `pom.xml` still references service modules.

## Current Structure

- `pom.xml` (root parent/aggregator)
- `shared/common`
- `shared/contracts`
- `services/api-gateway/target`
- `services/order-service/target`
- `services/risk-service/target`
- `services/execution-sim-service/target`
- `services/portfolio-service/target`
- `services/reference-data-service/target`
- `services/audit-reporting-service/target`
- `docs/JIRA_BACKLOG.md`
- `docs/PHASE1_PRD.md`
- `docs/OEMS_PHASE1_TASKS_BOARD.md`
- `docs/OEMS_PHASE1_COOKBOOK.md`

## Build Status (Current Snapshot)

Running root build currently fails because service module POMs are missing:

```bash
./mvnw validate
```

Error summary:

- Child module `services/<service-name>/pom.xml` does not exist (for all service modules).

## Existing Artifacts

Prebuilt jars are available under each service's `target/` folder, for example:

- `services/order-service/target/order-service-0.0.1-SNAPSHOT.jar`
- `services/risk-service/target/risk-service-0.0.1-SNAPSHOT.jar`
- `services/execution-sim-service/target/execution-sim-service-0.0.1-SNAPSHOT.jar`

## Tracking

Project planning and execution tracking lives in:

- `docs/JIRA_BACKLOG.md`
