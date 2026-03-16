# OEMS Phase 1 - DB Change Policy

Last updated: 2026-03-16

## Scope

This policy applies to all schema/data changes managed through Flyway in `apps/oems-api/src/main/resources/db/migration`.

## Strategy

1. Use roll-forward only for shared environments.
2. Never edit an already-applied migration file.
3. Add a new migration for every schema fix, data fix, index update, or constraint change.

## Migration Rules

1. Versioned migrations must be immutable after merge.
2. Ordering is strict (`V1`, `V2`, ...); keep each migration atomic and focused.
3. Backward-compatible, additive changes are preferred first (new nullable columns, new tables, new indexes).
4. Destructive changes (drop/rename/contract) require a two-step process:
   - deploy additive compatibility change,
   - migrate application usage,
   - remove old structure in a later migration.

## Rollback / Incident Handling

1. Primary response is roll-forward with a corrective migration.
2. If deployment must be reverted, revert application version first and keep DB schema forward-compatible.
3. Restore from backup only for severe data-corruption incidents and with explicit operator approval.

## Local Development

1. Use `scripts/db-reset-local.ps1` to reset local MySQL schema state.
2. Verify migrations by running tests (`./mvnw.cmd test`) and a fresh local boot.

## Review Checklist

1. Migration has a single clear purpose.
2. Constraints/indexes are included for expected query patterns and invariants.
3. Migration is validated on a fresh database.
4. Related docs and task board status are updated in the same change.
