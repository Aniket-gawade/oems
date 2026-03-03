# ADR-003: Keycloak-Based Authentication and Authorization for Phase 1

Date: 2026-03-03  
Status: Accepted  
Owners: Product + Engineering

## Context

Phase 1 OEMS requires secured APIs with clear identity and role enforcement:

1. `POST /v1/orders` must allow only trader users.
2. `GET /v1/orders/{orderId}` must enforce trader ownership and role checks.
3. Ops-only endpoints must be restricted to operations users.
4. Services must return deterministic auth errors (`401` / `403`) with traceability.

Constraints:

1. We need a production-capable identity provider without building custom auth logic.
2. We need standard JWT validation in Spring Boot with low integration complexity.
3. We need role-based access control (RBAC) that maps to business personas (`TRADER`, `OPS`).

## Decision

Use **Keycloak** as the identity provider for Phase 1 with OAuth2/OIDC and JWT access tokens.

Token strategy:

1. Clients authenticate against Keycloak and obtain access token (JWT).
2. OEMS API acts as OAuth2 Resource Server and validates token signature via Keycloak JWKS.
3. Token issuer (`iss`) and audience/client binding are validated by configuration.
4. Trader identity is derived from a stable claim (`sub`) with optional display fields (`preferred_username`).
5. Access token lifetime target: short-lived (for example 10-15 minutes); refresh token handling remains client-side with Keycloak, not inside OEMS API.
6. API is stateless regarding auth sessions (no server-side session store required in Phase 1).

Role model:

1. `TRADER`
   - Allowed: place order, query own orders.
2. `OPS`
   - Allowed: operational/audit endpoints and platform visibility functions.
3. Any missing/invalid role for an endpoint returns `403 Forbidden`.

## Rationale

1. Keycloak is open-source, standard-compliant, and integrates well with Spring Security.
2. JWT resource-server model keeps API stateless and scalable for Phase 1.
3. Role mapping is explicit and aligns with product personas in PRD.
4. Centralized identity management avoids duplicating auth logic in application code.

## Alternatives Considered

### Alternative A: Build custom authentication service

Pros:

1. Full control over auth flows and token format.

Cons:

1. High security risk and implementation burden.
2. Delays core OEMS delivery.

Decision: Rejected for Phase 1.

### Alternative B: Session/cookie-based auth in app

Pros:

1. Simple for browser-centric applications.

Cons:

1. Not ideal for API-first architecture and service-to-service evolution.
2. Adds session management complexity.

Decision: Rejected for Phase 1 API model.

### Alternative C: External SaaS IdP (Auth0/Okta/etc.) for Phase 1

Pros:

1. Reduced identity infrastructure management.

Cons:

1. Dependency on external licensing/vendor setup.
2. Less aligned with current local/dev setup and repository direction.

Decision: Rejected for current scope. Can be revisited later.

## Consequences

### Positive consequences

1. Strong, standards-based auth with minimal custom code.
2. Clear RBAC boundaries tied to business roles.
3. Stateless API auth path with straightforward horizontal scaling.

### Negative consequences

1. Additional infra dependency (Keycloak availability and configuration).
2. Token claim mapping errors can break authorization if not tested thoroughly.

### Mitigations

1. Version and automate realm/client/role setup for reproducible environments.
2. Add integration tests for `401`, `403`, and valid-role success paths.
3. Document claims-to-principal mapping and keep it stable.

## Implementation Impact

1. Configure Spring Security resource-server (`issuer-uri`, JWKS, audience checks).
2. Map JWT roles to authorities with `ROLE_` prefix conventions.
3. Extract `traderId` from stable token claim and use it in order ownership logic.
4. Add auth error handlers returning standardized API error payload.

