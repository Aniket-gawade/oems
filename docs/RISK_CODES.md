# OEMS Phase 1 Risk Reject Codes

Last updated: 2026-03-23

## Catalog

| Code | Rule | Meaning | Operator Action |
| --- | --- | --- | --- |
| `RISK_MAX_QTY_EXCEEDED` | Max quantity | Requested quantity is above the configured risk limit for trader+symbol (or fallback/default). | Review trader quantity limits and intended order size. |
| `RISK_MAX_NOTIONAL_EXCEEDED` | Max notional | `effectivePrice * quantity` is above configured max notional. | Review notional limits and order pricing assumptions. |
| `RISK_PRICE_BAND_EXCEEDED` | Price band | LIMIT price is outside allowed band around derived reference price. | Validate incoming limit price and configured band percent. |

## Rule Evaluation Order (Fail-Fast)

1. `checkMaxQty`
2. `checkMaxNotional`
3. `checkPriceBand`

The first failing rule is returned and recorded as the rejection reason.

## Fallback Policy

When no risk profile is found for a trader:

1. Try exact rule: `trader_id + symbol`.
2. Try trader default rule: `trader_id + symbol IS NULL`.
3. If none exists, apply fallback defaults:
   - `maxQty = 1000.00000000`
   - `maxNotional = 100000.00000000`
   - `priceBandPct = 10.0000`

This keeps behavior explicit and deterministic in non-seeded or onboarding scenarios.

## Metrics and Audit

1. Counter `oems.risk.reject.total{rejectCode=...}` is incremented on each rejection.
2. A structured risk audit payload is persisted in `risk_audit_event.payload_json`.
3. Persisted payload includes evaluated inputs, resolved limits, limit source, outcome, and reject code/message.
