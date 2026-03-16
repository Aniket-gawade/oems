# OEMS Phase 1 - Contract Versioning Policy

Last updated: 2026-03-16

## Scope

This policy applies to shared contracts in:

1. `shared/contracts`
2. `shared/common` public API surfaces used by service modules
3. Public HTTP contracts in `docs/api/openapi-phase1.yaml`

## Versioning Principles

1. Backward compatibility is the default.
2. Additive changes are preferred over breaking changes.
3. Breaking changes require an explicit version bump and migration notes.

## Change Types

### Backward-compatible changes

1. Adding a new optional response field.
2. Adding a new error detail field.
3. Adding new classes/utilities without changing existing signatures.

### Potentially breaking changes

1. Removing or renaming enum constants.
2. Changing field type or semantic meaning.
3. Tightening validation in a way that rejects previously valid requests.

## Enum Evolution Rules

1. Existing enum constants must not be renamed or removed in Phase 1 minor updates.
2. New enum constants must be additive and documented.
3. Consumers must be coded defensively for unknown enum values where applicable.

## Release/Review Checklist

1. OpenAPI examples and schemas reflect contract changes.
2. Shared-module tests pass from root (`./mvnw.cmd clean verify`).
3. Migration notes are added when behavior can affect API clients.
