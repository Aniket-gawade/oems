# Contributing Guide - Phase 1 OEMS

Last updated: 2026-03-03  
Applies to: all Phase 1 work in this repository

## 1. Purpose

This guide standardizes how Phase 1 changes are developed and reviewed so the team can move fast without losing consistency.

## 2. Pull Request Conventions

PR title format:

1. `[Txxx] <short summary>`

Example:

1. `[T010] Add Phase 1 contributing conventions`

PR description must include:

1. What changed
2. Why it changed
3. Linked task ID(s)
4. Testing performed
5. Any risks/known limitations

## 3. PR Checklist (Mandatory)

Copy this checklist into each PR and mark all applicable items.

1. [ ] Task ID(s) linked and scope matches task board.
2. [ ] Code changes are limited to task scope (no unrelated edits).
3. [ ] Unit tests added/updated for changed logic.
4. [ ] Integration tests added/updated where behavior or persistence changed.
5. [ ] `mvn clean verify` passes locally or in CI.
6. [ ] API contract/docs updated (if request/response/error behavior changed).
7. [ ] Flyway migration added (if schema changed).
8. [ ] No secrets or credentials added to repository.
9. [ ] Task board status updated if task is completed.

## 4. Review Expectations

Reviewer focus order:

1. Correctness against PRD/acceptance criteria
2. Security and idempotency implications
3. Data integrity and migration safety
4. Test quality and coverage impact
5. Observability and error consistency

Merge policy:

1. At least one approving review.
2. All required checks green.
3. No unresolved high-severity review comments.

## 5. Out of Scope for PRs

Avoid these in normal Phase 1 PRs:

1. Large mixed refactors unrelated to the task.
2. Architecture changes that conflict with accepted ADRs.
3. Breaking API behavior without PRD/ADR update.

## 6. Documentation Update Rule

If behavior changes, update docs in the same PR:

1. `docs/PHASE1_PRD.md` for requirements/acceptance changes
2. relevant `docs/adr/*.md` for architecture/security/data decisions
3. `docs/OEMS_PHASE1_TASKS_BOARD.md` task completion status
