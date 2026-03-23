package com.project.oems.oemsapi.api.order;

import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PlaceOrderResponse(
        UUID orderId,
        OrderStatus status,
        String symbol,
        Side side,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        Instant createdAt
) {
}
