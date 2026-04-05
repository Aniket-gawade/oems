# OEMS Phase 1 Release Checklist

Use this checklist for each Phase 1 release candidate.

## 1. Build and Package

- [ ] `mvnw clean verify` passes on CI.
- [ ] CI stages `compile`, `unit-tests`, `integration-tests`, `package`, and `dependency-vulnerability-scan` are green.
- [ ] `oems-api` artifact is published and traceable to commit SHA.
- [ ] Container image is built from root `Dockerfile` and tagged with immutable version.

## 2. Test and Quality

- [ ] Unit tests pass.
- [ ] Integration tests pass (including idempotency and risk flows).
- [ ] OpenAPI contract tests pass.
- [ ] Architecture boundary tests pass.
- [ ] Coverage threshold gate passes.
- [ ] Checkstyle and PMD checks pass.
- [ ] Vulnerability scan report is reviewed and archived.

## 3. Deploy and Migrate

- [ ] Staging `.env` is prepared from `ops/staging/.env.staging.example`.
- [ ] Deployment command executed: `./scripts/deploy-staging.ps1`.
- [ ] Migration step (`oems-migrate`) completes successfully.
- [ ] API container starts only after migration success.
- [ ] Deployment metadata (version, timestamp, operator) is recorded.

## 4. Smoke Validation

- [ ] `GET /actuator/health` returns `UP`.
- [ ] `POST /v1/orders` happy path returns `201`.
- [ ] Risk rejection path returns expected `422` code.
- [ ] Idempotency replay path returns deterministic original response.
- [ ] `GET /v1/orders/{id}` ownership checks are enforced.
- [ ] Ops audit endpoint authorization (`ROLE_OPS`) is enforced.

## 5. Monitoring and Alerts

- [ ] Prometheus scrape is healthy for the deployed API.
- [ ] Dashboard panels populate for latency, accepts/rejects, and idempotency counters.
- [ ] Latency and rejection alerts are loaded and active.
- [ ] Post-deploy logs include `traceId` and `traderId` correlation.

## 6. Sign-off

- [ ] Engineering lead sign-off.
- [ ] QA/UAT sign-off.
- [ ] Ops sign-off.
- [ ] Release notes and rollback/roll-forward plan linked.
