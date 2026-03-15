# OEMS Phase 1 API Error Codes

Last updated: 2026-03-15

## Canonical Error Catalog (Machine-Readable)

```yaml
errorCodes:
  - code: VALIDATION_ERROR
    category: VALIDATION
    httpStatus: 400
    retriable: false
    description: Request payload/header/path validation failed.
  - code: UNAUTHORIZED
    category: AUTH
    httpStatus: 401
    retriable: true
    description: Missing, expired, or invalid bearer token.
  - code: FORBIDDEN
    category: AUTH
    httpStatus: 403
    retriable: false
    description: Authenticated identity lacks required role/permission.
  - code: RESOURCE_NOT_FOUND
    category: QUERY
    httpStatus: 404
    retriable: false
    description: Requested order resource does not exist or is not visible.
  - code: INSTRUMENT_NOT_FOUND
    category: REFERENCE_DATA
    httpStatus: 404
    retriable: false
    description: Symbol does not exist in instrument master.
  - code: INSTRUMENT_NOT_TRADABLE
    category: REFERENCE_DATA
    httpStatus: 422
    retriable: false
    description: Instrument exists but is marked non-tradable.
  - code: RISK_MAX_QTY_EXCEEDED
    category: RISK
    httpStatus: 422
    retriable: false
    description: Quantity is above trader/symbol max quantity risk limit.
  - code: RISK_MAX_NOTIONAL_EXCEEDED
    category: RISK
    httpStatus: 422
    retriable: false
    description: Notional is above trader/symbol max notional risk limit.
  - code: RISK_PRICE_BAND_EXCEEDED
    category: RISK
    httpStatus: 422
    retriable: false
    description: Price violates configured price band limits.
  - code: IDEMPOTENCY_CONFLICT
    category: IDEMPOTENCY
    httpStatus: 409
    retriable: false
    description: Idempotency key was reused with a different payload hash.
  - code: INTERNAL_SERVER_ERROR
    category: SYSTEM
    httpStatus: 500
    retriable: true
    description: Unexpected server-side failure.
```

## Uniqueness Rule

1. Each `code` value is globally unique and immutable once released.
2. New codes must be appended, never repurposed.
3. Any status code change requires ADR + backward compatibility review.
