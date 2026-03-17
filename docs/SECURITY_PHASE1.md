# OEMS Phase 1 Security Guide

Last updated: 2026-03-17

## 1. Identity Provider and Realm

1. Local identity provider: Keycloak `26.5.x`.
2. Realm: `oems`.
3. Realm import source: `ops/keycloak/oems-realm-export.json`.
4. Compose startup imports the realm automatically via `--import-realm`.

## 2. Realm Roles and Test Users

1. Realm roles:
   - `TRADER`
   - `OPS`
2. Local test users:
   - `trader1` / `trader1pass` -> role `TRADER`
   - `ops1` / `ops1pass` -> role `OPS`

## 3. Client Configuration

1. Client id: `oems-api`.
2. Protocol: OpenID Connect.
3. Direct access grants enabled for local smoke tests.
4. Redirect URIs:
   - `http://localhost:3000/*`
   - `http://localhost:5173/*`
   - `http://localhost:8080/*`
5. Web origins:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://localhost:8080`

## 4. API Security Model

1. OEMS API is configured as a JWT resource server.
2. Token validation checks:
   - issuer (`iss`) against configured Keycloak realm issuer
   - signature via Keycloak JWKS endpoint
   - audience includes `oems-api`
3. Role mapping:
   - claim source: `realm_access.roles`
   - mapped to Spring authorities with `ROLE_` prefix
4. Endpoint rules:
   - `POST /v1/orders` -> `ROLE_TRADER`
   - `GET /v1/orders/**` -> `ROLE_TRADER`
   - `GET /v1/instruments/**` -> authenticated
   - `/actuator/**` -> `ROLE_OPS` (except `/actuator/health` and `/actuator/info`)

## 5. Trader Identity Claim Mapping

`traderId` resolution order in application code:

1. `preferred_username`
2. `sub`

The resolver is implemented in `TraderIdExtractor` and used by order endpoints.

## 6. Standardized Auth Error Responses

1. `401` returns `ApiError` with:
   - `code=UNAUTHORIZED`
   - `message=Missing or invalid bearer token.`
2. `403` returns `ApiError` with:
   - `code=FORBIDDEN`
   - `message=Insufficient permissions for this operation.`
3. Both include `traceId` and canonical fields from shared `ApiError`.

## 7. Local Mock Auth Profile

For faster local API iteration without Keycloak:

1. Enable profile set: `local,mock-auth`.
2. Start app with script:
   - `./scripts/run-oems-api.ps1 -MockAuth`
3. Behavior:
   - Keycloak JWT validation is bypassed.
   - A mock JWT authentication is injected per request.
   - Default identity: `trader1` with role `TRADER`.
4. Override identity per request:
   - `X-Mock-User: myTraderId`
   - `X-Mock-Roles: TRADER` or `OPS`

This mode is for local development only.

## 8. Verification

1. Unit/integration verification:
   - `./mvnw.cmd test`
2. End-to-end security smoke:
   - `./scripts/security-smoke.ps1`
   - `./scripts/security-smoke.ps1 -StartApi` (starts/stops local API automatically; requires infra already up)
