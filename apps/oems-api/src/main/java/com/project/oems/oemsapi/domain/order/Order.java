package com.project.oems.oemsapi.domain.order;

import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record Order(
        UUID id,
        String clientOrderId,
        String traderId,
        String symbol,
        Side side,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        BigDecimal notional,
        OrderStatus status,
        String rejectionReason,
        Instant createdAt,
        Instant updatedAt,
        int version
) {

    public Order {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(clientOrderId, "clientOrderId must not be null");
        Objects.requireNonNull(traderId, "traderId must not be null");
        Objects.requireNonNull(symbol, "symbol must not be null");
        Objects.requireNonNull(side, "side must not be null");
        Objects.requireNonNull(orderType, "orderType must not be null");
        Objects.requireNonNull(quantity, "quantity must not be null");
        Objects.requireNonNull(notional, "notional must not be null");
        Objects.requireNonNull(status, "status must not be null");
        Objects.requireNonNull(createdAt, "createdAt must not be null");
        Objects.requireNonNull(updatedAt, "updatedAt must not be null");
    }
}
