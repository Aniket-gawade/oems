# OEMS Phase 1 - Shared Module Usage Guide

Last updated: 2026-03-16

## Purpose

`shared/contracts` and `shared/common` provide reusable types so modules avoid duplicating business semantics and error models.

## Module Responsibilities

1. `shared/contracts`
   - Cross-module enums and API/domain contracts.
   - Examples: `OrderType`, `Side`, `OrderStatus`, `RiskRejectCode`.
2. `shared/common`
   - Generic utilities and core primitives.
   - Examples: `ApiError`, `ErrorCode`, `CorrelationContext`, `Quantity`, `DecimalMath`.

## Usage Examples

### Using contract enums in API or domain code

```java
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;

OrderType orderType = OrderType.LIMIT;
Side side = Side.BUY;
```

### Using common value objects/utilities

```java
import com.project.oems.common.domain.Quantity;
import com.project.oems.common.math.DecimalMath;

Quantity quantity = Quantity.of("25");
var notional = DecimalMath.multiply(quantity.asBigDecimal(), new BigDecimal("182.50"));
```

### Using standardized API error model

```java
import com.project.oems.common.error.ApiError;
import com.project.oems.common.error.ErrorCode;

ApiError error = new ApiError(
    ErrorCode.VALIDATION_ERROR,
    "Request validation failed.",
    400,
    "/v1/orders",
    Instant.now(),
    "trace-123",
    Map.of("field", "quantity")
);
```

## Guardrails

1. Shared modules must not include Spring runtime dependencies.
2. Shared contracts should stay stable and backward compatible.
3. Keep shared APIs small and framework-agnostic.
