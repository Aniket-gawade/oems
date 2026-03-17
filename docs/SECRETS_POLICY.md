# OEMS Secrets Policy

Last updated: 2026-03-17

## Rules

1. Never commit real credentials, private keys, or production secrets to git.
2. Keep committed credentials limited to local-only demo/test values (for example `.env.example`, local Keycloak test users).
3. Use `.env` (gitignored) for machine-specific secrets and overrides.
4. Rotate any credential immediately if accidentally exposed.
5. Treat exported realm files containing non-local credentials as sensitive and keep them out of the repository.

## Enforced by Repository

1. `.gitignore` excludes:
   - `.env`
   - `.env.local`
   - `.env.*.local`
2. Committed environment template is `.env.example` only.

## Practical Guidance

1. Copy `.env.example` to `.env` and set values locally.
2. For Keycloak local realm bootstrap, use only disposable local accounts.
3. Do not place API keys/tokens in scripts or docs.
