# OEMS Phase 1 Domain Glossary

Last updated: 2026-03-15

## Terms

| Term | Definition |
| --- | --- |
| OEMS | Order and Execution Management System (Phase 1 scope covers order intake, validation, risk checks, and order query). |
| Trader | Authenticated user allowed to place and query own orders (`TRADER` role). |
| Ops | Operational user with platform-monitoring permissions (`OPS` role). |
| Instrument | Tradable security record identified by a `symbol`. |
| Symbol | Canonical instrument identifier used in APIs (for example `AAPL`). |
| Side | Direction of order: `BUY` or `SELL`. |
| Order Type | Execution intent: `MARKET` (no limit price) or `LIMIT` (explicit limit price). |
| Quantity | Positive numeric order size submitted by trader. |
| Price | Unit price for a `LIMIT` order. Optional/omitted for `MARKET` order in Phase 1. |
| Notional | Monetary value of order (`quantity * price` or policy-defined equivalent for market orders). |
| Order Status | Persisted lifecycle state in Phase 1: `NEW` or `REJECTED`. |
| Order Book | Primary persistence record for accepted/rejected order decisions. |
| Order Event | Immutable audit event representing order lifecycle transitions (for example `ORDER_RECEIVED`, `ORDER_ACCEPTED`, `ORDER_REJECTED`). |
| Idempotency Key | Client-provided header value used to prevent duplicate order creation on retries. |
| Request Hash | Canonical payload fingerprint stored with idempotency key to detect key reuse with different payloads. |
| Risk Check | Pre-trade validation against configured limits (max quantity, max notional, price band). |
| Price Band | Allowed percentage range around a reference price for limit order validation. |
| Trace ID | Request correlation identifier propagated in logs and API error payloads (`traceId`). |
| ApiError | Canonical error response object with `code`, `message`, `status`, `path`, `timestamp`, and `traceId`. |
| Rejection Code | Machine-readable reason for rejection/error (for example `RISK_MAX_QTY_EXCEEDED`). |
| Tradable Flag | Instrument attribute indicating whether orders are currently allowed for that symbol. |
