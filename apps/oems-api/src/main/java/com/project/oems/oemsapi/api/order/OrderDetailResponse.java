package com.project.oems.oemsapi.api.order;

import com.project.oems.contracts.order.OrderStatus;
import com.project.oems.contracts.order.OrderType;
import com.project.oems.contracts.order.Side;
import com.project.oems.oemsapi.domain.order.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderDetailResponse(
        UUID orderId,
        String traderId,
        OrderStatus status,
        String symbol,
        Side side,
        OrderType orderType,
        BigDecimal quantity,
        BigDecimal price,
        Instant createdAt,
        Instant updatedAt
) {

    public static OrderDetailResponse from(Order order) {
        return new OrderDetailResponse(
                order.id(),
                order.traderId(),
                order.status(),
                order.symbol(),
                order.side(),
                order.orderType(),
                order.quantity(),
                order.price(),
                order.createdAt(),
                order.updatedAt()
        );
    }
}
