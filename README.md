# OEMS Monorepo Layout

## Modules
- `shared/common`: cross-service common primitives (error model, correlation context)
- `shared/contracts`: shared enums/contracts
- `services/api-gateway`
- `services/order-service`
- `services/risk-service`
- `services/execution-sim-service`
- `services/portfolio-service`
- `services/reference-data-service`
- `services/audit-reporting-service`

## Package Skeleton (per service)
- `api`
- `application`
- `domain`
- `infrastructure`
- `config`
